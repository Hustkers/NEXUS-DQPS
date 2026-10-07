"""Unit and Integration Tests for Ad Playground Recommendation Engine."""
from dataclasses import asdict
import numpy as np
import pandas as pd
import pytest

from decide.ad_playground import AdPlaygroundEngine, default_playground_engine
from simulator.generator import build_world


@pytest.fixture(scope="module")
def engine_with_data():
    world = build_world(days=30)
    return AdPlaygroundEngine(metrics_df=world["metrics"])


def test_get_available_products(engine_with_data):
    prods = engine_with_data.get_available_products()
    assert len(prods) >= 10
    first = prods[0]
    assert "sku" in first
    assert "name" in first
    assert "price" in first
    assert "inventory" in first
    assert "grossMarginPct" in first


def test_generate_10_candidates(engine_with_data):
    res = engine_with_data.generate_recommendations(
        sku="AH8050-100",
        total_budget=5000.0,
        duration_days=14,
        target_roas_floor=1.8,
    )
    assert res.sku == "AH8050-100"
    assert len(res.candidates) == 10
    assert res.candidates[0].rank == 1
    assert res.candidates[0].is_recommended is True


def test_profit_ranking_order(engine_with_data):
    res = engine_with_data.generate_recommendations(
        sku="310805-137",
        total_budget=6000.0,
        duration_days=14,
    )
    profits = [c.predicted_net_profit for c in res.candidates]
    # Verify strictly sorted descending
    assert profits == sorted(profits, reverse=True)


def test_profit_calculation_integrity(engine_with_data):
    res = engine_with_data.generate_recommendations(
        sku="880848-005",
        total_budget=4000.0,
        duration_days=14,
    )
    margin_ratio = res.gross_margin_pct / 100.0
    for c in res.candidates:
        if not c.stockout_risk:
            assert pytest.approx(c.predicted_net_profit, abs=0.05) == round(c.predicted_gross_margin - c.expected_spend, 2)
            assert pytest.approx(c.predicted_gross_margin, rel=1e-2) == round(c.predicted_revenue * margin_ratio, 2)


def test_platform_filtering(engine_with_data):
    res = engine_with_data.generate_recommendations(
        sku="AH8050-100",
        total_budget=5000.0,
        platform_filter=["meta", "google"],
    )
    for c in res.candidates:
        assert c.platform in ["meta", "google"]


def test_stockout_risk_detection():
    # Construct DataFrame with 0 inventory
    rows = [
        {
            "date": pd.Timestamp("2026-08-01"),
            "platform": "meta",
            "campaign": "meta-ZERO-INV",
            "sku": "ZERO-INV",
            "spend": 500.0,
            "cpm": 10.0,
            "impressions": 50000,
            "conversions": 0,
            "revenue": 0.0,
            "margin": 0.0,
            "inventory": 0,
            "price": 100.0,
            "ga_sessions": 1000,
        }
    ]
    df = pd.DataFrame(rows)
    engine = AdPlaygroundEngine(metrics_df=df)
    res = engine.generate_recommendations(sku="ZERO-INV", total_budget=3000.0)
    assert res.inventory == 0
    # In stockout, all candidates should flag stockout risk
    assert all(c.stockout_risk for c in res.candidates)
    # Net profit should be penalized (<= 0)
    assert all(c.predicted_net_profit <= 0 for c in res.candidates)


def test_unknown_sku_graceful_fallback(engine_with_data):
    res = engine_with_data.generate_recommendations(sku="UNKNOWN-SKU-999")
    assert res.data_quality_warning is not None
    assert len(res.candidates) == 10
    assert res.candidates[0].predicted_net_profit > 0


def test_explainability_and_key_drivers(engine_with_data):
    res = engine_with_data.generate_recommendations(sku="315122-001")
    for c in res.candidates:
        assert len(c.explanation) > 10
        assert len(c.key_drivers) >= 1
        assert c.bidding_strategy
        assert c.audience_segment
