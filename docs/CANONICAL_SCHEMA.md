# NEXUS-DQPS Canonical Commerce & Multi-Platform Telemetry Schema

## 1. Executive Architecture Overview

NEXUS-DQPS reconciles multi-channel digital ad telemetry (Meta Graph API, Google Ads API, Amazon Advertising API) with physical inventory and transactional order stream data (Shopify Admin REST / GraphQL / Webhooks) into a continuous-time canonical tensor:

$$\mathcal{T}(t, c, k, s) \in \mathbb{R}^M$$

where:
- $t$: Continuous-time / daily ISO 8601 UTC timestamp.
- $c \in \{\text{meta}, \text{google}, \text{amazon}, \text{shopify}\}$: Advertising or sales channel.
- $k$: Campaign identifier.
- $s$: Canonical SKU identifier.
- $M$: Vector of reconciled unit economics and operational metrics.

---

## 2. Platform-Exact Source Schemas

### 2.1 Meta Graph API (`/v19.0/{ad_id}/insights`)
* **Pydantic Model:** `ingest.models.meta.MetaInsightsRecord`
* **Raw Fields:**
  | Field | Type | Description |
  |---|---|---|
  | `account_id` | `str` | Ad Account ID (`act_...`) |
  | `campaign_id` | `str` | Campaign numeric ID |
  | `campaign_name` | `str` | Campaign name |
  | `adset_id` | `str` | Ad Set numeric ID |
  | `adset_name` | `str` | Ad Set name |
  | `ad_id` | `str` | Ad creative numeric ID |
  | `ad_name` | `str` | Ad creative name |
  | `spend` | `float` | Monetary ad spend in account currency |
  | `impressions` | `int` | Ad impression volume |
  | `clicks` | `int` | Total click count |
  | `cpc` | `float` | Cost per click |
  | `cpm` | `float` | Cost per thousand impressions |
  | `frequency` | `float` | Average impressions per unique user |
  | `actions` | `list[MetaAction]` | Conversion events (e.g., `omni_purchase`, `link_click`, `1d_view`, `7d_click`) |
  | `action_values`| `list[MetaAction]` | Attributed monetary values for actions |
  | `date_start` | `str` | Reporting interval start (`YYYY-MM-DD`) |
  | `date_stop` | `str` | Reporting interval end (`YYYY-MM-DD`) |

### 2.2 Google Ads API (`GoogleAdsRow`)
* **Pydantic Model:** `ingest.models.google.GoogleAdsRow`
* **Raw Fields:**
  | Resource | Field | Type | Description |
  |---|---|---|---|
  | `campaign` | `id` | `str` | Campaign ID |
  | `campaign` | `name` | `str` | Campaign display name |
  | `campaign` | `advertising_channel_type` | `str` | `SEARCH`, `PERFORMANCE_MAX`, `DISPLAY` |
  | `segments` | `date` | `str` | Daily segment (`YYYY-MM-DD`) |
  | `segments` | `device` | `str` | Device segment (`DESKTOP`, `MOBILE`, `TABLET`) |
  | `metrics` | `impressions` | `int` | Impression count |
  | `metrics` | `clicks` | `int` | Click count |
  | `metrics` | `cost_micros` | `int` | Ad spend in millionths of currency unit |
  | `metrics` | `conversions` | `float` | Attributed conversion volume |
  | `metrics` | `conversions_value` | `float` | Attributed monetary conversion revenue |
  | `metrics` | `average_cpc` | `float` | Average CPC |

### 2.3 Amazon Advertising API (`Sponsored Products Report`)
* **Pydantic Model:** `ingest.models.amazon.AmazonSponsoredProductsRecord`
* **Raw Fields:**
  | Field | Type | Description |
  |---|---|---|
  | `campaignId` | `str` | Amazon Campaign ID |
  | `campaignName` | `str` | Campaign display name |
  | `adGroupId` | `str` | Ad Group ID |
  | `adGroupName` | `str` | Ad Group display name |
  | `asin` | `str` | Amazon Standard Identification Number |
  | `sku` | `str` | Merchant Stock Keeping Unit |
  | `date` | `str` | Reporting date (`YYYY-MM-DD`) |
  | `impressions` | `int` | Impression count |
  | `clicks` | `int` | Clicks count |
  | `cost` | `float` | Ad cost in specified currency |
  | `attributedSales14d` | `float` | 14-day total attributed sales revenue |
  | `attributedUnitsOrdered14d`| `int` | 14-day total units ordered |
  | `currency` | `str` | ISO 4217 Currency Code (`USD`) |

### 2.4 Shopify Admin REST / Webhooks (`orders/create`, `inventory_levels/set`)
* **Pydantic Models:** `ingest.models.shopify.ShopifyOrder`, `ShopifyLineItem`, `ShopifyInventoryLevel`
* **Raw Fields:**
  | Resource | Field | Type | Description |
  |---|---|---|---|
  | `Order` | `id` | `str` | Order ID |
  | `Order` | `order_number` | `int` | Sequential order number |
  | `Order` | `created_at` | `str` | ISO 8601 UTC creation time |
  | `Order` | `total_price` | `float` | Total order payment collected |
  | `Order` | `subtotal_price`| `float` | Subtotal before taxes and shipping |
  | `Order` | `total_discounts`| `float` | Total promotional discounts |
  | `LineItem` | `variant_id` | `str` | Shopify Variant GID |
  | `LineItem` | `sku` | `str` | Product SKU |
  | `LineItem` | `price` | `float` | Unit price |
  | `LineItem` | `quantity` | `int` | Unit quantity |
  | `Inventory`| `available` | `int` | On-hand warehouse available quantity |
  | `Inventory`| `unit_cogs` | `float` | Unit cost of goods sold from ERP |

