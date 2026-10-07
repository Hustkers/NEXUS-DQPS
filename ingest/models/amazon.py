"""Amazon Advertising API Pydantic v2 Models mirroring Sponsored Products Reporting."""
from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class AmazonSponsoredProductsRow(BaseModel):
    """Production-exact Amazon Ads Sponsored Products daily report row."""
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    campaign_id: str = Field(..., alias="campaignId", description="Amazon Campaign ID")
    campaign_name: str = Field(..., alias="campaignName", description="Amazon Campaign Name")
    ad_group_id: Optional[str] = Field(None, alias="adGroupId", description="Amazon Ad Group ID")
    ad_group_name: Optional[str] = Field(None, alias="adGroupName", description="Amazon Ad Group Name")
    ad_id: Optional[str] = Field(None, alias="adId", description="Amazon Ad ID")

    asin: Optional[str] = Field(None, description="Amazon Standard Identification Number")
    sku: Optional[str] = Field(None, description="Seller Merchant SKU")
    date: str = Field(..., description="Report date string (YYYY-MM-DD)")
    impressions: int = Field(0, description="Total ad impressions")
    clicks: int = Field(0, description="Total clicks")
    cost: float = Field(0.0, description="Total ad cost in account currency")
    attributed_sales_14d: float = Field(
        0.0,
        alias="attributedSales14d",
        description="14-day total sales attributed to ad clicks"
    )
    attributed_units_ordered_14d: int = Field(
        0,
        alias="attributedUnitsOrdered14d",
        description="14-day total units ordered attributed to ad clicks"
    )
    currency: str = Field("USD", description="Currency code (e.g. USD, EUR, INR)")

    # Optional 1d and 7d attribution metrics
    attributed_sales_1d: Optional[float] = Field(default=None, alias="attributedSales1d")
    attributed_sales_7d: Optional[float] = Field(default=None, alias="attributedSales7d")
    attributed_units_ordered_1d: Optional[int] = Field(default=None, alias="attributedUnitsOrdered1d")
    attributed_units_ordered_7d: Optional[int] = Field(default=None, alias="attributedUnitsOrdered7d")

    @field_validator("campaign_id", "ad_group_id", "ad_id", mode="before")
    @classmethod
    def stringify_ids(cls, v: Any) -> Optional[str]:
        return str(v) if v is not None else None

    @field_validator("impressions", "clicks", "attributed_units_ordered_14d", "attributed_units_ordered_1d", "attributed_units_ordered_7d", mode="before")
    @classmethod
    def parse_int(cls, v: Any) -> int:
        return int(float(v)) if v is not None and v != "" else 0

    @field_validator("cost", "attributed_sales_14d", "attributed_sales_1d", "attributed_sales_7d", mode="before")
    @classmethod
    def parse_float(cls, v: Any) -> float:
        return float(v) if v is not None and v != "" else 0.0

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
        """Attributed 14-day ROAS."""
        if self.cost <= 0:
            return 0.0
        return round(self.attributed_sales_14d / max(self.cost, 1e-6), 2)

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


# Alias for backward compatibility
AmazonSponsoredProductsRecord = AmazonSponsoredProductsRow
