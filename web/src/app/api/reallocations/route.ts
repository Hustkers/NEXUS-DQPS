import { NextResponse } from 'next/server';
import { reallocationService } from '@/features/decision-engine/lib/reallocation-service';

export async function GET() {
  try {
    const reallocations = reallocationService.getReallocations();
    return NextResponse.json({
      success: true,
      reallocations,
      count: reallocations.length
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch reallocations';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
