import type { ReallocationItem } from '../components/reallocation-feed';

export interface CampaignDataRef {
  campaign: string;
  platform: string;
  sku?: string;
  productName: string;
  photoUrl?: string;
  currentDailySpend: number;
  currentDailyRevenue: number;
  currentDailyMargin?: number;
  roas: number;
  targetRoas?: number;
  breakevenRoas?: number;
  healthScore?: number;
  inventory?: number;
  price?: number;
  marginPct?: number;
}

export interface ReallocationExecutionDetails {
  item: ReallocationItem;
  source: {
    campaign: string;
    productName: string;
    platform: string;
    photoUrl?: string;
    currentSpend: number;
    newSpend: number;
    deltaSpend: number;
    roas: number;
    inventory?: number;
  };
  destination: {
    campaign: string;
    productName: string;
    platform: string;
    photoUrl?: string;
    currentSpend: number;
    newSpend: number;
    deltaSpend: number;
    currentRoas: number;
    predictedRoas: number;
    roasDeltaPct: number;
    currentDailyRevenue: number;
    newDailyRevenue: number;
    revenueDelta: number;
    currentDailyMargin: number;
    expectedDailyMargin: number;
    marginLift: number;
    inventory?: number;
  };
  capitalMoved: number;
  expectedDailyLift: number;
  predictedRoas: number;
  confidencePct: number;
  reason: string;
  whyBetter: {
    sourceRoas: number;
    destinationRoas: number;
    roasDifference: number;
    liftPerRupee: number;
    liftPerDollar?: number;
    summary: string;
  };
  // Before / After metric comparisons
  metricsComparison: Array<{
    key: string;
    label: string;
    beforeFormatted: string;
    afterFormatted: string;
    changeFormatted: string;
    pctChangeFormatted: string;
    isPositive: boolean;
    beforeValue: number;
    afterValue: number;
  }>;
  // Chart dataset for Recharts
  chartData: Array<{
    metric: string;
    Before: number;
    After: number;
    unit: string;
  }>;
  // Allocation split data
  allocation: {
    sourceLabel: string;
    destLabel: string;
    sourceBefore: number;
    sourceAfter: number;
    destBefore: number;
    destAfter: number;
    sourceShareBeforePct: number;
    sourceShareAfterPct: number;
    destShareBeforePct: number;
    destShareAfterPct: number;
  };
  ledgerRecord: {
    id: string;
    timestamp: string;
    statusText: string;
  };
  anomaly?: {
    id: string;
    campaign: string;
    productName?: string;
    severity: string;
    zScore: number;
    rootCause: string;
    explanation: string;
  };
  recommendedAction?: string;
}