---

## 3. Canonical Unified Commerce Record (`UnifiedCommerceRecord`)

The core entity stored in DuckDB table `unified_commerce_ledger`:

| Dimension / Metric | Type | Source / Derivation |
|---|---|---|
| `timestamp` | `TIMESTAMP WITH TIME ZONE` | Primary Index |
| `channel` | `VARCHAR` | `'meta'`, `'google'`, `'amazon'`, `'shopify'` |
| `campaign_id` | `VARCHAR` | Primary Index |
| `sku_id` | `VARCHAR` | Primary Index |
| `sku_name` | `VARCHAR` | Product Catalog |
| `asin` | `VARCHAR` | Cross-referenced ASIN |
| `variant_id` | `VARCHAR` | Shopify Variant ID |
| `spend` | `DOUBLE` | Converted to USD |
| `impressions` | `BIGINT` | Ad platform impressions |
| `clicks` | `BIGINT` | Ad platform clicks |
| `cpc` | `DOUBLE` | $\text{Spend} / \text{Clicks}$ |
| `cpm` | `DOUBLE` | $(\text{Spend} / \text{Impressions}) \times 1000$ |
| `ctr` | `DOUBLE` | $\text{Clicks} / \text{Impressions}$ |
| `ad_conversions` | `DOUBLE` | Reported conversion count |
| `attributed_revenue` | `DOUBLE` | Reported conversion value |
| `units_sold` | `INTEGER` | Physical Shopify units delivered |
| `gross_revenue` | `DOUBLE` | Gross order value |
| `net_revenue` | `DOUBLE` | Gross revenue minus discounts |
| `unit_cogs` | `DOUBLE` | ERP unit cost |
| `total_cogs` | `DOUBLE` | $\text{Units Sold} \times \text{Unit COGS}$ |
| `gross_margin` | `DOUBLE` | $\text{Net Revenue} - \text{Total COGS}$ |
| `variable_costs` | `DOUBLE` | Payment gateway & fulfillment fees |
| `net_contribution_margin` | `DOUBLE` | $\text{Net Revenue} - \text{Total COGS} - \text{Spend} - \text{Variable Costs}$ |
| `roas` | `DOUBLE` | $\text{Attributed Revenue} / \text{Spend}$ |
| `poas` | `DOUBLE` | $\text{Gross Margin} / \text{Spend}$ |
| `mer` | `DOUBLE` | $\text{Net Revenue} / \text{Spend}$ |
| `inventory_on_hand`| `INTEGER` | Available inventory balance |
| `inventory_status` | `VARCHAR` | `'IN_STOCK'`, `'LOW_STOCK'`, `'OUT_OF_STOCK'` |

---

## 4. Mathematical Conversion & Unit Economics Formulations

### 4.1 Google Ads `cost_micros` Conversion
$$\text{Spend}_{\text{USD}} = \frac{\text{cost\_micros}}{1{,}000{,}000}$$

### 4.2 Multi-Currency Normalization
$$\text{Amount}_{\text{USD}} = \text{Amount}_{\text{src}} \times \text{FX}_{\text{src} \to \text{USD}}$$

### 4.3 Unit Economics Formulas
1. **Return on Ad Spend (ROAS):**
   $$\text{ROAS} = \frac{\text{Attributed Revenue}}{\text{Spend}}$$

2. **Profit on Ad Spend (POAS):**
   $$\text{POAS} = \frac{\text{Gross Margin}}{\text{Spend}} = \frac{\text{Net Revenue} - \text{COGS}}{\text{Spend}}$$

3. **Marketing Efficiency Ratio (MER):**
   $$\text{MER} = \frac{\text{Total Net Storefront Revenue}}{\sum_{\text{all channels}} \text{Spend}}$$

4. **Net Contribution Margin ($\text{NCM}$):**
   $$\text{NCM} = \sum_{k} \left( (\text{Price}_k - \text{COGS}_k - \text{VariableCost}_k) \cdot Q_k \right) - \sum_{c} \text{Spend}_c$$

---

## 5. Cross-Channel Product Catalog Mapping

| SKU | Product Title | Amazon ASIN | Shopify Variant ID | Retail Price ($) | Unit COGS ($) |
|---|---|---|---|---|---|
| `310805-137` | Air Jordan 10 Retro | `B07Q8Z9101` | `gid://shopify/ProductVariant/41001` | $192.71 | $58.00 |
| `880848-005` | Nike Zoom Fly | `B07Q8Z9102` | `gid://shopify/ProductVariant/41002` | $174.64 | $52.50 |
| `AH8050-100` | Nike Air Max 270 | `B07Q8Z9103` | `gid://shopify/ProductVariant/41003` | $168.61 | $48.00 |
| `CI3831-002` | Nike Adapt BB 2.0 | `B07Q8Z9104` | `gid://shopify/ProductVariant/41004` | $350.00 | $105.00 |
| `CK6637-104` | Nike Air Zoom Pegasus 37 | `B07Q8Z9105` | `gid://shopify/ProductVariant/41005` | $120.00 | $36.00 |
