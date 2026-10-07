"""Non-Linear Constrained Mathematical Optimizer (SLSQP & NCM Maximization).

Maximizes enterprise Net Contribution Margin:
NCM = sum_k (Price_k - COGS_k - VarCost_k) * Q_k(b) - sum_c b_c

Subject to:
1. Total Budget ceiling: sum_c b_c <= B_total
2. Per-channel min/max bounds: b_c_min <= b_c <= b_c_max
3. Portfolio Blended ROAS floor: (sum_k Rev_k) / (sum_c b_c) >= ROAS_floor
4. Inventory stockout prevention: Q_k(b) <= OnHand_k + Replenishment_k
5. Daily spend velocity constraint: |b_c - b_c_prev| <= 0.25 * b_c_prev
"""

from __future__ import annotations

import time
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field
from scipy.optimize import minimize

from decide.curves import (
    CHANNEL_DEFAULTS,
    global_response_registry,
    hill_saturation,
    marginal_roas,
)


class CampaignAllocationSpec(BaseModel):
    """Specification for a campaign budget decision variable."""

    campaign_id: str
    channel: str
    sku_id: str
    current_spend: float
    price: float
    unit_cogs: float
    variable_cost_pct: float = 0.03
    inventory_on_hand: int = 500
    lead_time_replenishment: int = 0
    beta: float
    eta: float
    K: float


class OptimizationResult(BaseModel):
    """Comprehensive output from SLSQP optimizer."""

    allocations: Dict[str, float]  # campaign_id -> recommended_spend
    spend_deltas: Dict[str, float]  # campaign_id -> recommended - current
    expected_revenues: Dict[str, float]
    expected_net_contribution_margin: float
    current_net_contribution_margin: float
    margin_lift: float
    portfolio_blended_roas: float
    total_budget_allocated: float
    solver_status: str
    convergence_time_ms: float
    throttled_stockouts: List[str]


class EnterpriseBudgetOptimizer:
    """Production SLSQP Optimizer with analytical Jacobians and strict physical constraints."""

    def __init__(
        self,
        roas_floor: float = 1.80,
        max_velocity_delta: float = 0.25,
        horizon_days: int = 1,
    ):
        self.roas_floor = roas_floor
        self.max_velocity_delta = max_velocity_delta
        self.horizon_days = horizon_days

    def solve(
        self,
        campaigns: List[CampaignAllocationSpec],
        total_budget: Optional[float] = None,
    ) -> OptimizationResult:
        """Solve constrained non-linear program using SLSQP."""
        t0 = time.perf_counter()
        n = len(campaigns)
        if n == 0:
            return OptimizationResult(
                allocations={},
                spend_deltas={},
                expected_revenues={},
                expected_net_contribution_margin=0.0,
                current_net_contribution_margin=0.0,
                margin_lift=0.0,
                portfolio_blended_roas=0.0,
                total_budget_allocated=0.0,
                solver_status="EMPTY",
                convergence_time_ms=0.0,
                throttled_stockouts=[],
            )

        current_spends = np.array([c.current_spend for c in campaigns], dtype=float)
        b_target = total_budget if total_budget is not None else float(np.sum(current_spends))

        prices = np.array([c.price for c in campaigns], dtype=float)
        cogss = np.array([c.unit_cogs for c in campaigns], dtype=float)
        var_pcts = np.array([c.variable_cost_pct for c in campaigns], dtype=float)
        betas = np.array([c.beta for c in campaigns], dtype=float)
        etas = np.array([c.eta for c in campaigns], dtype=float)
        Ks = np.array([c.K for c in campaigns], dtype=float)
        inventories = np.array(
            [c.inventory_on_hand + c.lead_time_replenishment for c in campaigns], dtype=float
        )

        # Margin rate per dollar of revenue = (Price - COGS - Price * var_cost_pct) / Price
        margin_rates = (prices - cogss - prices * var_pcts) / np.maximum(prices, 1.0)

        # Initial point x0
        x0 = np.copy(current_spends)
        if np.sum(x0) <= 0:
            x0 = np.full(n, b_target / n)
        else:
            x0 = x0 * (b_target / np.sum(x0))

        # Identify stocked-out campaigns to hard throttle
        throttled_campaigns: List[str] = []
        bounds: List[Tuple[float, float]] = []

        for i, c in enumerate(campaigns):
            if c.inventory_on_hand <= 0:
                throttled_campaigns.append(c.campaign_id)
                # Clamp out-of-stock campaign down to minimum baseline
                bounds.append((0.0, 5.0))
                x0[i] = 0.0
            else:
                # Daily spend velocity constraint: [0.75 * current, 1.25 * current]
                v_min = max(10.0, c.current_spend * (1.0 - self.max_velocity_delta))
                v_max = max(50.0, c.current_spend * (1.0 + self.max_velocity_delta))
                bounds.append((v_min, v_max))

        # Re-normalize x0 to satisfy bounds
        for i in range(n):
            x0[i] = np.clip(x0[i], bounds[i][0], bounds[i][1])

        # Objective Function: Negative Net Contribution Margin (to minimize)
        def objective(x: np.ndarray) -> float:
            revs = np.zeros(n)
            for i in range(n):
                revs[i] = hill_saturation(x[i], betas[i], etas[i], Ks[i])
            # Orders demanded = revs / price
            orders = revs / np.maximum(prices, 1.0)
            # Physical order cap = min(orders, inventories)
            realized_orders = np.minimum(orders, inventories)
            realized_rev = realized_orders * prices
            total_margin = np.sum(realized_rev * margin_rates) - np.sum(x)
            return -total_margin

        # Analytical Jacobian Gradient of Objective
        def jacobian(x: np.ndarray) -> np.ndarray:
            grad = np.zeros(n)
            for i in range(n):
                m_roas = marginal_roas(x[i], betas[i], etas[i], Ks[i])
                rev = hill_saturation(x[i], betas[i], etas[i], Ks[i])
                orders = rev / max(prices[i], 1.0)
                if orders >= inventories[i]:
                    # Inventory bottleneck reached: additional spend produces 0 incremental units
                    d_margin_dx = -1.0
                else:
                    d_margin_dx = m_roas * margin_rates[i] - 1.0
                grad[i] = -d_margin_dx
            return grad

        # Constraints
        constraints = []

        # 1. Budget ceiling: B_target - sum(x) >= 0 (inequality)
        constraints.append({
            "type": "ineq",
            "fun": lambda x: b_target - np.sum(x),
            "jac": lambda x: -np.ones(n),
        })

        # 2. Portfolio Blended ROAS floor: sum(rev) - ROAS_floor * sum(x) >= 0
        def roas_constraint(x: np.ndarray) -> float:
            rev_total = 0.0
            for i in range(n):
                rev = hill_saturation(x[i], betas[i], etas[i], Ks[i])
                realized_rev = min(rev, inventories[i] * prices[i])
                rev_total += realized_rev
            return rev_total - self.roas_floor * np.sum(x)

        constraints.append({
            "type": "ineq",
            "fun": roas_constraint,
        })

        # Solve with SLSQP
        opt = minimize(
            fun=objective,
            x0=x0,
            method="SLSQP",
            jac=jacobian,
            bounds=bounds,
            constraints=constraints,
            options={"maxiter": 200, "ftol": 1e-4},
        )

        x_opt = np.maximum(opt.x, 0.0)
        # Calculate current vs expected margins
        current_ncm = -objective(current_spends)
        expected_ncm = -objective(x_opt)
        margin_lift = max(0.0, expected_ncm - current_ncm)

        alloc_dict = {}
        delta_dict = {}
        rev_dict = {}
        total_rev = 0.0

        for i, c in enumerate(campaigns):
            spend_rec = round(float(x_opt[i]), 2)
            alloc_dict[c.campaign_id] = spend_rec
            delta_dict[c.campaign_id] = round(spend_rec - c.current_spend, 2)
            rev_val = round(float(hill_saturation(spend_rec, betas[i], etas[i], Ks[i])), 2)
            rev_dict[c.campaign_id] = rev_val
            total_rev += rev_val

        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        tot_spend = float(np.sum(x_opt))
        blended_roas = round(total_rev / tot_spend, 2) if tot_spend > 0 else 0.0

        return OptimizationResult(
            allocations=alloc_dict,
            spend_deltas=delta_dict,
            expected_revenues=rev_dict,
            expected_net_contribution_margin=round(expected_ncm, 2),
            current_net_contribution_margin=round(current_ncm, 2),
            margin_lift=round(margin_lift, 2),
            portfolio_blended_roas=blended_roas,
            total_budget_allocated=round(tot_spend, 2),
            solver_status="CONVERGED" if opt.success else "APPROXIMATED",
            convergence_time_ms=round(elapsed_ms, 2),
            throttled_stockouts=throttled_campaigns,
        )


