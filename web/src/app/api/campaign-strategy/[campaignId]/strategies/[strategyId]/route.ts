import { NextRequest, NextResponse } from 'next/server';
import { getCampaignRecord } from '@/lib/strategy-engine/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string; strategyId: string }> }
) {
  try {
    const { campaignId, strategyId } = await params;
    const record = await getCampaignRecord(campaignId);

    if (!record) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const strat = record.strategies.find((s) => s.strategyId === strategyId);
    if (!strat) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      strategy: strat
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
