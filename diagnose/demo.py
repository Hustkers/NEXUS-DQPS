"""Standalone diagnostic demonstration runner.

Run with: python -m diagnose.demo
"""

import json
from agents.rca import synthesize_causal_explanation
from diagnose.attribution import CounterfactualAttributionEngine
from diagnose.graph_validator import CausalGraphValidator


def run_demo() -> None:
    print("=" * 70)
    print("NEXUS-DQPS: Structural Causal Modeling & Counterfactual RCA Demo")
    print("=" * 70)

    engine = CounterfactualAttributionEngine()

    # 1. Validate DAG
    print("\n[1/3] Validating Enterprise Structural Causal DAG Topology...")
    valid, errors = CausalGraphValidator.validate_dag(engine.dag)
    assert valid, f"DAG validation failed: {errors}"
    print(f"      - Directed Acyclicity:          VALID")
    print(f"      - Topological Order:            {list(engine.dag.nodes.keys())[:5]}... ({len(engine.dag.nodes)} nodes)")
    print(f"      - Business Path Constraints:    VALID (Spend & Inventory -> Margin)")

    # 2. Simulate Injected Shopify Inventory Stockout Anomaly
    print("\n[2/3] Simulating Injected Hero SKU Stockout in Shopify...")
    baseline = {
        "spend": 500.0,
        "cpm": 12.5,
        "ctr": 0.025,
        "cvr": 0.035,
        "inventory": 500.0,
        "price": 150.0,
        "cogs": 50.0,
    }

    # Stockout: inventory drops to 0 while spend remains $500
    observed_stockout = dict(baseline)
    observed_stockout["inventory"] = 0.0

    result = engine.attribute(
        observed=observed_stockout,
        baseline=baseline,
        campaign_key="meta_hero_shoe",
    )

    print("\n" + "-" * 70)
    print("COUNTERFACTUAL SHAPLEY ATTRIBUTION RESULTS")
    print("-" * 70)
    print(f"Primary Root Cause:              {result.primary_root_cause}")
    print(f"Confidence Score:                {result.confidence:.1%}")
    print(f"Observed Margin:                 ${result.observed_margin:,.2f}")
    print(f"Counterfactual Baseline Margin:  ${result.counterfactual_baseline_margin:,.2f}")
    print(f"Total Net Contribution Loss:     ${result.total_margin_loss:,.2f}")
    print(f"Attribution Inference Latency:   {result.inference_latency_ms:.2f} ms (target <200ms)")

    print("\n--- Shapley Root-Cause Allocation (Sums to 100%) ---")
    for factor, pct in sorted(result.shapley_attributions.items(), key=lambda kv: kv[1], reverse=True):
        dollar = result.dollar_impacts.get(factor, 0.0)
        bar = "#" * int(pct / 2.5)
        print(f"  {factor:<12s}: {pct:>5.1f}% | ${dollar:>9,.2f} | {bar}")

    # 3. Google Cloud (Gemini) Executive Synthesis
    print("\n[3/3] Synthesizing Executive Natural Language Explanation via Cloud Intelligence...")
    briefing = synthesize_causal_explanation(result, "Meta - Advantage+ Hero SKU", "310805-137")
    print(f"Executive Summary:   {briefing.get('summary')}")
    print(f"Commercial Action:   {briefing.get('commercial_action')}")
    print(f"Recommendation:      {briefing.get('recommended_action_text')}")
    print(f"Projected Recovery:  ${briefing.get('projected_margin_recovery', 0):,.2f}")
    print("=" * 70)


if __name__ == "__main__":
    run_demo()
