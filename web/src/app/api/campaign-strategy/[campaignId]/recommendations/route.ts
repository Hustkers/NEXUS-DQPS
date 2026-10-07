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
      campaignId,
      recommendationCount: record.top3.length,
      recommendations: record.top3
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
