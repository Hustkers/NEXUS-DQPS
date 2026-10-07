# DataQuest 3.0 — DQPS Plan
## Next-Generation Autonomous D2C Advertising Intelligence & Decision Engine

---

## 1. One-Line Pitch
An AI-native closed-loop system that ingests fragmented D2C marketing data, diagnoses performance shifts, recommends/executes budget reallocations, and learns from outcomes — replacing passive dashboards with autonomous decisions.

## 2. Key Insight (from council)
- No real Meta/Google API keys in a hackathon → **build a high-fidelity synthetic data simulator** that replays realistic anomalies.
- Robyn/Meridian MMM need multi-year weekly data → **use a lightweight saturation/adstock model + counterfactual scoring** instead of full MMM.
- Judges reward **closed loop + decision ledger** (every action logged with measured impact), not dashboard screenshots.

## 3. Tech Stack (all open-source, runs offline)
| Layer | Choice |
|---|---|
| Language | Python 3.11+ |
| Data / warehouse | DuckDB (single-file, zero-config) |
| Agent orchestration | LangGraph (or a plain state-machine if LangGraph install issues) |
| LLM | Claude/OpenAI API for reasoning summaries; graceful fallback to templated text |
| Optimizer | scipy/cvxpy (budget allocation under constraints) |
| Anomaly/root-cause | IsolationForest + z-score + uplift attribution |
| API | FastAPI (mock ad-platform executor) |
| Dashboard | Streamlit or Next.js (Streamlit recommended for speed) |
| Repo | GitHub monorepo, docker-compose optional |

## 4. Architecture

```
[Simulator] ──> [Ingestion/Reconcile: DuckDB] ──> [Anomaly Detector]
    (Meta/Google/Amazon/TikTok spend,              (z-score, IsolationForest)
     sales, GA events, ERP inventory, SKU margins)         │
                                                          ▼
[Outcome Feedback] <── [Execution: mock Ad API] <── [Decision Engine]
        │                                                │
        └──> [Decision Ledger] <── [Root-Cause Agent (LLM)] <── [Reasoning: causal/uplift + LLM diagnosis]
                                     ▲
                            [Budget Optimizer: scipy]
```

**Closed loop:** Ingest → Detect → Diagnose (LLM + causal heuristics) → Recommend (optimizer) → Execute (mock API) → Measure lift vs counterfactual → Write to Decision Ledger → update baselines.

## 5. Data Simulator (most important module — the whole demo depends on it)
- Entities: 8–15 SKUs (each with margin %, price, inventory), 4 platforms (Meta, Google, Amazon, TikTok), campaigns per SKU-platform, audiences.
- Daily grain, ~90 days.
- Realistic dynamics: adstock decay, saturation curves, seasonality, CPM volatility, inventory stockouts, creative fatigue.
- Injected events: CPM spike, stockout on top SKU, creative fatigue, competitor price drop, sudden Meta→Google conversion shift. Each event = the "story" for demo.
- Ship events with ground-truth labels (the simulator knows why things changed → root-cause agent output can be scored).

## 6. Core Modules
1. **Ingest & Reconcile** (`ingest/`): normalize 5 sources into unified schema: `date, platform, campaign, sku, spend, impressions, clicks, conversions, revenue, margin$, inventory, ga_sessions`.
2. **Anomaly Detection** (`diagnose/anomaly.py`): z-score + IsolationForest on daily spend/ROAS/CAC per campaign; flag |z|>2.5 with p-value.
3. **Root-Cause Agent** (`agents/rca.py`): for each flagged anomaly, compute contributing-factor decomposition (Δspend, ΔCPM, ΔCVR, Δmargin, Δinventory) ranked by contribution; LLM turns numbers into a paragraph: "ROAS on Meta-Campaign-3 fell 32% because top-SKU stockout (−18pts) + CPM spike (−9pts)...".
4. **Budget Optimizer** (`decide/optimizer.py`): given current spend + response curves per campaign (saturation fit), solve max Σ margin$ s.t. total budget, min ROAS floor, inventory>0 constraints. Output: reallocation table with expected Δrevenue/Δmargin.
5. **Executor** (`execute/mock_ads_api.py`): FastAPI endpoint that "applies" budget changes to the simulated world → state mutates → next-day metrics reflect it.
6. **Outcome Learning** (`learn/ledger.py`): after N days, compare actual vs forecasted; store decision, expected impact, realized impact, confidence. Simple online update: refit saturation curves, adjust agent confidence thresholds.
7. **Dashboard** (`app/`): Unified metrics view, anomaly feed, RCA cards, recommendation panel with "Approve/Reject" button (human-in-loop), decision ledger with realized-vs-expected chart.

