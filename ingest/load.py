"""Load simulator output into DuckDB unified schema."""
from __future__ import annotations

import duckdb
import pandas as pd

SCHEMA_SQL = """
CREATE OR REPLACE TABLE metrics (
  date DATE,
  platform VARCHAR,
  campaign VARCHAR,
  sku VARCHAR,
  product_name VARCHAR,
  spend DOUBLE,
  cpm DOUBLE,
  impressions BIGINT,
  conversions BIGINT,
  revenue DOUBLE,
  margin DOUBLE,
  inventory BIGINT,
  price DOUBLE,
  ga_sessions BIGINT
);
CREATE OR REPLACE TABLE events (
  type VARCHAR, platform VARCHAR, sku VARCHAR,
  start_day INTEGER, duration INTEGER, magnitude DOUBLE
);
CREATE OR REPLACE TABLE ledger (
  ts TIMESTAMP DEFAULT now(),
  decision VARCHAR, expected_margin DOUBLE, realized_margin DOUBLE,
  confidence DOUBLE, status VARCHAR
);
"""


def load(db_path: str, metrics: pd.DataFrame, events: list[dict]) -> duckdb.DuckDBPyConnection:
    con = duckdb.connect(db_path)
    con.execute(SCHEMA_SQL)
    con.register("m", metrics)
    con.execute("INSERT INTO metrics BY NAME SELECT * FROM m")
    if events:
        con.register("e", pd.DataFrame(events))
        con.execute("INSERT INTO events BY NAME SELECT * FROM e")
    return con


if __name__ == "__main__":
    import json

    from simulator.generator import build_world

    world = build_world()
    load("data/dqps.duckdb", world["metrics"], world["events"])
    print("loaded data/dqps.duckdb")
