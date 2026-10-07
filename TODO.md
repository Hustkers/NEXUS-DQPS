# NEXUS-DQPS: Autonomous D2C Advertising Intelligence & Decision Engine
## Master Implementation Blueprint & 100-Item Statewide Hackathon Roadmap

---

### System Architectural Mandate
- **Data Platforms & Sources:** 
  - **Meta Ads:** Meta Graph API (`/insights` schema with `actions`, `action_values`, `frequency`, `cpm`, `cpc`, `7d_click`, `1d_view`).
  - **Google Ads:** Google Ads API (`GoogleAdsRow` schema with `campaign`, `metrics.cost_micros`, `metrics.conversions_value`, `segments.date`).
  - **Amazon Advertising:** Amazon Ads API (`sp_report` schema with `campaignId`, `asin`, `sku`, `attributedSales14d`, `attributedUnitsOrdered14d`).
  - **Shopify Storefront & ERP:** Shopify Admin REST/GraphQL & Webhook schemas (`orders/create`, `inventory_levels/update`, `products/variants`, `unit_cost_cogs`).
- **Data Generation:** Production-exact synthetic payloads generated from endpoint schemas without shortcuts.
- **Backend Stack:** Pure Python (FastAPI, DuckDB, NumPy, SciPy, DoWhy-GCM, Pydantic v2).
- **Cloud Intelligence:** Google Cloud API (Gemini 1.5 Pro / Flash for structured causal explanation and executive scenario synthesis).
- **Frontend / Console:** Next.js 16 (in `web/`), shadcn/ui, Tailwind CSS, Recharts / D3.js Causal Graphs, ElevenLabs Voice SDK.
- **Mathematical Formulations:** Adstock Carryover + Hill Diminishing Returns, Non-Linear SLSQP Optimization for Net Contribution Margin ($\text{NCM}$), Online Combinatorial Bandits with Knapsacks (CBwK) with Primal-Dual Shadow Pricing, Structural Causal Models (SCM) with Counterfactual Residual Attribution.

---

## Stage 1: Foundation, Endpoint-Exact Synthetic Ingestion & Canonical Reconciliation

### Section 1: Endpoint-Exact Schema Architecture & Canonical Data Contracts
- [ ] 1.1 Implement production-exact Meta Graph API Pydantic v2 model in `ingest/models/meta.py` mirroring `/v19.0/{ad_id}/insights` (`spend`, `impressions`, `clicks`, `cpc`, `cpm`, `actions: [{"action_type": "omni_purchase", "value": ...}]`, `action_values`, `frequency`, `date_start`, `date_stop`).
- [ ] 1.2 Implement production-exact Google Ads API Pydantic v2 model in `ingest/models/google.py` mirroring `GoogleAdsRow` (`campaign.id`, `campaign.name`, `campaign.advertising_channel_type`, `segments.date`, `metrics.impressions`, `metrics.clicks`, `metrics.cost_micros`, `metrics.conversions`, `metrics.conversions_value`, `metrics.average_cpc`).
- [ ] 1.3 Implement production-exact Amazon Advertising API Pydantic v2 model in `ingest/models/amazon.py` mirroring Sponsored Products reporting (`campaignId`, `campaignName`, `adGroupId`, `asin`, `sku`, `date`, `impressions`, `clicks`, `cost`, `attributedSales14d`, `attributedUnitsOrdered14d`, `currency`).
- [ ] 1.4 Implement production-exact Shopify Admin REST/Webhook Pydantic v2 models in `ingest/models/shopify.py` for `Order` (`id`, `order_number`, `created_at`, `line_items`: [`variant_id`, `sku`, `price`, `quantity`, `total_discount`], `total_price`, `subtotal_price`) and `InventoryLevel` (`inventory_item_id`, `location_id`, `available`, `sku`, `unit_cogs`).
- [ ] 1.5 Construct the canonical continuous-time tensor `UnifiedCommerceRecord` in `ingest/models/canonical.py` indexing reconciled operational metrics over `(timestamp, channel, campaign_id, sku_id)`.
- [ ] 1.6 Implement schema normalization utilities in `ingest/normalize.py` handling `cost_micros` conversion, multi-currency USD conversion, ISO 8601 UTC timestamps, and SKU-to-ASIN-to-Variant cross-referencing.
- [ ] 1.7 Create automated JSON Schema export scripts (`scripts/export_schemas.py`) generating TypeScript interfaces in `web/src/types/` directly from Pydantic models for end-to-end type safety.
- [ ] 1.8 Generate golden contract fixtures in `data/fixtures/` (`meta_insights_fixture.json`, `google_ads_row_fixture.json`, `amazon_sp_report_fixture.json`, `shopify_orders_fixture.json`) for zero-blocker offline development.
- [ ] 1.9 Design DuckDB warehouse relational tables in `db/schema.sql` and `ingest/duckdb_client.py` with primary keys, columnar parquet storage, and foreign key indexes linking ad spend to Shopify orders and inventory.
- [ ] 1.10 Document canonical and platform-exact schema definitions, mapping tables, and conversion formulas in `docs/CANONICAL_SCHEMA.md`.

