import { NextRequest, NextResponse } from 'next/server';
import { getCampaignRecord } from '@/lib/strategy-engine/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const record = await getCampaignRecord(campaignId);

    if (!record) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      campaign: record.config,
      totalStrategies: record.strategies.length,
      top3Recommendations: record.top3,
      bestChoice: record.bestChoice,
      top3BudgetAllocation: record.top3BudgetAllocation,
      historicalSummary: record.historicalSummary,
      marketSignals: record.marketSignals,
      liveMonitoring: record.liveMonitoring,
      completedHistory: record.completedHistory,
      allStrategies: record.strategies,
      createdAt: record.createdAt
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
