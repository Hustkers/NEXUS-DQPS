"""Unit tests for Section 8: Safety Guardrails, Circuit Breakers & Decision Ledger."""

import time
import pytest
from execute.gateway import ExecutionDirective, ExecutionGateway
from execute.guardrails import SafetyGuardrails
from execute.kill_switch import KillSwitchDaemon
from learn.ledger import DecisionLedger, LedgerRecord


def test_guardrails_tier1_auto_authorization():
    guard = SafetyGuardrails()
    directive = ExecutionDirective(
        directive_id="dir_tier1",
        channel="meta",
        campaign_id="camp_test",
        action_type="SCALE_CAMPAIGN",
        pre_spend=500.0,
        target_spend=540.0,  # 8% shift (<10%)
    )
    res = guard.evaluate_directive(directive, causal_confidence=0.95)
    assert res.is_authorized is True
    assert res.assigned_tier == "TIER_1"
    assert res.requires_human_signoff is False
    assert res.requires_voice_authorization is False


def test_guardrails_tier2_voice_authorization():
    guard = SafetyGuardrails()
    directive = ExecutionDirective(
        directive_id="dir_tier2",
        channel="google",
        campaign_id="camp_test",
        action_type="SCALE_CAMPAIGN",
        pre_spend=500.0,
        target_spend=600.0,  # 20% shift (10-30%)
    )
    # Without voice auth -> blocked
    res = guard.evaluate_directive(directive, voice_authorized=False)
    assert res.is_authorized is False
    assert res.assigned_tier == "TIER_2"
    assert res.requires_voice_authorization is True

    # With voice auth -> authorized
    res_auth = guard.evaluate_directive(directive, voice_authorized=True)
    assert res_auth.is_authorized is True


def test_guardrails_tier3_human_signoff_requirement():
    guard = SafetyGuardrails()
    directive = ExecutionDirective(
        directive_id="dir_tier3",
        channel="amazon",
        campaign_id="camp_test",
        action_type="SCALE_CAMPAIGN",
        pre_spend=1000.0,
        target_spend=4000.0,  # >$2,500 shift and >30%
    )
    res = guard.evaluate_directive(directive, human_signed=False)
    assert res.is_authorized is False
    assert res.assigned_tier == "TIER_3"
    assert res.requires_human_signoff is True

    # With human signature
    res_signed = guard.evaluate_directive(directive, human_signed=True)
    assert res_signed.is_authorized is True


def test_six_hour_velocity_limiter_blocks():
    guard = SafetyGuardrails()
    directive = ExecutionDirective(
        directive_id="dir_drift",
        channel="meta",
        campaign_id="camp_drift",
        action_type="SCALE_CAMPAIGN",
        pre_spend=500.0,
        target_spend=700.0,  # 40% shift > 25% velocity cap
    )
    res = guard.evaluate_directive(directive)
    assert res.is_authorized is False
    assert "velocity" in res.rejection_reason.lower()


def test_tier4_kill_switch_conversion_blackout(tmp_path):
    gateway = ExecutionGateway(audit_path=tmp_path / "audit.jsonl")
    daemon = KillSwitchDaemon(gateway=gateway)

    # 0 conversions in last 2 hours with active spend $100 -> trips kill switch
    report = daemon.evaluate_conversion_blackout(
        campaign_id="camp_blackout",
        channel="meta",
        sku_id="310805-137",
        current_spend=100.0,
        conversions_last_2_hours=0,
    )
    assert report is not None
    assert report.circuit_breaker_type == "CONVERSION_BLACKOUT"
    assert report.action_taken == "FROZEN_TO_MINIMUM"


def test_inventory_runway_circuit_breaker(tmp_path):
    gateway = ExecutionGateway(audit_path=tmp_path / "audit.jsonl")
    daemon = KillSwitchDaemon(gateway=gateway, supplier_lead_time_days=7)

    # Stock = 10 units, velocity = 5 units/day -> runway = 2 days < 7 days lead time
    report = daemon.evaluate_inventory_runway(
        campaign_id="camp_low_stock",
        channel="google",
        sku_id="880848-005",
        current_spend=500.0,
        inventory_on_hand=10,
        daily_sales_velocity=5.0,
    )
    assert report is not None
    assert report.circuit_breaker_type == "INVENTORY_RUNWAY_EXHAUSTION"
    assert report.action_taken == "THROTTLED"


def test_atomic_rollback_on_failure(tmp_path):
    gateway = ExecutionGateway(audit_path=tmp_path / "audit.jsonl")
    directives = [
        ExecutionDirective(
            directive_id="d1",
            channel="meta",
            campaign_id="c1",
            action_type="SCALE_CAMPAIGN",
            pre_spend=100.0,
            target_spend=150.0,
        ),
        ExecutionDirective(
            directive_id="d2",
            channel="google",
            campaign_id="c2",
            action_type="SCALE_CAMPAIGN",
            pre_spend=200.0,
            target_spend=250.0,
        ),
    ]

    # Inject simulated failure at step 1 (second directive)
    success, receipts = gateway.execute_batch_atomic(directives, fail_at_index=1)
    assert success is False
    assert len(receipts) >= 1
    assert any(r.status == "ROLLED_BACK" for r in receipts)


def test_ledger_24h_outcome_verification(tmp_path):
    ledger = DecisionLedger(path=tmp_path / "test_ledger.jsonl")
    record = LedgerRecord(
        directive_id="dir_v1",
        decision_text="Scale Google Zoom Fly",
        campaign_id="google_camp",
        channel="google",
        sku_id="880848-005",
        pre_spend=500.0,
        target_spend=600.0,
        expected_margin_lift=200.0,
    )
    ledger.record_decision(record)

    # Verify at t+24h: realized lift = 190.0 vs counterfactual control = 0.0
    verified = ledger.verify_24h_outcome(
        directive_id="dir_v1",
        observed_realized_lift=190.0,
        counterfactual_control_lift=0.0,
    )
    assert verified is not None
    assert verified.status == "VERIFIED"
    assert verified.realized_margin_lift_24h == 190.0
    assert abs(verified.variance_pct - (-5.0)) < 0.1
    assert verified.accuracy_pct >= 94.0
    assert "google" in ledger.channel_prior_adjustments
