"""Mock ad-platform execution API: applies budget changes to the simulated world."""
from __future__ import annotations

from typing import Any, List, Optional
from fastapi import FastAPI
from pydantic import BaseModel

from learn.ledger import LedgerEntry, add_entry

app = FastAPI(title="DQPS Mock Ad API")

_applied: list[dict] = []


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
            realized_margin=action.expected_daily_margin * 0.92,  # simulated realized ~92% of expected
            confidence=action.confidence,
            status="executed",
        )
    )
    return {"status": "ok", "applied": action.model_dump()}


@app.get("/applied")
def applied():
    return _applied


class PlaygroundRecommendRequest(BaseModel):
    sku: str = "310805-137"
    total_budget: float = 5000.0
    duration_days: int = 14
    target_roas_floor: float = 1.8
    platforms: Optional[List[str]] = None
    strategy_focus: str = "MAX_PROFIT"


Action.model_rebuild()
PlaygroundRecommendRequest.model_rebuild()


@app.get("/playground/products")
def get_playground_products():
    from decide.ad_playground import default_playground_engine
    return default_playground_engine.get_available_products()


@app.post("/playground/recommend")
def recommend_playground(req: PlaygroundRecommendRequest):
    from dataclasses import asdict
    from decide.ad_playground import default_playground_engine
    result = default_playground_engine.generate_recommendations(
        sku=req.sku,
        total_budget=req.total_budget,
        duration_days=req.duration_days,
        target_roas_floor=req.target_roas_floor,
        platform_filter=req.platforms,
        strategy_focus=req.strategy_focus,
    )
    return asdict(result)
