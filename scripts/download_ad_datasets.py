#!/usr/bin/env python3
"""Download real public advertisement and e-commerce datasets from Kaggle & GitHub.

Fetches production-grade datasets for:
1. Meta (Facebook) Ads: Kaggle Conversion Dataset & Fivetran Meta Ads seeds
2. Google Ads: Fivetran Google Ads campaign & performance seeds
3. Amazon Ads: Fivetran Amazon Sponsored Products reporting & campaign seeds
4. Shopify: Fivetran Shopify orders, line items, products & inventory seeds
"""
import io
import sys
import urllib.request
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / "data" / "raw_datasets"

DATASETS = {
    # Meta / Facebook Ads
    "meta_kaggle_conversion.csv": "https://raw.githubusercontent.com/mGalarnyk/Python_Tutorials/master/Kaggle/Facebook/KAG_conversion_data.csv",
    "meta_fivetran_basic_ad.csv": "https://raw.githubusercontent.com/fivetran/dbt_facebook_ads_source/main/integration_tests/seeds/facebook_ads_basic_ad_data.csv",
    "meta_fivetran_actions.csv": "https://raw.githubusercontent.com/fivetran/dbt_facebook_ads_source/main/integration_tests/seeds/facebook_ads_basic_ad_actions_data.csv",
    "meta_fivetran_action_values.csv": "https://raw.githubusercontent.com/fivetran/dbt_facebook_ads_source/main/integration_tests/seeds/facebook_ads_basic_ad_action_values_data.csv",
    "meta_fivetran_campaigns.csv": "https://raw.githubusercontent.com/fivetran/dbt_facebook_ads_source/main/integration_tests/seeds/facebook_ads_campaign_history_data.csv",

    # Google Ads
    "google_fivetran_campaign_stats.csv": "https://raw.githubusercontent.com/fivetran/dbt_google_ads_source/main/integration_tests/seeds/campaign_stats_data.csv",
    "google_fivetran_campaigns.csv": "https://raw.githubusercontent.com/fivetran/dbt_google_ads_source/main/integration_tests/seeds/campaign_history_data.csv",

    # Amazon Advertising
    "amazon_fivetran_campaign_report.csv": "https://raw.githubusercontent.com/fivetran/dbt_amazon_ads_source/main/integration_tests/seeds/campaign_level_report_data.csv",
    "amazon_fivetran_campaigns.csv": "https://raw.githubusercontent.com/fivetran/dbt_amazon_ads_source/main/integration_tests/seeds/campaign_history_data.csv",
    "amazon_fivetran_advertised_products.csv": "https://raw.githubusercontent.com/fivetran/dbt_amazon_ads_source/main/integration_tests/seeds/advertised_product_report_data.csv",

    # Shopify Admin / Webhook data
    "shopify_fivetran_orders.csv": "https://raw.githubusercontent.com/fivetran/dbt_shopify_source/main/integration_tests/seeds/shopify_order_data.csv",
    "shopify_fivetran_order_lines.csv": "https://raw.githubusercontent.com/fivetran/dbt_shopify_source/main/integration_tests/seeds/shopify_order_line_data.csv",
    "shopify_fivetran_inventory_levels.csv": "https://raw.githubusercontent.com/fivetran/dbt_shopify_source/main/integration_tests/seeds/shopify_inventory_level_data.csv",
    "shopify_fivetran_inventory_items.csv": "https://raw.githubusercontent.com/fivetran/dbt_shopify_source/main/integration_tests/seeds/shopify_inventory_item_data.csv",
    "shopify_fivetran_products.csv": "https://raw.githubusercontent.com/fivetran/dbt_shopify_source/main/integration_tests/seeds/shopify_product_data.csv",
}


def download_all(dest_dir: Path = DATA_DIR):
    """Download all public benchmark datasets into local cache."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    print(f"\n📥 Downloading {len(DATASETS)} real AD & e-commerce datasets into {dest_dir}...")

    success_count = 0
    for filename, url in DATASETS.items():
        file_path = dest_dir / filename
        try:
            print(f"  ⬇️  Fetching {filename}...")
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (compatible; NexusDQPS/1.0)"}
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                content = resp.read()
                file_path.write_bytes(content)
                size_kb = len(content) / 1024
                lines = len(content.decode("utf-8", errors="ignore").splitlines())
                print(f"     ✓ Saved {filename} ({size_kb:.1f} KB, {lines:,} lines)")
                success_count += 1
        except Exception as e:
            print(f"     ❌ Failed {filename} from {url}: {e}")

    print(f"\n✨ Successfully downloaded {success_count}/{len(DATASETS)} datasets.\n")
    return success_count


if __name__ == "__main__":
    count = download_all()
    if count == 0:
        sys.exit(1)
