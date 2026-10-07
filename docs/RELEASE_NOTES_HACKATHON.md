# NEXUS-DQPS — Hackathon Master Release & Architecture Manifest

**DataQuest 3.0 | Next-Generation Autonomous D2C Advertising Intelligence & Decision Engine**  
**Live Production URL:** [https://nexus-dqps.vercel.app](https://nexus-dqps.vercel.app)  
**Interactive Mission Control:** [https://nexus-dqps.vercel.app/dashboard/overview](https://nexus-dqps.vercel.app/dashboard/overview)

---

## 1. The Core Problem Statement & Research Dilemma
Traditional D2C growth operations optimize for vanity platform ROAS while bleeding capital due to:
1. **Walled-Garden Attribution Lag**: Meta, Google, and Amazon over-claim credit with conflicting attribution windows (7-day click vs 30-day click vs zero-conversion server drops).
2. **ERP Stockout Blind Spots**: Ad spend continues pumping thousands into SKUs that are out-of-stock at warehouse level.
3. **Black-Box AI Hallucinations**: Prompting unconstrained LLMs to allocate budgets breaks ad platform learning phases and causes catastrophic bid spikes.

### The Question We Answer:
> **"How Can D2C Brands Stop Ad Budget Bleed Autonomously?"**

---

## 2. The NEXUS Solution Architecture
NEXUS decouples deterministic mathematical optimization from causal diagnostic reasoning:

```
+-----------------------------------------------------------------------------------------+
|                                    NEXUS-DQPS ENGINE                                    |
+------------------------------------+----------------------------------------------------+
| 1. Deterministic Math & Guardrails | 2. Causal Diagnostics & Intelligence               |
| - Scipy SLSQP KKT convex solver    | - Causal DAG factor decomposition (Stockout / CPM) |
| - Strict ±20% platform stability   | - LLM root-cause diagnostic reasoning cards        |
| - Sub-15m stockout circuit breaker | - Real-time visitor tracking & multi-touch graph   |
| - Net Contribution Profit (POAS)   | - Closed-loop immutable ledger with 1-click rollback|
+------------------------------------+----------------------------------------------------+
```

---

## 3. Key Delivered Capabilities & Routes

| Module | Route | Description |
| :--- | :--- | :--- |
| **Landing Hero Cockpit** | `/` | High-impact VengenceUI design with VGPU Canvas particle wave, clear problem/solution framing, and instant sandbox links |
| **Mission Control Console** | `/dashboard/overview` | Real-time cross-channel telemetry across Meta, Google Shopping, Amazon, TikTok, and Shopify ERP |
| **Strategy Engine** | `/dashboard/strategy-engine` | 20+ candidate campaign archetypes evaluated across CTR, CPC, CVR, risk score, and fit |
| **Visitor Tracking & Attribution** | `/dashboard/tracking` | Visitor event streams, session lifecycles, and identity stitching links |
| **ROAS & Health Gauges** | `/dashboard/gauges` | Radial gauges with break-even floors (1.8x), target POAS (3.2x), and one-click stockout fix actions |
| **Autonomous Reallocator** | `/dashboard/reallocations` | Bounded Scipy SLSQP convex capital reallocation with auto-pilot execution |
| **Closed-Loop Decision Ledger** | `/dashboard/ledger` | Expected vs. realized margin audit trail with variance calibration |
| **Crisis Scenario Sandbox** | `/dashboard/simulator` | Live injection triggers for Hero SKU stockout, CPM surge, TikTok creative fatigue, and Amazon buy-box undercut |
| **Global Telemetry Globe** | `/dashboard/globe` | Interactive 3D GitHub globe and Cobe pulse visualization of regional revenue density |

---

## 4. Verification & Testing
- **TypeScript**: 0 errors across 42 application routes.
- **Production Build**: Verified with Next.js 16 (Turbopack) in `< 30s`.
- **End-to-End Contract Tests**: Pytest validation of SLSQP convergence and DuckDB cross-channel reconciliation.
