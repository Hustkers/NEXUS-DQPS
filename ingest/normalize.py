"""Normalization utilities for multi-platform ad telemetry and commerce data.

Handles:
- Google Ads cost_micros <-> USD conversion
- Multi-currency USD FX conversion
- ISO 8601 UTC timestamp parsing and normalization
- Cross-channel SKU-to-ASIN-to-Variant product catalog reconciliation
- Platform record conversion into canonical UnifiedCommerceRecord
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from ingest.models.amazon import AmazonSponsoredProductsRecord
from ingest.models.canonical import UnifiedCommerceRecord
from ingest.models.google import GoogleAdsRow
from ingest.models.meta import MetaInsightsRecord
from ingest.models.shopify import ShopifyInventoryLevel, ShopifyOrder


# -------------------------------------------------------------------------
# Currency and Cost Utilities
# -------------------------------------------------------------------------

DEFAULT_FX_RATES_TO_USD: Dict[str, float] = {
    "USD": 1.0,
    "EUR": 1.08,
    "GBP": 1.28,
    "CAD": 0.73,
    "AUD": 0.65,
    "JPY": 0.0065,
    "INR": 0.012,
}


def cost_micros_to_usd(cost_micros: int | float) -> float:
    """Convert Google Ads cost_micros into standard USD decimal.

    1,000,000 micros = $1.00 USD
    """
    if not cost_micros:
        return 0.0
    return round(float(cost_micros) / 1_000_000.0, 4)


def usd_to_cost_micros(usd: float) -> int:
    """Convert USD decimal amount to Google Ads cost_micros integer."""
    if not usd:
        return 0
    return int(round(usd * 1_000_000))


def convert_currency(
    amount: float,
    from_currency: str,
    to_currency: str = "USD",
    custom_fx: Optional[Dict[str, float]] = None,
) -> float:
    """Convert monetary amount between currencies to target currency (default USD)."""
    if amount == 0.0:
        return 0.0
    src = from_currency.upper().strip()
    dst = to_currency.upper().strip()
    if src == dst:
        return round(float(amount), 4)

    fx = custom_fx or DEFAULT_FX_RATES_TO_USD
    rate_src = fx.get(src, 1.0)
    rate_dst = fx.get(dst, 1.0)

    # Convert to USD first, then to dst
    usd_amount = amount * rate_src
    converted = usd_amount / rate_dst
    return round(converted, 4)


# -------------------------------------------------------------------------
# Timestamp Normalization
# -------------------------------------------------------------------------

def normalize_iso_timestamp(ts: Any) -> datetime:
    """Normalize any date/timestamp into UTC-aware datetime.

    Accepts:
    - ISO 8601 strings (e.g. '2026-03-31T14:30:00Z', '2026-03-31')
    - Unix epoch integer/float seconds
    - Existing datetime objects
    """
    if isinstance(ts, datetime):
        if ts.tzinfo is None:
            return ts.replace(tzinfo=timezone.utc)
        return ts.astimezone(timezone.utc)

    if isinstance(ts, (int, float)):
        return datetime.fromtimestamp(ts, tz=timezone.utc)

    if isinstance(ts, str):
        val = ts.strip()
        # Daily date string: 'YYYY-MM-DD'
        if len(val) == 10 and val[4] == "-" and val[7] == "-":
            return datetime.fromisoformat(f"{val}T00:00:00+00:00")
        if val.endswith("Z"):
            val = val[:-1] + "+00:00"
        dt = datetime.fromisoformat(val)
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)

    raise ValueError(f"Unable to normalize timestamp: {ts}")


# -------------------------------------------------------------------------
# Product Cross-Referencing Catalog
# -------------------------------------------------------------------------

class ProductMapping(BaseModel):
    """Cross-reference mapping across SKU, ASIN, and Shopify Variant ID."""

    sku: str
    product_name: str
    asin: str
    shopify_variant_id: str
    retail_price: float
    unit_cogs: float
    category: str = "Footwear"


DEFAULT_PRODUCT_CATALOG: Dict[str, ProductMapping] = {
    "310805-137": ProductMapping(
        sku="310805-137",
        product_name="Air Jordan 10 Retro",
        asin="B07Q8Z9101",
        shopify_variant_id="gid://shopify/ProductVariant/41001",
        retail_price=192.71,
        unit_cogs=58.00,
        category="Jordan",
    ),
    "880848-005": ProductMapping(
        sku="880848-005",
        product_name="Nike Zoom Fly",
        asin="B07Q8Z9102",
        shopify_variant_id="gid://shopify/ProductVariant/41002",
        retail_price=174.64,
        unit_cogs=52.50,
        category="Running",
    ),
    "AH8050-100": ProductMapping(
        sku="AH8050-100",
        product_name="Nike Air Max 270",
        asin="B07Q8Z9103",
        shopify_variant_id="gid://shopify/ProductVariant/41003",
        retail_price=168.61,
        unit_cogs=48.00,
        category="Lifestyle",
    ),
    "CI3831-002": ProductMapping(
        sku="CI3831-002",
        product_name="Nike Adapt BB 2.0",
        asin="B07Q8Z9104",
        shopify_variant_id="gid://shopify/ProductVariant/41004",
        retail_price=350.00,
        unit_cogs=105.00,
        category="Basketball",
    ),
    "CK6637-104": ProductMapping(
        sku="CK6637-104",
        product_name="Nike Air Zoom Pegasus 37",
        asin="B07Q8Z9105",
        shopify_variant_id="gid://shopify/ProductVariant/41005",
        retail_price=120.00,
        unit_cogs=36.00,
        category="Running",
    ),
}


class ProductCatalogRegistry:
    """Registry providing cross-channel SKU <-> ASIN <-> Variant ID lookups."""

    def __init__(self, mappings: Optional[Dict[str, ProductMapping]] = None):
        self._by_sku: Dict[str, ProductMapping] = dict(mappings or DEFAULT_PRODUCT_CATALOG)
        self._by_asin: Dict[str, ProductMapping] = {m.asin: m for m in self._by_sku.values()}
        self._by_variant: Dict[str, ProductMapping] = {m.shopify_variant_id: m for m in self._by_sku.values()}

    def register(self, mapping: ProductMapping) -> None:
        self._by_sku[mapping.sku] = mapping
        self._by_asin[mapping.asin] = mapping
        self._by_variant[mapping.shopify_variant_id] = mapping

    def get_by_sku(self, sku: str) -> Optional[ProductMapping]:
        return self._by_sku.get(sku)

    def get_by_asin(self, asin: str) -> Optional[ProductMapping]:
        return self._by_asin.get(asin)

    def get_by_variant_id(self, variant_id: str) -> Optional[ProductMapping]:
        return self._by_variant.get(variant_id)

    def resolve_sku(self, identifier: str) -> str:
        """Resolve identifier (SKU, ASIN, or Variant ID) into canonical SKU."""
        if identifier in self._by_sku:
            return identifier
        if identifier in self._by_asin:
            return self._by_asin[identifier].sku
        if identifier in self._by_variant:
            return self._by_variant[identifier].sku
        return identifier


# Global default catalog instance
default_catalog = ProductCatalogRegistry()


# -------------------------------------------------------------------------
# Platform Normalizers
# -------------------------------------------------------------------------

def normalize_meta_record(
    record: MetaInsightsRecord,
    sku_id: str,
    catalog: Optional[ProductCatalogRegistry] = None,
) -> UnifiedCommerceRecord:
    """Convert MetaInsightsRecord into canonical UnifiedCommerceRecord."""
    cat = catalog or default_catalog
    prod = cat.get_by_sku(sku_id)

    dt = normalize_iso_timestamp(record.date_start)
    campaign_id = record.campaign_id or "meta_campaign"
    campaign_name = record.campaign_name or f"Meta - {campaign_id}"
    spend = record.spend
    impressions = record.impressions
    clicks = record.clicks
    purchases = int(record.purchases)
    revenue = record.purchase_value

    unit_cogs = prod.unit_cogs if prod else 0.0
    total_cogs = purchases * unit_cogs
    gross_margin = max(0.0, revenue - total_cogs)
    var_costs = revenue * 0.03  # 3% payment & logistics variable cost

    rec = UnifiedCommerceRecord(
        timestamp=dt,
        channel="meta",
        campaign_id=campaign_id,
        campaign_name=campaign_name,
        sku_id=sku_id,
        sku_name=prod.product_name if prod else None,
        asin=prod.asin if prod else None,
        variant_id=prod.shopify_variant_id if prod else None,
        spend=spend,
        impressions=impressions,
        clicks=clicks,
        ad_conversions=float(purchases),
        attributed_revenue=revenue,
        units_sold=purchases,
        gross_revenue=revenue,
        net_revenue=revenue,
        unit_cogs=unit_cogs,
        total_cogs=total_cogs,
        gross_margin=gross_margin,
        variable_costs=var_costs,
        inventory_on_hand=500,
        metadata={
            "ad_id": record.ad_id,
            "adset_id": record.adset_id,
            "frequency": record.frequency,
        },
    )
    rec.compute_derived_metrics()
    return rec


def normalize_google_record(
    record: GoogleAdsRow,
    sku_id: str,
    catalog: Optional[ProductCatalogRegistry] = None,
) -> UnifiedCommerceRecord:
    """Convert GoogleAdsRow into canonical UnifiedCommerceRecord."""
    cat = catalog or default_catalog
    prod = cat.get_by_sku(sku_id)

    dt = normalize_iso_timestamp(record.segments.date)
    spend = record.spend
    impressions = record.metrics.impressions
    clicks = record.metrics.clicks
    conversions = record.metrics.conversions
    revenue = record.revenue

    unit_cogs = prod.unit_cogs if prod else 0.0
    units_sold = int(conversions)
    total_cogs = units_sold * unit_cogs
    gross_margin = max(0.0, revenue - total_cogs)
    var_costs = revenue * 0.03

    rec = UnifiedCommerceRecord(
        timestamp=dt,
        channel="google",
        campaign_id=record.campaign.id,
        campaign_name=record.campaign.name,
        sku_id=sku_id,
        sku_name=prod.product_name if prod else None,
        asin=prod.asin if prod else None,
        variant_id=prod.shopify_variant_id if prod else None,
        spend=spend,
        impressions=impressions,
        clicks=clicks,
        ad_conversions=conversions,
        attributed_revenue=revenue,
        units_sold=units_sold,
        gross_revenue=revenue,
        net_revenue=revenue,
        unit_cogs=unit_cogs,
        total_cogs=total_cogs,
        gross_margin=gross_margin,
        variable_costs=var_costs,
        inventory_on_hand=500,
        metadata={
            "advertising_channel_type": record.campaign.advertising_channel_type,
            "cost_micros": record.metrics.cost_micros,
        },
    )
    rec.compute_derived_metrics()
    return rec


def normalize_amazon_record(
    record: AmazonSponsoredProductsRecord,
    catalog: Optional[ProductCatalogRegistry] = None,
) -> UnifiedCommerceRecord:
    """Convert AmazonSponsoredProductsRecord into canonical UnifiedCommerceRecord."""
    cat = catalog or default_catalog
    # Resolve SKU from ASIN if SKU is not in catalog directly
    canonical_sku = cat.resolve_sku(record.sku)
    if canonical_sku == record.sku and record.asin:
        resolved_from_asin = cat.resolve_sku(record.asin)
        if resolved_from_asin != record.asin:
            canonical_sku = resolved_from_asin

    prod = cat.get_by_sku(canonical_sku)

    dt = normalize_iso_timestamp(record.date)
    spend = convert_currency(record.cost, record.currency, "USD")
    impressions = record.impressions
    clicks = record.clicks
    revenue = convert_currency(record.attributed_sales_14d, record.currency, "USD")
    units_sold = record.attributed_units_ordered_14d

    unit_cogs = prod.unit_cogs if prod else 0.0
    total_cogs = units_sold * unit_cogs
    gross_margin = max(0.0, revenue - total_cogs)
    var_costs = revenue * 0.15  # Amazon FBA & referral fees ~15%

    rec = UnifiedCommerceRecord(
        timestamp=dt,
        channel="amazon",
        campaign_id=record.campaign_id,
        campaign_name=record.campaign_name,
        sku_id=canonical_sku,
        sku_name=prod.product_name if prod else None,
        asin=record.asin,
        variant_id=prod.shopify_variant_id if prod else None,
        currency="USD",
        spend=spend,
        impressions=impressions,
        clicks=clicks,
        ad_conversions=float(units_sold),
        attributed_revenue=revenue,
        units_sold=units_sold,
        gross_revenue=revenue,
        net_revenue=revenue,
        unit_cogs=unit_cogs,
        total_cogs=total_cogs,
        gross_margin=gross_margin,
        variable_costs=var_costs,
        inventory_on_hand=500,
        metadata={
            "currency_original": record.currency,
            "ad_group_id": record.ad_group_id,
        },
    )
    rec.compute_derived_metrics()
    return rec


def normalize_shopify_order(
    order: ShopifyOrder,
    inventory_map: Optional[Dict[str, int]] = None,
    catalog: Optional[ProductCatalogRegistry] = None,
) -> List[UnifiedCommerceRecord]:
    """Convert ShopifyOrder into list of canonical UnifiedCommerceRecord per SKU line item."""
    cat = catalog or default_catalog
    dt = normalize_iso_timestamp(order.created_at)
    records: List[UnifiedCommerceRecord] = []

    for item in order.line_items:
        canonical_sku = cat.resolve_sku(item.sku)
        prod = cat.get_by_sku(canonical_sku)

        unit_cogs = prod.unit_cogs if prod else 0.0
        units_sold = item.quantity
        gross_rev = item.gross_revenue
        net_rev = item.net_revenue
        total_cogs = units_sold * unit_cogs
        gross_margin = max(0.0, net_rev - total_cogs)
        var_costs = net_rev * 0.03

        on_hand = inventory_map.get(canonical_sku, 500) if inventory_map else 500

        rec = UnifiedCommerceRecord(
            timestamp=dt,
            channel="shopify",
            campaign_id=f"order_{order.order_number}",
            campaign_name=f"Shopify Order #{order.order_number}",
            sku_id=canonical_sku,
            sku_name=item.title or (prod.product_name if prod else item.sku),
            asin=prod.asin if prod else None,
            variant_id=item.variant_id or (prod.shopify_variant_id if prod else None),
            spend=0.0,
            impressions=0,
            clicks=0,
            ad_conversions=float(units_sold),
            attributed_revenue=net_rev,
            units_sold=units_sold,
            gross_revenue=gross_rev,
            net_revenue=net_rev,
            discounts=item.total_discount,
            unit_cogs=unit_cogs,
            total_cogs=total_cogs,
            gross_margin=gross_margin,
            variable_costs=var_costs,
            inventory_on_hand=on_hand,
            metadata={
                "order_id": order.id,
                "order_number": order.order_number,
                "financial_status": order.financial_status,
            },
        )
        rec.compute_derived_metrics()
        records.append(rec)

    return records
