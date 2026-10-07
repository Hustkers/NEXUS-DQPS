"""Shopify Admin REST / Webhook Pydantic v2 Models for Orders and Inventory."""
from __future__ import annotations

from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ShopifyLineItem(BaseModel):
    """Line item within a Shopify Order."""
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    variant_id: Optional[str] = Field(None, description="Product Variant ID")
    sku: Optional[str] = Field(None, description="Stock Keeping Unit")
    price: float = Field(..., description="Unit price charged")
    quantity: int = Field(..., description="Quantity ordered")
    total_discount: float = Field(0.0, description="Discounts allocated to this line item")

    @field_validator("variant_id", mode="before")
    @classmethod
    def stringify_variant(cls, v: Any) -> Optional[str]:
        return str(v) if v is not None else None

    @field_validator("price", "total_discount", mode="before")
    @classmethod
    def parse_float(cls, v: Any) -> float:
        return float(v) if v is not None else 0.0

    @field_validator("quantity", mode="before")
    @classmethod
    def parse_int(cls, v: Any) -> int:
        return int(float(v)) if v is not None else 0

    @property
    def gross_line_total(self) -> float:
        return round(self.price * self.quantity - self.total_discount, 2)


class ShopifyOrder(BaseModel):
    """Shopify Order resource from REST API or order/create Webhooks."""
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    id: str = Field(..., description="Unique Shopify Order ID")
    order_number: str = Field(..., description="Public order number")
    created_at: str = Field(..., description="Order creation timestamp ISO8601")
    line_items: List[ShopifyLineItem] = Field(default_factory=list, description="Array of purchased items")
    total_price: float = Field(..., description="Total order amount charged")
    subtotal_price: float = Field(..., description="Subtotal before taxes & shipping")

    @field_validator("id", "order_number", mode="before")
    @classmethod
    def stringify_ids(cls, v: Any) -> str:
        return str(v)

    @field_validator("total_price", "subtotal_price", mode="before")
    @classmethod
    def parse_floats(cls, v: Any) -> float:
        return float(v) if v is not None else 0.0

    @property
    def order_date(self) -> str:
        """Extract YYYY-MM-DD from ISO timestamp."""
        return self.created_at[:10]


class ShopifyInventoryLevel(BaseModel):
    """Inventory quantity and unit cost of goods sold (COGS) at a location."""
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    inventory_item_id: str = Field(..., description="Shopify InventoryItem ID")
    location_id: str = Field(..., description="Shopify Fulfillment Location ID")
    available: int = Field(0, description="Available stock units for sale")
    sku: Optional[str] = Field(None, description="Associated Merchant SKU")
    unit_cogs: float = Field(0.0, description="Unit cost of goods sold from ERP or inventoryItem.cost")

    @field_validator("inventory_item_id", "location_id", mode="before")
    @classmethod
    def stringify_ids(cls, v: Any) -> str:
        return str(v)

    @field_validator("available", mode="before")
    @classmethod
    def parse_available(cls, v: Any) -> int:
        return int(float(v)) if v is not None else 0

    @field_validator("unit_cogs", mode="before")
    @classmethod
    def parse_cogs(cls, v: Any) -> float:
        return float(v) if v is not None else 0.0
