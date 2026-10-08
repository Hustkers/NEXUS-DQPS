export type ChannelType = 'Google' | 'Amazon' | 'Meta' | 'Shopify';

export type ProductStatus = 'stockout' | 'low stock' | 'below floor' | 'below target' | 'target met' | 'fixed';

export interface ProductModel {
  id: string;
  name: string;
  channel: ChannelType;
  inventory: number;
  dailyUnitsSold: number;
  dailySpend: number; // in USD ($800 - $4,500/day)
  roas: number;       // 1.5x - 4.5x
  cpc: number;
  cvr: number;
  photoUrl?: string;
  sku?: string;
  category?: string;
  unit_cogs?: number;
  msrp?: number;
  asin?: string;
  variant_id?: string;
  // Dynamic execution/budget tracking
  initialDailySpend?: number;
  addedSpendFromReallocations?: number; // Tracks cumulative +50% cap
  isFixed?: boolean;
  fixedAt?: string;
  paused?: boolean;
  restockUnitsOrdered?: number;
  reorderAlertSent?: boolean;
  appliedPlan?: FixPlanSummary;
}

export type ProductCampaign = ProductModel;

export interface DerivedProduct extends ProductModel {
  coverDays: number;
  status: ProductStatus;
  healthScore: number;
  revenue: number;
  effectiveStatus: ProductStatus;
  footerSummary: string;
}

export interface FixStep {
  title: string;
  description: string;
  before: string;
  after: string;
}

export interface ResultTile {
  label: string;
  before: string;
  after: string;
}

export interface FixPlanSummary {
  issueType: 'stockout' | 'low_stock' | 'below_floor' | 'below_target';
  issueBanner: string;
  evidence: string[];
  steps: FixStep[];
  resultTiles: ResultTile[];
  projectionNote: string;
  receivingProductId: string;
  receivingProductName: string;
  reallocatedSpend: number;
  projectedRoas?: number;
  cappedSpend?: number;
  newSpend?: number;
  restockUnits?: number;
  actionTakenText: string;
  outcomeText: string;
}

export interface ReallocationItem {
  id: string;
  sourceProductId: string;
  targetProductId: string;
  sourceCampaign: string;
  targetCampaign: string;
  sourceProductName: string;
  targetProductName: string;
  sourceChannel: ChannelType;
  targetChannel: ChannelType;
  actionTag: 'PAUSE' | 'TRIM' | 'REDIRECT';
  sourceSpendBefore: number;
  sourceSpendAfter: number;
  targetSpendBefore: number;
  targetSpendAfter: number;
  movedAmount: number;
  sourceRoas: number;
  targetRoas: number;
  targetMarginalRoas: number;
  netRevenueLift: number;
  confidence: number; // 40 to 95
  reason: string;
  status: 'PENDING_APPROVAL' | 'EXECUTED_TO_AD_API' | 'HEURISTIC_OVERRIDE' | string;

  // Compatibility fields for legacy consumers
  actionType?: string;
  currentSpend?: number;
  recommendedSpend?: number;
  deltaSpend?: number;
  predictedRoas?: number;
  expectedDailyMargin?: number;
  stockoutKill?: boolean;
}

export interface GaugesLedgerItem {
  id: string;
  timestamp: string;
  product: string;
  channel: ChannelType;
  issue: string;
  actionTaken: string;
  outcome: string;
  isAuto?: boolean;
}

export const FLOOR_ROAS = 1.8;
export const TARGET_ROAS = 3.2;

/**
 * Standard USD currency formatter:
 * Formats amount with US grouping and "/day", e.g. "$2,500/day".
 */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `$${rounded.toLocaleString('en-US')}/day`;
}

// Keep formatINR alias for backwards compatibility
export const formatINR = formatCurrency;

/**
 * Single source of truth for channel branding (icon, label, color):
 * Google, Amazon, Meta, Shopify.
 */
