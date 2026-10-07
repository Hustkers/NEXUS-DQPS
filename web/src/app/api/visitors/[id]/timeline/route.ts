import { NextRequest, NextResponse } from 'next/server';
import { trackingStore } from '@/lib/tracking-store';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Visitor or Customer ID required' }, { status: 400 });
    }

    const timeline = trackingStore.getVisitorTimeline(id);
    return NextResponse.json(timeline);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to retrieve visitor timeline', details: message },
      { status: 500 }
    );
  }
}
