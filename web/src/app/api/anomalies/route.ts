import { NextResponse } from 'next/server';
import { anomalyService } from '@/features/decision-engine/lib/anomaly-service';

export async function GET() {
  try {
    const anomalies = anomalyService.getAnomalies();
    return NextResponse.json({
      success: true,
      anomalies,
      count: anomalies.length
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch anomalies';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
