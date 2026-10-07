"""Meta Graph API Pydantic v2 Models mirroring /v19.0/{ad_id}/insights."""
from __future__ import annotations

from typing import Any, List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field, field_validator


class MetaAction(BaseModel):
    """Action object within Meta insights actions array (e.g., purchases, leads)."""
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    action_type: str = Field(..., description="Action type, e.g., 'omni_purchase', 'purchase', 'link_click'")
    value: float = Field(..., description="Action count or frequency")
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
    def parse_float_value(cls, v: Any) -> Optional[float]:
        if v is None or v == "":
            return None if v is None else 0.0
        return float(v)


class MetaActionValue(BaseModel):
    """Monetary value associated with an action array (e.g., purchase value)."""
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    action_type: str = Field(..., description="Action type, e.g., 'omni_purchase', 'purchase'")
    value: float = Field(..., description="Aggregated currency value of the action")
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
    def parse_float_value(cls, v: Any) -> Optional[float]:
        if v is None or v == "":
            return None if v is None else 0.0
        return float(v)


class MetaAdInsights(BaseModel):
    """Production-exact Meta Insights model for /v19.0/{ad_id}/insights or /v19.0/act_{id}/insights."""
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    account_id: Optional[str] = Field(None, description="Meta Ad Account ID (act_...)")
    campaign_id: Optional[str] = Field(None, description="Parent Campaign ID")
    campaign_name: Optional[str] = Field(None, description="Campaign Display Name")
    adset_id: Optional[str] = Field(None, description="Meta Ad Set ID")
    adset_name: Optional[str] = Field(None, description="Meta Ad Set Name")
    ad_id: Optional[str] = Field(None, description="Meta Ad Object ID")
    ad_name: Optional[str] = Field(None, description="Meta Ad Name")

    spend: float = Field(..., description="Total spend in account currency")
    impressions: int = Field(..., description="Total view impressions")
    clicks: int = Field(0, description="Total link or interaction clicks")
    cpc: Optional[float] = Field(None, description="Cost per click")
    cpm: Optional[float] = Field(None, description="Cost per 1,000 impressions")
    frequency: Optional[float] = Field(None, description="Average frequency per user")
    date_start: str = Field(..., description="Reporting window start date (YYYY-MM-DD)")
    date_stop: str = Field(..., description="Reporting window stop date (YYYY-MM-DD)")
    actions: List[MetaAction] = Field(default_factory=list, description="List of recorded user actions")
    action_values: List[Union[MetaAction, MetaActionValue]] = Field(default_factory=list, description="Monetary conversion values")

    @field_validator("spend", "cpc", "cpm", "frequency", mode="before")
    @classmethod
    def parse_float_fields(cls, v: Any) -> Optional[float]:
        if v is None or v == "":
            return None
        return float(v)

    @field_validator("impressions", "clicks", mode="before")
    @classmethod
    def parse_int_fields(cls, v: Any) -> int:
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
    def purchase_conversions(self) -> int:
        """Extract omni_purchase or standard purchase count."""
        return int(self.purchases)

    @property
    def purchases(self) -> float:
        """Extract omni_purchase or standard purchase count."""
        val = self.get_action_count("omni_purchase")
        if val > 0:
            return val
        return self.get_action_count("purchase")

    @property
    def purchase_value(self) -> float:
        """Extract omni_purchase or standard purchase revenue."""
        val = self.get_action_value("omni_purchase")
        if val > 0:
            return val
        return self.get_action_value("purchase")

    @property
    def purchase_revenue(self) -> float:
        """Extract omni_purchase or standard purchase revenue."""
        return self.purchase_value

    @property
    def roas(self) -> float:
        """Return on Ad Spend = purchase_value / spend."""
        if self.spend <= 0:
            return 0.0
        return self.purchase_value / self.spend

    @property
    def ctr(self) -> float:
        """Click-through rate percentage or ratio."""
        if not self.impressions:
            return 0.0
        return self.clicks / self.impressions


# Backward compatibility alias
MetaInsightsRecord = MetaAdInsights
