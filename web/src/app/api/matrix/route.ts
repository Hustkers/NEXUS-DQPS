import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import initialEngineState from '@/data/nexus-engine-state.json';

export interface CampaignData {
  id?: number;
  campaign: string;
  platform: string;
  sku: string;
  productName: string;
  photoUrl: string;
  rating?: number;
  reviews?: number;
  category: string;
  currentDailySpend: number;
  currentDailyRevenue: number;
  currentDailyMargin: number;
  roas: number;
  targetRoas: number;
  breakevenRoas: number;
  roasStatus: string;
  healthScore: number;
  inventory: number;
  price: number;
  marginPct: number;
  pacingPct?: number;
  sparkline?: number[];
  updatedAt?: string;
}

export interface MatrixApiResponse {
  status: 'connected' | 'fallback' | 'error';
  database: string;
  latencyMs: number;
  timestamp: string;
  totalCampaigns: number;
  totalSkus: number;
  campaigns: CampaignData[];
  summary: {
    totalSpend: number;
    totalRevenue: number;
    blendedRoas: number;
    stockoutCount: number;
    averageHealth: number;
  };
  source: 'postgresql_live' | 'engine_state_fallback';
  errorDetails?: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = request.nextUrl;
  const platformFilter = searchParams.get('platform');
  const searchQuery = searchParams.get('query');

