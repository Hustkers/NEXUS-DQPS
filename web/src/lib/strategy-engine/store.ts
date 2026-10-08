import {
  CampaignConfig,
  CampaignRecord,
  CampaignStrategy,
  LiveCampaignMonitoring,
  CompletedCampaignResult
} from './types';
import { generateStrategies } from './generator';
import { rankAndEvaluateAll } from './ranker';
import { computeHistoricalSummary, SEED_COMPLETED_CAMPAIGNS } from './historical-engine';
import { getMarketSignals } from './market-and-risk';
import { query } from '@/lib/db';

export function generateDefaultLiveMonitoring(
  campaignId: string,
  campaignName: string,
  totalBudget: number
): LiveCampaignMonitoring {
  const currentSpend = Math.round(totalBudget * 0.32);
  const clicks = Math.round(currentSpend / 2.15);
  const conversions = Math.max(1, Math.round(clicks * 0.0333));
  const revenue = Math.round(conversions * 120.00);
  const roas = +(revenue / currentSpend).toFixed(2);
  const cpa = +(currentSpend / conversions).toFixed(2);

  return {
    campaignId,
    campaignName,
    status: 'RUNNING',
    spend: currentSpend,
    budget: totalBudget,
    impressions: 112500,
    reach: 78400,
    frequency: 1.43,
    clicks,
    ctr: 0.0348,
    cpc: 2.15,
    conversions,
    conversionRate: 0.0333,
    cpa,
    revenue,
    roas,
    predictedRoas: 3.82,
    predictionErrorPct: +(((roas - 3.82) / 3.82) * 100).toFixed(1),
    healthScore: 88,
    healthComponents: {
      roasScore: 92,
      ctrScore: 89,
      cpaScore: 86,
      cvrScore: 88,
      scalingScore: 84,
      riskPenalty: 4
    },
    problems: [
      {
        id: 'prob-01',
        type: 'CPC_INCREASE',
        title: 'Auction CPC Elevation in US Tier-1 Search Markets',
        evidence: 'Average CPC rose from $1.85 to $2.32 over the past 48 hours as weekend search volume surged.',
        possibleCause: 'Holiday promotional bidding competition from competing sportswear aggregators.',
        recommendedAction: 'Enforce target CPA ceiling cap of $42.00 or shift 15% budget toward exact match brand search.',
        severity: 'WARNING'
      }
    ],
    creativeFatigue: {
      week1Ctr: 0.038,
      week2Ctr: 0.034,
      week3Ctr: 0.031,
      trend: 'Normal wear-out curve (-11% CTR decay over 14 days)',
      isFatigued: false,
      recommendation: 'Creative performance is within healthy tolerances. Stage secondary dynamic carousel asset for day 18 rotation.'
    },
    audienceSaturation: {
      frequency: 1.76,
      ctrDeltaPct: -4.8,
      cpaDeltaPct: +3.2,
      isSaturated: false,
      recommendation: 'Audience capacity in US Tier-1 Metros remains highly responsive. Pacing remains stable.'
    },
    funnelAnalysis: {
      adImpressions: 112500,
      clicks,
      landingPageSessions: Math.round(clicks * 0.88),
      cartAdditions: Math.round(clicks * 0.125),
      purchases: conversions,
      adCtr: 0.0348,
      clickToSessionRate: 0.88,
      sessionToCartRate: 0.125,
      cartToPurchaseRate: 0.312,
      bottleneckStage: 'Session-to-Cart Transition',
      bottleneckEvidence: 'Mobile visitors on Safari experience 18% higher cart abandonment than Android Chrome users.'
    }
  };
}

export { SEED_COMPLETED_CAMPAIGNS };

// Global in-memory cache
const memoryStore = new Map<string, CampaignRecord>();

// Pre-seed an initial default campaign for instant demonstration
function seedInitialCampaign(): CampaignRecord {
  const defaultId = 'cmp-nike-pegasus-q4';
  const config: CampaignConfig = {
    campaignId: defaultId,
    campaignName: 'Nike Air Zoom Pegasus 36 Scale',
    productService: 'Nike Air Zoom Pegasus 36',
    targetAudience: 'Marathon runners, daily joggers, urban fitness enthusiasts aged 20-45',
    targetLocation: 'United States (Tier 1 Metros: New York, Los Angeles, Chicago, San Francisco, Seattle)',
    industryCategory: 'Athletic Footwear & Performance Apparel',
    totalBudget: 50000,
    campaignDuration: 30,
    objective: 'CONVERSIONS',
    preferredPlatforms: ['meta', 'google', 'amazon', 'tiktok'],
    productId: 'AO2924-401',
    productPrice: 120.00,
    historicalData: {
      pastRoas: 3.42,
      pastCtr: 0.024,
      pastCpc: 2.15,
      pastConversions: 420
    },
    constraints: {
      targetRoas: 3.20,
      maxCpa: 42.00
    }
  };

  const rawStrategies = generateStrategies(config);
  const { ranked, top3, bestChoice, top3BudgetAllocation } = rankAndEvaluateAll(rawStrategies, config);
  const historicalSummary = computeHistoricalSummary();
  const marketSignals = getMarketSignals();
  const liveMonitoring = generateDefaultLiveMonitoring(defaultId, config.campaignName, config.totalBudget);

  const record: CampaignRecord = {
    config,
    strategies: ranked,
    top3,
    bestChoice,
    top3BudgetAllocation,
    historicalSummary,
    marketSignals,
    liveMonitoring,
    completedHistory: SEED_COMPLETED_CAMPAIGNS,
    createdAt: new Date().toISOString()
  };

  memoryStore.set(defaultId, record);
  return record;
}

