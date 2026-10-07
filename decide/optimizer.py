"""Budget reallocation optimizer.

Fits a simple saturation response r(s) = a * s^b / (c + s^b) per campaign
and allocates a fixed total budget to maximize expected margin, respecting
per-campaign ±40% shift bounds and inventory>0 constraint.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from scipy.optimize import minimize


def response_curve(spend: np.ndarray, revenue: np.ndarray) -> tuple[float, float]:
    """Fit roas_at_1x as (k, curvature): rev ~ k * spend^curvature, curvature<1."""
    s = np.maximum(spend, 1e-6)
    r = np.maximum(revenue, 0.0)
    log_s, log_r = np.log(s), np.log(np.maximum(r, 1e-6))
    b, _ = np.polyfit(log_s, log_r, 1)
    b = float(np.clip(b, 0.3, 0.99))
    # anchor the curve at the current operating point so predictions are calibrated
    k = float(r.mean() / max(s.mean(), 1e-6) ** b)
    return k, b


def recommend(metrics: pd.DataFrame, total_budget: float | None = None) -> pd.DataFrame:
    recent = metrics.sort_values("date").groupby("campaign").tail(14)
    curves = {}
    margin_pct = {}
    last_inventory = {}
    for c, g in recent.groupby("campaign"):
        a, b = response_curve(g["spend"].values, g["revenue"].values)
        curves[c] = (a, b)
        mp = g["margin"] / g["revenue"].replace(0, np.nan)
        margin_pct[c] = float(mp.median()) if mp.notna().any() else 0.0
        last_inventory[c] = int(g.sort_values("date")["inventory"].iloc[-1])
    if total_budget is None:
        total_budget = float(recent.groupby("campaign")["spend"].mean().sum())

    campaigns = list(curves)
    x0 = np.array([recent[recent["campaign"] == c]["spend"].mean() for c in campaigns])
    x0 = x0 / x0.sum() * total_budget

    def neg_profit(x):
        x = np.maximum(x, 0)
        total = 0.0
        for i, c in enumerate(campaigns):
            a, b = curves[c]
            total += a * x[i] ** b * margin_pct[c]
        return -total

    bounds = []
    for i, c in enumerate(campaigns):
        if last_inventory[c] == 0:
            bounds.append((0.0, 0.0))  # kill spend on stocked-out campaign
        else:
            bounds.append((x0[i] * 0.6, x0[i] * 1.4))
    cons = [{"type": "eq", "fun": lambda x: x.sum() - total_budget}]
    res = minimize(neg_profit, x0, bounds=bounds, constraints=cons, method="SLSQP")
    out = []
    for i, c in enumerate(campaigns):
        a, b = curves[c]
        out.append(
            dict(
                campaign=c,
                current_daily_spend=round(x0[i], 2),
                recommended_daily_spend=round(float(res.x[i]), 2),
                expected_daily_margin=round(a * res.x[i] ** b * margin_pct[c], 2),
                stockout_kill=last_inventory[c] == 0,
            )
        )
    return pd.DataFrame(out).sort_values("expected_daily_margin", ascending=False)
