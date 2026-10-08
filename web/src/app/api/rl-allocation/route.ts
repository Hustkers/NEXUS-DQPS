import { NextRequest, NextResponse } from 'next/server';
import { computeRLAdAllocation, HeadroomPolicyMode } from '@/lib/rl-ad-optimizer';
import initialEngineState from '@/data/nexus-engine-state.json';

type EngineCampaign = (typeof initialEngineState.campaigns)[number];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // 1. Action: Return all 40 omnichannel campaigns from DATASET.md / engine state
    if (action === 'campaigns' || action === 'list') {
      const platformFilter = searchParams.get('platform')?.toLowerCase();
      let campaigns: EngineCampaign[] = initialEngineState.campaigns;

      if (platformFilter && platformFilter !== 'all') {
        campaigns = campaigns.filter((c) => c.platform.toLowerCase() === platformFilter);
      }

      const platformCounts = {
        total: initialEngineState.campaigns.length,
        meta: initialEngineState.campaigns.filter((c) => c.platform === 'meta').length,
        google: initialEngineState.campaigns.filter((c) => c.platform === 'google').length,
        amazon: initialEngineState.campaigns.filter((c) => c.platform === 'amazon').length,
        shopify: initialEngineState.campaigns.filter((c) => c.platform === 'shopify').length,
      };

      const stockoutCount = initialEngineState.campaigns.filter((c) => (c.inventory ?? 0) <= 0).length;

      return NextResponse.json({
        success: true,
        source: 'DATASET.md Omnichannel Catalog Engine',
        summary: {
          totalCampaigns: initialEngineState.campaigns.length,
          returnedCount: campaigns.length,
          platformCounts,
          stockoutCount,
          activeOptimizationModel: initialEngineState.metadata.activeOptimizationModel,
        },
        campaigns,
      });
    }

    // 2. Action: Optimize for a specific campaign by ID or SKU
    const campaignId = searchParams.get('campaignId') || searchParams.get('campaign');
    const policyMode = (searchParams.get('policyMode') as HeadroomPolicyMode) || 'BALANCED';

    let matchedCampaign: EngineCampaign | undefined;
    if (campaignId) {
      matchedCampaign = initialEngineState.campaigns.find(
        (c) => c.campaign === campaignId || c.sku === campaignId
      );
    }

    const productName = matchedCampaign?.productName || searchParams.get('productName') || 'Nike Air Max 270';
    const sku = matchedCampaign?.sku || searchParams.get('sku') || 'AH8050-100';
    const price = matchedCampaign?.price ?? (searchParams.get('price') ? Number(searchParams.get('price')) : 168.61);
    const spend = matchedCampaign?.currentDailySpend ?? (searchParams.get('spend') ? Number(searchParams.get('spend')) : 4850);
    const roas = matchedCampaign?.roas ?? (searchParams.get('roas') ? Number(searchParams.get('roas')) : 3.2);
    const grossMarginPct = matchedCampaign?.marginPct ?? (searchParams.get('grossMarginPct') ? Number(searchParams.get('grossMarginPct')) : 62);
    const inventory = matchedCampaign?.inventory ?? (searchParams.get('inventory') ? Number(searchParams.get('inventory')) : 360);
    const platform = matchedCampaign?.platform || searchParams.get('platform') || 'meta';
    const targetRoas = matchedCampaign?.targetRoas ?? (searchParams.get('targetRoas') ? Number(searchParams.get('targetRoas')) : 3.2);
    const breakevenRoas = matchedCampaign?.breakevenRoas ?? (searchParams.get('breakevenRoas') ? Number(searchParams.get('breakevenRoas')) : 1.8);

    const result = computeRLAdAllocation({
      productName,
      sku,
      price,
      spend,
      roas,
      grossMarginPct,
      inventory,
      platform,
      policyMode,
      campaignId: matchedCampaign?.campaign || campaignId || undefined,
      targetRoas,
      breakevenRoas,
    });

    return NextResponse.json({
      success: true,
      matchedCampaign: matchedCampaign ? {
        campaign: matchedCampaign.campaign,
        platform: matchedCampaign.platform,
        sku: matchedCampaign.sku,
        inventory: matchedCampaign.inventory,
        roasStatus: matchedCampaign.roasStatus,
      } : null,
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to process RL allocation query', details: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const campaignId = body.campaignId || body.campaign;
    const policyMode = (body.policyMode as HeadroomPolicyMode) || 'BALANCED';

    let matchedCampaign: EngineCampaign | undefined;
    if (campaignId) {
      matchedCampaign = initialEngineState.campaigns.find(
        (c) => c.campaign === campaignId || c.sku === campaignId
      );
    }

    const productName = body.productName || matchedCampaign?.productName || 'Default Campaign Target';
    const sku = body.sku || matchedCampaign?.sku || 'SKU-UNKNOWN';
    const price = body.price ?? matchedCampaign?.price ?? 168.61;
    const spend = body.spend ?? matchedCampaign?.currentDailySpend ?? 4850;
    const roas = body.roas ?? matchedCampaign?.roas ?? 3.2;
    const grossMarginPct = body.grossMarginPct ?? matchedCampaign?.marginPct ?? 62;
    const inventory = body.inventory ?? matchedCampaign?.inventory ?? 360;
    const platform = body.platform || matchedCampaign?.platform || 'meta';
    const targetRoas = body.targetRoas ?? matchedCampaign?.targetRoas ?? 3.2;
    const breakevenRoas = body.breakevenRoas ?? matchedCampaign?.breakevenRoas ?? 1.8;

    const result = computeRLAdAllocation({
      productName,
      sku,
      price,
      spend,
      roas,
      grossMarginPct,
      inventory,
      platform,
      policyMode,
      campaignId: matchedCampaign?.campaign || campaignId || undefined,
      targetRoas,
      breakevenRoas,
    });

    return NextResponse.json({
      success: true,
      matchedCampaign: matchedCampaign ? {
        campaign: matchedCampaign.campaign,
        platform: matchedCampaign.platform,
        sku: matchedCampaign.sku,
        inventory: matchedCampaign.inventory,
      } : null,
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to process RL optimization POST', details: message }, { status: 400 });
  }
}
