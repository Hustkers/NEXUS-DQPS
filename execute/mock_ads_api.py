"""Mock ad-platform execution API: applies budget changes to the simulated world and provides Strategy Engine endpoints."""
from __future__ import annotations
from dataclasses import asdict
import uuid
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from learn.ledger import LedgerEntry, add_entry
from decide.strategy_engine import (
    CampaignConfig,
    generate_strategies,
    rank_and_evaluate_all,
    compare_strategies,
)

app = FastAPI(title="DQPS Mock Ad API & Strategy Engine")

_applied: list[dict] = []
_campaign_store: dict[str, dict[str, Any]] = {}


class Action(BaseModel):
    campaign: str
    new_daily_spend: float
    expected_daily_margin: float
    confidence: float = 0.8


@app.post("/apply")
def apply(action: Action):
    _applied.append(action.model_dump())
    add_entry(
        LedgerEntry(
            decision=f"set {action.campaign} spend -> ${action.new_daily_spend:.0f}/day",
            expected_margin=action.expected_daily_margin,
            realized_margin=action.expected_daily_margin * 0.92,
            confidence=action.confidence,
            status="executed",
        )
    )
    return {"status": "ok", "applied": action.model_dump()}


@app.get("/applied")
def applied():
    return _applied


# ============================================================================
# FASTAPI STRATEGY ENGINE ENDPOINTS
# ============================================================================

class CampaignCreateRequest(BaseModel):
    campaign_name: str
    product_service: str
    target_audience: str
    target_location: str
    industry_category: str
    total_budget: float
    campaign_duration: int
    objective: str = "CONVERSIONS"
    preferred_platforms: list[str] = ["meta", "google", "amazon", "tiktok"]
    product_price: float | None = None
    historical_data: dict[str, Any] | None = None
    constraints: dict[str, Any] | None = None


class CompareRequest(BaseModel):
    strategy_ids: list[str]


@app.post("/strategy/campaign")
def create_strategy_campaign(payload: CampaignCreateRequest):
    campaign_id = f"cmp-{uuid.uuid4().hex[:8]}"
    config = CampaignConfig(
        campaign_id=campaign_id,
        campaign_name=payload.campaign_name,
        product_service=payload.product_service,
        target_audience=payload.target_audience,
        target_location=payload.target_location,
        industry_category=payload.industry_category,
        total_budget=payload.total_budget,
        campaign_duration=payload.campaign_duration,
        objective=payload.objective,
        preferred_platforms=payload.preferred_platforms,
        product_price=payload.product_price,
        historical_data=payload.historical_data or {},
        constraints=payload.constraints or {},
    )

    raw_strats = generate_strategies(config)
    ranked, top_3 = rank_and_evaluate_all(raw_strats, config)

    _campaign_store[campaign_id] = {
        "campaign_id": campaign_id,
        "config": asdict(config),
        "strategies": [asdict(s) for s in ranked],
        "top_3": [asdict(s) for s in top_3],
    }

    return {
        "status": "success",
        "campaign_id": campaign_id,
        "total_strategies": len(ranked),
        "top_3_recommendations": [asdict(s) for s in top_3],
        "all_strategies": [asdict(s) for s in ranked],
    }


@app.get("/strategy/campaigns")
def list_strategy_campaigns():
    return [
        {
            "campaign_id": cid,
            "campaign_name": data["config"]["campaign_name"],
            "total_budget": data["config"]["total_budget"],
            "strategy_count": len(data["strategies"]),
        }
        for cid, data in _campaign_store.items()
    ]


@app.get("/strategy/campaign/{campaign_id}")
def get_strategy_campaign(campaign_id: str):
    if campaign_id not in _campaign_store:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return _campaign_store[campaign_id]


@app.get("/strategy/campaign/{campaign_id}/strategies")
def get_campaign_strategies(campaign_id: str):
    if campaign_id not in _campaign_store:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return _campaign_store[campaign_id]["strategies"]


@app.get("/strategy/campaign/{campaign_id}/recommendations")
def get_campaign_recommendations(campaign_id: str):
    if campaign_id not in _campaign_store:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return _campaign_store[campaign_id]["top_3"]


@app.get("/strategy/campaign/{campaign_id}/strategies/{strategy_id}")
def get_single_strategy(campaign_id: str, strategy_id: str):
    if campaign_id not in _campaign_store:
        raise HTTPException(status_code=404, detail="Campaign not found")
    for s in _campaign_store[campaign_id]["strategies"]:
        if s["strategy_id"] == strategy_id:
            return s
    raise HTTPException(status_code=404, detail="Strategy not found")


@app.post("/strategy/campaign/{campaign_id}/compare")
def compare_campaign_strategies(campaign_id: str, payload: CompareRequest):
    if campaign_id not in _campaign_store:
        raise HTTPException(status_code=404, detail="Campaign not found")

    camp_data = _campaign_store[campaign_id]
    # Reconstruct CampaignStrategy objects or compare directly
    matching = [s for s in camp_data["strategies"] if s["strategy_id"] in payload.strategy_ids]
    if not matching:
        raise HTTPException(status_code=400, detail="No matching strategies found")

    return {
        "count": len(matching),
        "strategies": matching,
    }
