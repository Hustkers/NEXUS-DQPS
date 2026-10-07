"""Production-grade modular synthetic telemetry generator.

Outputs endpoint-exact payloads for:
- Meta Graph API /insights (MetaInsightsRecord)
- Google Ads API SearchStream (GoogleAdsRow)
- Amazon Advertising API Sponsored Products (AmazonSponsoredProductsRecord)
- Shopify Admin Orders & Inventory (ShopifyOrder, ShopifyInventoryLevel)

Models realistic auction dynamics and operational shocks:
- Hero SKU stockout shock
- Meta CPM spike (+45%)
- Google Search competition bid inflation (+60%)
- Tracking pixel loss (0 conversions)
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
import numpy as np

from ingest.models.amazon import AmazonSponsoredProductsRecord
from ingest.models.google import (
    GoogleAdsCampaign,
    GoogleAdsMetrics,
    GoogleAdsRow,
    GoogleAdsSegments,
)
from ingest.models.meta import MetaAction, MetaInsightsRecord
from ingest.models.shopify import ShopifyInventoryLevel, ShopifyOrder
from ingest.normalize import DEFAULT_PRODUCT_CATALOG, usd_to_cost_micros
from simulator.shopify_generator import ShopifyGenerator


class SyntheticTelemetryGenerator:
    """Master Multi-Channel Telemetry Generator."""

    def __init__(self, seed: int = 42, base_date: str = "2026-03-01"):
        self.rng = np.random.default_rng(seed)
        self.base_date = datetime.fromisoformat(f"{base_date}T00:00:00+00:00")
        self.catalog = DEFAULT_PRODUCT_CATALOG
        self.skus = list(self.catalog.keys())
        self.shopify_gen = ShopifyGenerator(seed=seed, catalog=self.catalog)

        # Operational shock schedule: day -> list of shock configs
        # e.g., Day 25: stockout on Hero SKU '310805-137'
        # Day 15: Meta CPM spike (+45%)
        # Day 35: Google competition surge
        # Day 45: Conversion pixel drop
        self.shocks: Dict[int, Dict[str, Any]] = {
            20: {"type": "cpm_spike", "channel": "meta", "magnitude": 0.45, "duration": 5},
            30: {"type": "stockout", "sku": "310805-137", "duration": 7},
            40: {"type": "competition_surge", "channel": "google", "magnitude": 0.60, "duration": 4},
            50: {"type": "pixel_failure", "channel": "meta", "duration": 2},
        }

    def generate_meta_record(
        self,
        dt: datetime,
        sku: str,
        active_shocks: List[Dict[str, Any]],
        frequency_decay: float = 1.0,
    ) -> MetaInsightsRecord:
        """Generate endpoint-exact Meta Graph API /insights record."""
        mapping = self.catalog[sku]
        day_idx = (dt - self.base_date).days

        # Base parameters for Meta discovery auction
        base_budget = 400.0 + self.rng.uniform(-40.0, 60.0)
        cpm = 12.50 * self.rng.uniform(0.9, 1.1)
        frequency = min(4.8, 1.2 + 0.05 * (day_idx % 14))

        # Check for CPM spike shock
        for shock in active_shocks:
            if shock.get("type") == "cpm_spike" and shock.get("channel") == "meta":
                cpm *= 1.0 + shock.get("magnitude", 0.45)

        # Creative fatigue wears out CTR
        fatigue_multiplier = max(0.4, 1.0 - (frequency - 1.0) * 0.18)
        ctr = 0.025 * fatigue_multiplier * self.rng.uniform(0.9, 1.1)

        impressions = int((base_budget / cpm) * 1000)
        clicks = int(impressions * ctr)
        cpc = round(base_budget / clicks, 4) if clicks > 0 else cpm / 1000.0

        # Conversions modeling
        cvr = 0.028 * fatigue_multiplier
        # Check stockout shock: if stockout for this SKU, storefront cannot convert
        for shock in active_shocks:
            if shock.get("type") == "stockout" and shock.get("sku") == sku:
                cvr = 0.0
            if shock.get("type") == "pixel_failure" and shock.get("channel") == "meta":
                cvr = 0.0

        purchases = max(0, int(clicks * cvr * self.rng.uniform(0.85, 1.15)))
        purchase_value = round(purchases * mapping.retail_price, 2)

        # Attribution splits: 7d click (approx 75%) / 1d view (approx 25%)
        val_1d_view = round(purchase_value * 0.25, 2)
        val_7d_click = round(purchase_value * 0.75, 2)
        purch_1d_view = round(purchases * 0.25, 1)
        purch_7d_click = round(purchases * 0.75, 1)

        date_str = dt.strftime("%Y-%m-%d")

        actions = [
            MetaAction(
                action_type="omni_purchase",
                value=float(purchases),
                view_1d=purch_1d_view,
                click_7d=purch_7d_click,
            ),
            MetaAction(
                action_type="landing_page_view",
                value=float(int(clicks * 0.90)),
                click_7d=float(int(clicks * 0.90)),
            ),
            MetaAction(
                action_type="link_click",
                value=float(clicks),
                click_7d=float(clicks),
            ),
        ]

        action_values = [
            MetaAction(
                action_type="omni_purchase",
                value=purchase_value,
                view_1d=val_1d_view,
                click_7d=val_7d_click,
            )
        ]

        return MetaInsightsRecord(
            account_id="act_982341029481",
            campaign_id=f"meta_camp_{sku}",
            campaign_name=f"Meta - Advantage+ - {mapping.product_name}",
            adset_id=f"adset_{sku}",
            adset_name=f"Broad Interest {sku}",
            ad_id=f"ad_{sku}",
            ad_name=f"Creative Video {sku}",
            spend=round(base_budget, 2),
            impressions=impressions,
            clicks=clicks,
            cpc=cpc,
            cpm=round(cpm, 2),
            frequency=round(frequency, 2),
            actions=actions,
            action_values=action_values,
            date_start=date_str,
            date_stop=date_str,
        )

    def generate_google_record(
        self,
        dt: datetime,
        sku: str,
        active_shocks: List[Dict[str, Any]],
    ) -> GoogleAdsRow:
        """Generate endpoint-exact Google Ads API GoogleAdsRow."""
        mapping = self.catalog[sku]
        base_budget = 500.0 + self.rng.uniform(-50.0, 80.0)
        cpc = 0.85 * self.rng.uniform(0.9, 1.1)

        # Check for competition surge shock
        for shock in active_shocks:
            if shock.get("type") == "competition_surge" and shock.get("channel") == "google":
                cpc *= 1.0 + shock.get("magnitude", 0.60)

        clicks = max(10, int(base_budget / cpc))
        ctr = 0.045 * self.rng.uniform(0.9, 1.1)
        impressions = int(clicks / ctr)
        actual_spend = clicks * cpc

        cvr = 0.038
        for shock in active_shocks:
            if shock.get("type") == "stockout" and shock.get("sku") == sku:
                cvr = 0.0

        conversions = float(max(0, int(clicks * cvr * self.rng.uniform(0.9, 1.1))))
        conversions_val = round(conversions * mapping.retail_price, 2)
        cost_micros = usd_to_cost_micros(actual_spend)

        return GoogleAdsRow(
            campaign=GoogleAdsCampaign(
                id=f"google_camp_{sku}",
                name=f"Google - Search High Intent - {mapping.product_name}",
                advertising_channel_type="SEARCH",
                status="ENABLED",
            ),
            segments=GoogleAdsSegments(
                date=dt.strftime("%Y-%m-%d"),
                device="MOBILE" if self.rng.random() < 0.6 else "DESKTOP",
                day_of_week=dt.strftime("%A").upper(),
            ),
            metrics=GoogleAdsMetrics(
                impressions=impressions,
                clicks=clicks,
                cost_micros=cost_micros,
                conversions=conversions,
                conversions_value=conversions_val,
                average_cpc=round(cpc * 1_000_000.0, 2),
                ctr=round(ctr, 4),
            ),
            customer_id="892-102-4910",
        )

    def generate_amazon_record(
        self,
        dt: datetime,
        sku: str,
        active_shocks: List[Dict[str, Any]],
    ) -> AmazonSponsoredProductsRecord:
        """Generate endpoint-exact Amazon Advertising SP Report record."""
        mapping = self.catalog[sku]
        base_cost = 350.0 + self.rng.uniform(-30.0, 50.0)
        cpc = 0.65 * self.rng.uniform(0.9, 1.1)
        clicks = max(10, int(base_cost / cpc))
        impressions = int(clicks / 0.035)

        cvr = 0.052  # High intent Amazon conversion rate
        for shock in active_shocks:
            if shock.get("type") == "stockout" and shock.get("sku") == sku:
                cvr = 0.0

        units = max(0, int(clicks * cvr * self.rng.uniform(0.9, 1.1)))
        sales_14d = round(units * mapping.retail_price, 2)

        return AmazonSponsoredProductsRecord(
            campaign_id=f"amz_camp_{sku}",
            campaign_name=f"Amazon SP - Exact - {mapping.product_name}",
            ad_group_id=f"adgroup_{sku}",
            ad_group_name=f"SP Keywords {sku}",
            asin=mapping.asin,
            sku=sku,
            date=dt.strftime("%Y-%m-%d"),
            impressions=impressions,
            clicks=clicks,
            cost=round(base_cost, 2),
            attributed_sales_14d=sales_14d,
            attributed_units_ordered_14d=units,
            currency="USD",
            attributed_sales_1d=round(sales_14d * 0.70, 2),
            attributed_sales_7d=sales_14d,
            attributed_units_ordered_1d=max(0, int(units * 0.70)),
            attributed_units_ordered_7d=units,
        )

    def generate_world(self, days: int = 60) -> Dict[str, Any]:
        """Generate complete multi-channel telemetry and Shopify streams over specified days."""
        meta_records: List[MetaInsightsRecord] = []
        google_records: List[GoogleAdsRow] = []
        amazon_records: List[AmazonSponsoredProductsRecord] = []
        shopify_orders: List[ShopifyOrder] = []
        inventory_events: List[ShopifyInventoryLevel] = []

        active_shocks_log: List[Dict[str, Any]] = []

        for d in range(days):
            current_dt = self.base_date + timedelta(days=d)

            # Determine currently active shocks
            current_active_shocks: List[Dict[str, Any]] = []
            for shock_start, shock_def in self.shocks.items():
                if shock_start <= d < shock_start + shock_def.get("duration", 1):
                    current_active_shocks.append(shock_def)
                    # Trigger physical stock depletion in Shopify
                    if shock_def.get("type") == "stockout":
                        self.shopify_gen.set_inventory(shock_def["sku"], 0)

            # Track demands
            daily_demand: Dict[str, int] = {sku: 0 for sku in self.skus}

            # Generate records across all active SKUs
            for sku in self.skus:
                meta_rec = self.generate_meta_record(current_dt, sku, current_active_shocks)
                google_rec = self.generate_google_record(current_dt, sku, current_active_shocks)
                amz_rec = self.generate_amazon_record(current_dt, sku, current_active_shocks)

                meta_records.append(meta_rec)
                google_records.append(google_rec)
                amazon_records.append(amz_rec)

                daily_demand[sku] += int(meta_rec.purchases) + int(google_rec.metrics.conversions) + amz_rec.attributed_units_ordered_14d

            # Generate Shopify orders & inventory updates
            orders, inv_updates = self.shopify_gen.generate_orders_for_day(current_dt, daily_demand)
            shopify_orders.extend(orders)
            inventory_events.extend(inv_updates)

            if current_active_shocks:
                active_shocks_log.append({
                    "day": d,
                    "date": current_dt.strftime("%Y-%m-%d"),
                    "shocks": current_active_shocks,
                })

        return {
            "meta": meta_records,
            "google": google_records,
            "amazon": amazon_records,
            "shopify_orders": shopify_orders,
            "shopify_inventory": inventory_events,
            "shocks_log": active_shocks_log,
        }
