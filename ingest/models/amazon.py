"""Production-exact Amazon Advertising API Pydantic v2 models.

Mirroring Amazon Advertising API Sponsored Products (SP) Reporting:
Fields: campaignId, campaignName, adGroupId, asin, sku, date,
impressions, clicks, cost, attributedSales14d, attributedUnitsOrdered14d, currency.
"""

from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class AmazonSponsoredProductsRecord(BaseModel):
    """Production-exact Amazon Advertising API Sponsored Products Report Record."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    campaign_id: str = Field(..., alias="campaignId", description="Amazon Campaign ID")
    campaign_name: str = Field(..., alias="campaignName", description="Amazon Campaign Name")
    ad_group_id: Optional[str] = Field(default=None, alias="adGroupId", description="Amazon Ad Group ID")
    ad_group_name: Optional[str] = Field(default=None, alias="adGroupName", description="Amazon Ad Group Name")
    ad_id: Optional[str] = Field(default=None, alias="adId", description="Amazon Ad ID")

    asin: str = Field(..., description="Amazon Standard Identification Number (e.g., B00...)")
    sku: str = Field(..., description="Merchant Stock Keeping Unit")
    date: str = Field(..., description="Reporting date (YYYY-MM-DD)")

    impressions: int = Field(default=0, description="Total ad impressions")
    clicks: int = Field(default=0, description="Total ad clicks")
    cost: float = Field(default=0.0, description="Ad spend in account currency")

    attributed_sales_14d: float = Field(
        default=0.0,
        alias="attributedSales14d",
        description="Total sales attributed within 14-day window",
    )
    attributed_units_ordered_14d: int = Field(
        default=0,
        alias="attributedUnitsOrdered14d",
        description="Total units ordered attributed within 14-day window",
    )
    currency: str = Field(default="USD", description="Currency ISO 4217 code")

    # Optional 1d and 7d attribution metrics
    attributed_sales_1d: Optional[float] = Field(default=None, alias="attributedSales1d")
    attributed_sales_7d: Optional[float] = Field(default=None, alias="attributedSales7d")
    attributed_units_ordered_1d: Optional[int] = Field(default=None, alias="attributedUnitsOrdered1d")
    attributed_units_ordered_7d: Optional[int] = Field(default=None, alias="attributedUnitsOrdered7d")

    @field_validator("campaign_id", "ad_group_id", "ad_id", mode="before")
    @classmethod
    def stringify_ids(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        return str(v)

    @field_validator("cost", "attributed_sales_14d", "attributed_sales_1d", "attributed_sales_7d", mode="before")
    @classmethod
    def parse_float_fields(cls, v: Any) -> Optional[float]:
        if v is None or v == "":
            return 0.0
        return float(v)

    @field_validator("impressions", "clicks", "attributed_units_ordered_14d", "attributed_units_ordered_1d", "attributed_units_ordered_7d", mode="before")
    @classmethod
    def parse_int_fields(cls, v: Any) -> Optional[int]:
        if v is None or v == "":
            return 0
        return int(float(v))

    @property
    def spend(self) -> float:
        """Alias for cost."""
        return self.cost

    @property
    def revenue(self) -> float:
        """Alias for 14-day attributed sales."""
        return self.attributed_sales_14d

    @property
    def roas(self) -> float:
        """Return on Ad Spend = attributedSales14d / cost."""
        if self.cost <= 0:
            return 0.0
        return self.attributed_sales_14d / self.cost

    @property
    def acos(self) -> float:
        """Advertising Cost of Sales (ACoS = cost / attributedSales14d)."""
        if self.attributed_sales_14d <= 0:
            return 0.0
        return (self.cost / self.attributed_sales_14d) * 100.0

    @property
    def cpc(self) -> float:
        """Cost per click = cost / clicks."""
        if self.clicks <= 0:
            return 0.0
        return self.cost / self.clicks

    @property
    def ctr(self) -> float:
        """Click-through rate = clicks / impressions."""
        if self.impressions <= 0:
            return 0.0
        return self.clicks / self.impressions
