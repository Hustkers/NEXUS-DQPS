"""Google Ads API Pydantic v2 Models mirroring GoogleAdsRow."""
from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class GoogleCampaign(BaseModel):
    """Google Ads campaign resource."""
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    id: str = Field(..., description="Unique Google Campaign ID")
    name: str = Field(..., description="Campaign display name")
    advertising_channel_type: Optional[str] = Field(
        default="SEARCH",
        alias="advertisingChannelType",
        description="e.g., 'SEARCH', 'SHOPPING', 'PERFORMANCE_MAX', 'DISPLAY'"
    )
    status: Optional[str] = Field(default="ENABLED", description="Campaign status: ENABLED, PAUSED, REMOVED")

    @field_validator("id", mode="before")
    @classmethod
    def stringify_id(cls, v: Any) -> str:
        return str(v)


class GoogleSegments(BaseModel):
    """Segmentation fields for Google Ads rows."""
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    date: str = Field(..., description="Reporting date string (YYYY-MM-DD)")
    device: Optional[str] = Field(default=None, description="Device segment (DESKTOP, MOBILE, TABLET)")
    day_of_week: Optional[str] = Field(default=None, description="Day of week segment")


class GoogleMetrics(BaseModel):
    """Performance metrics in Google Ads response."""
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    impressions: int = Field(0, description="Count of impressions")
    clicks: int = Field(0, description="Count of user clicks")
    cost_micros: int = Field(
        0,
        alias="costMicros",
        description="Spend in micros (1 USD = 1,000,000 micros)"
    )
    conversions: float = Field(0.0, description="Attributed conversion count")
    conversions_value: float = Field(
        0.0,
        alias="conversionsValue",
        description="Monetary conversion value in account currency"
    )
    average_cpc: Optional[float] = Field(
        None,
        alias="averageCpc",
        description="Average cost per click in micros"
    )
    ctr: Optional[float] = Field(default=None, description="Click-through rate")

    @field_validator("impressions", "clicks", "cost_micros", mode="before")
    @classmethod
    def parse_int(cls, v: Any) -> int:
        return int(float(v)) if v is not None else 0

    @field_validator("conversions", "conversions_value", "average_cpc", "ctr", mode="before")
    @classmethod
    def parse_float(cls, v: Any) -> Optional[float]:
        return float(v) if v is not None else 0.0

    @property
    def cost(self) -> float:
        """Spend converted from micros to standard currency."""
        return self.cost_micros / 1_000_000.0

    @property
    def spend(self) -> float:
        """Spend converted from micros to standard currency."""
        return round(self.cost_micros / 1_000_000.0, 2)


class GoogleAdsRow(BaseModel):
    """Canonical GoogleAdsRow returned from Search and SearchStream endpoints."""
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    campaign: GoogleCampaign = Field(..., description="Campaign resource details")
    segments: GoogleSegments = Field(..., description="Date segments")
    metrics: GoogleMetrics = Field(..., description="Performance metric payload")
    customer_id: Optional[str] = Field(default=None, description="Google Ads Customer ID (XXX-XXX-XXXX)")

    @property
    def spend(self) -> float:
        return self.metrics.cost

    @property
    def cost(self) -> float:
        return self.metrics.cost

    @property
    def revenue(self) -> float:
        return self.metrics.conversions_value

    @property
    def roas(self) -> float:
        if self.spend <= 0:
            return 0.0
        return self.revenue / self.spend

    @property
    def date(self) -> str:
        return self.segments.date

    @property
    def campaign_name(self) -> str:
        return self.campaign.name

    @property
    def ctr(self) -> float:
        if self.metrics.impressions <= 0:
            return 0.0
        return self.metrics.clicks / self.metrics.impressions

    @property
    def cvr(self) -> float:
        if self.metrics.clicks <= 0:
            return 0.0
        return self.metrics.conversions / self.metrics.clicks


# Aliases for backward compatibility
GoogleAdsCampaign = GoogleCampaign
GoogleAdsSegments = GoogleSegments
GoogleAdsMetrics = GoogleMetrics
