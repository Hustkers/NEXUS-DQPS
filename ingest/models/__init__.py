"""Pydantic v2 data models for multi-platform ad telemetry and canonical records."""

from ingest.models.amazon import AmazonSponsoredProductsRecord
from ingest.models.canonical import UnifiedCommerceRecord
from ingest.models.google import (
    GoogleAdsCampaign,
    GoogleAdsMetrics,
    GoogleAdsRow,
    GoogleAdsSegments,
)
from ingest.models.meta import MetaAction, MetaInsightsRecord
from ingest.models.shopify import ShopifyInventoryLevel, ShopifyLineItem, ShopifyOrder

__all__ = [
    "MetaAction",
    "MetaInsightsRecord",
    "GoogleAdsCampaign",
    "GoogleAdsSegments",
    "GoogleAdsMetrics",
    "GoogleAdsRow",
    "AmazonSponsoredProductsRecord",
    "ShopifyLineItem",
    "ShopifyOrder",
    "ShopifyInventoryLevel",
    "UnifiedCommerceRecord",
]
