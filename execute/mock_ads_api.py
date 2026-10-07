"""Mock ad-platform execution API: applies budget changes to the simulated world."""
from __future__ import annotations

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
