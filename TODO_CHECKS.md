# NEXUS-DQPS: Feature Requirements Verification Checklist (TODO_CHECKS.md)
## Grounded Against Literature Review & Implementation Blueprint (`DQPS.pdf`)

> [!IMPORTANT]
> **RESTRICTED ACCESS:** Do NOT open, inspect, or process this file until specifically asked by the user.

This document establishes the exhaustive verification criteria and acceptance checks for every architectural pillar, mathematical formulation, autonomous execution tier, and live demonstration milestone specified in `DQPS.pdf`.

---

## 1. Ingestion, Canonical Data Model & MCP Architecture Checks

- [x] **CHK-1.1 Canonical Schema Completeness:** Verify `UnifiedCommerceRecord` bridges all advertising metrics (`spend`, `impressions`, `clicks`, `cpc`, `cpm`, `conversions`, `attributed_revenue`) with inventory vectors (`on_hand`, `reserved`, `lead_time_days`, `stockout_flag`) and unit margins (`unit_price`, `cogs`, `shipping_fees`, `processing_fees`, `net_margin`).
- [x] **CHK-1.2 Continuous-Time Unified Tensor:** Verify DuckDB stores records indexed over `(timestamp, channel, campaign_id, sku_id)` capable of sub-50ms analytical slice-and-dice queries.
- [x] **CHK-1.3 Model Context Protocol (MCP) Integration:** Verify standardized MCP tool server endpoints exist allowing intelligent agents to interrogate storefront catalog, live inventory state, and checkout conversion rates dynamically without batch sync latency.
- [x] **CHK-1.4 Currency & Timezone Normalization:** Verify all platform timestamps parse to ISO 8601 UTC and monetary figures normalize to USD base currency.
- [x] **CHK-1.5 Micro-Unit Precision Handling:** Verify Google Ads `cost_micros` ($10^{-6}$ USD) is converted to standard floating decimal USD without rounding loss.
- [x] **CHK-1.6 SKU-to-ASIN-to-Variant Cross-Mapping:** Verify 100% deterministic mapping across Amazon ASINs, Shopify Variant IDs, and Meta/Google catalog item IDs.
- [x] **CHK-1.7 DuckDB Parquet Storage Optimization:** Verify analytical data stores in columnar Parquet files with partition pruning on `date` and `channel`.

---

## 2. Multi-Platform Endpoint-Exact Synthetic Telemetry Checks

- [x] **CHK-2.1 Meta Graph API Payload Exactness:** Verify synthetic Meta records match `/v19.0/{ad_id}/insights` schema including `actions` array (`omni_purchase`), `action_values`, `frequency`, and attribution windows (`7d_click`, `1d_view`).
- [x] **CHK-2.2 Google Ads API Payload Exactness:** Verify synthetic Google Ads records conform to `GoogleAdsRow` including `campaign.advertising_channel_type` (`SEARCH`, `PERFORMANCE_MAX`, `SHOPPING`), `metrics.conversions_value`, and `metrics.average_cpc`.
- [x] **CHK-2.3 Amazon Advertising API Payload Exactness:** Verify synthetic Amazon records conform to Sponsored Products reports with `asin`, `sku`, `attributedSales14d`, and `attributedUnitsOrdered14d`.
- [x] **CHK-2.4 Shopify Storefront & Webhook Exactness:** Verify synthetic Shopify stream outputs standard `orders/create` JSON with nested `line_items` (`price`, `quantity`, `variant_id`) and real-time `inventory_levels/update`.
- [x] **CHK-2.5 90-Day Synthetic Continuity:** Verify generated time-series spans 90 days with day-of-week seasonality, realistic traffic volumes, and reproducible PRNG seed.
- [x] **CHK-2.6 Injected Operational Anomaly 1 (Stockout Shock):** Verify Shopify inventory for Hero SKU (e.g. `SKU-402`) drops to 0 at a designated timestamp while Meta/Google ad spend continues burning.
- [x] **CHK-2.7 Injected Operational Anomaly 2 (Creative Fatigue):** Verify Meta ad creative exhibits frequency $> 4.5$ with CTR decaying $> 40\%$ over 7 days.
- [x] **CHK-2.8 Injected Operational Anomaly 3 (CPM Auction Surge):** Verify category CPM spikes $+45\%$ over a 48-hour window without a drop in organic CTR.
- [x] **CHK-2.9 Injected Operational Anomaly 4 (Pixel Tracking Loss):** Verify synthetic stream can simulate 0 conversion signals for $>2$ hours while traffic remains normal.

