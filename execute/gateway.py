"""Modular Execution Gateway for multi-platform ad spend modifications.

Handles:
- Standardized execution interface across Meta, Google, and Amazon
- Atomic multi-step transactional execution with automatic rollback on mid-flight failure
- Immutable JSON audit logging (data/audit_log.jsonl)
"""

from __future__ import annotations

import json
import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from execute.mock_ads_api import (
    AmazonSPCampaignUpdate,
    MetaCampaignUpdateRequest,
    _active_campaign_budgets,
    update_amazon_sp_campaigns,
    update_meta_campaign,
)
from ingest.normalize import usd_to_cost_micros

logger = logging.getLogger(__name__)
AUDIT_LOG_PATH = Path("data/audit_log.jsonl")


class ExecutionDirective(BaseModel):
    """Discrete operational action to execute on an ad platform."""

    directive_id: str
    channel: str  # meta, google, amazon
    campaign_id: str
    action_type: str  # SHIFT_BUDGET, THROTTLE_CAMPAIGN, SCALE_CAMPAIGN
    pre_spend: float
    target_spend: float
    authorization_tier: str = "TIER_1"  # TIER_1, TIER_2, TIER_3
    authorization_token: Optional[str] = None
    reason: str = ""


class ExecutionReceipt(BaseModel):
    """Receipt returned after executing a directive or batch."""

    directive_id: str
    channel: str
    campaign_id: str
    status: str  # EXECUTED, ROLLED_BACK, FAILED
    executed_at: float
    pre_spend: float
    post_spend: float
    error_message: Optional[str] = None


class ExecutionGateway:
    """Manages atomic dispatch of budget modification directives."""

    def __init__(self, audit_path: Optional[Path] = None):
        self.audit_path = audit_path or AUDIT_LOG_PATH
        self.audit_path.parent.mkdir(parents=True, exist_ok=True)

    def execute_directive_single(self, directive: ExecutionDirective) -> ExecutionReceipt:
        """Execute a single directive against the corresponding platform API."""
        ch = directive.channel.lower()
        t_now = time.time()

        try:
            if ch == "meta":
                req = MetaCampaignUpdateRequest(
                    id=directive.campaign_id,
                    daily_budget=directive.target_spend,
                )
                update_meta_campaign(account_id="act_982341029481", payload=req)

            elif ch == "google":
                # Emulate Google mutate call
                _active_campaign_budgets[directive.campaign_id] = directive.target_spend

            elif ch == "amazon":
                # Emulate Amazon SP call
                _active_campaign_budgets[directive.campaign_id] = directive.target_spend

            receipt = ExecutionReceipt(
                directive_id=directive.directive_id,
                channel=directive.channel,
                campaign_id=directive.campaign_id,
                status="EXECUTED",
                executed_at=t_now,
                pre_spend=directive.pre_spend,
                post_spend=directive.target_spend,
            )
            self._log_audit(directive, receipt)
            return receipt

        except Exception as e:
            logger.error("Failed to execute directive %s: %s", directive.directive_id, e)
            receipt = ExecutionReceipt(
                directive_id=directive.directive_id,
                channel=directive.channel,
                campaign_id=directive.campaign_id,
                status="FAILED",
                executed_at=t_now,
                pre_spend=directive.pre_spend,
                post_spend=directive.pre_spend,
                error_message=str(e),
            )
            self._log_audit(directive, receipt)
            return receipt

    def execute_batch_atomic(
        self, directives: List[ExecutionDirective], fail_at_index: Optional[int] = None
    ) -> Tuple[bool, List[ExecutionReceipt]]:
        """Execute a batch of directives atomically.

        If any directive fails mid-flight, roll back all previously executed directives.
        """
        executed_receipts: List[ExecutionReceipt] = []
        rollback_queue: List[Tuple[ExecutionDirective, float]] = []

        for idx, d in enumerate(directives):
            # For testing rollback recovery: inject synthetic failure if instructed
            if fail_at_index is not None and idx == fail_at_index:
                logger.warning("Simulated mid-flight network crash at step %d. Initiating atomic rollback...", idx)
                self._rollback(rollback_queue)
                # Mark as rolled back
                failed_receipts = [
                    ExecutionReceipt(
                        directive_id=item[0].directive_id,
                        channel=item[0].channel,
                        campaign_id=item[0].campaign_id,
                        status="ROLLED_BACK",
                        executed_at=time.time(),
                        pre_spend=item[0].pre_spend,
                        post_spend=item[0].pre_spend,
                        error_message="Aborted due to downstream failure; rolled back to baseline.",
                    )
                    for item in rollback_queue
                ]
                return False, failed_receipts

            receipt = self.execute_directive_single(d)
            if receipt.status == "EXECUTED":
                executed_receipts.append(receipt)
                rollback_queue.append((d, d.pre_spend))
            else:
                self._rollback(rollback_queue)
                return False, executed_receipts

        return True, executed_receipts

    def _rollback(self, rollback_queue: List[Tuple[ExecutionDirective, float]]) -> None:
        """Roll back executed modifications to their pre-spend levels."""
        for d, original_spend in reversed(rollback_queue):
            rollback_directive = ExecutionDirective(
                directive_id=f"rollback_{d.directive_id}",
                channel=d.channel,
                campaign_id=d.campaign_id,
                action_type="ROLLBACK",
                pre_spend=d.target_spend,
                target_spend=original_spend,
                authorization_tier="TIER_1",
                reason=f"Atomic rollback for failed transaction {d.directive_id}",
            )
            self.execute_directive_single(rollback_directive)

    def _log_audit(self, directive: ExecutionDirective, receipt: ExecutionReceipt) -> None:
        """Append immutable JSON record to audit log."""
        record = {
            "timestamp": time.time(),
            "directive": directive.model_dump(),
            "receipt": receipt.model_dump(),
        }
        with open(self.audit_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
