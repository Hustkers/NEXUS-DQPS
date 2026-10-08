# NEXUS-DQPS: Master Web Architecture Audit & Implementation Phases
### Supervised by the Harsh Critic: **Dr. Alexis Vance (Principal Econometrician & Supply-Chain Auditor)**

> **The Harsh Critic's Architectural Mandate:**  
> *"Every single section across this application must be grounded in our **40 active multi-channel campaigns**, the **10 canonical Nike footwear SKUs**, the **7 physical fulfillment centers**, our **Primal-Dual CBwK shadow pricing ($\lambda_{\text{budget}}, \lambda_{\text{inventory}}$)**, and our **Zone-skipping freight penalty ($\Delta = -\$13.70$/unit)**. If a section displays vanity numbers, generic placeholder copy, or unanchored currencies, it fails inspection."*

---

## Master Implementation Phases Summary

| Phase | Target Sections | Focus Area | Status |
| :---: | :--- | :--- | :---: |
| **Phase A** | Section 1, 2, 7 (Landing Page) | Preserved original luxury landing page per user preference. | **PRESERVED** |
| **Phase B** | Section 11, 12, 14 (3D Globe & Nodes) | Calibrated 7 physical fulfillment nodes (`FC-EAST-ALLENTOWN`, etc.), Zone-Skipping freight chips, and edge subnet telemetry. | **COMPLETED** |
| **Phase C** | Section 15 (RL Telemetry & Directives) | Integrated threshold alerts (`frequency > 2.8`, `Buy Box < 85%`, etc.) and 1-click Programmatic API mutation dispatch. | **COMPLETED** |
| **Phase D** | Section 10, 13, 16 (Command Center Polish) | Dual currency anchors ($1 = ₹84), SKU search chips, and CM3 itemized waterfall modals. | **NEXT UP** |

---

## Part 1: Main Platform Landing Page (`/` — `LandingPageView`)

### Section 0: Notch Top Navigation Bar (`web/src/components/vengence/notch-navbar.tsx`)
- **Audit:** Lacks real-time telemetry pulse; looks like a generic portfolio rather than an autonomous mission control.
- **TODO:**
  - [ ] Add live operational heartbeat indicator showing `DuckDB: 2,740 Rows Synced` and `Active SKUs: 10/10`.
  - [ ] Add direct navigation shortcuts to `/dashboard/globe` and `/dashboard/anomalies`.
  - [ ] Ensure currency toggle or clear indicator ($1 = ₹84 benchmark) is visible.

### Section 1: Fullscreen Hero Reel (`web/src/components/vengence/locomotive-hero-video.tsx`)
- **Audit:** Vague "Digital-first Ad Decision Agency" copy ignores the core mission: halting stockout ad bleed and autonomous capital protection.
- **TODO:**
  - [x] Update hero headline and subtitles to: `"NEXUS: Autonomous Decision Protection System"` and `"Halting Stockout Ad Bleed & Reallocating Capital in Real-Time"`.
  - [x] Overlay live hairline telemetry badge in top-right: `Stockout Alert: 310805-137 (0 units) → Meta Spend Frozen $0.00`.
  - [x] Add direct CTA link buttons to launch 3D Global Intelligence (`/dashboard/globe`) and Causal RCA Workbench (`/dashboard/anomalies`).

### Section 2: Multi-Channel Ad & Commerce Ecosystem (`web/src/components/vengence/ecosystem-stacked-logos.tsx`)
- **Audit:** Generic logos without API version badges or low-latency schema contracts.
- **TODO:**
  - [x] Enrich each card with exact API contract badges:
    - Meta: `Graph API v19.0` • `frequency > 2.8` • `actions[1d_view/7d_click]`
    - Google: `SearchStream v17.0` • `searchBudgetLostImpressionShare` • `costMicros`
    - Amazon: `SP-API v3` • `buyBoxWinPercentage` • `FBA fees` • `ASIN halo`
    - Shopify: `Admin REST/GraphQL 2024-01` • `CM3 net margin` • `inventory_levels`
  - [x] Add technical tooltips displaying schema parameters from `DATASET.md`.

### Section 3: Core System Pillars & Cards Stack (`web/src/components/vengence/pillars-cards-stack.tsx`)
- **Audit:** Math formulas omit the physical fulfillment dimension and DirectLiNGAM causal ordering.
- **TODO:**
  - [ ] Update Card 1 math formulation to display the physical inventory indicator $\mathbb{I}(I_{k,r} > 0)$ and analytical marginal derivative $\frac{dY}{dx} < 0.1\text{ms}$.
  - [ ] Update Card 2 to feature exact DirectLiNGAM causal ordering: $\text{Spend} \to \text{Impressions} \to \text{Clicks} \to \text{Orders} \to \text{Revenue}$ and Shapley root-cause decomposition.
  - [ ] Update Card 3 to showcase Primal-Dual shadow pricing ($\lambda_{\text{budget}}, \lambda_{\text{inventory}}$) and Tier-4 automated kill-switch.

### Section 4: 4-Phase Architectural Flow (`web/src/components/vengence/landing-page-view.tsx`)
- **Audit:** Phase 1 references TikTok as an ad spend campaign instead of an edge click token (`ttclid`).
- **TODO:**
  - [ ] Revise Phase 1 text to specify the 4 canonical platforms: Meta Ads, Google SearchStream, Amazon SP-API, and Shopify Admin API into DuckDB columnar tables.
  - [ ] Add explicit latency and throughput benchmarks in Phase 2 & 3: `<10ms` Z-score anomaly filtering, `<0.1ms` marginal ROAS gradient evaluation.
  - [ ] Anchor Phase 4 with the 24-hour closed-loop feedback loop that recalibrates online Bayesian priors in `learn/ledger.py`.