---

## 3. Time-Series Anomaly Detection & Volatility Filtering Checks

- [x] **CHK-3.1 Non-Parametric Rolling IQR Detection:** Verify dynamic Interquartile Range (IQR) filter flags anomalies exceeding $[Q_1 - 1.5 \cdot \text{IQR}, Q_3 + 1.5 \cdot \text{IQR}]$ on rolling 7-day ROAS.
- [x] **CHK-3.2 Dynamic Z-Score Outlier Flagging:** Verify Z-score detector identifies deviations where $|Z| > 2.2$ against 14-day rolling mean.
- [x] **CHK-3.3 Day-of-Week Seasonality De-biasing:** Verify regular weekend conversion dips do not trigger false positive critical anomaly alerts.
- [x] **CHK-3.4 High-Frequency Volatility Suppression:** Verify exponential smoothing filters out random auction noise and intra-hour bid micro-spikes.
- [x] **CHK-3.5 Anomaly Severity Matrix:** Verify severity levels assign deterministically:
  - `CRITICAL`: Financial burn $> \$100/\text{hr}$ with conversion collapse $> 50\%$.
  - `WARNING`: Efficiency drop $20\% - 50\%$ or frequency $> 4.0$.
  - `INFO`: Minor pacing drift $< 20\%$.
- [x] **CHK-3.6 Sub-10ms Detection Latency:** Verify anomaly detection pipeline completes across 1,000 campaign streams in $< 10\text{ ms}$.

---

## 4. Structural Causal Modeling (SCM) & Counterfactual Attribution Checks

- [x] **CHK-4.1 Causal DAG Topology Validity:** Verify Directed Acyclic Graph $\mathcal{G} = (\mathcal{V}, \mathcal{E})$ satisfies acyclicity and business logic:
  $$\text{Spend} \to \text{Impressions} \to \text{Clicks} \to \text{Sessions} \to \text{Orders (conditioned on Stock)} \to \text{Revenue} \to \text{NCM}$$
- [x] **CHK-4.2 SCM Functional Assignments (`DoWhy-GCM`):** Verify each endogenous node $X_i$ is parameterized with structural equation $X_i := f_i(\text{Pa}(X_i), U_i)$ and exogenous noise distribution $P(U_i)$.
- [x] **CHK-4.3 Counterfactual Intervention Formulation:** Verify counterfactual calculation evaluates:
  $$\phi(X_i \to Y) = \mathbb{E}\left[ Y \mid \text{do}\left(U_i \sim P(U_i)\right), \, \mathbf{X} = \mathbf{x}^{\text{obs}} \right] - y^{\text{obs}}$$
- [x] **CHK-4.4 Shapley Residual Attribution Sum:** Verify counterfactual percentage contributions across all parent root causes sum strictly to $100\% \pm 0.1\%$.
- [x] **CHK-4.5 Stockout Anomaly Attribution Accuracy:** In the injected stockout scenario, verify the attribution engine assigns $> 60\%$ attribution weight to `INVENTORY_STOCKOUT` and $< 20\%$ to creative wear-out.
- [x] **CHK-4.6 Creative Fatigue Attribution Accuracy:** In the fatigue scenario, verify the engine assigns $> 60\%$ weight to `CREATIVE_FATIGUE`.
- [x] **CHK-4.7 Causal Discovery Fallback (DirectLiNGAM):** Verify DirectLiNGAM non-Gaussian linear equation discovery runs successfully over observational time-series as a structure validation check.
- [x] **CHK-4.8 Sub-200ms Live RCA Execution:** Verify pre-fitted mechanisms and cached residuals yield causal diagnosis in $< 200\text{ ms}$ for real-time console display.
- [x] **CHK-4.9 Natural Language Explanation via Google Cloud Gemini:** Verify structured JSON prompt to Gemini API converts Shapley numbers into an executive-ready diagnostic briefing.

