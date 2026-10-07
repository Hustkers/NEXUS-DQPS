import { NextRequest, NextResponse } from 'next/server';
import { reallocationService } from '@/features/decision-engine/lib/reallocation-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anomalyId, targetCampaign, deltaSpend } = body;

    if (!anomalyId || typeof anomalyId !== 'string') {
      return NextResponse.json(
        { success: false, code: 'INVALID_REQUEST', message: 'anomalyId is required.' },
        { status: 400 }
      );
    }

    const result = await reallocationService.executeReallocation({
      anomalyId,
      targetCampaign,
      deltaSpend: deltaSpend ? Number(deltaSpend) : undefined
    });

    if (!result.success) {
      const status = result.code === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error during execution.';
    return NextResponse.json(
      { success: false, code: 'ERROR', message },
      { status: 500 }
    );
  }
}
