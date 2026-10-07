"""Streamlit dashboard (placeholder UI over simulator + ledger)."""
import json
import sys
from pathlib import Path

import pandas as pd
import streamlit as st

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from learn.ledger import read_all

st.set_page_config(page_title="DQPS Mission Control", layout="wide")
st.title("DQPS: Autonomous D2C Ad Decision Engine")

metrics_path = Path("data/metrics.csv")
if metrics_path.exists():
    df = pd.read_csv(metrics_path, parse_dates=["date"])
    st.subheader("Unified metrics (sample)")
    st.dataframe(df.tail(50))

    st.subheader("Margin by platform")
    st.bar_chart(df.groupby("platform")["margin"].sum())
else:
    st.warning("Run scripts/run_demo.py first to generate data/metrics.csv")

st.subheader("Decision Ledger")
entries = read_all()
if entries:
    st.dataframe(pd.DataFrame([e.__dict__ for e in entries]))
else:
    st.info("No decisions executed yet.")
