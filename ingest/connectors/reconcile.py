"""Multi-channel Cross-Platform Reconciliation Engine.

Harmonizes ad channel performance (Meta, Google, Amazon) with true eCommerce
reality from Shopify (SKUs, Inventory, Unit Costs, and Contribution Margins).
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List, Tuple
import numpy as np
import pandas as pd
from dotenv import load_dotenv

from .shopify import ShopifyConnector
from .meta import MetaAdsConnector
from .google import GoogleAdsConnector
from .amazon import AmazonAdsConnector

# Load environment variables from .env
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class LiveReconciliationEngine:
    """Orchestrates live API ingestion and SKU-level margin reconciliation."""

    def __init__(self):
        self.shopify = ShopifyConnector()
        self.meta = MetaAdsConnector()
        self.google = GoogleAdsConnector()
        self.amazon = AmazonAdsConnector()

    def check_channel_status(self) -> Dict[str, Dict[str, Any]]:
        """Audit configured API credentials and test real connectivity for each platform."""
        status = {}

        # Shopify
        status["shopify"] = {
            "configured": self.shopify.is_configured,
            "target": self.shopify.store_domain or "Not set",
            "test": self.shopify.test_connection() if self.shopify.is_configured else {"ok": False, "message": "Awaiting SHOPIFY_ADMIN_API_TOKEN in .env"},
        }

        # Meta
        status["meta"] = {
            "configured": self.meta.is_configured,
            "target": self.meta.ad_account_id or "Not set",
            "test": self.meta.test_connection() if self.meta.is_configured else {"ok": False, "message": "Awaiting META_ACCESS_TOKEN in .env"},
        }

        # Google Ads
        status["google"] = {
            "configured": self.google.is_configured,
            "target": self.google.customer_id or "Not set",
            "test": self.google.test_connection() if self.google.is_configured else {"ok": False, "message": "Awaiting GOOGLE_ADS_REFRESH_TOKEN in .env"},
        }

        # Amazon Ads
        status["amazon"] = {
            "configured": self.amazon.is_configured,
            "target": self.amazon.profile_id or "Not set",
            "test": self.amazon.test_connection() if self.amazon.is_configured else {"ok": False, "message": "Awaiting AMAZON_ADS_REFRESH_TOKEN in .env"},
        }

        return status

    def _infer_sku(self, campaign_name: str, available_skus: List[str]) -> str:
        """Deduce target SKU from campaign name conventions, e.g. 'meta-315122-001' -> '315122-001'."""
        name_clean = campaign_name.lower()
        for sku in available_skus:
            if sku.lower() in name_clean:
                return sku

        # Common fallback: look for standard alphanumeric model codes
        for part in campaign_name.replace("_", "-").split("-"):
            if len(part) >= 6 and any(c.isdigit() for c in part):
                return part

        return available_skus[0] if available_skus else "GENERAL-CATALOG"

    def pull_and_reconcile(self, days: int = 30) -> pd.DataFrame:
        """Fetch all live streams and join with Shopify SKU catalog."""
        # 1. Fetch catalog & inventory
        catalog_df = pd.DataFrame()
        if self.shopify.is_configured:
            print("[NEXUS Reconcile] Fetching live product catalog from Shopify...")
            catalog_df = self.shopify.fetch_products()

        # Fallback to local catalog if Shopify not yet connected
        if catalog_df.empty:
            from simulator.generator import NIKE_PRODUCTS
            records = []
            for sku, info in NIKE_PRODUCTS.items():
                records.append({
                    "sku": sku,
                    "product_name": info["name"],
                    "price": info["price"],
                    "inventory": 850,
                    "margin_pct": 0.58,
                })
            catalog_df = pd.DataFrame(records)

        available_skus = catalog_df["sku"].tolist()
        sku_to_info = catalog_df.set_index("sku").to_dict(orient="index")

        # 2. Fetch Ad Platform Performance
        ad_frames = []

        if self.meta.is_configured:
            print("[NEXUS Reconcile] Pulling live Meta Marketing API metrics...")
            m_df = self.meta.fetch_insights(days=days)
            if not m_df.empty:
                ad_frames.append(m_df)
        else:
            print("[NEXUS Reconcile] Meta API not configured in .env (Skipped)")

        if self.google.is_configured:
            print("[NEXUS Reconcile] Pulling live Google Ads API metrics...")
            g_df = self.google.fetch_campaign_metrics(days=days)
            if not g_df.empty:
                ad_frames.append(g_df)
        else:
            print("[NEXUS Reconcile] Google Ads API not configured in .env (Skipped)")

        if self.amazon.is_configured:
            print("[NEXUS Reconcile] Pulling live Amazon Ads API metrics...")
            a_df = self.amazon.fetch_sponsored_products_metrics(days=days)
            if not a_df.empty:
                ad_frames.append(a_df)
        else:
            print("[NEXUS Reconcile] Amazon Ads API not configured in .env (Skipped)")

        if not ad_frames:
            print("[NEXUS Reconcile] No live ad platforms currently returned data.")
            return pd.DataFrame()

        raw_ads = pd.concat(ad_frames, ignore_index=True)

        # 3. Cross-Platform Reconciliation with Shopify Catalog
        reconciled_rows = []
        for _, row in raw_ads.iterrows():
            campaign_name = str(row["campaign"])
            sku = self._infer_sku(campaign_name, available_skus)
            p_info = sku_to_info.get(sku, {"price": 120.0, "inventory": 250, "margin_pct": 0.55})

            price = float(p_info.get("price", 120.0))
            inventory = int(p_info.get("inventory", 0))
            margin_pct = float(p_info.get("margin_pct", 0.55))

            revenue = float(row.get("revenue", 0.0))
            if revenue <= 0 and row.get("conversions", 0) > 0:
                revenue = float(row["conversions"]) * price

            margin = round(revenue * margin_pct, 2)
            impressions = int(row.get("impressions", 0))

            reconciled_rows.append({
                "date": pd.to_datetime(row["date"]).strftime("%Y-%m-%d"),
                "platform": row["platform"],
                "campaign": campaign_name,
                "sku": sku,
                "spend": round(float(row.get("spend", 0.0)), 2),
                "cpm": round(float(row.get("cpm", 0.0)), 2),
                "impressions": impressions,
                "conversions": int(row.get("conversions", 0)),
                "revenue": round(revenue, 2),
                "margin": margin,
                "inventory": inventory,
                "price": round(price, 2),
                "ga_sessions": int(impressions * 0.025),
            })

        reconciled_df = pd.DataFrame(reconciled_rows)
        return reconciled_df
