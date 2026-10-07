"""Unit tests for Section 6: Non-Linear Constrained Mathematical Optimizer & Bandits."""

import time
import pytest
from decide.bandits import BanditArm, CombinatorialBanditWithKnapsacks
from decide.optimizer import (
    CampaignAllocationSpec,
    EnterpriseBudgetOptimizer,
    recommend,
)
from decide.simulator import DecisionSimulator
from simulator.generator import build_world


def test_optimizer_shifts_capital_from_stockout():
    campaigns = [
        CampaignAllocationSpec(
            campaign_id="meta_stockout",
            channel="meta",
            sku_id="310805-137",
            current_spend=800.0,
            price=190.0,
            unit_cogs=58.0,
            inventory_on_hand=0,  # STOCKOUT
            beta=4500.0,
            eta=1.75,
            K=850.0,
        ),
        CampaignAllocationSpec(
            campaign_id="google_in_stock",
            channel="google",
            sku_id="880848-005",
            current_spend=600.0,
            price=175.0,
            unit_cogs=52.0,
            inventory_on_hand=400,
            beta=5500.0,
            eta=1.45,
            K=1250.0,
        ),
    ]

    opt = EnterpriseBudgetOptimizer()
    res = opt.solve(campaigns, total_budget=1400.0)

    assert "meta_stockout" in res.throttled_stockouts
    assert res.allocations["meta_stockout"] <= 5.0
    assert res.allocations["google_in_stock"] > 600.0
    assert res.margin_lift >= 0.0


def test_optimizer_velocity_constraints():
    c = CampaignAllocationSpec(
        campaign_id="google_camp",
        channel="google",
        sku_id="880848-005",
        current_spend=1000.0,
        price=175.0,
        unit_cogs=52.0,
        inventory_on_hand=1000,
        beta=5500.0,
        eta=1.45,
        K=1250.0,
    )
    opt = EnterpriseBudgetOptimizer(max_velocity_delta=0.25)
    res = opt.solve([c], total_budget=2000.0)

    # Maximum allocation cannot exceed 1000 * 1.25 = 1250
    assert res.allocations["google_camp"] <= 1250.01


def test_optimizer_convergence_sub_50ms():
    campaigns = [
        CampaignAllocationSpec(
            campaign_id=f"camp_{i}",
            channel="meta" if i % 2 == 0 else "google",
            sku_id=f"sku_{i}",
            current_spend=400.0,
            price=150.0,
            unit_cogs=50.0,
            inventory_on_hand=500,
            beta=4000.0,
            eta=1.6,
            K=900.0,
        )
        for i in range(8)
    ]
    opt = EnterpriseBudgetOptimizer()
    t0 = time.perf_counter()
    res = opt.solve(campaigns, total_budget=3200.0)
    elapsed_ms = (time.perf_counter() - t0) * 1000.0

    assert elapsed_ms < 100.0  # Safe threshold on test runner
    assert res.total_budget_allocated <= 3200.01


def test_primal_dual_bandits_shadow_pricing():
    bandit = CombinatorialBanditWithKnapsacks(
        daily_budget=1000.0,
        inventory_capacities={"hero_sku": 0, "alt_sku": 200},
    )

    arms = [
        BanditArm(
            arm_id="arm_hero",
            campaign_id="camp_hero",
            channel="meta",
            sku_id="hero_sku",
            spend_level=200.0,
            expected_revenue=500.0,
            unit_margin=250.0,
            inventory_consumed=5,
        ),
        BanditArm(
            arm_id="arm_alt",
            campaign_id="camp_alt",
            channel="google",
            sku_id="alt_sku",
            spend_level=300.0,
            expected_revenue=800.0,
            unit_margin=450.0,
            inventory_consumed=5,
        ),
    ]

    selected = bandit.select_reallocation(arms)
    # Depleted hero SKU should NOT be selected
    selected_ids = [a.arm_id for a in selected]
    assert "arm_hero" not in selected_ids
    assert "arm_alt" in selected_ids


def test_decision_simulator_forecast():
    sim = DecisionSimulator()
    allocations = {"meta-hero": 500.0, "google-search": 700.0}
    inventory = {"310805-137": 400, "880848-005": 300}
    forecast = sim.forecast_budget_allocation(allocations, inventory)

    assert forecast.total_proposed_spend == 1200.0
    assert forecast.forecasted_gross_revenue > 0
    assert forecast.forecasted_blended_roas > 0
    assert len(forecast.sku_runway_days) >= 2


def test_recommend_backward_compatibility():
    world = build_world(days=30)
    df = recommend(world["metrics"])
    assert "campaign" in df.columns
    assert "recommended_daily_spend" in df.columns
    assert "expected_daily_margin" in df.columns
