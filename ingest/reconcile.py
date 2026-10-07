"""Cross-channel unit economics reconciler.

Calculates true Blended ROAS, POAS (Profit on Ad Spend), MER (Marketing Efficiency Ratio),
and Net Contribution Margin (NCM) using true ERP/Shopify COGS and multi-channel media spend.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
import pandas as pd
from pydantic import BaseModel, Field

from ingest.duckdb_client import DuckDBClient


class ChannelBreakdown(BaseModel):
    """Channel-level financial and efficiency metrics."""

    channel: str
    spend: float
    attributed_revenue: float
    roas: float
    impressions: int
    clicks: int
    conversions: float
    cpc: float
    cpm: float


class SkuUnitEconomics(BaseModel):
    """SKU-level reconciled margin and inventory economics."""

    sku: str
    sku_name: Optional[str] = None
    units_sold: int
    gross_revenue: float
    net_revenue: float
    unit_cogs: float
    total_cogs: float
    ad_spend: float
    gross_margin: float
    net_contribution_margin: float
    poas: float
    inventory_on_hand: int
    inventory_status: str


class ReconciliationSummary(BaseModel):
    """Enterprise Cross-Channel Unit Economics Reconciled Summary."""

    total_ad_spend: float
    total_net_revenue: float
    total_cogs: float
    total_gross_margin: float
    net_contribution_margin: float
    blended_roas: float
    blended_poas: float
    blended_mer: float
    channel_breakdown: Dict[str, ChannelBreakdown]
    sku_breakdown: Dict[str, SkuUnitEconomics]


class UnitEconomicsReconciler:
    """Computes exact multi-channel commercial margin reconciliations."""

    def __init__(self, db_client: Optional[DuckDBClient] = None):
        self.db_client = db_client or DuckDBClient(db_path="data/dqps.duckdb")

    def reconcile_from_dataframe(self, df: pd.DataFrame) -> ReconciliationSummary:
        """Calculate reconciliation metrics from a UnifiedCommerceRecord DataFrame."""
        if df.empty:
            return ReconciliationSummary(
                total_ad_spend=0.0,
                total_net_revenue=0.0,
                total_cogs=0.0,
                total_gross_margin=0.0,
                net_contribution_margin=0.0,
                blended_roas=0.0,
                blended_poas=0.0,
                blended_mer=0.0,
                channel_breakdown={},
                sku_breakdown={},
            )

        total_spend = float(df["spend"].sum())
        total_rev = float(df["net_revenue"].sum())
        total_cogs = float(df["total_cogs"].sum())
        total_margin = float(df["gross_margin"].sum())
        total_ncm = float(df["net_contribution_margin"].sum())

        blended_roas = round(total_rev / total_spend, 2) if total_spend > 0 else 0.0
        blended_poas = round(total_margin / total_spend, 2) if total_spend > 0 else 0.0
        blended_mer = round(total_rev / total_spend, 2) if total_spend > 0 else 0.0

        # Channel breakdowns
        channel_dict: Dict[str, ChannelBreakdown] = {}
        for ch, g in df.groupby("channel"):
            ch_spend = float(g["spend"].sum())
            ch_rev = float(g["attributed_revenue"].sum())
            ch_roas = round(ch_rev / ch_spend, 2) if ch_spend > 0 else 0.0
            impr = int(g["impressions"].sum())
            clicks = int(g["clicks"].sum())
            conv = float(g["ad_conversions"].sum())
            cpc = round(ch_spend / clicks, 2) if clicks > 0 else 0.0
            cpm = round((ch_spend / impr) * 1000.0, 2) if impr > 0 else 0.0

            channel_dict[str(ch)] = ChannelBreakdown(
                channel=str(ch),
                spend=round(ch_spend, 2),
                attributed_revenue=round(ch_rev, 2),
                roas=ch_roas,
                impressions=impr,
                clicks=clicks,
                conversions=conv,
                cpc=cpc,
                cpm=cpm,
            )

        # SKU breakdowns
        sku_dict: Dict[str, SkuUnitEconomics] = {}
        for sku, g in df.groupby("sku_id"):
            sku_units = int(g["units_sold"].sum())
            sku_gross = float(g["gross_revenue"].sum())
            sku_net = float(g["net_revenue"].sum())
            sku_cogs_tot = float(g["total_cogs"].sum())
            unit_cogs = float(g["unit_cogs"].iloc[0]) if not g.empty else 0.0
            sku_spend = float(g["spend"].sum())
            sku_margin = float(g["gross_margin"].sum())
            sku_ncm = float(g["net_contribution_margin"].sum())
            sku_poas = round(sku_margin / sku_spend, 2) if sku_spend > 0 else 0.0
            inv = int(g["inventory_on_hand"].iloc[-1]) if not g.empty else 0
            inv_status = str(g["inventory_status"].iloc[-1]) if not g.empty else "IN_STOCK"
            name = str(g["sku_name"].iloc[0]) if "sku_name" in g and pd.notna(g["sku_name"].iloc[0]) else str(sku)

            sku_dict[str(sku)] = SkuUnitEconomics(
                sku=str(sku),
                sku_name=name,
                units_sold=sku_units,
                gross_revenue=round(sku_gross, 2),
                net_revenue=round(sku_net, 2),
                unit_cogs=round(unit_cogs, 2),
                total_cogs=round(sku_cogs_tot, 2),
                ad_spend=round(sku_spend, 2),
                gross_margin=round(sku_margin, 2),
                net_contribution_margin=round(sku_ncm, 2),
                poas=sku_poas,
                inventory_on_hand=inv,
                inventory_status=inv_status,
            )

        return ReconciliationSummary(
            total_ad_spend=round(total_spend, 2),
            total_net_revenue=round(total_rev, 2),
            total_cogs=round(total_cogs, 2),
            total_gross_margin=round(total_margin, 2),
            net_contribution_margin=round(total_ncm, 2),
            blended_roas=blended_roas,
            blended_poas=blended_poas,
            blended_mer=blended_mer,
            channel_breakdown=channel_dict,
            sku_breakdown=sku_dict,
        )

    def reconcile(self) -> ReconciliationSummary:
        """Read all rows from unified_commerce_ledger table and calculate reconciliation."""
        df = self.db_client.query_df("SELECT * FROM unified_commerce_ledger")
        return self.reconcile_from_dataframe(df)
