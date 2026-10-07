import { NextRequest, NextResponse } from 'next/server';
import { getCampaignRecord } from '@/lib/strategy-engine/store';
import { compareStrategies } from '@/lib/strategy-engine/ranker';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const record = await getCampaignRecord(campaignId);

    if (!record) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const body = await request.json();
    const strategyIds = body.strategyIds;

    if (!Array.isArray(strategyIds) || strategyIds.length === 0) {
      return NextResponse.json({ error: 'strategyIds array is required' }, { status: 400 });
    }

    const comparison = compareStrategies(strategyIds, record.strategies);

    return NextResponse.json({
      status: 'success',
      comparison
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 400 });
  }
}
