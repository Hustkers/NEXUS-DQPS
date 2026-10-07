import { NextRequest, NextResponse } from 'next/server';
import { trackingStore } from '@/lib/tracking-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const days = Number(body.days || 90);

    if (isNaN(days) || days < 1) {
      return NextResponse.json({ error: 'Valid retention window (days >= 1) is required' }, { status: 400 });
    }

    const result = trackingStore.purgeOlderThanDays(days);
    return NextResponse.json({
      status: 'ok',
      retention_days: days,
      events_purged: result.purged_events,
      message: `Successfully purged raw events older than ${days} days`
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to execute retention cleanup', details: message },
      { status: 500 }
    );
  }
}