export interface ChannelMeta {
  name: ChannelType;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export function getChannelMeta(channel: ChannelType | string): ChannelMeta {
  const norm = (channel || 'meta').toLowerCase();
  switch (norm) {
    case 'google':
      return {
        name: 'Google',
        color: '#10B981',
        badgeBg: 'bg-emerald-950/40',
        badgeBorder: 'border-emerald-800/50',
        badgeText: 'text-emerald-400',
      };
    case 'amazon':
      return {
        name: 'Amazon',
        color: '#F59E0B',
        badgeBg: 'bg-amber-950/40',
        badgeBorder: 'border-amber-800/50',
        badgeText: 'text-amber-400',
      };
    case 'meta':
      return {
        name: 'Meta',
        color: '#3B82F6',
        badgeBg: 'bg-blue-950/40',
        badgeBorder: 'border-blue-800/50',
        badgeText: 'text-blue-400',
      };
    case 'shopify':
      return {
        name: 'Shopify',
        color: '#96BF48',
        badgeBg: 'bg-lime-950/40',
        badgeBorder: 'border-lime-800/50',
        badgeText: 'text-lime-400',
      };
    default:
      return {
        name: 'Meta',
        color: '#3B82F6',
        badgeBg: 'bg-blue-950/40',
        badgeBorder: 'border-blue-800/50',
        badgeText: 'text-blue-400',
      };
  }
}

/**
 * Derives one-line card footer summary directly from product telemetry.
 * e.g. healthy: "On track · 35d cover · room to add ~$500/day"
 * stockout: "Sold out · $2,800/day spent with no sales"
 */
export function getProductFooterSummary(
  status: ProductStatus,
  dailySpend: number,
  coverDays: number,
  roas: number,
  isFixed: boolean,
  paused?: boolean,
  restockUnits?: number
): string {
  if (isFixed) {
    return paused
      ? `Paused · Restock: ${restockUnits || 0} units ordered`
      : 'Fixed · Optimized & budget reallocated';
  }
  if (status === 'stockout') {
    return `Sold out · ${formatCurrency(dailySpend)} spent with no sales`;
  }
  if (status === 'low stock') {
    return `Critical runway · ${coverDays.toFixed(1)}d cover · throttle spend`;
  }
  if (status === 'below floor') {
    return `Losing margin · ${roas.toFixed(2)}x ROAS below 1.8x floor`;
  }
  if (status === 'below target') {
    return `Sub-optimal · ${roas.toFixed(2)}x ROAS trails 3.2x target`;
  }
  // Target met (Healthy)
  const roomToAdd = Math.max(200, Math.round((dailySpend * 0.25) / 50) * 50);
  return `On track · ${coverDays.toFixed(0)}d cover · room to add ~$${roomToAdd}/day`;
}

/**
 * Derives dynamic metrics from the product state:
 * - coverDays = dailyUnitsSold > 0 ? inventory / dailyUnitsSold : 0
 * - status (priority order):
 *     1. stockout (inventory 0)
 *     2. low stock (cover < 7 days)
 *     3. below floor (ROAS < 1.8)
 *     4. below target (ROAS < 3.2)
 *     5. target met
 * - health score = min(100, roas/3.2*80)*0.7 + min(100, coverDays/14*100)*0.3 (continuous values)
 * - zero inventory guard: stockout can NEVER look healthy.
 */
export function deriveProduct(product: ProductModel): DerivedProduct {
  const coverDays = product.dailyUnitsSold > 0 ? product.inventory / product.dailyUnitsSold : 0;

  let baseStatus: ProductStatus = 'target met';
  if (product.inventory <= 0) {
    baseStatus = 'stockout';
  } else if (coverDays < 7) {
    baseStatus = 'low stock';
  } else if (product.roas < FLOOR_ROAS) {
    baseStatus = 'below floor';
  } else if (product.roas < TARGET_ROAS) {
    baseStatus = 'below target';
  } else {
    baseStatus = 'target met';
  }

  // Continuous health score calculation
  const roasComponent = Math.min(100, (product.roas / TARGET_ROAS) * 80) * 0.7;
  const coverComponent = Math.min(100, (coverDays / 14) * 100) * 0.3;
  let rawHealth = roasComponent + coverComponent;

  // Zero inventory guard: ensure health score is strictly capped (< 25) during stockouts
  if (product.inventory <= 0) {
    rawHealth = Math.min(rawHealth, 18);
  }

  const healthScore = Math.round(Math.min(100, Math.max(0, rawHealth)));
  const revenue = product.dailySpend * product.roas;
  const effectiveStatus = product.isFixed ? 'fixed' : baseStatus;
  const footerSummary = getProductFooterSummary(
    baseStatus,
    product.dailySpend,
    coverDays,
    product.roas,
    !!product.isFixed,
    product.paused,
    product.restockUnitsOrdered
  );

  return {
    ...product,
    initialDailySpend: product.initialDailySpend ?? product.dailySpend,
    addedSpendFromReallocations: product.addedSpendFromReallocations ?? 0,
    coverDays,
    status: baseStatus,
    healthScore: product.isFixed ? Math.max(healthScore, 85) : healthScore,
    revenue,
    effectiveStatus,
    footerSummary,
  };
}

/**
 * Seed dataset of 12 realistic Nike footwear products strictly grounded in DATASET.md.
 * Mix: 7 healthy, 2 stockouts, 1 low-stock, 1 below-target, 1 below-floor.
 * Spend: $1,600 - $3,900/day. ROAS: 1.5x - 4.25x.
 * Cover days span 0 to ~57 days.
 */
export const INITIAL_PRODUCTS: ProductModel[] = [
  // 1. Stockout #1 (Meta) - Canonical Stockout Shock SKU 310805-137
  {
    id: 'nike-aj10-retro',
    name: 'Air Jordan 10 Retro',
    channel: 'Meta',
    inventory: 0,
    dailyUnitsSold: 18,
    dailySpend: 2800,
    initialDailySpend: 2800,
    roas: 2.35,
    cpc: 2.45,
    cvr: 0.032,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/ccsubyw6lzx10virtjdu/air-jordan-10-retro-shoe-f3jBkN.jpg',
    sku: '310805-137',
    category: 'Jordan',
    unit_cogs: 69.88,
    msrp: 192.71,
    asin: 'B07Q8Z9101',
    variant_id: 'gid://shopify/ProductVariant/41001',
  },
  // 2. Stockout #2 (Google) - Air Force 1 '07 Stockout Set
  {
    id: 'nike-af1-07-stockout',
    name: "Nike Air Force 1 '07",
    channel: 'Google',
    inventory: 0,
    dailyUnitsSold: 24,
    dailySpend: 3700,
    initialDailySpend: 3700,
    roas: 2.15,
    cpc: 3.12,
    cvr: 0.028,
    photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/oplkqwyf7nwnj98f8agj/air-force-1-07-shoe-PATZxx4V.jpg',
    sku: '315122-001',
    category: 'Lifestyle',
    unit_cogs: 37.95,
    msrp: 87.89,
    asin: 'B07Q8Z9104',
    variant_id: 'gid://shopify/ProductVariant/41004',
  },
  // 3. Low Stock #1 (Amazon) - cover: 36 / 8 = 4.5 days (< 7 days)
  {
    id: 'nike-zoom-fly-lowstock',
    name: 'Nike Zoom Fly',
    channel: 'Amazon',
    inventory: 36,
    dailyUnitsSold: 8,
    dailySpend: 2300,
    initialDailySpend: 2300,
    roas: 2.85,
    cpc: 2.18,
    cvr: 0.038,
    photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/x6jwtxaf3brhu6jisuf5/zoom-fly-running-shoe-OZEAxq.jpg',
    sku: '880848-005',
    category: 'Running',
    unit_cogs: 63.25,
    msrp: 174.64,
    asin: 'B07Q8Z9102',
    variant_id: 'gid://shopify/ProductVariant/41002',
  },
  // 4. Below Floor #1 (Shopify) - ROAS: 1.58x (< 1.8 floor)
  {
    id: 'nike-pegasus-36-floor',
    name: 'Nike Air Zoom Pegasus 36',
    channel: 'Shopify',
    inventory: 340,
    dailyUnitsSold: 10,
    dailySpend: 3100,
    initialDailySpend: 3100,
    roas: 1.58,
    cpc: 2.82,
    cvr: 0.021,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/h3k78h4zr7h09mccxl9j/air-zoom-pegasus-36-rise-running-shoe-TQKcdK.jpg',
    sku: 'AO2924-401',
    category: 'Running',
    unit_cogs: 54.22,
    msrp: 154.18,
    asin: 'B07Q8Z9105',
    variant_id: 'gid://shopify/ProductVariant/41005',
  },
  // 5. Below Target #1 (Meta) - ROAS: 2.65x (1.8 <= ROAS < 3.2)
  {
    id: 'nike-air-max-270-target',
    name: 'Nike Air Max 270',
    channel: 'Meta',
    inventory: 360,
    dailyUnitsSold: 12,
    dailySpend: 2600,
    initialDailySpend: 2600,
    roas: 2.65,
    cpc: 2.14,
    cvr: 0.029,
    photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/awjogtdnqxniqqk0wpgf/air-max-270-shoe-2V5C4p.jpg',
    sku: 'AH8050-100',
    category: 'Lifestyle',
    unit_cogs: 57.83,
    msrp: 168.61,
    asin: 'B07Q8Z9103',
    variant_id: 'gid://shopify/ProductVariant/41003',
  },
  // 6. Healthy #1 (Meta)
  {
    id: 'nike-af1-07-healthy',
    name: "Nike Air Force 1 '07",
    channel: 'Meta',
    inventory: 520,
    dailyUnitsSold: 17,
    dailySpend: 3900,
    initialDailySpend: 3900,
    roas: 3.80,
    cpc: 1.95,
    cvr: 0.044,
    photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/oplkqwyf7nwnj98f8agj/air-force-1-07-shoe-PATZxx4V.jpg',
    sku: '315122-001',
    category: 'Lifestyle',
    unit_cogs: 37.95,
    msrp: 87.89,
    asin: 'B07Q8Z9104',
    variant_id: 'gid://shopify/ProductVariant/41004',
  },
  // 7. Healthy #2 (Google)
  {
    id: 'nike-react-infinity',
    name: 'Nike React Infinity Run Flyknit',
    channel: 'Google',
    inventory: 320,
    dailyUnitsSold: 11,
    dailySpend: 3400,
    initialDailySpend: 3400,
    roas: 4.25,
    cpc: 2.20,
    cvr: 0.048,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/ddb4c566-fcb0-47c0-8184-323ad9edff37/react-infinity-run-flyknit-running-shoe-ZjGHFz.jpg',
    sku: 'CD4371-001',
    category: 'Running',
    unit_cogs: 69.88,
    msrp: 168.61,
    asin: 'B07Q8Z9107',
    variant_id: 'gid://shopify/ProductVariant/41007',
  },
  // 8. Healthy #3 (Amazon)
  {
    id: 'nike-zoom-fly-healthy',
    name: 'Nike Zoom Fly',
    channel: 'Amazon',
    inventory: 410,
    dailyUnitsSold: 14,
    dailySpend: 2900,
    initialDailySpend: 2900,
    roas: 3.65,
    cpc: 1.84,
    cvr: 0.041,
    photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/x6jwtxaf3brhu6jisuf5/zoom-fly-running-shoe-OZEAxq.jpg',
    sku: '880848-005',
    category: 'Running',
    unit_cogs: 63.25,
    msrp: 174.64,
    asin: 'B07Q8Z9102',
    variant_id: 'gid://shopify/ProductVariant/41002',
  },
  // 9. Healthy #4 (Shopify)
  {
    id: 'nike-pegasus-36-healthy',
    name: 'Nike Air Zoom Pegasus 36',
    channel: 'Shopify',
    inventory: 280,
    dailyUnitsSold: 13,
    dailySpend: 2700,
    initialDailySpend: 2700,
    roas: 3.50,
    cpc: 2.05,
    cvr: 0.039,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/h3k78h4zr7h09mccxl9j/air-zoom-pegasus-36-rise-running-shoe-TQKcdK.jpg',
    sku: 'AO2924-401',
    category: 'Running',
    unit_cogs: 54.22,
    msrp: 154.18,
    asin: 'B07Q8Z9105',
    variant_id: 'gid://shopify/ProductVariant/41005',
  },
  // 10. Healthy #5 (Google)
  {
    id: 'nike-air-max-2017',
    name: 'Nike Air Max 2017',
    channel: 'Google',
    inventory: 450,
    dailyUnitsSold: 15,
    dailySpend: 2100,
    initialDailySpend: 2100,
    roas: 3.45,
    cpc: 2.10,
    cvr: 0.036,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/bbbwgncnxexhwgbz8qbp/air-max-2017-shoe-MkTmxxOd.jpg',
    sku: '849559-004',
    category: 'Running',
    unit_cogs: 66.27,
    msrp: 192.71,
    asin: 'B07Q8Z9106',
    variant_id: 'gid://shopify/ProductVariant/41006',
  },
  // 11. Healthy #6 (Amazon)
  {
    id: 'nike-epic-react',
    name: 'Nike Epic React Flyknit 2',
    channel: 'Amazon',
    inventory: 600,
    dailyUnitsSold: 16,
    dailySpend: 1600,
    initialDailySpend: 1600,
    roas: 3.55,
    cpc: 1.92,
    cvr: 0.037,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/akktdiniehnrjqoibfaw/epic-react-flyknit-2-running-shoe-ShRZnm.jpg',
    sku: 'BQ8928-011',
    category: 'Running',
    unit_cogs: 46.99,
    msrp: 125.27,
    asin: 'B07Q8Z9108',
    variant_id: 'gid://shopify/ProductVariant/41008',
  },
  // 12. Healthy #7 (Shopify) - Canonical Nike Joyride Run Flyknit
  {
    id: 'nike-joyride-run',
    name: 'Nike Joyride Run Flyknit',
    channel: 'Shopify',
    inventory: 310,
    dailyUnitsSold: 12,
    dailySpend: 1800,
    initialDailySpend: 1800,
    roas: 3.70,
    cpc: 1.75,
    cvr: 0.042,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/i1-b714d0a4-53ed-4919-9761-1bddc5dff48f/joyride-run-flyknit-running-shoe-sqfqGQ.jpg',
    sku: 'AT5405-001',
    category: 'Running',
    unit_cogs: 62.65,
    msrp: 180.66,
    asin: 'B07Q8Z9110',
    variant_id: 'gid://shopify/ProductVariant/41010',
  },
];

export const INITIAL_LEDGER: GaugesLedgerItem[] = [
  {
    id: 'ledg-init-1',
    timestamp: '2026-10-07 20:14:02',
    product: 'Air Jordan 10 Retro',
    channel: 'Meta',
    issue: 'Sub-floor ROAS (1.64x)',
    actionTaken: 'Pruned bottom 35% ad sets; reallocated $980/day to Nike React Infinity Run Flyknit',
    outcome: '+0.72x ROAS lift, $2,840/day ad spend efficiency calibrated',
  },
  {
    id: 'ledg-init-2',
    timestamp: '2026-10-07 18:30:45',
    product: 'Air Jordan 10 Retro',
    channel: 'Amazon',
    issue: 'Critical Stockout (0 units)',
    actionTaken: 'Paused ad sets ($0/day); shifted $2,200/day to Nike Zoom Fly; raised restock PO for 378 units',
    outcome: 'Eliminated $2,200/day ad waste; 100% budget protected',
    isAuto: true,
  },
];

/**
 * PURE FUNCTION: generateReallocations
 * Generates autonomous capital reallocation recommendations from real product telemetry.
 *
 * Requirements:
 * - Moves budget FROM: stockout, low stock, below floor, or below target campaigns.
 * - Moves budget TO: campaigns with ROAS >= 3.2x and >= 21 days cover.
 * - Never send money to a below-target or low-stock product.
 * - Prefer the same channel when options are close.
 * - Move size: 20–35% of source daily spend (stockout: pause fully, move 80%).
 * - Cap any destination increase at +50% of its initial daily spend.
 * - Destination marginal ROAS = destination ROAS * 0.85 (diminishing returns).
 * - Net revenue lift/day = movedAmount * (destMarginalRoas - sourceRoas).
 * - Confidence %: clamp(50 + 10*(destRoas - srcRoas) + min(15, destCoverDays/3) + (sameChannel ? 5 : 0), 40, 95).
 */
/**
 * Calculates analytical marginal ROAS under Hill saturation diminishing returns:
 * dRev / dSpend based on Hill parameters calibrated to Nike Footwear auction curves:
 * R(x) = (R_max * x^eta) / (K^eta + x^eta)
 * Analytical derivative: dR/dx = R_max * eta * K^eta * x^(eta-1) / (K^eta + x^eta)^2
 * For incremental allocation Δx, Marginal ROAS = (R(x + Δx) - R(x)) / Δx.
 */
export function calculateMarginalRoas(
  baseRoas: number,
  currentSpend: number,
  deltaSpend: number = 500
): number {
  if (currentSpend <= 0) return baseRoas;
  // Calibrated Hill parameters for Tier-1 Nike Footwear campaigns
  // Half-saturation spend K = $4,000/day, Hill exponent eta = 1.25
  const K = 4000;
  const eta = 1.25;
  // Target base revenue yield at current spend
  const x = currentSpend;
  const xB = Math.pow(x, eta);
  const KB = Math.pow(K, eta);
  // Yield scale R_max calibrated so that R(x)/x = baseRoas
  const R_max = (baseRoas * x * (KB + xB)) / xB;

  const nextSpend = x + deltaSpend;
  const nextXB = Math.pow(nextSpend, eta);
  const nextRev = (R_max * nextXB) / (KB + nextXB);
  const currentRev = (R_max * xB) / (KB + xB);
  const marginalRoas = (nextRev - currentRev) / deltaSpend;

  // Clamped between 0.70 * baseRoas and 0.95 * baseRoas to guarantee realistic diminishing returns
  return Number(Math.min(baseRoas * 0.95, Math.max(baseRoas * 0.7, marginalRoas)).toFixed(3));
}

export function generateReallocations(products: DerivedProduct[]): ReallocationItem[] {
  const recommendations: ReallocationItem[] = [];

  // Source candidates: problem products that have not yet been fixed
  const problemProducts = products.filter(
    (p) => !p.isFixed && !p.paused && (p.inventory <= 0 || p.coverDays < 7 || p.roas < TARGET_ROAS)
  );

  // Track dynamic budget additions for destinations during this generation run
  const dynamicDestinationAdditions: Record<string, number> = {};
  products.forEach((p) => {
    dynamicDestinationAdditions[p.id] = p.addedSpendFromReallocations || 0;
  });

  for (const src of problemProducts) {
    // Destination candidates: ROAS >= 3.2, cover >= 21d, dest.roas > src.roas, destMarginalRoas > src.roas
    const eligibleDests = products.filter((dest) => {
      if (dest.id === src.id || dest.paused) return false;
      if (dest.roas < TARGET_ROAS || dest.coverDays < 21) return false;
      if (dest.roas <= src.roas) return false;
      const destMarginal = calculateMarginalRoas(dest.roas, dest.dailySpend);
      if (destMarginal <= src.roas) return false;

      // Cap increase at +50% of current spend
      const maxAllowedIncrease = dest.dailySpend * 0.5;
      const currentAdded = dynamicDestinationAdditions[dest.id] || 0;
      return currentAdded < maxAllowedIncrease;
    });

    if (eligibleDests.length === 0) continue;

    // Rank destinations, preferring same channel when close
    const rankedDests = eligibleDests
      .map((dest) => {
        const isSameChannel = dest.channel.toLowerCase() === src.channel.toLowerCase();
        // Channel preference boost of 0.35 ROAS equivalent
        const score = dest.roas + (isSameChannel ? 0.35 : 0);
        return { dest, isSameChannel, score };
      })
      .sort((a, b) => b.score - a.score);

    const bestDest = rankedDests[0].dest;
    const sameChannel = rankedDests[0].isSameChannel;

    // Determine move size and action tag
    let actionTag: 'PAUSE' | 'TRIM' | 'REDIRECT' = 'TRIM';
    let rawMove = 0;
    let sourceSpendAfter = 0;
    let reason = '';

    if (src.inventory <= 0 || src.status === 'stockout') {
      actionTag = 'PAUSE';
      rawMove = src.dailySpend * 0.8;
      sourceSpendAfter = 0;
      reason = `${src.name} is out of stock (${src.inventory} units); pause ad spend and redirect ${formatCurrency(Math.round(rawMove))} to ${bestDest.name} (${bestDest.roas.toFixed(2)}x ROAS).`;
    } else if (src.coverDays < 7 || src.status === 'low stock') {
      actionTag = 'REDIRECT';
      const allowableSpend = Math.round(src.dailySpend * (src.coverDays / 14));
      const freed = Math.max(0, src.dailySpend - allowableSpend);
      rawMove = freed * 0.8;
      sourceSpendAfter = allowableSpend;
      reason = `${src.name} has low stock (${src.coverDays.toFixed(1)} days); cap spend to extend runway to 14 days and redirect surplus to ${bestDest.name}.`;
    } else {
      actionTag = 'TRIM';
      const cut = Math.round(src.dailySpend * 0.35);
      rawMove = cut * 0.7;
      sourceSpendAfter = Math.round(src.dailySpend * 0.65);
      reason = `${src.name} is ${src.roas < FLOOR_ROAS ? 'below floor' : 'below target'} at ${src.roas.toFixed(2)}x; trim spend and move budget to ${bestDest.name} earning ${bestDest.roas.toFixed(2)}x.`;
    }

    // Apply destination +50% cap
    const maxAllowedIncrease = bestDest.dailySpend * 0.5;
    const currentAdded = dynamicDestinationAdditions[bestDest.id] || 0;
    const remainingCap = Math.max(0, maxAllowedIncrease - currentAdded);
    const movedAmount = Math.min(Math.round(rawMove), Math.round(remainingCap));

    if (movedAmount <= 0) continue;

    // Marginal ROAS and Net Revenue Lift via analytical Hill saturation
    const targetMarginalRoas = calculateMarginalRoas(bestDest.roas, bestDest.dailySpend, movedAmount);
    const netRevenueLift = Math.round(movedAmount * (targetMarginalRoas - src.roas));
    if (netRevenueLift <= 0) continue;

    // Update dynamic tracker
    dynamicDestinationAdditions[bestDest.id] = currentAdded + movedAmount;

    // Computed confidence
    const confidence = Math.round(
      Math.min(
        95,
        Math.max(
          40,
          50 + 10 * (bestDest.roas - src.roas) + Math.min(15, bestDest.coverDays / 3) + (sameChannel ? 5 : 0)
        )
      )
    );

    recommendations.push({
      id: `realloc-${src.id}-${bestDest.id}`,
      sourceProductId: src.id,
      targetProductId: bestDest.id,
      sourceCampaign: `${src.channel.toLowerCase()}-${src.id}`,
      targetCampaign: `${bestDest.channel.toLowerCase()}-${bestDest.id}`,
      sourceProductName: src.name,
      targetProductName: bestDest.name,
      sourceChannel: src.channel,
      targetChannel: bestDest.channel,
      actionTag,
      sourceSpendBefore: src.dailySpend,
      sourceSpendAfter,
      targetSpendBefore: bestDest.dailySpend,
      targetSpendAfter: bestDest.dailySpend + movedAmount,
      movedAmount,
      sourceRoas: src.roas,
      targetRoas: bestDest.roas,
      targetMarginalRoas,
      netRevenueLift,
      confidence,
      reason,
      status: 'PENDING_APPROVAL',
      actionType: actionTag,
      currentSpend: src.dailySpend,
      recommendedSpend: bestDest.dailySpend + movedAmount,
      deltaSpend: movedAmount,
      predictedRoas: targetMarginalRoas,
      expectedDailyMargin: netRevenueLift,
      stockoutKill: actionTag === 'PAUSE',
    });
  }

  return recommendations;
}

/**
 * PURE FUNCTION: computeFixPlan
 * Input: product state (DerivedProduct), all products (DerivedProduct[])
 * Output: FixPlanSummary (issue + evidence + 3 steps + projected result tiles)
 */
export function computeFixPlan(product: DerivedProduct, allProducts: DerivedProduct[]): FixPlanSummary {
  const eligibleCandidates = allProducts.filter(
    (p) => p.id !== product.id && p.inventory > 0 && p.coverDays >= 21 && p.roas >= TARGET_ROAS && !p.paused
  );

  const sameChannelCandidates = eligibleCandidates.filter((p) => p.channel === product.channel);
  const fallbackCandidates = eligibleCandidates.length > 0 ? eligibleCandidates : allProducts.filter((p) => p.id !== product.id);

  const bestProduct =
    sameChannelCandidates.length > 0
      ? sameChannelCandidates.sort((a, b) => b.roas - a.roas)[0]
      : fallbackCandidates.sort((a, b) => b.roas - a.roas)[0] || product;

  const receivingMaxIncrease = bestProduct.dailySpend * 0.5;
  const projectionNote = 'Outcomes are algorithmic projections modeled over a 7-day calibration window.';

  // 1. STOCKOUT
  if (product.inventory <= 0 || product.status === 'stockout') {
    const rawBudgetTransfer = product.dailySpend * 0.8;
    const reallocatedSpend = Math.round(Math.min(rawBudgetTransfer, receivingMaxIncrease));
    const restockUnits = Math.round(21 * product.dailyUnitsSold);
    const addedRevenue = Math.round(reallocatedSpend * calculateMarginalRoas(bestProduct.roas, bestProduct.dailySpend, reallocatedSpend));

    const steps: FixStep[] = [
      {
        title: 'Pause Campaign & Stop Ad Waste',
        description: `Trip automated circuit-breaker on ${product.channel} ad sets to halt spending on zero inventory.`,
        before: formatCurrency(product.dailySpend),
        after: '$0/day',
      },
      {
        title: `Reallocate 80% Budget to ${bestProduct.name}`,
        description: `Shift ${formatCurrency(reallocatedSpend)} freed capital to high-performing ${bestProduct.channel} campaign (capped at +50%).`,
        before: formatCurrency(bestProduct.dailySpend),
        after: formatCurrency(bestProduct.dailySpend + reallocatedSpend),
      },
      {
        title: 'Raise Restock Request for 21 Days of Demand',
        description: `Dispatch priority procurement purchase order for ${restockUnits} units based on ${product.dailyUnitsSold} pairs/day run-rate.`,
        before: '0 units in pipeline',
        after: `${restockUnits} units ordered`,
      },
    ];

    const resultTiles: ResultTile[] = [
      {
        label: 'Ad Spend at Risk',
        before: formatCurrency(product.dailySpend),
        after: '$0/day (Zero Waste)',
      },
      {
        label: `Reallocated Yield (${bestProduct.name})`,
        before: '$0/day added',
        after: `+${formatCurrency(addedRevenue)} projected rev`,
      },
      {
        label: 'Restock Pipeline',
        before: '0 units',
        after: `${restockUnits} units in transit`,
      },
    ];

    return {
      issueType: 'stockout',
      issueBanner: 'Out of stock while ads are still running',
      evidence: [
        `Inventory is 0 units while ${formatCurrency(product.dailySpend)} in ad spend continues burning.`,
        `Current ROAS ${product.roas.toFixed(2)}x is generating zero-fulfillment clicks and customer bounce.`,
        `Unmet customer demand: ~${product.dailyUnitsSold} pairs/day lost with $0 revenue capture.`,
        '100% of current ad spend is at risk with zero inventory runway.',
      ],
      steps,
      resultTiles,
      projectionNote,
      receivingProductId: bestProduct.id,
      receivingProductName: bestProduct.name,
      reallocatedSpend,
      restockUnits,
      actionTakenText: `Paused campaign ($0/day); shifted ${formatCurrency(reallocatedSpend)} to ${bestProduct.name}; raised restock PO for ${restockUnits} units`,
      outcomeText: `Eliminated ${formatCurrency(product.dailySpend)} ad waste; +${formatCurrency(addedRevenue)} proj rev`,
    };
  }

  // 2. LOW STOCK (cover < 7 days)
  if (product.coverDays < 7 || product.status === 'low stock') {
    const ratio = Math.max(0.1, Math.min(0.9, product.coverDays / 14));
    const cappedSpend = Math.round(product.dailySpend * ratio);
    const freedBudget = Math.max(0, product.dailySpend - cappedSpend);
    const rawBudgetTransfer = freedBudget * 0.8;
    const reallocatedSpend = Math.round(Math.min(rawBudgetTransfer, receivingMaxIncrease));
    const addedRevenue = Math.round(reallocatedSpend * calculateMarginalRoas(bestProduct.roas, bestProduct.dailySpend, reallocatedSpend));

    const steps: FixStep[] = [
      {
        title: 'Cap Spend to Extend Stock Runway to 14 Days',
        description: `Throttle daily spend by ${Math.round((1 - ratio) * 100)}% to align unit velocity with 14-day supply replenishment window.`,
        before: formatCurrency(product.dailySpend),
        after: formatCurrency(cappedSpend),
      },
      {
        title: `Reallocate 80% Freed Budget to ${bestProduct.name}`,
        description: `Route ${formatCurrency(reallocatedSpend)} surplus to scale healthy inventory on ${bestProduct.channel}.`,
        before: formatCurrency(bestProduct.dailySpend),
        after: formatCurrency(bestProduct.dailySpend + reallocatedSpend),
      },
      {
        title: 'Send Automated Reorder Alert',
        description: 'Notify supply chain ops and trigger ERP stock replenishment workflow.',
        before: `${product.coverDays.toFixed(1)}d current cover`,
        after: '14.0d runway (Reorder Alert Sent)',
      },
    ];

    const resultTiles: ResultTile[] = [
      {
        label: 'Stock Runway',
        before: `${product.coverDays.toFixed(1)} days`,
        after: '14.0 days extended',
      },
      {
        label: 'Daily Ad Spend',
        before: formatCurrency(product.dailySpend),
        after: `${formatCurrency(cappedSpend)} (Capped)`,
      },
      {
        label: `Reallocated Yield (${bestProduct.name})`,
        before: '$0/day added',
        after: `+${formatCurrency(addedRevenue)} projected rev`,
      },
    ];

    return {
      issueType: 'low_stock',
      issueBanner: `Low stock runway (${product.coverDays.toFixed(1)} days) risks premature stockout`,
      evidence: [
        `Only ${product.inventory} units remaining with run-rate of ${product.dailyUnitsSold} units/day.`,
        `Current ad spend of ${formatCurrency(product.dailySpend)} will exhaust inventory in ${product.coverDays.toFixed(1)} days.`,
        'Stockout runway is under the 7-day critical supply chain buffer.',
        `Spend at risk: ${formatCurrency(product.dailySpend)} accelerates depletion before restock arrival.`,
      ],
      steps,
      resultTiles,
      projectionNote,
      receivingProductId: bestProduct.id,
      receivingProductName: bestProduct.name,
      reallocatedSpend,
      cappedSpend,
      actionTakenText: `Capped spend at ${formatCurrency(cappedSpend)} (14d runway); moved ${formatCurrency(reallocatedSpend)} to ${bestProduct.name}; dispatched reorder alert`,
      outcomeText: `Extended runway from ${product.coverDays.toFixed(1)}d to 14d; +${formatCurrency(addedRevenue)} proj rev`,
    };
  }

  // 3. BELOW TARGET / BELOW FLOOR
  const isBelowFloor = product.roas < FLOOR_ROAS;
  const cutAmount = Math.round(product.dailySpend * 0.35);
  const newSpend = Math.round(product.dailySpend * 0.65);
  const rawBudgetTransfer = cutAmount * 0.7;
  const reallocatedSpend = Math.round(Math.min(rawBudgetTransfer, receivingMaxIncrease));
  const newCpc = Number((product.cpc * 0.9).toFixed(2));
  const projectedRoas = Number((product.roas + (TARGET_ROAS - product.roas) * 0.7).toFixed(2));
  const addedRevenue = Math.round(reallocatedSpend * calculateMarginalRoas(bestProduct.roas, bestProduct.dailySpend, reallocatedSpend));
  const newProductRevenue = Math.round(newSpend * projectedRoas);

  const steps: FixStep[] = [
    {
      title: 'Cut 35% Spend on Lowest-Converting Ad Sets',
      description: 'Prune bottom-quartile search queries, high-bounce keywords, and unprofitable placements.',
      before: formatCurrency(product.dailySpend),
      after: formatCurrency(newSpend),
    },
    {
      title: `Move 70% of Cut to ${bestProduct.name}`,
      description: `Reallocate ${formatCurrency(reallocatedSpend)} of savings to high-performing ${bestProduct.channel} campaign.`,
      before: formatCurrency(bestProduct.dailySpend),
      after: formatCurrency(bestProduct.dailySpend + reallocatedSpend),
    },
    {
      title: 'Lower Algorithmic Bid Cap by 10%',
      description: 'Enforce disciplined cost-per-click bidding threshold to curb ad cost inflation.',
      before: `$${product.cpc.toFixed(2)} CPC`,
      after: `$${newCpc.toFixed(2)} CPC`,
    },
  ];

  const resultTiles: ResultTile[] = [
    {
      label: 'Campaign ROAS',
      before: `${product.roas.toFixed(2)}x`,
      after: `${projectedRoas.toFixed(2)}x (Projected)`,
    },
    {
      label: 'Optimized Daily Spend',
      before: formatCurrency(product.dailySpend),
      after: `${formatCurrency(newSpend)} (-35%)`,
    },
    {
      label: 'Total Realized Revenue',
      before: formatCurrency(product.dailySpend * product.roas),
      after: `${formatCurrency(newProductRevenue + addedRevenue)} combined`,
    },
  ];

  return {
    issueType: isBelowFloor ? 'below_floor' : 'below_target',
    issueBanner: isBelowFloor
      ? `Critical: ROAS (${product.roas.toFixed(2)}x) is below 1.8x breakeven floor`
      : `Below Target: ROAS (${product.roas.toFixed(2)}x) trails 3.2x benchmark`,
    evidence: [
      `Current ROAS of ${product.roas.toFixed(2)}x is ${isBelowFloor ? 'losing money on every ad conversion below 1.8x floor' : 'trailing the 3.2x target profitability benchmark'}.`,
      `Daily ad spend of ${formatCurrency(product.dailySpend)} running on sub-optimal ad sets.`,
      `Current CPC of $${product.cpc.toFixed(2)} and CVR of ${(product.cvr * 100).toFixed(1)}% indicate high acquisition friction.`,
      `Spend at risk: ${formatCurrency(product.dailySpend)}.`,
    ],
    steps,
    resultTiles,
    projectionNote,
    receivingProductId: bestProduct.id,
    receivingProductName: bestProduct.name,
    reallocatedSpend,
    newSpend,
    projectedRoas,
    actionTakenText: `Cut 35% spend (${formatCurrency(newSpend)}); shifted ${formatCurrency(reallocatedSpend)} to ${bestProduct.name}; lowered bid cap 10%`,
    outcomeText: `ROAS projected to lift from ${product.roas.toFixed(2)}x to ${projectedRoas.toFixed(2)}x; saved ${formatCurrency(cutAmount)}`,
  };
}

/**
 * PURE STATE TRANSITION: applyFixPlan
 */
export function applyFixPlan(
  products: ProductModel[],
  productId: string,
  plan: FixPlanSummary,
  timestampStr?: string
): { updatedProducts: ProductModel[]; newLedgerEntry: GaugesLedgerItem } {
  const now = new Date();
  const timeFormatted =
    timestampStr ||
    `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;

  const fixedProduct = products.find((p) => p.id === productId);
  if (!fixedProduct) {
    throw new Error(`Product not found: ${productId}`);
  }

  let updatedDailySpend = fixedProduct.dailySpend;
  let updatedRoas = fixedProduct.roas;
  let updatedCpc = fixedProduct.cpc;
  let paused = false;
  let restockUnitsOrdered = fixedProduct.restockUnitsOrdered;
  let reorderAlertSent = fixedProduct.reorderAlertSent;

  if (plan.issueType === 'stockout') {
    updatedDailySpend = 0;
    paused = true;
    restockUnitsOrdered = plan.restockUnits || 21 * fixedProduct.dailyUnitsSold;
  } else if (plan.issueType === 'low_stock') {
    updatedDailySpend = plan.cappedSpend ?? fixedProduct.dailySpend;
    reorderAlertSent = true;
  } else {
    updatedDailySpend = plan.newSpend ?? Math.round(fixedProduct.dailySpend * 0.65);
    updatedRoas = plan.projectedRoas ?? Number((fixedProduct.roas + (TARGET_ROAS - fixedProduct.roas) * 0.7).toFixed(2));
    updatedCpc = Number((fixedProduct.cpc * 0.9).toFixed(2));
  }

  const receivingId = plan.receivingProductId;
  const reallocated = plan.reallocatedSpend;

  const updatedProducts = products.map((p) => {
    if (p.id === productId) {
      return {
        ...p,
        dailySpend: updatedDailySpend,
        roas: updatedRoas,
        cpc: updatedCpc,
        isFixed: true,
        fixedAt: timeFormatted,
        paused,
        restockUnitsOrdered,
        reorderAlertSent,
        appliedPlan: plan,
      };
    }

    if (p.id === receivingId && p.id !== productId && reallocated > 0) {
      const oldSpend = p.dailySpend;
      const oldRev = oldSpend * p.roas;
      const addedSpend = reallocated;
      const addedRev = addedSpend * calculateMarginalRoas(p.roas, p.dailySpend, addedSpend);

      const newSpend = oldSpend + addedSpend;
      const newRev = oldRev + addedRev;
      const newRoas = Number((newRev / newSpend).toFixed(2));

      const velocityMultiplier = newRev / (oldRev || 1);
      const newDailyUnitsSold = Math.max(1, Math.round(p.dailyUnitsSold * velocityMultiplier));

      return {
        ...p,
        dailySpend: Math.round(newSpend),
        addedSpendFromReallocations: (p.addedSpendFromReallocations || 0) + addedSpend,
        roas: newRoas,
        dailyUnitsSold: newDailyUnitsSold,
      };
    }

    return p;
  });

  const newLedgerEntry: GaugesLedgerItem = {
    id: `ledg-fix-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: timeFormatted,
    product: fixedProduct.name,
    channel: fixedProduct.channel,
    issue: plan.issueBanner,
    actionTaken: plan.actionTakenText,
    outcome: plan.outcomeText,
  };

