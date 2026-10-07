"""Tests for Google Cloud Vertex AI integration using Application Default Credentials."""

import pytest
from starlette.testclient import TestClient

from app.main import app
from agents.cloud_client import GoogleCloudClient


client = TestClient(app)


def test_vertex_ai_status_endpoint():
    """Verify that the FastAPI endpoint exposes the Google Cloud Vertex AI ADC status."""
    resp = client.get("/api/v1/ai/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["provider"] == "Google Cloud Vertex AI"
    assert "project_id" in data
    assert "location" in data
    assert data["location"] == "us-central1"
    assert data["model_name"] in ("gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash")
    assert data["auth_method"] in ("APPLICATION_DEFAULT_CREDENTIALS", "OFFLINE_FALLBACK", "API_KEY")


def test_vertex_ai_generate_endpoint_live():
    """Verify that generateContent communicates with Google Cloud Vertex AI via ADC or offline fallback."""
    resp = client.post(
        "/api/v1/ai/generate",
        json={"prompt": "Respond with 3 words: Ready for duty."},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "content" in data
    assert len(data["content"]) > 0
    assert data["auth_method"] in ("APPLICATION_DEFAULT_CREDENTIALS", "OFFLINE_FALLBACK", "API_KEY")
    assert data["provider"] == "Google Cloud Vertex AI"


def test_vertex_ai_rca_endpoint():
    """Verify that the RCA synthesis endpoint produces structured executive briefings."""
    payload = {
        "campaign_name": "Meta Advantage+ Hero Shoe",
        "sku_id": "310805-137",
        "primary_root_cause": "INVENTORY_STOCKOUT",
        "confidence": 0.95,
        "total_margin_loss": 3480.0,
        "observed_margin": 1200.0,
        "counterfactual_baseline_margin": 4680.0,
        "shapley_attributions": {"inventory_stockout": -0.66, "cpm_drift": -0.12},
        "dollar_impacts": {"inventory_stockout": -2296.8, "cpm_drift": -417.6},
    }
    resp = client.post("/api/v1/ai/rca", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "root_cause" in data
    assert "summary" in data
    assert "projected_margin_recovery" in data
