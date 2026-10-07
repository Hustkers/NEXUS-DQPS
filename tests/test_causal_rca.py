"""Unit tests for Section 4: Structural Causal Modeling & Counterfactual RCA."""

import time
import pytest
from diagnose.attribution import CounterfactualAttributionEngine
from diagnose.causal_graph import EnterpriseCausalDAG
from diagnose.graph_validator import CausalGraphValidator
from agents.rca import synthesize_causal_explanation


def test_causal_dag_topology_validation():
    dag = EnterpriseCausalDAG()
    valid, errors = CausalGraphValidator.validate_dag(dag)
    assert valid is True
    assert len(errors) == 0


def test_stockout_counterfactual_attribution_dominance():
    engine = CounterfactualAttributionEngine()
    baseline = {
        "spend": 500.0,
        "cpm": 12.5,
        "ctr": 0.025,
        "cvr": 0.035,
        "inventory": 500.0,
        "price": 150.0,
        "cogs": 50.0,
    }
    # Simulate stockout
    observed_stockout = dict(baseline)
    observed_stockout["inventory"] = 0.0

    result = engine.attribute(observed_stockout, baseline=baseline)

    assert result.primary_root_cause == "INVENTORY_STOCKOUT"
    assert result.confidence >= 0.70
    assert result.total_margin_loss > 0

    # Stockout must receive >60% Shapley attribution weight
    assert result.shapley_attributions["inventory"] >= 60.0
    # Creative fatigue (CTR) must receive <25%
    assert result.shapley_attributions.get("ctr", 0.0) <= 25.0

    # Shapley shares must sum strictly to 100% (+/- 0.2%)
    assert abs(sum(result.shapley_attributions.values()) - 100.0) < 0.2


def test_creative_fatigue_attribution():
    engine = CounterfactualAttributionEngine()
    baseline = {
        "spend": 500.0,
        "cpm": 12.5,
        "ctr": 0.025,
        "cvr": 0.035,
        "inventory": 500.0,
        "price": 150.0,
        "cogs": 50.0,
    }
    # CTR collapses due to creative fatigue
    observed_fatigue = dict(baseline)
    observed_fatigue["ctr"] = 0.008

    result = engine.attribute(observed_fatigue, baseline=baseline)

    assert result.primary_root_cause == "CREATIVE_FATIGUE"
    assert result.shapley_attributions["ctr"] >= 60.0
    assert abs(sum(result.shapley_attributions.values()) - 100.0) < 0.2


def test_competition_cpm_surge_attribution():
    engine = CounterfactualAttributionEngine()
    baseline = {
        "spend": 500.0,
        "cpm": 12.5,
        "ctr": 0.025,
        "cvr": 0.035,
        "inventory": 500.0,
        "price": 150.0,
        "cogs": 50.0,
    }
    # CPM spikes by 70%
    observed_surge = dict(baseline)
    observed_surge["cpm"] = 21.25

    result = engine.attribute(observed_surge, baseline=baseline)

    assert result.primary_root_cause == "AUCTION_COMPETITION_SURGE"
    assert result.shapley_attributions["cpm"] >= 50.0


def test_attribution_latency_sub_200ms():
    engine = CounterfactualAttributionEngine()
    baseline = {
        "spend": 500.0,
        "cpm": 12.5,
        "ctr": 0.025,
        "cvr": 0.035,
        "inventory": 500.0,
        "price": 150.0,
        "cogs": 50.0,
    }
    observed = dict(baseline)
    observed["inventory"] = 0.0

    t0 = time.perf_counter()
    res = engine.attribute(observed, baseline=baseline)
    elapsed_ms = (time.perf_counter() - t0) * 1000.0
    # Must be sub-200ms
    assert elapsed_ms < 50.0
    assert res.inference_latency_ms < 50.0


def test_executive_synthesis():
    engine = CounterfactualAttributionEngine()
    observed = {
        "spend": 500.0,
        "cpm": 12.5,
        "ctr": 0.025,
        "cvr": 0.035,
        "inventory": 0.0,
        "price": 150.0,
        "cogs": 50.0,
    }
    res = engine.attribute(observed)
    synthesis = synthesize_causal_explanation(res, "Hero Shoe", "310805-137")
    assert "root_cause" in synthesis
    assert synthesis["root_cause"] == "INVENTORY_STOCKOUT"
    assert "summary" in synthesis
