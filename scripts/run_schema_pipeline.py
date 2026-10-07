#!/usr/bin/env python3
"""Execute the complete Section 1 Schema Pipeline to generate Ad Recommendations."""
import json
import os
import sys
from pathlib import Path

# Add project root to sys.path and set working directory
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))
os.chdir(PROJECT_ROOT)

from ingest.pipeline import CanonicalPipeline
from ingest.load import load
from scripts.export_engine_state import generate_state


def create_endpoint_exact_fixtures(target_dir: Path):
    """Generate production-exact JSON payloads matching Section 1 data contracts."""
    target_dir.mkdir(parents=True, exist_ok=True)

    # 1.1 Meta Graph API /v19.0/{ad_id}/insights
    meta_payload = [
        {
            "ad_id": "2385102938401",
            "campaign_id": "120381029384",
            "campaign_name": "Meta-315122-001-Prospecting",
            "spend": 850.50,
            "impressions": 72000,
            "clicks": 2150,
            "cpc": 0.40,
            "cpm": 11.81,
            "frequency": 1.42,
            "date_start": "2026-10-01",
            "date_stop": "2026-10-07",
            "actions": [
                {"action_type": "link_click", "value": 2150},
                {"action_type": "omni_purchase", "value": 46}
            ],
            "action_values": [
                {"action_type": "omni_purchase", "value": 4042.94}
            ]
        },
        {
            "ad_id": "2385102938402",
            "campaign_id": "120381029385",
            "campaign_name": "Meta-880848-005-Retargeting",
            "spend": 620.00,
            "impressions": 46500,
            "clicks": 1420,
            "cpc": 0.44,
            "cpm": 13.33,
            "frequency": 2.15,
            "date_start": "2026-10-01",
            "date_stop": "2026-10-07",
            "actions": [
                {"action_type": "omni_purchase", "value": 38}
            ],
            "action_values": [
                {"action_type": "omni_purchase", "value": 6636.32}
            ]
        },
        {
            "ad_id": "2385102938403",
            "campaign_id": "120381029386",
            "campaign_name": "Meta-310805-137-Advantage",
            "spend": 1250.00,
            "impressions": 89000,
            "clicks": 2890,
            "cpc": 0.43,
            "cpm": 14.04,
            "frequency": 1.65,
            "date_start": "2026-10-01",
            "date_stop": "2026-10-07",
            "actions": [
                {"action_type": "omni_purchase", "value": 52}
            ],
            "action_values": [
                {"action_type": "omni_purchase", "value": 10020.92}
            ]
        }
    ]
    (target_dir / "meta_insights.json").write_text(json.dumps(meta_payload, indent=2))

    # 1.2 Google Ads API GoogleAdsRow
    google_payload = [
        {
            "campaign": {
                "id": "8192039102",
                "name": "Google-Shopping-AH8050-100",
                "advertisingChannelType": "SHOPPING"
            },
            "segments": {
                "date": "2026-10-07"
            },
            "metrics": {
                "impressions": 58000,
                "clicks": 1950,
                "costMicros": 780000000,  # $780.00
                "conversions": 42.0,
                "conversionsValue": 7081.62,
                "averageCpc": 400000
            }
        },
        {
            "campaign": {
                "id": "8192039103",
                "name": "Google-PMax-CD4371-001",
                "advertisingChannelType": "PERFORMANCE_MAX"
            },
            "segments": {
                "date": "2026-10-07"
            },
            "metrics": {
                "impressions": 64000,
                "clicks": 2100,
                "costMicros": 950000000,  # $950.00
                "conversions": 54.0,
                "conversionsValue": 9104.94,
                "averageCpc": 452380
            }
        }
    ]
    (target_dir / "google_ads_rows.json").write_text(json.dumps(google_payload, indent=2))

    # 1.3 Amazon Advertising Sponsored Products Reporting
    amazon_payload = [
        {
            "campaignId": "amzn-sp-camp-01",
            "campaignName": "Amazon-SP-554724-066",
            "adGroupId": "ag-991",
            "asin": "B08N5WRW11",
            "sku": "554724-066",
            "date": "2026-10-07",
            "impressions": 42000,
            "clicks": 1280,
            "cost": 540.00,
            "attributedSales14d": 4937.22,
            "attributedUnitsOrdered14d": 41,
            "currency": "USD"
        },
        {
            "campaignId": "amzn-sp-camp-02",
            "campaignName": "Amazon-SP-BQ8928-011",
            "adGroupId": "ag-992",
            "asin": "B08N5WRW22",
            "sku": "BQ8928-011",
            "date": "2026-10-07",
            "impressions": 38000,
            "clicks": 980,
            "cost": 410.00,
            "attributedSales14d": 3382.29,
            "attributedUnitsOrdered14d": 27,
            "currency": "USD"
        }
    ]
    (target_dir / "amazon_sponsored_products.json").write_text(json.dumps(amazon_payload, indent=2))

    # 1.4 Shopify Inventory & Orders
    inventory_payload = [
        {"inventory_item_id": "1001", "location_id": "loc_1", "available": 520, "sku": "315122-001", "unit_cogs": 38.50},
        {"inventory_item_id": "1002", "location_id": "loc_1", "available": 410, "sku": "880848-005", "unit_cogs": 72.00},
        {"inventory_item_id": "1003", "location_id": "loc_1", "available": 0, "sku": "310805-137", "unit_cogs": 79.00},  # Stockout scenario!
        {"inventory_item_id": "1004", "location_id": "loc_1", "available": 360, "sku": "AH8050-100", "unit_cogs": 70.00},
        {"inventory_item_id": "1005", "location_id": "loc_1", "available": 490, "sku": "CD4371-001", "unit_cogs": 69.00},
        {"inventory_item_id": "1006", "location_id": "loc_1", "available": 290, "sku": "554724-066", "unit_cogs": 48.00},
        {"inventory_item_id": "1007", "location_id": "loc_1", "available": 330, "sku": "BQ8928-011", "unit_cogs": 52.00},
    ]
    (target_dir / "shopify_inventory.json").write_text(json.dumps(inventory_payload, indent=2))


