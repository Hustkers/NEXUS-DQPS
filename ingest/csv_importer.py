"""Intelligent Multi-Platform CSV Ingestion & Reconciliation Engine.

Parses raw CSV exports from Meta Ads Manager, Google Ads Reports,
Amazon Advertising Console, and Shopify Products/Orders into NEXUS's
unified schema and updates DuckDB and the web decision console.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd


class CSVImporter:
    """Imports and standardizes ad and eCommerce CSV reports."""

    def __init__(self, imports_dir: Optional[str] = None):
        self.imports_dir = Path(imports_dir or "data/imports")
        self.imports_dir.mkdir(parents=True, exist_ok=True)

    def load_shopify_catalog(self, filepath: Optional[Path] = None) -> pd.DataFrame:
        """Load Shopify product catalog with SKUs, prices, inventory, and unit costs."""
        if filepath is None:
            # Look for shopify or product files in imports dir
            candidates = list(self.imports_dir.glob("*shopify*.csv")) + list(self.imports_dir.glob("*product*.csv"))
            if not candidates:
                return pd.DataFrame()
            filepath = candidates[0]

        df = pd.read_csv(filepath)
        col_map = {
            "variant sku": "sku",
            "sku": "sku",
            "variant price": "price",
            "price": "price",
            "variant inventory qty": "inventory",
            "inventory": "inventory",
            "cost per item": "cost",
            "cost": "cost",
            "title": "product_name",
            "product_name": "product_name",
        }
        renamed = {}
        for c in df.columns:
            clean = c.strip().lower()
            if clean in col_map:
                renamed[c] = col_map[clean]
        df = df.rename(columns=renamed)

        if "sku" not in df.columns:
            return pd.DataFrame()

        df["sku"] = df["sku"].astype(str)
        df["price"] = pd.to_numeric(df.get("price", 120.0), errors="coerce").fillna(120.0)
        df["inventory"] = pd.to_numeric(df.get("inventory", 500), errors="coerce").fillna(500).astype(int)
        df["cost"] = pd.to_numeric(df.get("cost", 50.0), errors="coerce").fillna(df["price"] * 0.45)
        df["margin_pct"] = (1 - (df["cost"] / df["price"])).clip(0.1, 0.9)
        return df[["sku", "product_name", "price", "cost", "inventory", "margin_pct"]].drop_duplicates("sku")

    def _clean_numeric(self, series: pd.Series) -> pd.Series:
        """Strip currency symbols, commas, and convert to numeric."""
        if series is None or series.empty:
            return pd.Series(0.0)
        cleaned = series.astype(str).str.replace("$", "", regex=False).str.replace(",", "", regex=False).str.strip()
        return pd.to_numeric(cleaned, errors="coerce").fillna(0.0)

    def parse_meta_csv(self, filepath: Path) -> pd.DataFrame:
        """Parse raw Meta Ads Manager table export."""
        df = pd.read_csv(filepath)
        col_lower = {c: c.strip().lower() for c in df.columns}

        date_col = next((c for c, l in col_lower.items() if "day" in l or "date" in l), None)
        camp_col = next((c for c, l in col_lower.items() if "campaign name" in l or "campaign" in l), None)
        spend_col = next((c for c, l in col_lower.items() if "amount spent" in l or "spend" in l), None)
        impr_col = next((c for c, l in col_lower.items() if "impressions" in l), None)
        cpm_col = next((c for c, l in col_lower.items() if "cpm" in l), None)
        conv_col = next((c for c, l in col_lower.items() if "purchases" in l and "value" not in l), None)
        rev_col = next((c for c, l in col_lower.items() if "purchases conversion value" in l or "value" in l or "revenue" in l), None)

        if not (date_col and camp_col and spend_col):
            print(f"[CSVImporter] Skipping {filepath.name}: Missing date, campaign, or spend columns.")
            return pd.DataFrame()

        out = pd.DataFrame()
        out["date"] = pd.to_datetime(df[date_col]).dt.strftime("%Y-%m-%d")
        out["platform"] = "meta"
        out["campaign"] = df[camp_col].astype(str)
        out["spend"] = self._clean_numeric(df[spend_col]).round(2)
        out["impressions"] = self._clean_numeric(df[impr_col]).astype(int) if impr_col else (out["spend"] * 80).astype(int)
        
        if cpm_col:
            out["cpm"] = self._clean_numeric(df[cpm_col]).round(2)
        else:
            out["cpm"] = np.where(out["impressions"] > 0, (out["spend"] / out["impressions"]) * 1000, 11.5).round(2)

        out["conversions"] = self._clean_numeric(df[conv_col]).astype(int) if conv_col else (out["spend"] * 0.04).astype(int)
        out["revenue"] = self._clean_numeric(df[rev_col]).round(2) if rev_col else (out["spend"] * 3.4).round(2)
        return out

    def parse_google_csv(self, filepath: Path) -> pd.DataFrame:
        """Parse raw Google Ads campaign report export."""
        df = pd.read_csv(filepath)
        col_lower = {c: c.strip().lower() for c in df.columns}

        date_col = next((c for c, l in col_lower.items() if "day" in l or "date" in l), None)
        camp_col = next((c for c, l in col_lower.items() if "campaign" in l), None)
        cost_col = next((c for c, l in col_lower.items() if "cost" in l or "spend" in l), None)
        impr_col = next((c for c, l in col_lower.items() if "impressions" in l), None)
        cpm_col = next((c for c, l in col_lower.items() if "cpm" in l), None)
        conv_col = next((c for c, l in col_lower.items() if "conversions" in l and "value" not in l), None)
        rev_col = next((c for c, l in col_lower.items() if "conv. value" in l or "value" in l or "revenue" in l), None)

        if not (date_col and camp_col and cost_col):
            print(f"[CSVImporter] Skipping {filepath.name}: Missing date, campaign, or cost columns.")
            return pd.DataFrame()

        out = pd.DataFrame()
        out["date"] = pd.to_datetime(df[date_col]).dt.strftime("%Y-%m-%d")
        out["platform"] = "google"
        out["campaign"] = df[camp_col].astype(str)
        out["spend"] = self._clean_numeric(df[cost_col]).round(2)
        out["impressions"] = self._clean_numeric(df[impr_col]).astype(int) if impr_col else (out["spend"] * 75).astype(int)

        if cpm_col:
            out["cpm"] = self._clean_numeric(df[cpm_col]).round(2)
        else:
            out["cpm"] = np.where(out["impressions"] > 0, (out["spend"] / out["impressions"]) * 1000, 13.8).round(2)

        out["conversions"] = self._clean_numeric(df[conv_col]).astype(int) if conv_col else (out["spend"] * 0.038).astype(int)
        out["revenue"] = self._clean_numeric(df[rev_col]).round(2) if rev_col else (out["spend"] * 3.8).round(2)
        return out

    def parse_amazon_csv(self, filepath: Path) -> pd.DataFrame:
        """Parse raw Amazon Sponsored Products campaign report."""
        df = pd.read_csv(filepath)
        col_lower = {c: c.strip().lower() for c in df.columns}

        date_col = next((c for c, l in col_lower.items() if "date" in l or "day" in l), None)
        camp_col = next((c for c, l in col_lower.items() if "campaign name" in l or "campaign" in l), None)
        spend_col = next((c for c, l in col_lower.items() if "spend" in l or "cost" in l), None)
        impr_col = next((c for c, l in col_lower.items() if "impressions" in l), None)
        conv_col = next((c for c, l in col_lower.items() if "orders" in l or "units" in l), None)
        rev_col = next((c for c, l in col_lower.items() if "sales" in l or "revenue" in l), None)

        if not (date_col and camp_col and spend_col):
            print(f"[CSVImporter] Skipping {filepath.name}: Missing date, campaign, or spend columns.")
            return pd.DataFrame()

        out = pd.DataFrame()
        out["date"] = pd.to_datetime(df[date_col]).dt.strftime("%Y-%m-%d")
        out["platform"] = "amazon"
        out["campaign"] = df[camp_col].astype(str)
        out["spend"] = self._clean_numeric(df[spend_col]).round(2)
        out["impressions"] = self._clean_numeric(df[impr_col]).astype(int) if impr_col else (out["spend"] * 85).astype(int)
        out["cpm"] = np.where(out["impressions"] > 0, (out["spend"] / out["impressions"]) * 1000, 11.2).round(2)
        out["conversions"] = self._clean_numeric(df[conv_col]).astype(int) if conv_col else (out["spend"] * 0.045).astype(int)
        out["revenue"] = self._clean_numeric(df[rev_col]).round(2) if rev_col else (out["spend"] * 4.2).round(2)
        return out

    def _infer_sku(self, campaign_name: str, catalog_skus: List[str]) -> str:
        """Match campaign name string with catalog SKUs."""
        name_clean = campaign_name.lower().replace("_", "-")
        for sku in catalog_skus:
            if sku.lower() in name_clean:
                return sku

        # Fallback: scan for model-like alphanumeric chunks
        for token in name_clean.split("-"):
            if len(token) >= 6 and any(c.isdigit() for c in token):
                return token

        return catalog_skus[0] if catalog_skus else "GENERAL-SKU"

    def import_all(self, custom_files: Optional[List[str]] = None) -> pd.DataFrame:
        """Import all detected CSV files, reconcile with catalog, and produce unified metrics."""
        catalog_df = self.load_shopify_catalog()
        if catalog_df.empty:
            # Fallback to rich Nike Catalog
            from simulator.generator import NIKE_PRODUCTS
            records = []
            for sku, info in NIKE_PRODUCTS.items():
                records.append({
                    "sku": sku,
                    "product_name": info["name"],
                    "price": info["price"],
                    "cost": round(info["price"] * 0.45, 2),
                    "inventory": 850,
                    "margin_pct": 0.55,
                })
            catalog_df = pd.DataFrame(records)

        catalog_skus = catalog_df["sku"].tolist()
        sku_to_info = catalog_df.set_index("sku").to_dict(orient="index")

        # Discover ad CSV files
        files_to_process = [Path(f) for f in custom_files] if custom_files else list(self.imports_dir.glob("*.csv"))
        parsed_frames = []

        for f in files_to_process:
            fname = f.name.lower()
            if "shopify" in fname or "catalog" in fname or "product" in fname:
                continue  # already processed catalog

            if "meta" in fname:
                print(f"[CSVImporter] Parsing Meta Ads CSV: {f.name}")
                p_df = self.parse_meta_csv(f)
                if not p_df.empty:
                    parsed_frames.append(p_df)
            elif "google" in fname:
                print(f"[CSVImporter] Parsing Google Ads CSV: {f.name}")
                p_df = self.parse_google_csv(f)
                if not p_df.empty:
                    parsed_frames.append(p_df)
            elif "amazon" in fname:
                print(f"[CSVImporter] Parsing Amazon Ads CSV: {f.name}")
                p_df = self.parse_amazon_csv(f)
                if not p_df.empty:
                    parsed_frames.append(p_df)
            elif "metrics" in fname:
                # Already unified CSV
                print(f"[CSVImporter] Found pre-unified metrics CSV: {f.name}")
                m_df = pd.read_csv(f)
                return m_df

        if not parsed_frames:
            print("[CSVImporter] No valid ad CSVs could be parsed.")
            return pd.DataFrame()

        ads_df = pd.concat(parsed_frames, ignore_index=True)

        # Reconcile with Shopify Catalog
        rows = []
        for _, r in ads_df.iterrows():
            camp = str(r["campaign"])
            sku = self._infer_sku(camp, catalog_skus)
            p_info = sku_to_info.get(sku, {"price": 120.0, "cost": 54.0, "inventory": 400, "margin_pct": 0.55})

            price = float(p_info.get("price", 120.0))
            cost = float(p_info.get("cost", 54.0))
            inventory = int(p_info.get("inventory", 400))
            margin_pct = float(p_info.get("margin_pct", 0.55))

            spend = float(r["spend"])
            impr = int(r["impressions"])
            conv = int(r["conversions"])
            rev = float(r["revenue"])
            cpm = float(r["cpm"])

            # Compute contribution margin
            margin = round(rev * margin_pct, 2)

            rows.append({
                "date": r["date"],
                "platform": r["platform"],
                "campaign": camp,
                "sku": sku,
                "spend": spend,
                "cpm": cpm,
                "impressions": impr,
                "conversions": conv,
                "revenue": rev,
                "margin": margin,
                "inventory": inventory,
                "price": price,
                "ga_sessions": int(impr * 0.025),
            })

        return pd.DataFrame(rows)
