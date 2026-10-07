# NEXUS D2C

**Next-Generation Autonomous D2C Advertising Intelligence & Decision Engine**

NEXUS D2C turns passive ad dashboards into an AI-native, closed-loop decision engine:
it unifies fragmented data, diagnoses *why* performance moved, decides the best
budget reallocation, executes it, and learns from measured outcomes.

---

## ⚡ Web Console: Dark Autonomous Decision Engine

The web console is built using **Next.js 16**, **shadcn/ui** (forked from `next-shadcn-dashboard-starter`), pulling chart and KPI patterns from **`modery68/meta-google-ads-dashboard`** and **Tremor**, themed as a dark **"autonomous decision engine" console**.

### Console Capabilities:
- **Autonomous Mission Control**: Real-time cross-channel telemetry (Meta, Google Shopping, Amazon, TikTok, Shopify ERP) with DuckDB unified warehouse sync.
- **Diagnostic RCA & Anomaly Cards (`modery68` pattern)**: 14-day & 4-week rolling baselines, Z-score attribution (|Z| > 2.2), causal factor decomposition bars (Stockout impact, CPM surge, Creative fatigue, CVR drop), and AI diagnostic reasoning.
- **ROAS Gauges & Health Scoring Matrix (`Tremor` + `modery68` pattern)**: Semicircular radial gauges with floor (break-even 1.8x), target (3.2x), and 0–100 Campaign Health Scores.
- **Autonomous Budget Reallocation Feed (`scipy` SLSQP)**: Optimal capital shifts between underperforming and convex high-marginal-yield campaigns, with 1-click execution via mock ad API and an Autonomous Auto-Pilot toggle.
- **Closed-Loop Decision Ledger (`learn/ledger.py`)**: Real-time audit trail measuring expected vs realized margin lift, variance calibration, and reinforcement feedback.
- **Autonomous Scenario Shock Sandbox**: Live injection triggers for Hero SKU Stockout, Meta CPM Auction Surge (+45%), TikTok Creative Fatigue (-60% CTR), and Amazon Buy Box Price Undercut.

---

## 🚀 Quickstart

### 1. Launch Next.js Autonomous Web Console
```bash
# From repository root:
pnpm dev
# Or cd web && pnpm dev / pnpm next start -p 3000

# Open in browser:
http://localhost:3000/dashboard/overview
```

### 2. Run Offline Python Decision Pipeline
```bash
pip install -r requirements.txt
python scripts/run_demo.py                                # end-to-end simulation & optimizer run
python scripts/export_engine_state.py                     # updates web/src/data/nexus-engine-state.json
uvicorn execute.mock_ads_api:app --port 8000              # mock ad executor API
```

---

## 📁 Repository Layout

- `web/` — Next.js 16 + shadcn/ui + Tremor dark autonomous decision console
  - `src/features/decision-engine/` — ROAS gauges, anomaly cards, reallocation feed, ledger, scenario injector
  - `src/data/nexus-engine-state.json` — Pre-compiled 90-day simulator data, anomalies, and allocations
  - `src/app/dashboard/` — Console routes: `/overview`, `/anomalies`, `/gauges`, `/reallocations`, `/ledger`, `/simulator`, `/matrix`
- `simulator/` — synthetic multi-platform D2C data + injected events (ground truth)
- `ingest/` — DuckDB unified schema loader
- `diagnose/` — anomaly detection + factor decomposition
- `agents/` — LLM root-cause explainer (template fallback)
- `decide/` — response-curve budget optimizer (scipy SLSQP)
- `execute/` — mock ad-platform FastAPI
- `learn/` — decision ledger (expected vs realized)
- `scripts/` — demo runner and data exporter

---

## 🏆 Autonomous Engine Capabilities Checklist
- [x] Cross-channel data synthesis (Meta, Google, Amazon, TikTok, ERP inventory, SKU gross margins)
- [x] Automated root cause diagnosis (Stockout, CPM spike, Creative wearout, Competitor price change)
- [x] Constrained optimization under inventory availability and ROAS floors
- [x] Closed-loop execution and decision ledger verification

