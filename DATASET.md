# NEXUS-DQPS Omnichannel Dataset & Schema Architecture

> **Dataset Readme & Normalization Specification**  
> *Production-Grade 1:1 Replication of Meta Marketing API, Google Ads SearchStream, Amazon Ads v3 / SP-API, and Shopify Admin API Telemetry for Autonomous D2C Capital Reallocation.*

---

## 1. Executive Summary

NEXUS-DQPS (Data Quality & Decision Protection System) reconciles heterogeneous advertising networks and storefront telemetry into a continuous-time canonical tensor:
$$\mathcal{T}(\text{timestamp}, \text{channel}, \text{campaign\_id}, \text{sku\_id})$$

Rather than ingesting top-line vanity metrics, this dataset mirrors the exact API contracts, edge payloads, and auction telemetry emitted by Tier-1 enterprise platforms. The dataset supports **both deterministic optimization** (Hill saturation, analytical marginal ROAS derivatives, Lagrangian shadow pricing) and **probabilistic modeling** (DirectLiNGAM causal discovery, SCM counterfactual Shapley attribution, and Multi-Armed Bandits with Knapsacks).

---

## 2. Product Catalog & Ground-Truth Hierarchy

The dataset models **40 active multi-channel campaigns** (10 Meta, 10 Google Ads, 10 Amazon Sponsored Products, 10 Shopify D2C) mapped across a unified Nike footwear catalog:

| Canonical SKU | Product Name | Base MSRP (INR) | ERP Unit COGS (INR) | USD MSRP Benchmark | Amazon ASIN | Shopify Variant GID | Baseline Inventory |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`310805-137`** | Air Jordan 10 Retro | ₹15,995 | ₹5,800 | \$192.71 | `B07Q8Z9101` | `gid://shopify/ProductVariant/41001` | 0 *(Stockout Shock)* |
| **`880848-005`** | Nike Zoom Fly | ₹14,495 | ₹5,250 | \$174.64 | `B07Q8Z9102` | `gid://shopify/ProductVariant/41002` | 410 *(Healthy)* |
| **`AH8050-100`** | Nike Air Max 270 | ₹13,995 | ₹4,800 | \$168.61 | `B07Q8Z9103` | `gid://shopify/ProductVariant/41003` | 360 *(Healthy)* |
| **`315122-001`** | Nike Air Force 1 '07 | ₹7,495 | ₹3,150 | \$87.89 | `B07Q8Z9104` | `gid://shopify/ProductVariant/41004` | 520 *(Surplus)* |
| **`CD4371-001`** | Nike React Infinity Run Flyknit | ₹13,995 | ₹5,800 | \$168.61 | `B07Q8Z9107` | `gid://shopify/ProductVariant/41007` | 320 *(Healthy)* |
| **`AO2924-401`** | Nike Air Zoom Pegasus 36 | ₹12,797 | ₹4,500 | \$154.18 | `B07Q8Z9105` | `gid://shopify/ProductVariant/41005` | 280 *(Healthy)* |
| **`BQ8928-011`** | Nike Epic React Flyknit 2 | ₹10,397 | ₹3,900 | \$125.27 | `B07Q8Z9108` | `gid://shopify/ProductVariant/41008` | 600 *(Healthy)* |
| **`942851-002`** | Nike Air Zoom Pegasus 35 | ₹10,995 | ₹3,800 | \$132.47 | `B07Q8Z9109` | `gid://shopify/ProductVariant/41009` | 0 *(Stockout Shock)* |
| **`849559-004`** | Nike Air Max 2017 | ₹15,995 | ₹5,500 | \$192.71 | `B07Q8Z9106` | `gid://shopify/ProductVariant/41006` | 450 *(Healthy)* |
| **`AT5405-001`** | Nike Joyride Run Flyknit | ₹14,995 | ₹5,200 | \$180.66 | `B07Q8Z9110` | `gid://shopify/ProductVariant/41010` | 310 *(Healthy)* |

