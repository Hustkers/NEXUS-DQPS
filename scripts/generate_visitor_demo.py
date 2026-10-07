#!/usr/bin/env python3
"""Synthetic Visitor Event Traffic Generator for NEXUS D2C.

Generates realistic visitor-level event streams with:
- Multi-touch ad journeys (Meta, Google, TikTok, Direct) with click IDs (gclid, fbclid, ttclid)
- Cross-session returning visitors
- Identity stitching (merging anonymous visitors into SHA-256 hashed customer profiles upon checkout)
- Cart abandoners and high-intent buyers
- Deliberate advertising patterns (e.g., viral clickbait with low CVR vs high-intent Google search)
- Attribution discrepancy & double-counting flags
- Exports directly to web/src/data/visitor-tracking-state.json and PostgreSQL (if connected)
"""
import hashlib
import json
import math
import os
import random
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from simulator.generator import NIKE_PRODUCTS

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@localhost:5432/nexus_d2c")

CAMPAIGNS = [
    {
        "id": "meta-airmax-viral",
        "platform": "meta",
        "sku": "AH8050-100",
        "name": "Nike Air Max 270 Viral Hook",
        "daily_spend": 2800,
        "cvr_tier": "low",  # deliberate clickbait pattern: many clicks, low purchases
        "platform_reported_conversions": 42
    },
    {
        "id": "google-react-intent",
        "platform": "google",
        "sku": "CD4371-001",
        "name": "React Infinity High-Intent Search",
        "daily_spend": 1900,
        "cvr_tier": "high",  # high conversion rate
        "platform_reported_conversions": 24
    },
    {
        "id": "tiktok-jordan-trend",
        "platform": "tiktok",
        "sku": "310805-137",
        "name": "Air Jordan 10 TikTok Challenge",
        "daily_spend": 1650,
        "cvr_tier": "medium",
        "platform_reported_conversions": 34  # deliberate double-counting inflation
    },
    {
        "id": "meta-315122-001",
        "platform": "meta",
        "sku": "315122-001",
        "name": "Air Force 1 '07 Evergreen Scale",
        "daily_spend": 2200,
        "cvr_tier": "medium",
        "platform_reported_conversions": 35
    },
    {
        "id": "google-CD4371-001",
        "platform": "google",
        "sku": "BQ8928-011",
        "name": "Epic React Flyknit 2 Shopping",
        "daily_spend": 1850,
        "cvr_tier": "medium",
        "platform_reported_conversions": 28
    }
]

CUSTOMERS_SEED = [
    {"email": "marcus.runner@gmail.com", "name": "Marcus R.", "persona": "marathoner"},
    {"email": "elena.sneakers@outlook.com", "name": "Elena S.", "persona": "hypebeast"},
    {"email": "devon.kicks@nikefan.com", "name": "Devon K.", "persona": "casual"},
    {"email": "sarah.crossfit@gmail.com", "name": "Sarah C.", "persona": "gym_training"},
    {"email": "alex.triathlete@yahoo.com", "name": "Alex T.", "persona": "marathoner"},
    {"email": "jordan.collector@hotmail.com", "name": "Jordan C.", "persona": "hypebeast"},
    {"email": "maya.fitness@gmail.com", "name": "Maya F.", "persona": "gym_training"},
    {"email": "liam.lifestyle@gmail.com", "name": "Liam L.", "persona": "casual"}
]


def hash_email(email: str) -> str:
    """Zero-fingerprint SHA-256 hash of lowercased, trimmed email."""
    return hashlib.sha256(email.strip().lower().encode("utf-8")).hexdigest()


def generate_click_id(platform: str) -> str:
    rnd = uuid.uuid4().hex[:12]
    if platform == "google":
        return f"CjwKCAiA{rnd}_gclid"
    elif platform == "meta":
        return f"fb.1.{int(datetime.now().timestamp())}.{rnd}"
    elif platform == "tiktok":
        return f"tt_cl_{rnd}"
    return f"click_{rnd}"


