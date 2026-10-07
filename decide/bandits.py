"""Online Combinatorial Bandits with Knapsacks (CBwK) with Primal-Dual Shadow Pricing.

Implements:
- Multi-armed combinatorial bandit with knapsack budgets (liquidity & inventory)
- Primal-Dual updates maintaining shadow price vectors lambda_{j,t}
- Multiplicative weight update rule:
  lambda_{j, t+1} = lambda_{j, t} * (1 + epsilon * (c_{j, t} / C_j))
- Dynamic stockout penalty: as inventory approaches 0, lambda_{inventory} -> inf,
  automatically routing capital to high-margin, in-stock alternatives.
"""

from __future__ import annotations

import time
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from pydantic import BaseModel, Field


class BanditArm(BaseModel):
    """An allocation action arm representing a campaign investment choice."""

    arm_id: str
    campaign_id: str
    channel: str
    sku_id: str
    spend_level: float
    expected_revenue: float
    unit_margin: float
    inventory_consumed: int


class ShadowPriceState(BaseModel):
    """Primal-Dual shadow price vector."""

    liquidity_shadow_price: float = 1.0
    inventory_shadow_prices: Dict[str, float] = Field(default_factory=dict)
    round_number: int = 0


class CombinatorialBanditWithKnapsacks:
    """Online Primal-Dual CBwK engine for intra-day continuous capital reallocation."""

    def __init__(
        self,
        daily_budget: float,
        inventory_capacities: Dict[str, int],
        epsilon: float = 0.05,
    ):
        self.daily_budget = daily_budget
        self.inventory_capacities = dict(inventory_capacities)
        self.remaining_inventory = dict(inventory_capacities)
        self.remaining_budget = daily_budget
        self.epsilon = epsilon
        self.round_num = 0

        # Dual variables (shadow prices) initialized to 1.0
        self.lambda_budget = 1.0
        self.lambda_inventory: Dict[str, float] = {
            sku: 1.0 for sku in inventory_capacities.keys()
        }

    def select_reallocation(self, arms: List[BanditArm]) -> List[BanditArm]:
        """Select combinatorial arms that maximize Lagrangian dual objective:

        b_t = argmax_b [ ExpectedMargin(b) - lambda_budget * Cost(b) - sum_k lambda_inv_k * Consumed_k(b) ]
        """
        selected: List[BanditArm] = []
        # Group arms by campaign to pick best spend level per campaign
        campaign_arms: Dict[str, List[BanditArm]] = {}
        for arm in arms:
            campaign_arms.setdefault(arm.campaign_id, []).append(arm)

        for camp_id, arm_list in campaign_arms.items():
            best_score = -float("inf")
            best_arm: Optional[BanditArm] = None

            for arm in arm_list:
                sku = arm.sku_id
                # Penalize by dynamic shadow prices
                inv_shadow = self.lambda_inventory.get(sku, 1.0)
                # If remaining inventory is 0, set penalty to infinity
                if self.remaining_inventory.get(sku, 0) <= 0:
                    inv_shadow = 1e9

                budget_cost = arm.spend_level * self.lambda_budget
                inv_cost = arm.inventory_consumed * inv_shadow

                net_score = arm.unit_margin - budget_cost - inv_cost
                if net_score > best_score:
                    best_score = net_score
                    best_arm = arm

            if best_arm and best_arm.spend_level > 0 and best_score > 0:
                selected.append(best_arm)

        return selected

    def update_primal_dual(self, selected_arms: List[BanditArm]) -> ShadowPriceState:
        """Update dual shadow prices via multiplicative weight updates based on consumption rate."""
        self.round_num += 1
        total_spend = sum(a.spend_level for a in selected_arms)
        self.remaining_budget = max(0.0, self.remaining_budget - total_spend)

        # Multiplicative update for budget shadow price:
        # lambda_{t+1} = lambda_t * (1 + epsilon * (spend / B_daily))
        spend_ratio = total_spend / max(self.daily_budget, 1.0)
        self.lambda_budget *= (1.0 + self.epsilon * spend_ratio)

        # Update inventory shadow prices per SKU
        sku_consumed: Dict[str, int] = {}
        for a in selected_arms:
            sku_consumed[a.sku_id] = sku_consumed.get(a.sku_id, 0) + a.inventory_consumed

        for sku, cap in self.inventory_capacities.items():
            consumed = sku_consumed.get(sku, 0)
            self.remaining_inventory[sku] = max(0, self.remaining_inventory.get(sku, 0) - consumed)

            consumption_ratio = consumed / max(cap, 1)
            # If depleted, surge shadow price
            if self.remaining_inventory[sku] <= 0:
                self.lambda_inventory[sku] = 1e6
            else:
                self.lambda_inventory[sku] *= (1.0 + self.epsilon * consumption_ratio)

        return ShadowPriceState(
            liquidity_shadow_price=round(self.lambda_budget, 4),
            inventory_shadow_prices={k: round(v, 4) for k, v in self.lambda_inventory.items()},
            round_number=self.round_num,
        )