  try {
    // 1. Real PostgreSQL ping & query
    let sql = `
      SELECT 
        c.id,
        c.campaign_name as campaign,
        c.platform,
        c.product_id as sku,
        COALESCE(p.product_name, c.product_name, c.product_id) as "productName",
        COALESCE(p.photo_url, '') as "photoUrl",
        COALESCE(p.rating, 4.5)::float as rating,
        COALESCE(p.reviews, 50)::int as reviews,
        COALESCE(p.category, 'Sportswear') as category,
        c.daily_spend::float as "currentDailySpend",
        c.daily_revenue::float as "currentDailyRevenue",
        c.daily_margin::float as "currentDailyMargin",
        c.roas::float as roas,
        c.target_roas::float as "targetRoas",
        c.breakeven_roas::float as "breakevenRoas",
        c.health_score::int as "healthScore",
        c.roas_status as "roasStatus",
        c.inventory_units::int as inventory,
        COALESCE(p.price_usd, 150.0)::float as price,
        c.margin_pct::float as "marginPct",
        c.pacing_pct::int as "pacingPct",
        c.sparkline,
        c.updated_at as "updatedAt"
      FROM campaigns c
      LEFT JOIN products p ON c.product_id = p.product_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (platformFilter && platformFilter !== 'all') {
      params.push(platformFilter);
      sql += ` AND c.platform = $${params.length}`;
    }

    if (searchQuery && searchQuery.trim()) {
      params.push(`%${searchQuery.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(c.campaign_name) LIKE $${params.length} OR LOWER(c.product_id) LIKE $${params.length} OR LOWER(p.product_name) LIKE $${params.length} OR LOWER(p.category) LIKE $${params.length})`;
    }

    sql += ` ORDER BY c.daily_spend DESC`;

    const rows = await query<any>(sql, params);
    const latencyMs = Date.now() - startTime;

    if (rows && rows.length > 0) {
      const campaigns: CampaignData[] = rows.map((r) => ({
        id: r.id,
        campaign: r.campaign,
        platform: r.platform,
        sku: r.sku,
        productName: r.productName,
        photoUrl: r.photoUrl,
        rating: Number(r.rating || 4.5),
        reviews: Number(r.reviews || 50),
        category: r.category,
        currentDailySpend: Number(r.currentDailySpend || 0),
        currentDailyRevenue: Number(r.currentDailyRevenue || 0),
        currentDailyMargin: Number(r.currentDailyMargin || 0),
        roas: Number(r.roas || 0),
        targetRoas: Number(r.targetRoas || 3.2),
        breakevenRoas: Number(r.breakevenRoas || 1.8),
        roasStatus: r.roasStatus || 'OPTIMAL',
        healthScore: Number(r.healthScore || 75),
        inventory: Number(r.inventory || 0),
        price: Number(r.price || 150),
        marginPct: Number(r.marginPct || 50.0),
        pacingPct: Number(r.pacingPct || 80),
        sparkline: Array.isArray(r.sparkline) ? r.sparkline : (typeof r.sparkline === 'string' ? JSON.parse(r.sparkline) : []),
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString()
      }));

      // Compute aggregated summary from live data
      const totalSpend = campaigns.reduce((acc, c) => acc + c.currentDailySpend, 0);
      const totalRevenue = campaigns.reduce((acc, c) => acc + c.currentDailyRevenue, 0);
      const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
      const uniqueSkus = new Set(campaigns.map((c) => c.sku));
      const stockouts = new Set(campaigns.filter((c) => c.inventory === 0).map((c) => c.sku));
      const avgHealth = campaigns.reduce((acc, c) => acc + c.healthScore, 0) / (campaigns.length || 1);

      const response: MatrixApiResponse = {
        status: 'connected',
        database: 'PostgreSQL 16.4 (nexus_d2c)',
        latencyMs,
        timestamp: new Date().toISOString(),
        totalCampaigns: campaigns.length,
        totalSkus: uniqueSkus.size,
        campaigns,
        summary: {
          totalSpend: Math.round(totalSpend * 100) / 100,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          blendedRoas: Math.round(blendedRoas * 100) / 100,
          stockoutCount: stockouts.size,
          averageHealth: Math.round(avgHealth)
        },
        source: 'postgresql_live'
      };

      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      });
    }

    // Fallback if empty query in DB
    throw new Error('No campaign records returned from PostgreSQL');
  } catch (err: any) {
    console.warn('[Matrix API] Falling back to engine-state:', err?.message);
    const latencyMs = Date.now() - startTime;
    const rawBackup = (initialEngineState.campaigns as CampaignData[]) || [];
    
    // Filter backup if params provided
    let filteredBackup = rawBackup;
    if (platformFilter && platformFilter !== 'all') {
      filteredBackup = filteredBackup.filter((c) => c.platform === platformFilter);
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filteredBackup = filteredBackup.filter(
        (c) =>
          c.campaign.toLowerCase().includes(q) ||
          c.sku.toLowerCase().includes(q) ||
          c.productName.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    const totalSpend = filteredBackup.reduce((acc, c) => acc + c.currentDailySpend, 0);
    const totalRevenue = filteredBackup.reduce((acc, c) => acc + c.currentDailyRevenue, 0);
    const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const uniqueSkus = new Set(filteredBackup.map((c) => c.sku));
    const stockouts = new Set(filteredBackup.filter((c) => c.inventory === 0).map((c) => c.sku));
    const avgHealth = filteredBackup.reduce((acc, c) => acc + c.healthScore, 0) / (filteredBackup.length || 1);

    const fallbackResponse: MatrixApiResponse = {
      status: 'fallback',
      database: 'PostgreSQL 16.4 (Offline/Fallback Mode)',
      latencyMs,
      timestamp: new Date().toISOString(),
      totalCampaigns: filteredBackup.length,
      totalSkus: uniqueSkus.size,
      campaigns: filteredBackup,
      summary: {
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        blendedRoas: Math.round(blendedRoas * 100) / 100,
        stockoutCount: stockouts.size,
        averageHealth: Math.round(avgHealth)
      },
      source: 'engine_state_fallback',
      errorDetails: err?.message || 'Database unavailable'
    };

    return NextResponse.json(fallbackResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
}

// POST endpoint: Allows live updating of campaign target ROAS or inventory stock directly in PostgreSQL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignName, inventory, targetRoas } = body;

    if (!campaignName) {
      return NextResponse.json({ error: 'campaignName is required' }, { status: 400 });
    }

    const updates: string[] = [];
    const params: any[] = [campaignName];

    if (typeof inventory === 'number') {
      params.push(inventory);
      updates.push(`inventory_units = $${params.length}`);
    }

    if (typeof targetRoas === 'number') {
      params.push(targetRoas);
      updates.push(`target_roas = $${params.length}`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const sql = `
      UPDATE campaigns
      SET ${updates.join(', ')}
      WHERE campaign_name = $1
      RETURNING campaign_name, platform, product_id, inventory_units, target_roas, updated_at;
    `;

    const result = await query(sql, params);
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      updatedCampaign: result[0]
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update campaign' }, { status: 500 });
  }
}
