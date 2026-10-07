export type HubPlatform = 'all' | 'meta' | 'google' | 'tiktok' | 'amazon' | 'blended';

export interface EdgeDeliveryHub {
  id: string;
  code: string;
  name: string;
  city: string;
  location: [number, number]; // [lat, lon]
  platform: 'meta' | 'google' | 'tiktok' | 'amazon' | 'blended';
  platformLabel: string;
  latencyMs: number;
  jitterMs: number;
  p99Ms: number;
  throughputReqSec: number;
  impressionsRate: string;
  fillRatePct: number;
  packetLossPct: number;
  cacheHitPct: number;
  status: 'OPTIMAL' | 'HEALTHY' | 'DEGRADED';
  color: [number, number, number]; // RGB 0..1 for cobe marker
  hexColor: string;
  description: string;
  connectedPeerIds: string[];
}

export interface HubArc {
  id: string;
  fromId: string;
  toId: string;
  from: [number, number];
  to: [number, number];
  platform: HubPlatform;
  latencyMs: number;
}

export const EDGE_HUBS: EdgeDeliveryHub[] = [
  {
    id: 'us-east',
    code: 'US-EAST',
    name: 'US East (Ashburn / NY)',
    city: 'Ashburn, VA / New York',
    location: [40.7128, -74.006],
    platform: 'meta',
    platformLabel: 'Meta Advantage+ & Google Ads Core',
    latencyMs: 24,
    jitterMs: 1.2,
    p99Ms: 31,
    throughputReqSec: 48200,
    impressionsRate: '48.2k imp/s',
    fillRatePct: 99.8,
    packetLossPct: 0.01,
    cacheHitPct: 95.4,
    status: 'OPTIMAL',
    color: [0.2, 0.85, 0.95],
    hexColor: '#38bdf8',
    description: 'Primary North American ad ingestion gateway. Direct low-latency peering with Meta Graph API and Google DoubleClick Ad Exchange.',
    connectedPeerIds: ['us-west', 'emea-lon', 'eu-fra']
  },
  {
    id: 'us-west',
    code: 'US-WEST',
    name: 'US West (SF / Oregon)',
    city: 'San Francisco, CA',
    location: [37.7749, -122.4194],
    platform: 'meta',
    platformLabel: 'Meta Ads & TikTok Pulse Edge',
    latencyMs: 18,
    jitterMs: 0.8,
    p99Ms: 23,
    throughputReqSec: 36800,
    impressionsRate: '36.8k imp/s',
    fillRatePct: 99.9,
    packetLossPct: 0.005,
    cacheHitPct: 96.2,
    status: 'OPTIMAL',
    color: [0.3, 0.9, 0.8],
    hexColor: '#2dd4bf',
    description: 'Silicon Valley edge node with ultra-low latency connection to TikTok For Business and Meta Menlo Park cluster.',
    connectedPeerIds: ['us-east', 'apac-tyo']
  },
  {
    id: 'emea-lon',
    code: 'EMEA-LON',
    name: 'EMEA North (London)',
    city: 'London, UK',
    location: [51.5074, -0.1278],
    platform: 'google',
    platformLabel: 'Google Shopping & Amazon DSP',
    latencyMs: 38,
    jitterMs: 1.8,
    p99Ms: 46,
    throughputReqSec: 29400,
    impressionsRate: '29.4k imp/s',
    fillRatePct: 99.4,
    packetLossPct: 0.02,
    cacheHitPct: 94.1,
    status: 'OPTIMAL',
    color: [0.4, 0.7, 1.0],
    hexColor: '#60a5fa',
    description: 'European retail ad bidding node. Handles GDPR-compliant telemetry filtering and cookie-less first-party attribution.',
    connectedPeerIds: ['us-east', 'eu-fra']
  },
  {
    id: 'eu-fra',
    code: 'EU-CENTRAL',
    name: 'EU Central (Frankfurt)',
    city: 'Frankfurt, Germany',
    location: [50.1109, 8.6821],
    platform: 'amazon',
    platformLabel: 'Amazon DSP & Criteo Relay',
    latencyMs: 42,
    jitterMs: 1.5,
    p99Ms: 51,
    throughputReqSec: 22100,
    impressionsRate: '22.1k imp/s',
    fillRatePct: 99.7,
    packetLossPct: 0.015,
    cacheHitPct: 93.8,
    status: 'OPTIMAL',
    color: [0.6, 0.5, 1.0],
    hexColor: '#a78bfa',
    description: 'Central European interconnection point hosting real-time bidding DSP relays with sub-50ms deterministic latency.',
    connectedPeerIds: ['emea-lon', 'india-bom']
  },
  {
    id: 'apac-tyo',
    code: 'APAC-TYO',
    name: 'APAC North (Tokyo)',
    city: 'Tokyo, Japan',
    location: [35.6762, 139.6503],
    platform: 'google',
    platformLabel: 'Google APAC & Yahoo Japan',
    latencyMs: 64,
    jitterMs: 2.4,
    p99Ms: 78,
    throughputReqSec: 18900,
    impressionsRate: '18.9k imp/s',
    fillRatePct: 98.9,
    packetLossPct: 0.04,
    cacheHitPct: 91.5,
    status: 'HEALTHY',
    color: [0.95, 0.75, 0.25],
    hexColor: '#facc15',
    description: 'Tokyo gateway connecting Trans-Pacific ad streams to high-AOV Asian consumer markets and mobile commerce apps.',
    connectedPeerIds: ['us-west', 'sea-sgp']
  },
  {
    id: 'sea-sgp',
    code: 'SEA-SGP',
    name: 'Southeast Asia (Singapore)',
    city: 'Singapore',
    location: [1.3521, 103.8198],
    platform: 'tiktok',
    platformLabel: 'TikTok SEA & Shopee Ads',
    latencyMs: 82,
    jitterMs: 3.1,
    p99Ms: 98,
    throughputReqSec: 14100,
    impressionsRate: '14.1k imp/s',
    fillRatePct: 99.2,
    packetLossPct: 0.03,
    cacheHitPct: 92.4,
    status: 'HEALTHY',
    color: [0.2, 0.85, 0.5],
    hexColor: '#34d399',
    description: 'Southeast Asian high-frequency mobile commerce bridge routing social video conversion signals and livestream sales.',
    connectedPeerIds: ['apac-tyo', 'india-bom', 'oce-syd']
  },
  {
    id: 'india-bom',
    code: 'INDIA-BOM',
    name: 'India Direct (Mumbai)',
    city: 'Mumbai, India',
    location: [19.076, 72.8777],
    platform: 'blended',
    platformLabel: 'Meta Direct & Google Ads India',
    latencyMs: 56,
    jitterMs: 2.0,
    p99Ms: 69,
    throughputReqSec: 16500,
    impressionsRate: '16.5k imp/s',
    fillRatePct: 99.1,
    packetLossPct: 0.02,
    cacheHitPct: 93.0,
    status: 'OPTIMAL',
    color: [0.35, 0.8, 0.95],
    hexColor: '#38bdf8',
    description: 'Direct Indian market ad telemetry nexus capturing festive surge and localized flash-sale checkout spikes.',
    connectedPeerIds: ['eu-fra', 'sea-sgp']
  },
  {
    id: 'oce-syd',
    code: 'OCE-SYD',
    name: 'Oceania (Sydney)',
    city: 'Sydney, Australia',
    location: [-33.8688, 151.2093],
    platform: 'blended',
    platformLabel: 'ANZ Multi-Platform Edge',
    latencyMs: 112,
    jitterMs: 3.8,
    p99Ms: 134,
    throughputReqSec: 8300,
    impressionsRate: '8.3k imp/s',
    fillRatePct: 98.5,
    packetLossPct: 0.05,
    cacheHitPct: 90.2,
    status: 'HEALTHY',
    color: [0.8, 0.6, 0.95],
    hexColor: '#c084fc',
    description: 'Australasian edge node managing southern hemisphere retargeting pools and seasonal campaign synchronization.',
    connectedPeerIds: ['sea-sgp']
  }
];

