"""End-to-end offline demo: simulate -> load -> diagnose -> recommend -> ledger."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from agents.rca import explain
from decide.optimizer import recommend
from diagnose.anomaly import detect_anomalies, factor_decomposition
from ingest.load import load
from learn.ledger import LedgerEntry, add_entry
from simulator.generator import build_world


def main() -> None:
    world = build_world()
    df = world["metrics"]
    df.to_csv("data/metrics.csv", index=False)
    Path("data/events.json").write_text(json.dumps(world["events"], indent=2))
    load("data/dqps.duckdb", df, world["events"])

    scored = detect_anomalies(df)
    bad = scored[scored["anomaly"]].sort_values("date")
    print(f"anomalous rows: {len(bad)}")
    if not bad.empty:
        row = bad.iloc[-1]
        factors = factor_decomposition(df, row["campaign"], row["date"])
        print("\nRoot cause explanation:")
        print(explain(row["campaign"], row["date"], factors))

    recs = recommend(df)
    print("\nTop budget recommendations:")
    print(recs.head(10).to_string(index=False))

    top = recs.iloc[0]
    add_entry(
        LedgerEntry(
            decision=f"set {top['campaign']} spend -> ${top['recommended_daily_spend']:.0f}/day",
            expected_margin=float(top["expected_daily_margin"]),
            realized_margin=float(top["expected_daily_margin"]) * 0.92,
            confidence=0.8,
            status="executed",
        )
    )
    print("\nDecision ledger updated -> data/ledger.jsonl")


if __name__ == "__main__":
    main()
