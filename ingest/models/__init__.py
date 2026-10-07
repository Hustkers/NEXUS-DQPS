"""Canonical Pydantic v2 Ingestion Models for Multi-Channel Ad & ERP Data."""
from __future__ import annotations

from .meta import MetaAdInsights, MetaAction, MetaActionValue
from .google import GoogleAdsRow, GoogleCampaign, GoogleSegments, GoogleMetrics
from .amazon import AmazonSponsoredProductsRow
from .shopify import ShopifyOrder, ShopifyLineItem, ShopifyInventoryLevel

__all__ = [
    "MetaAdInsights",
    "MetaAction",
    "MetaActionValue",
    "GoogleAdsRow",
    "GoogleCampaign",
    "GoogleSegments",
    "GoogleMetrics",
    "AmazonSponsoredProductsRow",
    "ShopifyOrder",
    "ShopifyLineItem",
    "ShopifyInventoryLevel",
]
