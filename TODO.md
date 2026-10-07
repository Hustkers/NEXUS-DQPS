# NEXUS-DQPS: Autonomous D2C Advertising Intelligence & Decision Engine
## Master Implementation Blueprint & 100-Item Statewide Hackathon Roadmap

---

### System Architectural Mandate
- **Campaign Channels:** Meta Ads, Google Ads, Amazon Advertising.
- **Backend Stack:** Pure Python (FastAPI, DuckDB, NumPy, SciPy, DoWhy-GCM, Pydantic v2).
- **Cloud Intelligence:** Google Cloud API (Gemini 1.5 Pro / Flash for structured causal explanation and executive scenario synthesis).
- **Frontend / Console:** Next.js 16 (in `web/`), shadcn/ui, Tailwind CSS, Recharts / D3.js Causal Graphs, ElevenLabs Voice SDK.
- **Mathematical Formulations:** Adstock Carryover + Hill Diminishing Returns, Non-Linear SLSQP Optimization for Net Contribution Margin ($\text{NCM}$), Online Combinatorial Bandits with Knapsacks (CBwK) with Primal-Dual Shadow Pricing, Structural Causal Models (SCM) with Counterfactual Residual Attribution.

---

## Stage 1: Foundation, Data Ingestion & Ground-Truth Simulation (Meta, Google, Amazon)

### Section 1: Canonical Schema Architecture & DuckDB Analytical Warehouse
- [ ] 1.1 Define unified Pydantic v2 models in `ingest/models.py` for `AdPerformanceRecord` unifying Meta, Google, and Amazon advertising telemetry (spend, impressions, clicks, CPC, attributed conversions, attributed revenue).
- [ ] 1.2 Define `InventoryStateRecord` schema tracking SKU-level on-hand inventory, reserved stock, incoming replenishment, and days of inventory remaining.
- [ ] 1.3 Define `FinancialMarginVector` schema capturing unit retail price, Cost of Goods Sold (COGS), pick-pack-ship fees, merchant processing fees, and channel-specific margins.
- [ ] 1.4 Construct the unified continuous-time performance tensor `UnifiedCommerceRecord` indexing operational metrics over `(timestamp, channel, campaign_id, sku_id)`.
- [ ] 1.5 Implement multi-currency and timezone normalization utilities converting all historical platform timestamps to UTC and monetary values to USD in `ingest/normalize.py`.
- [ ] 1.6 Create JSON Schema export scripts (`scripts/export_schemas.py`) to generate TypeScript type definitions directly for `web/src/types/` ensuring end-to-end type safety.
- [ ] 1.7 Create golden contract fixtures in `data/fixtures/` (`mock_ad_data.json`, `mock_inventory.json`, `mock_financials.json`) with deterministic test data for Day-1 zero-blocker development.
- [ ] 1.8 Implement strict contract validation tests using `pytest tests/test_schemas.py` ensuring zero null-pointer crashes or missing field discrepancies during cross-service data exchange.
- [ ] 1.9 Design DuckDB schema and migration script (`db/schema.sql` and `ingest/duckdb_client.py`) with columnar parquet storage and indexes on `timestamp`, `campaign_id`, and `sku_id`.
- [ ] 1.10 Document canonical schema field definitions, SQL DDL, and mathematical derivation formulas in `docs/CANONICAL_SCHEMA.md`.

