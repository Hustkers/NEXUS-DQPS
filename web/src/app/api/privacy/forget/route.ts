import { NextRequest, NextResponse } from 'next/server';
import { trackingStore } from '@/lib/tracking-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email } = body;

    let targetId = id;
    if (!targetId && email) {
      targetId = trackingStore.hashEmail(email);
    }

    if (!targetId) {
      return NextResponse.json(
        { error: 'Provide either visitor_id, customer_id, or email to purge' },
        { status: 400 }
      );
    }

    const result = trackingStore.deleteVisitorData(targetId);
    return NextResponse.json({
      status: 'ok',
      message: 'All personal data, events, and sessions permanently deleted (GDPR / CCPA Article 17)',
      target_id: targetId,
      records_purged: result.records_cleared
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to execute forget-me deletion', details: message },
      { status: 500 }
    );
  }
}
