"""Meta Graph API Pydantic v2 Models mirroring /v19.0/{ad_id}/insights."""
from __future__ import annotations

from datetime import date
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class MetaAction(BaseModel):
    """Action object within Meta insights actions array (e.g., purchases, leads)."""
    model_config = ConfigDict(extra="ignore")

    action_type: str = Field(..., description="Action type, e.g., 'omni_purchase', 'purchase', 'link_click'")
    value: float = Field(..., description="Action count or frequency")

    @field_validator("value", mode="before")
    @classmethod
    def parse_float_value(cls, v: Any) -> float:
        return float(v) if v is not None else 0.0


class MetaActionValue(BaseModel):
    """Monetary value associated with an action array (e.g., purchase value)."""
    model_config = ConfigDict(extra="ignore")

    action_type: str = Field(..., description="Action type, e.g., 'omni_purchase', 'purchase'")
    value: float = Field(..., description="Aggregated currency value of the action")

    @field_validator("value", mode="before")
    @classmethod
    def parse_float_value(cls, v: Any) -> float:
        return float(v) if v is not None else 0.0


class MetaAdInsights(BaseModel):
    """Production-exact Meta Insights model for /v19.0/{ad_id}/insights or /v19.0/act_{id}/insights."""
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    ad_id: Optional[str] = Field(None, description="Meta Ad Object ID")
    campaign_id: Optional[str] = Field(None, description="Parent Campaign ID")
    campaign_name: Optional[str] = Field(None, description="Campaign Display Name")
    spend: float = Field(..., description="Total spend in account currency")
    impressions: int = Field(..., description="Total view impressions")
    clicks: int = Field(0, description="Total link or interaction clicks")
    cpc: Optional[float] = Field(None, description="Cost per click")
    cpm: Optional[float] = Field(None, description="Cost per 1,000 impressions")
    frequency: Optional[float] = Field(None, description="Average frequency per user")
    date_start: str = Field(..., description="Reporting window start date (YYYY-MM-DD)")
    date_stop: str = Field(..., description="Reporting window stop date (YYYY-MM-DD)")
    actions: List[MetaAction] = Field(default_factory=list, description="List of recorded user actions")
    action_values: List[MetaActionValue] = Field(default_factory=list, description="Monetary conversion values")

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

    @property
    def purchase_conversions(self) -> int:
        """Extract omni_purchase or standard purchase count."""
        for a in self.actions:
            if a.action_type in ("omni_purchase", "purchase"):
                return int(a.value)
        return 0

    @property
    def purchase_revenue(self) -> float:
        """Extract omni_purchase or standard purchase revenue."""
        for av in self.action_values:
            if av.action_type in ("omni_purchase", "purchase"):
                return float(av.value)
        return 0.0
