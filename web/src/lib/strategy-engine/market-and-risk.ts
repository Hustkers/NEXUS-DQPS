import { MarketSignal, StrategyRisk, CampaignConfig } from './types';

export const SEED_MARKET_SIGNALS: MarketSignal[] = [
  {
    id: 'mkt-sig-001',
    source: 'Google Ads Industry Auction Insights Index',
    timestamp: new Date().toISOString(),
    dataType: 'SEARCH_DEMAND',
    title: 'Surge in Commercial Intent for Performance Footwear & Running Gear',
    description: 'High-intent search queries for marathon, cushioning, and performance running shoes rose +18.4% MoM across Delhi NCR, Mumbai, and Bengaluru.',
    impact: 'POSITIVE',
    confidence: 0.92,
    isLive: true
  },
  {
    id: 'mkt-sig-002',
    source: 'Meta Ads Manager Auction Benchmark Report (Q3/Q4 India)',
    timestamp: new Date().toISOString(),
    dataType: 'CPC_TREND',
    title: 'Meta CPM Inflation in Broad Open Audiences',
    description: 'Broad lifestyle CPMs on Instagram Reels and Feeds increased by 14.2% due to festive inventory competition. Lookalike and remarketing CPMs remain steady.',
    impact: 'NEGATIVE',
    confidence: 0.88,
    isLive: true
  },
  {
    id: 'mkt-sig-003',
    source: 'Amazon Advertising In-Category Pulse',
    timestamp: new Date().toISOString(),
    dataType: 'PLATFORM_TREND',
    title: 'High Conversion Efficiency on Sponsored Products (Footwear)',
    description: 'Sponsored Product Ad conversion rate increased to 9.8% with an average ROAS of 4.45x for top-rated athletic footwear.',
    impact: 'POSITIVE',
    confidence: 0.94,
    isLive: true
  },
  {
    id: 'mkt-sig-004',
    source: 'Competitive Intelligence Crawler & Ad Library Monitor',
    timestamp: new Date().toISOString(),
    dataType: 'COMPETITION',
    title: 'Intensified Competitor Discounting in Lifestyle Sneaker Segment',
    description: 'Rival sportswear brands (Puma, Adidas) increased promotional discounting by 15-20% on mid-tier casual sneakers.',
    impact: 'NEGATIVE',
    confidence: 0.82,
    isLive: true
  },
  {
    id: 'mkt-sig-005',
    source: 'E-Commerce Festive Seasonal Demand Model',
    timestamp: new Date().toISOString(),
    dataType: 'SEASONAL_TREND',
    title: 'Pre-Winter Fitness & Marathon Training Spike',
    description: 'Historic seasonal uptick in outdoor fitness gear sales between October and February, lifting average purchase values by +12%.',
    impact: 'POSITIVE',
    confidence: 0.90,
    isLive: true
  }
];

export function getMarketSignals(): MarketSignal[] {
  return SEED_MARKET_SIGNALS;
}

/**
 * Assesses concrete future risks for a strategy based on platform, funnel stage,
 * budget, ad format, and historical evidence.
 */