### Section 2: Production-Grade Synthetic Telemetry Generator & Cloud Integration
- [ ] 2.1 Refactor `simulator/data_generator.py` into a modular synthetic generator that outputs endpoint-exact JSON payloads for Meta Insights, Google Ads Rows, Amazon SP Reports, and Shopify Orders.
- [ ] 2.2 Implement Meta Graph API synthetic payload generator modeling social discovery auction dynamics, daily impression pacing, frequency fatigue wear-out, and 7-day click / 1-day view attribution splits.
- [ ] 2.3 Implement Google Ads API synthetic generator modeling intent-driven search auctions, quality score shifts, CPC bid inflation, and `cost_micros` precision formatting.
- [ ] 2.4 Implement Amazon Advertising API generator modeling high-intent bottom-funnel Sponsored Products, Buy Box win rates, ASIN-SKU conversions, and 14-day order attribution windows.
- [ ] 2.5 Implement Shopify synthetic event generator in `simulator/shopify_generator.py` emitting realistic `orders/create` order lines with discounts, refunds, and real-time `inventory_levels/update` stock deductions.
- [ ] 2.6 Program realistic operational shock triggers into synthetic generators: Hero SKU stockout in Shopify, Meta CPM spike (+45%), Google Search competition surge, and web checkout tagging dropoffs.
- [ ] 2.7 Configure Google Cloud API client integration in `agents/cloud_client.py` using Google Cloud API Key with connection pools, exponential backoff, and quota-aware rate limiters.
- [ ] 2.8 Build high-performance DuckDB ingestion pipelines in `ingest/loader.py` importing multi-platform synthetic JSON/parquet records into unified tables in sub-50ms.
- [ ] 2.9 Implement the cross-channel unit economics reconciler in `ingest/reconcile.py` calculating true Blended ROAS, POAS (Profit on Ad Spend), and MER (Marketing Efficiency Ratio) using real Shopify COGS.
- [ ] 2.10 Build standalone CLI demo `python -m ingest.demo` and unit tests in `tests/test_ingestion.py` verifying synthetic schema compliance against official Meta, Google, Amazon, and Shopify specs.

---

## Stage 2: Causal Inference & Diagnostic Root Cause Analysis

