"""Synthetic D2C advertising data simulator.

Generates ~90 days of daily metrics per (platform, campaign, sku) plus
injected events with ground-truth labels for demo root-causing.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np
import pandas as pd

PLATFORMS = ["meta", "google", "amazon", "tiktok"]
SKUS = [f"SKU-{100 + i}" for i in range(12)]

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
            if rng.random() < 0.35:
                continue  # not every sku advertised on every platform
            base_spend = rng.uniform(200, 2500)
            base_cpm = {"meta": 8, "google": 12, "amazon": 10, "tiktok": 5}[platform] * rng.uniform(0.7, 1.4)
            base_cvr = rng.uniform(0.01, 0.05)
            price = rng.uniform(15, 80)
            margin_pct = rng.uniform(0.25, 0.7)
            inventory = int(rng.uniform(800, 3000))
            fatigue = 0.0
            for d in range(days):
                season = 1 + 0.15 * math.sin(2 * math.pi * d / 30)
                cpm = base_cpm * season * rng.normal(1.0, 0.08)
                spend = base_spend * season * rng.normal(1.0, 0.1)
                impressions = spend / cpm * 1000
                fatigue += 0.004
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
