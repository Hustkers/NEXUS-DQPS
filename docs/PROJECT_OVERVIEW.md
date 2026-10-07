# NEXUS-DQPS — Project Overview
**DataQuest 3.0 | Next-Generation Autonomous D2C Advertising Intelligence & Decision Engine**

> 🌐 **Live Production Deployment:** [https://nexus-dqps.vercel.app](https://nexus-dqps.vercel.app)  
> 📊 **Interactive Decision Console:** [https://nexus-dqps.vercel.app/dashboard/overview](https://nexus-dqps.vercel.app/dashboard/overview)

---

## 1. The Problem Space (from DQPS)
D2C brands run fragmented operations across Meta, Google, Amazon, TikTok, programmatic —
with siloed spend, sales, margin, inventory, and creative data. Existing tools only
*visualize* history. Brand managers are left guessing which campaign to adjust, why
performance moved, and where the next dollar earns the most profit.

## 2. Questions We Are Solving
1. **What is happening?** — Unify ad spend, eCommerce sales, GA events, ERP inventory, and
   SKU margins into one truth (cross-platform reconciliation).
2. **Why did it happen?** — Diagnose anomalies: separate ad problems (CPM spike, creative
   fatigue) from business confounders (stockout, checkout latency).
3. **What should we do next?** — Predict the highest-profit reallocation of budget across
   platforms, campaigns, and SKUs *before* spend occurs.
4. **Did it work?** — Execute decisions and prove their impact with outcome feedback —
   every decision logged with expected vs realized results.

## 3. Questions We Answer (and how)
| Judge-level question | Our answer |
|---|---|
| ROAS dropped 30% on Meta — why? | Factor decomposition + LLM RCA card names the true driver (stockout −18pts, CPM +9pts…) |
| Which campaign do we cut? | Optimizer flags stockout-bleeding and fatigue campaigns for throttle/kill |
| Where should the next $ go? | Saturation-curve optimizer maximizes expected margin under budget + ±40% stability bounds + inventory constraints |
| How do we trust the AI? | Ground-truth event labels in the simulator; ledger shows realized ≈ expected for every decision |
| How is this different from a dashboard? | It *decides and learns*: a closed loop, not a chart |

## 4. The Solution — NEXUS-DQPS
An AI-native closed-loop decision engine:

**Ingest & Reconcile → Diagnose & Reason → Decide, Execute & Learn**

- Unified schema over 5 fragmented sources (DuckDB)
- Anomaly detection (z-score + IsolationForest) with contributing-factor decomposition
- LLM root-cause agent (Claude/OpenAI, offline template fallback)
- Budget optimizer (log-log response curves anchored at operating point, SLSQP)
- Mock ad-platform executor (FastAPI) that mutates simulated state
- Decision ledger: every directive, expected vs realized margin, confidence

## 5. Workflow (how it runs)
```
Simulator (90-day multi-platform data + 5 injected events)
   │
   ▼
Ingest/Reconcile ──► DuckDB unified schema
   │
   ▼
Diagnose: anomaly feed ──► factor decomposition ──► LLM RCA card
   │
   ▼
Decide: response curves ──► SLSQP reallocation ──► recommendation table
   │
   ▼
Execute: human approves ──► mock ad API mutates state
   │
   ▼
Learn: outcome measured vs forecast ──► decision ledger ──► models refit
```

1. `python scripts/run_demo.py` → regenerates seed-7 dataset, loads DuckDB, runs diagnosis + optimizer, writes ledger
2. `uvicorn execute.mock_ads_api:app --port 8000` → mock executor API
3. `streamlit run app/streamlit_app.py` → Mission Control UI (KPIs, anomaly feed, RCA, recommendations, approve, ledger)

## 6. Architecture
```
┌────────────┐    ┌──────────────┐    ┌───────────────┐    ┌──────────────┐
│ simulator/ │───►│  ingest/     │───►│  diagnose/    │───►│  agents/     │
│ generator  │    │  load (DuckDB│    │  anomaly +    │    │  rca (LLM)   │
└────────────┘    └──────────────┘    │  factors      │    └──────┬───────┘
                                      └───────┬───────┘           │
                                              ▼                   ▼
┌────────────┐    ┌──────────────┐    ┌───────────────┐    ┌──────────────┐
│ learn/     │◄───│  execute/    │◄───│  decide/      │◄───│  rca out     │
│ ledger     │    │  mock API    │    │  optimizer    │    └──────────────┘
└────────────┘    └──────────────┘    └───────────────┘
```

## 7. Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Language | Python 3.11+ | fast iteration |
| Warehouse | DuckDB (embedded) | zero-config unified schema |
| Diagnosis | z-score + IsolationForest | explainable, demo-safe |
| AI reasoning | Claude/OpenAI w/ template fallback | offline-safe demo |
| Optimizer | scipy SLSQP + log-log saturation curves | calibrated margin maximization |
| Executor | FastAPI mock ad API | swappable boundary for real APIs |
| Learning | append-only JSONL ledger | auditable expected-vs-realized |
| UI | Streamlit | clickable live demo in hours |
| Tests | pytest | contract safety for 6 devs |

## 8. Repo Layout
```
simulator/  — synthetic data + injected events with ground truth
ingest/     — DuckDB schema + loader
diagnose/   — anomaly detection + factor decomposition
agents/     — LLM root-cause explainer (+ offline fallback)
decide/     — response curves + budget optimizer
execute/    — mock ad-platform FastAPI executor
learn/      — decision ledger
app/        — Streamlit Mission Control
scripts/    — end-to-end demo runner
docs/       — PLAN, DEMO_WORKFLOW, TEAM_WORKFLOW, REPOS
tests/      — smoke tests
```

## 9. Team Workflow (6 people)
P1 simulator+ingest · P2 diagnosis · P3 optimizer · P4 LLM agent · P5 executor+ledger · P6 UI+demo+pitch.
Hour-by-hour plan, checkpoints, demo-day runbook: `Desktop/TEAM_WORKFLOW.md` · `docs/DEMO_WORKFLOW.md`.

## 10. Today's Demo (3 min)
Healthy margins overall → anomaly card glows red → RCA: "SKU stocked out (−85% ROAS)" →
optimizer kills amazon-SKU-100, shifts budget → approve → mock API applies →
ledger: realized ≈ expected → "every decision measured, every outcome learned."
