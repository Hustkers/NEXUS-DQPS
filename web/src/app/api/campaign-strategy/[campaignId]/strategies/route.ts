import { NextRequest, NextResponse } from 'next/server';
import { getCampaignRecord } from '@/lib/strategy-engine/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const record = await getCampaignRecord(campaignId);

    if (!record) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform')?.toLowerCase();
    const status = searchParams.get('status')?.toUpperCase();
    const search = searchParams.get('search')?.toLowerCase();

    let strategies = [...record.strategies];

    if (platform && platform !== 'all') {
      strategies = strategies.filter((s) => s.platform.toLowerCase() === platform);
    }

    if (status && (status === 'SELECTED' || status === 'NOT SELECTED')) {
      strategies = strategies.filter((s) => s.evaluation?.status === status);
    }

    if (search) {
      strategies = strategies.filter(
        (s) =>
          s.strategyName.toLowerCase().includes(search) ||
          s.strategyId.toLowerCase().includes(search) ||
          s.adFormat.toLowerCase().includes(search) ||
          s.audienceSegment.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      status: 'success',
      campaignId,
      totalCount: record.strategies.length,
      filteredCount: strategies.length,
      strategies
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
