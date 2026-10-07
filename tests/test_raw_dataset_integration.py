"""Unit and integration tests for raw public ad datasets import and reconciliation."""
import json
from pathlib import Path
import pytest
import pandas as pd

from ingest.raw_dataset_importer import RawAdDatasetImporter
from ingest.pipeline import CanonicalPipeline
from ingest.models.meta import MetaAdInsights
from ingest.models.google import GoogleAdsRow
from ingest.models.amazon import AmazonSponsoredProductsRow
from ingest.models.shopify import ShopifyInventoryLevel, ShopifyOrder


@pytest.fixture
def raw_importer():
    return RawAdDatasetImporter()


def test_meta_dataset_transformation(raw_importer):
    models = raw_importer.transform_meta_dataset()
    assert len(models) > 1000, "Should load over 1,000 real Meta ads from Kaggle"
    first = models[0]
    assert isinstance(first, MetaAdInsights)
    assert first.ad_id is not None
    assert first.spend >= 0
    assert first.impressions >= 0
    assert len(first.actions) >= 1


def test_google_dataset_transformation(raw_importer):
    models = raw_importer.transform_google_dataset()
    assert len(models) >= 10, "Should load Google Ads rows from Fivetran seed"
    first = models[0]
    assert isinstance(first, GoogleAdsRow)
    assert first.campaign.name != ""
    assert first.metrics.cost_micros > 0
    assert first.spend > 0


def test_amazon_dataset_transformation(raw_importer):
    models = raw_importer.transform_amazon_dataset()
    assert len(models) >= 5, "Should load Amazon Sponsored Products rows from Fivetran seed"
    first = models[0]
    assert isinstance(first, AmazonSponsoredProductsRow)
    assert first.campaign_id != ""
    assert first.cost >= 0
    assert first.attributed_sales_14d >= 0


def test_shopify_dataset_transformation(raw_importer):
    inv_models, order_models = raw_importer.transform_shopify_dataset()
    assert len(inv_models) >= 5
    assert len(order_models) >= 1
    # Check that stockout condition is present in inventory
    stockout = [inv for inv in inv_models if inv.available == 0]
    assert len(stockout) >= 1, "Must contain at least 1 zero-stock product for safety testing"


def test_end_to_end_reconciliation_and_optimizer():
    payloads_dir = Path("data/payloads")
    pipeline = CanonicalPipeline(data_dir=str(payloads_dir))

    meta_raw = json.loads((payloads_dir / "meta_insights.json").read_text())
    google_raw = json.loads((payloads_dir / "google_ads_rows.json").read_text())
    amazon_raw = json.loads((payloads_dir / "amazon_sponsored_products.json").read_text())
    inv_raw = json.loads((payloads_dir / "shopify_inventory.json").read_text())

    meta_models = pipeline.validate_meta_payloads(meta_raw)
    google_models = pipeline.validate_google_payloads(google_raw)
    amazon_models = pipeline.validate_amazon_payloads(amazon_raw)
    inv_models = pipeline.validate_shopify_inventory(inv_raw)

    metrics_df = pipeline.reconcile_to_metrics(meta_models, google_models, amazon_models, inv_models)
    assert not metrics_df.empty
    assert "spend" in metrics_df.columns
    assert "margin" in metrics_df.columns
    assert "platform" in metrics_df.columns
    assert set(metrics_df["platform"].unique()) == {"meta", "google", "amazon"}

    # Test optimizer output
    recs = pipeline.run_optimization(metrics_df)
    assert not recs.empty
    assert "campaign" in recs.columns
    assert "recommended_daily_spend" in recs.columns
    assert "stockout_kill" in recs.columns

    # Verify that stockout kill flag correctly zeros out the stocked out campaign
    killed = recs[recs["stockout_kill"]]
    assert len(killed) >= 1
    for _, k in killed.iterrows():
        assert k["recommended_daily_spend"] == 0.0
