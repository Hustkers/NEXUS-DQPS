import pytest
import pandas as pd
from ingest.connectors.shopify import ShopifyConnector
from ingest.connectors.meta import MetaAdsConnector
from ingest.connectors.google import GoogleAdsConnector
from ingest.connectors.amazon import AmazonAdsConnector
from ingest.connectors.reconcile import LiveReconciliationEngine


def test_connector_unconfigured_defaults():
    s = ShopifyConnector(store_domain="your-store.myshopify.com", access_token="shpat_xxxx")
    assert not s.is_configured

    m = MetaAdsConnector(access_token="", ad_account_id="act_")
    assert not m.is_configured

    g = GoogleAdsConnector(developer_token="", customer_id="")
    assert not g.is_configured

    a = AmazonAdsConnector(client_id="", refresh_token="")
    assert not a.is_configured


def test_connector_status_audit():
    engine = LiveReconciliationEngine()
    status = engine.check_channel_status()
    assert set(status.keys()) == {"shopify", "meta", "google", "amazon"}
    for p, st in status.items():
        assert "configured" in st
        assert "test" in st


def test_infer_sku_matching():
    engine = LiveReconciliationEngine()
    skus = ["315122-001", "AH8050-100", "CD4371-001"]
    assert engine._infer_sku("meta-315122-001-retargeting", skus) == "315122-001"
    assert engine._infer_sku("google-shopping-AH8050-100", skus) == "AH8050-100"
