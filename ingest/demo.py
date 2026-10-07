"""Standalone CLI demonstration runner for ingestion and unit economics reconciliation.

Run with: python -m ingest.demo
"""

import time
from simulator.data_generator import SyntheticTelemetryGenerator
from ingest.duckdb_client import DuckDBClient
from ingest.loader import IngestionPipeline
from ingest.reconcile import UnitEconomicsReconciler


def run_demo() -> None:
    print("=" * 70)
    print("NEXUS-DQPS: Multi-Channel Ingestion & Reconciliation Demonstration")
    print("=" * 70)

    # 1. Generate Synthetic Telemetry
    print("\n[1/3] Generating 14 days of endpoint-exact telemetry across Meta, Google, Amazon & Shopify...")
    gen = SyntheticTelemetryGenerator(seed=42, base_date="2026-03-01")
    world = gen.generate_world(days=14)
    print(f"      - Meta Insights Records:        {len(world['meta'])}")
    print(f"      - Google Ads Rows:              {len(world['google'])}")
    print(f"      - Amazon SP Report Records:     {len(world['amazon'])}")
    print(f"      - Shopify Orders:               {len(world['shopify_orders'])}")
    print(f"      - Shopify Inventory Events:     {len(world['shopify_inventory'])}")

    # 2. High-Performance DuckDB Ingestion
    print("\n[2/3] Executing DuckDB vectorized ingestion pipeline...")
    db_client = DuckDBClient(db_path=":memory:")
    pipeline = IngestionPipeline(db_client=db_client)

    result = pipeline.ingest_payloads(
        meta_records=world["meta"],
        google_records=world["google"],
        amazon_records=world["amazon"],
        shopify_orders=world["shopify_orders"],
        inventory_levels=world["shopify_inventory"],
    )
    print(f"      - Total Records Ingested:       {result['inserted_records']}")
    print(f"      - Ingestion Time:               {result['elapsed_ms']} ms (target <50ms)")

    # 3. Cross-Channel Unit Economics Reconciliation
    print("\n[3/3] Reconciling Blended ROAS, POAS, MER & Net Contribution Margin...")
    reconciler = UnitEconomicsReconciler(db_client=db_client)
    summary = reconciler.reconcile()

    print("\n" + "-" * 70)
    print("EXECUTIVE UNIT ECONOMICS RECONCILIATION SUMMARY")
    print("-" * 70)
    print(f"Total Ad Spend (All Channels):     ${summary.total_ad_spend:,.2f}")
    print(f"Total Net Storefront Revenue:      ${summary.total_net_revenue:,.2f}")
    print(f"Total Cost of Goods Sold (COGS):   ${summary.total_cogs:,.2f}")
    print(f"Total Gross Margin:                ${summary.total_gross_margin:,.2f}")
    print(f"Net Contribution Margin (NCM):     ${summary.net_contribution_margin:,.2f}")
    print(f"Blended ROAS:                      {summary.blended_roas:.2f}x")
    print(f"Blended POAS (Profit on Ad Spend): {summary.blended_poas:.2f}x")
    print(f"Blended MER:                       {summary.blended_mer:.2f}x")

    print("\n--- Channel Breakdown ---")
    for ch, data in summary.channel_breakdown.items():
        print(f"  [{ch.upper():8s}] Spend: ${data.spend:>9,.2f} | Attributed Rev: ${data.attributed_revenue:>10,.2f} | ROAS: {data.roas:>5.2f}x")

    print("\n--- SKU Unit Economics Breakdown ---")
    for sku, s_data in summary.sku_breakdown.items():
        print(f"  [{sku:11s}] Units: {s_data.units_sold:>3d} | Rev: ${s_data.net_revenue:>8,.2f} | Margin: ${s_data.gross_margin:>8,.2f} | POAS: {s_data.poas:>5.2f}x | Status: {s_data.inventory_status}")

    print("=" * 70)
    print("DEMO COMPLETE: All telemetry reconciled with sub-millisecond warehouse analytics.")
    print("=" * 70)


if __name__ == "__main__":
    run_demo()
