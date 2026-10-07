"""Decision Simulator Engine.

Forecasts Net Profit, Blended ROAS, POAS, and stock runway days
for any proposed budget reallocation vector across Meta, Google, and Amazon.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from pydantic import BaseModel, Field

from decide.curves import global_response_registry, hill_saturation
from ingest.normalize import DEFAULT_PRODUCT_CATALOG


class BudgetSimulationForecast(BaseModel):
    """Forecasted financial outcomes for a candidate budget allocation vector."""

    total_proposed_spend: float
    forecasted_gross_revenue: float
    forecasted_net_revenue: float
    forecasted_cogs: float
    forecasted_gross_margin: float
    forecasted_net_contribution_margin: float
    forecasted_blended_roas: float
    forecasted_poas: float
    forecasted_mer: float
    sku_runway_days: Dict[str, float]  # SKU -> days of inventory remaining
    channel_spend_splits: Dict[str, float]
    channel_revenue_splits: Dict[str, float]


class DecisionSimulator:
    """Simulates financial outcomes across channels for candidate budget allocations."""

    def __init__(self, catalog: Optional[Dict[str, Any]] = None):
        self.catalog = catalog or DEFAULT_PRODUCT_CATALOG
        self.registry = global_response_registry

    def forecast_budget_allocation(
        self,
        allocations: Dict[str, float],  # campaign_id or channel -> spend
        current_inventory: Dict[str, int],
        sku_channel_map: Optional[Dict[str, Tuple[str, str]]] = None,
    ) -> BudgetSimulationForecast:
        """Forecast outcomes for proposed spend vector."""
        total_spend = sum(allocations.values())
        tot_rev = 0.0
        tot_cogs = 0.0
        units_by_sku: Dict[str, int] = {sku: 0 for sku in current_inventory.keys()}
        ch_spends: Dict[str, float] = {}
        ch_revs: Dict[str, float] = {}

        # Default mapping if none passed: campaign -> (channel, sku)
        default_map = {
            "meta-hero": ("meta", "310805-137"),
            "meta-running": ("meta", "880848-005"),
            "google-search": ("google", "310805-137"),
            "google-pmax": ("google", "AH8050-100"),
            "amazon-sp": ("amazon", "310805-137"),
        }
        camp_map = sku_channel_map or default_map

        for camp, spend in allocations.items():
            ch, sku = camp_map.get(camp, ("meta", "310805-137"))
            params = self.registry.get_parameters(ch)
            rev = float(hill_saturation(spend, params.beta, params.eta, params.K))

            # Storefront constraints
            mapping = self.catalog.get(sku)
            price = mapping.retail_price if mapping else 150.0
            unit_cogs = mapping.unit_cogs if mapping else 50.0

            demanded_units = int(rev / price)
            on_hand = current_inventory.get(sku, 500)
            realized_units = min(demanded_units, on_hand)
            realized_rev = realized_units * price

            units_by_sku[sku] = units_by_sku.get(sku, 0) + realized_units
            tot_rev += realized_rev
            tot_cogs += realized_units * unit_cogs

            ch_spends[ch] = ch_spends.get(ch, 0.0) + spend
            ch_revs[ch] = ch_revs.get(ch, 0.0) + realized_rev

        gross_margin = max(0.0, tot_rev - tot_cogs)
        var_costs = tot_rev * 0.03
        ncm = tot_rev - tot_cogs - total_spend - var_costs

        blended_roas = round(tot_rev / total_spend, 2) if total_spend > 0 else 0.0
        poas = round(gross_margin / total_spend, 2) if total_spend > 0 else 0.0
        mer = round(tot_rev / total_spend, 2) if total_spend > 0 else 0.0

        # Calculate runway days = remaining_inventory / daily_demand
        runways: Dict[str, float] = {}
        for sku, inv in current_inventory.items():
            burn = units_by_sku.get(sku, 1)
            runways[sku] = round(inv / max(burn, 1), 1)

        return BudgetSimulationForecast(
            total_proposed_spend=round(total_spend, 2),
            forecasted_gross_revenue=round(tot_rev, 2),
            forecasted_net_revenue=round(tot_rev, 2),
            forecasted_cogs=round(tot_cogs, 2),
            forecasted_gross_margin=round(gross_margin, 2),
            forecasted_net_contribution_margin=round(ncm, 2),
            forecasted_blended_roas=blended_roas,
            forecasted_poas=poas,
            forecasted_mer=mer,
            sku_runway_days=runways,
            channel_spend_splits={k: round(v, 2) for k, v in ch_spends.items()},
            channel_revenue_splits={k: round(v, 2) for k, v in ch_revs.items()},
        )
