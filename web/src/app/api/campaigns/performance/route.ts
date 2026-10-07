import { NextRequest, NextResponse } from 'next/server';
import { trackingStore } from '@/lib/tracking-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const modelParam = searchParams.get('model');
    const model = modelParam === 'first_touch' ? 'first_touch' : 'last_touch';

    const performance = trackingStore.getCampaignPerformance(model);

    // Compute blended summary
    const totalClicks = performance.reduce((s, c) => s + c.clicks, 0);
    const totalPurchases = performance.reduce((s, c) => s + c.purchases, 0);
    const totalRevenue = performance.reduce((s, c) => s + c.revenue, 0);
    const totalSpend = performance.reduce((s, c) => s + c.spend, 0);
    const totalProfit = performance.reduce((s, c) => s + c.profit, 0);
    const totalPlatformReported = performance.reduce((s, c) => s + c.platform_reported_conversions, 0);

    return NextResponse.json({
      attribution_model: model,
      summary: {
        total_campaigns: performance.length,
        total_clicks: totalClicks,
        total_purchases: totalPurchases,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        total_spend: Math.round(totalSpend * 100) / 100,
        total_profit: Math.round(totalProfit * 100) / 100,
        blended_cvr: totalClicks > 0 ? Math.round((totalPurchases / totalClicks) * 10000) / 10000 : 0,
        blended_roas: totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 100) / 100 : 0,
        platform_reported_total: totalPlatformReported,
        total_discrepancy: totalPlatformReported - totalPurchases
      },
      campaigns: performance
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to compute campaign performance', details: message },
      { status: 500 }
    );
  }
}
