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
  // Extended fields for 3D Globe & Heatmap Telemetry
  shortName?: string;
  countryCodes?: string[];
  center?: [number, number]; // [longitude, latitude] for amCharts camera rotation
  heatPct?: number; // 0 to 100
  colorHex?: string; // thermal heatmap color
  velocityLabel?: string;
  statusLabel?: string;
  metricsSummary?: string;
  roas?: string;
  fulfillmentCenter?: string;
  dots?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    regionId: string;
  }>;
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
 * Profit formula strictly required by specification and DATASET.md:
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

/**
 * Production Regional Distribution Grounded in DATASET.md Table 2 & Section 5:
 * Real Nike SKUs, ERP COGS, Warehouse Fulfillment Centers, and Circuit Breaker SLA.
 */
export const GLOBE_REGIONS: PulseMarker[] = [
  // 1. US East Hub (Thermal Red #FF2E38 - 88% Heat)
  {
    id: 'us-east',
    name: 'US East (New York / Atlanta / Boston)',
    shortName: 'US-EAST',
    location: [40.71, -74.01],
    center: [-75.0, 39.5],
    countryCodes: ['US'],
    delay: 0,
    color: '#FF2E38',
    colorHex: '#FF2E38',
    heatPct: 88,
    status: 'High sales',
    label: 'US East (Allentown Hub)',
    volume: '$62.7k / 4.4x ROAS',
    velocityLabel: '+18.4% WoW',
    statusLabel: 'High Sales Velocity',
    metricsSummary: '$62.7k Rev • 4.40x',
    roas: '4.40x',
    fulfillmentCenter: 'FC-EAST-ALLENTOWN (Allentown, PA)',
    dots: [
      { name: 'New York, NY', latitude: 40.7128, longitude: -74.006, regionId: 'us-east' },
      { name: 'Atlanta, GA', latitude: 33.749, longitude: -84.388, regionId: 'us-east' },
      { name: 'Chicago, IL', latitude: 41.8781, longitude: -87.6298, regionId: 'us-east' },
      { name: 'Boston, MA', latitude: 42.3601, longitude: -71.0589, regionId: 'us-east' },
      { name: 'Miami, FL', latitude: 25.7617, longitude: -80.1918, regionId: 'us-east' },
      { name: 'Philadelphia, PA', latitude: 39.9526, longitude: -75.1652, regionId: 'us-east' },
      { name: 'Washington, DC', latitude: 38.9072, longitude: -77.0369, regionId: 'us-east' },
      { name: 'Charlotte, NC', latitude: 35.2271, longitude: -80.8431, regionId: 'us-east' },
    ],
    metrics: {
      spend: 14250,
      revenue: 62700,
      margin: 0.56, // Net margin revenue = $35,112, Profit = +$20,862
      conversions: 512,
      convProbability: 0.82,
      impressions: 98400,
      clicks: 4920,
      topProduct: {
        sku: '315122-001',
        name: "Nike Air Force 1 '07",
        margin: 0.56,
        stockLevel: 520, // Surplus stock in DATASET.md
      },
      trend: {
        direction: 'up',
        percentage: 18.4,
      },
      recommendedAction: {
        action: 'Scale Meta Advantage+ budget +20%; allocate to Local Zone 2 Next-Day delivery',
        expectedLift: '+$4,280 weekly profit lift (+0.3x ROAS)',
      },
    },
  },

  // 2. US West Hub (Thermal Orange #FF6B29 - 78% Heat)
  {
    id: 'us-west',
    name: 'US West (Los Angeles / SF / Seattle)',
    shortName: 'US-WEST',
    location: [37.77, -122.42],
    center: [-119.5, 36.5],
    countryCodes: ['US'],
    delay: 0.3,
    color: '#FF6B29',
    colorHex: '#FF6B29',
    heatPct: 78,
    status: 'High sales',
    label: 'US West (Ontario Hub)',
    volume: '$51.9k / 4.4x ROAS',
    velocityLabel: '+12.6% WoW',
    statusLabel: 'High Sales Velocity',
    metricsSummary: '$51.9k Rev • 4.40x',
    roas: '4.40x',
    fulfillmentCenter: 'FC-WEST-ONTARIO (Ontario, CA)',
    dots: [
      { name: 'Los Angeles, CA', latitude: 34.0522, longitude: -118.2437, regionId: 'us-west' },
      { name: 'San Francisco, CA', latitude: 37.7749, longitude: -122.4194, regionId: 'us-west' },
      { name: 'Seattle, WA', latitude: 47.6062, longitude: -122.3321, regionId: 'us-west' },
      { name: 'Phoenix, AZ', latitude: 33.4484, longitude: -112.074, regionId: 'us-west' },
      { name: 'Portland, OR', latitude: 45.5152, longitude: -122.6784, regionId: 'us-west' },
      { name: 'San Diego, CA', latitude: 32.7157, longitude: -117.1611, regionId: 'us-west' },
      { name: 'Denver, CO', latitude: 39.7392, longitude: -104.9903, regionId: 'us-west' },
    ],
    metrics: {
      spend: 11800,
      revenue: 51920,
      margin: 0.52, // Net margin revenue = $26,998.40, Profit = +$15,198.40
      conversions: 384,
      convProbability: 0.76,
      impressions: 76000,
      clicks: 3648,
      topProduct: {
        sku: 'AH8050-100',
        name: 'Nike Air Max 270',
        margin: 0.52,
        stockLevel: 360, // Healthy stock in DATASET.md
      },
      trend: {
        direction: 'up',
        percentage: 12.6,
      },
      recommendedAction: {
        action: 'Maintain aggressive bid cap; protect Buy Box win-rate >92% on Amazon SP',
        expectedLift: '+$3,150 weekly profit lift',
      },
    },
  },

  // 3. Western Europe Hub (Thermal Gold #FFAE14 - 68% Heat)
  {
    id: 'emea-west',
    name: 'Western Europe (London / Paris / Berlin)',
    shortName: 'WESTERN EUROPE',
    location: [51.51, -0.13],
    center: [5.0, 50.5],
    countryCodes: ['GB', 'DE', 'FR', 'NL', 'BE', 'IE', 'ES', 'IT'],
    delay: 0.6,
    color: '#FFAE14',
    colorHex: '#FFAE14',
    heatPct: 68,
    status: 'High sales',
    label: 'Western Europe (Laakdal Hub)',
    volume: '$48.4k / 3.9x ROAS',
    velocityLabel: '+6.8% WoW',
    statusLabel: 'Solid Momentum',
    metricsSummary: '$48.4k Rev • 3.90x',
    roas: '3.90x',
    fulfillmentCenter: 'FC-EU-LAAKDAL (Laakdal, BE)',
    dots: [
      { name: 'London, UK', latitude: 51.5074, longitude: -0.1278, regionId: 'emea-west' },
      { name: 'Paris, FR', latitude: 48.8566, longitude: 2.3522, regionId: 'emea-west' },
      { name: 'Berlin, DE', latitude: 52.52, longitude: 13.405, regionId: 'emea-west' },
      { name: 'Amsterdam, NL', latitude: 52.3676, longitude: 4.9041, regionId: 'emea-west' },
      { name: 'Brussels, BE', latitude: 50.8503, longitude: 4.3517, regionId: 'emea-west' },
      { name: 'Madrid, ES', latitude: 40.4168, longitude: -3.7038, regionId: 'emea-west' },
      { name: 'Milan, IT', latitude: 45.4642, longitude: 9.19, regionId: 'emea-west' },
      { name: 'Dublin, IE', latitude: 53.3498, longitude: -6.2603, regionId: 'emea-west' },
    ],
    metrics: {
      spend: 12400,
      revenue: 48360,
      margin: 0.48, // Net margin revenue = $23,212.80, Profit = +$10,812.80
      conversions: 340,
      convProbability: 0.68,
      impressions: 72000,
      clicks: 3312,
      topProduct: {
        sku: '880848-005',
        name: 'Nike Zoom Fly',
        margin: 0.48,
        stockLevel: 410, // Healthy stock in DATASET.md
      },
      trend: {
        direction: 'up',
        percentage: 6.8,
      },
      recommendedAction: {
        action: 'Reroute cross-border UK shipments to Daventry hub to eliminate customs lag',
        expectedLift: '+$2,400 monthly margin gain',
      },
    },
  },

  // 4. Asia Pacific Hub (Thermal Yellow #F5DC2E - 54% Heat)
  {
    id: 'apac',
    name: 'Asia Pacific (Tokyo / Seoul / Sydney)',
    shortName: 'ASIA-PACIFIC',
    location: [35.68, 139.65],
    center: [138.0, 36.0],
    countryCodes: ['JP', 'KR', 'AU', 'NZ'],
    delay: 0.9,
    color: '#F5DC2E',
    colorHex: '#F5DC2E',
    heatPct: 54,
    status: 'Decreasing',
    label: 'Asia Pacific (Narita Hub)',
    volume: '$33.6k / 3.5x ROAS',
    velocityLabel: '-4.2% WoW',
    statusLabel: 'Moderate Velocity',
    metricsSummary: '$33.6k Rev • 3.50x',
    roas: '3.50x',
    fulfillmentCenter: 'FC-APAC-NARITA (Narita, JP)',
    dots: [
      { name: 'Tokyo, JP', latitude: 35.6762, longitude: 139.6503, regionId: 'apac' },
      { name: 'Osaka, JP', latitude: 34.6937, longitude: 135.5023, regionId: 'apac' },
      { name: 'Seoul, KR', latitude: 37.5665, longitude: 126.978, regionId: 'apac' },
      { name: 'Sydney, AU', latitude: -33.8688, longitude: 151.2093, regionId: 'apac' },
      { name: 'Melbourne, AU', latitude: -37.8136, longitude: 144.9631, regionId: 'apac' },
      { name: 'Auckland, NZ', latitude: -36.8485, longitude: 174.7633, regionId: 'apac' },
    ],
    metrics: {
      spend: 9600,
      revenue: 33600,
      margin: 0.42, // Net margin revenue = $14,112, Profit = +$4,512
      conversions: 230,
      convProbability: 0.54,
      impressions: 58000,
      clicks: 2320,
      topProduct: {
        sku: 'CD4371-001',
        name: 'Nike React Infinity Run Flyknit',
        margin: 0.42,
        stockLevel: 320, // Healthy stock in DATASET.md
      },
      trend: {
        direction: 'down',
        percentage: -4.2,
      },
      recommendedAction: {
        action: 'Throttle Google Search bids by 15% during off-peak JST morning hours',
        expectedLift: 'Conserves $1,150 ad spend',
      },
    },
  },

  // 5. South Asia Hub (Amber Yellow #EAB308 - 48% Heat)
  {
    id: 'south-asia',
    name: 'South Asia (Mumbai / Delhi / Bengaluru)',
    shortName: 'SOUTH ASIA',
    location: [19.07, 72.88],
    center: [78.9, 20.5],
    countryCodes: ['IN'],
    delay: 1.2,
    color: '#EAB308',
    colorHex: '#EAB308',
    heatPct: 48,
    status: 'Decreasing',
    label: 'South Asia (Bhiwandi Hub)',
    volume: '$19.4k / 3.6x ROAS',
    velocityLabel: '+9.4% WoW',
    statusLabel: 'Emerging Direct',
    metricsSummary: '$19.4k Rev • 3.60x',
    roas: '3.60x',
    fulfillmentCenter: 'FC-IN-BHIWANDI (Bhiwandi, Mumbai)',
    dots: [
      { name: 'Mumbai, IN', latitude: 19.076, longitude: 72.8777, regionId: 'south-asia' },
      { name: 'Delhi, IN', latitude: 28.6139, longitude: 77.209, regionId: 'south-asia' },
      { name: 'Bengaluru, IN', latitude: 12.9716, longitude: 77.5946, regionId: 'south-asia' },
      { name: 'Hyderabad, IN', latitude: 17.385, longitude: 78.4867, regionId: 'south-asia' },
      { name: 'Chennai, IN', latitude: 13.0827, longitude: 80.2707, regionId: 'south-asia' },
    ],
    metrics: {
      spend: 5400,
      revenue: 19440,
      margin: 0.44, // Net margin revenue = $8,553.60, Profit = +$3,153.60
      conversions: 195,
      convProbability: 0.52,
      impressions: 52000,
      clicks: 2444,
      topProduct: {
        sku: 'AO2924-401',
        name: 'Nike Air Zoom Pegasus 36',
        margin: 0.44,
        stockLevel: 280, // Healthy stock in DATASET.md
      },
      trend: {
        direction: 'up',
        percentage: 9.4,
      },
      recommendedAction: {
        action: 'Scale Shopify D2C UPI checkout remarketing funnel to cut cart abandonment',
        expectedLift: '+$1,850 profit lift',
      },
    },
  },

  // 6. Southeast Asia Hub (Cool Cyan #38BDF8 - 42% Heat)
  {
    id: 'sea',
    name: 'Southeast Asia (Singapore / Jakarta)',
    shortName: 'SE ASIA',
    location: [1.35, 103.82],
    center: [106.8, 1.3],
    countryCodes: ['SG', 'ID', 'TH', 'MY', 'PH', 'VN'],
    delay: 1.5,
    color: '#38BDF8',
    colorHex: '#38BDF8',
    heatPct: 42,
    status: 'Decreasing',
    label: 'SEA Hub (Changi Hub)',
    volume: '$22.4k / 3.3x ROAS',
    velocityLabel: '-2.1% WoW',
    statusLabel: 'Balanced Delivery',
    metricsSummary: '$22.4k Rev • 3.30x',
    roas: '3.30x',
    fulfillmentCenter: 'FC-SEA-CHANGI (Changi, SG)',
    dots: [
      { name: 'Singapore, SG', latitude: 1.3521, longitude: 103.8198, regionId: 'sea' },
      { name: 'Jakarta, ID', latitude: -6.2088, longitude: 106.8456, regionId: 'sea' },
      { name: 'Bangkok, TH', latitude: 13.7563, longitude: 100.5018, regionId: 'sea' },
      { name: 'Kuala Lumpur, MY', latitude: 3.139, longitude: 101.6869, regionId: 'sea' },
      { name: 'Manila, PH', latitude: 14.5995, longitude: 120.9842, regionId: 'sea' },
      { name: 'Ho Chi Minh, VN', latitude: 10.8231, longitude: 106.6297, regionId: 'sea' },
    ],
    metrics: {
      spend: 6800,
      revenue: 22440,
      margin: 0.4, // Net margin revenue = $8,976, Profit = +$2,176
      conversions: 178,
      convProbability: 0.46,
      impressions: 46000,
      clicks: 1886,
      topProduct: {
        sku: 'AO2924-401',
        name: 'Nike Air Zoom Pegasus 36',
        margin: 0.4,
        stockLevel: 190,
      },
      trend: {
        direction: 'down',
        percentage: -2.1,
      },
      recommendedAction: {
        action: 'Shift budget to TikTok Shop livestream campaigns in ID and TH',
        expectedLift: '+$1,220 margin lift',
      },
    },
  },

  // 7. Nordics Hub (Subdued Indigo-Grey #818CF8 - 32% Heat)
  {
    id: 'nordic',
    name: 'Nordics (Stockholm / Oslo / Helsinki)',
    shortName: 'NORDICS',
    location: [59.33, 18.06],
    center: [18.0, 59.3],
    countryCodes: ['SE', 'NO', 'DK', 'FI'],
    delay: 1.8,
    color: '#818CF8',
    colorHex: '#818CF8',
    heatPct: 32,
    status: 'Suppressed',
    label: 'Nordics (Arlanda Hub)',
    volume: '$17.6k / 4.2x ROAS',
    velocityLabel: 'NOMINAL',
    statusLabel: 'Cold / Stable',
    metricsSummary: '$17.6k Rev • 4.20x',
    roas: '4.20x',
    fulfillmentCenter: 'FC-EU-ARN (Stockholm Arlanda, SE)',
    dots: [
      { name: 'Stockholm, SE', latitude: 59.3293, longitude: 18.0686, regionId: 'nordic' },
      { name: 'Oslo, NO', latitude: 59.9139, longitude: 10.7522, regionId: 'nordic' },
      { name: 'Copenhagen, DK', latitude: 55.6761, longitude: 12.5683, regionId: 'nordic' },
      { name: 'Helsinki, FI', latitude: 60.1699, longitude: 24.9384, regionId: 'nordic' },
    ],
    metrics: {
      spend: 4200,
      revenue: 17640,
      margin: 0.45, // Net margin revenue = $7,938, Profit = +$3,738
      conversions: 115,
      convProbability: 0.58,
      impressions: 31000,
      clicks: 1209,
      topProduct: {
        sku: '880848-005',
        name: 'Nike Zoom Fly',
        margin: 0.45,
        stockLevel: 140,
      },
      trend: {
        direction: 'up',
        percentage: 1.4,
      },
      recommendedAction: {
        action: 'Maintain stable baseline; inventory fulfillment running at 99.4% SLA',
        expectedLift: 'Zero capital risk',
      },
    },
  },

  // 8. Latin America Hub (Dim Thermal Grey #71717A - Stockout Shock in DATASET.md)
  {
    id: 'latam',
    name: 'Latin America (São Paulo / Bogotá / CDMX)',
    shortName: 'LATAM',
    location: [-23.55, -46.63],
    center: [-46.6, -23.5],
    countryCodes: ['BR', 'AR', 'CL', 'MX', 'CO'],
    delay: 2.1,
    color: '#71717A',
    colorHex: '#71717A',
    heatPct: 16,
    status: 'Suppressed',
    label: 'LATAM (São Paulo Hub)',
    volume: '$3.8k / Stockout Shock',
    velocityLabel: 'STOCKOUT SHIELD',
    statusLabel: 'Stockout Shock (Shielded)',
    metricsSummary: '$3.8k Rev • 1.80x',
    roas: '1.80x',
    fulfillmentCenter: 'FC-LATAM-SAOPAULO (São Paulo, BR)',
    dots: [
      { name: 'São Paulo, BR', latitude: -23.5505, longitude: -46.6333, regionId: 'latam' },
      { name: 'Rio de Janeiro, BR', latitude: -22.9068, longitude: -43.1729, regionId: 'latam' },
      { name: 'Buenos Aires, AR', latitude: -34.6037, longitude: -58.3816, regionId: 'latam' },
      { name: 'Santiago, CL', latitude: -33.4489, longitude: -70.6693, regionId: 'latam' },
      { name: 'Mexico City, MX', latitude: 19.4326, longitude: -99.1332, regionId: 'latam' },
      { name: 'Bogotá, CO', latitude: 4.711, longitude: -74.0721, regionId: 'latam' },
    ],
    metrics: {
      spend: 2100,
      revenue: 3780,
      margin: 0.35, // Net margin revenue = $1,323, Profit = -$777 (Breakeven warning)
      conversions: 28,
      convProbability: 0.18,
      impressions: 18000,
      clicks: 360,
      topProduct: {
        sku: '310805-137',
        name: 'Air Jordan 10 Retro',
        margin: 0.35,
        stockLevel: 0, // 0 Baseline Inventory Stockout Shock from DATASET.md!
      },
      trend: {
        direction: 'down',
        percentage: -38.5,
      },
      recommendedAction: {
        action: 'Autonomous Circuit Breaker activated: Bids frozen on SKU 310805-137 until restocked',
        expectedLift: 'Shields $4,200/wk ad waste',
      },
    },
  },
];

