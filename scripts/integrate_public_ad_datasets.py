#!/usr/bin/env python3
"""Integrate Public Ad Datasets (Google, Amazon, Meta, Shopify) into NEXUS-DQPS.

Executes the full Section 1 data contract workflow:
1. Downloads real public datasets from Kaggle & GitHub (Fivetran production seeds).
2. Transforms raw rows into Section 1 Pydantic v2 canonical models:
   - MetaAdInsights (/v19.0/{ad_id}/insights)
   - GoogleAdsRow (Google Ads API SearchStream)
   - AmazonSponsoredProductsRow (Amazon Sponsored Products Reporting)
   - ShopifyOrder & ShopifyInventoryLevel (Shopify REST / Webhooks)
3. Reconciles cross-channel ad spend with Shopify SKU inventory and gross margin.
4. Executes SLSQP convex budget optimizer to calculate ad recommendations (Scale / Trim / Kill-Switch).
5. Ingests into DuckDB (data/dqps.duckdb) and exports state to the Next.js web dashboard.
"""
import argparse
import json
import os
import sys
from pathlib import Path

# Add project root to sys.path and set working directory
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))
os.chdir(PROJECT_ROOT)

from scripts.download_ad_datasets import download_all
from ingest.raw_dataset_importer import RawAdDatasetImporter
from ingest.pipeline import CanonicalPipeline
from ingest.load import load
from scripts.export_engine_state import generate_state


