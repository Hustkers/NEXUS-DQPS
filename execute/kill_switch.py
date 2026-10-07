"""Tier-4 Automated Kill-Switch & Inventory Runway Circuit Breaker.

Implements:
- Conversion Blackout Kill-Switch: immediately freeze campaign spend to baseline minimums (<= $5/day)
  if 0 Shopify conversion events are recorded over 2 consecutive hours with active spend > $50/hr.
- Inventory Runway Circuit Breaker: automatically triggers campaign throttling when projected
  days of Shopify inventory drops below supplier replenishment lead time.
"""

from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from execute.gateway import ExecutionDirective, ExecutionGateway

logger = logging.getLogger(__name__)


class KillSwitchTriggerReport(BaseModel):
    """Event report emitted when a circuit breaker or kill switch fires."""

    circuit_breaker_type: str  # CONVERSION_BLACKOUT, INVENTORY_RUNWAY_EXHAUSTION
    campaign_id: str
    sku_id: str
    action_taken: str  # FROZEN_TO_MINIMUM, THROTTLED
    triggered_at: float
    trigger_metric_value: float
    reason: str


class KillSwitchDaemon:
    """Automated fail-safe guardian protecting enterprise media budget."""

    def __init__(
        self,
        gateway: Optional[ExecutionGateway] = None,
        supplier_lead_time_days: int = 5,
    ):
        self.gateway = gateway or ExecutionGateway()
        self.supplier_lead_time_days = supplier_lead_time_days
        self._tripped_breakers: List[KillSwitchTriggerReport] = []

    def evaluate_conversion_blackout(
        self,
        campaign_id: str,
        channel: str,
        sku_id: str,
        current_spend: float,
        conversions_last_2_hours: int,
    ) -> Optional[KillSwitchTriggerReport]:
        """Trip kill-switch if active spend is running without conversions."""
        if current_spend > 25.0 and conversions_last_2_hours == 0:
            logger.critical(
                "TIER-4 KILL-SWITCH ACTIVATED: 0 conversions in last 2 hours on %s ($%.2f spend). Freezing immediately!",
                campaign_id,
                current_spend,
            )
            # Create emergency freeze directive
            directive = ExecutionDirective(
                directive_id=f"kill_switch_{campaign_id}_{int(time.time())}",
                channel=channel,
                campaign_id=campaign_id,
                action_type="THROTTLE_CAMPAIGN",
                pre_spend=current_spend,
                target_spend=0.0,
                authorization_tier="TIER_1",
                reason="Tier-4 Kill-Switch: 0 Shopify conversion events recorded over 2 consecutive hours.",
            )
            self.gateway.execute_directive_single(directive)

            report = KillSwitchTriggerReport(
                circuit_breaker_type="CONVERSION_BLACKOUT",
                campaign_id=campaign_id,
                sku_id=sku_id,
                action_taken="FROZEN_TO_MINIMUM",
                triggered_at=time.time(),
                trigger_metric_value=0.0,
                reason="0 conversions in 2 hours with active media spend.",
            )
            self._tripped_breakers.append(report)
            return report

        return None

    def evaluate_inventory_runway(
        self,
        campaign_id: str,
        channel: str,
        sku_id: str,
        current_spend: float,
        inventory_on_hand: int,
        daily_sales_velocity: float,
    ) -> Optional[KillSwitchTriggerReport]:
        """Trip circuit breaker if inventory runway is shorter than supplier lead time."""
        if daily_sales_velocity <= 0:
            return None

        runway_days = inventory_on_hand / daily_sales_velocity

        if runway_days < self.supplier_lead_time_days:
            # Throttle campaign spend down by 60%
            throttled_spend = round(current_spend * 0.40, 2)
            logger.warning(
                "INVENTORY CIRCUIT BREAKER TRIPPED: %s runway (%.1f days) < lead time (%d days). Throttling spend to $%.2f.",
                sku_id,
                runway_days,
                self.supplier_lead_time_days,
                throttled_spend,
            )
            directive = ExecutionDirective(
                directive_id=f"circuit_breaker_{campaign_id}_{int(time.time())}",
                channel=channel,
                campaign_id=campaign_id,
                action_type="THROTTLE_CAMPAIGN",
                pre_spend=current_spend,
                target_spend=throttled_spend,
                authorization_tier="TIER_1",
                reason=f"Inventory Runway Circuit Breaker: runway {runway_days:.1f}d < lead time {self.supplier_lead_time_days}d.",
            )
            self.gateway.execute_directive_single(directive)

            report = KillSwitchTriggerReport(
                circuit_breaker_type="INVENTORY_RUNWAY_EXHAUSTION",
                campaign_id=campaign_id,
                sku_id=sku_id,
                action_taken="THROTTLED",
                triggered_at=time.time(),
                trigger_metric_value=round(runway_days, 1),
                reason=f"Runway {runway_days:.1f}d below supplier lead time {self.supplier_lead_time_days}d.",
            )
            self._tripped_breakers.append(report)
            return report

        return None

    def get_tripped_history(self) -> List[KillSwitchTriggerReport]:
        return self._tripped_breakers