### Section 2: Multi-Platform Ingestion, Ground-Truth Simulator & Cloud Integration
- [ ] 2.1 Refactor the synthetic data engine in `simulator/data_generator.py` to generate 90 days of high-resolution multi-channel ad data restricted strictly to Meta Ads, Google Ads, and Amazon Advertising.
- [ ] 2.2 Model channel-specific advertising dynamics: Meta social discovery volatility, Google high-intent keyword search, and Amazon bottom-funnel retail conversion and buy-box mechanics.
- [ ] 2.3 Inject realistic operational anomalies into synthetic streams: Hero SKU stockouts, ad creative fatigue (frequency > 4.5), sudden category CPM surges, and web checkout tagging dropoffs.
- [ ] 2.4 Build channel-specific ingestion adapters in `ingest/adapters/` for Meta Graph API format, Google Ads API reports, and Amazon Advertising API reporting data.
- [ ] 2.5 Implement e-commerce storefront change-data-capture (CDC) mock in `simulator/storefront.py` ingesting inventory deductions and order cancellations in real-time.
- [ ] 2.6 Configure Google Cloud API client integration in `agents/cloud_client.py` using Google Cloud API Key with connection pooling, exponential backoff, and quota-aware rate limiters.
- [ ] 2.7 Build a local high-performance DuckDB ingestion pipeline in `ingest/loader.py` capable of querying 1,000,000 synthetic records in sub-50ms using columnar parquet tables.
- [ ] 2.8 Implement an automated reconciliation engine in `ingest/reconcile.py` calculating real-world blended metrics: Blended ROAS, POAS (Profit on Ad Spend), and MER (Marketing Efficiency Ratio).
- [ ] 2.9 Build a standalone runnable CLI module (`python -m ingest.demo`) that seeds the database, runs reconciliation, and outputs verified metric tensors.
- [ ] 2.10 Write unit and integration test suites in `tests/test_ingestion.py` validating synthetic data continuity, anomaly injection triggers, and DuckDB query accuracy.

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
- [ ] 4.1 Construct the enterprise Directed Acyclic Graph (DAG) topology in `diagnose/causal_graph.py` mapping: `Media Spend -> Impressions -> Clicks -> Page Views -> Unit Orders (conditioned on Inventory) -> Net Contribution Margin`.
- [ ] 4.2 Formulate the structural causal equations using `DoWhy-GCM`, assigning continuous functional relationships and unobserved exogenous noise terms ($U_i$) to each node.
- [ ] 4.3 Implement structural graph validation in `diagnose/graph_validator.py` verifying directed acyclicity, topological sorting order, and domain-enforced business constraints.
- [ ] 4.4 Build the counterfactual anomaly attribution engine in `diagnose/attribution.py` evaluating: $\phi(X_i \to Y) = \mathbb{E}[Y \mid \text{do}(U_i \sim P(U_i)), \mathbf{X} = \mathbf{x}^{\text{obs}}] - y^{\text{obs}}$.
- [ ] 4.5 Implement Shapley value decomposition across structural parent nodes to allocate additive percentage root-cause attributions summing strictly to 100%.
- [ ] 4.6 Implement specific causal diagnostic rules isolating: (a) `INVENTORY_STOCKOUT` vs (b) `CREATIVE_FATIGUE` vs (c) `AUCTION_COMPETITION_SURGE` vs (d) `CONVERSION_PIXEL_FAILURE`.
- [ ] 4.7 Integrate Google Cloud API (Gemini) in `agents/rca.py` to synthesize mathematical attribution scores into natural language causal explanations and root-cause summaries.
- [ ] 4.8 Build a standalone diagnostic demonstration runner (`python -m diagnose.demo`) verifying counterfactual attribution on synthetic stockout scenarios.
- [ ] 4.9 Implement parameter caching and pre-fitted causal mechanism baselines to achieve sub-200ms causal attribution inference during live evaluation.
- [ ] 4.10 Write unit tests in `tests/test_causal_rca.py` asserting that simulated inventory depletion correctly attributes >60% contribution to stockout rather than ad creative wear-out.

---

## Stage 3: Constrained Predictive Optimization & Budget Allocation Engine

