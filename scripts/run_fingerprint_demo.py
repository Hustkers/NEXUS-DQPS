#!/usr/bin/env python3
"""Fingerprint Identity Tracking Demo.

Simulates cross-channel tracking of a single user journey via deterministic
device fingerprinting across walled-garden silos (YouTube -> Amazon Checkout).
"""
import hashlib
import json
import time
from datetime import datetime, timezone
from pathlib import Path


def generate_device_fingerprint(entropy_data: dict) -> str:
    """Computes deterministic device fingerprint hash from client entropy."""
    serialized = json.dumps(entropy_data, sort_keys=True)
    digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()[:16].upper()
    return f"FP-{digest[:4]}-{digest[4:8]}-{digest[8:12]}-{digest[12:16]}"


def simulate_cross_channel_user_journey():
    print("=" * 80)
    print(" NEXUS D2C: SINGLE FINGERPRINT CROSS-CHANNEL USER TRACKING DEMO")
    print("=" * 80)

    # 1. User hardware profile (MacBook Pro M3 Max)
    device_entropy = {
        "os": "macOS 15.1 Sequoia",
        "browser": "Safari 18.2 / WebKit 605.1.15",
        "canvas_2d_hash": "cv2_8f4a19e2c0b7",
        "webgl_gpu": "Apple M3 Max GPU (Metal 3.2)",
        "audio_drift_hash": "au_0.00018492f1",
        "screen_resolution": "3456x2234@2x",
        "hardware_concurrency": 16,
        "device_memory_gb": 36,
        "ip_subnet": "198.51.100.0/24"
    }

    fp_id = generate_device_fingerprint(device_entropy)
    print(f"\n[CLIENT HARDWARE ENTROPY IDENTIFIED]")
    print(f"Device:           {device_entropy['os']} | {device_entropy['browser']}")
    print(f"GPU Shader:       {device_entropy['webgl_gpu']}")
    print(f"Canvas 2D Hash:   {device_entropy['canvas_2d_hash']}")
    print(f"Audio Context:    {device_entropy['audio_drift_hash']}")
    print(f"--> UNIQUE FINGERPRINT ID: \033[1;36m{fp_id}\033[0m (Confidence: 99.8%)")

    # Event store
    journey_events = []

    # 2. Stage 1: YouTube Ad Impression
    print("\n" + "-" * 80)
    print("STAGE 1: USER BROWSES YOUTUBE & SEES NIKE AD")
    print("-" * 80)
    imp_event = {
        "event_id": "evt_yt_imp_9921",
        "event_type": "AD_IMPRESSION",
        "platform": "youtube_ads",
        "timestamp": "2026-10-07T10:14:02.194Z",
        "fingerprint_id": fp_id,
        "campaign": "YT_Brand_AirMaxDn_Q4",
        "creative": "Nike_AirMaxDn_FeelTheUnreal_15s.mp4",
        "sku": "AH8050-100 (Nike Air Max Dn)",
        "cost_cpm_usd": 0.024
    }
    journey_events.append(imp_event)
    print(f"[LOGGED] {imp_event['timestamp']} | {imp_event['platform']}")
    print(f"Fingerprint:  {imp_event['fingerprint_id']}")
    print(f"Creative:     {imp_event['creative']}")
    print(f"Cost:         ${imp_event['cost_cpm_usd']:.3f}")

    # 3. Stage 2: User Clicks the Ad on YouTube
    print("\n" + "-" * 80)
    print("STAGE 2: USER CLICKS YOUTUBE AD (INTERACTION)")
    print("-" * 80)
    click_event = {
        "event_id": "evt_yt_clk_4810",
        "event_type": "AD_CLICK",
        "platform": "youtube_ads",
        "timestamp": "2026-10-07T10:14:18.012Z",
        "fingerprint_id": fp_id,
        "campaign": "YT_Brand_AirMaxDn_Q4",
        "cost_cpc_usd": 0.85,
        "dwell_time_sec": 14.2,
        "outcome": "bounced_tab_closed"
    }
    journey_events.append(click_event)
    print(f"[LOGGED] {click_event['timestamp']} | {click_event['platform']}")
    print(f"Fingerprint:  {click_event['fingerprint_id']}")
    print(f"Action:       User clicked 'Shop Now', viewed page for 14.2s, closed tab without buying.")
    print(f"Total Ad Cost: ${imp_event['cost_cpm_usd'] + click_event['cost_cpc_usd']:.3f}")

    # 4. Stage 3: Independent Amazon Visit (Walled Garden Gap)
    print("\n" + "-" * 80)
    print("STAGE 3: USER OPENS AMAZON INDEPENDENTLY (NO COOKIES, NO UTMS)")
    print("-" * 80)
    print("[GAP] Hours later, user opens amazon.com directly in browser.")
    print("- 3rd-party cookies: BLOCKED by browser ITP")
    print("- UTM tracking: NONE (Direct organic traffic)")
    print("- Walled-garden data sharing: ZERO between Google and Amazon")

    # Client-side entropy re-evaluation on Amazon
    re_evaluated_fp = generate_device_fingerprint(device_entropy)
    assert re_evaluated_fp == fp_id, "Fingerprint must match on identical device"

    amz_pdp_event = {
        "event_id": "evt_amz_pdp_1092",
        "event_type": "MARKETPLACE_PRODUCT_VIEW",
        "platform": "amazon_storefront",
        "timestamp": "2026-10-07T16:32:45.890Z",
        "fingerprint_id": re_evaluated_fp,
        "search_query": "nike air max dn",
        "sku": "AH8050-100",
        "match_type": "DETERMINISTIC_HARDWARE_FINGERPRINT",
        "confidence": "99.8%"
    }
    journey_events.append(amz_pdp_event)
    print(f"[RE-GENERATED FP] \033[1;32m{re_evaluated_fp}\033[0m -> IDENTICAL MATCH!")
    print(f"[LOGGED] {amz_pdp_event['timestamp']} | {amz_pdp_event['platform']}")
    print(f"Query:       '{amz_pdp_event['search_query']}'")
    print(f"Action:      Viewed Nike Air Max Dn PDP (Size 10.5)")

    # 5. Stage 4: Amazon 1-Click Checkout
    print("\n" + "-" * 80)
    print("STAGE 4: USER COMPLETES AMAZON CHECKOUT")
    print("-" * 80)
    amz_buy_event = {
        "event_id": "evt_amz_ord_8831",
        "event_type": "PURCHASE_CONVERSION",
        "platform": "amazon",
        "timestamp": "2026-10-07T16:35:10.420Z",
        "fingerprint_id": re_evaluated_fp,
        "order_id": "AMZ-9482-DN77",
        "sku": "AH8050-100",
        "order_total_usd": 170.00,
        "gross_margin_usd": 93.50
    }
    journey_events.append(amz_buy_event)
    print(f"[LOGGED] {amz_buy_event['timestamp']} | Order: {amz_buy_event['order_id']}")
    print(f"Fingerprint:  {amz_buy_event['fingerprint_id']}")
    print(f"Revenue:      ${amz_buy_event['order_total_usd']:.2f}")

    # 6. Stage 5: Attribution Resolution
    print("\n" + "=" * 80)
    print("STAGE 5: NEXUS IDENTITY GRAPH ATTRIBUTION RESOLUTION")
    print("=" * 80)
    total_cost = imp_event["cost_cpm_usd"] + click_event["cost_cpc_usd"]
    revenue = amz_buy_event["order_total_usd"]
    assisted_roas = revenue / total_cost

    print("\n  [STANDARD SILOED ATTRIBUTION (WITHOUT FINGERPRINT)]:")
    print("- YouTube Ad Platform:  $0.874 spend, $0 revenue -> 0.00x ROAS (Flagged as Waste!)")
    print("- Amazon Analytics:     $170.00 revenue -> 100% credited to 'Organic Direct Search'")
    print("--> Marketer Action:    WRONGLY cuts YouTube ad budget!")

    print(f"\n  [NEXUS STITCHED ATTRIBUTION (WITH SINGLE FINGERPRINT {fp_id})]:")
    print(f"- Causal Link:          YouTube Ad (10:14 AM) -> Amazon Buy (04:35 PM)")
    print(f"- Ad Spend Invested:    ${total_cost:.3f}")
    print(f"- Realized Revenue:     ${revenue:.2f}")
    print(f"- Assisted ROAS:        \033[1;32m{assisted_roas:.1f}x\033[0m")
    print(f"--> Autonomous Action:  SCALE YouTube budget by +25% (protects high-yield funnel)")

    # Save output to data directory
    out_path = Path("data/fingerprint_journey.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(journey_events, indent=2))
    print(f"\n[OK] Raw journey telemetry saved to: {out_path}")
    print("=" * 80)


if __name__ == "__main__":
    simulate_cross_channel_user_journey()
