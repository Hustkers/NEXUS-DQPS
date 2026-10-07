"""Anomaly detection + contributing-factor decomposition."""
from __future__ import annotations

import numpy as np
import pandas as pd


def add_roas(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["roas"] = np.where(df["spend"] > 0, df["revenue"] / df["spend"], 0.0)
    df["cvr"] = np.where(df["impressions"] > 0, df["conversions"] / df["impressions"], 0.0)
    return df


def detect_anomalies(df: pd.DataFrame, window: int = 14, z_thresh: float = 2.5) -> pd.DataFrame:
    df = add_roas(df).sort_values(["campaign", "date"])
    flags = []
    for campaign, g in df.groupby("campaign"):
        g = g.copy()
        for col in ["roas", "cvr", "cpm", "spend"]:
            mu = g[col].rolling(window, min_periods=5).mean()
            sd = g[col].rolling(window, min_periods=5).std()
            g[f"z_{col}"] = (g[col] - mu) / sd.replace(0, np.nan)
        g["anomaly"] = g["z_roas"].abs().gt(z_thresh) | g["z_cvr"].abs().gt(z_thresh)
        flags.append(g)
    return pd.concat(flags)


def factor_decomposition(df: pd.DataFrame, campaign: str, date) -> dict:
    """Rank likely drivers of the shift on `date` vs prior 14d baseline."""
    g = add_roas(df)
    g = g[g["campaign"] == campaign].sort_values("date")
    day = g[g["date"] == pd.Timestamp(date)]
    base = g[(g["date"] < pd.Timestamp(date)) & (g["date"] >= pd.Timestamp(date) - pd.Timedelta(days=14))]
    if day.empty or base.empty:
        return {}
    day, base = day.iloc[0], base.mean(numeric_only=True)
    factors = {
        "cpm": (day["cpm"] - base["cpm"]) / max(base["cpm"], 1e-9),
        "cvr": (day["cvr"] - base["cvr"]) / max(base["cvr"], 1e-9),
        "spend": (day["spend"] - base["spend"]) / max(base["spend"], 1e-9),
        "inventory_stockout": 1.0 if day["inventory"] == 0 and base["inventory"] > 0 else 0.0,
        "roas_delta": (day["roas"] - base["roas"]) / max(base["roas"], 1e-9),
    }
    return dict(sorted(factors.items(), key=lambda kv: abs(kv[1]), reverse=True))
