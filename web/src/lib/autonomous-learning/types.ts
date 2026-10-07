export type PlatformId = 'google' | 'meta' | 'tiktok' | 'amazon';

export type CreativeFormat = 'static' | 'ugc' | 'video' | 'carousel';
export type AudienceType = 'broad' | 'lookalike' | 'retargeting';
export type PlacementType = 'feed' | 'reels' | 'stories' | 'search';
export type BidStrategyType = 'conservative' | 'balanced' | 'aggressive';

export interface CampaignStrategyConfig {
  creativeFormat: CreativeFormat;
  audienceType: AudienceType;
  placement: PlacementType;
  bidStrategy: BidStrategyType;
}

export interface CampaignLearningProfile {
  id: string;
  name: string;
  platform: PlatformId;
  sku: string;
  productName: string;
  category: string;
  currentBudget: number;
  recommendedBudget: number;
  deltaBudget: number;
  baseCpc: number;
  baseCtr: number;
  baseCvr: number;
  aov: number;
  grossMarginPct: number;
  inventoryUnits: number;
  daysOfInventory: number;
  reorderPoint: number;
  isConstrained: boolean;
  currentStrategy: CampaignStrategyConfig;
  recommendedStrategy: CampaignStrategyConfig;
  
  // Mathematical Hill saturation parameters: r(s) = a * s^b / (c + s^b)
  hillA: number; // max achievable revenue scale
  hillB: number; // slope / elasticity
  hillC: number; // half-saturation spend threshold

  // Evaluated performance
  currentRevenue: number;
  currentProfit: number;
  currentProfitRoas: number;
  expectedRevenue: number;
  expectedProfit: number;
  expectedProfitRoas: number;
  marginalProfitRoas: number; // dProfit / dSpend for the next ₹1,000
  trendPct: number;
  confidenceScore: number; // 0.0 to 1.0
  historicalEfficiencyIndex: number;
  strategyRationale: string;
}

export interface WhatIfScenarioInputs {
  totalBudget: number; // Default: 1000000 (₹10,00,000)
  cpcShiftPct: number; // -40 to +80%
  cvrShiftPct: number; // -50 to +50%
  aovShiftPct: number; // -30 to +30%
  grossMarginShiftPct: number; // -20 to +20%
  inventoryShockPct: number; // -100 to +50%
  creativeFatigueDays: number; // 0 to 30 days
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  explorationBudgetPct: number; // 5 to 25%
}

export interface ChannelAllocationSummary {
  platform: PlatformId;
  displayName: string;
  color: string;
  currentSpend: number;
  recommendedSpend: number;
  deltaSpend: number;
  currentSharePct: number;
  recommendedSharePct: number;
  currentProfit: number;
  expectedProfit: number;
  marginalReturn: number;
  campaignsCount: number;
}

export interface OptimizationResult {
  inputs: WhatIfScenarioInputs;
  totalCurrentBudget: number;
  totalRecommendedBudget: number;
  totalCurrentRevenue: number;
  totalExpectedRevenue: number;
  totalCurrentProfit: number;
  totalExpectedProfit: number;
  profitImprovementPct: number;
  profitImprovementAmount: number;
  currentBlendedProfitRoas: number;
  expectedBlendedProfitRoas: number;
  channels: ChannelAllocationSummary[];
  campaigns: CampaignLearningProfile[];
  topGainers: CampaignLearningProfile[];
  topDecliners: CampaignLearningProfile[];
  modelAccuracyPct: number;
  confidenceRating: number;
  validationDecision: {
    status: 'PASSED' | 'WARNING' | 'CRITICAL';
    stressTestResult: string;
    redTeamChallenge: string;
    safeguardsApplied: string[];
  };
}

export interface ResponseCurvePoint {
  spend: number;
  spendLabel: string;
  revenue: number;
  profit: number;
  profitRoas: number;
  marginalProfit: number;
  isCurrent: boolean;
  isOptimal: boolean;
  zone: 'UNDER_INVESTED' | 'OPTIMAL' | 'DIMINISHING';
}

export interface LearningHistoryRecord {
  week: string;
  cycleId: string;
  predictedProfit: number;
  actualProfit: number;
  predictedRevenue: number;
  actualRevenue: number;
  accuracyPct: number;
  errorPct: number;
  keyLearning: string;
}

export interface ModelInsight {
  id: string;
  type: 'CREATIVE' | 'INVENTORY' | 'SATURATION' | 'PLATFORM' | 'AUDIENCE';
  headline: string;
  detail: string;
  metricImpact: string;
  confidence: number;
}