### Section 5: Media Response Modeling (Adstock & Hill Diminishing Returns)
- [ ] 5.1 Implement the geometric adstock transformation function in `decide/curves.py`: $x_c^{\text{adstock}}(t) = \sum_{l=0}^L \alpha_c^l x_c(t-l)$ with channel-specific decay parameters $\alpha_c \in [0, 1]$.
- [ ] 5.2 Implement the non-linear Hill saturation function: $\text{Hill}(x; \beta, \eta, K) = \beta \frac{x^\eta}{K^\eta + x^\eta}$ modeling diminishing marginal returns and channel saturation.
- [ ] 5.3 Calibrate channel-specific response parameters for Meta Ads (rapid saturation, moderate decay), Google Ads (high intent, medium saturation), and Amazon Advertising (high conversion floor, steep half-saturation).
- [ ] 5.4 Compute closed-form analytical first derivatives (marginal ROAS: $m\text{ROAS} = \frac{d\,\text{Revenue}}{d\,\text{Spend}}$) to evaluate incremental revenue per additional dollar invested.
- [ ] 5.5 Implement automated fitting of Hill and Adstock curve parameters from trailing 60-day historical data using non-linear least squares (`scipy.optimize.curve_fit`).
- [ ] 5.6 Build saturation curve sampling routines that output discrete spend-to-revenue curve coordinates for interactive frontend charting in `web/`.
- [ ] 5.7 Calculate channel saturation inflection points and identify "underfunded" versus "diminishing return" spend regimes across active campaigns.
- [ ] 5.8 Implement unit tests in `tests/test_curves.py` asserting mathematical boundary conditions: $f(0) = 0$, monotonic increase ($f'(x) \ge 0$), and asymptotic convergence to $\beta$ as $x \to \infty$.
- [ ] 5.9 Build a caching layer for fitted response curves with periodic background refitting to minimize optimization computational overhead.
- [ ] 5.10 Validate predictive accuracy of the fitted response models using holdout cross-validation calculating Mean Absolute Percentage Error (MAPE).

### Section 6: Non-Linear Constrained Mathematical Optimizer (SLSQP & Primal-Dual Bandits)
- [ ] 6.1 Formulate the global enterprise objective function in `decide/optimizer.py` directly maximizing total Net Contribution Margin ($\text{NCM} = \sum (\text{Price}_k - \text{COGS}_k - \text{VariableCost}_k) \cdot Q_k(\mathbf{b}) - \sum b_c$).
- [ ] 6.2 Implement multi-dimensional operational constraint vectors: (a) Total Budget ceiling $\sum b_c \le B_{\text{total}}$, (b) Per-channel min/max spend bounds, and (c) Portfolio Blended ROAS floor constraint.
- [ ] 6.3 Implement physical inventory stockout prevention constraints: projected order volume over planning horizon $\le$ current on-hand stock + lead-time replenishment.
- [ ] 6.4 Implement daily spend velocity constraints limiting maximum allowable budget delta to $\pm 25\%$ per 24-hour cycle to protect ad platform bidding stability.
- [ ] 6.5 Solve the non-linear constrained program using Sequential Least Squares Quadratic Programming (`scipy.optimize.minimize` with method `SLSQP`).
- [ ] 6.6 Provide analytical Jacobian gradients of the objective and constraints to guarantee sub-50ms optimizer convergence and eliminate numerical approximation jitter.
- [ ] 6.7 Implement the online Combinatorial Bandits with Knapsacks (CBwK) engine in `decide/bandits.py` utilizing a primal-dual algorithm with multiplicative weight updates for intra-day reallocation.
- [ ] 6.8 Formulate dynamic shadow pricing ($\lambda_{j,t}$) on inventory and liquidity knapsacks, penalizing spend on depleted SKUs and reallocating capital to high-margin alternatives.
- [ ] 6.9 Build a simulation engine (`decide/simulator.py`) calculating forecasted Net Profit, Blended ROAS, POAS, and stock runway days for any proposed budget vector.
- [ ] 6.10 Build a standalone runnable CLI module (`python -m decide.demo`) proving budget reallocation shifts capital away from stockouts to high-margin inventory.

---

## Stage 4: Autonomous Orchestration, Safety Guardrails & Execution Gateway

### Section 7: Agentic Orchestrator, Google Cloud LLM Reasoning & Mock Ad APIs
- [ ] 7.1 Design an asynchronous stateful workflow orchestrator in `agents/orchestrator.py` managing state transitions: `TELEMETRY_INGESTED -> ANOMALY_DETECTED -> RCA_COMPLETED -> OPTIMIZER_SOLVED -> DIRECTIVE_GENERATED -> EXECUTED`.
- [ ] 7.2 Implement `DiagnosisReviewNode` parsing RCA attribution outputs and formulating strategic commercial priorities.
- [ ] 7.3 Implement `StrategyGenerationNode` translating mathematical reallocation vectors into discrete operational actions (`SHIFT_BUDGET`, `THROTTLE_CAMPAIGN`, `SCALE_CAMPAIGN`).
- [ ] 7.4 Integrate Google Cloud API (Gemini) with structured JSON function calling to generate executive explanations, action summaries, and risk analyses.
- [ ] 7.5 Build a modular Execution Gateway in `execute/gateway.py` providing standardized interfaces to execute budget modifications across Meta Marketing API, Google Ads API, and Amazon Advertising API.
- [ ] 7.6 Refactor `execute/mock_ads_api.py` with realistic latency emulation (50ms) and comprehensive audit receipt generation for Meta, Google, and Amazon.
- [ ] 7.7 Implement atomic multi-step rollback routines restoring previous budget states if an API modification fails mid-flight.
- [ ] 7.8 Build immutable JSON audit logging recording every diagnostic event, optimization proposal, authorization token, and API execution receipt.
- [ ] 7.9 Expose REST endpoints in FastAPI for manual and programmatic action approvals (`GET /api/v1/directives` and `POST /api/v1/directives/{id}/approve`).
- [ ] 7.10 Build a standalone test runner (`python -m agents.demo`) executing an end-to-end autonomous loop in the terminal.

### Section 8: Deterministic Safety Guardrails, Circuit Breakers & Closed-Loop Decision Ledger
- [ ] 8.1 Implement Tier-1 Autonomy guardrail rules in `execute/guardrails.py`: automatically authorize spend shifts $< 10\%$ when causal attribution confidence $> 90\%$.
- [ ] 8.2 Implement Tier-2 Autonomy guardrail rules: route moderate shifts ($10\% - 30\%$) and creative rotations through voice-assisted human authorization.
- [ ] 8.3 Implement Tier-3 Autonomy guardrail rules: enforce strict human sign-off on global budget shifts $> 30\%$ or absolute adjustments exceeding $\$2,500$.
- [ ] 8.4 Implement Tier-4 Automated Kill-Switch daemon in `execute/kill_switch.py`: immediately freeze spend to baseline minimums if 0 conversion events are recorded over 2 consecutive hours with active spend.
- [ ] 8.5 Build an Inventory Runway Circuit Breaker: automatically trigger campaign throttling when projected days of inventory remaining drops below supplier lead time.
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
- [ ] 10.6 Script Act 1 (0:00 - 0:30): Demonstrate the silent ROAS crash (-66%) caused by an out-of-stock hero SKU burning ad spend across channels without orders.
- [ ] 10.7 Script Act 2 (0:30 - 0:60): Showcase causal DAG isolation proving stockout root cause, followed by instant SLSQP mathematical optimization recovering net profit.
- [ ] 10.8 Script Act 3 (0:60 - 0:90): Trigger live ElevenLabs voice briefing, deliver verbal executive authorization ("Authorize reallocation"), and showcase live UI update.
- [ ] 10.9 Create a one-command master launch script (`./start_demo.sh`) that spins up the FastAPI backend, seeds telemetry, and serves the web console.
- [ ] 10.10 Rehearse and record a backup video walkthrough of the 90-second pitch flow to safeguard against hardware failure during judging rounds.