export const HUB_ARCS: HubArc[] = [
  {
    id: 'arc-sf-ny',
    fromId: 'us-west',
    toId: 'us-east',
    from: [37.7749, -122.4194],
    to: [40.7128, -74.006],
    platform: 'meta',
    latencyMs: 34
  },
  {
    id: 'arc-ny-lon',
    fromId: 'us-east',
    toId: 'emea-lon',
    from: [40.7128, -74.006],
    to: [51.5074, -0.1278],
    platform: 'google',
    latencyMs: 62
  },
  {
    id: 'arc-lon-fra',
    fromId: 'emea-lon',
    toId: 'eu-fra',
    from: [51.5074, -0.1278],
    to: [50.1109, 8.6821],
    platform: 'amazon',
    latencyMs: 14
  },
  {
    id: 'arc-fra-bom',
    fromId: 'eu-fra',
    toId: 'india-bom',
    from: [50.1109, 8.6821],
    to: [19.076, 72.8777],
    platform: 'blended',
    latencyMs: 78
  },
  {
    id: 'arc-bom-sgp',
    fromId: 'india-bom',
    toId: 'sea-sgp',
    from: [19.076, 72.8777],
    to: [1.3521, 103.8198],
    platform: 'tiktok',
    latencyMs: 44
  },
  {
    id: 'arc-sgp-tyo',
    fromId: 'sea-sgp',
    toId: 'apac-tyo',
    from: [1.3521, 103.8198],
    to: [35.6762, 139.6503],
    platform: 'google',
    latencyMs: 58
  },
  {
    id: 'arc-tyo-sf',
    fromId: 'apac-tyo',
    toId: 'us-west',
    from: [35.6762, 139.6503],
    to: [37.7749, -122.4194],
    platform: 'meta',
    latencyMs: 96
  },
  {
    id: 'arc-sgp-syd',
    fromId: 'sea-sgp',
    toId: 'oce-syd',
    from: [1.3521, 103.8198],
    to: [-33.8688, 151.2093],
    platform: 'blended',
    latencyMs: 88
  }
];

export function getArcsForPlatform(platform: HubPlatform): HubArc[] {
  if (platform === 'all') return HUB_ARCS;
  return HUB_ARCS.filter(
    (arc) => arc.platform === platform || arc.platform === 'blended'
  );
}
