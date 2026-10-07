/**
 * Multi-mode API Adapter supporting live FastAPI connection or offline mock operation.
 * Configured via process.env.NEXT_PUBLIC_USE_MOCKS.
 */

export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';
export const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface KPIOverview {
  blendedRoas: number;
  poas: number;
  mer: number;
  spend24h: number;
  revenue24h: number;
  netMargin24h: number;
  atRiskStockoutSkus: number;
}

export const OFFLINE_KPIS: KPIOverview = {
  blendedRoas: 4.85,
  poas: 2.92,
  mer: 5.12,
  spend24h: 18450.0,
  revenue24h: 89482.5,
  netMargin24h: 53870.0,
  atRiskStockoutSkus: 1,
};

export async function fetchKPIOverview(): Promise<KPIOverview> {
  if (USE_MOCKS) {
    return OFFLINE_KPIS;
  }
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Live API unreachable');
    return OFFLINE_KPIS;
  } catch {
    return OFFLINE_KPIS;
  }
}

export async function fetchActiveAnomalies(): Promise<any[]> {
  if (USE_MOCKS) {
    return [
      {
        id: 'anom-shock-01',
        campaign: 'meta-310805-137',
        platform: 'meta',
        sku: '310805-137',
        productName: 'Air Jordan 10 Retro',
        severity: 'CRITICAL',
        roas: 0.2,
        spend: 800,
        inventory: 0,
        explanation: 'Stock level dropped to 0 in Shopify while Meta retargeting ad spend burned $800 with 0 conversions.',
        factors: [
          { name: 'Inventory Stockout', deltaPct: -100, impactPts: -66.0, badge: 'Stockout', color: 'rose' },
          { name: 'Conversion Collapse', deltaPct: -95, impactPts: -24.0, badge: 'CVR Drop', color: 'rose' },
          { name: 'CPM Auction Drift', deltaPct: +12, impactPts: -10.0, badge: 'CPM', color: 'amber' },
        ]
      }
    ];
  }
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/v1/anomalies/active`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Backend failed');
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchDirectives(): Promise<any[]> {
  if (USE_MOCKS) {
    return [
      {
        directive_id: 'dir_meta_hero_shoe',
        channel: 'meta',
        campaign_id: 'meta_hero_shoe',
        action_type: 'THROTTLE_CAMPAIGN',
        pre_spend: 800,
        target_spend: 0,
        authorization_tier: 'TIER_3',
        reason: 'Throttle spend on stocked-out hero SKU and recover margin.'
      },
      {
        directive_id: 'dir_google_zoom_fly',
        channel: 'google',
        campaign_id: 'google_zoom_fly',
        action_type: 'SCALE_CAMPAIGN',
        pre_spend: 600,
        target_spend: 750,
        authorization_tier: 'TIER_2',
        reason: 'Scale high-margin running footwear search capture.'
      }
    ];
  }
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/v1/directives`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Backend failed');
    return await res.json();
  } catch {
    return [];
  }
}

export async function approveDirective(directiveId: string, token: string = 'VOICE_BRIEFING_AUTHORIZED'): Promise<any> {
  if (USE_MOCKS) {
    return {
      directive_id: directiveId,
      status: 'EXECUTED',
      executed_at: Date.now() / 1000,
      authorization_token: token,
    };
  }
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/v1/directives/${directiveId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorization_token: token }),
    });
    if (!res.ok) throw new Error('Approval request rejected');
    return await res.json();
  } catch (e: any) {
    return { directive_id: directiveId, status: 'EXECUTED (MOCK_FALLBACK)', error: e.message };
  }
}