### Section 5: Isometric Algorithmic Telemetry Cockpit (`web/src/components/vengence/isometric-telemetry-panel.tsx`)
- **Audit:** Generic percentages on wireframe dials rather than grounded shoe SKU telemetry.
- **TODO:**
  - [ ] Map instrument readouts directly to `nexus-engine-state.json` campaign parameters (`310805-137` inventory $0$, Google Lost IS $34.2\%$, Amazon Buy Box $94.1\%$, Shopify CM3 $48.2\%$).
  - [ ] Implement interactive toggle to simulate Stockout Shock live on the wireframe.

### Section 6: Tech Stack Highlight Grid (`web/src/components/vengence/highlight-grid.tsx`)
- **Audit:** Emphasizes frontend tooling over DuckDB in-memory lakehouse and DoWhy-GCM causal discovery.
- **TODO:**
  - [ ] Add dedicated technical callout cards for DoWhy-GCM causal attribution and DuckDB columnar memory layout.
  - [ ] Add live query throughput metrics: `DuckDB: 2,740 records parsed in 14.2ms`.

### Section 7: Why Us Bento Grid (`web/src/components/vengence/why-us-bento.tsx`)
- **Audit:** Unquantified agency comparisons with vague marketing claims.
- **TODO:**
  - [x] Quantify comparative metrics based on `DATASET.md`:
    - Traditional Agency: `7-14 days reaction latency`, `Zero inventory sync`, `+35% stockout budget bleed`.
    - Generic LLM: `Hallucinatory non-convex budget splits`, `Zero bounded KKT guarantees`.
    - NEXUS-DQPS: `<10ms anomaly detection`, `100% automated stockout kill-switch`, `+$14,200 recovered margin`.
  - [x] Reference actual SKUs (`310805-137`, `315122-001`, `942851-002`).

### Section 8: FAQ Accordion (`web/src/components/vengence/faq-accordion.tsx`)
- **Audit:** Standard FAQs fail to address cross-platform cookie deprecation, Meta learning fatigue, or zone-skipping freight.
- **TODO:**
  - [ ] Rewrite FAQs to reflect Sections 5.3, 5.4, and 7.1 of `DATASET.md`.

### Section 9: ASCII Animated Footer (`web/src/components/vengence/landing-page-view.tsx`)
- **Audit:** Generic tagline.
- **TODO:**
  - [ ] Polish tagline to reference 40 multi-platform campaigns, Primal-Dual shadow pricing, and causal DAG discovery.

---

## Part 2: 3D Global Intelligence Command Center (`/dashboard/globe`)

### Section 10: Top HUD & Telemetry Bar
- **TODO:**
  - [ ] Add emergency indicator pulsing red when selected campaign SKU has `inventory === 0`.
  - [ ] Display live Primal-Dual state indicator (`λ_inv = 999.0 • Bleed Prevented: $840/day`).

### Section 11: Stage 1 GitHub 3D Globe with Regional Heatmap Shading
- **TODO:**
  - [x] Filter arc routes to match 7 regional fulfillment catchments (`us-east`, `us-west`, `emea-de`, `emea-uk`, `apac-jp`, `sea-sg`, `latam`).
  - [x] Verify US region heatmap dynamically reflects active order density.

### Section 12: Real-Time Order Stream & Freight Sidebar
- **TODO:**
  - [x] Add Zone-Skipping Freight indicator (`Zone 2 Local $4.80` vs `Zone 8 Cross-Country $18.50, Penalty -$13.70`).
  - [x] Include masked `/24` subnet prefix (e.g. `198.51.100.0/24`) and Edge PoP (`EWR`, `SFO`, etc.).

### Section 13: Omnichannel 40-Campaign Command Strip & Modal
- **TODO:**
  - [ ] Add SKU quick-filter chips for `All Stockouts (2 SKUs)` and `Surplus Inventory (Air Force 1)`.
  - [ ] Display dual USD ($) and INR (₹) values under $1 = ₹84 benchmark.

### Section 14: Stage 2 Cobe Pulse Globe & 7 Fulfillment Node Matrix
- **TODO:**
  - [x] Pin exact physical coordinates of 7 facilities (`FC-EAST-ALLENTOWN`, `FC-WEST-ONTARIO`, `FC-EU-LAAKDAL`, `FC-EU-DAVENTRY`, `FC-APAC-NARITA`, `FC-SEA-CHANGI`, `FC-LATAM-SAOPAULO`).
  - [x] Color-code node pulses by stock health.

### Section 15: RL Bandit & Headroom Policy Engine
- **TODO:**
  - [x] Add threshold alerts (`frequency > 2.8` on Meta, `Buy Box < 85%` on Amazon, `Lost IS Budget > 25%` on Google, `CM3 Net Margin` on Shopify).
  - [x] Add 1-click "Dispatch API Mutation" button in directives panel with confirmed execution receipt.

### Section 16: Product Deep-Dive Analysis Modal
- **TODO:**
  - [ ] Display full Contribution Margin 3 (CM3) itemized waterfall (MSRP, COGS, Gateway fee 2.9%+$0.30, Freight, Net Margin).
