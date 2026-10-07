"""Decision ledger: every decision + expected vs realized outcome."""
from __future__ import annotations

import json
import time
from dataclasses import asdict, dataclass
from pathlib import Path

LEDGER_PATH = Path("data/ledger.jsonl")


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
    LEDGER_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LEDGER_PATH.open("a") as f:
        f.write(json.dumps(asdict(entry)) + "\n")


def read_all() -> list[LedgerEntry]:
    if not LEDGER_PATH.exists():
        return []
    return [LedgerEntry(**json.loads(line)) for line in LEDGER_PATH.read_text().splitlines()]