def main():
    print("\n=================================================================")
    print("NEXUS-DQPS: Section 1 Schema Ingestion & Ad Decision Engine")
    print("=================================================================\n")

    payloads_dir = Path("data/payloads")
    raw_dir = Path("data/raw_datasets")

    if (raw_dir / "meta_kaggle_conversion.csv").exists() and "--mock" not in sys.argv:
        print(" Ingesting real public benchmark datasets from data/raw_datasets/...")
        from ingest.raw_dataset_importer import RawAdDatasetImporter
        importer = RawAdDatasetImporter(raw_dir=raw_dir, output_dir=payloads_dir)
        importer.transform_all()
    else:
        print(" Generating endpoint-exact fixtures...")
        create_endpoint_exact_fixtures(payloads_dir)

    pipeline = CanonicalPipeline(data_dir=str(payloads_dir))

    # 1. Load and Validate Raw Payloads against Section 1 Pydantic v2 Models
    print(" 1. Validating payloads against Section 1 Pydantic v2 contracts...")
    meta_raw = json.loads((payloads_dir / "meta_insights.json").read_text())
    google_raw = json.loads((payloads_dir / "google_ads_rows.json").read_text())
    amazon_raw = json.loads((payloads_dir / "amazon_sponsored_products.json").read_text())
    inv_raw = json.loads((payloads_dir / "shopify_inventory.json").read_text())

    meta_models = pipeline.validate_meta_payloads(meta_raw)
    google_models = pipeline.validate_google_payloads(google_raw)
    amazon_models = pipeline.validate_amazon_payloads(amazon_raw)
    inv_models = pipeline.validate_shopify_inventory(inv_raw)

    print(f"Validated {len(meta_models)} MetaAdInsights models (/v19.0/{{ad_id}}/insights)")
    print(f"Validated {len(google_models)} GoogleAdsRow models (SearchStream)")
    print(f"Validated {len(amazon_models)} AmazonSponsoredProductsRow models (Reporting v3)")
    print(f"Validated {len(inv_models)} ShopifyInventoryLevel models (Shopify REST/Webhooks)")

    # 2. Reconcile Cross-Platform Ad Performance with Shopify Inventory & Unit COGS
    print("\n 2. Harmonizing Cross-Platform Spend with Shopify Gross Margins...")
    metrics_df = pipeline.reconcile_to_metrics(
        meta_models=meta_models,
        google_models=google_models,
        amazon_models=amazon_models,
        inventory_models=inv_models,
    )
    print(f"Reconciled dataset: {len(metrics_df)} rows across {metrics_df['platform'].nunique()} ad channels.")

    # Ingest into DuckDB & data/metrics.csv
    metrics_path = Path("data/metrics.csv")
    metrics_df.to_csv(metrics_path, index=False)
    load("data/dqps.duckdb", metrics_df, events=[])
    print(f"Saved to {metrics_path} and data/dqps.duckdb")

    # 3. Generate Ad Budget Reallocations via SLSQP Convex Optimizer
    print("\n 3. Generating Autonomous Ad Budget Recommendations (scipy SLSQP)...")
    recs = pipeline.run_optimization(metrics_df)

    print("\n" + "=" * 95)
    print(f"{'CAMPAIGN':<32} | {'CURRENT $/D':<12} | {'RECOMMENDED $/D':<16} | {'EXP MARGIN':<12} | {'ACTION'}")
    print("=" * 95)

    for _, r in recs.iterrows():
        camp = r["campaign"]
        curr = f"${r['current_daily_spend']:,.2f}"
        rec_spend = f"${r['recommended_daily_spend']:,.2f}"
        margin = f"${r['expected_daily_margin']:,.2f}"
        action = " KILL (STOCKOUT = 0)" if r["stockout_kill"] else ("⬆️ SCALE" if r["recommended_daily_spend"] > r["current_daily_spend"] else "⬇️ TRIM")
        print(f"{camp:<32} | {curr:<12} | {rec_spend:<16} | {margin:<12} | {action}")

    print("=" * 95)

    # 4. Refresh Web Console State
    print("\n 4. Refreshing Dark Autonomous Web Console...")
    try:
        generate_state()
        print(" State compiled! Open http://localhost:3000/dashboard/reallocations to view recommendations.")
    except Exception as ex:
        print(f"Note on state generation: {ex}")

    print("\n=================================================================\n")


if __name__ == "__main__":
    main()
