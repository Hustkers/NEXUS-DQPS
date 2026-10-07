import { NextRequest, NextResponse } from 'next/server';
import { trackingStore } from '@/lib/tracking-store';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Product SKU / ID required' }, { status: 400 });
    }

    const audience = trackingStore.getProductAudience(id);
    return NextResponse.json(audience);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to retrieve product audience segments', details: message },
      { status: 500 }
    );
  }
}