---

## 5. Media Response (Adstock & Hill Saturation) Modeling Checks

- [x] **CHK-5.1 Geometric Adstock Transformation:** Verify adstock transformation computes:
  $$x_c^{\text{adstock}}(t) = \sum_{l=0}^{L} \alpha_c^l x_c(t-l)$$
  with $\alpha_{\text{Meta}} \approx 0.3$, $\alpha_{\text{Google}} \approx 0.1$, $\alpha_{\text{Amazon}} \approx 0.2$.
- [x] **CHK-5.2 Non-Linear Hill Saturation Implementation:** Verify Hill curve formulation:
  $$\text{Saturation}(x; \beta_c, \eta_c, K_c) = \beta_c \frac{x^{\eta_c}}{K_c^{\eta_c} + x^{\eta_c}}$$
  with calibrated shape parameter $\eta_c > 1$ and half-saturation point $K_c > 0$.
- [x] **CHK-5.3 Analytical Marginal ROAS ($m\text{ROAS}$):** Verify closed-form derivative:
  $$m\text{ROAS}(x) = \beta_c \frac{\eta_c K_c^{\eta_c} x^{\eta_c - 1}}{(K_c^{\eta_c} + x^{\eta_c})^2}$$
  evaluates incremental revenue per additional dollar invested without finite-difference numerical errors.
- [x] **CHK-5.4 Mathematical Boundary Guarantees:** Verify $\text{Hill}(0) = 0$, $m\text{ROAS}(x) \ge 0$, and $\lim_{x \to \infty} \text{Hill}(x) = \beta_c$.
- [ ] **CHK-5.5 Response Curve Parameter Fitting:** Verify `scipy.optimize.curve_fit` converges on historical 60-day telemetry with Mean Absolute Percentage Error (MAPE) $< 12\%$.
- [ ] **CHK-5.6 Discrete Curve Sampling for Web Visualizer:** Verify curve generator outputs 50 coordinate pairs $(x, y, m\text{ROAS})$ per channel for interactive frontend charting.

---

## 6. Constrained Non-Linear Mathematical Optimizer (SLSQP & NCM) Checks

- [ ] **CHK-6.1 Enterprise Objective Formulation:** Verify objective directly maximizes Net Contribution Margin:
  $$\max_{\mathbf{b}} \quad \sum_{t=1}^{T} \sum_{k=1}^{K} \left( \text{Price}_k - \text{COGS}_k - \text{VariableCost}_k \right) \cdot Q_k\left(\mathbf{b}(t)\right) - \sum_{c} b_c(t)$$
- [ ] **CHK-6.2 Total Budget Ceiling Constraint:** Verify constraint $\sum_{c} b_c(t) \le B_{\text{total}}$ is strictly satisfied (equality or slack $\ge 0$).
- [ ] **CHK-6.3 Channel Spend Boundary Constraints:** Verify $b_c^{\min} \le b_c(t) \le b_c^{\max}$ enforced for all channels.
- [ ] **CHK-6.4 Physical Stockout Prevention Constraint:** Verify demand induced by allocation satisfies:
  $$\sum_{t=1}^{T} Q_k(\mathbf{b}(t)) \le \text{Inventory}_k^{\text{on-hand}} + \text{InTransit}_k^{\text{lead-time}}$$
- [ ] **CHK-6.5 Portfolio Blended ROAS Floor Constraint:** Verify constraint:
  $$\frac{\sum \text{Price}_k \cdot Q_k(\mathbf{b}(t))}{\sum b_c(t)} \ge \text{BlendedROAS}_{\min}$$
