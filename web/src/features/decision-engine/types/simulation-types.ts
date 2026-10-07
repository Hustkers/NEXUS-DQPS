export type ShockScenarioId = 'stockout' | 'cpm-spike' | 'creative-fatigue' | 'price-undercut';

export type SimulationHorizon = 1 | 7 | 30;

export interface ScenarioMeta {
  id: ShockScenarioId;
  title: string;
  tag: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  eventDescription: string;
  traditionalOutcome: string;
  autonomousAction: string;
  savedWasteWeekly: string;
  responseSpeed: string;
  affectedSku: string;
  affectedProductName: string;
  affectedPlatform: string;
}

export interface ScenarioInputParams {
  horizonDays: SimulationHorizon;
  
  // Stockout Specific
  inventoryUnits: number;
  inventoryShockUnits: number;
  baselineDailySpend: number;
  baselineCvrPct: number;
  aov: number;
  marginPct: number;
  
  // CPM Surge Specific
  baselineCpm: number;
  cpmMultiplier: number;
  ctrPct: number;
  
  // Creative Fatigue Specific
  fatiguePct: number;
  
  // Buy Box Undercut Specific
  ourPrice: number;
  competitorPrice: number;
  buyBoxProbabilityPct: number;
  competitorUndercutPct: number;

  // Custom Strategy Overrides
  customBudgetShiftPct?: number;
  customSpendReductionPct?: number;
  customPriceMatch?: number;
  customInventoryProtection?: boolean;
}

export interface StrategyOption {
  id: string;
  name: string;
  badge?: string;
  description: string;
  isRecommended?: boolean;
}

export interface MetricSnapshot {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roas: number;
  margin: number;
}

export interface FinancialImpactSummary {
  revenueLoss: number;
  marginLoss: number;
  wastedSpend: number;
  lossWithoutMitigation: number;
  lossWithMitigation: number;
  lossAvoided: number;
  protectedWasteWeekly: number;
  dailyLossRate: number;
}

export interface DailyLossPoint {
  day: number;
  label: string;
  noActionLoss: number;
  mitigatedLoss: number;
  baselineMargin: number;
  shockedMargin: number;
  mitigatedMargin: number;
}

export interface StrategyEvaluation {
  strategyId: string;
  strategyName: string;
  isRecommended: boolean;
  spend: number;
  revenue: number;
  margin: number;
  roas: number;
  financialLoss: number;
  lossAvoided: number;
  rationale: string;
}

export interface CausalNode {
  step: number;
  title: string;
  detail: string;
  metricChange: string;
  status: 'critical' | 'warning' | 'mitigated' | 'neutral';
}

export interface DataLineageInfo {
  datasetGrounding: string;
  scenarioName: string;
  sku: string;
  productName: string;
  baselineSpendDaily: number;
  shockMagnitude: string;
  selectedStrategy: string;
  horizonDays: number;
  formulaSummary: string;
}

export interface SimulationResult {
  scenarioId: ShockScenarioId;
  scenarioMeta: ScenarioMeta;
  inputs: ScenarioInputParams;
  activeStrategyId: string;
  activeStrategyName: string;
  isRecommended: boolean;
  horizonDays: SimulationHorizon;
  
  baseline: MetricSnapshot;
  shocked: MetricSnapshot;
  mitigated: MetricSnapshot;
  
  financialImpact: FinancialImpactSummary;
  timeSeries: DailyLossPoint[];
  strategyComparisons: StrategyEvaluation[];
  causalChain: CausalNode[];
  recommendation: {
    recommendedStrategyId: string;
    recommendedStrategyName: string;
    expectedLoss: number;
    expectedLossAvoided: number;
    expectedRoas: number;
    expectedMargin: number;
    reason: string;
  };
  dataLineage: DataLineageInfo;
}
