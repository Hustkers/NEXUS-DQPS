"""Production-exact Shopify Admin REST / Webhook Pydantic v2 models.

Mirroring Shopify Admin API resources:
Order (orders/create webhook & REST resource)
InventoryLevel (inventory_levels/connect & inventory_levels/set webhook & REST resource)
"""

from __future__ import annotations

from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ShopifyLineItem(BaseModel):
    """Line item in a Shopify Order."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    id: Optional[str] = Field(default=None, description="Shopify Line Item ID")
    variant_id: Optional[str] = Field(default=None, description="Shopify Product Variant ID")
    product_id: Optional[str] = Field(default=None, description="Shopify Product ID")
    title: Optional[str] = Field(default=None, description="Product title")
    sku: str = Field(..., description="Product SKU identifier")
    price: float = Field(..., description="Unit sale price")
    quantity: int = Field(..., description="Quantity ordered")
    total_discount: float = Field(default=0.0, description="Total discount applied to this line item")

    @field_validator("variant_id", "id", "product_id", mode="before")
    @classmethod
    def stringify_ids(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        return str(v)

    @field_validator("price", "total_discount", mode="before")
    @classmethod
    def parse_floats(cls, v: Any) -> float:
        if v is None or v == "":
            return 0.0
        return float(v)

    @field_validator("quantity", mode="before")
    @classmethod
    def parse_ints(cls, v: Any) -> int:
        if v is None or v == "":
            return 0
        return int(float(v))

    @property
    def gross_revenue(self) -> float:
        """Gross revenue before discounts: price * quantity."""
        return self.price * self.quantity

    @property
    def net_revenue(self) -> float:
        """Net revenue after line discounts."""
        return max(0.0, self.gross_revenue - self.total_discount)


class ShopifyOrder(BaseModel):
    """Production-exact Shopify Order payload."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    id: str = Field(..., description="Shopify Order ID")
    order_number: int = Field(..., description="Human-readable sequential order number")
    created_at: str = Field(..., description="ISO 8601 UTC creation timestamp")
    line_items: List[ShopifyLineItem] = Field(..., description="List of purchased line items")
    total_price: float = Field(..., description="Total order amount including taxes and shipping")
    subtotal_price: float = Field(..., description="Subtotal amount before shipping and taxes")
    total_tax: Optional[float] = Field(default=0.0, description="Total taxes collected")
    total_discounts: Optional[float] = Field(default=0.0, description="Total discounts across the order")
    currency: str = Field(default="USD", description="Currency code (e.g., USD)")
    financial_status: Optional[str] = Field(default="paid", description="Financial status: paid, pending, refunded")
    cancelled_at: Optional[str] = Field(default=None, description="Cancellation timestamp if cancelled")

    @field_validator("id", mode="before")
    @classmethod
    def stringify_id(cls, v: Any) -> str:
        return str(v)

    @field_validator("order_number", mode="before")
    @classmethod
    def parse_order_number(cls, v: Any) -> int:
        return int(float(v))

    @field_validator("total_price", "subtotal_price", "total_tax", "total_discounts", mode="before")
    @classmethod
    def parse_floats(cls, v: Any) -> float:
        if v is None or v == "":
            return 0.0
        return float(v)

    @property
    def total_quantity(self) -> int:
        """Total unit count across all line items."""
        return sum(item.quantity for item in self.line_items)

    @property
    def skus(self) -> List[str]:
        """Unique list of SKUs in this order."""
        return list({item.sku for item in self.line_items})


class ShopifyInventoryLevel(BaseModel):
    """Shopify Inventory Level and ERP unit COGS model."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    inventory_item_id: str = Field(..., description="Shopify Inventory Item ID")
    location_id: str = Field(..., description="Shopify Location ID")
    available: int = Field(..., description="Quantity of inventory items available for purchase")
    sku: str = Field(..., description="Associated SKU code")
    unit_cogs: float = Field(default=0.0, description="Unit Cost of Goods Sold from ERP/Shopify")
    updated_at: Optional[str] = Field(default=None, description="ISO 8601 timestamp of inventory update")

    @field_validator("inventory_item_id", "location_id", mode="before")
    @classmethod
    def stringify_ids(cls, v: Any) -> str:
        return str(v)

    @field_validator("available", mode="before")
    @classmethod
    def parse_available(cls, v: Any) -> int:
        if v is None or v == "":
            return 0
        return int(float(v))

    @field_validator("unit_cogs", mode="before")
    @classmethod
    def parse_cogs(cls, v: Any) -> float:
        if v is None or v == "":
            return 0.0
        return float(v)
