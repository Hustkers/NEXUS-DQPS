# NEXUS-DQPS: Mathematical Architecture & Econometric Modeling Guide

> **Technical Briefing for Engineering & Quantitative Research Teams**  
> *Continuous-time omnichannel telemetry reconciliation, deterministic convex budget optimization, non-linear media response saturation, causal DAG discovery, and Primal-Dual shadow pricing.*

---

## 1. Executive Overview & Problem Formulation

Modern D2C commerce operations suffer from two catastrophic market frictions:
1. **The Double-Counting Trap**: Walled garden ad networks (Meta, Google, Amazon) cryptographically encrypt user click tokens (`gclid`, `fbclid`, `ttclid`). Each platform claims 100% credit for the same order, resulting in 200–300% ROAS inflation over GAAP bank cash flow.
2. **The Regional Stockout Ad Burn**: Ad spend continues driving paid traffic to hero product pages even when physical warehouse stock is depleted ($I_k = 0$), causing 100% capital destruction or zone-skipping freight margin collapse.

NEXUS-DQPS reconciles heterogeneous advertising networks and storefront telemetry into a continuous-time canonical tensor:
$$\mathcal{T}(\text{timestamp}, \text{channel}, \text{campaign\_id}, \text{sku\_id})$$
stored in DuckDB (`data/dqps.duckdb`), and executes real-time deterministic and probabilistic optimization.

```
                              ┌────────────────────────┐
                              │ DuckDB Analytical      │
                              │ Lakehouse (2,740 rows) │
                              └───────────┬────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
    ┌───────────────────────────┐                   ┌───────────────────────────┐
    │   Deterministic Engines   │                   │    Probabilistic & Causal │
    ├───────────────────────────┤                   ├───────────────────────────┤
    │ • Geometric Adstock       │                   │ • 14-day Rolling Z-Scores │
    │ • Non-Linear Hill Curves  │                   │ • 7-day Non-parametric IQR│
    │ • Analytical Marginal ROAS│                   │ • DirectLiNGAM Causal DAG │
    │ • SLSQP Convex Optimizer  │                   │ • Counterfactual Shapley  │
    │ • Primal-Dual Bandits     │                   │ • Vertex AI / DeepSeek    │
    └───────────────────────────┘                   └───────────────────────────┘
```

---

## 2. Media Response Modeling: Adstock & Hill Saturation

### 2.1. Geometric Adstock Carryover
Advertising does not convert instantly; impressions generate awareness that decays over time. We model memory carryover using geometric decay:

$$x_c^{\text{adstock}}(t) = \sum_{l=0}^L \alpha_c^l \cdot x_c(t - l)$$

* **Decay Parameter $\alpha_c \in [0, 1)$**: Calibrated per channel based on funnel depth:
  * Meta Ads ($\alpha = 0.30$): Moderate brand recall decay.
  * Google Shopping / Search ($\alpha = 0.10$): High direct intent, fast decay.
  * Amazon Ads ($\alpha = 0.20$): Bottom-funnel repeat purchase intent.
  * Shopify D2C Direct ($\alpha = 0.15$): Organic returning customer momentum.
* **Lag Horizon $L = 14$ days**.

```
Impulse Spend: [100, 0, 0, 0] with alpha = 0.50
Adstocked:     [100, 50, 25, 12.5]
```

---

### 2.2. Non-Linear Hill Saturation Curve
Advertising spend exhibits diminishing marginal returns due to market audience saturation. We model revenue response using the generalized Hill saturation function:

$$\text{Hill}(x; \beta, \eta, K) = \beta \cdot \frac{x^\eta}{K^\eta + x^\eta}$$

#### Parameters:
* $\beta > 0$: **Saturation Ceiling** — Asymptotic maximum daily revenue achievable in the market regime:
  $$\lim_{x \to \infty} \text{Hill}(x) = \beta$$
* $K > 0$: **Half-Saturation Point** — Dollar spend required to achieve exactly $50\%$ of maximum revenue:
  $$\text{Hill}(K) = \beta \cdot \frac{K^\eta}{K^\eta + K^\eta} = \frac{\beta}{2}$$
