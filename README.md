# NEXUS-DQPS — DataQuest 3.0

**Next-Generation Autonomous D2C Advertising Intelligence & Decision Engine**

NEXUS-DQPS turns passive ad dashboards into an AI-native, closed-loop decision engine:
it unifies fragmented data, diagnoses *why* performance moved, decides the best
budget reallocation, executes it, and learns from measured outcomes.

## Questions we solve
1. **What is happening?** — spend, sales, margin, inventory, creative — one schema.
2. **Why did it happen?** — anomalies decomposed into stockout / CPM spike / fatigue / price-drop factors.
3. **What should we do next?** — budget reallocation maximizing expected margin under constraints.
4. **Did it work?** — decision ledger: expected vs realized on every action.

## How it works (closed loop)
```
Simulator → Ingest/Reconcile (DuckDB) → Diagnose (anomaly+factors) →
Agent (LLM RCA) → Decide (optimizer) → Execute (mock ad API) → Learn (ledger)
```

## Quickstart

```bash
pip install -r requirements.txt
python scripts/run_demo.py                                # end-to-end offline demo
uvicorn execute.mock_ads_api:app --port 8000              # mock ad executor API
streamlit run app/streamlit_app.py                        # Mission Control UI
```

## Repo layout

- `simulator/` — synthetic multi-platform D2C data + injected events (ground truth)
- `ingest/` — DuckDB unified schema loader
- `diagnose/` — anomaly detection + factor decomposition
- `agents/` — LLM root-cause explainer (template fallback)
- `decide/` — response-curve budget optimizer
- `execute/` — mock ad-platform FastAPI
- `learn/` — decision ledger (expected vs realized)
- `app/` — Streamlit Mission Control
- `scripts/` — end-to-end demo runner
- `docs/` — PLAN, PROJECT_OVERVIEW, DEMO_WORKFLOW, TEAM_WORKFLOW, REPOS
- `tests/` — smoke tests

## Docs
- [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) — questions, solution, workflow, architecture, tech stack
- [PLAN.md](PLAN.md) — full plan + 6-person split
- [docs/DEMO_WORKFLOW.md](docs/DEMO_WORKFLOW.md) — live-demo runbook
- [docs/TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md) — hour-by-hour team plan

## Tech stack
Python 3.11+ · DuckDB · scipy (SLSQP) · FastAPI · Streamlit · Claude/OpenAI (optional) · pytest
