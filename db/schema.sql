-- NEXUS-DQPS: DuckDB Relational Warehouse Schema
-- Columnar storage optimized for analytical joins across ad spend, Shopify orders, and ERP inventory

-- 1. Product Catalog & Cross-Reference Mapping
CREATE TABLE IF NOT EXISTS product_catalog (
    sku VARCHAR PRIMARY KEY,
    product_name VARCHAR NOT NULL,
    asin VARCHAR,
    variant_id VARCHAR,
    retail_price DOUBLE NOT NULL DEFAULT 0.0,
    unit_cogs DOUBLE NOT NULL DEFAULT 0.0,
    category VARCHAR DEFAULT 'Footwear'
);

-- 2. Physical Inventory & COGS
CREATE TABLE IF NOT EXISTS inventory_levels (
    sku VARCHAR PRIMARY KEY,
    inventory_item_id VARCHAR,
    location_id VARCHAR,
    available INTEGER NOT NULL DEFAULT 0,
    unit_cogs DOUBLE NOT NULL DEFAULT 0.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Raw Platform Daily Ad Spend Telemetry
CREATE TABLE IF NOT EXISTS ad_spend_daily (
    date DATE NOT NULL,
    channel VARCHAR NOT NULL,
    campaign_id VARCHAR NOT NULL,
    campaign_name VARCHAR NOT NULL,
    sku VARCHAR NOT NULL,
    spend DOUBLE NOT NULL DEFAULT 0.0,
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    cpc DOUBLE DEFAULT 0.0,
    cpm DOUBLE DEFAULT 0.0,
    ctr DOUBLE DEFAULT 0.0,
    platform_conversions DOUBLE DEFAULT 0.0,
    platform_revenue DOUBLE DEFAULT 0.0,
    PRIMARY KEY (date, channel, campaign_id, sku)
);

-- 4. Shopify Orders
CREATE TABLE IF NOT EXISTS shopify_orders (
    order_id VARCHAR PRIMARY KEY,
    order_number BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    total_price DOUBLE NOT NULL DEFAULT 0.0,
    subtotal_price DOUBLE NOT NULL DEFAULT 0.0,
    total_discounts DOUBLE DEFAULT 0.0,
    total_tax DOUBLE DEFAULT 0.0,
    currency VARCHAR DEFAULT 'USD',
    financial_status VARCHAR DEFAULT 'paid'
);

-- 5. Shopify Order Line Items
CREATE TABLE IF NOT EXISTS shopify_order_lines (
    line_id VARCHAR PRIMARY KEY,
    order_id VARCHAR NOT NULL,
    variant_id VARCHAR,
    sku VARCHAR NOT NULL,
    title VARCHAR,
    price DOUBLE NOT NULL DEFAULT 0.0,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_discount DOUBLE DEFAULT 0.0,
    net_revenue DOUBLE DEFAULT 0.0
);

-- 6. Canonical Unified Commerce Ledger
CREATE TABLE IF NOT EXISTS unified_commerce_ledger (
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    channel VARCHAR NOT NULL,
    campaign_id VARCHAR NOT NULL,
    campaign_name VARCHAR NOT NULL,
    sku_id VARCHAR NOT NULL,
    sku_name VARCHAR,
    asin VARCHAR,
    variant_id VARCHAR,
    spend DOUBLE NOT NULL DEFAULT 0.0,
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    cpc DOUBLE DEFAULT 0.0,
    cpm DOUBLE DEFAULT 0.0,
    ctr DOUBLE DEFAULT 0.0,
    ad_conversions DOUBLE DEFAULT 0.0,
    attributed_revenue DOUBLE DEFAULT 0.0,
    roas DOUBLE DEFAULT 0.0,
    units_sold INTEGER NOT NULL DEFAULT 0,
    gross_revenue DOUBLE DEFAULT 0.0,
    net_revenue DOUBLE DEFAULT 0.0,
    unit_cogs DOUBLE DEFAULT 0.0,
    total_cogs DOUBLE DEFAULT 0.0,
    gross_margin DOUBLE DEFAULT 0.0,
    variable_costs DOUBLE DEFAULT 0.0,
    net_contribution_margin DOUBLE DEFAULT 0.0,
    poas DOUBLE DEFAULT 0.0,
    mer DOUBLE DEFAULT 0.0,
    inventory_on_hand INTEGER DEFAULT 0,
    inventory_status VARCHAR DEFAULT 'IN_STOCK',
    days_of_supply DOUBLE,
    PRIMARY KEY (timestamp, channel, campaign_id, sku_id)
);

-- Analytical View: Cross-channel Unit Economics & Margin Reconciliation
CREATE OR REPLACE VIEW v_daily_unit_economics AS
SELECT 
    CAST(timestamp AS DATE) AS metric_date,
    sku_id,
    SUM(spend) AS total_ad_spend,
    SUM(impressions) AS total_impressions,
    SUM(clicks) AS total_clicks,
    SUM(net_revenue) AS total_net_revenue,
    SUM(total_cogs) AS total_cogs,
    SUM(gross_margin) AS total_gross_margin,
    SUM(net_contribution_margin) AS total_ncm,
    CASE 
        WHEN SUM(spend) > 0 THEN SUM(gross_margin) / SUM(spend)
        ELSE 0.0 
    END AS blended_poas,
    CASE 
        WHEN SUM(spend) > 0 THEN SUM(net_revenue) / SUM(spend)
        ELSE 0.0 
    END AS blended_mer
FROM unified_commerce_ledger
GROUP BY 1, 2;
