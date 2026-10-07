import { NextRequest, NextResponse } from 'next/server';
import { computeRLAdAllocation } from '@/lib/rl-ad-optimizer';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productName = searchParams.get('productName') || 'Nike Air Max Pulse';
  const sku = searchParams.get('sku') || 'NK-AM-001';
  const price = searchParams.get('price') ? Number(searchParams.get('price')) : 159.99;
  const spend = searchParams.get('spend') ? Number(searchParams.get('spend')) : 4850;
  const roas = searchParams.get('roas') ? Number(searchParams.get('roas')) : 3.15;
  const grossMarginPct = searchParams.get('grossMarginPct') ? Number(searchParams.get('grossMarginPct')) : 64;
  const inventory = searchParams.get('inventory') ? Number(searchParams.get('inventory')) : 142;

  const result = computeRLAdAllocation({
    productName,
    sku,
    price,
    spend,
    roas,
    grossMarginPct,
    inventory
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = computeRLAdAllocation({
      productName: body.productName || 'Default Product',
      sku: body.sku,
      price: body.price,
      spend: body.spend,
      roas: body.roas,
      grossMarginPct: body.grossMarginPct,
      inventory: body.inventory
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to process RL optimization' }, { status: 400 });
  }
}
