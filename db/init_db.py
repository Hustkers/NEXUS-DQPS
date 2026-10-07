#!/usr/bin/env python3
"""Database schema and initialization for NEXUS D2C PostgreSQL."""
import os
import psycopg2
from psycopg2.extras import execute_values

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@localhost:5432/nexus_d2c")

SCHEMA_SQL = """
-- Nike Products Catalog
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(64) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(64) NOT NULL DEFAULT 'Nike',
    category VARCHAR(64) NOT NULL DEFAULT 'Sportswear',
    listing_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount_pct INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
    reviews INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    photo_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Advertising Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    campaign_name VARCHAR(128) UNIQUE NOT NULL,
    platform VARCHAR(32) NOT NULL,
    product_id VARCHAR(64) REFERENCES products(product_id) ON DELETE CASCADE,
    product_name VARCHAR(255),
    daily_spend NUMERIC(12, 2) NOT NULL DEFAULT 0,
    daily_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
    daily_margin NUMERIC(12, 2) NOT NULL DEFAULT 0,
    roas NUMERIC(6, 2) NOT NULL DEFAULT 0,
    target_roas NUMERIC(6, 2) NOT NULL DEFAULT 3.20,
    breakeven_roas NUMERIC(6, 2) NOT NULL DEFAULT 1.80,
    health_score INTEGER NOT NULL DEFAULT 75,
    roas_status VARCHAR(32) NOT NULL DEFAULT 'PROFITABLE',
    inventory_units INTEGER NOT NULL DEFAULT 500,
    margin_pct NUMERIC(5, 2) NOT NULL DEFAULT 50.0,
    pacing_pct INTEGER NOT NULL DEFAULT 85,
    sparkline JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily Campaign Metrics (Historical 90-day time series)
CREATE TABLE IF NOT EXISTS campaign_daily_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    campaign_name VARCHAR(128) NOT NULL,
    platform VARCHAR(32) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    spend NUMERIC(12, 2) NOT NULL DEFAULT 0,
    impressions BIGINT NOT NULL DEFAULT 0,
    cpm NUMERIC(8, 2) NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
    margin NUMERIC(12, 2) NOT NULL DEFAULT 0,
    inventory INTEGER NOT NULL DEFAULT 0,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    roas NUMERIC(6, 2) NOT NULL DEFAULT 0,
    cvr NUMERIC(6, 4) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (metric_date, campaign_name)
);

-- Diagnostic Anomalies
CREATE TABLE IF NOT EXISTS anomalies (
    id VARCHAR(64) PRIMARY KEY,
    campaign_name VARCHAR(128) NOT NULL,
    platform VARCHAR(32) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    anomaly_date DATE NOT NULL,
    severity VARCHAR(32) NOT NULL,
    z_score NUMERIC(6, 2) NOT NULL,
    roas NUMERIC(6, 2) NOT NULL,
    spend NUMERIC(12, 2) NOT NULL,
    inventory INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Autonomous Budget Reallocations
CREATE TABLE IF NOT EXISTS reallocations (
    id VARCHAR(64) PRIMARY KEY,
    action_type VARCHAR(64) NOT NULL,
    source_campaign VARCHAR(128) NOT NULL,
    target_campaign VARCHAR(128) NOT NULL,
    current_spend NUMERIC(12, 2) NOT NULL,
    recommended_spend NUMERIC(12, 2) NOT NULL,
    delta_spend NUMERIC(12, 2) NOT NULL,
    expected_daily_margin NUMERIC(12, 2) NOT NULL,
    predicted_roas NUMERIC(6, 2) NOT NULL,
    confidence NUMERIC(4, 2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'READY_FOR_EXECUTION',
    stockout_kill BOOLEAN NOT NULL DEFAULT FALSE,
    executed_at TIMESTAMP WITH TIME ZONE
);

-- Closed-loop Decision Ledger
CREATE TABLE IF NOT EXISTS decision_ledger (
    id VARCHAR(64) PRIMARY KEY,
    decision_text TEXT NOT NULL,
    expected_margin NUMERIC(12, 2) NOT NULL,
    realized_margin NUMERIC(12, 2) NOT NULL,
    variance_pct NUMERIC(6, 2) NOT NULL,
    accuracy_pct NUMERIC(6, 2) NOT NULL,
    confidence NUMERIC(4, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'executed',
    feedback TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Visitor-Level Event Tracking & Customer Identity Layer
-- ============================================================================

-- Customers Catalog (Identified via SHA-256 hashed email, zero raw emails)
CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(64) PRIMARY KEY, -- SHA-256 hash of trim(lower(email))
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anonymous Visitors (UUID generated on first touch)
CREATE TABLE IF NOT EXISTS visitors (
    visitor_id VARCHAR(64) PRIMARY KEY,
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    first_touch_campaign VARCHAR(128),
    last_touch_campaign VARCHAR(128),
    first_touch_platform VARCHAR(32),
    last_touch_platform VARCHAR(32),
    consent_granted BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Identity Stitching Links (visitor_id -> customer_id mapping)
CREATE TABLE IF NOT EXISTS identity_links (
    id SERIAL PRIMARY KEY,
    visitor_id VARCHAR(64) NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    method VARCHAR(32) NOT NULL DEFAULT 'checkout', -- checkout, login, subscribe
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (visitor_id, customer_id)
);

-- Visitor Browsing Sessions (30-minute inactivity sliding window)
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    visitor_id VARCHAR(64) NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
    customer_id VARCHAR(64) REFERENCES customers(customer_id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    campaign_id VARCHAR(128),
    platform VARCHAR(32),
    click_id VARCHAR(128),
    utm_source VARCHAR(64),
    utm_medium VARCHAR(64),
    utm_campaign VARCHAR(128),
    utm_content VARCHAR(128),
    landing_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Orders Table (D2C store purchases)
CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(customer_id) ON DELETE SET NULL,
    visitor_id VARCHAR(64) REFERENCES visitors(visitor_id) ON DELETE SET NULL,
    session_id VARCHAR(64) REFERENCES sessions(session_id) ON DELETE SET NULL,
    product_id VARCHAR(64) REFERENCES products(product_id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(16) NOT NULL DEFAULT 'USD',
    status VARCHAR(32) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Visitor Events Stream (Idempotent, deduplicated on event_id)
CREATE TABLE IF NOT EXISTS events (
    event_id VARCHAR(64) PRIMARY KEY,
    visitor_id VARCHAR(64) NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    customer_id VARCHAR(64) REFERENCES customers(customer_id) ON DELETE SET NULL,
    event_type VARCHAR(32) NOT NULL, -- page_view, ad_click, product_view, add_to_cart, begin_checkout, purchase
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    product_id VARCHAR(64) REFERENCES products(product_id) ON DELETE SET NULL,
    value NUMERIC(12, 2),
    campaign_id VARCHAR(128),
    platform VARCHAR(32),
    click_id VARCHAR(128),
    utm_source VARCHAR(64),
    utm_medium VARCHAR(64),
    utm_campaign VARCHAR(128),
    utm_content VARCHAR(128),
    page_url TEXT,
    order_id VARCHAR(64) REFERENCES orders(order_id) ON DELETE SET NULL,
    is_server_side BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON campaign_daily_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_metrics_camp ON campaign_daily_metrics(campaign_name);
CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_campaign ON events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_events_product ON events(product_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_customer ON events(customer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor ON sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_identity_links_visitor ON identity_links(visitor_id);
CREATE INDEX IF NOT EXISTS idx_identity_links_customer ON identity_links(customer_id);
"""

def init_db(database_url: str = DATABASE_URL):
    conn = psycopg2.connect(database_url)
    with conn.cursor() as cur:
        cur.execute(SCHEMA_SQL)
    conn.commit()
    conn.close()
    print("Database schema initialized successfully.")

if __name__ == "__main__":
    init_db()
