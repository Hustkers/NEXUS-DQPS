import { NextResponse } from 'next/server';
import { reallocationService } from '@/features/decision-engine/lib/reallocation-service';

export async function GET() {
  try {
    const ledger = reallocationService.getDecisionLedger();
    return NextResponse.json({
      success: true,
      ledger,
      count: ledger.length
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch decision ledger';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