- [ ] **CHK-6.6 Daily Spend Velocity Constraint:** Verify $|b_c(t) - b_c(t-1)| \le 0.25 \cdot b_c(t-1)$ prevents auction instability.
- [ ] **CHK-6.7 Analytical Jacobian Implementation:** Verify exact gradients supplied to `scipy.optimize.minimize(method='SLSQP')`.
- [ ] **CHK-6.8 Sub-50ms Optimizer Convergence:** Verify SLSQP solver converges in $< 50\text{ ms}$ on a 15-campaign allocation problem.
- [ ] **CHK-6.9 Capital Shift Verification on Stockout:** Verify optimizer automatically throttles out-of-stock SKU spend down to $b^{\min}$ and shifts capital to high-margin, high-stock alternatives.

---

## 7. Intra-Day Combinatorial Bandits with Knapsacks (CBwK) Checks

- [ ] **CHK-7.1 Primal-Dual Shadow Price Maintenance:** Verify dual variables $\lambda_{j,t}$ update via multiplicative weight rules based on resource consumption rate:
  $$\lambda_{j, t+1} = \lambda_{j, t} \cdot \left(1 + \epsilon \cdot \frac{c_{j, t}}{C_j}\right)$$
- [ ] **CHK-7.2 Stockout Penalty via Dual Price:** Verify SKU depletion drives inventory shadow price $\lambda_{\text{stock}} \to \infty$, automatically penalizing spend on that SKU.
- [ ] **CHK-7.3 Bandit Action Selection Rule:** Verify decision policy evaluates:
  $$b_t = \arg\max_b \left( \hat{r}_t(b) - \sum_j \lambda_{j,t} \cdot c_{j,t}(b) \right)$$
- [ ] **CHK-7.4 Sublinear Regret & Fast Execution:** Verify online decision selection executes in $< 20\text{ ms}$ per round.

---

## 8. Closed-Loop Autonomy Tiers & Deterministic Safety Guardrails Checks

- [ ] **CHK-8.1 Tier-1 Autonomy Rule Check:** Spend shifts $< 10\%$ with attribution confidence $> 90\%$ auto-execute; auto-rollback triggers if CAC increases $> 25\%$ within 3 hours.
- [ ] **CHK-8.2 Tier-2 Autonomy Rule Check:** Channel rebalancing shifts $10\% - 30\%$ or stockout within 7 days routes through ElevenLabs voice authorization.
- [ ] **CHK-8.3 Tier-3 Autonomy Rule Check:** Budget modifications $> 30\%$ or absolute value $> \$2,500$ enforce mandatory dual human sign-off with hard block.
- [ ] **CHK-8.4 Tier-4 Automated Fail-Safe (Kill-Switch):** If 0 Shopify conversion signals are logged over 2 hours with active spend, kill-switch daemon throttles spend to $b^{\min}$ in $< 1\text{ sec}$.
- [ ] **CHK-8.5 6-Hour Velocity Cap:** Programmatic execution rejects any single modification exceeding $\pm 20\%$ within any 6-hour sliding window.
- [ ] **CHK-8.6 Inventory Runway Circuit Breaker:** When days of inventory remaining $< \text{supplier lead time}$, campaign spend automatically caps.

---

## 9. Closed-Loop Decision Ledger & Outcome Learning Checks

- [ ] **CHK-9.1 Immutable Decision Ledger Schema:** Verify `learn/ledger.py` records:
  - `directive_id`, `timestamp`, `action_type`, `campaign_id`, `sku_id`
  - `pre_spend`, `post_spend`, `expected_margin_lift`
  - `realized_margin_lift_24h`, `variance_pct`, `status`
- [ ] **CHK-9.2 Synthetic Counterfactual Baseline:** Verify realized lift is evaluated against a synthetic control baseline ($t+24\text{h}$) rather than naive pre/post difference.
- [ ] **CHK-9.3 Bayesian Model Feedback Update:** Verify variance between predicted and realized marginal ROAS feeds back to update prior parameters in response curves.
- [ ] **CHK-9.4 Audit Trail Query API:** Verify `GET /api/v1/ledger` returns full historical execution audit trail with status tags.

