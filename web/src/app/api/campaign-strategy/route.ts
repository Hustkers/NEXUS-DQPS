import { NextRequest, NextResponse } from 'next/server';
import { CampaignConfig } from '@/lib/strategy-engine/types';
import { generateStrategies } from '@/lib/strategy-engine/generator';
import { rankAndEvaluateAll } from '@/lib/strategy-engine/ranker';
import { saveCampaignRecord, listCampaignRecords } from '@/lib/strategy-engine/store';

export async function GET() {
  try {
    const list = await listCampaignRecords();
    return NextResponse.json({
      status: 'success',
      count: list.length,
      campaigns: list
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.campaignName || !body.campaignName.trim()) {
      return NextResponse.json({ error: 'campaignName is required' }, { status: 400 });
    }
    if (!body.productService || !body.productService.trim()) {
      return NextResponse.json({ error: 'productService is required' }, { status: 400 });
    }
    if (!body.totalBudget || Number(body.totalBudget) <= 0) {
      return NextResponse.json({ error: 'totalBudget must be greater than 0' }, { status: 400 });
    }
    if (!body.campaignDuration || Number(body.campaignDuration) <= 0) {
      return NextResponse.json({ error: 'campaignDuration must be greater than 0' }, { status: 400 });
    }

    const sanitizedSlug = (body.campaignName || 'campaign')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 24);
    const campaignId = body.campaignId || `cmp-${sanitizedSlug}-${Math.round(Number(body.totalBudget))}`;

    const config: CampaignConfig = {
      campaignId,
      campaignName: body.campaignName.trim(),
      productService: body.productService.trim(),
      targetAudience: body.targetAudience?.trim() || 'Active shoppers and category enthusiasts',
      targetLocation: body.targetLocation?.trim() || 'National Metros',
      industryCategory: body.industryCategory?.trim() || 'Athletic Footwear & Apparel',
      totalBudget: Number(body.totalBudget),
      campaignDuration: Number(body.campaignDuration),
      objective: body.objective || 'CONVERSIONS',
      preferredPlatforms: Array.isArray(body.preferredPlatforms) && body.preferredPlatforms.length > 0
        ? body.preferredPlatforms
        : ['meta', 'google', 'amazon', 'tiktok'],
      productId: body.productId,
      productPrice: body.productPrice ? Number(body.productPrice) : undefined,
      historicalData: body.historicalData || {},
      constraints: body.constraints || {}
    };

    // 1. Generate 20-25 strategies
    const rawStrategies = generateStrategies(config);

    // 2. Evaluate and Rank strategies
    const { ranked, top3, bestChoice, top3BudgetAllocation } = rankAndEvaluateAll(rawStrategies, config);
    const { computeHistoricalSummary } = await import('@/lib/strategy-engine/historical-engine');
    const { getMarketSignals } = await import('@/lib/strategy-engine/market-and-risk');
    const { generateDefaultLiveMonitoring, SEED_COMPLETED_CAMPAIGNS } = await import('@/lib/strategy-engine/store');

    const historicalSummary = computeHistoricalSummary();
    const marketSignals = getMarketSignals();
    const liveMonitoring = generateDefaultLiveMonitoring(campaignId, config.campaignName, config.totalBudget);

    // 3. Persist record
    const record = {
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
    await saveCampaignRecord(record);

    return NextResponse.json({
      status: 'success',
      campaignId,
      campaignName: config.campaignName,
      totalStrategies: ranked.length,
      top3Recommendations: top3,
      bestChoice,
      top3BudgetAllocation,
      historicalSummary,
      marketSignals,
      liveMonitoring,
      completedHistory: SEED_COMPLETED_CAMPAIGNS,
      allStrategies: ranked
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