def run_integration(download: bool = False):
    print("\n" + "=" * 80)
    print("  NEXUS-DQPS: PUBLIC AD DATASET INGESTION & RECOMMENDATION ENGINE")
    print("  Platforms: Meta Graph API | Google Ads API | Amazon Ads | Shopify Admin")
    print("=" * 80 + "\n")

    raw_dir = Path("data/raw_datasets")
    payloads_dir = Path("data/payloads")
    metrics_path = Path("data/metrics.csv")

    # Step 1: Download if requested or if missing
    if download or not (raw_dir / "meta_kaggle_conversion.csv").exists():
        print("🌐 Step 1: Downloading public datasets from Kaggle & GitHub...")
        download_all(raw_dir)
    else:
        print("📁 Step 1: Using cached raw datasets in data/raw_datasets/")

    # Step 2: Transform raw datasets into Section 1 canonical payloads
    print("\n🔄 Step 2: Transforming raw records into Section 1 Pydantic contracts...")
    importer = RawAdDatasetImporter(raw_dir=raw_dir, output_dir=payloads_dir)
    transform_summary = importer.transform_all()

    # Step 3: Validate against Section 1 Pydantic v2 Models
    print("\n🔍 Step 3: Validating payloads via Pydantic v2 schemas...")
    pipeline = CanonicalPipeline(data_dir=str(payloads_dir))

    meta_raw = json.loads((payloads_dir / "meta_insights.json").read_text())
    google_raw = json.loads((payloads_dir / "google_ads_rows.json").read_text())
    amazon_raw = json.loads((payloads_dir / "amazon_sponsored_products.json").read_text())
    inv_raw = json.loads((payloads_dir / "shopify_inventory.json").read_text())
    orders_raw = json.loads((payloads_dir / "shopify_orders.json").read_text())

    meta_models = pipeline.validate_meta_payloads(meta_raw)
    google_models = pipeline.validate_google_payloads(google_raw)
    amazon_models = pipeline.validate_amazon_payloads(amazon_raw)
    inv_models = pipeline.validate_shopify_inventory(inv_raw)
    order_models = pipeline.validate_shopify_orders(orders_raw)

    print(f"   ✓ Meta:    {len(meta_models):,d} MetaAdInsights models (/v19.0/{{ad_id}}/insights)")
    print(f"   ✓ Google:  {len(google_models):,d} GoogleAdsRow models (Google Ads SearchStream)")
    print(f"   ✓ Amazon:  {len(amazon_models):,d} AmazonSponsoredProductsRow models (Reporting v3)")
    print(f"   ✓ Shopify: {len(inv_models):,d} ShopifyInventoryLevel models + {len(order_models)} orders")

    # Step 4: Reconcile with Shopify gross margins & inventory stockouts
    print("\n📊 Step 4: Reconciling Ad Spend with Shopify Gross Margins...")
    metrics_df = pipeline.reconcile_to_metrics(
        meta_models=meta_models,
        google_models=google_models,
        amazon_models=amazon_models,
        inventory_models=inv_models,
        order_models=order_models,
    )

    platform_stats = metrics_df.groupby("platform").agg(
        total_spend=("spend", "sum"),
        total_revenue=("revenue", "sum"),
        total_margin=("margin", "sum"),
        record_count=("campaign", "count")
    )
    print("\n--- Cross-Platform Financial Summary ---")
    for plat, row in platform_stats.iterrows():
        roas = row["total_revenue"] / max(row["total_spend"], 1.0)
        margin_pct = (row["total_margin"] / max(row["total_revenue"], 1.0)) * 100
        print(f"  [{plat.upper():<7}] Records: {int(row['record_count']):>5} | Spend: ${row['total_spend']:>10,.2f} | Rev: ${row['total_revenue']:>10,.2f} | Margin: ${row['total_margin']:>10,.2f} ({margin_pct:.1f}%) | ROAS: {roas:.2f}x")

    # Save to metrics.csv & DuckDB
    metrics_df.to_csv(metrics_path, index=False)
    load("data/dqps.duckdb", metrics_df, events=[])
    print(f"\n   ✓ Persisted unified dataset to {metrics_path} & data/dqps.duckdb")

    # Step 5: Execute SLSQP Convex Optimizer to generate budget reallocations
    print("\n🧠 Step 5: Running SLSQP Convex Optimization & Safety Kill-Switch...")
    recs = pipeline.run_optimization(metrics_df)

    print("\n" + "=" * 105)
    print(f"{'CAMPAIGN':<40} | {'CURR $/DAY':<12} | {'REC $/DAY':<12} | {'EXP MARGIN':<12} | {'ACTION / REASON'}")
    print("=" * 105)

    for _, r in recs.iterrows():
        camp = r["campaign"]
        curr = f"${r['current_daily_spend']:,.2f}"
        rec_spend = f"${r['recommended_daily_spend']:,.2f}"
        margin = f"${r['expected_daily_margin']:,.2f}"
        if r["stockout_kill"]:
            action = "🚨 KILL-SWITCH (0 WAREHOUSE UNITS REMAINING)"
        elif r["recommended_daily_spend"] > r["current_daily_spend"]:
            action = f"⬆️ SCALE (+{((r['recommended_daily_spend']/max(r['current_daily_spend'], 1e-6))-1)*100:.0f}%)"
        else:
            action = f"⬇️ TRIM ({((r['recommended_daily_spend']/max(r['current_daily_spend'], 1e-6))-1)*100:.0f}%)"
        print(f"{camp:<40} | {curr:<12} | {rec_spend:<12} | {margin:<12} | {action}")

    print("=" * 105)

    # Step 6: Export updated engine state for Web Dashboard
    print("\n🚀 Step 6: Updating Dark Autonomous Web Console State...")
    try:
        generate_state()
        print("   ✓ State compiled successfully into web/src/data/nexus-engine-state.json")
    except Exception as e:
        print(f"   ⚠️ Note on state export: {e}")

    print("\n✨ Ingestion, Reconciliation, and Optimization complete!")
    print("👉 View live interactive console at: http://localhost:3000/dashboard/reallocations\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Integrate public ad datasets into NEXUS-DQPS")
    parser.add_argument("--download", action="store_true", help="Force re-download of public datasets")
    args = parser.parse_args()
    run_integration(download=args.download)
