export type RegionStatus = 'High sales' | 'Decreasing' | 'Suppressed';

export interface RegionProductInfo {
  sku: string;
  name: string;
  margin: number; // e.g. 0.48 for 48%
  stockLevel: number; // in units
}

export interface RegionTrend {
  direction: 'up' | 'down';
  percentage: number; // e.g. +14.5 or -12.3
}

export interface RegionRecommendation {
  action: string;
  expectedLift: string;
}

export interface RegionMetrics {
  spend: number;
  revenue: number;
  margin: number; // gross margin rate (e.g. 0.45 for 45%)
  conversions: number;
  convProbability: number; // 0.78 for 78% P_conv
  impressions: number;
  clicks: number;
  topProduct: RegionProductInfo;
  trend: RegionTrend;
  recommendedAction: RegionRecommendation;
}

export interface PulseMarker {
  id: string;
  name: string;
  location: [number, number]; // [lat, lon]
  delay: number;
  color: string;
  status: RegionStatus;
  label: string;
  volume?: string;
  metrics?: RegionMetrics; // if undefined, triggers friendly missing data state
}

export interface CalculatedFinancials {
  spend: number;
  revenue: number;
  marginRate: number;
  marginRevenue: number;
  profit: number;
  isProfitable: boolean;
  roas: number;
  profitRoas: number;
  cpa: number | null;
  ctr: number;
}

/**
 * Profit formula strictly required by specification:
 * Profit = (revenue * margin) - spend
 * ROAS = revenue / spend
 * Profit ROAS = (revenue * margin) / spend
 * CPA = spend / conversions
 * CTR = (clicks / impressions) * 100
 */
export function calculateRegionFinancials(metrics?: RegionMetrics): CalculatedFinancials | null {
  if (!metrics) return null;

  const spend = metrics.spend;
  const revenue = metrics.revenue;
  const marginRate = metrics.margin;
  const marginRevenue = revenue * marginRate;
  const profit = marginRevenue - spend;
  const isProfitable = profit >= 0;

  // Safe divisions avoiding division by zero
  const roas = spend > 0 ? revenue / spend : 0;
  const profitRoas = spend > 0 ? marginRevenue / spend : 0;
  const cpa = metrics.conversions > 0 ? spend / metrics.conversions : null;
  const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;

  return {
    spend,
    revenue,
    marginRate,
    marginRevenue,
    profit,
    isProfitable,
    roas,
    profitRoas,
    cpa,
    ctr,
  };
}

