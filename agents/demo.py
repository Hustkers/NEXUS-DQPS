"""Standalone CLI demo executing end-to-end autonomous decision loop in terminal.

Run with: python -m agents.demo
"""

import time
from datetime import datetime, timezone
from agents.orchestrator import AutonomousOrchestrator
from decide.optimizer import CampaignAllocationSpec
from diagnose.anomaly import AnomalyEvent


def run_demo() -> None:
    print("=" * 70)
    print("NEXUS-DQPS: Autonomous Closed-Loop Decision Engine Demo")
    print("=" * 70)

    orchestrator = AutonomousOrchestrator()

    # 1. Synthesize Anomaly Input
    print("\n[1/4] Detecting Real-Time Ingested Telemetry Anomaly...")
    anomaly = AnomalyEvent(
        event_id="anom_meta_hero_01",
        timestamp=datetime.now(timezone.utc),
        campaign="meta_hero_shoe",
        platform="meta",
        sku="310805-137",
        severity="CRITICAL",
        metric_name="roas",
        observed_value=0.20,
        baseline_value=3.20,
        deviation_pct=-93.8,
        burn_rate_hourly=33.33,
        divergences={"spend": 800.0, "cvr": 0.0, "inventory": 0.0},
        summary="CRITICAL: ROAS collapsed by -93.8% due to Hero SKU stockout in Shopify.",
    )
    print(f"      - Anomaly Event:    {anomaly.event_id}")
    print(f"      - Severity:         {anomaly.severity}")
    print(f"      - Summary:          {anomaly.summary}")

    # 2. Portfolio Configuration
    print("\n[2/4] Initializing Portfolio Configuration...")
    campaign_specs = [
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

    # 3. Run Autonomous Loop
    print("\n[3/4] Running Orchestrator Pipeline across all Decision Nodes...")
    t0 = time.perf_counter()
    state = orchestrator.run_pipeline(
        anomalies=[anomaly],
        campaign_specs=campaign_specs,
        total_budget=1900.0,
        auto_execute_tier1=True,
    )
    elapsed_ms = (time.perf_counter() - t0) * 1000.0

    print("\n" + "-" * 70)
    print("AUTONOMOUS ORCHESTRATION PIPELINE SUMMARY")
    print("-" * 70)
    print(f"Pipeline Stage Reached:    {state.stage}")
    print(f"Pipeline Execution Latency: {elapsed_ms:.2f} ms")
    print(f"Primary Root Cause:        {state.rca_results[0].primary_root_cause} (Confidence: {state.rca_results[0].confidence:.0%})")
    print(f"Executive Action Briefing: {state.executive_briefing.get('summary')}")
    print(f"Directives Generated:      {len(state.directives)}")
    print(f"Auto-Executed Receipts:    {len(state.receipts)}")
    print(f"Pending Approvals:         {len(orchestrator.pending_directives)}")

    for d in state.directives:
        print(f"  -> Directive {d.directive_id}: {d.action_type} on {d.campaign_id} (${d.pre_spend:.0f} -> ${d.target_spend:.0f}) [{d.authorization_tier}]")

    # 4. Demonstrate Approval
    if orchestrator.pending_directives:
        pid = next(iter(orchestrator.pending_directives.keys()))
        print(f"\n[4/4] Demonstrating Voice/Human Approval on Pending Directive {pid}...")
        receipt = orchestrator.approve_directive(pid, authorization_token="VOICE_BRIEFING_AUTHORIZED")
        print(f"      - Executed Status: {receipt.status} at {receipt.executed_at}")
        print(f"      - Spend Shift:     ${receipt.pre_spend:.0f} -> ${receipt.post_spend:.0f}")

    print("=" * 70)
    print("END-TO-END AUTONOMOUS LOOP COMPLETED SUCCESSFULLY")
    print("=" * 70)


if __name__ == "__main__":
    run_demo()
