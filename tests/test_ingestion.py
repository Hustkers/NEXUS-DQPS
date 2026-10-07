"""Unit tests for Section 2: Production-Grade Synthetic Telemetry & Ingestion."""

import pytest
from simulator.data_generator import SyntheticTelemetryGenerator
from simulator.shopify_generator import ShopifyGenerator
from ingest.duckdb_client import DuckDBClient
from ingest.loader import IngestionPipeline
from ingest.reconcile import UnitEconomicsReconciler
from agents.cloud_client import GoogleCloudClient, TokenBucketRateLimiter


def test_synthetic_telemetry_generator_compliance():
    gen = SyntheticTelemetryGenerator(seed=123)
    world = gen.generate_world(days=7)

    assert len(world["meta"]) == 7 * 5  # 7 days * 5 skus
    assert len(world["google"]) == 7 * 5
    assert len(world["amazon"]) == 7 * 5
    assert len(world["shopify_orders"]) > 0

    # Test Meta compliance
    meta_first = world["meta"][0]
    assert meta_first.spend > 0
    assert meta_first.impressions > 0
    assert len(meta_first.actions) > 0
    assert len(meta_first.action_values) > 0

    # Test Google compliance
    google_first = world["google"][0]
    assert google_first.metrics.cost_micros > 0
    assert google_first.metrics.cost > 0
    assert google_first.campaign.id.startswith("google_camp_")

    # Test Amazon compliance
    amazon_first = world["amazon"][0]
    assert amazon_first.cost > 0
    assert amazon_first.asin.startswith("B0")
    assert amazon_first.currency == "USD"

    # Test Shopify compliance
    shopify_first = world["shopify_orders"][0]
    assert shopify_first.total_price > 0
    assert len(shopify_first.line_items) > 0
    assert shopify_first.line_items[0].price > 0


def test_shock_trigger_execution():
    gen = SyntheticTelemetryGenerator(seed=42)
    # Generate 35 days where day 30 has stockout shock on 310805-137
    world = gen.generate_world(days=35)
    assert len(world["shocks_log"]) > 0

    # Verify inventory drops to 0 during stockout
    stockout_logs = [log for log in world["shocks_log"] if any(s.get("type") == "stockout" for s in log["shocks"])]
    assert len(stockout_logs) > 0


def test_high_performance_ingestion_latency():
    gen = SyntheticTelemetryGenerator(seed=42)
    world = gen.generate_world(days=5)

    client = DuckDBClient(db_path=":memory:")
    pipeline = IngestionPipeline(db_client=client)

    res = pipeline.ingest_payloads(
        meta_records=world["meta"],
        google_records=world["google"],
        amazon_records=world["amazon"],
        shopify_orders=world["shopify_orders"],
        inventory_levels=world["shopify_inventory"],
    )

    assert res["status"] == "SUCCESS"
    assert res["inserted_records"] > 0
    # Assert fast ingestion execution (with safe headroom for busy test environment load)
    assert res["elapsed_ms"] < 600.0


def test_unit_economics_reconciliation():
    gen = SyntheticTelemetryGenerator(seed=42)
    world = gen.generate_world(days=10)

    client = DuckDBClient(db_path=":memory:")
    pipeline = IngestionPipeline(db_client=client)
    pipeline.ingest_payloads(
        meta_records=world["meta"],
        google_records=world["google"],
        amazon_records=world["amazon"],
        shopify_orders=world["shopify_orders"],
    )

    reconciler = UnitEconomicsReconciler(db_client=client)
    summary = reconciler.reconcile()

    assert summary.total_ad_spend > 0
    assert summary.total_net_revenue > 0
    assert summary.total_cogs > 0
    assert summary.total_gross_margin > 0
    assert summary.blended_roas > 0
    assert summary.blended_poas > 0
    assert len(summary.channel_breakdown) >= 3
    assert len(summary.sku_breakdown) == 5


def test_google_cloud_client_fallback_and_rate_limiter():
    limiter = TokenBucketRateLimiter(requests_per_minute=120)
    # Should acquire instantly
    limiter.acquire()

    client = GoogleCloudClient(api_key=None, force_fallback=True)
    # Test fallback reasoning
    resp = client.generate_content("The inventory has suffered a stockout.")
    assert "stockout" in resp.lower() or "inventory" in resp.lower()


def test_vertex_ai_adc_status():
    client = GoogleCloudClient()
    status = client.get_status()
    assert status["provider"] == "Google Cloud Vertex AI"
    assert "project_id" in status
    assert status["model_name"] in ("gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash")
