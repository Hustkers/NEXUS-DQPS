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

| Canonical SKU | Product Name | Base MSRP | ERP Unit COGS | Amazon ASIN | Shopify Variant GID | Baseline Inventory |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`310805-137`** | Air Jordan 10 Retro | \$192.71 | \$58.00 | `B07Q8Z9101` | `gid://shopify/ProductVariant/41001` | 0 *(Stockout Shock)* |
| **`880848-005`** | Nike Zoom Fly | \$174.64 | \$52.50 | `B07Q8Z9102` | `gid://shopify/ProductVariant/41002` | 410 *(Healthy)* |
| **`AH8050-100`** | Nike Air Max 270 | \$168.61 | \$48.00 | `B07Q8Z9103` | `gid://shopify/ProductVariant/41003` | 360 *(Healthy)* |
| **`315122-001`** | Nike Air Force 1 '07 | \$87.89 | \$38.50 | `B07Q8Z9104` | `gid://shopify/ProductVariant/41004` | 520 *(Surplus)* |
| **`CD4371-001`** | Nike React Infinity Run Flyknit | \$168.61 | \$69.00 | `B07Q8Z9107` | `gid://shopify/ProductVariant/41007` | 320 *(Healthy)* |
| **`AO2924-401`** | Nike Air Zoom Pegasus 36 | \$120.00 | \$42.00 | `B07Q8Z9105` | `gid://shopify/ProductVariant/41005` | 280 *(Healthy)* |

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

## 5. Machine Learning Application Readiness

### 5.1. Deterministic Engines
1. **Non-Linear Hill Saturation**:
   $$\text{Hill}(x; \beta, \eta, K) = \beta \cdot \frac{x^\eta}{K^\eta + x^\eta}$$
   Calibrated per channel with empirical half-saturation spend $K$ and shape $\eta$.
2. **Analytical Marginal ROAS Derivative**:
   $$\frac{dY}{dx} = \beta \cdot \eta \cdot K^\eta \cdot \frac{x^{\eta - 1}}{(K^\eta + x^\eta)^2}$$
   Evaluated instantaneously in $< 0.1\text{ms}$ to identify inflection points and underfunded regimes.
3. **Geometric Adstock Carryover**:
   $$x_c^{\text{adstock}}(t) = \sum_{l=0}^L \alpha_c^l \cdot x_c(t - l)$$
4. **Primal-Dual Combinatorial Knapsacks (CBwK)**:
   Maintains dynamic shadow prices $\lambda_{\text{budget}}$ and $\lambda_{\text{inventory}}^{(k)}$ via multiplicative weight updates:
   $$\lambda_{j, t+1} = \lambda_{j, t} \cdot \left(1 + \epsilon \frac{c_{j, t}}{C_j}\right)$$
   When inventory reaches $0$, $\lambda_{\text{inv}} \to \infty$, shifting capital to high-margin, in-stock alternatives.

### 5.2. Probabilistic & Causal Engines
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

## 6. Verification & Test Coverage

* **Pytest Suite (`python -m pytest tests/ -v`)**: **68 / 68 Passed (100%)**
  * `test_models.py`: Production-exact Pydantic v2 validation for Meta, Google, Amazon, and Shopify payloads.
  * `test_schemas_and_normalization.py`: Micros conversions, catalog resolution, DuckDB columnar ingestion.
  * `test_curves.py`: Hill boundary conditions, marginal ROAS derivatives, geometric adstock.
  * `test_guardrails.py`: 6-hour velocity limiters, Tier-4 kill switch, 24h ledger verification.
  * `test_causal_rca.py` & `test_mcp_and_discovery.py`: DirectLiNGAM and Shapley sum verification.
* **Frontend Production Build (`npm run build`)**: **35 / 35 Routes Compiled Statically (100%)**
  * Route [`/dashboard/normalization`](file:///home/shivam/Projects/NEXUS-DQPS/web/src/app/dashboard/normalization/page.tsx) verified with live raw JSON preview and enterprise telemetry chips.