---

## 10. Multimodal ElevenLabs Voice AI & HITL Tool-Calling Checks

- [ ] **CHK-10.1 Real-Time WebSocket Voice Session:** Verify ElevenLabs Conversational SDK establishes bidirectional audio stream with $< 600\text{ ms}$ round-trip latency.
- [ ] **CHK-10.2 Executive Briefing Audio Prompt:** Verify voice agent verbally announces:
  *"ROAS on Meta Summer Retargeting collapsed by 66% due to Hero SKU stockout. Recommend reallocating $1,500 to Google Linen Apparel. Projected margin recovery: +$3,480. Do you authorize?"*
- [ ] **CHK-10.3 Voice Tool Calling Execution:** Verify verbal command *"Authorize reallocation"* triggers client/server tool call executing `approve_reallocation_plan(directive_id)`.
- [ ] **CHK-10.4 Real-Time Audio Waveform Visualizer:** Verify frontend displays active audio visualizer (sine wave / pulsing ring) during voice playback.
- [ ] **CHK-10.5 Text Chat Fallback Modal:** Verify complete conversation, diagnosis, and authorization flow functions over text chat in case of mic or audio hardware failure.

---

## 11. Autonomous Web Console & Causal Graph Visualizer Checks

- [ ] **CHK-11.1 Obsidian / Dark Command Center Aesthetic:** Verify web console uses high-contrast dark obsidian theme with emerald profit indicators and rose risk badges.
- [ ] **CHK-11.2 Real-Time KPI Banner:** Verify live cards display Blended ROAS, POAS (Profit on Ad Spend), MER, Total Spend, and Stockout Risks.
- [ ] **CHK-11.3 Interactive Animated Causal DAG:** Verify D3.js / ReactFlow causal graph visually pulses the active counterfactual anomaly path (`Meta Spend -> Clicks -> Shopify Stockout -> Margin Collapse`).
- [ ] **CHK-11.4 RCA Waterfall Decomposition Chart:** Verify waterfall chart clearly displays additive shares:
  `Stockout (-65%) + Creative Fatigue (-25%) + Category CPM (-10%)`.
- [ ] **CHK-11.5 Interactive What-If Scenario Sandbox:** Verify manual budget sliders recalculate projected blended ROAS, POAS, and stock runway in real-time.
- [ ] **CHK-11.6 Mock / Live Backend Toggle:** Verify `NEXT_PUBLIC_USE_MOCKS` switch allows running fully offline with zero backend or live with FastAPI.

---

## 12. 90-Second 3-Act Statewide Hackathon Pitch Verification Checks

- [ ] **CHK-12.1 Act 1 (0:00 - 0:30) Problem Execution:** Presenter displays live dashboard; Hero SKU sells out; ROAS drops 66%; Meta retargeting burns $\$1,850$ without sales.
- [ ] **CHK-12.2 Act 2 (0:30 - 0:60) Causal Proof & Optimization:** Presenter toggles Causal DAG showing 65% stockout attribution; triggers SLSQP optimizer shifting $\$1,500$ to high-margin Google & Amazon SKUs.
- [ ] **CHK-12.3 Act 3 (0:60 - 0:90) Voice Authorization & Recovery:** ElevenLabs agent gives verbal briefing; presenter speaks *"Authorize reallocation"*; action executes; dashboard updates showing recovered contribution profit ($+\$3,480$).
- [ ] **CHK-12.4 Sub-Second Reliability:** Verify all mock ad API calls and optimization calculations execute without UI freeze or rate limits.
- [ ] **CHK-12.5 Single-Command Launch Script:** Verify `./start_demo.sh` starts the backend, seeds telemetry, and serves the console with zero manual configuration.
- [ ] **CHK-12.6 Offline Backup Video:** Verify high-resolution screen-recorded walkthrough of the 90-second flow is stored locally as a fail-safe against venue AV/Wi-Fi failure.