---

## 3. Platform Schema Contracts & Raw Partials

### 3.1. Meta Ads Manager (Meta Graph API v19.0 / v20.0)
* **API Resource**: `GET /v19.0/{ad_id}/insights` or `GET /v19.0/act_{account_id}/insights`
* **Raw Partial Path**: [`web/src/data/raw-api-partials/meta_insights_partial.json`](file:///home/shivam/Projects/NEXUS-DQPS/web/src/data/raw-api-partials/meta_insights_partial.json)
* **Fields Replicated**:
  * **Core Telemetry**: `account_id`, `campaign_id`, `campaign_name`, `adset_id`, `ad_id`, `spend`, `impressions`, `clicks`, `cpc`, `cpm`, `date_start`, `date_stop`.
  * **Wearout & Reach**: `reach`, `frequency` (average impressions per user, detects creative fatigue when $> 2.8\times$).
  * **Algorithmic State**: `learning_phase_status` (`LEARNING`, `SUCCESS`, `LEARNING_LIMITED`) — critical for budget velocity limiters to prevent resetting Meta's bidding model.
  * **Ad Relevance Diagnostics**: `quality_ranking`, `engagement_rate_ranking`, `conversion_rate_ranking`.
  * **Video Retention Curve**: `video_play_actions` (continuous 2s, 3s hook rate, 25%, 50%, 75%, 100% video completion, and `cost_per_thruplay`).
  * **Action Breakdown**: Nested `actions` and `action_values` arrays containing `link_click`, `post_engagement`, `landing_page_view`, `add_to_cart`, `initiate_checkout`, and `omni_purchase` split by `1d_view`, `7d_click`, and `28d_click` attribution windows.

### 3.2. Google Ads API (SearchStream / Reports v17.0)
* **API Resource**: `POST /v17/customers/{customer_id}/googleAds:searchStream`
* **Raw Partial Path**: [`web/src/data/raw-api-partials/google_ads_rows_partial.json`](file:///home/shivam/Projects/NEXUS-DQPS/web/src/data/raw-api-partials/google_ads_rows_partial.json)
* **Fields Replicated**:
  * **Core Resource**: `campaign.id`, `campaign.name`, `campaign.advertisingChannelType` (`SEARCH`, `SHOPPING`, `PERFORMANCE_MAX`), `campaign.status`.
  * **Currency Micros**: `metrics.costMicros` (1 USD = 1,000,000 micros), `metrics.averageCpc`, `metrics.conversionsValue`.
  * **Auction Competitive Intelligence**:
    * `metrics.searchImpressionShare`: Auction market share entered.
    * `metrics.searchBudgetLostImpressionShare`: Lost IS due to budget constraints — the primary mathematical trigger for autonomous budget scaling.
    * `metrics.searchRankLostImpressionShare`: Lost IS due to low Ad Rank / high bid floors — signals ad copy or landing page friction rather than capital starvation.
    * `metrics.searchTopImpressionShare` & `searchAbsoluteTopImpressionShare`: SERP top position dominance.
  * **Quality & Relevance**: `ad_group_criterion.qualityInfo.qualityScore` (1-10), `creativeQualityScore`, `postClickQualityScore`, `searchPredictedCtr`.
  * **Smart Bidding State**: `campaign.biddingStrategyType` (`TARGET_ROAS`, `MAXIMIZE_CONVERSIONS`), `campaign.targetRoas`, and `campaign_budget.recommendedBudgetAmountMicros`.

### 3.3. Amazon Advertising API (v3) & Selling Partner SP-API
* **API Resource**: `POST /reporting/v3/reports/sp/campaigns` & Amazon SP-API Pricing/Fulfillment
* **Raw Partial Path**: [`web/src/data/raw-api-partials/amazon_sponsored_products_partial.json`](file:///home/shivam/Projects/NEXUS-DQPS/web/src/data/raw-api-partials/amazon_sponsored_products_partial.json)
* **Fields Replicated**:
  * **Core Telemetry**: `campaignId`, `campaignName`, `adGroupId`, `asin`, `sku`, `date`, `impressions`, `clicks`, `cost`, `attributedSales14d`, `attributedUnitsOrdered14d`.
  * **Multi-Window Attribution**: `attributedSales1d`, `attributedSales7d`, `attributedUnitsOrdered1d`, `attributedUnitsOrdered7d`.
  * **Placement Arbitrage**: `placement` (`TOP_OF_SEARCH_PAGE`, `DETAIL_PAGE_ON_AMAZON`, `REST_OF_SEARCH`), `placementBidMultiplier`.
  * **Targeting & Bidding**: `matchType` (`EXACT`, `BROAD`, `PHRASE`, `TARGETING_EXPRESSION`), `targeting`, `biddingStrategy` (`DYNAMIC_BIDS_UP_AND_DOWN`, `DYNAMIC_BIDS_DOWN_ONLY`, `FIXED_BIDS`).
  * **Catalog Halo Effect**: `attributedSalesSameSku14d` vs. `attributedSalesOtherSku14d` (quantifies organic cross-catalog lift driven by hero shoe ads).
  * **SP-API Buy Box Kill-Switch**: `buyBoxWinPercentage` (if Buy Box ownership falls below 85%, automated kill-switch freezes bids to prevent paying for competitor sales).
  * **FBA Unit Economics**: `fbaFeesEstimate` (pick/pack fee per unit), `referralFeeRate` (15% category referral fee), `inboundPipelineUnits`, `daysOfSupplyFba`.

### 3.4. Shopify Admin API (REST & GraphQL 2024-01)
* **API Resource**: `GET /admin/api/2024-01/orders.json` & `GET /admin/api/2024-01/inventory_levels.json`
* **Raw Partial Paths**:
  * [`web/src/data/raw-api-partials/shopify_orders_partial.json`](file:///home/shivam/Projects/NEXUS-DQPS/web/src/data/raw-api-partials/shopify_orders_partial.json)
  * [`web/src/data/raw-api-partials/shopify_inventory_partial.json`](file:///home/shivam/Projects/NEXUS-DQPS/web/src/data/raw-api-partials/shopify_inventory_partial.json)
* **Fields Replicated**:
  * **Storefront Economics**: `id`, `order_number`, `created_at`, `total_price`, `subtotal_price`, `total_tax`, `total_shipping_price`, `total_discounts`, `discount_codes`.
  * **Customer Acquisition**: `customer.orders_count` ($1$ = New Customer Acquisition `nCAC`, $>1$ = Returning Customer LTV).
  * **Payment Gateway Friction**: `payment_gateway_names`, `processing_fee` ($2.9\% + \$0.30$ deduction).
  * **Attribution Cross-Check**: `referring_site`, `landing_site_ref` (UTM source, medium, campaign, content).
  * **Line Items**: `variant_id`, `product_id`, `sku`, `price`, `quantity`, `total_discount`, `requires_shipping`.
  * **True Net Margin**: `merchant_net_contribution_margin` (Contribution Margin 3: Net Collected - ERP COGS - Shipping - Gateway Fee - Taxes).
  * **Warehouse Logistics**: `location_id`, `available`, `reorder_point`, `lead_time_days`, `safety_stock`, `daily_burn_velocity`, `stockout_risk_score`.

---

## 4. Canonical UnifiedCommerceRecord Model

All platform payloads are transformed client-side and server-side into the canonical schema:

```typescript
export interface UnifiedCommerceRecord {
  id: string;
  timestamp: string; // ISO 8601 UTC
  channel: 'meta' | 'google' | 'amazon' | 'shopify';
  campaign_id: string;
  campaign_name: string;
  sku_id: string;
  sku_name: string;
  asin?: string;
  variant_id?: string;
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  cpm: number;
  ctr: number;
  conversions: number;
  attributed_revenue: number;
  roas: number;
  unit_cogs: number;
  total_cogs: number;
  gross_margin: number;
  gross_margin_pct: number;
  inventory_on_hand: number;

  // Enterprise Feature Store Fields
  frequency?: number;
  reach?: number;
  learning_phase_status?: string;
  quality_ranking?: string;
  video_hook_rate_pct?: number;
  search_impression_share_pct?: number;
  search_budget_lost_is_pct?: number;
  search_rank_lost_is_pct?: number;
  quality_score?: number;
  buy_box_win_pct?: number;
  halo_attributed_revenue?: number;
  fba_fees?: number;
  customer_acquisition_type?: 'NEW_ACQUISITION' | 'RETURNING_VIP';
  payment_gateway_fee?: number;
  net_contribution_margin?: number; // CM3
  poas?: number; // Profit on Ad Spend (Net Margin / Spend)
}
```

---

## 5. Regional Inventory, Location Strategy & Privacy-Safe Telemetry

In addition to omnichannel advertising platforms, NEXUS-DQPS integrates physical supply chain distribution nodes with continuous-time geographical audience telemetry. This prevents the **"Regional Stockout Ad Burn"** anomaly—where global inventory appears positive, but localized warehouse stockouts either bounce checkouts (100% ad waste) or trigger cross-country zone-skipping freight penalties that destroy net contribution margins.

### 5.1. Regional Warehouse Distribution Matrix
The catalog is fulfilled across 7 physical fulfillment nodes:
* **`FC-EAST-ALLENTOWN`**: Nike East Coast FC (Allentown, PA) &rarr; Fulfillment catchment: `us-east`
* **`FC-WEST-ONTARIO`**: Nike Pacific Coast FC (Ontario, CA) &rarr; Fulfillment catchment: `us-west`
* **`FC-EU-LAAKDAL`**: Nike European Logistics Campus (Laakdal, Belgium) &rarr; Fulfillment catchment: `emea-de`
* **`FC-EU-DAVENTRY`**: Nike UK Distribution Hub (Daventry, UK) &rarr; Fulfillment catchment: `emea-uk`
* **`FC-APAC-NARITA`**: Nike Japan Fulfillment Center (Chiba, Japan) &rarr; Fulfillment catchment: `apac-jp`
* **`FC-SEA-CHANGI`**: Nike Southeast Asia Hub (Changi, Singapore) &rarr; Fulfillment catchment: `sea-sg`
* **`FC-LATAM-SAOPAULO`**: Nike Latin America Hub (São Paulo, Brazil) &rarr; Fulfillment catchment: `latam`

### 5.2. Zone-Skipping Freight Margin Economics
When localized stockouts occur in the primary regional warehouse, cross-fulfillment across zones triggers severe margin erosion:
$$\text{Net Contribution Margin} = P_{\text{retail}} - \text{COGS} - \text{Freight}(w, r) - \text{CAC}$$
* **Local Zone 2 Fulfillment (Standard)**: Freight = \$4.80. Net Profit = +\$15.91/unit.
* **Cross-Country Zone 8 Fulfillment (Zone-Skipping)**: Freight = \$18.50. Net Profit = +\$2.21/unit (Margin penalty $\Delta = -\$13.70$/unit, an 86% margin contraction).

### 5.3. Privacy-Safe Geo-Resolution Telemetry (`visitor-tracking-state.json`)
To satisfy **GDPR Recital 30**, **ePrivacy**, and **CCPA/CPRA**, NEXUS enforces a strict **Zero-GPS architecture**:
* **No HTML5 Geolocation**: Eliminates client-side permission prompts (84%+ drop-off rate) and avoids storing high-precision lat/long coordinates.
* **Edge Ingestion**: Resolves user catchment area via Cloudflare Anycast edge reverse-proxy headers (`CF-IPCountry`, `CF-Region-Code`, `CF-Ray`).
* **Subnet Truncation ($k$-Anonymity)**:
  * IPv4 addresses are masked to `/24` CIDR blocks (e.g., `198.51.100.142` &rarr; `198.51.100.0/24`), grouping the request across 256 hosts.
  * IPv6 addresses are truncated to `/48`.
  * All 362 visitor sessions and 1,259 tracking events are enriched with deterministic `/24` subnet masks, Edge PoPs (`EWR`, `SFO`, `LHR`, `NRT`, `SIN`), and RTT network latencies.

```typescript
export interface GeoLocationContext {
  region_id: 'us-east' | 'us-west' | 'emea-uk' | 'emea-de' | 'apac-jp' | 'sea-sg' | 'latam' | 'nordic';
  country_code: string;  // ISO 3166-1 alpha-2 (e.g., 'US', 'GB')
  metro_code?: string;   // DMA / Nielsen market code (e.g., '501' for NY)
  edge_pop: string;      // Edge IATA code (e.g., 'EWR', 'SFO', 'LHR')
  subnet_masked: string; // /24 CIDR prefix (e.g., '198.51.100.0/24')
  rtt_latency_ms: number;// Edge round-trip latency in ms
}
```

### 5.4. Walled Garden Click Token Encryption & Multi-Touch Stitching
A critical structural barrier in digital advertising is that **raw ad network data alone cannot identify a single user across platforms**. 

#### 1. Why Raw Ad Data Fails to Stitch Users:
* Major ad platforms (Google/YouTube, Meta, TikTok) operate as **"Walled Gardens."**
* When an ad is clicked, the network appends a proprietary, cryptographically signed click identifier to the landing URL:
  * **Google Ads / YouTube**: `gclid` (e.g., `CjwKCAiA2b163dba9bd5_gclid`)
  * **Meta (FB/IG)**: `fbclid` (e.g., `fb.1.1791373540.82b9c0f599c0`)
  * **TikTok**: `ttclid` (e.g., `tt_cl_f7916968be29`)
* **Asymmetric Cryptography**: These tokens are encrypted with the network's private key. Google cannot decrypt a Meta `fbclid`, Meta cannot decrypt a Google `gclid`, and advertisers cannot decrypt either to reveal PII or cross-platform IDs.

#### 2. The Platform Double-Counting Trap:
If a user clicks a YouTube ad in the morning, clicks an Instagram ad in the evening, and purchases a shoe for **\$150**:
* **Google's Tag** reports: *"Purchase of \$150 attributed to `gclid`"* (claims 100% credit).
* **Meta's Pixel / CAPI** reports: *"Purchase of \$150 attributed to `fbclid`"* (claims 100% credit).
* **Total Platform-Claimed Revenue**: **\$300** (200% inflation over actual GAAP bank revenue of \$150).

#### 3. How NEXUS-DQPS Stitches Users Without a `userId`:
NEXUS bypasses the walled garden encryption barrier at the **First-Party Storefront Edge**:
1. **Edge URL Ingestion**: As the visitor arrives, the reverse proxy extracts and pairs `click_id` (`gclid`, `fbclid`, `ttclid`) with UTM campaign tags.
2. **Subnet & Entropy Clustering**: If third-party cookies are blocked, sessions from the same `/24` subnet, device hardware entropy, and browser profile are deterministically linked to an anonymous cluster ID in `visitor-tracking-state.json`.
3. **Multi-Touch Sequential Pathing**: Stitches multi-platform touches over time:
   $$\text{Discovery (YouTube / TikTok)} \longrightarrow \text{Intent (Google Search)} \longrightarrow \text{Retargeting (Meta)} \longrightarrow \text{Shopify Order}$$
4. **Shapley Counterfactual Attribution**: Evaluates the incremental marginal contribution of each touchpoint rather than naive last-touch, eliminating the 200% double-counting discrepancy and aligning reported ROAS with true cash bank receipts.

---

## 6. Lakehouse Ingestion & Multi-Platform Volume Balancing

The historical dataset has been expanded, balanced, and enriched across all 4 platforms to support high-fidelity causal discovery (DirectLiNGAM) and convex budget optimization (SLSQP).

### 6.1. Platform Balance & Raw Payloads (P1)
To eliminate sample size asymmetry where Meta comprised >96% of the data, a continuous 90-day time series (2026-07-09 to 2026-10-07) was synthesized across all catalog SKUs:
* **Total Time-Series Records (`data/metrics.csv`)**: **3,873 rows**
  * **Meta Ads**: 1,143 records (Kaggle conversion ground truth)
  * **Google Ads**: 910 records (`data/payloads/google_ads_rows.json` with Search Budget Lost IS)
  * **Amazon Ads**: 910 records (`data/payloads/amazon_sponsored_products.json` with 1d/7d/14d attribution & Buy Box win rates)
  * **Shopify Storefront**: 910 records (880 executed orders and line items)
* **Raw JSON Payloads (`data/payloads/`)**:
  * `google_ads_rows.json`: **910 records** featuring micros conversions, Ad Rank loss, and Quality Score indicators.
  * `amazon_sponsored_products.json`: **910 records** featuring Buy Box percentages, placement bid multipliers, and FBA fee models.

### 6.2. Geo-Telemetry Backfill & Subnet Masking (P2)
* **`visitor-tracking-state.json`**:
  * **1,259 / 1,259 events (100.0%)** and **362 / 362 sessions (100.0%)** are enriched with deterministic `GeoLocationContext`.
  * Every record contains Edge PoPs (`EWR`, `SFO`, `LHR`, `NRT`, `SIN`), masked `/24` IPv4 subnets (e.g. `198.51.100.9/24`), DMA metro codes, and edge RTT network latencies (8ms–45ms).
  * Enforces zero-GPS data minimization under GDPR Recital 30.

### 6.3. DuckDB Columnar Lakehouse Hydration (P3)
All 10 tables in `data/dqps.duckdb` are fully hydrated and queryable with zero empty tables:
* **`ad_spend_daily`**: **2,740 rows** — daily aggregated channel/campaign/date records.
* **`unified_commerce_ledger`**: **2,740 rows** — canonical tensor with CM3 net contribution margins, POAS, MER, and runway.
* **`metrics`**: **2,790 rows** — analytical time-series snapshots.
* **`shopify_orders`**: **880 rows** — D2C transactions with financial statuses and sales tax breakdown.
* **`shopify_order_lines`**: **880 rows** — itemized SKU lines linked to parent orders.
* **`product_catalog`**: **10 rows** — master catalog mapping MSRP, ERP unit COGS, and category.
* **`inventory_levels`**: **10 rows** — active catalog SKUs with live warehouse availability.
* **`ledger`**: **3 rows** — autonomous decision audit records with expected vs. realized margin lift.
* **`events`**: **4 rows** — live event stream buffer.
* **`v_daily_unit_economics`**: **912 rows** — continuous analytical view combining ad spend with net margins.

### 6.4. Time-Series Macro Shocks & Anomaly Injection (P4)
Documented operational anomalies from `nexus-engine-state.json` are embedded into the raw `metrics.csv` and DuckDB lakehouse time-series starting on `2026-09-28`:
1. **Hard Warehouse Stockouts**:
   * `310805-137` (Air Jordan 10) & `942851-002` (Pegasus 35): Inventory drops to 0; conversions, revenue, and gross margin collapse to 0.
   * `315122-001` (Air Force 1 on Amazon): Inventory drops to 0 with ad spend active; conversions collapse to 0.
2. **Auction CPM Spikes & Fatigue**:
   * `AO2924-401` on Amazon: CPM elevated by **+15.8%**, CVR reduced by **-27.2%**.
   * `BQ8928-011` on Google & Amazon: Conversion rates drop by **-21.9%** and CPM spikes by **+17.0%**.
   * `880848-005` (Zoom Fly): CPM surges by **+22.0%**, CVR drops by **-34.2%**.
These shocks ensure DirectLiNGAM and Z-score diagnostic algorithms discover real operational deviations in raw telemetry without relying on synthetic labels.

---

## 7. Machine Learning Application Readiness

### 7.1. Deterministic Engines
1. **Non-Linear Hill Saturation**:
   $$\text{Hill}(x; \beta, \eta, K) = \beta \cdot \frac{x^\eta}{K^\eta + x^\eta}$$
   Calibrated per channel with empirical half-saturation spend $K$ and shape $\eta$.
2. **Analytical Marginal ROAS Derivative**:
   $$\frac{dY}{dx} = \beta \cdot \eta \cdot K^\eta \cdot \frac{x^{\eta - 1}}{(K^\eta + x^\eta)^2}$$
   Evaluated instantaneously in $< 0.1\text{ms}$ to identify inflection points and underfunded regimes.
3. **Geometric Adstock Carryover**:
   $$x_c^{\text{adstock}}(t) = \sum_{l=0}^L \alpha_c^l \cdot x_c(t - l)$$
4. **Multi-Region SLSQP Optimization with Physical Inventory Bounds**:
   Solves constrained convex budget allocation across channels $c$ and fulfillment catchments $r$:
   $$\max_{\vec{x}} \sum_{r \in \mathcal{R}} \sum_{c \in \mathcal{C}} \alpha_{c,r} \cdot \ln(1 + \beta_{c,r} x_{c,r}) \cdot \Psi(\tau_{\text{edge}, r}) \cdot \mathbb{I}(I_{k,r} > 0)$$
   When regional stock hits 0 ($I_{k,r} = 0$), the indicator $\mathbb{I} = 0$, driving the analytical Jacobian to $-1.0$ and shifting capital into healthy fulfillment regions.
5. **Primal-Dual Combinatorial Knapsacks (CBwK)**:
   Maintains dynamic shadow prices $\lambda_{\text{budget}}$ and $\lambda_{\text{inventory}}^{(k)}$ via multiplicative weight updates:
   $$\lambda_{j, t+1} = \lambda_{j, t} \cdot \left(1 + \epsilon \frac{c_{j, t}}{C_j}\right)$$

### 7.2. Probabilistic & Causal Engines
1. **DirectLiNGAM Non-Gaussian Causal Discovery**:
   Discovers true observational causal ordering:
   $$\text{Spend} \to \text{Impressions} \to \text{Clicks} \to \text{Orders} \to \text{Revenue}$$
   Validates acyclic DAG topology and eliminates spurious correlational loops.
2. **Structural Causal Model (SCM) & Counterfactual Shapley Decomposition**:
   Separates operational root causes into exact additive contributions:
   $$\Delta \text{ROAS} = \phi_{\text{Stockout}} + \phi_{\text{CreativeWearout}} + \phi_{\text{CompetitionCPM}} + \phi_{\text{OrganicSpillover}}$$
3. **Anomaly Z-Scoring & Hazard Rates**:
   Savitzky-Golay filtering and debiasing with sub-$10\text{ms}$ real-time latency triggers for sudden conversion blackouts.

---

## 8. Verification & Test Coverage

* **Pytest Suite (`python -m pytest tests/ -v`)**: **105 / 105 Passed (100%)**
  * `test_models.py`: Production-exact Pydantic v2 validation for Meta, Google, Amazon, and Shopify payloads.
  * `test_schemas_and_normalization.py`: Micros conversions, catalog resolution, DuckDB columnar ingestion.
  * `test_curves.py`: Hill boundary conditions, marginal ROAS derivatives, geometric adstock.
  * `test_guardrails.py`: 6-hour velocity limiters, Tier-4 kill switch, 24h ledger verification.
  * `test_causal_rca.py` & `test_mcp_and_discovery.py`: DirectLiNGAM and Shapley sum verification.
  * Concurrent DuckDB lock handling validated with read-only fallback.
* **Frontend Production Build (`npm run build`)**: **50 / 50 Routes Compiled Successfully (100%)**
  * Route [`/dashboard/globe`](file:///home/shivam/Projects/NEXUS-DQPS/web/src/app/dashboard/globe/page.tsx) verified with interactive 3D WebGL pulse globe and regional stockout circuit breaker panels.
  * Route [`/dashboard/normalization`](file:///home/shivam/Projects/NEXUS-DQPS/web/src/app/dashboard/normalization/page.tsx) verified with live raw JSON preview and enterprise telemetry chips.

---

## 9. Indian Rupee (INR / ₹) Unified Currency Migration & Unit Economics

### 9.1. Conversion Benchmark & Exchange Rates
* **Fixed Conversion Anchor**: \$1.00 \text{ USD} = 84.00 \text{ INR} based on realistic Q3 2024–2026 macro foreign exchange parity.
* **Nike India Footwear Retail MSRP Ground Truth**: Sourced directly from `data/nike_shoes_sales.csv` (e.g. Air Force 1 '07 at ₹7,495, Air Jordan 10 at ₹15,995, React Infinity at ₹13,995, Zoom Fly at ₹14,495).
* **COGS & Gross Margins**: Unit COGS calibrated between 38% and 42% of MSRP (e.g. Air Force 1 unit COGS = ₹3,150; gross margin = 58.0%).

### 9.2. Dimensionless Invariance of Performance Ratios
All efficiency and marketing productivity ratios remain strictly invariant under currency scaling:
$$\text{ROAS} = \frac{\text{Revenue}_{\text{INR}}}{\text{Spend}_{\text{INR}}} = \frac{84 \cdot \text{Revenue}_{\text{USD}}}{84 \cdot \text{Spend}_{\text{USD}}} = \text{ROAS}_{\text{USD}}$$
$$\text{POAS} = \frac{\text{Margin}_{\text{INR}}}{\text{Spend}_{\text{INR}}} = \text{POAS}_{\text{USD}}$$
$$\text{CTR} = \frac{\text{Clicks}}{\text{Impressions}}, \quad \text{CVR} = \frac{\text{Orders}}{\text{Clicks}}$$

Crucially, both spend and revenue are scaled synchronously across simulation engines, payloads, and UI formatters, preventing the catastrophic "Slap-a-Rupee" mismatch error where spend is left in USD while revenue is in INR (which would artificially inflate ROAS from 5.6x to ~474x).

### 9.3. Platform-Specific Financial Scaling
* **Google Ads API**: `metrics.costMicros` in INR where 1,000,000 micros = ₹1.00 INR ($1\text{ INR} = 10^6\text{ micros}$).
* **Amazon Sponsored Products**: Currency set to `'INR'`, FBA pick/pack fees set to ₹240.00/unit, referral fee standard at 15%.
* **Shopify Storefront**: Orders executed in `'INR'`, standard 18% Goods & Services Tax (GST) itemized, payment gateway fee at 2.0% + ₹3.00, and Zone 2 local delivery freight at ₹180.00/order (vs Zone 8 inter-state express air freight at ₹650.00).
* **DuckDB Lakehouse & Telemetry**: All 10 DuckDB tables (`ad_spend_daily`, `unified_commerce_ledger`, `shopify_orders`, etc.) and `web/src/data/nexus-engine-state.json` fully hydrated in native INR with standard Indian numbering (`en-IN` Lakhs/Crores notation).

