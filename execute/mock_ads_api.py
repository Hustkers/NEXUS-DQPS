"""Production Mock Ad APIs for Meta, Google, and Amazon Advertising & Strategy Engine.

Emulates endpoint-exact responses and 50ms network latency for:
- Meta Graph API: POST /act_{id}/campaigns
- Google Ads API: POST /customers/{id}/campaigns:mutate
- Amazon Ads API: PUT /sp/campaigns
- AI Strategy Engine Endpoints: /strategy/*
"""
from __future__ import annotations

from dataclasses import asdict
import time
import uuid
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field

from learn.ledger import LedgerEntry, add_entry
from decide.strategy_engine import (
    CampaignConfig,
    generate_strategies,
    rank_and_evaluate_all,
    compare_strategies,
)

app = FastAPI(title="NEXUS-DQPS Mock Advertising Platform Gateway & Strategy Engine")

_active_campaign_budgets: Dict[str, float] = {}
_execution_log: List[Dict[str, Any]] = []
_applied: list[dict] = []
_campaign_store: dict[str, dict[str, Any]] = {}


# -------------------------------------------------------------------------
# Legacy Apply Endpoint
# -------------------------------------------------------------------------

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


# -------------------------------------------------------------------------
# Meta Graph API Endpoint: POST /v19.0/act_{account_id}/campaigns
# -------------------------------------------------------------------------

class MetaCampaignUpdateRequest(BaseModel):
    campaign_id: str = Field(..., alias="id")
    daily_budget: float
    status: Optional[str] = "ACTIVE"


class MetaCampaignUpdateResponse(BaseModel):
    success: bool = True
    id: str
    updated_daily_budget: float


@app.post("/v19.0/act_{account_id}/campaigns", response_model=MetaCampaignUpdateResponse)
def update_meta_campaign(account_id: str, payload: MetaCampaignUpdateRequest):
    time.sleep(0.05)
    _active_campaign_budgets[payload.campaign_id] = payload.daily_budget
    receipt = {
        "platform": "meta",
        "account_id": account_id,
        "campaign_id": payload.campaign_id,
        "daily_budget": payload.daily_budget,
        "timestamp": time.time(),
        "status": "SUCCESS",
    }
    _execution_log.append(receipt)
    return MetaCampaignUpdateResponse(
        success=True,
        id=payload.campaign_id,
        updated_daily_budget=payload.daily_budget,
    )


# -------------------------------------------------------------------------
# Google Ads API Endpoint: POST /v16/customers/{customer_id}/campaigns:mutate
# -------------------------------------------------------------------------

class GoogleCampaignMutateOperation(BaseModel):
    resource_name: str
    amount_micros: int


class GoogleCampaignMutateRequest(BaseModel):
    operations: List[GoogleCampaignMutateOperation]


class GoogleCampaignMutateResponse(BaseModel):
    results: List[Dict[str, str]]


@app.post("/v16/customers/{customer_id}/campaigns:mutate", response_model=GoogleCampaignMutateResponse)
def mutate_google_campaigns(customer_id: str, payload: GoogleCampaignMutateRequest):
    time.sleep(0.05)
    results = []
    for op in payload.operations:
        camp_id = op.resource_name.split("/")[-1]
        spend_usd = op.amount_micros / 1_000_000.0
        _active_campaign_budgets[camp_id] = spend_usd
        _execution_log.append({
            "platform": "google",
            "customer_id": customer_id,
            "campaign_id": camp_id,
            "daily_budget": spend_usd,
            "cost_micros": op.amount_micros,
            "timestamp": time.time(),
            "status": "MUTATED",
        })
        results.append({"resource_name": op.resource_name, "status": "MUTATED"})
    return GoogleCampaignMutateResponse(results=results)


# -------------------------------------------------------------------------
# Amazon Ads API Endpoint: PUT /sp/campaigns
# -------------------------------------------------------------------------

class AmazonSPCampaignUpdate(BaseModel):
    campaign_id: str = Field(..., alias="campaignId")
    daily_budget: float = Field(..., alias="dailyBudget")
    state: Optional[str] = "ENABLED"


class AmazonSPBatchUpdateRequest(BaseModel):
    campaigns: List[AmazonSPCampaignUpdate]


class AmazonSPBatchUpdateResponse(BaseModel):
    responses: List[Dict[str, Any]]


@app.put("/sp/campaigns", response_model=AmazonSPBatchUpdateResponse)
def update_amazon_campaigns(payload: AmazonSPBatchUpdateRequest):
    time.sleep(0.05)
    responses = []
    for c in payload.campaigns:
        _active_campaign_budgets[c.campaign_id] = c.daily_budget
        _execution_log.append({
            "platform": "amazon",
            "campaign_id": c.campaign_id,
            "daily_budget": c.daily_budget,
            "state": c.state,
            "timestamp": time.time(),
            "status": "UPDATED",
        })
        responses.append({
            "campaignId": c.campaign_id,
            "code": "SUCCESS",
            "dailyBudget": c.daily_budget
        })
    return AmazonSPBatchUpdateResponse(responses=responses)


@app.get("/execution/log")
def get_execution_log():
    return {"count": len(_execution_log), "events": _execution_log}


# -------------------------------------------------------------------------
# AI Strategy Engine Endpoints
# -------------------------------------------------------------------------

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
    matching = [s for s in camp_data["strategies"] if s["strategy_id"] in payload.strategy_ids]
    if not matching:
        raise HTTPException(status_code=400, detail="No matching strategies found")

    return {
        "count": len(matching),
        "strategies": matching,
    }
