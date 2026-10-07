"""DuckDB warehouse client for NEXUS-DQPS.

Manages connection lifecycle, schema initialization, columnar parquet storage,
and analytical queries linking ad spend to Shopify orders and inventory.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import duckdb
import pandas as pd

from ingest.models.canonical import UnifiedCommerceRecord

SCHEMA_PATH = Path(__file__).resolve().parent.parent / "db" / "schema.sql"


class DuckDBClient:
    """DuckDB Analytical Warehouse Client with Parquet columnar capabilities."""

    def __init__(self, db_path: str = "data/dqps.duckdb"):
        self.db_path = db_path
        db_dir = Path(db_path).parent
        if db_path != ":memory:" and not db_dir.exists():
            db_dir.mkdir(parents=True, exist_ok=True)
        self.conn = duckdb.connect(db_path)
        self.init_schema()

    def init_schema(self, schema_file: Optional[str | Path] = None) -> None:
        """Execute DDL statements from db/schema.sql."""
        path = Path(schema_file) if schema_file else SCHEMA_PATH
        if path.exists():
            ddl = path.read_text(encoding="utf-8")
            self.conn.execute(ddl)
        else:
            raise FileNotFoundError(f"Schema file not found at {path}")

    def insert_unified_records(self, records: List[UnifiedCommerceRecord]) -> int:
        """Batch insert UnifiedCommerceRecord list into unified_commerce_ledger."""
        if not records:
            return 0

        data = []
        for r in records:
            data.append({
                "timestamp": r.timestamp,
                "channel": r.channel,
                "campaign_id": r.campaign_id,
                "campaign_name": r.campaign_name,
                "sku_id": r.sku_id,
                "sku_name": r.sku_name,
                "asin": r.asin,
                "variant_id": r.variant_id,
                "spend": r.spend,
                "impressions": r.impressions,
                "clicks": r.clicks,
                "cpc": r.cpc,
                "cpm": r.cpm,
                "ctr": r.ctr,
                "ad_conversions": r.ad_conversions,
                "attributed_revenue": r.attributed_revenue,
                "roas": r.roas,
                "units_sold": r.units_sold,
                "gross_revenue": r.gross_revenue,
                "net_revenue": r.net_revenue,
                "unit_cogs": r.unit_cogs,
                "total_cogs": r.total_cogs,
                "gross_margin": r.gross_margin,
                "variable_costs": r.variable_costs,
                "net_contribution_margin": r.net_contribution_margin,
                "poas": r.poas,
                "mer": r.mer,
                "inventory_on_hand": r.inventory_on_hand,
                "inventory_status": r.inventory_status,
                "days_of_supply": r.days_of_supply,
            })

        df = pd.DataFrame(data)
        self.conn.register("incoming_records", df)
        self.conn.execute("""
            INSERT OR REPLACE INTO unified_commerce_ledger
            SELECT * FROM incoming_records
        """)
        return len(records)

    def query_df(self, sql: str, params: Optional[List[Any] | Dict[str, Any]] = None) -> pd.DataFrame:
        """Execute SQL query and return pandas DataFrame."""
        if params:
            return self.conn.execute(sql, params).fetchdf()
        return self.conn.execute(sql).fetchdf()

    def export_to_parquet(self, table_name: str, parquet_path: str) -> None:
        """Export table to columnar parquet file."""
        export_dir = Path(parquet_path).parent
        export_dir.mkdir(parents=True, exist_ok=True)
        self.conn.execute(f"COPY {table_name} TO '{parquet_path}' (FORMAT PARQUET);")

    def import_from_parquet(self, table_name: str, parquet_path: str) -> None:
        """Import table from columnar parquet file."""
        self.conn.execute(f"INSERT OR REPLACE INTO {table_name} SELECT * FROM read_parquet('{parquet_path}');")

    def get_summary_by_channel(self) -> pd.DataFrame:
        """Return aggregated KPIs by channel."""
        return self.query_df("""
            SELECT 
                channel,
                COUNT(DISTINCT campaign_id) AS active_campaigns,
                SUM(spend) AS total_spend,
                SUM(net_revenue) AS total_revenue,
                SUM(gross_margin) AS total_gross_margin,
                SUM(net_contribution_margin) AS total_ncm,
                CASE WHEN SUM(spend) > 0 THEN SUM(net_revenue) / SUM(spend) ELSE 0.0 END AS blended_roas,
                CASE WHEN SUM(spend) > 0 THEN SUM(gross_margin) / SUM(spend) ELSE 0.0 END AS blended_poas
            FROM unified_commerce_ledger
            GROUP BY channel
            ORDER BY total_spend DESC
        """)

    def close(self) -> None:
        """Close connection."""
        self.conn.close()
