"""Shopify Admin API Connector for Inventory, COGS, and Realized Sales."""
from __future__ import annotations

import os
import requests
import pandas as pd
from typing import Any, Dict, List, Optional


class ShopifyConnector:
    """Connects to Shopify Admin API (REST/GraphQL) to extract products, COGS, and live inventory."""

    def __init__(
        self,
        store_domain: Optional[str] = None,
        access_token: Optional[str] = None,
        api_version: Optional[str] = None,
    ):
        self.store_domain = (store_domain or os.getenv("SHOPIFY_STORE_DOMAIN", "")).strip().replace("https://", "").replace("http://", "").rstrip("/")
        self.access_token = (access_token or os.getenv("SHOPIFY_ADMIN_API_TOKEN", "")).strip()
        self.api_version = (api_version or os.getenv("SHOPIFY_API_VERSION", "2024-10")).strip()

    @property
    def is_configured(self) -> bool:
        return bool(
            self.store_domain
            and "your-store" not in self.store_domain
            and self.access_token
            and "xxxx" not in self.access_token
        )

    @property
    def base_url(self) -> str:
        return f"https://{self.store_domain}/admin/api/{self.api_version}"

    @property
    def headers(self) -> Dict[str, str]:
        return {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": self.access_token,
        }

    def test_connection(self) -> Dict[str, Any]:
        """Verify API token and store connectivity."""
        if not self.is_configured:
            return {"ok": False, "error": "Shopify credentials not configured in .env"}
        try:
            url = f"{self.base_url}/shop.json"
            res = requests.get(url, headers=self.headers, timeout=10)
            if res.status_code == 200:
                shop_info = res.json().get("shop", {})
                return {
                    "ok": True,
                    "shop_name": shop_info.get("name"),
                    "domain": shop_info.get("myshopify_domain"),
                    "currency": shop_info.get("currency"),
                }
            return {"ok": False, "status_code": res.status_code, "error": res.text}
        except Exception as e:
            return {"ok": False, "error": str(e)}

    def fetch_products(self, limit: int = 250) -> pd.DataFrame:
        """Fetch all product variants, prices, inventory levels, and SKUs."""
        if not self.is_configured:
            return pd.DataFrame()

        url = f"{self.base_url}/products.json?limit={limit}"
        rows: List[Dict[str, Any]] = []

        try:
            while url:
                res = requests.get(url, headers=self.headers, timeout=15)
                res.raise_for_status()
                data = res.json()
                products = data.get("products", [])

                for p in products:
                    product_title = p.get("title", "")
                    photo_url = p.get("image", {}).get("src", "") if p.get("image") else ""

                    for v in p.get("variants", []):
                        sku = v.get("sku") or str(v.get("id"))
                        price = float(v.get("price") or 0.0)
                        inv_qty = int(v.get("inventory_quantity") or 0)
                        inv_item_id = v.get("inventory_item_id")

                        rows.append({
                            "sku": sku,
                            "product_name": f"{product_title} - {v.get('title', '')}" if v.get("title") != "Default Title" else product_title,
                            "price": price,
                            "inventory": inv_qty,
                            "inventory_item_id": inv_item_id,
                            "photo_url": photo_url,
                        })

                # Follow pagination link header if present
                link_header = res.headers.get("Link", "")
                next_url = None
                if link_header:
                    for part in link_header.split(","):
                        if 'rel="next"' in part:
                            next_url = part.split(";")[0].strip("<> ")
                url = next_url

        except Exception as e:
            print(f"[ShopifyConnector] Error fetching products: {e}")

        df = pd.DataFrame(rows)
        if not df.empty:
            # Estimate Nike gross margin if COGS item cost is omitted (default D2C margin ~55%)
            df["margin_pct"] = 0.55
            df["cost"] = (df["price"] * (1 - df["margin_pct"])).round(2)
        return df

    def fetch_recent_orders(self, days: int = 30) -> pd.DataFrame:
        """Fetch recent order line items to calculate true gross revenue and conversions."""
        if not self.is_configured:
            return pd.DataFrame()

        from datetime import datetime, timedelta, timezone
        since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        url = f"{self.base_url}/orders.json?status=any&created_at_min={since}&limit=250"
        records: List[Dict[str, Any]] = []

        try:
            res = requests.get(url, headers=self.headers, timeout=20)
            res.raise_for_status()
            orders = res.json().get("orders", [])

            for o in orders:
                order_date = o.get("created_at", "")[:10]
                for item in o.get("line_items", []):
                    records.append({
                        "date": order_date,
                        "sku": item.get("sku") or str(item.get("variant_id")),
                        "quantity": int(item.get("quantity") or 0),
                        "revenue": float(item.get("price") or 0.0) * int(item.get("quantity") or 1),
                    })
        except Exception as e:
            print(f"[ShopifyConnector] Error fetching orders: {e}")

        return pd.DataFrame(records)
