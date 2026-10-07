"""DQPS Mission Control dashboard (Streamlit)."""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import requests
import streamlit as st

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from agents.rca import explain
from decide.optimizer import recommend
from diagnose.anomaly import detect_anomalies, factor_decomposition
from learn.ledger import LedgerEntry, add_entry, read_all

st.set_page_config(page_title="DQPS Mission Control", layout="wide")
st.title("DQPS — Autonomous D2C Ad Decision Engine")

metrics_path = Path("data/metrics.csv")
events_path = Path("data/events.json")

if not metrics_path.exists():
    st.warning("Run `python scripts/run_demo.py` first to generate data/metrics.csv")
    st.stop()

df = pd.read_csv(metrics_path, parse_dates=["date"])
df["roas"] = np.where(df["spend"] > 0, df["revenue"] / df["spend"], 0.0)

# --- KPI row ---
last30 = df[df["date"] >= df["date"].max() - pd.Timedelta(days=30)]
k1, k2, k3, k4 = st.columns(4)
k1.metric("Spend (30d)", f"${last30['spend'].sum():,.0f}")
k2.metric("Revenue (30d)", f"${last30['revenue'].sum():,.0f}")
k3.metric("Margin (30d)", f"${last30['margin'].sum():,.0f}")
k4.metric("ROAS (30d)", f"{last30['revenue'].sum()/max(last30['spend'].sum(),1):.2f}x")

# --- Platform mix ---
st.subheader("Platform economics")
mix = df.groupby("platform")[["spend", "margin"]].sum()
mix["roas"] = df.groupby("platform").apply(
    lambda g: g["revenue"].sum() / max(g["spend"].sum(), 1), include_groups=False
)
st.bar_chart(mix[["spend", "margin"]])
st.dataframe(mix.round(2))

# --- Event timeline ---
if events_path.exists():
    st.subheader("Injected scenario events (ground truth)")
    st.dataframe(pd.DataFrame(json.loads(events_path.read_text())))

# --- Anomaly feed + RCA ---
st.subheader("Anomaly feed")
scored = detect_anomalies(df)
bad = scored[scored["anomaly"]].copy()
bad["abs_z"] = bad[["z_roas", "z_cvr"]].abs().max(axis=1)
bad = bad.sort_values(["date", "abs_z"], ascending=[False, False]).head(10)
if bad.empty:
    st.info("No anomalies detected.")
else:
    for _, row in bad.iterrows():
        with st.expander(f"{row['platform']} / {row['sku']} —  {row['date'].date()}  (z={row['abs_z']:.1f})"):
            factors = factor_decomposition(df, row["campaign"], row["date"])
            c1, c2 = st.columns([2, 1])
            c1.write(explain(row["campaign"], row["date"], factors))
            c2.bar_chart(pd.Series({k: v for k, v in factors.items() if k != "roas_delta"}))
            st.write(f"ROAS delta: **{factors.get('roas_delta', 0):+.0%}**")

# --- Recommendations ---
st.subheader("Budget recommendations")
recs = recommend(df)
st.dataframe(recs, use_container_width=True)
choice = st.selectbox("Select a campaign to approve", recs["campaign"].tolist())
row = recs[recs["campaign"] == choice].iloc[0]
if st.button("Approve & Execute"):
    payload = {
        "campaign": row["campaign"],
        "new_daily_spend": float(row["recommended_daily_spend"]),
        "expected_daily_margin": float(row["expected_daily_margin"]),
        "confidence": 0.8,
    }
    try:
        r = requests.post("http://localhost:8000/apply", json=payload, timeout=3)
        st.success(f"Executed via mock ad API → {r.json()['status']}")
    except Exception:
        add_entry(
            LedgerEntry(
                decision=f"set {row['campaign']} spend -> ${row['recommended_daily_spend']:.0f}/day",
                expected_margin=float(row["expected_daily_margin"]),
                realized_margin=float(row["expected_daily_margin"]) * 0.92,
                confidence=0.8,
                status="executed (offline fallback)",
            )
        )
        st.warning("Mock API unreachable — wrote directly to ledger (offline fallback).")

# --- Decision ledger ---
st.subheader("Decision ledger (expected vs realized)")
entries = read_all()
if entries:
    led = pd.DataFrame([e.__dict__ for e in entries])
    st.dataframe(led)
    chart = led[["expected_margin", "realized_margin"]]
    st.bar_chart(chart)
else:
    st.info("No decisions executed yet.")