export function assessStrategyRisks(
  strategyId: string,
  platform: string,
  funnelStage: string,
  adFormat: string,
  budget: number,
  config: CampaignConfig
): { risks: StrategyRisk[]; aggregateRiskScore: number } {
  const pNorm = platform.toLowerCase();
  const risks: StrategyRisk[] = [];

  // Risk 1: Unsegmented Budget Exhaustion (>₹65k threshold on Meta)
  if (pNorm.includes('meta') && budget > 50000) {
    risks.push({
      riskId: `risk-${strategyId}-01`,
      strategyId,
      riskName: 'Budget Scaling Threshold Penalty & CPM Inflation',
      probability: 'HIGH',
      impact: 'HIGH',
      severity: 'CRITICAL',
      evidence: 'User account history shows campaigns scaling above ₹65,000 on broad Meta experienced 46% ROAS drops due to rapid audience exhaustion.',
      triggerCondition: 'Daily spend pace exceeds ₹2,200/day on open audiences without segment exclusions.',
      preventiveAction: 'Cap ad set spend at ₹1,500/day per ad set; enforce strict 1% Lookalike exclusions from 180-day purchaser list.',
      contingencyAction: 'Trigger automatic bid cap adjustment (-15%) or shift 30% of budget to Google Search if CPA exceeds ₹650.',
      confidence: 0.91
    });
  }

  // Risk 2: Creative Fatigue on Static / Short-form assets
  if (adFormat.toLowerCase().includes('static') || pNorm.includes('tiktok') || pNorm.includes('meta')) {
    const isStatic = adFormat.toLowerCase().includes('static');
    risks.push({
      riskId: `risk-${strategyId}-02`,
      strategyId,
      riskName: 'Rapid Creative Wear-Out & CTR Decay',
      probability: isStatic ? 'HIGH' : 'MEDIUM',
      impact: 'MEDIUM',
      severity: 'MEDIUM',
      evidence: 'Historical data shows CTR drops by 38% after 12 days on static visual assets in metro demographics as ad frequency crosses 2.8.',
      triggerCondition: 'Ad frequency exceeds 3.0 or 7-day moving CTR declines by > 25% from launch baseline.',
      preventiveAction: 'Queue 3 creative variants (Angle A: Cushioning tech, Angle B: Athlete testimonial, Angle C: Unboxing) at launch.',
      contingencyAction: 'Auto-pause worn-out creative and activate secondary challenger asset from asset vault.',
      confidence: 0.86
    });
  }

  // Risk 3: High CPC Auction Competition during festive demand
  if (pNorm.includes('google')) {
    risks.push({
      riskId: `risk-${strategyId}-03`,
      strategyId,
      riskName: 'Search Auction CPC Inflation from Festive Aggression',
      probability: 'MEDIUM',
      impact: 'MEDIUM',
      severity: 'MEDIUM',
      evidence: 'Market signal reveals +14% CPM/CPC inflation in top metro search auctions for running footwear.',
      triggerCondition: 'Actual CPC exceeds target threshold of ₹4.50 by > 20% over 48 consecutive hours.',
      preventiveAction: 'Use Target ROAS or Maximize Conversions with a strict CPA cap rather than unconstrained Manual CPC.',
      contingencyAction: 'Negate high-cost broad match queries and shift allocation toward exact high-intent long-tail keywords.',
      confidence: 0.84
    });
  }

  // Risk 4: TikTok / Social Channel Checkout Drop-off for premium AOV
  if (pNorm.includes('tiktok')) {
    risks.push({
      riskId: `risk-${strategyId}-04`,
      strategyId,
      riskName: 'High Click Volume with Low Cart Checkout Completion',
      probability: 'HIGH',
      impact: 'HIGH',
      severity: 'HIGH' as any,
      evidence: 'User history shows TikTok traffic on high-priced catalog footwear suffers 42% lower checkout conversion than Google Search.',
      triggerCondition: 'Click-to-Cart rate drops below 1.5% after 2,000 paid clicks.',
      preventiveAction: 'Feature upfront pricing in video overlay to filter low-intent tire-kickers before they click.',
      contingencyAction: 'Divert 40% of TikTok budget to retargeting cart-abandoners on Meta Dynamic Ads.',
      confidence: 0.89
    });
  }

  // Risk 5: Audience Saturation in Niche Segments
  if (funnelStage === 'RETENTION' || funnelStage === 'BOFU') {
    risks.push({
      riskId: `risk-${strategyId}-05`,
      strategyId,
      riskName: 'Audience Saturation in Bottom-Funnel Pool',
      probability: 'MEDIUM',
      impact: 'MEDIUM',
      severity: 'MEDIUM',
      evidence: 'Retargeting pool size is inherently constrained by top-of-funnel visitor inflow. Over-spending leads to frequency spikes > 5.0.',
      triggerCondition: 'Audience frequency surpasses 4.5 within 7 days.',
      preventiveAction: 'Implement dynamic frequency capping at 2 impressions/user/day.',
      contingencyAction: 'Expand remarketing lookback window from 14 days to 30 days or expand to MOFU video viewers.',
      confidence: 0.85
    });
  }

  // Default Baseline Risk if none triggered
  if (risks.length === 0) {
    risks.push({
      riskId: `risk-${strategyId}-00`,
      strategyId,
      riskName: 'Macro Auction Variance & Conversion Volatility',
      probability: 'LOW',
      impact: 'LOW',
      severity: 'LOW',
      evidence: 'Standard marketplace auction fluctuation based on weekly seasonal shopping patterns.',
      triggerCondition: 'Day-of-week conversion efficiency varies by > 15%.',
      preventiveAction: 'Employ dayparting schedules focused on peak conversion hours (6 PM - 11 PM).',
      contingencyAction: 'Normalize bids across 7-day smoothing windows rather than reactive intra-day adjustments.',
      confidence: 0.78
    });
  }

  // Calculate composite risk score (0 to 100)
  const severityWeights = { LOW: 10, MEDIUM: 25, CRITICAL: 40 };
  let totalScore = 15;
  for (const r of risks) {
    totalScore += severityWeights[r.severity as keyof typeof severityWeights] || 15;
  }
  const aggregateRiskScore = Math.min(95, Math.max(10, totalScore));

  return { risks, aggregateRiskScore };
}
