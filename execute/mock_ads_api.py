"""Production Mock Ad APIs for Meta, Google, and Amazon Advertising.

Emulates endpoint-exact responses and 50ms network latency for:
- Meta Graph API: POST /act_{id}/campaigns
- Google Ads API: POST /customers/{id}/campaigns:mutate
- Amazon Ads API: PUT /sp/campaigns
"""

from __future__ import annotations

import time
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field

app = FastAPI(title="NEXUS-DQPS Mock Advertising Platform Gateway")

_active_campaign_budgets: Dict[str, float] = {}
_execution_log: List[Dict[str, Any]] = []


# -------------------------------------------------------------------------
# Meta Graph API Endpoint: POST /v19.0/act_{account_id}/campaigns
# -------------------------------------------------------------------------

class MetaCampaignUpdateRequest(BaseModel):
    campaign_id: str = Field(..., alias="id")
    daily_budget: float  # In dollars or cents
    status: Optional[str] = "ACTIVE"


class MetaCampaignUpdateResponse(BaseModel):
    success: bool = True
    id: str
    updated_daily_budget: float


@app.post("/v19.0/act_{account_id}/campaigns", response_model=MetaCampaignUpdateResponse)
def update_meta_campaign(account_id: str, payload: MetaCampaignUpdateRequest):
    time.sleep(0.05)  # 50ms latency emulation
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
    resource_name: str  # customers/{customer_id}/campaigns/{campaign_id}
    amount_micros: int


class GoogleCampaignMutateRequest(BaseModel):
    operations: List[GoogleCampaignMutateOperation]


class GoogleCampaignMutateResponse(BaseModel):
    results: List[Dict[str, str]]


@app.post("/v16/customers/{customer_id}/campaigns:mutate", response_model=GoogleCampaignMutateResponse)
def mutate_google_campaigns(customer_id: str, payload: GoogleCampaignMutateRequest):
    time.sleep(0.05)  # 50ms latency emulation
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
def update_amazon_sp_campaigns(payload: AmazonSPBatchUpdateRequest):
    time.sleep(0.05)  # 50ms latency emulation
    responses = []
    for c in payload.campaigns:
        _active_campaign_budgets[c.campaign_id] = c.daily_budget
        _execution_log.append({
            "platform": "amazon",
            "campaign_id": c.campaign_id,
            "daily_budget": c.daily_budget,
            "timestamp": time.time(),
            "status": "SUCCESS",
        })
        responses.append({
            "campaignId": c.campaign_id,
            "code": "SUCCESS",
            "updatedDailyBudget": c.daily_budget,
        })
    return AmazonSPBatchUpdateResponse(responses=responses)


@app.get("/api/v1/mock_gateway/state")
def get_gateway_state():
    return {
        "active_budgets": _active_campaign_budgets,
        "execution_history": _execution_log,
    }


def reset_mock_state():
    _active_campaign_budgets.clear()
    _execution_log.clear()
