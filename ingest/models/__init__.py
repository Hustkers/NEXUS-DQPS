"""Canonical Pydantic v2 Ingestion Models for Multi-Channel Ad & ERP Data."""
from __future__ import annotations

from .meta import MetaAdInsights, MetaAction, MetaActionValue, MetaInsightsRecord
from .google import (
    GoogleAdsRow,
    GoogleCampaign,
    GoogleSegments,
    GoogleMetrics,
    GoogleAdsCampaign,
    GoogleAdsSegments,
    GoogleAdsMetrics,
)
from .amazon import AmazonSponsoredProductsRow, AmazonSponsoredProductsRecord
from .shopify import ShopifyOrder, ShopifyLineItem, ShopifyInventoryLevel
from .canonical import UnifiedCommerceRecord

__all__ = [
    "MetaAdInsights",
    "MetaInsightsRecord",
    "MetaAction",
    "MetaActionValue",
    "GoogleAdsRow",
    "GoogleCampaign",
    "GoogleSegments",
    "GoogleMetrics",
    "GoogleAdsCampaign",
    "GoogleAdsSegments",
    "GoogleAdsMetrics",
    "AmazonSponsoredProductsRow",
    "AmazonSponsoredProductsRecord",
    "ShopifyOrder",
    "ShopifyLineItem",
    "ShopifyInventoryLevel",
    "UnifiedCommerceRecord",
]
