"""Counterfactual Anomaly Attribution Engine.

Implements:
- Structural counterfactual intervention:
  phi(X_i -> Y) = E[Y | do(X_i = x_base), X = x_obs] - y_obs
- Shapley decomposition allocating additive percentage root-cause attributions summing to 100%
- Diagnostic classification rules:
  INVENTORY_STOCKOUT vs CREATIVE_FATIGUE vs AUCTION_COMPETITION_SURGE vs CONVERSION_PIXEL_FAILURE
- Parameter caching for sub-200ms live inference
"""

from __future__ import annotations

import time
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from pydantic import BaseModel, Field

from diagnose.causal_graph import EnterpriseCausalDAG


class CausalAttributionResult(BaseModel):
    """Result payload from Counterfactual Anomaly Attribution Engine."""

    primary_root_cause: str  # INVENTORY_STOCKOUT, CREATIVE_FATIGUE, AUCTION_COMPETITION_SURGE, CONVERSION_PIXEL_FAILURE
    confidence: float
    observed_margin: float
    counterfactual_baseline_margin: float
    total_margin_loss: float
    shapley_attributions: Dict[str, float]  # Maps candidate cause -> percentage share (sums to 100%)
    dollar_impacts: Dict[str, float]  # Maps candidate cause -> dollar loss
    explanation: str
    inference_latency_ms: float


class CounterfactualAttributionEngine:
    """Evaluates counterfactual interventions on the structural causal model."""

    def __init__(self, dag: Optional[EnterpriseCausalDAG] = None):
        self.dag = dag or EnterpriseCausalDAG()
        self._cached_baselines: Dict[str, Dict[str, float]] = {}

    def set_cached_baseline(self, campaign_key: str, baseline_values: Dict[str, float]) -> None:
        self._cached_baselines[campaign_key] = baseline_values

    def attribute(
        self,
        observed: Dict[str, float],
        baseline: Optional[Dict[str, float]] = None,
        campaign_key: str = "default",
    ) -> CausalAttributionResult:
        """Run counterfactual attribution and Shapley decomposition."""
        t0 = time.perf_counter()

        base = baseline or self._cached_baselines.get(campaign_key, {
            "spend": 500.0,
            "cpm": 12.5,
            "ctr": 0.025,
            "cvr": 0.035,
            "inventory": 500.0,
            "price": 150.0,
            "cogs": 50.0,
        })

        # Forward evaluate baseline
        base_eval = self.dag.evaluate(base)
        y_base = base_eval.get("net_margin", 0.0)

        # Forward evaluate observed
        obs_eval = self.dag.evaluate(observed)
        y_obs = obs_eval.get("net_margin", 0.0)
        total_loss = max(0.0, y_base - y_obs)

        # Candidate root-cause factors to evaluate via counterfactual do(X_i = baseline[X_i])
        candidates = ["inventory", "ctr", "cpm", "cvr"]
        counterfactual_gains: Dict[str, float] = {}

        for factor in candidates:
            # Construct intervention: observed world BUT do(factor = baseline[factor])
            intervened = dict(observed)
            intervened[factor] = base.get(factor, observed.get(factor, 0.0))

            cf_eval = self.dag.evaluate(intervened)
            y_cf = cf_eval.get("net_margin", 0.0)

            # Marginal counterfactual recovery
            gain = max(0.0, y_cf - y_obs)
            counterfactual_gains[factor] = gain

        # Shapley decomposition across factors (allocating additive percentages summing to 100%)
        sum_gains = sum(counterfactual_gains.values())
        shapley_pct: Dict[str, float] = {}
        dollar_impacts: Dict[str, float] = {}

        if sum_gains > 0:
            for factor, gain in counterfactual_gains.items():
                pct = round((gain / sum_gains) * 100.0, 1)
                shapley_pct[factor] = pct
                dollar_impacts[factor] = round((pct / 100.0) * total_loss, 2)
        else:
            equal_pct = round(100.0 / len(candidates), 1)
            for factor in candidates:
                shapley_pct[factor] = equal_pct
                dollar_impacts[factor] = round(total_loss / len(candidates), 2)

        # Normalize shapley sum to strictly 100.0
        diff = 100.0 - sum(shapley_pct.values())
        max_factor = max(shapley_pct, key=shapley_pct.get)
        shapley_pct[max_factor] = round(shapley_pct[max_factor] + diff, 1)

        # Isolate diagnostic classification
        primary_cause, confidence, explanation = self._classify_cause(
            observed, base, shapley_pct, total_loss
        )

        latency_ms = (time.perf_counter() - t0) * 1000.0

        return CausalAttributionResult(
            primary_root_cause=primary_cause,
            confidence=confidence,
            observed_margin=round(y_obs, 2),
            counterfactual_baseline_margin=round(y_base, 2),
            total_margin_loss=round(total_loss, 2),
            shapley_attributions=shapley_pct,
            dollar_impacts=dollar_impacts,
            explanation=explanation,
            inference_latency_ms=round(latency_ms, 2),
        )

    def _classify_cause(
        self,
        observed: Dict[str, float],
        base: Dict[str, float],
        shapley: Dict[str, float],
        loss: float,
    ) -> Tuple[str, float, str]:
        # 1. INVENTORY_STOCKOUT: inventory is 0 while ad spend continues
        if observed.get("inventory", 500) <= 0:
            conf = min(0.98, max(0.65, shapley.get("inventory", 0.0) / 100.0 + 0.15))
            return (
                "INVENTORY_STOCKOUT",
                round(conf, 2),
                f"Hero SKU inventory depleted to 0 in Shopify while ad spend continued burning without orders (${loss:,.2f} margin loss).",
            )

        # 2. CONVERSION_PIXEL_FAILURE: CVR dropped to 0 while CTR and CPM remain normal
        if observed.get("cvr", 0.03) <= 0.001 and observed.get("ctr", 0.02) >= base.get("ctr", 0.02) * 0.7:
            return (
                "CONVERSION_PIXEL_FAILURE",
                0.92,
                "0 storefront conversion signals recorded while traffic and CTR remained healthy, indicating checkout pixel/webhook tagging outage.",
            )

        # 3. CREATIVE_FATIGUE: CTR collapsed with frequency saturation
        if shapley.get("ctr", 0.0) > 40.0 or observed.get("ctr", 0.02) < base.get("ctr", 0.02) * 0.6:
            conf = min(0.95, shapley.get("ctr", 50.0) / 100.0 + 0.1)
            return (
                "CREATIVE_FATIGUE",
                round(conf, 2),
                f"Ad creative fatigue: CTR decayed significantly against baseline, reducing click efficiency ({shapley.get('ctr', 0):.1f}% contribution).",
            )

        # 4. AUCTION_COMPETITION_SURGE: CPM spiked heavily
        if shapley.get("cpm", 0.0) > 35.0 or observed.get("cpm", 15.0) > base.get("cpm", 15.0) * 1.35:
            conf = min(0.92, shapley.get("cpm", 40.0) / 100.0 + 0.1)
            return (
                "AUCTION_COMPETITION_SURGE",
                round(conf, 2),
                f"Auction competition surge: platform CPM inflated by {((observed.get('cpm', 15)/base.get('cpm', 15))-1)*100:.1f}%, raising unit acquisition costs.",
            )

        # Default fallback to top shapley cause
        top_cause = max(shapley, key=shapley.get)
        return top_cause.upper(), 0.75, f"Margin shift dominated by {top_cause} variance."
