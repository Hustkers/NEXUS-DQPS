"""Integration tests for FastAPI optimizer endpoints."""

import pytest
from starlette.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_optimizer_curves_parameters_endpoint():
    resp = client.get("/api/v1/optimize/curves/parameters")
    assert resp.status_code == 200
    data = resp.json()
    assert "meta" in data
    assert "google" in data
    assert "amazon" in data
    assert "shopify" in data
    assert data["amazon"]["beta"] > 0
    assert data["amazon"]["eta"] > 0


def test_optimizer_curve_sampling_endpoint():
    payload = {"channel": "amazon", "max_spend": 50000.0, "points": 25}
    resp = client.post("/api/v1/optimize/curves/sample", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["channel"] == "amazon"
    assert len(data["samples"]) == 25
    assert data["samples"][0]["spend"] == 0.0
    assert data["samples"][0]["expected_revenue"] == 0.0


def test_optimizer_duckdb_reallocation_endpoint():
    resp = client.post("/api/v1/optimize/reallocate", json={"roas_floor": 1.80})
    assert resp.status_code == 200
    data = resp.json()
    assert data["solver_status"] in ("CONVERGED", "APPROXIMATED")
    assert data["margin_lift"] > 0
    assert len(data["throttled_stockouts"]) > 0
    assert len(data["campaign_reallocations"]) == 40