### Section 3: Statistical Anomaly Detection & Time-Series Metric Filtering
- [ ] 3.1 Implement non-parametric rolling Interquartile Range (IQR) and dynamic Z-score outlier detectors in `diagnose/anomaly.py` over trailing 7-day and 14-day performance windows.
- [ ] 3.2 Implement day-of-week and seasonal baseline de-biasing in `diagnose/filters.py` to prevent expected weekend or holiday shopping dips from triggering false positive alerts.
- [ ] 3.3 Build high-frequency volatility filters with exponential smoothing to suppress stochastic auction noise and minor intra-day bid perturbations.
- [ ] 3.4 Implement multi-metric anomaly triggering: flag concurrent divergences across ROAS, Click-Through Rate (CTR), Cost Per Click (CPC), and Conversion Rate (CVR).
- [ ] 3.5 Create an anomaly severity scoring matrix (`CRITICAL`, `WARNING`, `INFO`) based on financial contribution loss rate ($/hour burned without conversion).
- [ ] 3.6 Implement automated baseline deviation calculation quantifying percentage drop ($\Delta\%$) between observed telemetry and expected structural baseline.
- [ ] 3.7 Build an anomaly event dispatcher emitting standardized `AnomalyEvent` payloads into the diagnostic processing pipeline.
- [ ] 3.8 Implement unit tests in `tests/test_anomaly.py` covering edge cases: sudden ROAS crash to zero, slow creative wear-out decay, and flash-sale demand spikes.
- [ ] 3.9 Benchmark anomaly detector execution latency to guarantee sub-10ms response times on streaming batch records.
- [ ] 3.10 Expose diagnostic inspection endpoints in FastAPI (`GET /api/v1/anomalies/active` and `GET /api/v1/anomalies/history`).

### Section 4: Structural Causal Modeling (SCM) & Counterfactual Anomaly Attribution
- [ ] 4.1 Construct the enterprise Directed Acyclic Graph (DAG) topology in `diagnose/causal_graph.py` mapping: `Media Spend -> Impressions -> Clicks -> Page Views -> Unit Orders (conditioned on Shopify Inventory) -> Net Contribution Margin`.
- [ ] 4.2 Formulate the structural causal equations using `DoWhy-GCM`, assigning continuous functional relationships and unobserved exogenous noise terms ($U_i$) to each node.
- [ ] 4.3 Implement structural graph validation in `diagnose/graph_validator.py` verifying directed acyclicity, topological sorting order, and domain-enforced business constraints.
- [ ] 4.4 Build the counterfactual anomaly attribution engine in `diagnose/attribution.py` evaluating: $\phi(X_i \to Y) = \mathbb{E}[Y \mid \text{do}(U_i \sim P(U_i)), \mathbf{X} = \mathbf{x}^{\text{obs}}] - y^{\text{obs}}$.
- [ ] 4.5 Implement Shapley value decomposition across structural parent nodes to allocate additive percentage root-cause attributions summing strictly to 100%.
- [ ] 4.6 Implement specific causal diagnostic rules isolating: (a) `INVENTORY_STOCKOUT` in Shopify vs (b) `CREATIVE_FATIGUE` in Meta vs (c) `AUCTION_COMPETITION_SURGE` in Google/Amazon vs (d) `CONVERSION_PIXEL_FAILURE`.
- [ ] 4.7 Integrate Google Cloud API (Gemini) in `agents/rca.py` to synthesize mathematical attribution scores into natural language causal explanations and root-cause summaries.
- [ ] 4.8 Build a standalone diagnostic demonstration runner (`python -m diagnose.demo`) verifying counterfactual attribution on synthetic stockout scenarios.
- [ ] 4.9 Implement parameter caching and pre-fitted causal mechanism baselines to achieve sub-200ms causal attribution inference during live evaluation.
- [ ] 4.10 Write unit tests in `tests/test_causal_rca.py` asserting that simulated Shopify inventory depletion correctly attributes >60% contribution to stockout rather than ad creative wear-out.

---

## Stage 3: Constrained Predictive Optimization & Budget Allocation Engine

