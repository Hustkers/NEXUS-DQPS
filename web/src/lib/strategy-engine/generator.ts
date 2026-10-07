import { CampaignConfig, CampaignStrategy } from './types';
import { STRATEGIC_ARCHETYPES } from './archetypes';
import { assessStrategyRisks } from './market-and-risk';
import { buildCreativeRecommendation, buildAudienceRecommendation } from './prediction-engine';

export function generateStrategies(config: CampaignConfig): CampaignStrategy[] {
  if (!config.campaignName || !config.campaignName.trim()) {
    throw new Error('campaignName cannot be empty');
  }
  if (!config.productService || !config.productService.trim()) {
    throw new Error('productService cannot be empty');
  }
  if (config.totalBudget <= 0) {
    throw new Error(`totalBudget must be positive (got ${config.totalBudget})`);
  }
  if (config.campaignDuration <= 0) {
    throw new Error(`campaignDuration must be positive (got ${config.campaignDuration})`);
  }

  const preferredPlatforms = (config.preferredPlatforms || ['meta', 'google', 'amazon', 'tiktok']).map((p) =>
    p.toLowerCase()
  );
  const totalBudget = config.totalBudget;
  const duration = config.campaignDuration;

  const strategies: CampaignStrategy[] = STRATEGIC_ARCHETYPES.map((arch, idx) => {
    const strategyId = `STR-${String(idx + 1).padStart(3, '0')}`;
    const defaultPlatform = arch.platformDefault.toLowerCase();

    // Map platform to preferred platform if needed
    const platform = preferredPlatforms.includes(defaultPlatform)
      ? defaultPlatform
      : preferredPlatforms[idx % preferredPlatforms.length];

    const share = arch.budgetShare;
    let budgetAllocation = Math.round(totalBudget * share * 100) / 100;
    if (budgetAllocation <= 0) {
      budgetAllocation = Math.round((totalBudget / STRATEGIC_ARCHETYPES.length) * 100) / 100;
    }

    const strategyName = `${arch.name} — ${config.productService}`;
    const description = `${arch.funnelStage} campaign on ${platform.toUpperCase()} using ${arch.adFormat} tailored for ${config.targetAudience}. Leverages ${arch.creativeAngle.toLowerCase()} with ${arch.biddingStrategy} to maximize conversion efficiency across ${duration} days.`;

    // Concrete Risk Assessment
    const { risks } = assessStrategyRisks(
      strategyId,
      platform,
      arch.funnelStage,
      arch.adFormat,
      budgetAllocation,
      config
    );

    // Creative & Audience Recommendations
    const creativeRecommendation = buildCreativeRecommendation(
      platform,
      arch.adFormat,
      arch.creativeAngle,
      arch.funnelStage,
      config.productService
    );

    const audienceRecommendation = buildAudienceRecommendation(
      platform,
      arch.funnelStage,
      config.targetAudience,
      config.targetLocation
    );

    return {
      strategyId,
      campaignId: config.campaignId,
      strategyName,
      description,
      objective: config.objective,
      targetAudience: config.targetAudience,
      audienceSegment: arch.audienceSegment,
      platform,
      adFormat: arch.adFormat,
      creativeAngle: arch.creativeAngle,
      messagingAngle: arch.messagingAngle,
      targetingMethod: arch.targetingMethod,
      budgetAllocation,
      biddingStrategy: arch.biddingStrategy,
      campaignDuration: duration,
      funnelStage: arch.funnelStage,
      geographicTargeting: `${config.targetLocation} • ${arch.timingStrategy}`,
      demographicTargeting: arch.demographicTargeting,
      retargetingType: arch.retargetingType,
      timingStrategy: arch.timingStrategy,
      offerStrategy: arch.offerStrategy,
      keywordInterestTargeting: arch.keywordInterestTargeting,
      advantages: arch.advantages,
      disadvantages: arch.disadvantages,
      assumptions: arch.assumptions,
      risks,
      creativeRecommendation,
      audienceRecommendation
    };
  });

  return strategies;
}