## 7. MVP Scope (48h version)
**Must have:**
- Simulator producing 90-day multi-platform dataset with ≥3 injected events
- Unified DuckDB schema + basic analytics queries
- Anomaly detection with ranked contributing factors
- One LLM agent writing root-cause explanations
- Budget optimizer producing reallocation recs
- Mock executor + outcome measurement (realized vs expected)
- Streamlit dashboard with Approve button + decision ledger
- 3-minute demo script

**Stretch:**
- Counterfactual "what-if" simulator before executing (guardrails: min ROAS, max spend)
- Multi-agent split (Researcher/Diagnoser/Trader agents)
- Geo-level modeling, uplift modeling
- Real Meta/Google API sandbox if time

## 8. 6-Teammate Split (assuming ~24–48h)
| Role | Owner | Deliverables |
|---|---|---|
| 1. Data Simulator + Ingestion | Person A | simulator.py, unified schema, seed script, event injection |
| 2. Diagnosis: anomaly + root-cause | Person B | anomaly.py, factor decomposition, RCA scoring vs ground truth |
| 3. Decision Engine + Optimizer | Person C | response curves, scipy optimizer, recommendation API |
| 4. Agent + LLM layer | Person D | LangGraph/state-machine agent, prompt templates, ledger integration |
| 5. Execution + Learning loop | Person E | mock ad API, state mutation, outcome measurement, ledger store |
| 6. Dashboard + Demo + Docs | Person F | Streamlit app, decision ledger viz, pitch deck, 3-min demo script |

Integration points (contract first, hour 3–4): schema DDL, `Recommendation` dataclass, `LedgerEntry` dataclass. Everyone codes against these.

## 9. Timeline
- **Hour 0–3:** Contracts, schema, repo setup, split work
- **Hour 3–12:** Module development (all parallel)
- **Hour 12:** First end-to-end wire-up (simulator → ingest → anomaly → recs)
- **Hour 12–20:** Agent + executor + ledger integration
- **Hour 20–30:** Dashboard, polish, demo data seeding
- **Hour 30–36:** Demo rehearsal ×3, fix narrative gaps
- **Hour 36+:** Stretch goals or sleep

## 10. Demo Script (3 min)
1. "Meet D2C brand X — 4 platforms, 12 SKUs, budget fragmented." (dashboard)
2. "ROAS on Meta dropped 32% this week." → click anomaly → RCA card: "top SKU stocked out (−18pts), CPM spike (−9pts), creative fatigue (−5pts)."
3. "System recommends: shift ₹2L from Meta-Campaign-3 to Google-Shopping-SKU-7 (high margin, in-stock, 3.4x predicted ROAS). Approve."
4. "Approved → mock API applies → 7 days later: margin recovered +₹5.1L vs expected ₹4.6L → ledger records it → model updates."
5. Close: "Every decision logged, every outcome measured — a system that learns, not a dashboard that describes."

## 11. Evaluation-Safeguard Checklist
- Ground-truth event labels in simulator → we can claim root-cause accuracy (e.g., "agent identifies true driver in 4/5 cases")
- Ledger shows realized vs expected on every decision
- Guardrails enforced: no negative inventory, min-ROAS floor, max budget shift per cycle
- Fallback: if LLM API key fails at demo, templates produce the same explanations

## 12. Risks & Mitigations
- LangGraph/LLM API flakiness → plain state-machine fallback + templated prose
- Simulator too simplistic → calibrate CPM/CVR ranges from public benchmarks (words like "typical Meta CVR 1–3%")
- Integration hell → contract-first schema + mock each other's modules with fixtures
- Demo-day crash → seed data is static snapshot; system replays from a known-good state