def generate_synthetic_traffic(num_visitors: int = 180, days_back: int = 14):
    random.seed(42)
    base_time = datetime.now(timezone.utc) - timedelta(days=days_back)

    visitors = []
    sessions = []
    events = []
    customers = {}
    identity_links = []
    orders = []

    # Map customers by email
    for c in CUSTOMERS_SEED:
        cid = hash_email(c["email"])
        customers[cid] = {
            "customer_id": cid,
            "first_seen_at": (base_time + timedelta(days=1)).isoformat(),
            "last_seen_at": (base_time + timedelta(days=days_back)).isoformat(),
            "total_orders": 0,
            "total_revenue": 0.0,
            "email_masked": f"{c['email'][:2]}***@{c['email'].split('@')[1]}"
        }

    customer_list = list(customers.keys())

    for i in range(num_visitors):
        visitor_id = str(uuid.uuid4())
        v_start_offset = random.uniform(0, days_back - 1)
        v_start_time = base_time + timedelta(days=v_start_offset)

        # Decide if this visitor is identified (logged in / buyer)
        is_identified = (i < len(customer_list) * 3)
        assigned_customer_id = customer_list[i % len(customer_list)] if is_identified else None

        # Campaign acquisition touch
        is_ad_driven = random.random() < 0.85
        initial_camp = random.choice(CAMPAIGNS) if is_ad_driven else None

        v_ft_camp = initial_camp["id"] if initial_camp else None
        v_ft_plat = initial_camp["platform"] if initial_camp else "direct"

        visitor_record = {
            "visitor_id": visitor_id,
            "first_seen_at": v_start_time.isoformat(),
            "last_seen_at": v_start_time.isoformat(),
            "first_touch_campaign": v_ft_camp,
            "last_touch_campaign": v_ft_camp,
            "first_touch_platform": v_ft_plat,
            "last_touch_platform": v_ft_plat,
            "consent_granted": True
        }
        visitors.append(visitor_record)

        # Multi-session returns (1 to 4 sessions per visitor)
        num_sessions = 1
        if random.random() < 0.40:
            num_sessions = 2
        if random.random() < 0.15:
            num_sessions = 3
        if is_identified and random.random() < 0.30:
            num_sessions = 4

        current_time = v_start_time

        for s_idx in range(num_sessions):
            session_id = str(uuid.uuid4())
            if s_idx > 0:
                current_time += timedelta(hours=random.uniform(4, 72))

            # Touchpoint for this session
            active_camp = initial_camp if s_idx == 0 else (random.choice(CAMPAIGNS) if random.random() < 0.6 else None)
            cid_val = active_camp["id"] if active_camp else None
            plat_val = active_camp["platform"] if active_camp else "direct"
            click_id = generate_click_id(plat_val) if active_camp else None

            session_sku = active_camp["sku"] if active_camp else random.choice(list(NIKE_PRODUCTS.keys()))
            product_meta = NIKE_PRODUCTS.get(session_sku, {})
            price = float(product_meta.get("price", 140.0))

            landing_url = f"https://store.niked2c.com/products/{session_sku}"
            if active_camp:
                landing_url += f"?utm_source={plat_val}&utm_campaign={cid_val}&campaign_id={cid_val}&click_id={click_id}"

            session_record = {
                "session_id": session_id,
                "visitor_id": visitor_id,
                "customer_id": assigned_customer_id if (is_identified and s_idx >= 1) else None,
                "started_at": current_time.isoformat(),
                "last_active_at": current_time.isoformat(),
                "campaign_id": cid_val,
                "platform": plat_val,
                "click_id": click_id,
                "utm_source": plat_val if active_camp else None,
                "utm_medium": "cpc" if active_camp else None,
                "utm_campaign": cid_val,
                "utm_content": f"creative_{plat_val}_01" if active_camp else None,
                "landing_url": landing_url,
                "is_active": False
            }
            sessions.append(session_record)

            # Update visitor last seen
            visitor_record["last_seen_at"] = current_time.isoformat()
            if cid_val:
                visitor_record["last_touch_campaign"] = cid_val
                visitor_record["last_touch_platform"] = plat_val

            # Sequence of events in session
            # 1. Ad click (if campaign)
            if active_camp:
                events.append({
                    "event_id": f"evt-{uuid.uuid4().hex[:12]}",
                    "visitor_id": visitor_id,
                    "session_id": session_id,
                    "customer_id": session_record["customer_id"],
                    "event_type": "ad_click",
                    "timestamp": current_time.isoformat(),
                    "product_id": session_sku,
                    "value": None,
                    "campaign_id": cid_val,
                    "platform": plat_val,
                    "click_id": click_id,
                    "utm_source": plat_val,
                    "utm_medium": "cpc",
                    "utm_campaign": cid_val,
                    "page_url": landing_url,
                    "order_id": None,
                    "is_server_side": False
                })

            current_time += timedelta(seconds=random.randint(2, 10))

            # 2. Page View / Landing
            events.append({
                "event_id": f"evt-{uuid.uuid4().hex[:12]}",
                "visitor_id": visitor_id,
                "session_id": session_id,
                "customer_id": session_record["customer_id"],
                "event_type": "page_view",
                "timestamp": current_time.isoformat(),
                "product_id": session_sku,
                "value": None,
                "campaign_id": cid_val,
                "platform": plat_val,
                "click_id": click_id,
                "utm_source": plat_val if active_camp else None,
                "utm_medium": "cpc" if active_camp else None,
                "utm_campaign": cid_val,
                "page_url": landing_url,
                "order_id": None,
                "is_server_side": False
            })

            # 3. Product View
            current_time += timedelta(seconds=random.randint(15, 60))
            events.append({
                "event_id": f"evt-{uuid.uuid4().hex[:12]}",
                "visitor_id": visitor_id,
                "session_id": session_id,
                "customer_id": session_record["customer_id"],
                "event_type": "product_view",
                "timestamp": current_time.isoformat(),
                "product_id": session_sku,
                "value": price,
                "campaign_id": cid_val,
                "platform": plat_val,
                "click_id": click_id,
                "utm_source": plat_val if active_camp else None,
                "utm_medium": "cpc" if active_camp else None,
                "utm_campaign": cid_val,
                "page_url": landing_url,
                "order_id": None,
                "is_server_side": False
            })

            # Check conversion probability based on campaign tier
            cvr_prob = 0.15
            if active_camp:
                if active_camp["cvr_tier"] == "low":
                    cvr_prob = 0.04  # Clickbait
                elif active_camp["cvr_tier"] == "high":
                    cvr_prob = 0.38  # High intent
                else:
                    cvr_prob = 0.18

            # Decision to Add to Cart
            add_cart = random.random() < (cvr_prob * 2.2)
            if add_cart:
                current_time += timedelta(seconds=random.randint(20, 120))
                events.append({
                    "event_id": f"evt-{uuid.uuid4().hex[:12]}",
                    "visitor_id": visitor_id,
                    "session_id": session_id,
                    "customer_id": session_record["customer_id"],
                    "event_type": "add_to_cart",
                    "timestamp": current_time.isoformat(),
                    "product_id": session_sku,
                    "value": price,
                    "campaign_id": cid_val,
                    "platform": plat_val,
                    "click_id": click_id,
                    "utm_source": plat_val if active_camp else None,
                    "utm_medium": "cpc" if active_camp else None,
                    "utm_campaign": cid_val,
                    "page_url": landing_url,
                    "order_id": None,
                    "is_server_side": False
                })

                # Begin Checkout
                start_checkout = random.random() < 0.70
                if start_checkout:
                    current_time += timedelta(seconds=random.randint(15, 90))
                    events.append({
                        "event_id": f"evt-{uuid.uuid4().hex[:12]}",
                        "visitor_id": visitor_id,
                        "session_id": session_id,
                        "customer_id": session_record["customer_id"],
                        "event_type": "begin_checkout",
                        "timestamp": current_time.isoformat(),
                        "product_id": session_sku,
                        "value": price,
                        "campaign_id": cid_val,
                        "platform": plat_val,
                        "click_id": click_id,
                        "utm_source": plat_val if active_camp else None,
                        "utm_medium": "cpc" if active_camp else None,
                        "utm_campaign": cid_val,
                        "page_url": "https://store.niked2c.com/checkout",
                        "order_id": None,
                        "is_server_side": False
                    })

                    # Purchase execution
                    buy = random.random() < 0.65
                    if buy:
                        current_time += timedelta(seconds=random.randint(25, 180))
                        order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"

                        # Identity stitch on purchase
                        purchaser_customer_id = assigned_customer_id or hash_email(f"guest_{visitor_id[:8]}@example.com")
                        if purchaser_customer_id not in customers:
                            customers[purchaser_customer_id] = {
                                "customer_id": purchaser_customer_id,
                                "first_seen_at": v_start_time.isoformat(),
                                "last_seen_at": current_time.isoformat(),
                                "total_orders": 0,
                                "total_revenue": 0.0,
                                "email_masked": f"guest_{visitor_id[:4]}***@example.com"
                            }

                        session_record["customer_id"] = purchaser_customer_id

                        # Identity link
                        identity_links.append({
                            "visitor_id": visitor_id,
                            "customer_id": purchaser_customer_id,
                            "linked_at": current_time.isoformat(),
                            "method": "checkout"
                        })

                        # Order record
                        order_record = {
                            "order_id": order_id,
                            "customer_id": purchaser_customer_id,
                            "visitor_id": visitor_id,
                            "session_id": session_id,
                            "product_id": session_sku,
                            "amount": price,
                            "currency": "USD",
                            "status": "completed",
                            "created_at": current_time.isoformat()
                        }
                        orders.append(order_record)

                        customers[purchaser_customer_id]["total_orders"] += 1
                        customers[purchaser_customer_id]["total_revenue"] += price

                        # Dual event: Client purchase + Server-side purchase (resilience to ad blockers)
                        events.append({
                            "event_id": f"evt-{uuid.uuid4().hex[:12]}",
                            "visitor_id": visitor_id,
                            "session_id": session_id,
                            "customer_id": purchaser_customer_id,
                            "event_type": "purchase",
                            "timestamp": current_time.isoformat(),
                            "product_id": session_sku,
                            "value": price,
                            "campaign_id": cid_val,
                            "platform": plat_val,
                            "click_id": click_id,
                            "utm_source": plat_val if active_camp else None,
                            "utm_medium": "cpc" if active_camp else None,
                            "utm_campaign": cid_val,
                            "page_url": "https://store.niked2c.com/order-confirmed",
                            "order_id": order_id,
                            "is_server_side": True  # server-side purchase
                        })

            session_record["last_active_at"] = current_time.isoformat()

    print(f"Generated {len(visitors)} visitors, {len(sessions)} sessions, {len(events)} events, {len(orders)} purchases.")
    return {
        "visitors": visitors,
        "sessions": sessions,
        "events": events,
        "customers": list(customers.values()),
        "identityLinks": identity_links,
        "orders": orders
    }


