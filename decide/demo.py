"""Standalone CLI demo for SLSQP Optimization & Combinatorial Bandits.

Run with: python -m decide.demo
"""

from decide.bandits import BanditArm, CombinatorialBanditWithKnapsacks
from decide.optimizer import CampaignAllocationSpec, EnterpriseBudgetOptimizer
from decide.simulator import DecisionSimulator


def run_demo() -> None:
    print("=" * 70)
    print("NEXUS-DQPS: Non-Linear SLSQP Optimization & Primal-Dual Bandits Demo")
    print("=" * 70)

    # 1. Setup multi-campaign portfolio where Hero SKU is stocked out
    print("\n[1/3] Configuring Portfolio Allocation Problem (Hero SKU in stockout)...")
    campaigns = [
        CampaignAllocationSpec(
            campaign_id="meta_hero_shoe",
            channel="meta",
            sku_id="310805-137",
            current_spend=800.0,
            price=192.71,
            unit_cogs=58.00,
            inventory_on_hand=0,  # CRITICAL STOCKOUT
            beta=4500.0,
            eta=1.75,
            K=850.0,
        ),
        CampaignAllocationSpec(
            campaign_id="google_zoom_fly",
            channel="google",
            sku_id="880848-005",
            current_spend=600.0,
            price=174.64,
            unit_cogs=52.50,
            inventory_on_hand=450,
            beta=5500.0,
            eta=1.45,
            K=1250.0,
        ),
        CampaignAllocationSpec(
            campaign_id="amazon_air_max",
            channel="amazon",
            sku_id="AH8050-100",
            current_spend=500.0,
            price=168.61,
            unit_cogs=48.00,
            inventory_on_hand=600,
            beta=5000.0,
            eta=2.10,
            K=700.0,
        ),
    ]

    total_budget = 1900.0
    optimizer = EnterpriseBudgetOptimizer(roas_floor=1.80, max_velocity_delta=0.25)
    res = optimizer.solve(campaigns, total_budget=total_budget)

    print("\n" + "-" * 70)
    print("SLSQP OPTIMIZER CONVERGENCE & REALLOCATION RESULTS")
    print("-" * 70)
    print(f"Solver Status:                  {res.solver_status}")
    print(f"Solver Convergence Latency:     {res.convergence_time_ms:.2f} ms (target <50ms)")
    print(f"Total Budget Managed:           ${res.total_budget_allocated:,.2f}")
    print(f"Current Net Margin:             ${res.current_net_contribution_margin:,.2f}")
    print(f"Optimized Expected Margin:      ${res.expected_net_contribution_margin:,.2f}")
    print(f"Margin Lift:                    +${res.margin_lift:,.2f}")
    print(f"Portfolio Blended ROAS:         {res.portfolio_blended_roas:.2f}x")
    print(f"Throttled Stockout Campaigns:   {res.throttled_stockouts}")

    print("\n--- Shift Recommendations ---")
    for c in campaigns:
        curr = c.current_spend
        rec = res.allocations[c.campaign_id]
        delta = res.spend_deltas[c.campaign_id]
        stock = c.inventory_on_hand
        print(f"  [{c.campaign_id:<16s}] Stock: {stock:>3d} | Current: ${curr:>7.2f} -> Rec: ${rec:>7.2f} (Delta: {delta:>+7.2f})")

    # 2. Primal-Dual Bandits Shadow Price Demonstration
    print("\n[2/3] Demonstrating Online Combinatorial Bandits with Knapsacks (CBwK)...")
    bandit = CombinatorialBanditWithKnapsacks(
        daily_budget=2000.0,
        inventory_capacities={"310805-137": 0, "880848-005": 300, "AH8050-100": 400},
    )

    arms = [
        BanditArm(
            arm_id="arm_hero_high",
            campaign_id="meta_hero_shoe",
            channel="meta",
            sku_id="310805-137",
            spend_level=500.0,
            expected_revenue=1500.0,
            unit_margin=800.0,
            inventory_consumed=8,
        ),
        BanditArm(
            arm_id="arm_zoom_scale",
            campaign_id="google_zoom_fly",
            channel="google",
            sku_id="880848-005",
            spend_level=750.0,
            expected_revenue=2800.0,
            unit_margin=1600.0,
            inventory_consumed=16,
        ),
    ]

    selected = bandit.select_reallocation(arms)
    shadow_state = bandit.update_primal_dual(selected)
    print(f"      - Selected Arms:                {[a.arm_id for a in selected]}")
    print(f"      - Depleted SKU Shadow Price:    {shadow_state.inventory_shadow_prices.get('310805-137'):,.0f} (Penalizes stockout spend)")
    print(f"      - Liquidity Shadow Price:       {shadow_state.liquidity_shadow_price:.4f}")

    # 3. Decision Simulator Forecast
    print("\n[3/3] Running Decision Simulator What-If Forecast...")
    simulator = DecisionSimulator()
    camp_map = {
        "meta_hero_shoe": ("meta", "310805-137"),
        "google_zoom_fly": ("google", "880848-005"),
        "amazon_air_max": ("amazon", "AH8050-100"),
    }
    forecast = simulator.forecast_budget_allocation(
        allocations=res.allocations,
        current_inventory={"310805-137": 0, "880848-005": 450, "AH8050-100": 600},
        sku_channel_map=camp_map,
    )
    print(f"Forecasted Net Contribution:    ${forecast.forecasted_net_contribution_margin:,.2f}")
    print(f"Forecasted Blended ROAS:        {forecast.forecasted_blended_roas:.2f}x")
    print(f"Forecasted POAS:                {forecast.forecasted_poas:.2f}x")
    print("=" * 70)


if __name__ == "__main__":
    run_demo()