// Initialize seed
seedInitialCampaign();

export async function saveCampaignRecord(record: CampaignRecord): Promise<void> {
  memoryStore.set(record.config.campaignId, record);

  // Attempt database sync if PostgreSQL is reachable
  try {
    const cfg = record.config;
    await query(
      `INSERT INTO strategy_campaigns (
        id, campaign_name, product_service, target_audience, target_location,
        industry_category, total_budget, campaign_duration, objective,
        preferred_platforms, product_id, product_price, constraints, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        campaign_name = EXCLUDED.campaign_name,
        total_budget = EXCLUDED.total_budget`,
      [
        cfg.campaignId,
        cfg.campaignName,
        cfg.productService,
        cfg.targetAudience,
        cfg.targetLocation,
        cfg.industryCategory,
        cfg.totalBudget,
        cfg.campaignDuration,
        cfg.objective,
        JSON.stringify(cfg.preferredPlatforms),
        cfg.productId || null,
        cfg.productPrice || null,
        JSON.stringify(cfg.constraints || {})
      ]
    );

    // Sync strategies
    for (const strat of record.strategies) {
      await query(
        `INSERT INTO campaign_strategies (
          strategy_id, campaign_id, strategy_name, description, objective, target_audience,
          audience_segment, platform, ad_format, creative_angle, messaging_angle,
          targeting_method, budget_allocation, bidding_strategy, campaign_duration,
          funnel_stage, geographic_targeting, demographic_targeting, retargeting_type,
          timing_strategy, offer_strategy, keyword_interest_targeting, advantages,
          disadvantages, assumptions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        ON CONFLICT (strategy_id) DO UPDATE SET
          strategy_name = EXCLUDED.strategy_name,
          budget_allocation = EXCLUDED.budget_allocation`,
        [
          strat.strategyId,
          strat.campaignId,
          strat.strategyName,
          strat.description,
          strat.objective,
          strat.targetAudience,
          strat.audienceSegment,
          strat.platform,
          strat.adFormat,
          strat.creativeAngle,
          strat.messagingAngle,
          strat.targetingMethod,
          strat.budgetAllocation,
          strat.biddingStrategy,
          strat.campaignDuration,
          strat.funnelStage,
          strat.geographicTargeting,
          strat.demographicTargeting,
          strat.retargetingType,
          strat.timingStrategy,
          strat.offerStrategy,
          strat.keywordInterestTargeting,
          JSON.stringify(strat.advantages),
          JSON.stringify(strat.disadvantages),
          JSON.stringify(strat.assumptions)
        ]
      );

      if (strat.evaluation) {
        const ev = strat.evaluation;
        await query(
          `INSERT INTO strategy_evaluations (
            strategy_id, expected_ctr, expected_cpc, expected_cvr,
            expected_conversions, expected_cpa, expected_revenue, expected_roas, risk_score,
            confidence_score, audience_fit_score, overall_score, rank, status, classification,
            confidence_level, similar_campaigns_count, historical_evidence_text, market_evidence_text,
            scoring_breakdown, selection_reasons, rejection_reasons
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          ON CONFLICT (strategy_id) DO UPDATE SET
            overall_score = EXCLUDED.overall_score,
            rank = EXCLUDED.rank`,
          [
            strat.strategyId,
            ev.expectedCtr,
            ev.expectedCpc,
            ev.expectedConversionRate,
            ev.expectedConversions,
            ev.expectedCpa,
            ev.expectedRevenue,
            ev.expectedRoas,
            ev.riskScore,
            ev.confidenceScore,
            ev.audienceFitScore,
            ev.overallScore,
            ev.rank,
            ev.status,
            ev.classification,
            ev.confidenceLevel,
            ev.similarCampaignsCount,
            ev.historicalEvidenceText,
            ev.marketEvidenceText,
            JSON.stringify(ev.scoringBreakdown),
            JSON.stringify(ev.selectionReasons),
            JSON.stringify(ev.rejectionReasons)
          ]
        );
      }
    }
  } catch {
    // Database sync optional / fallback gracefully to in-memory store
  }
}

export async function getCampaignRecord(campaignId: string): Promise<CampaignRecord | null> {
  const cached = memoryStore.get(campaignId);
  if (cached) return cached;

  return null;
}

export async function listCampaignRecords(): Promise<Array<{
  campaignId: string;
  campaignName: string;
  productService: string;
  totalBudget: number;
  strategyCount: number;
  topRoas: number;
  createdAt: string;
}>> {
  const result: Array<{
    campaignId: string;
    campaignName: string;
    productService: string;
    totalBudget: number;
    strategyCount: number;
    topRoas: number;
    createdAt: string;
  }> = [];

  memoryStore.forEach((record, cid) => {
    const topRoas = record.top3.length > 0 && record.top3[0].evaluation
      ? record.top3[0].evaluation.expectedRoas
      : 0;
    result.push({
      campaignId: cid,
      campaignName: record.config.campaignName,
      productService: record.config.productService,
      totalBudget: record.config.totalBudget,
      strategyCount: record.strategies.length,
      topRoas,
      createdAt: record.createdAt
    });
  });

  return result;
}
