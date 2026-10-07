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

-- AI Strategy Engine Campaigns
CREATE TABLE IF NOT EXISTS strategy_campaigns (
    id VARCHAR(64) PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    product_service VARCHAR(255) NOT NULL,
    target_audience TEXT NOT NULL,
    target_location VARCHAR(128) NOT NULL,
    industry_category VARCHAR(64) NOT NULL,
    total_budget NUMERIC(12, 2) NOT NULL,
    campaign_duration INTEGER NOT NULL,
    objective VARCHAR(32) NOT NULL,
    preferred_platforms JSONB DEFAULT '[]'::jsonb,
    product_id VARCHAR(64),
    product_price NUMERIC(10, 2),
    constraints JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Strategy Archetypes Generated (20-25 candidates)
CREATE TABLE IF NOT EXISTS campaign_strategies (
    strategy_id VARCHAR(64) PRIMARY KEY,
    campaign_id VARCHAR(64) REFERENCES strategy_campaigns(id) ON DELETE CASCADE,
    strategy_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    objective VARCHAR(64) NOT NULL,
    target_audience TEXT NOT NULL,
    audience_segment VARCHAR(128) NOT NULL,
    platform VARCHAR(32) NOT NULL,
    ad_format VARCHAR(64) NOT NULL,
    creative_angle VARCHAR(128) NOT NULL,
    messaging_angle TEXT NOT NULL,
    targeting_method VARCHAR(128) NOT NULL,
    budget_allocation NUMERIC(12, 2) NOT NULL,
    bidding_strategy VARCHAR(64) NOT NULL,
    campaign_duration INTEGER NOT NULL,
    funnel_stage VARCHAR(32) NOT NULL,
    geographic_targeting TEXT NOT NULL,
    demographic_targeting TEXT NOT NULL,
    retargeting_type VARCHAR(64),
    timing_strategy TEXT,
    offer_strategy TEXT,
    keyword_interest_targeting TEXT,
    advantages JSONB DEFAULT '[]'::jsonb,
    disadvantages JSONB DEFAULT '[]'::jsonb,
    assumptions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Evaluations & Predictive Modeling
CREATE TABLE IF NOT EXISTS strategy_evaluations (
    id SERIAL PRIMARY KEY,
    strategy_id VARCHAR(64) UNIQUE REFERENCES campaign_strategies(strategy_id) ON DELETE CASCADE,
    expected_ctr NUMERIC(6, 4) NOT NULL,
    expected_cpc NUMERIC(8, 2) NOT NULL,
    expected_cvr NUMERIC(6, 4) NOT NULL,
    expected_conversions INTEGER NOT NULL,
    expected_cpa NUMERIC(8, 2) NOT NULL,
    expected_revenue NUMERIC(12, 2) NOT NULL,
    expected_roas NUMERIC(6, 2) NOT NULL,
    risk_score INTEGER NOT NULL,
    confidence_score NUMERIC(4, 2) NOT NULL,
    audience_fit_score NUMERIC(4, 2) NOT NULL,
    overall_score NUMERIC(5, 2) NOT NULL,
    rank INTEGER NOT NULL,
    status VARCHAR(32) NOT NULL,
    classification VARCHAR(32) NOT NULL,
    confidence_level VARCHAR(32) NOT NULL,
    similar_campaigns_count INTEGER NOT NULL,
    historical_evidence_text TEXT,
    market_evidence_text TEXT,
    scoring_breakdown JSONB DEFAULT '{}'::jsonb,
    selection_reasons JSONB DEFAULT '[]'::jsonb,
    rejection_reasons JSONB DEFAULT '[]'::jsonb
);

-- Top 3 Recommendations and Best Choice
CREATE TABLE IF NOT EXISTS strategy_recommendations (
    campaign_id VARCHAR(64) PRIMARY KEY REFERENCES strategy_campaigns(id) ON DELETE CASCADE,
    best_strategy_id VARCHAR(64) REFERENCES campaign_strategies(strategy_id),
    top3_strategy_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    best_choice_explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
    top3_budget_allocation JSONB NOT NULL DEFAULT '{}'::jsonb,
    approved_by_user BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Historical Campaigns for Learning
CREATE TABLE IF NOT EXISTS historical_campaigns (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    platform VARCHAR(32) NOT NULL,
    objective VARCHAR(32) NOT NULL,
    audience TEXT NOT NULL,
    location VARCHAR(128) NOT NULL,
    age_group VARCHAR(32) NOT NULL,
    budget NUMERIC(12, 2) NOT NULL,
    spend NUMERIC(12, 2) NOT NULL,
    impressions BIGINT NOT NULL,
    reach BIGINT NOT NULL,
    frequency NUMERIC(5, 2) NOT NULL,
    clicks INTEGER NOT NULL,
    ctr NUMERIC(6, 4) NOT NULL,
    cpc NUMERIC(8, 2) NOT NULL,
    conversions INTEGER NOT NULL,
    conversion_rate NUMERIC(6, 4) NOT NULL,
    cpa NUMERIC(8, 2) NOT NULL,
    revenue NUMERIC(12, 2) NOT NULL,
    roas NUMERIC(6, 2) NOT NULL,
    creative_type VARCHAR(128) NOT NULL,
    creative_message TEXT NOT NULL,
    cta VARCHAR(64) NOT NULL,
    placement VARCHAR(128) NOT NULL,
    duration INTEGER NOT NULL,
    status VARCHAR(32) NOT NULL
);

-- Model Learning Ledger (Closed-Loop Updates)
CREATE TABLE IF NOT EXISTS model_learning_ledger (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(64) NOT NULL,
    strategy_id VARCHAR(64) NOT NULL,
    predicted_metrics JSONB NOT NULL,
    actual_metrics JSONB NOT NULL,
    error_deltas JSONB NOT NULL,
    weight_adjustments JSONB NOT NULL,
    learnings_derived JSONB NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON campaign_daily_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_metrics_camp ON campaign_daily_metrics(campaign_name);
CREATE INDEX IF NOT EXISTS idx_strat_camp ON campaign_strategies(campaign_id);
CREATE INDEX IF NOT EXISTS idx_strat_eval_rank ON strategy_evaluations(rank);
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
