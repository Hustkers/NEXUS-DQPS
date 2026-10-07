export interface CandidateAdConfig {
  rank: number;
  config_id: string;
  title: string;
  platform: 'meta' | 'google' | 'amazon' | 'tiktok';
  objective: string;
  audience_segment: string;
  bidding_strategy: string;
  daily_budget: number;
  duration_days: number;
  expected_spend: number;
  predicted_impressions: number;
  predicted_clicks: number;
  predicted_cpc: number;
  predicted_cpm: number;
  predicted_conversions: number;
  predicted_cvr: number; // percentage (e.g. 3.4%)
  predicted_revenue: number;
  predicted_gross_margin: number;
  predicted_net_profit: number;
  predicted_roas: number;
  confidence_score: number; // 0.0 - 1.0
  is_recommended: boolean;
  stockout_risk: boolean;
  explanation: string;
  key_drivers: string[];
}

export interface PlaygroundProductSummary {
  sku: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  photoUrl: string;
  inventory: number;
  hasHistoricalData: boolean;
  historicalRoas: number;
  grossMarginPct: number;
}

export interface AdPlaygroundConstraints {
  sku: string;
  total_budget: number;
  duration_days: number;
  target_roas_floor: number;
  platforms?: string[];
  strategy_focus: 'MAX_PROFIT' | 'BALANCED' | 'SCALE_VOLUME';
}

export interface AdPlaygroundResult {
  sku: string;
  product_name: string;
  category: string;
  price: number;
  gross_margin_pct: number;
  inventory: number;
  photo_url: string;
  total_budget_constraint: number;
  duration_days: number;
  candidates: CandidateAdConfig[];
  baseline_historical_roas: number;
  baseline_historical_daily_spend: number;
  best_config_id: string;
  profit_lift_over_baseline: number;
  data_quality_warning?: string;
}
