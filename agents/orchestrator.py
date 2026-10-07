"""Autonomous Agentic Orchestrator for NEXUS-DQPS.

Manages state transitions:
TELEMETRY_INGESTED -> ANOMALY_DETECTED -> RCA_COMPLETED -> OPTIMIZER_SOLVED -> DIRECTIVE_GENERATED -> EXECUTED

Nodes:
1. DiagnosisReviewNode: Evaluates RCA attribution and determines commercial priorities
2. StrategyGenerationNode: Translates optimization results into discrete ExecutionDirectives
3. SafetyGateNode: Evaluates safety guardrails and routes through appropriate autonomy tier
4. ExecutionNode: Dispatches authorized directives via ExecutionGateway and logs into DecisionLedger
"""

from __future__ import annotations

import json
import logging
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from agents.cloud_client import GoogleCloudClient
from agents.rca import synthesize_causal_explanation
from decide.optimizer import (
    CampaignAllocationSpec,
    EnterpriseBudgetOptimizer,
    OptimizationResult,
)
from diagnose.anomaly import AnomalyEvent
from diagnose.attribution import CausalAttributionResult, CounterfactualAttributionEngine
from execute.gateway import ExecutionDirective, ExecutionGateway, ExecutionReceipt
from execute.guardrails import SafetyGuardrails
from learn.ledger import DecisionLedger, LedgerRecord

logger = logging.getLogger(__name__)


class OrchestratorState(BaseModel):
    """State context tracked across autonomous decision loop iterations."""

    loop_id: str
    stage: str = "INITIALIZED"
    anomalies: List[AnomalyEvent] = Field(default_factory=list)
    rca_results: List[CausalAttributionResult] = Field(default_factory=list)
    optimization_result: Optional[OptimizationResult] = None
    directives: List[ExecutionDirective] = Field(default_factory=list)
    receipts: List[ExecutionReceipt] = Field(default_factory=list)
    executive_briefing: Dict[str, Any] = Field(default_factory=dict)
    started_at: float = Field(default_factory=time.time)
    completed_at: Optional[float] = None


