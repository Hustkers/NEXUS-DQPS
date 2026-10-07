"""Shopify synthetic event generator.

Generates realistic orders/create order lines with discounts, taxes, line items,
and real-time inventory_levels/update stock level adjustments.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

from ingest.models.shopify import ShopifyInventoryLevel, ShopifyLineItem, ShopifyOrder
from ingest.normalize import DEFAULT_PRODUCT_CATALOG


class ShopifyGenerator:
    """Synthetic generator for Shopify Admin REST and Webhook payloads."""

    def __init__(
        self,
        seed: int = 42,
        catalog: Optional[Dict[str, Any]] = None,
        initial_inventory: int = 500,
    ):
        self.rng = np.random.default_rng(seed)
        self.catalog = catalog or DEFAULT_PRODUCT_CATALOG
        self.inventory: Dict[str, int] = {
            sku: initial_inventory for sku in self.catalog.keys()
        }
        self.unit_cogs: Dict[str, float] = {
            sku: m.unit_cogs for sku, m in self.catalog.items()
        }
        self.retail_prices: Dict[str, float] = {
            sku: m.retail_price for sku, m in self.catalog.items()
        }
        self.order_counter = 10000

    def set_inventory(self, sku: str, count: int) -> ShopifyInventoryLevel:
        """Trigger an inventory adjustment event."""
        self.inventory[sku] = max(0, count)
        mapping = self.catalog.get(sku)
        return ShopifyInventoryLevel(
            inventory_item_id=f"inv_item_{sku}",
            location_id="loc_us_east_primary",
            available=self.inventory[sku],
            sku=sku,
            unit_cogs=mapping.unit_cogs if mapping else 50.0,
            updated_at=datetime.now(timezone.utc).isoformat(),
        )

    def generate_orders_for_day(
        self,
        dt: datetime,
        demand_by_sku: Dict[str, int],
        discount_rate: float = 0.10,
    ) -> Tuple[List[ShopifyOrder], List[ShopifyInventoryLevel]]:
        """Generate orders throughout a given day based on SKU demand requirements."""
        orders: List[ShopifyOrder] = []
        inv_events: List[ShopifyInventoryLevel] = []

        for sku, demand in demand_by_sku.items():
            if demand <= 0:
                continue

            # Determine available inventory
            available = self.inventory.get(sku, 0)
            purchased_count = min(demand, available)
            if purchased_count <= 0:
                continue

            mapping = self.catalog.get(sku)
            unit_price = mapping.retail_price if mapping else 150.0
            variant_id = mapping.shopify_variant_id if mapping else f"var_{sku}"

            # Group purchased count into individual customer orders (1-2 items per order)
            remaining = purchased_count
            while remaining > 0:
                qty = 1 if (remaining == 1 or self.rng.random() < 0.8) else 2
                qty = min(qty, remaining)
                remaining -= qty
                self.inventory[sku] -= qty

                self.order_counter += 1
                # Spread orders across hours of the day
                hour = int(self.rng.integers(8, 23))
                minute = int(self.rng.integers(0, 59))
                second = int(self.rng.integers(0, 59))
                order_time = dt.replace(hour=hour, minute=minute, second=second)

                has_discount = self.rng.random() < discount_rate
                item_discount = round(unit_price * qty * 0.15, 2) if has_discount else 0.0
                subtotal = round(unit_price * qty - item_discount, 2)
                tax = round(subtotal * 0.08, 2)
                total = round(subtotal + tax, 2)

                line_item = ShopifyLineItem(
                    id=str(self.order_counter * 10 + 1),
                    variant_id=variant_id,
                    product_id=f"prod_{sku}",
                    title=mapping.product_name if mapping else sku,
                    sku=sku,
                    price=unit_price,
                    quantity=qty,
                    total_discount=item_discount,
                )

                order = ShopifyOrder(
                    id=f"ord_{self.order_counter}",
                    order_number=self.order_counter,
                    created_at=order_time.isoformat(),
                    line_items=[line_item],
                    total_price=total,
                    subtotal_price=subtotal,
                    total_tax=tax,
                    total_discounts=item_discount,
                    currency="USD",
                    financial_status="paid",
                )
                orders.append(order)

            # Record inventory level update event
            inv_event = ShopifyInventoryLevel(
                inventory_item_id=f"inv_item_{sku}",
                location_id="loc_us_east_primary",
                available=self.inventory[sku],
                sku=sku,
                unit_cogs=self.unit_cogs.get(sku, 50.0),
                updated_at=dt.isoformat(),
            )
            inv_events.append(inv_event)

        return orders, inv_events