def save_tracking_state(state: dict):
    out_path = Path("web/src/data/visitor-tracking-state.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(state, indent=2))
    print(f"Saved tracking state to {out_path} ({len(state['events'])} events).")


def sync_to_postgres(state: dict):
    try:
        import psycopg2
        from psycopg2.extras import execute_values

        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # Insert customers
        cust_rows = [(c["customer_id"], c["first_seen_at"], c["last_seen_at"], c["total_orders"], c["total_revenue"]) for c in state["customers"]]
        execute_values(cur, """
            INSERT INTO customers (customer_id, first_seen_at, last_seen_at, total_orders, total_revenue)
            VALUES %s
            ON CONFLICT (customer_id) DO UPDATE SET
                last_seen_at = EXCLUDED.last_seen_at,
                total_orders = EXCLUDED.total_orders,
                total_revenue = EXCLUDED.total_revenue;
        """, cust_rows)

        # Insert visitors
        vis_rows = [(v["visitor_id"], v["first_seen_at"], v["last_seen_at"], v["first_touch_campaign"], v["last_touch_campaign"], v["first_touch_platform"], v["last_touch_platform"], v["consent_granted"]) for v in state["visitors"]]
        execute_values(cur, """
            INSERT INTO visitors (visitor_id, first_seen_at, last_seen_at, first_touch_campaign, last_touch_campaign, first_touch_platform, last_touch_platform, consent_granted)
            VALUES %s
            ON CONFLICT (visitor_id) DO UPDATE SET
                last_seen_at = EXCLUDED.last_seen_at,
                last_touch_campaign = EXCLUDED.last_touch_campaign,
                last_touch_platform = EXCLUDED.last_touch_platform;
        """, vis_rows)

        # Insert identity links
        id_rows = [(l["visitor_id"], l["customer_id"], l["method"], l["linked_at"]) for l in state["identityLinks"]]
        execute_values(cur, """
            INSERT INTO identity_links (visitor_id, customer_id, method, linked_at)
            VALUES %s
            ON CONFLICT (visitor_id, customer_id) DO NOTHING;
        """, id_rows)

        # Insert sessions
        sess_rows = [(s["session_id"], s["visitor_id"], s["customer_id"], s["started_at"], s["last_active_at"], s["campaign_id"], s["platform"], s["click_id"], s["utm_source"], s["utm_medium"], s["utm_campaign"], s["utm_content"], s["landing_url"], s["is_active"]) for s in state["sessions"]]
        execute_values(cur, """
            INSERT INTO sessions (session_id, visitor_id, customer_id, started_at, last_active_at, campaign_id, platform, click_id, utm_source, utm_medium, utm_campaign, utm_content, landing_url, is_active)
            VALUES %s
            ON CONFLICT (session_id) DO UPDATE SET last_active_at = EXCLUDED.last_active_at;
        """, sess_rows)

        # Insert orders
        order_rows = [(o["order_id"], o["customer_id"], o["visitor_id"], o["session_id"], o["product_id"], o["amount"], o["currency"], o["status"], o["created_at"]) for o in state["orders"]]
        execute_values(cur, """
            INSERT INTO orders (order_id, customer_id, visitor_id, session_id, product_id, amount, currency, status, created_at)
            VALUES %s
            ON CONFLICT (order_id) DO NOTHING;
        """, order_rows)

        # Insert events
        evt_rows = [(e["event_id"], e["visitor_id"], e["session_id"], e["customer_id"], e["event_type"], e["timestamp"], e["product_id"], e["value"], e["campaign_id"], e["platform"], e["click_id"], e["utm_source"], e["utm_medium"], e["utm_campaign"], e["utm_content"], e["page_url"], e["order_id"], e["is_server_side"]) for e in state["events"]]
        execute_values(cur, """
            INSERT INTO events (event_id, visitor_id, session_id, customer_id, event_type, timestamp, product_id, value, campaign_id, platform, click_id, utm_source, utm_medium, utm_campaign, utm_content, page_url, order_id, is_server_side)
            VALUES %s
            ON CONFLICT (event_id) DO NOTHING;
        """, evt_rows)

        conn.commit()
        conn.close()
        print("Successfully synced all visitor tracking data to PostgreSQL.")
    except Exception as ex:
        print(f"PostgreSQL sync skipped ({ex}). Standalone JSON state is active.")


if __name__ == "__main__":
    state = generate_synthetic_traffic(num_visitors=200, days_back=14)
    save_tracking_state(state)
    sync_to_postgres(state)
