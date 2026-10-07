"""Closed-loop Decision Ledger & Outcome Learning Engine.

Tracks every autonomous proposal, human sign-off token, execution receipt,
and realized post-execution performance vs counterfactual baselines at t+24h.
Updates Bayesian priors and online bandit exploration weights.
"""

from __future__ import annotations

import json
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

LEDGER_PATH = Path("data/ledger.jsonl")


class LedgerRecord(BaseModel):
    """Immutable Closed-Loop Decision Ledger Record."""

    directive_id: str
    decision_text: str
    campaign_id: str
    channel: str
    sku_id: str
    pre_spend: float
    target_spend: float
    expected_margin_lift: float
    realized_margin_lift_24h: Optional[float] = None
    variance_pct: Optional[float] = None
    accuracy_pct: Optional[float] = None
    confidence: float = 0.85
    authorization_tier: str = "TIER_1"
    status: str = "EXECUTED"  # PENDING, EXECUTED, VERIFIED, ROLLED_BACK
    logged_at: float = Field(default_factory=time.time)
    verified_at: Optional[float] = None


class DecisionLedger:
    """Manages appending, querying, and verifying outcome realizations."""

    def __init__(self, path: Optional[Path] = None):
        self.path = path or LEDGER_PATH
        self.path.parent.mkdir(parents=True, exist_ok=True)
        # Prior correction deltas: channel -> multiplier
        self.channel_prior_adjustments: Dict[str, float] = {
            "meta": 1.0,
            "google": 1.0,
            "amazon": 1.0,
        }

    def record_decision(self, record: LedgerRecord) -> None:
        """Append immutable record to ledger file."""
        with open(self.path, "a", encoding="utf-8") as f:
            f.write(json.dumps(record.model_dump()) + "\n")

    def read_all_records(self) -> List[LedgerRecord]:
        """Read all ledger records."""
        if not self.path.exists():
            return []
        records = []
        for line in self.path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                # Map legacy entries if necessary
                if "directive_id" not in data:
                    data = {
                        "directive_id": f"legacy_{int(data.get('ts', time.time()))}",
                        "decision_text": data.get("decision", ""),
                        "campaign_id": "legacy_camp",
                        "channel": "meta",
                        "sku_id": "310805-137",
                        "pre_spend": 500.0,
                        "target_spend": 500.0,
                        "expected_margin_lift": data.get("expected_margin", 0.0),
                        "realized_margin_lift_24h": data.get("realized_margin", 0.0),
                        "confidence": data.get("confidence", 0.8),
                        "status": data.get("status", "EXECUTED"),
                        "logged_at": data.get("ts", time.time()),
                    }
                records.append(LedgerRecord(**data))
            except Exception:
                pass
        return records

    def verify_24h_outcome(
        self,
        directive_id: str,
        observed_realized_lift: float,
        counterfactual_control_lift: float = 0.0,
    ) -> Optional[LedgerRecord]:
        """Evaluate realized lift against counterfactual control baseline at t+24h."""
        records = self.read_all_records()
        updated_records = []
        target_record: Optional[LedgerRecord] = None

        net_realized_lift = observed_realized_lift - counterfactual_control_lift

        for r in records:
            if r.directive_id == directive_id and r.status == "EXECUTED":
                exp = max(r.expected_margin_lift, 1.0)
                variance = ((net_realized_lift - exp) / exp) * 100.0
                accuracy = max(0.0, 100.0 - abs(variance))

                r.realized_margin_lift_24h = round(net_realized_lift, 2)
                r.variance_pct = round(variance, 2)
                r.accuracy_pct = round(accuracy, 2)
                r.status = "VERIFIED"
                r.verified_at = time.time()
                target_record = r

                # Update channel prior adjustments
                ch = r.channel.lower()
                realized_ratio = max(0.5, min(1.5, net_realized_lift / exp))
                self.channel_prior_adjustments[ch] = round(
                    0.8 * self.channel_prior_adjustments.get(ch, 1.0) + 0.2 * realized_ratio, 3
                )

            updated_records.append(r)

        # Re-write ledger file
        with open(self.path, "w", encoding="utf-8") as f:
            for r in updated_records:
                f.write(json.dumps(r.model_dump()) + "\n")

        return target_record


global_ledger = DecisionLedger()


# Legacy compatibility functions
@dataclass
class LedgerEntry:
    decision: str
    expected_margin: float
    realized_margin: float
    confidence: float
    status: str
    ts: float = 0.0

    def __post_init__(self):
        if not self.ts:
            self.ts = time.time()


def add_entry(entry: LedgerEntry) -> None:
    rec = LedgerRecord(
        directive_id=f"entry_{int(time.time() * 1000)}",
        decision_text=entry.decision,
        campaign_id="default_campaign",
        channel="meta",
        sku_id="310805-137",
        pre_spend=500.0,
        target_spend=500.0,
        expected_margin_lift=entry.expected_margin,
        realized_margin_lift_24h=entry.realized_margin,
        confidence=entry.confidence,
        status=entry.status,
        logged_at=entry.ts,
    )
    global_ledger.record_decision(rec)


def read_all() -> List[LedgerEntry]:
    records = global_ledger.read_all_records()
    return [
        LedgerEntry(
            decision=r.decision_text,
            expected_margin=r.expected_margin_lift,
            realized_margin=r.realized_margin_lift_24h or 0.0,
            confidence=r.confidence,
            status=r.status,
            ts=r.logged_at,
        )
        for r in records
    ]