### Section 5: Media Response Modeling (Adstock & Hill Diminishing Returns)
- [ ] 5.1 Implement the geometric adstock transformation function in `decide/curves.py`: $x_c^{\text{adstock}}(t) = \sum_{l=0}^L \alpha_c^l x_c(t-l)$ with channel-specific decay parameters $\alpha_c \in [0, 1]$.
- [ ] 5.2 Implement the non-linear Hill saturation function: $\text{Hill}(x; \beta, \eta, K) = \beta \frac{x^\eta}{K^\eta + x^\eta}$ modeling diminishing marginal returns and channel saturation.
- [ ] 5.3 Calibrate channel-specific response parameters for Meta Ads (rapid saturation, moderate decay), Google Ads (high intent, medium saturation), and Amazon Advertising (high conversion floor, steep half-saturation).
- [ ] 5.4 Compute closed-form analytical first derivatives (marginal ROAS: $m\text{ROAS} = \frac{d\,\text{Revenue}}{d\,\text{Spend}}$) to evaluate incremental revenue per additional dollar invested.
- [ ] 5.5 Implement automated fitting of Hill and Adstock curve parameters from trailing 60-day historical data using non-linear least squares (`scipy.optimize.curve_fit`).
- [ ] 5.6 Build saturation curve sampling routines that output discrete spend-to-revenue curve coordinates for interactive frontend charting in `web/`.
- [ ] 5.7 Calculate channel saturation inflection points and identify "underfunded" versus "diminishing return" spend regimes across active Meta, Google, and Amazon campaigns.
- [ ] 5.8 Implement unit tests in `tests/test_curves.py` asserting mathematical boundary conditions: $f(0) = 0$, monotonic increase ($f'(x) \ge 0$), and asymptotic convergence to $\beta$ as $x \to \infty$.
- [ ] 5.9 Build a caching layer for fitted response curves with periodic background refitting to minimize optimization computational overhead.
- [ ] 5.10 Validate predictive accuracy of the fitted response models using holdout cross-validation calculating Mean Absolute Percentage Error (MAPE).

### Section 6: Non-Linear Constrained Mathematical Optimizer (SLSQP & Primal-Dual Bandits)
- [ ] 6.1 Formulate the global enterprise objective function in `decide/optimizer.py` directly maximizing total Net Contribution Margin ($\text{NCM} = \sum (\text{Price}_k - \text{COGS}_k - \text{VariableCost}_k) \cdot Q_k(\mathbf{b}) - \sum b_c$).
- [ ] 6.2 Implement multi-dimensional operational constraint vectors: (a) Total Budget ceiling $\sum b_c \le B_{\text{total}}$, (b) Per-channel min/max spend bounds, and (c) Portfolio Blended ROAS floor constraint.
- [ ] 6.3 Implement physical Shopify inventory stockout prevention constraints: projected order volume over planning horizon $\le$ current on-hand stock + lead-time replenishment.
- [ ] 6.4 Implement daily spend velocity constraints limiting maximum allowable budget delta to $\pm 25\%$ per 24-hour cycle to protect ad platform bidding stability.
- [ ] 6.5 Solve the non-linear constrained program using Sequential Least Squares Quadratic Programming (`scipy.optimize.minimize` with method `SLSQP`).
- [ ] 6.6 Provide analytical Jacobian gradients of the objective and constraints to guarantee sub-50ms optimizer convergence and eliminate numerical approximation jitter.
- [ ] 6.7 Implement the online Combinatorial Bandits with Knapsacks (CBwK) engine in `decide/bandits.py` utilizing a primal-dual algorithm with multiplicative weight updates for intra-day reallocation.
- [ ] 6.8 Formulate dynamic shadow pricing ($\lambda_{j,t}$) on inventory and liquidity knapsacks, penalizing spend on depleted SKUs and reallocating capital to high-margin alternatives.
- [ ] 6.9 Build a simulation engine (`decide/simulator.py`) calculating forecasted Net Profit, Blended ROAS, POAS, and stock runway days for any proposed budget vector across Meta, Google, and Amazon.
- [ ] 6.10 Build a standalone runnable CLI module (`python -m decide.demo`) proving budget reallocation shifts capital away from stockouts to high-margin inventory.

---

## Stage 4: Autonomous Orchestration, Safety Guardrails & Execution Gateway

### Section 7: Agentic Orchestrator, Google Cloud LLM Reasoning & Production Mock APIs
- [ ] 7.1 Design an asynchronous stateful workflow orchestrator in `agents/orchestrator.py` managing state transitions: `TELEMETRY_INGESTED -> ANOMALY_DETECTED -> RCA_COMPLETED -> OPTIMIZER_SOLVED -> DIRECTIVE_GENERATED -> EXECUTED`.
- [ ] 7.2 Implement `DiagnosisReviewNode` parsing RCA attribution outputs and formulating strategic commercial priorities.
- [ ] 7.3 Implement `StrategyGenerationNode` translating mathematical reallocation vectors into discrete operational actions (`SHIFT_BUDGET`, `THROTTLE_CAMPAIGN`, `SCALE_CAMPAIGN`).
- [ ] 7.4 Integrate Google Cloud API (Gemini) with structured JSON function calling to generate executive explanations, action summaries, and risk analyses.
- [ ] 7.5 Build a modular Execution Gateway in `execute/gateway.py` providing standardized interfaces to execute budget modifications across Meta Marketing API, Google Ads API, and Amazon Advertising API.
- [ ] 7.6 Refactor `execute/mock_ads_api.py` with endpoint-exact responses and latency emulation (50ms) for Meta Graph API (`POST /act_{id}/campaigns`), Google Ads API (`POST /customers/{id}/campaigns:mutate`), and Amazon Ads API (`PUT /sp/campaigns`).
- [ ] 7.7 Implement atomic multi-step rollback routines restoring previous budget states if an API modification fails mid-flight.
- [ ] 7.8 Build immutable JSON audit logging recording every diagnostic event, optimization proposal, authorization token, and API execution receipt.
- [ ] 7.9 Expose REST endpoints in FastAPI for manual and programmatic action approvals (`GET /api/v1/directives` and `POST /api/v1/directives/{id}/approve`).
- [ ] 7.10 Build a standalone test runner (`python -m agents.demo`) executing an end-to-end autonomous loop in the terminal.

### Section 8: Deterministic Safety Guardrails, Circuit Breakers & Closed-Loop Decision Ledger
- [ ] 8.1 Implement Tier-1 Autonomy guardrail rules in `execute/guardrails.py`: automatically authorize spend shifts $< 10\%$ when causal attribution confidence $> 90\%$.
- [ ] 8.2 Implement Tier-2 Autonomy guardrail rules: route moderate shifts ($10\% - 30\%$) and creative rotations through voice-assisted human authorization.
- [ ] 8.3 Implement Tier-3 Autonomy guardrail rules: enforce strict human sign-off on global budget shifts $> 30\%$ or absolute adjustments exceeding $\$2,500$.
- [ ] 8.4 Implement Tier-4 Automated Kill-Switch daemon in `execute/kill_switch.py`: immediately freeze spend to baseline minimums if 0 Shopify conversion events are recorded over 2 consecutive hours with active spend.
- [ ] 8.5 Build an Inventory Runway Circuit Breaker: automatically trigger campaign throttling when projected days of Shopify inventory remaining drops below supplier lead time.
- [ ] 8.6 Implement budget drift velocity limiters rejecting any programmatic action exceeding $\pm 25\%$ change within any 6-hour sliding window.
- [ ] 8.7 Enhance `learn/ledger.py` with outcome evaluation routines calculating realized post-execution performance versus synthetic counterfactual baselines at $t+24$ hours.
- [ ] 8.8 Implement an automated feedback mechanism updating Bayesian prior distributions and online bandit exploration parameters based on observed performance deltas.
- [ ] 8.9 Write comprehensive unit tests in `tests/test_guardrails.py` ensuring unapproved high-risk modifications are completely blocked.
- [ ] 8.10 Document safety architecture, autonomy tiers, and fail-safe triggers in `docs/SAFETY_GOVERNANCE.md`.

---

## Stage 5: Autonomous Web Console, Voice HITL & Winning 3-Act Demo Execution

### Section 9: Real-Time Executive Decision Console & Causal Graph Visualizer
- [ ] 9.1 Optimize the existing Next.js 16 web console in `web/` with dark obsidian/slate autonomous command center styling and high visual polish.
- [ ] 9.2 Build a mock/live data adapter toggle (`NEXT_PUBLIC_USE_MOCKS=true/false`) enabling seamless offline execution or live FastAPI backend connection.
- [ ] 9.3 Implement the Executive Overview KPI banner: Blended ROAS, POAS (Profit on Ad Spend), MER, 24h Spend, and At-Risk Out-of-Stock SKUs.
- [ ] 9.4 Build an interactive cross-channel time-series chart (Meta vs Google vs Amazon) displaying ad spend, revenue, and ROAS trajectories over time.
- [ ] 9.5 Implement an interactive Causal Graph (DAG) visualizer using D3.js / ReactFlow with animated nodes highlighting the active counterfactual anomaly path.
- [ ] 9.6 Implement an RCA Waterfall decomposition component breaking down efficiency loss into exact dollar/percentage shares for Stockout, Fatigue, and CPM surge.
- [ ] 9.7 Build the Proactive Action Feed displaying actionable decision cards with root-cause badges, projected profit lifts, and safety validation indicators.
- [ ] 9.8 Implement the Interactive What-If Scenario Sandbox featuring real-time sliders for cross-channel budget reallocation with instantaneous profit recalculation.
- [ ] 9.9 Implement the Autonomous Execution & Audit Trail component displaying real-time execution receipts, timestamps, and closed-loop verification metrics.
- [ ] 9.10 Conduct comprehensive UI responsiveness, contrast, and layout audits ensuring pixel-perfect display on standard laptop presentation screens.

### Section 10: Multimodal Voice / HITL Governance & 3-Act Demo Scripting
- [ ] 10.1 Integrate ElevenLabs Conversational AI SDK with bidirectional WebSockets in `web/src/features/voice/` for conversational voice briefings and voice-authorized budget execution.
- [ ] 10.2 Configure custom agent persona and system prompts in ElevenLabs: executive, concise, numbers-focused D2C chief operating intelligence.
- [ ] 10.3 Define client-side and server-side tool calling hooks allowing the voice agent to execute `approve_reallocation_plan` directly upon verbal authorization.
- [ ] 10.4 Implement an animated real-time audio visualizer (sine wave / pulsing ring) in the frontend header reflecting active voice synthesis and listening states.
- [ ] 10.5 Implement fallback interactive text chat modal ensuring 100% demonstration reliability in noisy hackathon presentation halls or on spotty Wi-Fi.
- [ ] 10.6 Script Act 1 (0:00 - 0:30): Demonstrate the silent ROAS crash (-66%) caused by an out-of-stock hero SKU in Shopify burning ad spend across channels without orders.
- [ ] 10.7 Script Act 2 (0:30 - 0:60): Showcase causal DAG isolation proving stockout root cause, followed by instant SLSQP mathematical optimization recovering net profit.
- [ ] 10.8 Script Act 3 (0:60 - 0:90): Trigger live ElevenLabs voice briefing, deliver verbal executive authorization ("Authorize reallocation"), and showcase live UI update.
- [ ] 10.9 Create a one-command master launch script (`./start_demo.sh`) that spins up the FastAPI backend, seeds telemetry, and serves the web console.
- [ ] 10.10 Rehearse and record a backup video walkthrough of the 90-second pitch flow to safeguard against hardware failure during judging rounds.
