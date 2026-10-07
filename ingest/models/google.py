"""Production-exact Google Ads API Pydantic v2 models.

Mirroring Google Ads API SearchStream / Search response:
GoogleAdsRow with campaign, segments, and metrics resources.
"""

from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class GoogleAdsCampaign(BaseModel):
    """Google Ads Campaign resource representation."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    id: str = Field(..., description="Google Ads Campaign ID (numeric string or int)")
    name: str = Field(..., description="Campaign name")
    advertising_channel_type: str = Field(
        default="SEARCH",
        description="Channel type: SEARCH, PERFORMANCE_MAX, DISPLAY, SHOPPING, VIDEO",
    )
    status: Optional[str] = Field(default="ENABLED", description="Campaign status: ENABLED, PAUSED, REMOVED")

    @field_validator("id", mode="before")
    @classmethod
    def stringify_id(cls, v: Any) -> str:
        return str(v)


class GoogleAdsSegments(BaseModel):
    """Google Ads Segments resource representation."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    date: str = Field(..., description="Date segment formatted as YYYY-MM-DD")
    device: Optional[str] = Field(default=None, description="Device segment (DESKTOP, MOBILE, TABLET)")
    day_of_week: Optional[str] = Field(default=None, description="Day of week segment")


class GoogleAdsMetrics(BaseModel):
    """Google Ads Metrics resource representation with cost_micros."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    impressions: int = Field(default=0, description="Count of impressions")
    clicks: int = Field(default=0, description="Count of clicks")
    cost_micros: int = Field(
        default=0,
        description="The sum of your cost-per-click (CPC) and cost-per-thousand impressions (CPM) in millionths of the currency",
    )
    conversions: float = Field(default=0.0, description="The number of conversions")
    conversions_value: float = Field(
        default=0.0,
        description="The total value of conversions (monetary sum)",
    )
    average_cpc: Optional[float] = Field(
        default=None,
        description="Average cost per click in micro currency or currency units",
    )
    ctr: Optional[float] = Field(default=None, description="Click-through rate")

    @field_validator("cost_micros", "impressions", "clicks", mode="before")
    @classmethod
    def parse_ints(cls, v: Any) -> int:
        if v is None or v == "":
            return 0
        return int(float(v))

    @field_validator("conversions", "conversions_value", "average_cpc", "ctr", mode="before")
    @classmethod
    def parse_floats(cls, v: Any) -> Optional[float]:
        if v is None or v == "":
            return None
        return float(v)

    @property
    def cost(self) -> float:
        """Ad spend in primary currency units (e.g. USD) converted from cost_micros."""
        return self.cost_micros / 1_000_000.0


class GoogleAdsRow(BaseModel):
    """Production-exact Google Ads API GoogleAdsRow.

    Represents a single row of GoogleAdsService.Search or SearchStream response.
    """

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    campaign: GoogleAdsCampaign = Field(..., description="Campaign details")
    segments: GoogleAdsSegments = Field(..., description="Segments including date")
    metrics: GoogleAdsMetrics = Field(..., description="Performance metrics")
    customer_id: Optional[str] = Field(default=None, description="Google Ads Customer ID (XXX-XXX-XXXX)")

    @property
    def spend(self) -> float:
        """Ad spend in USD / standard currency units."""
        return self.metrics.cost

    @property
    def revenue(self) -> float:
        """Conversion value revenue."""
        return self.metrics.conversions_value

    @property
    def roas(self) -> float:
        """Return on Ad Spend = conversions_value / spend."""
        if self.spend <= 0:
            return 0.0
        return self.revenue / self.spend

    @property
    def ctr(self) -> float:
        """Click-through rate."""
        if self.metrics.impressions <= 0:
            return 0.0
        return self.metrics.clicks / self.metrics.impressions

    @property
    def cvr(self) -> float:
        """Conversion rate = conversions / clicks."""
        if self.metrics.clicks <= 0:
            return 0.0
        return self.metrics.conversions / self.metrics.clicks
