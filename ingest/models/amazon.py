"""Amazon Advertising API Pydantic v2 Models mirroring Sponsored Products Reporting."""
from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class AmazonSponsoredProductsRow(BaseModel):
    """Production-exact Amazon Ads Sponsored Products daily report row."""
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    campaign_id: str = Field(..., alias="campaignId", description="Amazon Campaign ID")
    campaign_name: str = Field(..., alias="campaignName", description="Amazon Campaign Name")
    ad_group_id: Optional[str] = Field(None, alias="adGroupId", description="Amazon Ad Group ID")
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

    @field_validator("campaign_id", "ad_group_id", mode="before")
    @classmethod
    def stringify_ids(cls, v: Any) -> Optional[str]:
        return str(v) if v is not None else None

    @field_validator("impressions", "clicks", "attributed_units_ordered_14d", mode="before")
    @classmethod
    def parse_int(cls, v: Any) -> int:
        return int(float(v)) if v is not None else 0

    @field_validator("cost", "attributed_sales_14d", mode="before")
    @classmethod
    def parse_float(cls, v: Any) -> float:
        return float(v) if v is not None else 0.0

    @property
    def roas(self) -> float:
        """Attributed 14-day ROAS."""
        return round(self.attributed_sales_14d / max(self.cost, 1e-6), 2)
