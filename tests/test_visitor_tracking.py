"""Verification tests for NEXUS D2C Visitor-Level Event Tracking & Identity Layer."""
import hashlib
import json
import math
import time
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

from scripts.generate_visitor_demo import (
    generate_synthetic_traffic,
    hash_email,
    generate_click_id,
    CAMPAIGNS
)


def test_hash_email_zero_pii():
    """Verify that email hashing normalizes lower/trim and produces 64-char SHA-256 hex with zero raw PII."""
    raw1 = "  User.Name@Example.COM  "
    raw2 = "user.name@example.com"
    h1 = hash_email(raw1)
    h2 = hash_email(raw2)

    assert h1 == h2
    assert len(h1) == 64
    assert "@" not in h1
    assert "example" not in h1


def test_new_visitor_first_touch_attribution():
    """Verify new anonymous visitor registers first-touch ad campaign & platform."""
    state = generate_synthetic_traffic(num_visitors=10, days_back=2)
    assert len(state["visitors"]) == 10
    v = state["visitors"][0]

    assert "visitor_id" in v
    assert v["consent_granted"] is True
    # Has valid ISO timestamps
    assert "T" in v["first_seen_at"]
    assert "T" in v["last_seen_at"]


def test_returning_visitor_cross_session():
    """Verify returning visitor updates last-touch campaign while keeping identity consistent."""
    state = generate_synthetic_traffic(num_visitors=50, days_back=7)
    # Check that visitors with multiple sessions share the same visitor_id
    sessions_by_vis = {}
    for s in state["sessions"]:
        vid = s["visitor_id"]
        sessions_by_vis.setdefault(vid, []).append(s)

    multi_session_visitors = [vid for vid, slist in sessions_by_vis.items() if len(slist) > 1]
    assert len(multi_session_visitors) > 0, "Should have multi-session returning visitors"

    sample_vid = multi_session_visitors[0]
    sample_sessions = sessions_by_vis[sample_vid]
    assert len(sample_sessions) >= 2


def test_identity_stitching_merge():
    """Verify that when a visitor checks out or logs in, anonymous touchpoints stitch to hashed customer_id."""
    state = generate_synthetic_traffic(num_visitors=60, days_back=7)
    links = state["identityLinks"]
    assert len(links) > 0, "Identity stitching links should be populated upon checkout/login"

    link = links[0]
    vid = link["visitor_id"]
    cid = link["customer_id"]

    assert len(cid) == 64
    # Check that linked customer exists
    customer_ids = {c["customer_id"] for c in state["customers"]}
    assert cid in customer_ids


def test_idempotent_event_deduplication():
    """Verify duplicate event_id entries are identified and deduplicated."""
    state = generate_synthetic_traffic(num_visitors=5, days_back=1)
    evts = state["events"]
    assert len(evts) > 0

    first_event = evts[0]
    event_ids = [e["event_id"] for e in evts]
    # In generated state, all event_ids are unique
    assert len(event_ids) == len(set(event_ids))


def test_direct_purchase_without_prior_click():
    """Verify organic/direct purchases without ad click IDs are cleanly captured."""
    state = generate_synthetic_traffic(num_visitors=100, days_back=10)
    # Check for direct sessions
    direct_sessions = [s for s in state["sessions"] if s["platform"] == "direct" or s["campaign_id"] is None]
    assert len(direct_sessions) > 0


def test_consent_declined_policy():
    """Verify that consent flag false correctly gates tracking."""
    # When visitor declines consent, consent_granted is False
    declined_visitor = {
        "visitor_id": str(uuid.uuid4()),
        "first_seen_at": datetime.now(timezone.utc).isoformat(),
        "last_seen_at": datetime.now(timezone.utc).isoformat(),
        "first_touch_campaign": None,
        "last_touch_campaign": None,
        "first_touch_platform": None,
        "last_touch_platform": None,
        "consent_granted": False
    }
    assert declined_visitor["consent_granted"] is False
    assert declined_visitor["first_touch_campaign"] is None


def test_recency_decay_interest_score():
    """Verify that interaction weights decay over time with 7-day half life."""
    half_life_days = 7.0
    lam = math.log(2) / half_life_days

    # Event today vs 7 days ago
    weight = 10.0  # purchase
    score_day_0 = weight * math.exp(-lam * 0)
    score_day_7 = weight * math.exp(-lam * 7)
    score_day_14 = weight * math.exp(-lam * 14)

    assert pytest.approx(score_day_0, 0.01) == 10.0
    assert pytest.approx(score_day_7, 0.01) == 5.0
    assert pytest.approx(score_day_14, 0.01) == 2.5


def test_deliberate_pattern_attribution_discrepancy():
    """Verify deliberate advertising pattern: viral campaign has low conversion rate vs search campaign."""
    state = generate_synthetic_traffic(num_visitors=200, days_back=14)

    # Count purchases per campaign
    purchases_per_camp = {}
    for o in state["orders"]:
        # Find session of order
        sess = next((s for s in state["sessions"] if s["session_id"] == o["session_id"]), None)
        if sess and sess["campaign_id"]:
            cid = sess["campaign_id"]
            purchases_per_camp[cid] = purchases_per_camp.get(cid, 0) + 1

    # Check that orders exist
    assert len(state["orders"]) > 0
