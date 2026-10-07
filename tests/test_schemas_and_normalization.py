"""Unit tests for Section 1: Endpoint-Exact Schema Architecture & Normalization."""

import json
from pathlib import Path
from datetime import datetime, timezone
import pytest

from ingest.models.amazon import AmazonSponsoredProductsRecord
from ingest.models.canonical import UnifiedCommerceRecord
from ingest.models.google import GoogleAdsRow
from ingest.models.meta import MetaInsightsRecord
from ingest.models.shopify import ShopifyInventoryLevel, ShopifyOrder
from ingest.normalize import (
    cost_micros_to_usd,
    usd_to_cost_micros,
    convert_currency,
    normalize_iso_timestamp,
    default_catalog,
    normalize_meta_record,
    normalize_google_record,
    normalize_amazon_record,
    normalize_shopify_order,
)
from ingest.duckdb_client import DuckDBClient

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "data" / "fixtures"


def test_meta_insights_fixture_validation():
    fixture_path = FIXTURES_DIR / "meta_insights_fixture.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert len(data) >= 3

    for item in data:
        record = MetaInsightsRecord.model_validate(item)
        assert record.spend > 0
        assert record.impressions > 0
        assert record.clicks > 0
        assert record.purchases >= 0
        assert record.roas >= 0
        assert record.ctr > 0


def test_google_ads_row_fixture_validation():
    fixture_path = FIXTURES_DIR / "google_ads_row_fixture.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert len(data) >= 3

    for item in data:
        row = GoogleAdsRow.model_validate(item)
        assert row.campaign.id
        assert row.segments.date
        assert row.metrics.cost_micros > 0
        assert row.spend > 0
        assert row.roas > 0


def test_amazon_sp_report_fixture_validation():
    fixture_path = FIXTURES_DIR / "amazon_sp_report_fixture.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert len(data) >= 3

    for item in data:
        record = AmazonSponsoredProductsRecord.model_validate(item)
        assert record.campaign_id
        assert record.asin.startswith("B0")
        assert record.cost > 0
        assert record.attributed_sales_14d > 0
        assert record.roas > 0


def test_shopify_orders_fixture_validation():
    fixture_path = FIXTURES_DIR / "shopify_orders_fixture.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert len(data) >= 3

    for item in data:
        order = ShopifyOrder.model_validate(item)
        assert order.id
        assert len(order.line_items) > 0
        assert order.total_price > 0
        assert order.total_quantity > 0


def test_cost_micros_and_currency_conversion():
    assert cost_micros_to_usd(1_000_000) == 1.0
    assert cost_micros_to_usd(527_000_000) == 527.0
    assert usd_to_cost_micros(1.50) == 1_500_000

    eur_to_usd = convert_currency(100.0, "EUR", "USD")
    assert eur_to_usd == 108.0
    usd_to_usd = convert_currency(50.0, "USD", "USD")
    assert usd_to_usd == 50.0


def test_timestamp_normalization():
    dt1 = normalize_iso_timestamp("2026-03-30")
    assert dt1.year == 2026 and dt1.month == 3 and dt1.day == 30
    assert dt1.tzinfo == timezone.utc

    dt2 = normalize_iso_timestamp("2026-03-30T14:20:00Z")
    assert dt2.hour == 14 and dt2.tzinfo == timezone.utc


def test_product_catalog_resolution():
    sku = default_catalog.resolve_sku("B07Q8Z9101")
    assert sku == "310805-137"
    sku2 = default_catalog.resolve_sku("gid://shopify/ProductVariant/41002")
    assert sku2 == "880848-005"
    mapping = default_catalog.get_by_sku("310805-137")
    assert mapping is not None
    assert mapping.unit_cogs == 58.0


def test_normalization_to_canonical():
    # Meta normalization
    with open(FIXTURES_DIR / "meta_insights_fixture.json") as f:
        meta_data = json.load(f)[0]
    meta_rec = MetaInsightsRecord.model_validate(meta_data)
    unified_meta = normalize_meta_record(meta_rec, "310805-137")
    assert unified_meta.channel == "meta"
    assert unified_meta.sku_id == "310805-137"
    assert unified_meta.spend == meta_rec.spend
    assert unified_meta.net_contribution_margin != 0

    # Google normalization
    with open(FIXTURES_DIR / "google_ads_row_fixture.json") as f:
        google_data = json.load(f)[0]
    google_rec = GoogleAdsRow.model_validate(google_data)
    unified_google = normalize_google_record(google_rec, "310805-137")
    assert unified_google.channel == "google"
    assert unified_google.spend == 527.0
    assert unified_google.roas > 0

    # Amazon normalization
    with open(FIXTURES_DIR / "amazon_sp_report_fixture.json") as f:
        amazon_data = json.load(f)[0]
    amazon_rec = AmazonSponsoredProductsRecord.model_validate(amazon_data)
    unified_amazon = normalize_amazon_record(amazon_rec)
    assert unified_amazon.channel == "amazon"
    assert unified_amazon.sku_id == "310805-137"
    assert unified_amazon.spend == 377.0

    # Shopify order normalization
    with open(FIXTURES_DIR / "shopify_orders_fixture.json") as f:
        shopify_data = json.load(f)[0]
    shopify_order = ShopifyOrder.model_validate(shopify_data)
    unified_shopify = normalize_shopify_order(shopify_order)
    assert len(unified_shopify) == 1
    assert unified_shopify[0].channel == "shopify"
    assert unified_shopify[0].sku_id == "310805-137"
    assert unified_shopify[0].net_revenue == 192.71


def test_duckdb_client_integration(tmp_path):
    db_file = str(tmp_path / "test_warehouse.duckdb")
    client = DuckDBClient(db_path=db_file)

    # Insert canonical record
    record = UnifiedCommerceRecord(
        timestamp="2026-03-30T00:00:00Z",
        channel="meta",
        campaign_id="camp_test_01",
        campaign_name="Test Campaign",
        sku_id="310805-137",
        spend=100.0,
        impressions=5000,
        clicks=100,
        attributed_revenue=300.0,
        units_sold=2,
        gross_revenue=385.42,
        net_revenue=385.42,
        unit_cogs=58.0,
        total_cogs=116.0,
        gross_margin=269.42,
        net_contribution_margin=157.86,
        inventory_on_hand=400,
    )
    record.compute_derived_metrics()

    count = client.insert_unified_records([record])
    assert count == 1

    df = client.query_df("SELECT * FROM unified_commerce_ledger WHERE campaign_id = 'camp_test_01'")
    assert len(df) == 1
    assert df.iloc[0]["spend"] == 100.0
    assert df.iloc[0]["roas"] == 3.0

    summary = client.get_summary_by_channel()
    assert len(summary) >= 1

    # Test Parquet Export & Import
    parquet_file = str(tmp_path / "export.parquet")
    client.export_to_parquet("unified_commerce_ledger", parquet_file)
    assert Path(parquet_file).exists()

    client.close()
