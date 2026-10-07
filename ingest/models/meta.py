"""Production-exact Meta Graph API Pydantic v2 models.

Mirroring Meta Graph API endpoint:
/v19.0/{ad_id}/insights
"""

from __future__ import annotations

from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class MetaAction(BaseModel):
    """Action metric breakdown object in Meta Graph API insights."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    action_type: str = Field(
        ...,
        description="Action type identifier (e.g., 'omni_purchase', 'link_click', 'add_to_cart', 'landing_page_view')",
    )
    value: float = Field(
        ...,
        description="Aggregated count or monetary value of the action",
    )
    view_1d: Optional[float] = Field(
        default=None,
        alias="1d_view",
        description="Conversions attributed within 1-day view window",
    )
    click_7d: Optional[float] = Field(
        default=None,
        alias="7d_click",
        description="Conversions attributed within 7-day click window",
    )
    click_28d: Optional[float] = Field(
        default=None,
        alias="28d_click",
        description="Conversions attributed within 28-day click window",
    )

    @field_validator("value", "view_1d", "click_7d", "click_28d", mode="before")
    @classmethod
    def parse_numeric(cls, v: Any) -> Any:
        if v is None or v == "":
            return None
        return float(v)


class MetaInsightsRecord(BaseModel):
    """Production-exact Meta Graph API /v19.0/{ad_id}/insights record.

    Matches attributes returned by the Meta Ads Insights API:
    spend, impressions, clicks, cpc, cpm, frequency, actions, action_values, date_start, date_stop.
    """

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    account_id: Optional[str] = Field(default=None, description="Meta Ad Account ID (act_...)")
    campaign_id: Optional[str] = Field(default=None, description="Meta Campaign ID")
    campaign_name: Optional[str] = Field(default=None, description="Meta Campaign Name")
    adset_id: Optional[str] = Field(default=None, description="Meta Ad Set ID")
    adset_name: Optional[str] = Field(default=None, description="Meta Ad Set Name")
    ad_id: Optional[str] = Field(default=None, description="Meta Ad ID")
    ad_name: Optional[str] = Field(default=None, description="Meta Ad Name")

    spend: float = Field(
        ...,
        description="Total ad spend amount in account currency (e.g. USD)",
    )
    impressions: int = Field(
        ...,
        description="The number of times your ads were on screen",
    )
    clicks: int = Field(
        ...,
        description="The number of clicks on your ads",
    )
    cpc: Optional[float] = Field(
        default=None,
        description="Average cost per link/all click",
    )
    cpm: Optional[float] = Field(
        default=None,
        description="Average cost per 1,000 impressions",
    )
    frequency: Optional[float] = Field(
        default=1.0,
        description="Average number of times each person saw your ad",
    )

    actions: List[MetaAction] = Field(
        default_factory=list,
        description="Array of action objects (counts for omni_purchase, link_click, etc.)",
    )
    action_values: List[MetaAction] = Field(
        default_factory=list,
        description="Array of action value objects (monetary value for omni_purchase, etc.)",
    )

    date_start: str = Field(
        ...,
        description="Start date for the insight metric interval (YYYY-MM-DD)",
    )
    date_stop: str = Field(
        ...,
        description="End date for the insight metric interval (YYYY-MM-DD)",
    )

    @field_validator("spend", "cpc", "cpm", "frequency", mode="before")
    @classmethod
    def parse_float_fields(cls, v: Any) -> Any:
        if v is None or v == "":
            return None
        return float(v)

    @field_validator("impressions", "clicks", mode="before")
    @classmethod
    def parse_int_fields(cls, v: Any) -> Any:
        if v is None or v == "":
            return 0
        return int(float(v))

    def get_action_count(self, action_type: str = "omni_purchase") -> float:
        """Retrieve total action count matching action_type."""
        for item in self.actions:
            if item.action_type == action_type:
                return item.value
        return 0.0

    def get_action_value(self, action_type: str = "omni_purchase") -> float:
        """Retrieve total revenue or monetary value matching action_type."""
        for item in self.action_values:
            if item.action_type == action_type:
                return item.value
        return 0.0

    @property
    def purchases(self) -> float:
        """Total purchases count (omni_purchase or purchase)."""
        val = self.get_action_count("omni_purchase")
        if val > 0:
            return val
        return self.get_action_count("purchase")

    @property
    def purchase_value(self) -> float:
        """Total purchase value (omni_purchase or purchase)."""
        val = self.get_action_value("omni_purchase")
        if val > 0:
            return val
        return self.get_action_value("purchase")

    @property
    def roas(self) -> float:
        """Return Return on Ad Spend (ROAS = purchase_value / spend)."""
        if self.spend <= 0:
            return 0.0
        return self.purchase_value / self.spend

    @property
    def ctr(self) -> float:
        """Click-through rate (CTR = clicks / impressions)."""
        if self.impressions <= 0:
            return 0.0
        return self.clicks / self.impressions
