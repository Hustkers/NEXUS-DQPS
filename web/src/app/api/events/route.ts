import { NextRequest, NextResponse } from 'next/server';
import { trackingStore, TrackingEvent } from '@/lib/tracking-store';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await request.json();

    const {
      event_id,
      visitor_id,
      session_id,
      customer_id,
      event_type,
      timestamp,
      product_id,
      value,
      campaign_id,
      platform,
      click_id,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      page_url,
      order_id,
      is_server_side,
      identity_link
    } = body;

    // Validation
    if (!visitor_id || !session_id || !event_type) {
      return NextResponse.json(
        { error: 'Missing required fields: visitor_id, session_id, and event_type are required' },
        { status: 400 }
      );
    }

    const validEventTypes = [
      'page_view',
      'ad_click',
      'product_view',
      'add_to_cart',
      'begin_checkout',
      'purchase'
    ];
    if (!validEventTypes.includes(event_type)) {
      return NextResponse.json(
        { error: `Invalid event_type. Must be one of: ${validEventTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Rate Limiting Check (by visitor_id or IP)
    const rateLimitKey = `${ip}_${visitor_id}`;
    if (trackingStore.isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded (120 events/minute max). Please slow down.' },
        { status: 429 }
      );
    }

    // Handle Identity Stitching Link if attached
    if (identity_link?.customer_id) {
      trackingStore.linkIdentity(
        identity_link.visitor_id || visitor_id,
        identity_link.customer_id,
        identity_link.method || 'login'
      );
    }

    const eventRecord: TrackingEvent = {
      event_id: event_id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      visitor_id,
      session_id,
      customer_id: customer_id || null,
      event_type,
      timestamp: timestamp || new Date().toISOString(),
      product_id: product_id || null,
      value: value !== undefined && value !== null ? Number(value) : null,
      campaign_id: campaign_id || null,
      platform: platform || null,
      click_id: click_id || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      utm_content: utm_content || null,
      page_url: page_url || 'https://store.niked2c.com/',
      order_id: order_id || null,
      is_server_side: Boolean(is_server_side)
    };

    const result = await trackingStore.recordEvent(eventRecord);

    return NextResponse.json(
      {
        status: 'ok',
        event_id: result.event.event_id,
        is_duplicate: result.status === 'duplicate',
        message: result.status === 'duplicate' ? 'Event already ingested (idempotent)' : 'Event recorded successfully'
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing event in /api/events:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const stats = trackingStore.getRawStoreState();
  return NextResponse.json({
    service: 'NEXUS D2C Visitor Event Ingestion API',
    status: 'ONLINE',
    stats
  });
}