* $\eta > 0$: **Hill Shape / Slope Parameter**:
  * $\eta > 1$: S-shaped (sigmoidal) curve exhibiting increasing returns up to an inflection point, followed by diminishing returns.
  * $\eta \le 1$: Strictly concave curve exhibiting diminishing returns everywhere.

#### Mathematical Boundary Conditions:
1. **Zero Ground State**: $\text{Hill}(0) = 0$ (no spend produces no ad-attributed revenue).
2. **Monotonicity**: $\frac{d}{dx} \text{Hill}(x) \ge 0$ for all $x \ge 0$.
3. **Upper Bound**: $\text{Hill}(x) < \beta$ for all finite $x$.

---

### 2.3. Closed-Form Analytical Marginal ROAS Derivative
Rather than calculating marginal ROAS using noisy numerical finite differences $\frac{f(x+\epsilon) - f(x)}{\epsilon}$, we evaluate the closed-form analytical first derivative:

$$\frac{dY}{dx} = \beta \cdot \eta \cdot K^\eta \cdot \frac{x^{\eta - 1}}{\left(K^\eta + x^\eta\right)^2}$$

#### Performance & Accuracy:
* Evaluates instantaneously in **$<0.1\text{ms}$** with zero numerical jitter.
* Represents the exact instantaneous marginal revenue per additional rupee or dollar invested.

---

### 2.4. Spend Inflection Point & Regime Classification
For sigmoidal response curves ($\eta > 1$), the inflection point represents the spend level where **marginal returns peak**:

$$x^* = K \cdot \left(\frac{\eta - 1}{\eta + 1}\right)^{1 / \eta}$$

#### Dynamic Spend Regimes:
1. **`UNDERFUNDED`** ($x < x^*$): The campaign is operating below the efficiency knee. Increasing spend actually increases marginal ROAS.
2. **`OPTIMAL`** ($x \ge x^*$ and $\frac{dY}{dx} \ge 1.50$): Highly productive regime; each incremental dollar generates $\ge \$1.50$ in return.
3. **`DIMINISHING`** ($\frac{dY}{dx} < 1.50$): Approaching market saturation. Capital should be reallocated to underfunded product lines.

---

## 3. Constrained Convex Budget Optimization (SLSQP)

### 3.1. Primal Objective: Enterprise Net Contribution Margin (NCM)
The optimizer maximizes total portfolio Contribution Margin 3 (CM3) net of all ad spend:

$$\max_{\vec{x}} \quad \text{NCM}(\vec{x}) = \sum_{k=1}^K \left(P_k - \text{COGS}_k - \text{VarCosts}_k\right) \cdot Q_k^{\text{realized}}(\vec{x}) - \sum_{c=1}^C x_c$$

where:
* $P_k$: Retail price of SKU $k$.
* $\text{COGS}_k$: ERP unit Cost of Goods Sold.
* $\text{VarCosts}_k$: Freight + gateway processing fees ($2.0\% + ₹3.00$ or $2.9\% + \$0.30$).
* $Q_k^{\text{realized}}(\vec{x}) = \min\left(\frac{\text{Hill}_k(x_k)}{P_k}, \, I_k^{\text{available}}\right)$: Realized orders bounded by physical inventory.

---

### 3.2. Constraints Formulation
1. **Total Portfolio Budget Ceiling**:
   $$g_1(\vec{x}) = B_{\text{total}} - \sum_{c=1}^C x_c \ge 0$$
2. **Portfolio Blended ROAS Floor**:
   $$g_2(\vec{x}) = \sum_{k=1}^K \text{Revenue}_k(x_k) - \text{ROAS}_{\text{floor}} \cdot \sum_{c=1}^C x_c \ge 0$$
3. **Daily Spend Velocity Limiter (Safety Guardrail)**:
   Prevent abrupt budget shifts from resetting ad platform bidding models (e.g. Meta Learning Phase):
   $$x_c^{\text{min}} = \max\left(10.0, \, x_c^{\text{prev}} \cdot (1 - \delta)\right) \le x_c \le x_c^{\text{prev}} \cdot (1 + \delta) = x_c^{\text{max}}$$
   where $\delta = 0.25$ (maximum $25\%$ spend shift per cycle).
