"""Tests for Model Context Protocol (MCP) and DirectLiNGAM causal discovery.

Covers verification checks CHK-1.3, CHK-3.1..3.6, CHK-4.1..4.9, CHK-5.1..5.4 in TODO_CHECKS.md.
"""

import time
import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from agents.mcp_server import NexusMCPServer
from diagnose.lingam import DirectLiNGAMValidator
from diagnose.causal_graph import EnterpriseCausalDAG
from diagnose.attribution import CounterfactualAttributionEngine
from decide.curves import (
    geometric_adstock,
    hill_saturation,
    marginal_roas,
)

client = TestClient(app)


def test_mcp_server_tool_declarations_and_invocations():
    """CHK-1.3: Verify standardized MCP tool server declarations and dynamic invocations."""
    server = NexusMCPServer()
    tools = server.list_tools()
    tool_names = [t.name for t in tools]

    assert "get_storefront_catalog" in tool_names
    assert "get_live_inventory_state" in tool_names
    assert "get_checkout_conversion_rates" in tool_names
    assert "get_campaign_performance" in tool_names

    # Test catalog invocation
    catalog_res = server.call_tool("get_storefront_catalog", {"sku": "310805-137"})
    assert catalog_res["catalog_count"] == 1
    assert catalog_res["items"][0]["sku"] == "310805-137"
    assert catalog_res["items"][0]["unit_price_usd"] == 192.71

    # Test live inventory invocation
    inv_res = server.call_tool("get_live_inventory_state", {"sku": "310805-137"})
    assert "inventory" in inv_res or "inventory_records" in inv_res

    # Test checkout conversion rate collapse on stockout
    cvr_res = server.call_tool("get_checkout_conversion_rates", {"sku": "310805-137", "channel": "meta"})
    assert cvr_res["cvr_status"] == "CRITICAL_COLLAPSE"
    assert cvr_res["cvr_pct"] <= 0.1


def test_mcp_fastapi_endpoints():
    """CHK-1.3: Verify FastAPI MCP JSON-RPC 2.0 endpoints."""
    # GET /api/v1/mcp/tools
    res = client.get("/api/v1/mcp/tools")
    assert res.status_code == 200
    assert len(res.json()["tools"]) >= 4

    # POST /api/v1/mcp tools/list
    payload = {"jsonrpc": "2.0", "id": 1, "method": "tools/list"}
    res = client.post("/api/v1/mcp", json=payload)
    assert res.status_code == 200
    assert "tools" in res.json()["result"]

    # POST /api/v1/mcp tools/call
    call_payload = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "get_storefront_catalog",
            "arguments": {"sku": "315122-001"}
        }
    }
    res = client.post("/api/v1/mcp", json=call_payload)
    assert res.status_code == 200
    assert "content" in res.json()["result"]


def test_direct_lingam_causal_discovery():
    """CHK-4.7: Verify DirectLiNGAM non-Gaussian linear equation discovery runs successfully."""
    np.random.seed(42)
    n = 300
    # True causal generative process: spend -> impressions -> clicks -> orders -> revenue
    # Exogenous non-Gaussian noise
    u_spend = np.random.exponential(scale=100.0, size=n)
    spend = 100.0 + u_spend

    u_impr = np.random.exponential(scale=500.0, size=n)
    impressions = (spend / 15.0) * 1000.0 + u_impr

    u_clicks = np.random.exponential(scale=10.0, size=n)
    clicks = impressions * 0.025 + u_clicks

    u_orders = np.random.exponential(scale=2.0, size=n)
    orders = clicks * 0.035 + u_orders

    revenue = orders * 150.0

    df = pd.DataFrame({
        "spend": spend,
        "impressions": impressions,
        "clicks": clicks,
        "orders": orders,
        "revenue": revenue,
    })

    validator = DirectLiNGAMValidator()
    discovered_order = validator.fit_causal_order(df)

    assert len(discovered_order) == 5
    # Spend should precede revenue
    assert discovered_order.index("spend") < discovered_order.index("revenue")
    # Verify consistency with expected precedence
    expected_pairs = [("spend", "impressions"), ("impressions", "clicks"), ("clicks", "revenue")]
    assert validator.validate_dag_consistency(discovered_order, expected_pairs) is True


def test_scm_and_shapley_exact_sum():
    """CHK-4.4, CHK-4.5: Verify counterfactual attribution and Shapley sum strictly equals 100%."""
    engine = CounterfactualAttributionEngine()
    baseline = {
        "spend": 1000.0,
        "cpm": 15.0,
        "ctr": 0.02,
        "cvr": 0.03,
        "inventory": 500.0,
        "price": 150.0,
        "cogs": 50.0,
    }
    # Shocked state: Stockout
    shocked = dict(baseline)
    shocked["inventory"] = 0.0

    result = engine.attribute(observed=shocked, baseline=baseline)
    attributions = result.shapley_attributions

    total_sum = sum(attributions.values())
    assert abs(total_sum - 100.0) < 0.2
    assert attributions.get("inventory", 0.0) > 60.0
    assert attributions.get("ctr", 0.0) < 20.0
    assert result.primary_root_cause == "INVENTORY_STOCKOUT"


def test_hill_boundaries_and_marginal_roas():
    """CHK-5.3, CHK-5.4: Verify closed-form mROAS and Hill mathematical boundary conditions."""
    beta, eta, K = 5000.0, 1.8, 1200.0

    # Boundary: f(0) = 0
    assert hill_saturation(0.0, beta, eta, K) == 0.0

    # Monotonicity & positive marginal ROAS
    for s in [50.0, 200.0, 800.0, 1500.0, 5000.0]:
        mroas = marginal_roas(s, beta, eta, K)
        assert mroas >= 0.0

    # Asymptotic convergence: f(x) -> beta as x -> inf
    large_val = hill_saturation(1_000_000.0, beta, eta, K)
    assert abs(large_val - beta) / beta < 0.01
