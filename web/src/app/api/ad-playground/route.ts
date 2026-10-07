import { NextRequest, NextResponse } from 'next/server';
import {
  computePlaygroundRecommendations,
  getPlaygroundProducts
} from '@/features/decision-engine/lib/ad-playground-engine';
import type { AdPlaygroundConstraints } from '@/features/decision-engine/types/ad-playground-types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');

    const products = getPlaygroundProducts();

    if (!sku) {
      return NextResponse.json({ products });
    }

    const total_budget = searchParams.get('total_budget') ? Number(searchParams.get('total_budget')) : 5000;
    const duration_days = searchParams.get('duration_days') ? Number(searchParams.get('duration_days')) : 14;
    const target_roas_floor = searchParams.get('target_roas_floor') ? Number(searchParams.get('target_roas_floor')) : 1.8;
    const stratParam = searchParams.get('strategy_focus');
    const strategy_focus = (stratParam === 'BALANCED' || stratParam === 'SCALE_VOLUME') ? stratParam : 'MAX_PROFIT';

    const result = computePlaygroundRecommendations({
      sku,
      total_budget,
      duration_days,
      target_roas_floor,
      strategy_focus
    });

    return NextResponse.json({ products, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process Ad Playground request';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AdPlaygroundConstraints;

    // Check if Python backend is available on port 8001
    try {
      const pyRes = await fetch('http://127.0.0.1:8001/playground/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: body.sku,
          total_budget: body.total_budget,
          duration_days: body.duration_days,
          target_roas_floor: body.target_roas_floor,
          platforms: body.platforms,
          strategy_focus: body.strategy_focus
        }),
        signal: AbortSignal.timeout(1500)
      });

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        return NextResponse.json(pyData);
      }
    } catch {
      // Fallback gracefully to high-performance local TypeScript engine
    }

    const result = computePlaygroundRecommendations({
      sku: body.sku || '310805-137',
      total_budget: Number(body.total_budget) || 5000,
      duration_days: Number(body.duration_days) || 14,
      target_roas_floor: Number(body.target_roas_floor) || 1.8,
      platforms: body.platforms,
      strategy_focus: body.strategy_focus || 'MAX_PROFIT'
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate recommendations';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