export const GLOBE_REGIONS: PulseMarker[] = [
  // 1. High Sales - Red (#ef4444)
  {
    id: 'pulse-1',
    name: 'US East (New York)',
    location: [40.71, -74.01],
    delay: 0,
    color: '#ef4444',
    status: 'High sales',
    label: 'US East (New York)',
    volume: '₹42.5k / 4.2x ROAS',
    metrics: {
      spend: 10120,
      revenue: 42504,
      margin: 0.45, // margin revenue = 19,126.80
      conversions: 340,
      convProbability: 0.78, // 78% P_conv
      impressions: 68000,
      clicks: 3400,
      topProduct: {
        sku: 'NK-VPR-001',
        name: 'Nike Air VaporMax Plus',
        margin: 0.48,
        stockLevel: 210,
      },
      trend: {
        direction: 'up',
        percentage: 14.5,
      },
      recommendedAction: {
        action: 'Scale budget +15% on high-intent Meta and Google Shopping retargeting',
        expectedLift: '+₹3,850 profit lift (+18% ROAS)',
      },
    },
  },

  // 2. High Sales - Red (#f43f5e)
  {
    id: 'pulse-2',
    name: 'US West (San Francisco)',
    location: [37.77, -122.42],
    delay: 0.3,
    color: '#f43f5e',
    status: 'High sales',
    label: 'US West (San Francisco)',
    volume: '₹38.2k / 3.9x ROAS',
    metrics: {
      spend: 9800,
      revenue: 38220,
      margin: 0.46, // margin revenue = 17,581.20
      conversions: 305,
      convProbability: 0.74, // 74% P_conv
      impressions: 62000,
      clicks: 2976,
      topProduct: {
        sku: 'NK-MAX-002',
        name: 'Nike Air Max 270',
        margin: 0.50,
        stockLevel: 165,
      },
      trend: {
        direction: 'up',
        percentage: 11.2,
      },
      recommendedAction: {
        action: 'Maintain aggressive bid cap; expand into TikTok viral lookalikes',
        expectedLift: '+₹2,900 profit lift',
      },
    },
  },

  // 3. Decreasing - Orange/Yellow (#f97316)
  {
    id: 'pulse-3',
    name: 'EMEA (London)',
    location: [51.51, -0.13],
    delay: 0.6,
    color: '#f97316',
    status: 'Decreasing',
    label: 'EMEA (London)',
    volume: '₹28.1k / 3.4x ROAS',
    metrics: {
      spend: 8260,
      revenue: 28084,
      margin: 0.40, // margin revenue = 11,233.60
      conversions: 210,
      convProbability: 0.56, // 56% P_conv
      impressions: 54000,
      clicks: 2160,
      topProduct: {
        sku: 'NK-AF1-003',
        name: "Nike Air Force 1 '07",
        margin: 0.42,
        stockLevel: 84,
      },
      trend: {
        direction: 'down',
        percentage: -6.4,
      },
      recommendedAction: {
        action: 'Shift ₹1,800/d to top-performing UK weekend flash ad groups',
        expectedLift: '+₹1,450 profit lift',
      },
    },
  },

  // 4. Decreasing - Amber (#f59e0b) - Not profitable example
  {
    id: 'pulse-4',
    name: 'APAC (Tokyo)',
    location: [35.68, 139.65],
    delay: 0.9,
    color: '#f59e0b',
    status: 'Decreasing',
    label: 'APAC (Tokyo)',
    volume: '₹19.0k / 2.5x ROAS',
    metrics: {
      spend: 7600,
      revenue: 19000,
      margin: 0.35, // margin revenue = 6,650; profit = 6,650 - 7,600 = -950 (Not profitable!)
      conversions: 140,
      convProbability: 0.44, // 44% P_conv
      impressions: 45000,
      clicks: 1575,
      topProduct: {
        sku: 'NK-DUN-004',
        name: 'Nike Dunk Low Retro',
        margin: 0.35,
        stockLevel: 19,
      },
      trend: {
        direction: 'down',
        percentage: -14.8,
      },
      recommendedAction: {
        action: 'Trim budget -₹2,400 due to stock depletion on high-margin colorways',
        expectedLift: 'Prevents -₹1,200 ad waste',
      },
    },
  },

  // 5. Decreasing - Yellow (#eab308)
  {
    id: 'pulse-5',
    name: 'India Direct (Mumbai)',
    location: [19.07, 72.88],
    delay: 1.2,
    color: '#eab308',
    status: 'Decreasing',
    label: 'India Direct (Mumbai)',
    volume: '₹18.6k / 2.9x ROAS',
    metrics: {
      spend: 6400,
      revenue: 18560,
      margin: 0.42, // margin revenue = 7,795.20; profit = +1,395.20
      conversions: 160,
      convProbability: 0.48, // 48% P_conv
      impressions: 50000,
      clicks: 2100,
      topProduct: {
        sku: 'NK-PEG-005',
        name: 'Nike Pegasus 40',
        margin: 0.44,
        stockLevel: 92,
      },
      trend: {
        direction: 'down',
        percentage: -5.2,
      },
      recommendedAction: {
        action: 'Shift from broad discovery to cart-abandonment retargeting',
        expectedLift: '+₹980 profit lift',
      },
    },
  },

  // 6. Decreasing - Yellow (#facc15) - Not profitable example
  {
    id: 'pulse-6',
    name: 'SEA Hub (Singapore)',
    location: [1.35, 103.82],
    delay: 1.5,
    color: '#facc15',
    status: 'Decreasing',
    label: 'SEA Hub (Singapore)',
    volume: '₹14.2k / 2.7x ROAS',
    metrics: {
      spend: 5260,
      revenue: 14202,
      margin: 0.36, // margin revenue = 5,112.72; profit = 5,112.72 - 5,260 = -147.28 (Not profitable)
      conversions: 110,
      convProbability: 0.38, // 38% P_conv
      impressions: 38000,
      clicks: 1330,
      topProduct: {
        sku: 'NK-INV-006',
        name: 'Nike Invincible 3',
        margin: 0.38,
        stockLevel: 24,
      },
      trend: {
        direction: 'down',
        percentage: -9.1,
      },
      recommendedAction: {
        action: 'Reallocate ₹1,500 to US-East & Google Shopping SKU-7',
        expectedLift: '+₹1,120 profit lift',
      },
    },
  },

  // 7. Decreasing - Light Yellow (#fde047) - Not profitable example
  {
    id: 'pulse-7',
    name: 'Oceania (Sydney)',
    location: [-33.87, 151.21],
    delay: 1.8,
    color: '#fde047',
    status: 'Decreasing',
    label: 'Oceania (Sydney)',
    volume: '₹11.0k / 2.5x ROAS',
    metrics: {
      spend: 4400,
      revenue: 11000,
      margin: 0.38, // margin revenue = 4,180; profit = 4,180 - 4,400 = -220 (Not profitable)
      conversions: 78,
      convProbability: 0.32, // 32% P_conv
      impressions: 29000,
      clicks: 957,
      topProduct: {
        sku: 'NK-MET-007',
        name: 'Nike Metcon 9',
        margin: 0.40,
        stockLevel: 45,
      },
      trend: {
        direction: 'down',
        percentage: -8.8,
      },
      recommendedAction: {
        action: 'Consolidate ad groups into high-converting weekend delivery schedules',
        expectedLift: '+₹640 profit lift',
      },
    },
  },

  // 8. Suppressed - Grey (#9ca3af) - Zero spend / Zero conversion test case
  {
    id: 'pulse-8',
    name: 'LATAM (São Paulo)',
    location: [-23.55, -46.63],
    delay: 2.1,
    color: '#9ca3af',
    status: 'Suppressed',
    label: 'LATAM (São Paulo)',
    volume: '₹0 spend / Suppressed',
    metrics: {
      spend: 0, // Tested for division-by-zero safety
      revenue: 0,
      margin: 0.40,
      conversions: 0, // Tested for division-by-zero safety
      convProbability: 0.12, // 12% P_conv
      impressions: 1400,
      clicks: 28,
      topProduct: {
        sku: 'NK-REV-008',
        name: 'Nike Revolution 7',
        margin: 0.40,
        stockLevel: 0,
      },
      trend: {
        direction: 'down',
        percentage: -34.2,
      },
      recommendedAction: {
        action: 'Keep budget suppressed until regional fulfillment center restocks inventory',
        expectedLift: 'Preserves ₹2,500/mo cashflow',
      },
    },
  },

  // 9. Suppressed - Dark Grey (#6b7280) - Missing data test case
  {
    id: 'pulse-9',
    name: 'Nordic (Stockholm)',
    location: [59.33, 18.06],
    delay: 2.4,
    color: '#6b7280',
    status: 'Suppressed',
    label: 'Nordic (Stockholm)',
    volume: 'Telemetry Disconnected',
    metrics: undefined, // Missing data test case! Triggers skeleton and friendly message
  },
];