4. **Physical Stockout Circuit Breaker**:
   When on-hand warehouse inventory hits zero ($I_k = 0$):
   $$x_k \in [0.0, \, 5.0] \quad (\text{spend clamped to zero baseline})$$

---

### 3.3. Analytical Jacobian Gradient
Sequential Least Squares Programming (SLSQP) requires the gradient vector $\nabla \text{NCM}(\vec{x})$. When orders are bounded by inventory ($Q_k \ge I_k$):

$$\frac{\partial \text{NCM}}{\partial x_c} = -1.0$$

Every additional dollar spent yields zero incremental units and burns pure capital. When inventory is healthy ($Q_k < I_k$):

$$\frac{\partial \text{NCM}}{\partial x_c} = \left(\frac{dY_c}{dx_c}\right) \cdot \text{MarginRate}_c - 1.0$$

---

## 4. Supply Chain Logistics: Zone-Skipping Margin Economics

When a regional fulfillment center experiences a stockout, fulfilling an order from an alternate cross-country distribution node triggers **zone-skipping freight erosion**:

$$\text{Unit Margin} = P_{\text{retail}} - \text{COGS} - \text{Freight}(w, r) - \text{CAC}$$

### Freight Penalty Example (7 Fulfillment Nodes):
* **Local Zone 2 Fulfillment (Standard)**: Freight = ₹180.00 (\$4.80). Net Profit = ₹1,336/unit.
* **Cross-Country Zone 8 Fulfillment (Zone-Skipping)**: Freight = ₹650.00 (\$18.50). Net Profit = ₹186/unit.
* **Freight Penalty**:
  $$\Delta_{\text{freight}} = \text{Freight}_{\text{Zone 8}} - \text{Freight}_{\text{Zone 2}} = ₹650 - ₹180 = -₹470.00/\text{unit} \quad (-\$13.70/\text{unit})$$
  *(An 86% net margin contraction!)*

---

## 5. Primal-Dual Online Bandits with Knapsacks (CBwK)

For continuous intra-day micro-adjustments, NEXUS-DQPS maintains dynamic shadow prices $\lambda_{\text{budget}}$ and $\lambda_{\text{inventory}}^{(k)}$ via multiplicative weight updates:

$$\lambda_{j, t+1} = \lambda_{j, t} \cdot \left(1 + \epsilon \frac{c_{j, t}}{C_j}\right)$$

where:
* $c_{j, t}$: Consumption of resource $j$ (dollars spent or units sold) in round $t$.
* $C_j$: Total capacity (daily budget limit or warehouse inventory on hand).
* $\epsilon$: Learning rate step size.

As remaining inventory approaches zero, $\lambda_{\text{inventory}} \to \infty$, naturally penalizing the acquisition arm and redirecting capital to surplus catalog lines.

---

## 6. Statistical Anomaly Detection & Time-Series Filtering

### 6.1. Dynamic Rolling Z-Scores (14-Day Window)
$$Z_t = \frac{x_t - \mu_{t-14:t}}{\sigma_{t-14:t}}$$
Outliers are flagged when $|Z_t| \ge 2.2$.

### 6.2. Non-Parametric Rolling IQR (7-Day Window)
$$\text{IQR} = Q_3 - Q_1$$
$$\text{Lower Bound} = Q_1 - 1.5 \cdot \text{IQR}, \quad \text{Upper Bound} = Q_3 + 1.5 \cdot \text{IQR}$$

### 6.3. Day-of-Week Debiasing
Removes weekend purchase cycles before evaluating operational anomalies:
$$x_{\text{debiased}}(t) = \frac{x(t)}{\text{SeasonalIndex}(\text{dayofweek}(t))}$$

---

## 7. Causal Graph Topology & Counterfactual Shapley RCA

### 7.1. DirectLiNGAM Non-Gaussian Causal DAG
Standard regression confuses correlation with causation. DirectLiNGAM discovers the true observational causal ordering:

$$\mathbf{X} = \mathbf{B} \mathbf{X} + \mathbf{e}$$

$$\text{Ad Spend} \longrightarrow \text{Impressions} \longrightarrow \text{Clicks} \longrightarrow \text{Page Views} \longrightarrow \text{Orders} \longrightarrow \text{Net Margin}$$

