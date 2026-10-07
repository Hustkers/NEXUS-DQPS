"""Time-series filters for anomaly detection.

Implements:
- Day-of-week and seasonal baseline de-biasing
- High-frequency volatility filtering via exponential smoothing to suppress auction noise
"""

from __future__ import annotations

from typing import List, Optional
import numpy as np
import pandas as pd


def debias_day_of_week(series: pd.Series, dates: pd.Series) -> pd.Series:
    """Remove deterministic day-of-week seasonality factors.

    Computes day-of-week ratio against overall mean and scales the series accordingly.
    """
    if len(series) < 7:
        return series

    df_temp = pd.DataFrame({"val": series, "dt": pd.to_datetime(dates)})
    df_temp["dow"] = df_temp["dt"].dt.dayofweek

    mean_val = df_temp["val"].mean()
    if mean_val == 0 or np.isnan(mean_val):
        return series

    dow_means = df_temp.groupby("dow")["val"].transform("mean")
    # Multiplicative seasonal index
    dow_factor = dow_means / mean_val
    # Protect against divide-by-zero or extreme factors
    dow_factor = dow_factor.replace(0, 1.0).fillna(1.0).clip(lower=0.4, upper=2.5)

    debiased = df_temp["val"] / dow_factor
    return debiased


def exponential_smoothing(series: pd.Series, alpha: float = 0.35) -> pd.Series:
    """Apply single exponential smoothing to suppress stochastic auction noise.

    y_t = alpha * x_t + (1 - alpha) * y_{t-1}
    """
    return series.ewm(alpha=alpha, adjust=False).mean()


def filter_volatility_noise(
    df: pd.DataFrame, metric_cols: Optional[List[str]] = None, alpha: float = 0.35
) -> pd.DataFrame:
    """Filter noise across metric columns in a performance dataframe."""
    out = df.copy()
    cols = metric_cols or ["roas", "ctr", "cpc", "cvr", "spend"]
    for c in cols:
        if c in out.columns:
            out[f"{c}_smoothed"] = exponential_smoothing(out[c], alpha=alpha)
    return out
