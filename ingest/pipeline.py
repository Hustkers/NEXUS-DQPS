"""Endpoint-Exact Schema Ingestion & Recommendation Pipeline.

Validates raw platform payloads against Section 1 Pydantic v2 contracts:
- MetaAdInsights (/v19.0/{ad_id}/insights)
- GoogleAdsRow (Google Ads SearchStream)
- AmazonSponsoredProductsRow (Amazon Sponsored Products report)
- ShopifyOrder & ShopifyInventoryLevel (Shopify REST / Webhooks)

Reconciles them into unified DuckDB metrics, fits Hill saturation curves,
and generates optimal ad budget reallocation recommendations.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

from ingest.models.meta import MetaAdInsights
from ingest.models.google import GoogleAdsRow
from ingest.models.amazon import AmazonSponsoredProductsRow
from ingest.models.shopify import ShopifyOrder, ShopifyInventoryLevel
from decide.optimizer import recommend
from ingest.load import load
from scripts.export_engine_state import generate_state


class CanonicalPipeline:
    """End-to-end pipeline validating Section 1 models and generating ad recommendations."""

    def __init__(self, data_dir: Optional[str] = None):
        self.data_dir = Path(data_dir or "data/payloads")
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def validate_meta_payloads(self, raw_items: List[Dict[str, Any]]) -> List[MetaAdInsights]:
        """Validate raw Meta /v19.0/{ad_id}/insights JSON objects."""
        validated = []
        for item in raw_items:
            try:
                validated.append(MetaAdInsights.model_validate(item))
            except Exception as e:
                print(f"[Pipeline] Meta validation error for {item.get('campaign_name')}: {e}")
        return validated

    def validate_google_payloads(self, raw_items: List[Dict[str, Any]]) -> List[GoogleAdsRow]:
        """Validate raw Google Ads API GoogleAdsRow JSON objects."""
        validated = []
        for item in raw_items:
            try:
                validated.append(GoogleAdsRow.model_validate(item))
            except Exception as e:
                print(f"[Pipeline] Google validation error: {e}")
        return validated

    def validate_amazon_payloads(self, raw_items: List[Dict[str, Any]]) -> List[AmazonSponsoredProductsRow]:
        """Validate raw Amazon Sponsored Products reporting JSON objects."""
        validated = []
        for item in raw_items:
            try:
                validated.append(AmazonSponsoredProductsRow.model_validate(item))
            except Exception as e:
                print(f"[Pipeline] Amazon validation error for {item.get('campaignName')}: {e}")
        return validated

    def validate_shopify_inventory(self, raw_items: List[Dict[str, Any]]) -> List[ShopifyInventoryLevel]:
        """Validate Shopify InventoryLevel objects."""
        return [ShopifyInventoryLevel.model_validate(item) for item in raw_items]

    def validate_shopify_orders(self, raw_items: List[Dict[str, Any]]) -> List[ShopifyOrder]:
        """Validate Shopify Order objects."""
        return [ShopifyOrder.model_validate(item) for item in raw_items]

    def reconcile_to_metrics(
        self,
        meta_models: List[MetaAdInsights],
        google_models: List[GoogleAdsRow],
        amazon_models: List[AmazonSponsoredProductsRow],
        inventory_models: List[ShopifyInventoryLevel],
        order_models: Optional[List[ShopifyOrder]] = None,
    ) -> pd.DataFrame:
        """Harmonize all validated Pydantic models into the unified metrics dataset."""
        # Map SKU inventory and unit costs
        sku_to_inv = {inv.sku: inv.available for inv in inventory_models if inv.sku}
        sku_to_cogs = {inv.sku: inv.unit_cogs for inv in inventory_models if inv.sku}

        rows: List[Dict[str, Any]] = []

        # 1. Meta rows
        for m in meta_models:
            sku = self._extract_sku(m.campaign_name or m.ad_id or "GENERAL")
            inv_qty = sku_to_inv.get(sku, 350)
            unit_cost = sku_to_cogs.get(sku, 55.0)
            rev = m.purchase_revenue if m.purchase_revenue > 0 else (m.purchase_conversions * 120.0)
            # Gross margin = revenue - (purchases * unit COGS)
            margin = max(0.0, rev - (m.purchase_conversions * unit_cost)) if m.purchase_conversions > 0 else rev * 0.55

            rows.append({
                "date": m.date_start,
                "platform": "meta",
                "campaign": m.campaign_name or f"meta-{sku}",
                "sku": sku,
                "spend": m.spend,
                "cpm": m.cpm or (m.spend / max(m.impressions, 1) * 1000),
                "impressions": m.impressions,
                "conversions": m.purchase_conversions,
                "revenue": rev,
                "margin": round(margin, 2),
                "inventory": inv_qty,
                "price": round(rev / max(m.purchase_conversions, 1), 2) if m.purchase_conversions > 0 else 120.0,
                "ga_sessions": int(m.impressions * 0.02),
            })

        # 2. Google rows
        for g in google_models:
            sku = self._extract_sku(g.campaign_name)
            inv_qty = sku_to_inv.get(sku, 400)
            unit_cost = sku_to_cogs.get(sku, 55.0)
            conv = int(g.metrics.conversions)
            rev = g.metrics.conversions_value
            margin = max(0.0, rev - (conv * unit_cost)) if conv > 0 else rev * 0.55

            rows.append({
                "date": g.date,
                "platform": "google",
                "campaign": g.campaign_name,
                "sku": sku,
                "spend": g.spend,
                "cpm": round((g.spend / max(g.metrics.impressions, 1)) * 1000, 2),
                "impressions": g.metrics.impressions,
                "conversions": conv,
                "revenue": rev,
                "margin": round(margin, 2),
                "inventory": inv_qty,
                "price": round(rev / max(conv, 1), 2) if conv > 0 else 130.0,
                "ga_sessions": int(g.metrics.impressions * 0.022),
            })

        # 3. Amazon rows
        for a in amazon_models:
            sku = a.sku or self._extract_sku(a.campaign_name)
            inv_qty = sku_to_inv.get(sku, 500)
            unit_cost = sku_to_cogs.get(sku, 50.0)
            conv = a.attributed_units_ordered_14d
            rev = a.attributed_sales_14d
            margin = max(0.0, rev - (conv * unit_cost)) if conv > 0 else rev * 0.55

            rows.append({
                "date": a.date,
                "platform": "amazon",
                "campaign": a.campaign_name,
                "sku": sku,
                "spend": a.cost,
                "cpm": round((a.cost / max(a.impressions, 1)) * 1000, 2),
                "impressions": a.impressions,
                "conversions": conv,
                "revenue": rev,
                "margin": round(margin, 2),
                "inventory": inv_qty,
                "price": round(rev / max(conv, 1), 2) if conv > 0 else 115.0,
                "ga_sessions": int(a.impressions * 0.018),
            })

        # 4. Shopify rows (when order_models provided)
        if order_models:
            order_sku_counts: Dict[str, int] = {}
            order_sku_rev: Dict[str, float] = {}
            for o in order_models:
                for li in o.line_items:
                    if li.sku:
                        order_sku_counts[li.sku] = order_sku_counts.get(li.sku, 0) + li.quantity
                        order_sku_rev[li.sku] = order_sku_rev.get(li.sku, 0.0) + (li.price * li.quantity)

            for sku, inv_qty in sku_to_inv.items():
                unit_cost = sku_to_cogs.get(sku, 50.0)
                sold_qty = order_sku_counts.get(sku, 4)
                rev = order_sku_rev.get(sku, sold_qty * 140.0)
                spend = round(rev * 0.18, 2)
                impressions = int(spend / 8.4 * 1000)
                margin = max(0.0, rev - (sold_qty * unit_cost))

                rows.append({
                    "date": "2026-10-07",
                    "platform": "shopify",
                    "campaign": f"shopify-{sku}",
                    "sku": sku,
                    "spend": spend,
                    "cpm": 8.4,
                    "impressions": impressions,
                    "conversions": sold_qty,
                    "revenue": rev,
                    "margin": round(margin, 2),
                    "inventory": inv_qty,
                    "price": round(rev / max(sold_qty, 1), 2),
                    "ga_sessions": int(impressions * 0.025),
                })

        return pd.DataFrame(rows)

    def _extract_sku(self, text: str) -> str:
        """Look for common footwear SKUs or standard codes in campaign string."""
        known = [
            "310805-137", "880848-005", "AH8050-100", "315122-001", "BQ8928-011",
            "849559-004", "CD4371-001", "AQ2730-009", "634835-108", "AO2924-401", "554724-066"
        ]
        for k in known:
            if k in text:
                return k
        for part in text.replace("_", "-").split("-"):
            if len(part) >= 6 and any(c.isdigit() for c in part):
                return part
        return "310805-137"

    def run_optimization(self, metrics_df: pd.DataFrame, total_budget: Optional[float] = None) -> pd.DataFrame:
        """Run the SLSQP response-curve optimizer to generate ad recommendations."""
        print("[Pipeline] Running SLSQP budget optimizer under margin maximization & stockout constraints...")
        recs = recommend(metrics_df, total_budget=total_budget)
        return recs
