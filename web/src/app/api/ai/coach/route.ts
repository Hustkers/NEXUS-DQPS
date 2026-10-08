import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${FASTAPI_BASE_URL}/api/v1/ai/coach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Backend returned ${res.status}: ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Persist any inventory or budget mutations to matrix overrides
    if (data && data.tool_calls && Array.isArray(data.tool_calls)) {
      const { setInventoryOverride, setBudgetOverride } = await import('@/lib/matrix-overrides');
      for (const tc of data.tool_calls) {
        const uiAction = tc.result?.ui_action;
        if (uiAction) {
          if (uiAction.type === 'UPDATE_INVENTORY' && uiAction.payload?.sku) {
            setInventoryOverride(String(uiAction.payload.sku), Number(uiAction.payload.quantity));
          } else if (uiAction.type === 'UPDATE_BUDGET' && uiAction.payload?.target) {
            setBudgetOverride(String(uiAction.payload.target), Number(uiAction.payload.budget));
          }
        }
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to reach Python backend' },
      { status: 502 }
    );
  }
}
