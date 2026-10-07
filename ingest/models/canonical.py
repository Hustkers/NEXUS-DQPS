"""Canonical continuous-time tensor UnifiedCommerceRecord.

Indexes reconciled operational metrics over:
(timestamp, channel, campaign_id, sku_id)
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class UnifiedCommerceRecord(BaseModel):
    """Canonical Unified Commerce Record.

    Continuous-time tensor reconciling multi-channel ad spend, conversion attributions,
    and Shopify storefront transactions/inventory over (timestamp, channel, campaign_id, sku_id).
    """

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    # Primary Multi-Dimensional Index
    timestamp: datetime = Field(
        ...,
        description="Continuous-time or daily ISO 8601 UTC timestamp",
    )
    channel: str = Field(
        ...,
        description="Ad or commerce channel: 'meta', 'google', 'amazon', 'shopify'",
    )
    campaign_id: str = Field(
        ...,
        description="Unique campaign identifier",
    )
    sku_id: str = Field(
        ...,
        description="Canonical Stock Keeping Unit (SKU) identifier",
    )

    # Descriptive metadata
    campaign_name: str = Field(default="", description="Human-readable campaign name")
    sku_name: Optional[str] = Field(default=None, description="Product / variant title")
    asin: Optional[str] = Field(default=None, description="Amazon ASIN if mapped")
    variant_id: Optional[str] = Field(default=None, description="Shopify variant ID if mapped")
    currency: str = Field(default="USD", description="Currency code (USD)")

    # Advertising Telemetry
    spend: float = Field(default=0.0, description="Total media spend in USD")
    impressions: int = Field(default=0, description="Ad impressions count")
    clicks: int = Field(default=0, description="Ad clicks count")
    cpc: float = Field(default=0.0, description="Cost Per Click")
    cpm: float = Field(default=0.0, description="Cost Per Mille (thousand impressions)")
    ctr: float = Field(default=0.0, description="Click-Through Rate")
    ad_conversions: float = Field(default=0.0, description="Platform-reported attributed conversions")
    attributed_revenue: float = Field(default=0.0, description="Platform-reported attributed sales value")
    roas: float = Field(default=0.0, description="Platform Return on Ad Spend")

    # Shopify Storefront & Reconciled Order Economics
    units_sold: int = Field(default=0, description="Actual physical units sold via Shopify")
    gross_revenue: float = Field(default=0.0, description="Total gross sales revenue before discounts/tax")
    net_revenue: float = Field(default=0.0, description="Net revenue collected after discounts")
    discounts: float = Field(default=0.0, description="Total promotional discounts applied")
    unit_cogs: float = Field(default=0.0, description="Unit Cost of Goods Sold from ERP")
    total_cogs: float = Field(default=0.0, description="Total COGS = units_sold * unit_cogs")
    gross_margin: float = Field(default=0.0, description="Gross Margin = net_revenue - total_cogs")
    variable_costs: float = Field(default=0.0, description="Variable payment/fulfillment/shipping fees")
    net_contribution_margin: float = Field(
        default=0.0,
        description="Net Contribution Margin (NCM) = net_revenue - total_cogs - spend - variable_costs",
    )
    poas: float = Field(
        default=0.0,
        description="Profit on Ad Spend = gross_margin / spend (0 if spend=0)",
    )
    mer: float = Field(
        default=0.0,
        description="Marketing Efficiency Ratio = net_revenue / spend (0 if spend=0)",
    )

    # Physical Inventory State
    inventory_on_hand: int = Field(default=0, description="Available stock units at warehouse")
    inventory_status: str = Field(
        default="IN_STOCK",
        description="Inventory state: 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'",
    )
    days_of_supply: Optional[float] = Field(
        default=None,
        description="Estimated days of inventory runway remaining based on current velocity",
    )

    # Open Telemetry Attributes
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Platform specific raw payload attributes or tracking markers",
    )

    @field_validator("timestamp", mode="before")
    @classmethod
    def parse_datetime(cls, v: Any) -> datetime:
        if isinstance(v, datetime):
            return v
        if isinstance(v, str):
            # Parse ISO formatted strings or simple dates
            if len(v) == 10 and "-" in v:
                return datetime.fromisoformat(f"{v}T00:00:00+00:00")
            return datetime.fromisoformat(v)
        raise ValueError(f"Invalid timestamp format: {v}")

    def compute_derived_metrics(self) -> None:
        """Calculate and update derived financial and efficiency metrics."""
        # Ad metrics
        if self.impressions > 0:
            self.ctr = self.clicks / self.impressions
            self.cpm = (self.spend / self.impressions) * 1000.0
        if self.clicks > 0:
            self.cpc = self.spend / self.clicks

        if self.spend > 0:
            self.roas = self.attributed_revenue / self.spend
            self.poas = self.gross_margin / self.spend
            self.mer = self.net_revenue / self.spend
        else:
            self.roas = 0.0
            self.poas = 0.0
            self.mer = 0.0

        if self.total_cogs == 0.0 and self.unit_cogs > 0.0:
            self.total_cogs = self.units_sold * self.unit_cogs

        if self.gross_margin == 0.0 and self.net_revenue > 0.0:
            self.gross_margin = self.net_revenue - self.total_cogs

        self.net_contribution_margin = (
            self.net_revenue - self.total_cogs - self.spend - self.variable_costs
        )

        if self.inventory_on_hand <= 0:
            self.inventory_status = "OUT_OF_STOCK"
        elif self.inventory_on_hand < 50:
            self.inventory_status = "LOW_STOCK"
        else:
            self.inventory_status = "IN_STOCK"
