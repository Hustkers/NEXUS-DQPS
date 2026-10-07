# DQPS — DataQuest 3.0

Next-Generation Autonomous D2C Advertising Intelligence & Decision Engine.

See [PLAN.md](PLAN.md) for the full plan, architecture, and 6-person split.

## Quickstart

```bash
pip install -r requirements.txt
python scripts/run_demo.py          # end-to-end offline demo
streamlit run app/streamlit_app.py  # dashboard
uvicorn execute.mock_ads_api:app --port 8000  # mock ad executor API
```

## Layout

- `simulator/` — synthetic multi-platform D2C data + injected events
- `ingest/` — DuckDB unified schema loader
- `diagnose/` — anomaly detection + factor decomposition
- `agents/` — LLM root-cause explainer (template fallback)
- `decide/` — budget reallocation optimizer
- `execute/` — mock ad-platform FastAPI
- `learn/` — decision ledger (expected vs realized)
- `app/` — Streamlit dashboard
- `scripts/` — end-to-end demo
