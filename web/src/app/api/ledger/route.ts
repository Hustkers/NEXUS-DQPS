import { NextResponse } from 'next/server';
import { reallocationService } from '@/features/decision-engine/lib/reallocation-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ledger = reallocationService.getDecisionLedger();
    return NextResponse.json({
      success: true,
      ledger,
      entries: ledger,
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const entry = reallocationService.recordDecision(body);
    return NextResponse.json({
      success: true,
      entry,
      ledger: reallocationService.getDecisionLedger(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record decision in ledger';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