class AutonomousOrchestrator:
    """Enterprise Autonomous Closed-Loop Decision Engine."""

    def __init__(
        self,
        gateway: Optional[ExecutionGateway] = None,
        guardrails: Optional[SafetyGuardrails] = None,
        ledger: Optional[DecisionLedger] = None,
        cloud_client: Optional[GoogleCloudClient] = None,
    ):
        self.gateway = gateway or ExecutionGateway()
        self.guardrails = guardrails or SafetyGuardrails()
        self.ledger = ledger or DecisionLedger()
        self.cloud_client = cloud_client or GoogleCloudClient()
        self.rca_engine = CounterfactualAttributionEngine()
        self.optimizer = EnterpriseBudgetOptimizer()

        # In-memory buffer of directives awaiting authorization
        self.pending_directives: Dict[str, ExecutionDirective] = {}
        self.execution_history: List[OrchestratorState] = []

    def run_pipeline(
        self,
        anomalies: List[AnomalyEvent],
        campaign_specs: List[CampaignAllocationSpec],
        total_budget: Optional[float] = None,
        auto_execute_tier1: bool = True,
    ) -> OrchestratorState:
        """Run complete autonomous loop through all state nodes."""
        loop_id = f"loop_{int(time.time() * 1000)}"
        state = OrchestratorState(loop_id=loop_id, anomalies=anomalies)

        # -------------------------------------------------------------
        # 1. State: TELEMETRY_INGESTED -> ANOMALY_DETECTED
        # -------------------------------------------------------------
        state.stage = "ANOMALY_DETECTED"
        if not anomalies:
            state.stage = "NO_ACTION_REQUIRED"
            state.completed_at = time.time()
            self.execution_history.append(state)
            return state

        # -------------------------------------------------------------
        # 2. State: RCA_COMPLETED (DiagnosisReviewNode)
        # -------------------------------------------------------------
        state.stage = "RCA_COMPLETED"
        for anom in anomalies:
            # Map anomaly observation to structural evaluation
            obs = {
                "spend": anom.divergences.get("spend", 500.0),
                "cpm": 15.0,
                "ctr": 0.02,
                "cvr": anom.divergences.get("cvr", 0.03),
                "inventory": anom.divergences.get("inventory", 500.0),
                "price": 150.0,
                "cogs": 50.0,
            }
            rca_res = self.rca_engine.attribute(obs, campaign_key=anom.campaign)
            state.rca_results.append(rca_res)

        primary_rca = state.rca_results[0]
        state.executive_briefing = synthesize_causal_explanation(
            primary_rca, anomalies[0].campaign, anomalies[0].sku
        )

        # -------------------------------------------------------------
        # 3. State: OPTIMIZER_SOLVED (StrategyGenerationNode)
        # -------------------------------------------------------------
        state.stage = "OPTIMIZER_SOLVED"
        opt_res = self.optimizer.solve(campaign_specs, total_budget=total_budget)
        state.optimization_result = opt_res

        # -------------------------------------------------------------
        # 4. State: DIRECTIVE_GENERATED
        # -------------------------------------------------------------
        state.stage = "DIRECTIVE_GENERATED"
        directives: List[ExecutionDirective] = []

        for spec in campaign_specs:
            rec_spend = opt_res.allocations.get(spec.campaign_id, spec.current_spend)
            delta = rec_spend - spec.current_spend
            if abs(delta) < 5.0:
                continue

            action_type = "THROTTLE_CAMPAIGN" if delta < 0 else "SCALE_CAMPAIGN"
            if spec.inventory_on_hand <= 0:
                action_type = "THROTTLE_CAMPAIGN"

            d = ExecutionDirective(
                directive_id=f"dir_{loop_id}_{spec.campaign_id}",
                channel=spec.channel,
                campaign_id=spec.campaign_id,
                action_type=action_type,
                pre_spend=spec.current_spend,
                target_spend=rec_spend,
                reason=f"{action_type} recommended based on {primary_rca.primary_root_cause} diagnosis.",
            )
            directives.append(d)

        state.directives = directives

        # -------------------------------------------------------------
        # 5. State: EXECUTED (Safety Gate & Execution Gateway)
        # -------------------------------------------------------------
        state.stage = "EXECUTED"
        for d in directives:
            guard_eval = self.guardrails.evaluate_directive(
                d, causal_confidence=primary_rca.confidence
            )
            d.authorization_tier = guard_eval.assigned_tier

            if guard_eval.is_authorized and auto_execute_tier1:
                # Tier-1 Auto Execution
                receipt = self.gateway.execute_directive_single(d)
                state.receipts.append(receipt)

                # Record into closed-loop decision ledger
                expected_lift = round(opt_res.margin_lift / max(len(directives), 1), 2)
                record = LedgerRecord(
                    directive_id=d.directive_id,
                    decision_text=f"{d.action_type} on {d.campaign_id}: ${d.pre_spend:.0f} -> ${d.target_spend:.0f}",
                    campaign_id=d.campaign_id,
                    channel=d.channel,
                    sku_id=spec.sku_id,
                    pre_spend=d.pre_spend,
                    target_spend=d.target_spend,
                    expected_margin_lift=expected_lift,
                    confidence=primary_rca.confidence,
                    authorization_tier=guard_eval.assigned_tier,
                    status=receipt.status,
                )
                self.ledger.record_decision(record)
            else:
                # Requires human/voice approval -> buffer in pending
                self.pending_directives[d.directive_id] = d

        state.completed_at = time.time()
        self.execution_history.append(state)
        return state

    def approve_directive(
        self, directive_id: str, authorization_token: str = "HUMAN_SIGN_OFF"
    ) -> ExecutionReceipt:
        """Approve and execute a buffered Tier-2 or Tier-3 directive."""
        directive = self.pending_directives.get(directive_id)
        if not directive:
            raise KeyError(f"Directive {directive_id} not found in pending queue.")

        directive.authorization_token = authorization_token
        receipt = self.gateway.execute_directive_single(directive)

        record = LedgerRecord(
            directive_id=directive.directive_id,
            decision_text=f"Authorized {directive.action_type} on {directive.campaign_id}: ${directive.pre_spend:.0f} -> ${directive.target_spend:.0f}",
            campaign_id=directive.campaign_id,
            channel=directive.channel,
            sku_id="authorized_sku",
            pre_spend=directive.pre_spend,
            target_spend=directive.target_spend,
            expected_margin_lift=150.0,
            confidence=0.95,
            authorization_tier=directive.authorization_tier,
            status=receipt.status,
        )
        self.ledger.record_decision(record)
        del self.pending_directives[directive_id]
        return receipt


global_orchestrator = AutonomousOrchestrator()