export const REGION_HEATMAP_LIST = GLOBE_REGIONS;

export const REGION_HEATMAP_DATA: Record<string, PulseMarker> = Object.fromEntries(
  GLOBE_REGIONS.map((r) => [r.id, r])
);

export interface RecentPurchase {
  id: string;
  productName: string;
  sku: string;
  price: number;
  city: string;
  regionId: string;
  latitude: number;
  longitude: number;
  timeAgo: string;
  channel: 'meta' | 'google' | 'amazon' | 'shopify';
  channelLabel: string;
  fulfillmentHub: string;
}

/**
 * Real-time stream of recent purchases grounded in DATASET.md Table 2 & Section 5.
 * Coordinates match the exact dots on the 3D Orthographic Globe.
 */
export const ALL_RECENT_PURCHASES: RecentPurchase[] = [
  // 1. US East Hub Catchment
  {
    id: 'ord-us-1',
    productName: "Nike Air Force 1 '07",
    sku: '315122-001',
    price: 87.89,
    city: 'New York, NY',
    regionId: 'us-east',
    latitude: 40.7128,
    longitude: -74.006,
    timeAgo: 'Just now',
    channel: 'meta',
    channelLabel: 'Meta Adv+',
    fulfillmentHub: 'FC-EAST-ALLENTOWN',
  },
  {
    id: 'ord-us-2',
    productName: 'Air Jordan 1 Mid',
    sku: '554724-066',
    price: 125.0,
    city: 'Chicago, IL',
    regionId: 'us-east',
    latitude: 41.8781,
    longitude: -87.6298,
    timeAgo: '2m ago',
    channel: 'meta',
    channelLabel: 'Meta Adv+',
    fulfillmentHub: 'FC-EAST-ALLENTOWN',
  },
  {
    id: 'ord-us-3',
    productName: 'Nike Air Max 2017',
    sku: '849559-004',
    price: 192.71,
    city: 'Atlanta, GA',
    regionId: 'us-east',
    latitude: 33.749,
    longitude: -84.388,
    timeAgo: '4m ago',
    channel: 'google',
    channelLabel: 'Google PMax',
    fulfillmentHub: 'FC-EAST-ALLENTOWN',
  },
  {
    id: 'ord-us-4',
    productName: 'Nike Zoom Fly',
    sku: '880848-005',
    price: 174.64,
    city: 'Boston, MA',
    regionId: 'us-east',
    latitude: 42.3601,
    longitude: -71.0589,
    timeAgo: '7m ago',
    channel: 'shopify',
    channelLabel: 'Shopify Direct',
    fulfillmentHub: 'FC-EAST-ALLENTOWN',
  },
  {
    id: 'ord-us-5',
    productName: 'Nike React Infinity Run Flyknit',
    sku: 'CD4371-001',
    price: 168.61,
    city: 'Miami, FL',
    regionId: 'us-east',
    latitude: 25.7617,
    longitude: -80.1918,
    timeAgo: '9m ago',
    channel: 'meta',
    channelLabel: 'Meta Adv+',
    fulfillmentHub: 'FC-EAST-ALLENTOWN',
  },

  // 2. US West Hub Catchment
  {
    id: 'ord-usw-1',
    productName: 'Nike Air Max 270',
    sku: 'AH8050-100',
    price: 168.61,
    city: 'Los Angeles, CA',
    regionId: 'us-west',
    latitude: 34.0522,
    longitude: -118.2437,
    timeAgo: '35s ago',
    channel: 'amazon',
    channelLabel: 'Amazon SP',
    fulfillmentHub: 'FC-WEST-ONTARIO',
  },
  {
    id: 'ord-usw-2',
    productName: 'Nike Joyride Run Flyknit',
    sku: 'AQ2730-009',
    price: 180.0,
    city: 'San Francisco, CA',
    regionId: 'us-west',
    latitude: 37.7749,
    longitude: -122.4194,
    timeAgo: '1m ago',
    channel: 'amazon',
    channelLabel: 'Amazon SP',
    fulfillmentHub: 'FC-WEST-ONTARIO',
  },
  {
    id: 'ord-usw-3',
    productName: 'Nike Air Zoom Pegasus 36',
    sku: 'AO2924-401',
    price: 120.0,
    city: 'Seattle, WA',
    regionId: 'us-west',
    latitude: 47.6062,
    longitude: -122.3321,
    timeAgo: '5m ago',
    channel: 'google',
    channelLabel: 'Google PMax',
    fulfillmentHub: 'FC-WEST-ONTARIO',
  },
  {
    id: 'ord-usw-4',
    productName: "Nike Air Force 1 '07",
    sku: '315122-001',
    price: 87.89,
    city: 'Phoenix, AZ',
    regionId: 'us-west',
    latitude: 33.4484,
    longitude: -112.074,
    timeAgo: '8m ago',
    channel: 'shopify',
    channelLabel: 'Shopify Direct',
    fulfillmentHub: 'FC-WEST-ONTARIO',
  },

  // 3. Western Europe Catchment
  {
    id: 'ord-eu-1',
    productName: 'Nike Zoom Fly',
    sku: '880848-005',
    price: 174.64,
    city: 'London, UK',
    regionId: 'emea-west',
    latitude: 51.5074,
    longitude: -0.1278,
    timeAgo: 'Just now',
    channel: 'shopify',
    channelLabel: 'Shopify Direct',
    fulfillmentHub: 'FC-EU-DAVENTRY',
  },
  {
    id: 'ord-eu-2',
    productName: 'Nike Air Max 270',
    sku: 'AH8050-100',
    price: 168.61,
    city: 'Paris, FR',
    regionId: 'emea-west',
    latitude: 48.8566,
    longitude: 2.3522,
    timeAgo: '1m ago',
    channel: 'google',
    channelLabel: 'Google Shopping',
    fulfillmentHub: 'FC-EU-LAAKDAL',
  },
  {
    id: 'ord-eu-3',
    productName: 'Air Jordan 1 Mid',
    sku: '554724-066',
    price: 125.0,
    city: 'Berlin, DE',
    regionId: 'emea-west',
    latitude: 52.52,
    longitude: 13.405,
    timeAgo: '3m ago',
    channel: 'meta',
    channelLabel: 'Meta Adv+',
    fulfillmentHub: 'FC-EU-LAAKDAL',
  },
  {
    id: 'ord-eu-4',
    productName: 'Nike Air Max 2017',
    sku: '849559-004',
    price: 192.71,
    city: 'Amsterdam, NL',
    regionId: 'emea-west',
    latitude: 52.3676,
    longitude: 4.9041,
    timeAgo: '6m ago',
    channel: 'google',
    channelLabel: 'Google PMax',
    fulfillmentHub: 'FC-EU-LAAKDAL',
  },
  {
    id: 'ord-eu-5',
    productName: "Nike Air Force 1 '07",
    sku: '315122-001',
    price: 87.89,
    city: 'Madrid, ES',
    regionId: 'emea-west',
    latitude: 40.4168,
    longitude: -3.7038,
    timeAgo: '8m ago',
    channel: 'amazon',
    channelLabel: 'Amazon SP',
    fulfillmentHub: 'FC-EU-LAAKDAL',
  },

  // 4. Asia-Pacific Catchment
  {
    id: 'ord-apac-1',
    productName: 'Nike React Infinity Run Flyknit',
    sku: 'CD4371-001',
    price: 168.61,
    city: 'Tokyo, JP',
    regionId: 'apac',
    latitude: 35.6762,
    longitude: 139.6503,
    timeAgo: 'Just now',
    channel: 'google',
    channelLabel: 'Google PMax',
    fulfillmentHub: 'FC-APAC-NARITA',
  },
  {
    id: 'ord-apac-2',
    productName: 'Nike Air Zoom Pegasus 36',
    sku: 'AO2924-401',
    price: 120.0,
    city: 'Seoul, KR',
    regionId: 'apac',
    latitude: 37.5665,
    longitude: 126.978,
    timeAgo: '2m ago',
    channel: 'meta',
    channelLabel: 'Meta Adv+',
    fulfillmentHub: 'FC-APAC-NARITA',
  },
  {
    id: 'ord-apac-3',
    productName: 'Nike Joyride Run Flyknit',
    sku: 'AQ2730-009',
    price: 180.0,
    city: 'Sydney, AU',
    regionId: 'apac',
    latitude: -33.8688,
    longitude: 151.2093,
    timeAgo: '5m ago',
    channel: 'shopify',
    channelLabel: 'Shopify Direct',
    fulfillmentHub: 'FC-APAC-NARITA',
  },

  // 5. South Asia Catchment
  {
    id: 'ord-sa-1',
    productName: 'Nike Air Zoom Pegasus 36',
    sku: 'AO2924-401',
    price: 120.0,
    city: 'Mumbai, IN',
    regionId: 'south-asia',
    latitude: 19.076,
    longitude: 72.8777,
    timeAgo: '1m ago',
    channel: 'google',
    channelLabel: 'Google PMax',
    fulfillmentHub: 'FC-IN-BHIWANDI',
  },
  {
    id: 'ord-sa-2',
    productName: 'Nike Air Max 270',
    sku: 'AH8050-100',
    price: 168.61,
    city: 'Bengaluru, IN',
    regionId: 'south-asia',
    latitude: 12.9716,
    longitude: 77.5946,
    timeAgo: '4m ago',
    channel: 'meta',
    channelLabel: 'Meta Adv+',
    fulfillmentHub: 'FC-IN-BHIWANDI',
  },
  {
    id: 'ord-sa-3',
    productName: 'Air Jordan 1 Mid',
    sku: '554724-066',
    price: 125.0,
    city: 'New Delhi, IN',
    regionId: 'south-asia',
    latitude: 28.6139,
    longitude: 77.209,
    timeAgo: '6m ago',
    channel: 'amazon',
    channelLabel: 'Amazon SP',
    fulfillmentHub: 'FC-IN-BHIWANDI',
  },

  // 6. Southeast Asia Catchment
  {
    id: 'ord-sea-1',
    productName: 'Nike Air Zoom Pegasus 36',
    sku: 'AO2924-401',
    price: 120.0,
    city: 'Singapore, SG',
    regionId: 'sea',
    latitude: 1.3521,
    longitude: 103.8198,
    timeAgo: '2m ago',
    channel: 'meta',
    channelLabel: 'Meta Adv+',
    fulfillmentHub: 'FC-SEA-CHANGI',
  },
  {
    id: 'ord-sea-2',
    productName: 'Nike React Infinity Run Flyknit',
    sku: 'CD4371-001',
    price: 168.61,
    city: 'Bangkok, TH',
    regionId: 'sea',
    latitude: 13.7563,
    longitude: 100.5018,
    timeAgo: '5m ago',
    channel: 'google',
    channelLabel: 'Google Shopping',
    fulfillmentHub: 'FC-SEA-CHANGI',
  },

  // 7. Nordics Catchment
  {
    id: 'ord-nord-1',
    productName: 'Nike Zoom Fly',
    sku: '880848-005',
    price: 174.64,
    city: 'Stockholm, SE',
    regionId: 'nordic',
    latitude: 59.3293,
    longitude: 18.0686,
    timeAgo: '3m ago',
    channel: 'shopify',
    channelLabel: 'Shopify Direct',
    fulfillmentHub: 'FC-EU-ARN',
  },
  {
    id: 'ord-nord-2',
    productName: 'Nike Air Max 2017',
    sku: '849559-004',
    price: 192.71,
    city: 'Oslo, NO',
    regionId: 'nordic',
    latitude: 59.9139,
    longitude: 10.7522,
    timeAgo: '7m ago',
    channel: 'google',
    channelLabel: 'Google PMax',
    fulfillmentHub: 'FC-EU-ARN',
  },

  // 8. Latin America Catchment
  {
    id: 'ord-latam-1',
    productName: 'Air Jordan 10 Retro',
    sku: '310805-137',
    price: 192.71,
    city: 'São Paulo, BR',
    regionId: 'latam',
    latitude: -23.5505,
    longitude: -46.6333,
    timeAgo: 'Just now',
    channel: 'shopify',
    channelLabel: 'Shopify Direct',
    fulfillmentHub: 'FC-LATAM-SAOPAULO',
  },
  {
    id: 'ord-latam-2',
    productName: 'Nike Air Max 270',
    sku: 'AH8050-100',
    price: 168.61,
    city: 'Buenos Aires, AR',
    regionId: 'latam',
    latitude: -34.6037,
    longitude: -58.3816,
    timeAgo: '3m ago',
    channel: 'amazon',
    channelLabel: 'Amazon SP',
    fulfillmentHub: 'FC-LATAM-SAOPAULO',
  },
  {
    id: 'ord-latam-3',
    productName: "Nike Air Force 1 '07",
    sku: '315122-001',
    price: 87.89,
    city: 'Mexico City, MX',
    regionId: 'latam',
    latitude: 19.4326,
    longitude: -99.1332,
    timeAgo: '6m ago',
    channel: 'meta',
    channelLabel: 'Meta Adv+',
    fulfillmentHub: 'FC-LATAM-SAOPAULO',
  },
];

export const RECENT_PURCHASES: RecentPurchase[] = ALL_RECENT_PURCHASES;


