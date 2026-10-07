"""Synthetic D2C advertising data simulator with Nike footwear product catalog.

Generates ~90 days of daily metrics per (platform, campaign, sku) plus
injected events with ground-truth labels for demo root-causing.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd

PLATFORMS = ["meta", "google", "amazon", "tiktok"]

# Top 12 Nike footwear items mapped to real catalog SKUs and prices
NIKE_PRODUCTS = {
    "310805-137": {
        "name": "Air Jordan 10 Retro",
        "price": 192.71,
        "sale_price_inr": 15995,
        "rating": 4.7,
        "reviews": 223,
        "image": "https://static.nike.com/a/images/t_PDP_1728_v1/ccsubyw6lzx10virtjdu/air-jordan-10-retro-shoe-f3jBkN.jpg",
        "category": "Jordan"
    },
    "880848-005": {
        "name": "Nike Zoom Fly",
        "price": 174.64,
        "sale_price_inr": 14495,
        "rating": 4.3,
        "reviews": 105,
        "image": "https://c.static-nike.com/a/images/t_PDP_1728_v1/x6jwtxaf3brhu6jisuf5/zoom-fly-running-shoe-OZEAxq.jpg",
        "category": "Running"
    },
    "AH8050-100": {
        "name": "Nike Air Max 270",
        "price": 168.61,
        "sale_price_inr": 13995,
        "rating": 3.8,
        "reviews": 81,
        "image": "https://c.static-nike.com/a/images/t_PDP_1728_v1/awjogtdnqxniqqk0wpgf/air-max-270-shoe-2V5C4p.jpg",
        "category": "Lifestyle / Casual"
    },
    "315122-001": {
        "name": "Nike Air Force 1 '07",
        "price": 87.89,
        "sale_price_inr": 7295,
        "rating": 4.5,
        "reviews": 78,
        "image": "https://c.static-nike.com/a/images/t_PDP_1728_v1/oplkqwyf7nwnj98f8agj/air-force-1-07-shoe-PATZxx4V.jpg",
        "category": "Lifestyle / Casual"
    },
    "BQ8928-011": {
        "name": "Nike Epic React Flyknit 2",
        "price": 125.27,
        "sale_price_inr": 10397,
        "rating": 4.1,
        "reviews": 72,
        "image": "https://static.nike.com/a/images/t_PDP_1728_v1/akktdiniehnrjqoibfaw/epic-react-flyknit-2-running-shoe-ShRZnm.jpg",
        "category": "Running"
    },
    "849559-004": {
        "name": "Nike Air Max 2017",
        "price": 192.71,
        "sale_price_inr": 15995,
        "rating": 2.9,
        "reviews": 71,
        "image": "https://static.nike.com/a/images/t_PDP_1728_v1/bbbwgncnxexhwgbz8qbp/air-max-2017-shoe-MkTmxxOd.jpg",
        "category": "Running"
    },
    "CD4371-001": {
        "name": "Nike React Infinity Run Flyknit",
        "price": 168.61,
        "sale_price_inr": 13995,
        "rating": 4.6,
        "reviews": 68,
        "image": "https://static.nike.com/a/images/t_PDP_1728_v1/ddb4c566-fcb0-47c0-8184-323ad9edff37/react-infinity-run-flyknit-running-shoe-ZjGHFz.jpg",
        "category": "Running"
    },
    "AQ2730-009": {
        "name": "Nike Joyride Run Flyknit",
        "price": 180.66,
        "sale_price_inr": 14995,
        "rating": 4.0,
        "reviews": 65,
        "image": "https://static.nike.com/a/images/t_PDP_1728_v1/i1-b714d0a4-53ed-4919-9761-1bddc5dff48f/joyride-run-flyknit-running-shoe-sqfqGQ.jpg",
        "category": "Running"
    },
    "634835-108": {
        "name": "Nike Air Huarache",
        "price": 108.37,
        "sale_price_inr": 8995,
        "rating": 4.5,
        "reviews": 63,
        "image": "https://c.static-nike.com/a/images/t_PDP_1728_v1/r4rbe0wqytas2utewhs9/air-huarache-shoe-2kvnqX.jpg",
        "category": "Lifestyle / Casual"
    },
    "AO2924-401": {
        "name": "Nike Air Max 720",
        "price": 154.18,
        "sale_price_inr": 12797,
        "rating": 4.2,
        "reviews": 62,
        "image": "https://static.nike.com/a/images/t_PDP_1728_v1/gmnsskvj5xjk5zm8bx2m/air-max-720-shoe-Ss8jMq.jpg",
        "category": "Lifestyle / Casual"
    },
    "554724-066": {
        "name": "Air Jordan 1 Mid",
        "price": 120.42,
        "sale_price_inr": 9995,
        "rating": 4.5,
        "reviews": 61,
        "image": "https://static.nike.com/a/images/t_PDP_1728_v1/qb2ry1p1iv2vqrdfq4oa/air-jordan-1-mid-shoe-BpARGV.jpg",
        "category": "Jordan"
    },
    "942851-002": {
        "name": "Nike Air Zoom Pegasus 35",
        "price": 132.47,
        "sale_price_inr": 10995,
        "rating": 3.9,
        "reviews": 61,
        "image": "https://c.static-nike.com/a/images/t_PDP_1728_v1/kwqjwmm69706n5dn6man/air-zoom-pegasus-35-running-shoe-DXK1Zj.jpg",
        "category": "Running"
    }
}

SKUS = list(NIKE_PRODUCTS.keys())
EVENT_TYPES = ["cpm_spike", "stockout", "creative_fatigue", "competitor_price_drop", "conversion_shift"]


@dataclass
class Event:
    type: str
    platform: str
    sku: str
    start_day: int
    duration: int
    magnitude: float  # multiplicative effect strength


def build_world(seed: int = 7, days: int = 90) -> dict:
    rng = np.random.default_rng(seed)
    rows = []
    for platform in PLATFORMS:
        for sku in SKUS:
            if rng.random() < 0.25:
                continue  # realistic channel catalog distribution
            
            p_info = NIKE_PRODUCTS.get(sku, {"name": sku, "price": 120.0})
            price = p_info["price"]
            
            base_spend = rng.uniform(400, 2600)
            base_cpm = {"meta": 9.5, "google": 14.0, "amazon": 11.2, "tiktok": 6.8}[platform] * rng.uniform(0.8, 1.3)
            base_cvr = rng.uniform(0.015, 0.045)
            margin_pct = rng.uniform(0.48, 0.68)  # Nike direct gross margins ~50-65%
            inventory = int(rng.uniform(600, 2800))
            fatigue = 0.0
            
            for d in range(days):
                season = 1 + 0.15 * math.sin(2 * math.pi * d / 30)
                cpm = base_cpm * season * rng.normal(1.0, 0.08)
                spend = base_spend * season * rng.normal(1.0, 0.1)
                impressions = spend / cpm * 1000
                fatigue += 0.003
                cvr = base_cvr * max(0.4, 1 - fatigue) * rng.normal(1.0, 0.07)
                conversions = max(0, impressions * 0.02 * cvr * rng.normal(1.0, 0.1))
                conversions = int(conversions)
                sold = min(conversions, max(inventory, 0))
                inventory = max(inventory - sold, 0)
                if inventory < 50 and rng.random() < 0.3:
                    inventory += int(rng.uniform(400, 1200))  # restock
                revenue = sold * price
                rows.append(
                    dict(
                        date=pd.Timestamp("2026-07-01") + pd.Timedelta(days=d),
                        platform=platform,
                        campaign=f"{platform}-{sku}",
                        sku=sku,
                        product_name=p_info["name"],
                        spend=round(spend, 2),
                        cpm=round(cpm, 2),
                        impressions=int(impressions),
                        conversions=conversions,
                        revenue=round(revenue, 2),
                        margin=round(revenue * margin_pct, 2),
                        inventory=inventory,
                        price=round(price, 2),
                        ga_sessions=int(impressions * rng.uniform(0.01, 0.05)),
                    )
                )
    df = pd.DataFrame(rows)

    events: list[Event] = []
    for _ in range(4):
        ev = Event(
            type=str(rng.choice(EVENT_TYPES)),
            platform=str(rng.choice(PLATFORMS)),
            sku=str(rng.choice(SKUS)),
            start_day=int(rng.integers(30, max(31, days - 15))),
            duration=int(rng.integers(5, 12)),
            magnitude=float(rng.uniform(0.3, 0.8)),
        )
        events.append(ev)
        mask = (
            (df["platform"] == ev.platform)
            & (df["sku"] == ev.sku)
            & (df["date"] >= pd.Timestamp("2026-07-01") + pd.Timedelta(days=ev.start_day))
            & (df["date"] < pd.Timestamp("2026-07-01") + pd.Timedelta(days=ev.start_day + ev.duration))
        )
        if ev.type == "cpm_spike":
            df.loc[mask, "cpm"] *= 1 + ev.magnitude
            df.loc[mask, "spend"] *= 1 + ev.magnitude * 0.5
        elif ev.type == "stockout":
            df.loc[mask, "inventory"] = 0
            df.loc[mask, "conversions"] = (df.loc[mask, "conversions"] * 0.2).astype(int)
            df.loc[mask, "revenue"] *= 0.2
            df.loc[mask, "margin"] *= 0.2
        elif ev.type == "creative_fatigue":
            df.loc[mask, "conversions"] = (df.loc[mask, "conversions"] * (1 - ev.magnitude)).astype(int)
            df.loc[mask, "revenue"] *= 1 - ev.magnitude
            df.loc[mask, "margin"] *= 1 - ev.magnitude
        elif ev.type == "competitor_price_drop":
            df.loc[mask, "conversions"] = (df.loc[mask, "conversions"] * (1 - ev.magnitude * 0.7)).astype(int)
            df.loc[mask, "revenue"] *= 1 - ev.magnitude * 0.7
            df.loc[mask, "margin"] *= 1 - ev.magnitude * 0.7
        elif ev.type == "conversion_shift":
            df.loc[mask, "conversions"] = (df.loc[mask, "conversions"] * (1 - ev.magnitude * 0.5)).astype(int)
            df.loc[mask, "revenue"] *= 1 - ev.magnitude * 0.5
            df.loc[mask, "margin"] *= 1 - ev.magnitude * 0.5

    return {"metrics": df.reset_index(drop=True), "events": [e.__dict__ for e in events]}


if __name__ == "__main__":
    world = build_world()
    world["metrics"].to_csv("data/metrics.csv", index=False)
    import json

    with open("data/events.json", "w") as f:
        json.dump(world["events"], f, indent=2)
    print(f"rows={len(world['metrics'])} events={len(world['events'])}")
