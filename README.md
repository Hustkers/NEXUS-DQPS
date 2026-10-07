# NEXUS D2C

**Next-Generation Autonomous D2C Advertising Intelligence & Decision Engine**

[![Live on Vercel](https://img.shields.io/badge/Live_Deployment-nexus--dqps.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://nexus-dqps.vercel.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![DataQuest 3.0](https://img.shields.io/badge/Hackathon-DataQuest_3.0-06b6d4?style=for-the-badge)](https://github.com/Hustkers/NEXUS-DQPS)

NEXUS D2C turns passive ad dashboards into an AI-native, closed-loop decision engine:
it unifies fragmented data, diagnoses *why* performance moved, decides the best
budget reallocation, executes it, and learns from measured outcomes.

---

## 🌐 Live Production Deployment

The autonomous mission control console is deployed and live on Vercel:

| Resource | Production Link |
| :--- | :--- |
| **🚀 Production Console** | **[https://nexus-dqps.vercel.app](https://nexus-dqps.vercel.app)** |
| **📊 Mission Control Dashboard** | **[https://nexus-dqps.vercel.app/dashboard/overview](https://nexus-dqps.vercel.app/dashboard/overview)** |
| **🔍 Anomaly & RCA Feed** | **[https://nexus-dqps.vercel.app/dashboard/anomalies](https://nexus-dqps.vercel.app/dashboard/anomalies)** |
| **🎯 ROAS & Health Matrix** | **[https://nexus-dqps.vercel.app/dashboard/gauges](https://nexus-dqps.vercel.app/dashboard/gauges)** |
| **⚡ Budget Reallocation Engine** | **[https://nexus-dqps.vercel.app/dashboard/reallocations](https://nexus-dqps.vercel.app/dashboard/reallocations)** |
| **📜 Closed-Loop Decision Ledger** | **[https://nexus-dqps.vercel.app/dashboard/ledger](https://nexus-dqps.vercel.app/dashboard/ledger)** |
| **🎮 Scenario Shock Sandbox** | **[https://nexus-dqps.vercel.app/dashboard/simulator](https://nexus-dqps.vercel.app/dashboard/simulator)** |
| **🧪 Ad Playground & Profit Engine** | **[https://nexus-dqps.vercel.app/dashboard/playground](https://nexus-dqps.vercel.app/dashboard/playground)** |

---

## ⚡ Web Console: Dark Autonomous Decision Engine

The web console is built using **Next.js 16**, **shadcn/ui** (forked from `next-shadcn-dashboard-starter`), pulling chart and KPI patterns from **`modery68/meta-google-ads-dashboard`** and **Tremor**, themed as a dark **"autonomous decision engine" console**.

### Console Capabilities:
- **Autonomous Mission Control**: Real-time cross-channel telemetry (Meta, Google Shopping, Amazon, TikTok, Shopify ERP) with DuckDB unified warehouse sync.
- **Ad Playground & Profit Maximization Engine (`decide/ad_playground.py`)**: Evaluates ~10 candidate advertising configurations for any footwear product across Meta, Google, Amazon, and TikTok. Fits response saturation curves ($r(s) = k \cdot s^b$), estimates volume economics, enforces warehouse stockout boundaries, and ranks candidates strictly by Expected Net Profit.
- **Diagnostic RCA & Anomaly Cards (`modery68` pattern)**: 14-day & 4-week rolling baselines, Z-score attribution (|Z| > 2.2), causal factor decomposition bars (Stockout impact, CPM surge, Creative fatigue, CVR drop), and AI diagnostic reasoning.
- **ROAS Gauges & Health Scoring Matrix (`Tremor` + `modery68` pattern)**: Semicircular radial gauges with floor (break-even 1.8x), target (3.2x), and 0–100 Campaign Health Scores.
- **Autonomous Budget Reallocation Feed (`scipy` SLSQP)**: Optimal capital shifts between underperforming and convex high-marginal-yield campaigns, with 1-click execution via mock ad API and an Autonomous Auto-Pilot toggle.
- **Closed-Loop Decision Ledger (`learn/ledger.py`)**: Real-time audit trail measuring expected vs realized margin lift, variance calibration, and reinforcement feedback.
- **Autonomous Scenario Shock Sandbox**: Live injection triggers for Hero SKU Stockout, Meta CPM Auction Surge (+45%), TikTok Creative Fatigue (-60% CTR), and Amazon Buy Box Price Undercut.

---

## 🚀 Quickstart

### 1. View Live Cloud Console
Open **[https://nexus-dqps.vercel.app/dashboard/overview](https://nexus-dqps.vercel.app/dashboard/overview)** in any browser.

### 2. Local Development (Optional)
```bash
# From repository root:
pnpm dev
# Or cd web && pnpm dev

# Open in browser:
http://localhost:3000/dashboard/overview
```

### 3. Run Offline Python Decision Pipeline
```bash
pip install -r requirements.txt
python scripts/run_demo.py                                # end-to-end simulation & optimizer run
python scripts/export_engine_state.py                     # updates web/src/data/nexus-engine-state.json
uvicorn execute.mock_ads_api:app --port 8000              # mock ad executor API
```

### 4. Sync Live Ad Channels (Shopify, Meta, Google, Amazon)
Configure your API credentials in `.env` (see `.env.example`), then run:
```bash
# 1. Audit API credentials and connectivity
python scripts/sync_live_ads.py --check-only

# 2. Pull live telemetry, reconcile with Shopify inventory & margins, and update console
python scripts/sync_live_ads.py --days 30
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
- [x] Production deployment on Vercel: [https://nexus-dqps.vercel.app](https://nexus-dqps.vercel.app)