---

### 7.2. Counterfactual Intervention
To quantify the exact dollar impact of a root cause, we evaluate the counterfactual intervention under Pearl's do-calculus:

$$\phi(X_i \to Y) = \mathbb{E}\left[Y \mid \text{do}(X_i = x_i^{\text{baseline}}), \, \mathbf{X} = \mathbf{x}^{\text{observed}}\right] - y^{\text{observed}}$$

### 7.3. Shapley Root-Cause Decomposition
We allocate additive percentage shares across candidate drivers such that they strictly sum to 100%:

$$\sum_{i} \text{ShapleyShare}_i = 100.0\%$$
$$\Delta \text{ROAS} = \phi_{\text{Stockout}} + \phi_{\text{CreativeWearout}} + \phi_{\text{AuctionCPM}} + \phi_{\text{OrganicSpillover}}$$

---

## 8. Summary Table of Mathematical Formulations

| Mechanism | Governing Equation | Primary Role |
| :--- | :--- | :--- |
| **Geometric Adstock** | $x_c^{\text{adstock}}(t) = \sum_{l=0}^L \alpha_c^l x_c(t-l)$ | Simulates brand carryover & advertising memory. |
| **Hill Saturation** | $\text{Hill}(x) = \beta \frac{x^\eta}{K^\eta + x^\eta}$ | Models diminishing marginal returns per ad channel. |
| **Marginal ROAS Derivative** | $\frac{dY}{dx} = \beta \eta K^\eta \frac{x^{\eta - 1}}{(K^\eta + x^\eta)^2}$ | Closed-form instantaneous efficiency derivative ($<0.1\text{ms}$). |
| **Spend Inflection Point** | $x^* = K \left(\frac{\eta - 1}{\eta + 1}\right)^{1 / \eta}$ | Identifies optimal capital allocation threshold. |
| **SLSQP Optimizer** | $\max_{\vec{x}} \sum_k (P_k - \text{COGS}_k) Q_k - \sum_c x_c$ | Solves constrained convex budget reallocation. |
| **CBwK Shadow Prices** | $\lambda_{j, t+1} = \lambda_{j, t} (1 + \epsilon \frac{c_{j,t}}{C_j})$ | Primal-dual online intra-day liquidity & inventory pricing. |
| **Counterfactual Intervention** | $\phi(X_i \to Y) = \mathbb{E}[Y \mid \text{do}(X_i = x_{\text{base}})] - y_{\text{obs}}$ | Quantifies exact dollar margin impact of anomalies. |
| **Zone-Skipping Freight Penalty** | $\Delta_{\text{freight}} = \text{Freight}_{\text{Zone 8}} - \text{Freight}_{\text{Zone 2}}$ | Models physical supply chain logistics margin compression. |

---

## 9. Verification & Codebase References

* **Media Response Curves**: [`decide/curves.py`](file:///home/shivam/Projects/NEXUS-DQPS/decide/curves.py)
* **Convex Budget Optimizer**: [`decide/optimizer.py`](file:///home/shivam/Projects/NEXUS-DQPS/decide/optimizer.py)
* **Combinatorial Bandits**: [`decide/bandits.py`](file:///home/shivam/Projects/NEXUS-DQPS/decide/bandits.py)
* **Statistical Anomaly Filtering**: [`diagnose/anomaly.py`](file:///home/shivam/Projects/NEXUS-DQPS/diagnose/anomaly.py)
* **Causal DAG & Counterfactual RCA**: [`diagnose/causal_graph.py`](file:///home/shivam/Projects/NEXUS-DQPS/diagnose/causal_graph.py), [`diagnose/attribution.py`](file:///home/shivam/Projects/NEXUS-DQPS/diagnose/attribution.py)
* **Lakehouse Storage**: `data/dqps.duckdb` via [`ingest/duckdb_client.py`](file:///home/shivam/Projects/NEXUS-DQPS/ingest/duckdb_client.py)
* **FastAPI Endpoints**: [`app/main.py`](file:///home/shivam/Projects/NEXUS-DQPS/app/main.py), [`decide/router.py`](file:///home/shivam/Projects/NEXUS-DQPS/decide/router.py)
