export interface ScoringWeights {
  roasWeight: number;
  cpaEfficiencyWeight: number;
  conversionVolumeWeight: number;
  audienceFitWeight: number;
  confidenceWeight: number;
  riskPenaltyWeight: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  roasWeight: 0.35,
  cpaEfficiencyWeight: 0.20,
  conversionVolumeWeight: 0.15,
  audienceFitWeight: 0.15,
  confidenceWeight: 0.10,
  riskPenaltyWeight: 0.05
};

export interface CampaignConfig {
  campaignId: string;
  campaignName: string;
  productService: string;
  targetAudience: string;
  targetLocation: string;
  industryCategory: string;
  totalBudget: number;
  campaignDuration: number; // days
  objective: 'CONVERSIONS' | 'ROAS' | 'AWARENESS' | 'TRAFFIC' | 'LEADS';
  preferredPlatforms: string[];
  productId?: string;
  productPrice?: number;
  historicalData?: {
    pastRoas?: number;
    pastCtr?: number;
    pastCpc?: number;
    pastConversions?: number;
  };
  constraints?: {
    targetRoas?: number;
    maxCpa?: number;
    minSpendPerPlatform?: number;
  };
}

export type StrategyClassification = 'PROVEN' | 'PROMISING' | 'EXPERIMENTAL';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA';

export interface StrategyRisk {
  riskId: string;
  strategyId: string;
  riskName: string;
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
  evidence: string;
  triggerCondition: string;
  preventiveAction: string;
  contingencyAction: string;
  confidence: number; // 0 to 1
}

export interface RevenueForecast {
  conservative: { revenue: number; roas: number; conversions: number; cpa: number };
  expected: { revenue: number; roas: number; conversions: number; cpa: number };
  optimistic: { revenue: number; roas: number; conversions: number; cpa: number };
  explanation: string;
  isMissingInput?: boolean;
  missingInputNote?: string;
}

export interface CreativeRecommendation {
  adFormat: string;
  creativeAngle: string;
  headlineDirection: string;
  primaryMessage: string;
  cta: string;
  visualConcept: string;
  videoConcept?: string;
  historicalBasis: string;
}

export interface AudienceRecommendation {
  ageRange: string;
  locations: string[];
  interests: string[];
  behaviors: string[];
  retargetingSegments: string[];
  lookalikeSegments: string[];
  highIntentSegments: string[];
  rationale: string;
}

export interface StrategyEvaluation {
  expectedCtr: number;
  expectedCpc: number;
  expectedConversionRate: number;
  expectedConversions: number;
  expectedCpa: number;
  expectedRevenue: number;
  expectedRoas: number;
  riskScore: number; // 0 to 100
  confidenceScore: number; // 0.0 to 1.0
  audienceFitScore: number; // 0.0 to 1.0
  overallScore: number; // 0 to 100
  rank: number;
  status: 'SELECTED' | 'NOT SELECTED';
  classification: StrategyClassification;
  confidenceLevel: ConfidenceLevel;
  similarCampaignsCount: number;
  historicalEvidenceText: string;
  marketEvidenceText: string;
  scoringBreakdown: {
    roasContribution: number;
    cpaEfficiencyContribution: number;
    volumeContribution: number;
    audienceFitContribution: number;
    confidenceContribution: number;
    riskSafetyContribution: number;
    targetRoasAnchor: number;
    aovAnchor: number;
  };
  modelMetadata: {
    isModelEstimate: boolean;
    modelBasis: string;
    historicalCalibrated: boolean;
    currency: 'INR' | 'USD';
  };
  selectionReasons: string[];
  rejectionReasons: string[];
}

export interface CampaignStrategy {
  strategyId: string;
  campaignId: string;
  strategyName: string;
  description: string;
  objective: string;
  targetAudience: string;
  audienceSegment: string;
  platform: string;
  adFormat: string;
  creativeAngle: string;
  messagingAngle: string;
  targetingMethod: string;
  budgetAllocation: number;
  biddingStrategy: string;
  campaignDuration: number;
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU' | 'RETENTION';
  geographicTargeting: string;
  demographicTargeting: string;
  retargetingType: string;
  timingStrategy: string;
  offerStrategy: string;
  keywordInterestTargeting: string;
  advantages: string[];
  disadvantages: string[];
  assumptions: string[];
  evaluation?: StrategyEvaluation;
  risks?: StrategyRisk[];
  forecast?: RevenueForecast;
  creativeRecommendation?: CreativeRecommendation;
  audienceRecommendation?: AudienceRecommendation;
}

export interface BestChoiceExplanation {
  strategyId: string;
  strategyName: string;
  recommendationScore: number;
  predictedRoas: number;
  predictedRevenue: number;
  predictedConversions: number;
  predictedCpa: number;
  riskScore: number;
  confidencePct: number;
  classification: StrategyClassification;
  answers: {
    whatAreWeRecommending: string;
    whyAreWeRecommendingIt: string;
    whatHappenedHistorically: string;
    whatDoesCurrentMarketDataIndicate: string;
    whatDoWePredictWillHappen: string;
    howConfidentAreWe: string;
    whatCouldGoWrong: string;
    howCanUserPreventIt: string;
  };
}

export interface Top3BudgetAllocation {
  totalBudget: number;
  strategy1: { strategyId: string; strategyName: string; budget: number; percentage: number };
  strategy2: { strategyId: string; strategyName: string; budget: number; percentage: number };
  strategy3: { strategyId: string; strategyName: string; budget: number; percentage: number };
  testingReserve: { budget: number; percentage: number; purpose: string };
  allocationRationale: string;
}