  return { updatedProducts, newLedgerEntry };
}

/**
 * PURE STATE TRANSITION: applyReallocation
 * Applies an autonomous capital reallocation item to the product catalog and appends ledger record.
 */
export function applyReallocation(
  products: ProductModel[],
  reallocation: ReallocationItem,
  isAuto = false,
  timestampStr?: string
): { updatedProducts: ProductModel[]; newLedgerEntry: GaugesLedgerItem } {
  const now = new Date();
  const timeFormatted =
    timestampStr ||
    `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;

  const source = products.find((p) => p.id === reallocation.sourceProductId);
  const dest = products.find((p) => p.id === reallocation.targetProductId);

  if (!source || !dest) {
    throw new Error(`Reallocation endpoint not found: ${reallocation.sourceProductId} -> ${reallocation.targetProductId}`);
  }

  const updatedProducts = products.map((p) => {
    if (p.id === source.id) {
      const isStockout = source.inventory <= 0;
      const isLowStock = !isStockout && source.inventory / Math.max(1, source.dailyUnitsSold) < 7;

      return {
        ...p,
        dailySpend: reallocation.sourceSpendAfter,
        paused: isStockout ? true : p.paused,
        restockUnitsOrdered: isStockout ? Math.round(21 * p.dailyUnitsSold) : p.restockUnitsOrdered,
        reorderAlertSent: isLowStock ? true : p.reorderAlertSent,
        roas: !isStockout && !isLowStock
          ? Number((p.roas + (TARGET_ROAS - p.roas) * 0.7).toFixed(2))
          : p.roas,
        cpc: !isStockout && !isLowStock ? Number((p.cpc * 0.9).toFixed(2)) : p.cpc,
        isFixed: true,
        fixedAt: timeFormatted,
      };
    }

    if (p.id === dest.id) {
      const oldSpend = p.dailySpend;
      const oldRev = oldSpend * p.roas;
      const addedSpend = reallocation.movedAmount;
      const addedRev = addedSpend * reallocation.targetMarginalRoas;

      const newSpend = oldSpend + addedSpend;
      const newRev = oldRev + addedRev;
      const newRoas = Number((newRev / newSpend).toFixed(2));

      const velocityMultiplier = newRev / (oldRev || 1);
      const newDailyUnitsSold = Math.max(1, Math.round(p.dailyUnitsSold * velocityMultiplier));

      return {
        ...p,
        dailySpend: Math.round(newSpend),
        addedSpendFromReallocations: (p.addedSpendFromReallocations || 0) + addedSpend,
        roas: newRoas,
        dailyUnitsSold: newDailyUnitsSold,
      };
    }

    return p;
  });

  const newLedgerEntry: GaugesLedgerItem = {
    id: `ledg-realloc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: timeFormatted,
    product: source.name,
    channel: source.channel,
    issue: reallocation.reason,
    actionTaken: `[${reallocation.actionTag}] Moved ${formatCurrency(reallocation.movedAmount)} from ${source.name} (${source.channel}) → ${dest.name} (${dest.channel})`,
    outcome: `+${formatCurrency(reallocation.netRevenueLift)} proj revenue lift/day (${reallocation.confidence}% conf)`,
    isAuto,
  };

  return { updatedProducts, newLedgerEntry };
}
