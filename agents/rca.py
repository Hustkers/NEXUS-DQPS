"""LLM-powered root-cause analysis (RCA) agent.

Integrates with Google Cloud API (Gemini) via GoogleCloudClient to synthesize
mathematical causal attribution scores and counterfactual Shapley values
into natural language executive explanations.
"""

from __future__ import annotations

import json
from typing import Any, Dict, Optional
from agents.cloud_client import GoogleCloudClient
from diagnose.attribution import CausalAttributionResult

_cloud_client: Optional[GoogleCloudClient] = None


def get_cloud_client() -> GoogleCloudClient:
    global _cloud_client
    if _cloud_client is None:
        _cloud_client = GoogleCloudClient()
    return _cloud_client


def synthesize_causal_explanation(
    attribution: CausalAttributionResult,
    campaign_name: str,
    sku_id: str,
) -> Dict[str, Any]:
    """Generate executive causal briefing from mathematical attribution."""
    client = get_cloud_client()

    prompt = f"""You are the NEXUS-DQPS D2C Executive Chief Operating Intelligence.
Analyze the following counterfactual structural causal attribution results:
- Campaign: {campaign_name}
- SKU: {sku_id}
- Primary Root Cause: {attribution.primary_root_cause} (Confidence: {attribution.confidence:.0%})
- Total Contribution Margin Loss: ${attribution.total_margin_loss:,.2f}
- Observed Margin: ${attribution.observed_margin:,.2f} vs Counterfactual Baseline: ${attribution.counterfactual_baseline_margin:,.2f}
- Shapley Attribution Breakdown: {json.dumps(attribution.shapley_attributions)}
- Dollar Impacts: {json.dumps(attribution.dollar_impacts)}

Provide a structured, numbers-focused 2-sentence executive diagnosis, commercial action, and projected margin recovery.
"""

    resp_text = client.generate_content(prompt)
    try:
        data = json.loads(resp_text)
        if isinstance(data, dict) and "root_cause" in data:
            return data
    except Exception:
        pass

    return {
        "root_cause": attribution.primary_root_cause,
        "confidence": attribution.confidence,
        "summary": attribution.explanation,
        "commercial_action": "REALLOCATE_BUDGET" if attribution.primary_root_cause == "INVENTORY_STOCKOUT" else "MAINTAIN",
        "recommended_action_text": f"Shift ad budget away from {attribution.primary_root_cause.lower()} bottleneck.",
        "projected_margin_recovery": round(attribution.total_margin_loss * 0.85, 2),
    }


def explain(campaign: str, date, factors: dict) -> str:
    """Legacy helper for backward compatibility."""
    bits = []
    if factors.get("inventory_stockout"):
        bits.append("SKU stocked out in Shopify (conversions collapsed)")
    if abs(factors.get("cpm", 0)) > 0.2:
        bits.append(f"CPM shifted {factors['cpm']:+.0%}")
    if abs(factors.get("cvr", 0)) > 0.2:
        bits.append(f"CVR shifted {factors['cvr']:+.0%}")
    cause = "; ".join(bits) or "minor stochastic variance"
    return f"Campaign {campaign} on {date}: ROAS moved {factors.get('roas_delta', 0):+.0%}. Primary causal drivers: {cause}."
