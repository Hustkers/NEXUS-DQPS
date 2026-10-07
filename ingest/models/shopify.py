"""Shopify Admin REST / Webhook Pydantic v2 Models for Orders and Inventory."""
from __future__ import annotations

from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ShopifyLineItem(BaseModel):
    """Line item within a Shopify Order."""
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    id: Optional[str] = Field(default=None, description="Shopify Line Item ID")
    variant_id: Optional[str] = Field(default=None, description="Product Variant ID")
    product_id: Optional[str] = Field(default=None, description="Shopify Product ID")
    title: Optional[str] = Field(default=None, description="Product title")
    sku: Optional[str] = Field(default=None, description="Stock Keeping Unit")
    price: float = Field(..., description="Unit price charged")
    quantity: int = Field(..., description="Quantity ordered")
    total_discount: float = Field(0.0, description="Discounts allocated to this line item")

    @field_validator("variant_id", "id", "product_id", mode="before")
    @classmethod
    def stringify_ids(cls, v: Any) -> Optional[str]:
        return str(v) if v is not None else None

    @field_validator("price", "total_discount", mode="before")
    @classmethod
    def parse_float(cls, v: Any) -> float:
        return float(v) if v is not None and v != "" else 0.0

    @field_validator("quantity", mode="before")
    @classmethod
    def parse_int(cls, v: Any) -> int:
        return int(float(v)) if v is not None and v != "" else 0

    @property
    def gross_line_total(self) -> float:
        return round(self.price * self.quantity - self.total_discount, 2)

    @property
    def gross_revenue(self) -> float:
        """Gross line revenue."""
        return self.gross_line_total


    @property
    def net_revenue(self) -> float:
        return max(0.0, self.gross_revenue - self.total_discount)


class ShopifyOrder(BaseModel):
    """Shopify Order resource from REST API or order/create Webhooks."""
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    id: str = Field(..., description="Unique Shopify Order ID")
    order_number: Any = Field(..., description="Public order number")
    created_at: str = Field(..., description="Order creation timestamp ISO8601")
    line_items: List[ShopifyLineItem] = Field(default_factory=list, description="Array of purchased items")
    total_price: float = Field(..., description="Total order amount charged")
    subtotal_price: float = Field(..., description="Subtotal before taxes & shipping")
    total_tax: Optional[float] = Field(default=0.0, description="Total taxes collected")
    total_discounts: Optional[float] = Field(default=0.0, description="Total discounts across the order")
    currency: str = Field(default="USD", description="Currency code (e.g., USD)")
    financial_status: Optional[str] = Field(default="paid", description="Financial status: paid, pending, refunded")
    cancelled_at: Optional[str] = Field(default=None, description="Cancellation timestamp if cancelled")

    @field_validator("id", mode="before")
    @classmethod
    def stringify_id(cls, v: Any) -> str:
        return str(v)

    @field_validator("total_price", "subtotal_price", "total_tax", "total_discounts", mode="before")
    @classmethod
    def parse_floats(cls, v: Any) -> float:
        return float(v) if v is not None and v != "" else 0.0

    @property
    def order_date(self) -> str:
        """Extract YYYY-MM-DD from ISO timestamp."""
        return self.created_at[:10]

    @property
    def total_quantity(self) -> int:
        """Total unit count across all line items."""
        return sum(item.quantity for item in self.line_items)

    @property
    def skus(self) -> List[str]:
        """Unique list of SKUs in this order."""
        return list({item.sku for item in self.line_items if item.sku})


class ShopifyInventoryLevel(BaseModel):
    """Inventory quantity and unit cost of goods sold (COGS) at a location."""
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    inventory_item_id: str = Field(..., description="Shopify InventoryItem ID")
    location_id: str = Field(..., description="Shopify Fulfillment Location ID")
    available: int = Field(0, description="Available stock units for sale")
    sku: Optional[str] = Field(None, description="Associated Merchant SKU")
    unit_cogs: float = Field(0.0, description="Unit cost of goods sold from ERP or inventoryItem.cost")
    updated_at: Optional[str] = Field(default=None, description="ISO 8601 timestamp of inventory update")

    @field_validator("inventory_item_id", "location_id", mode="before")
    @classmethod
    def stringify_ids(cls, v: Any) -> str:
        return str(v)

    @field_validator("available", mode="before")
    @classmethod
    def parse_available(cls, v: Any) -> int:
        return int(float(v)) if v is not None and v != "" else 0

    @field_validator("unit_cogs", mode="before")
    @classmethod
    def parse_cogs(cls, v: Any) -> float:
        return float(v) if v is not None and v != "" else 0.0
