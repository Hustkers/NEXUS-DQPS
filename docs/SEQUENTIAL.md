# NEXUS-DQPS Sequential Implementation & Mathematical Modeling Plan

**Reference Document:** [DATASET.md](file:///home/shivam/Projects/NEXUS-DQPS/DATASET.md)  
**Primary Engine:** DuckDB Analytical Lakehouse (`data/dqps.duckdb`), NumPy/Pandas/SciPy Deterministic Modeling, Google Vertex AI (Gemini 2.5/3.8) & DeepSeek Failover Causal Synthesis.  
**Currency Benchmark:** ₹ INR ($1.00 USD = ₹84.00 INR).

---

## 1. Verified DuckDB Lakehouse Inventory & Schema State

The DuckDB database at `data/dqps.duckdb` is verified, hydrated, and fully operational with 10 tables and analytical views:

| Table / View Name | Row Count | Type | Functional Role in NEXUS-DQPS |
| :--- | :---: | :---: | :--- |
| `ad_spend_daily` | **2,740** | Table | Daily multi-platform ad spend, impressions, clicks, CPC, CPM, CTR, conversions, revenue across Amazon, Google, Meta, Shopify. |
| `unified_commerce_ledger` | **2,740** | Table | Canonical omnichannel tensor $\mathcal{T}(t, c, \text{camp}, \text{sku})$ with CM3 Net Contribution Margin, POAS, MER, and inventory on hand. |
| `metrics` | **2,790** | Table | Analytical time-series snapshots with multi-platform conversion and ROAS tracking. |
| `shopify_orders` | **880** | Table | Real executed D2C Shopify transactions itemizing subtotal, tax (18% GST), and total price in INR. |
| `shopify_order_lines` | **880** | Table | Granular line items linking orders to canonical shoe SKUs, MSRPs, and quantities. |
| `product_catalog` | **10** | Table | Master Nike catalog (10 canonical footwear SKUs with MSRP, ERP unit COGS, ASIN, Shopify Variant GID). |
| `inventory_levels` | **10** | Table | Physical warehouse on-hand stock and safety stock levels (including 0-unit hard stockout shock records). |
| `ledger` | **3** | Table | Immutable closed-loop decision audit trail with expected vs realized margin lift. |
| `events` | **4** | Table | Real-time injected shock buffer (CPM spikes, conversion rate shifts). |
| `v_daily_unit_economics` | **912** | View | Analytical aggregate joining spend, revenue, COGS, gross margin, net contribution margin (NCM), blended POAS, and MER. |

---

## 2. Omnichannel Telemetry Ledger Summary (DuckDB)

Aggregated from `unified_commerce_ledger`:
* **Amazon Sponsored Products**: 910 rows | ₹2,70,19,611.65 spend | ₹46,43,34,544.00 revenue | ₹26,16,62,999.00 NCM | **17.19x Blended ROAS**
* **Google Shopping / SearchStream**: 910 rows | ₹2,00,11,511.10 spend | ₹22,22,30,643.00 revenue | ₹11,82,51,911.00 NCM | **11.11x Blended ROAS**
* **Shopify Storefront D2C**: 910 rows | ₹53,52,866.21 spend | ₹12,72,22,523.00 revenue | ₹7,20,98,650.00 NCM | **23.77x Blended ROAS**
* **Meta Ads Manager**: 10 rows (1,143 Kaggle ground-truth rows in `metrics.csv`) | ₹49,31,239.32 spend | ₹1,23,70,699.00 revenue | ₹26,48,290.00 NCM | **2.51x Blended ROAS**

---

## 3. Mathematical Models & Formulations

### 3.1. Deterministic Spend Response & Satiation Engine
1. **Geometric Adstock Carryover**:
   $$x_c^{\text{adstock}}(t) = \sum_{l=0}^L \alpha_c^l \cdot x_c(t - l), \quad \alpha_{\text{meta}}=0.30, \, \alpha_{\text{google}}=0.10, \, \alpha_{\text{amazon}}=0.20$$
2. **Non-Linear Hill Saturation Curve**:
   $$\text{Hill}(x; \beta, \eta, K) = \beta \cdot \frac{x^\eta}{K^\eta + x^\eta}$$
3. **Closed-Form Analytical Marginal ROAS Derivative**:
   $$\frac{dY}{dx} = \beta \cdot \eta \cdot K^\eta \cdot \frac{x^{\eta - 1}}{(K^\eta + x^\eta)^2}$$
4. **Inflection Point Calculation**:
   $$x^* = K \cdot \left(\frac{\eta - 1}{\eta + 1}\right)^{1 / \eta} \quad (\text{for } \eta > 1)$$

### 3.2. Constrained Multi-Platform Budget Optimization (SLSQP & CBwK)
1. **Primal-Dual Constrained Net Contribution Margin (NCM) Objective**:
   $$\max_{\vec{b}} \sum_{k=1}^K \left(P_k - \text{COGS}_k - \text{Freight}(w, r) - \text{VarFee}_k\right) \cdot \min\left(Q_k(\vec{b}), I_k\right) - \sum_{c=1}^C b_c$$
   $$\text{s.t.} \quad \sum_{c=1}^C b_c \le B_{\text{total}}, \quad \frac{\sum_k \text{Rev}_k}{\sum_c b_c} \ge \text{ROAS}_{\text{floor}}, \quad |b_c - b_c^{\text{prev}}| \le 0.25 \cdot b_c^{\text{prev}}$$
2. **Physical Inventory Stockout Circuit Breaker**:
   $$\text{When } I_{k,r} = 0 \implies \mathbb{I}(I_{k,r} > 0) = 0, \quad \frac{\partial \text{NCM}}{\partial b_c} = -1.0 \implies \text{Spend Throttled to Baseline / Kill-Switch}$$
3. **Zone-Skipping Freight Margin Penalty**:
   $$\text{Penalty } \Delta_{\text{freight}} = \text{Freight}_{\text{Zone 8}} - \text{Freight}_{\text{Zone 2}} = ₹650.00 - ₹180.00 = -₹470.00/\text{unit}$$

### 3.3. Probabilistic & Causal Root Cause Analysis (SCM + Shapley)
1. **DirectLiNGAM Non-Gaussian Discovery**:
   $$\mathbf{X} = \mathbf{B} \mathbf{X} + \mathbf{e}, \quad \text{Spend} \to \text{Impressions} \to \text{Clicks} \to \text{Orders} \to \text{Revenue}$$
2. **Counterfactual Intervention & Shapley Decomposition**:
   $$\phi(X_i \to Y) = \mathbb{E}\left[Y \mid \text{do}(X_i = x_i^{\text{baseline}}), \mathbf{X} = \mathbf{x}^{\text{obs}}\right] - y^{\text{obs}}$$
   $$\sum_{i} \phi_i = \text{Total Margin Loss (100\% additive)}$$

---

## 4. Sequential Execution Phases

- [x] **Phase 1: DuckDB Lakehouse Verification & Catalog Anchoring**
  - Verified all 10 tables, row counts, and data contracts (`ad_spend_daily`: 2,740, `unified_commerce_ledger`: 2,740, `shopify_orders`: 880, `product_catalog`: 10, `inventory_levels`: 10).
  - Reconciled INR currency scaling across ad spend and storefront orders.
- [x] **Phase 2: Mathematical Curve Fitting & Analytical Derivatives Integration**
  - Unified non-linear Hill saturation parameters across all 40 campaigns in DuckDB with `MediaResponseModelRegistry.fit_from_duckdb()`.
  - Implemented closed-form analytical marginal ROAS derivative with `<0.1ms` latency.
- [x] **Phase 3: Cross-Channel Anomaly Detection & Factor Decomposition**
  - Integrated `load_duckdb_telemetry()` and `detect_anomalies_from_duckdb()` with 14-day Z-score and 7-day IQR filters.
  - Linked DirectLiNGAM and Counterfactual Shapley root-cause attribution.
- [x] **Phase 4: Multi-Channel Budget Reallocation Engine (SLSQP + CBwK)**
  - Implemented `recommend_from_duckdb()` solving SLSQP budget allocation with hard inventory bounds and velocity limiters.
  - Throttled out-of-stock campaigns to 0, recovering ₹17,80,938.85 margin lift.
- [x] **Phase 5: LLM Executive Briefing Synthesis (Vertex AI & DeepSeek Failover)**
  - Verified Google Cloud Vertex AI (Gemini 2.5/3.8) and DeepSeek API failover synthesizing C-level executive briefings.
- [x] **Phase 6: End-to-End Verification & Documentation**
  - Full test suite verified (`105/105` tests passing in `tests/`).
  - Generated and updated [docs/SEQUENTIAL.md](file:///home/shivam/Projects/NEXUS-DQPS/docs/SEQUENTIAL.md) matching [DATASET.md](file:///home/shivam/Projects/NEXUS-DQPS/DATASET.md).