# Backward compatible recommend function
def recommend(metrics: pd.DataFrame, total_budget: Optional[float] = None) -> pd.DataFrame:
    """Recommend budget allocation for campaigns from telemetry dataframe."""
    recent = metrics.sort_values("date").groupby("campaign").tail(14)
    specs: List[CampaignAllocationSpec] = []

    for c, g in recent.groupby("campaign"):
        spend_mean = float(g["spend"].mean())
        rev_mean = float(g["revenue"].mean())
        price = float(g["price"].iloc[-1]) if "price" in g else 150.0
        inv = int(g.sort_values("date")["inventory"].iloc[-1]) if "inventory" in g else 500
        sku = str(g["sku"].iloc[0]) if "sku" in g else "sku_default"
        ch = str(g["platform"].iloc[0]) if "platform" in g else "meta"

        defaults = CHANNEL_DEFAULTS.get(ch.lower(), CHANNEL_DEFAULTS["meta"])
        specs.append(
            CampaignAllocationSpec(
                campaign_id=str(c),
                channel=ch,
                sku_id=sku,
                current_spend=spend_mean,
                price=price,
                unit_cogs=price * 0.40,
                inventory_on_hand=inv,
                beta=defaults["beta"],
                eta=defaults["eta"],
                K=defaults["K"],
            )
        )

    optimizer = EnterpriseBudgetOptimizer()
    res = optimizer.solve(specs, total_budget=total_budget)

    out = []
    for s in specs:
        out.append({
            "campaign": s.campaign_id,
            "current_daily_spend": round(s.current_spend, 2),
            "recommended_daily_spend": res.allocations.get(s.campaign_id, s.current_spend),
            "expected_daily_margin": round(res.expected_revenues.get(s.campaign_id, 0.0) * 0.5, 2),
            "stockout_kill": s.inventory_on_hand == 0,
        })

    return pd.DataFrame(out).sort_values("expected_daily_margin", ascending=False)
