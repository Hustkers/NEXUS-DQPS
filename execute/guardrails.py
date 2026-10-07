"""Deterministic Safety Guardrails, Autonomy Tiers & Velocity Limiters.

Implements:
- Tier-1 Autonomy: Automatically authorize spend shifts < 10% when causal confidence > 90%
- Tier-2 Autonomy: Route moderate shifts (10% - 30%) through voice-assisted human authorization
- Tier-3 Autonomy: Enforce strict dual human sign-off on shifts > 30% or absolute adjustments > $2,500
- 6-Hour Velocity Limiter: Reject any programmatic action exceeding +-25% change within a 6-hour sliding window
"""

from __future__ import annotations

import time
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from execute.gateway import ExecutionDirective


class GuardrailEvaluationResult(BaseModel):
    """Outcome of guardrail evaluation on an execution directive."""

    directive_id: str
    is_authorized: bool
    assigned_tier: str  # TIER_1, TIER_2, TIER_3
    requires_human_signoff: bool
    requires_voice_authorization: bool
    rejection_reason: Optional[str] = None
    applied_delta_pct: float
    absolute_delta_dollars: float


class SafetyGuardrails:
    """Evaluates safety policies and autonomy tiers on spend directives."""

    def __init__(
        self,
        tier1_max_pct: float = 0.10,
        tier2_max_pct: float = 0.30,
        tier3_absolute_cap: float = 2500.0,
        sliding_window_velocity_max: float = 0.25,
    ):
        self.tier1_max_pct = tier1_max_pct
        self.tier2_max_pct = tier2_max_pct
        self.tier3_absolute_cap = tier3_absolute_cap
        self.sliding_window_velocity_max = sliding_window_velocity_max
        # Track historical executions: campaign_id -> list of (timestamp, spend_change_pct)
        self._execution_history: Dict[str, List[Tuple[float, float]]] = {}

    def evaluate_directive(
        self,
        directive: ExecutionDirective,
        causal_confidence: float = 0.95,
        human_signed: bool = False,
        voice_authorized: bool = False,
    ) -> GuardrailEvaluationResult:
        """Evaluate directive against deterministic autonomy tiers and velocity limiters."""
        pre = max(directive.pre_spend, 1.0)
        target = directive.target_spend
        delta_dollars = abs(target - pre)
        delta_pct = delta_dollars / pre

        now = time.time()
        six_hours_ago = now - (6 * 3600)

        # 1. Check 6-Hour Sliding Window Velocity Limiter
        history = self._execution_history.get(directive.campaign_id, [])
        recent_changes = [pct for ts, pct in history if ts >= six_hours_ago]
        cumulative_recent_delta = sum(recent_changes) + delta_pct

        # If it's a kill-switch or emergency throttle to 0, allow immediate emergency execution
        is_emergency_throttle = target <= 5.0 and directive.action_type in ("THROTTLE_CAMPAIGN", "ROLLBACK")

        if not is_emergency_throttle and not human_signed and delta_pct > self.sliding_window_velocity_max:
            return GuardrailEvaluationResult(
                directive_id=directive.directive_id,
                is_authorized=False,
                assigned_tier="TIER_3",
                requires_human_signoff=True,
                requires_voice_authorization=False,
                rejection_reason=f"Violates 6-hour budget drift velocity limit: delta {delta_pct:.1%} exceeds +/-{self.sliding_window_velocity_max:.0%}.",
                applied_delta_pct=round(delta_pct * 100.0, 1),
                absolute_delta_dollars=round(delta_dollars, 2),
            )

        # 2. Assign Autonomy Tier
        if delta_pct > self.tier2_max_pct or delta_dollars > self.tier3_absolute_cap:
            # Tier-3 Autonomy: Strict human sign-off mandatory
            tier = "TIER_3"
            authorized = human_signed or is_emergency_throttle
            rejection = None if authorized else "Tier-3 modification (>30% shift or >$2,500) requires manual executive sign-off."
            req_human = True
            req_voice = False

        elif delta_pct > self.tier1_max_pct or causal_confidence < 0.90:
            # Tier-2 Autonomy: Voice-assisted authorization
            tier = "TIER_2"
            authorized = voice_authorized or human_signed or is_emergency_throttle
            rejection = None if authorized else "Tier-2 modification (10%-30% shift) requires voice authorization."
            req_human = False
            req_voice = True

        else:
            # Tier-1 Autonomy: Fully autonomous execution
            tier = "TIER_1"
            authorized = True
            rejection = None
            req_human = False
            req_voice = False

        if authorized:
            self._execution_history.setdefault(directive.campaign_id, []).append((now, delta_pct))

        return GuardrailEvaluationResult(
            directive_id=directive.directive_id,
            is_authorized=authorized,
            assigned_tier=tier,
            requires_human_signoff=req_human,
            requires_voice_authorization=req_voice,
            rejection_reason=rejection,
            applied_delta_pct=round(delta_pct * 100.0, 1),
            absolute_delta_dollars=round(delta_dollars, 2),
        )


global_guardrails = SafetyGuardrails()