export interface HistoricalCampaign {
  id: string;
  name: string;
  date: string;
  platform: 'google' | 'meta' | 'amazon' | 'tiktok';
  objective: string;
  audience: string;
  location: string;
  ageGroup: string;
  budget: number;
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  conversionRate: number;
  cpa: number;
  revenue: number;
  roas: number;
  creativeType: string;
  creativeMessage: string;
  cta: string;
  placement: string;
  duration: number;
  status: 'COMPLETED' | 'ACTIVE' | 'TERMINATED';
}

export interface WinningPattern {
  id: string;
  platform: string;
  audience: string;
  location: string;
  objective: string;
  creativeFormat: string;
  budgetRange: string;
  historicalCampaignsCount: number;
  averageRoas: number;
  averageCpa: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceSummary: string;
}

export interface FailurePattern {
  id: string;
  platform: string;
  audience: string;
  budgetThreshold: number;
  historicalCampaignsCount: number;
  averageRoas: number;
  averageCpa: number;
  detectedIssue: string;
  structuredReasons: string[];
  advice: string;
}

export interface HistoricalPerformanceSummary {
  bestPlatform: string;
  bestAudience: string;
  bestObjective: string;
  averageRoas: number;
  averageCpa: number;
  bestCreative: string;
  bestLocation: string;
  bestBudgetRange: string;
  totalCampaignsAnalyzed: number;
  totalSpend: number;
  totalRevenue: number;
  winningPatterns: WinningPattern[];
  failurePatterns: FailurePattern[];
}

export interface MarketSignal {
  id: string;
  source: string;
  timestamp: string;
  dataType: 'INDUSTRY_TREND' | 'SEARCH_DEMAND' | 'COMPETITION' | 'CPC_TREND' | 'SEASONAL_TREND' | 'PLATFORM_TREND';
  title: string;
  description: string;
  impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  confidence: number;
  isLive: boolean;
}

export interface LiveCampaignProblemAlert {
  id: string;
  type: 'ROAS_DECLINE' | 'CPA_INCREASE' | 'CPC_INCREASE' | 'CTR_DECLINE' | 'AUDIENCE_SATURATION' | 'CREATIVE_FATIGUE' | 'BUDGET_INEFFICIENCY';
  title: string;
  evidence: string;
  possibleCause: string;
  recommendedAction: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
}

export interface LiveCampaignMonitoring {
  campaignId: string;
  campaignName: string;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED';
  spend: number;
  budget: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  conversionRate: number;
  cpa: number;
  revenue: number;
  roas: number;
  predictedRoas: number;
  predictionErrorPct: number;
  healthScore: number; // 0 to 100
  healthComponents: {
    roasScore: number;
    ctrScore: number;
    cpaScore: number;
    cvrScore: number;
    scalingScore: number;
    riskPenalty: number;
  };
  problems: LiveCampaignProblemAlert[];
  creativeFatigue: {
    week1Ctr: number;
    week2Ctr: number;
    week3Ctr: number;
    trend: string;
    isFatigued: boolean;
    recommendation: string;
  };
  audienceSaturation: {
    frequency: number;
    ctrDeltaPct: number;
    cpaDeltaPct: number;
    isSaturated: boolean;
    recommendation: string;
  };
  funnelAnalysis: {
    adImpressions: number;
    clicks: number;
    landingPageSessions: number;
    cartAdditions: number;
    purchases: number;
    adCtr: number;
    clickToSessionRate: number;
    sessionToCartRate: number;
    cartToPurchaseRate: number;
    bottleneckStage?: string;
    bottleneckEvidence?: string;
  };
}

export interface CompletedCampaignResult {
  campaignId: string;
  campaignName: string;
  launchDate: string;
  completionDate: string;
  totalBudget: number;
  recommendedStrategyId: string;
  recommendedStrategyName: string;
  actualBestStrategyName: string;
  predicted: {
    ctr: number;
    cpc: number;
    cvr: number;
    conversions: number;
    cpa: number;
    revenue: number;
    roas: number;
  };
  actual: {
    ctr: number;
    cpc: number;
    cvr: number;
    conversions: number;
    cpa: number;
    revenue: number;
    roas: number;
  };
  errorPct: {
    roasError: number;
    revenueError: number;
    cpaError: number;
    ctrError: number;
  };
  accuracyPct: number;
  outcome: 'EXCEEDED' | 'MET' | 'UNDERPERFORMED';
  learningsDerived: string[];
}

export interface StrategyComparisonResult {
  campaignId: string;
  comparedCount: number;
  strategies: Array<{
    strategyId: string;
    strategyName: string;
    platform: string;
    funnelStage: string;
    audience: string;
    audienceSegment: string;
    budget: number;
    expectedRevenue: number;
    expectedRoas: number;
    expectedConversions: number;
    expectedCpa: number;
    expectedCtr: number;
    expectedCpc: number;
    riskScore: number;
    confidenceScore: number;
    overallScore: number;
    status: string;
    classification: StrategyClassification;
    advantages: string[];
    disadvantages: string[];
    assumptions: string[];
  }>;
  highlights: {
    highestRoas: { strategyId: string; strategyName: string; value: string };
    lowestCpa: { strategyId: string; strategyName: string; value: string };
    highestRevenue: { strategyId: string; strategyName: string; value: string };
    lowestRisk: { strategyId: string; strategyName: string; value: string };
  };
}

export interface CampaignRecord {
  config: CampaignConfig;
  strategies: CampaignStrategy[];
  top3: CampaignStrategy[];
  bestChoice: BestChoiceExplanation;
  top3BudgetAllocation: Top3BudgetAllocation;
  historicalSummary: HistoricalPerformanceSummary;
  marketSignals: MarketSignal[];
  liveMonitoring?: LiveCampaignMonitoring;
  completedHistory?: CompletedCampaignResult[];
  createdAt: string;
}
