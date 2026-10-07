export type ChannelType = 'Google' | 'Amazon' | 'Meta' | 'TikTok' | 'Shopify';

export type ProductStatus = 'stockout' | 'low stock' | 'below floor' | 'below target' | 'target met' | 'fixed';

export interface Campaign {
  id: string;
  name: string;
  channel: ChannelType;
  inventory: number;
  dailyUnitsSold: number;
  dailySpend: number; // in INR (₹8,000 - ₹45,000)
  roas: number;       // 1.5x - 4.5x
  cpc: number;
  cvr: number;
  photoUrl?: string;
  sku?: string;
  category?: string;
  initialDailySpend?: number;
  addedSpendFromReallocations?: number; // Tracks cumulative +50% cap
  isFixed?: boolean;
  fixedAt?: string;
  paused?: boolean;
  restockUnitsOrdered?: number;
  reorderAlertSent?: boolean;
  appliedActionId?: string;
  appliedPlan?: ActionPlan;
}

export type ProductModel = Campaign;
export type ProductCampaign = Campaign;

export interface DerivedProduct extends Campaign {
  coverDays: number;
  status: ProductStatus;
  healthScore: number;
  revenue: number;
  effectiveStatus: ProductStatus;
  footerSummary: string;
}

export type DerivedCampaign = DerivedProduct;

export interface PlanStep {
  label: string;
  from: string;
  to: string;
  description?: string;
  title?: string; // compatibility
  before?: string; // compatibility
  after?: string; // compatibility
}

export interface PlanResultTile {
  label: string;
  from: string;
  to: string;
  before?: string; // compatibility
  after?: string; // compatibility
}

export interface ActionPlan {
  actionId: string;
  actionType: 'reallocation' | 'fix';
  actionTag: 'PAUSE' | 'TRIM' | 'REDIRECT' | 'FIX';
  title: string;
  subtitle: string;
  heroAmount: number;
  heroSubtitle: string;
  sourceCampaignId: string;
  sourceProductName: string;
  sourceChannel: ChannelType;
  sourceSpendBefore: number;
  sourceSpendAfter: number;
  sourceRoas: number;
  sourceCoverDays: number;
  targetCampaignId?: string;
  targetProductName?: string;
  targetChannel?: ChannelType;
  targetSpendBefore?: number;
  targetSpendAfter?: number;
  targetRoas?: number;
  targetMarginalRoas?: number;
  targetCoverDays?: number;
  movedAmount: number;
  why: string;
  expectedGain: string;
  netRevenueLift: number;
  confidence: number;
  details: {
    formula: string;
    sourceId: string;
    targetId: string;
    assumptions: string;
  };
  issue: string;
  evidence: string[];
  steps: PlanStep[];
  result: PlanResultTile[];
  deltas: {
    sourceSpendDelta: number;
    targetSpendDelta: number;
    paused?: boolean;
    restockUnits?: number;
    reorderAlert?: boolean;
    projectedRoas?: number;
    cpcDelta?: number;
  };
  actionButtonLabel: string;

  // Compatibility aliases for legacy modal/renderers
  issueType?: 'stockout' | 'low_stock' | 'below_floor' | 'below_target';
  issueBanner?: string;
  resultTiles?: PlanResultTile[];
  projectionNote?: string;
  receivingProductId?: string;
  receivingProductName?: string;
  reallocatedSpend?: number;
  projectedRoas?: number;
  cappedSpend?: number;
  newSpend?: number;
  restockUnits?: number;
  actionTakenText?: string;
  outcomeText?: string;
}

export type FixPlanSummary = ActionPlan;
export type FixStep = PlanStep;
export type ResultTile = PlanResultTile;

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

  // Compatibility fields
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
 * Standard Indian currency formatter:
 * Formats amount with Indian grouping and "/day", e.g. "₹25,000/day".
 * Amounts are ALWAYS positive; direction is shown by arrow, wording and colour.
 * Never negative strings like "₹-307".
 */
export function formatINR(amount: number): string {
  const positiveAmount = Math.max(0, Math.round(Math.abs(amount)));
  return `₹${positiveAmount.toLocaleString('en-IN')}/day`;
}

/**
 * Single source of truth for channel branding (icon, label, color):
 * Google, Amazon, Meta, TikTok, Shopify.
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
    case 'tiktok':
      return {
        name: 'TikTok',
        color: '#EC4899',
        badgeBg: 'bg-pink-950/40',
        badgeBorder: 'border-pink-800/50',
        badgeText: 'text-pink-400',
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
 * e.g. healthy: "On track · 35 days of stock"
 * stockout: "Sold out · ₹28,000/day spent with no sales"
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
    return `Sold out · ${formatINR(dailySpend)} spent with no sales`;
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
  // Target met (Healthy real one-liner)
  return `On track · ${Math.round(coverDays)} days of stock`;
}

/**
 * Derives dynamic metrics from the campaign state:
 * - coverDays = dailyUnitsSold > 0 ? inventory / dailyUnitsSold : 0
 * - status (priority order):
 *     1. stockout (inventory <= 0)
 *     2. low stock (coverDays < 7)
 *     3. below floor (ROAS < 1.8)
 *     4. below target (ROAS < 3.2)
 *     5. target met
 * - healthScore = min(100, roas/3.2*80)*0.7 + min(100, coverDays/14*100)*0.3
 * - zero inventory guard: A stockout NEVER looks healthy! Score clamped to max 32 (< 50, critical red gauge).
 */
export function deriveProduct(product: ProductModel): DerivedProduct {
  const isMissingInventory = product.inventory == null || isNaN(product.inventory);
  const safeInventory = isMissingInventory ? 0 : product.inventory;
  const coverDays = product.dailyUnitsSold > 0 ? safeInventory / product.dailyUnitsSold : 0;

  let baseStatus: ProductStatus = 'target met';
  if (isMissingInventory || safeInventory <= 0) {
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

  // Zero/Missing inventory guard: ensure health score is never considered healthy (< 50, critical red gauge)
  if (isMissingInventory || safeInventory <= 0) {
    rawHealth = Math.min(rawHealth, 32);
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
 * Seed dataset of 12 realistic Nike footwear campaigns.
 * ROAS 1.5x–4.5x only. dailySpend ₹8,000–45,000, different per campaign.
 * Inventory and units/day differ so cover days range 0 to ~60.
 * No identical values across cards.
 */
export const INITIAL_PRODUCTS: ProductModel[] = [
  // 1. Stockout #1 (Meta) - 0 stock, ₹28,000/day
  {
    id: 'nike-dunk-low',
    name: 'Nike Dunk Low Retro',
    channel: 'Meta',
    inventory: 0,
    dailyUnitsSold: 18,
    dailySpend: 28000,
    initialDailySpend: 28000,
    roas: 2.35,
    cpc: 34.5,
    cvr: 0.032,
    photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/awjogtdnqxniqqk0wpgf/air-max-270-shoe-2V5C4p.jpg',
    sku: 'DD1391-100',
    category: 'Lifestyle',
  },
  // 2. Stockout #2 (Google) - 0 stock, ₹37,000/day
  {
    id: 'nike-aj1-low',
    name: 'Nike Air Jordan 1 Low',
    channel: 'Google',
    inventory: 0,
    dailyUnitsSold: 24,
    dailySpend: 37000,
    initialDailySpend: 37000,
    roas: 2.15,
    cpc: 41.2,
    cvr: 0.028,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/qb2ry1p1iv2vqrdfq4oa/air-jordan-1-mid-shoe-BpARGV.jpg',
    sku: '553558-136',
    category: 'Basketball',
  },
  // 3. Low Stock #1 (Amazon) - cover: 36 / 8 = 4.5 days (< 7 days), ₹23,000/day
  {
    id: 'nike-pegasus-40',
    name: 'Nike Pegasus 40',
    channel: 'Amazon',
    inventory: 36,
    dailyUnitsSold: 8,
    dailySpend: 23000,
    initialDailySpend: 23000,
    roas: 2.85,
    cpc: 26.8,
    cvr: 0.038,
    photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/x6jwtxaf3brhu6jisuf5/zoom-fly-running-shoe-OZEAxq.jpg',
    sku: 'DV3853-001',
    category: 'Running',
  },
  // 4. Below Floor #1 (Shopify) - ROAS: 1.58x (< 1.8 floor), ₹31,000/day
  {
    id: 'nike-metcon-9',
    name: 'Nike Metcon 9',
    channel: 'Shopify',
    inventory: 340,
    dailyUnitsSold: 10,
    dailySpend: 31000,
    initialDailySpend: 31000,
    roas: 1.58,
    cpc: 48.2,
    cvr: 0.021,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/ddb4c566-fcb0-47c0-8184-323ad9edff37/react-infinity-run-flyknit-running-shoe-ZjGHFz.jpg',
    sku: 'DZ2537-001',
    category: 'Training',
  },
  // 5. Below Target #1 (TikTok) - ROAS: 2.65x (1.8 <= ROAS < 3.2), ₹26,000/day
  {
    id: 'nike-invincible-3',
    name: 'Nike Invincible 3',
    channel: 'TikTok',
    inventory: 360,
    dailyUnitsSold: 12,
    dailySpend: 26000,
    initialDailySpend: 26000,
    roas: 2.65,
    cpc: 31.4,
    cvr: 0.029,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/i1-b714d0a4-53ed-4919-9761-1bddc5dff48f/joyride-run-flyknit-running-shoe-sqfqGQ.jpg',
    sku: 'DR2615-101',
    category: 'Running',
  },
  // 6. Healthy #1 (Meta) - ROAS: 3.8x, cover: 30.6d, ₹39,000/day
  {
    id: 'nike-af1-07',
    name: "Nike Air Force 1 '07",
    channel: 'Meta',
    inventory: 520,
    dailyUnitsSold: 17,
    dailySpend: 39000,
    initialDailySpend: 39000,
    roas: 3.8,
    cpc: 24.5,
    cvr: 0.044,
    photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/oplkqwyf7nwnj98f8agj/air-force-1-07-shoe-PATZxx4V.jpg',
    sku: 'CW2288-111',
    category: 'Lifestyle',
  },
  // 7. Healthy #2 (Google) - ROAS: 4.25x, cover: 43.6d, ₹34,000/day
  {
    id: 'nike-vaporfly-3',
    name: 'Nike ZoomX Vaporfly 3',
    channel: 'Google',
    inventory: 480,
    dailyUnitsSold: 11,
    dailySpend: 34000,
    initialDailySpend: 34000,
    roas: 4.25,
    cpc: 28.0,
    cvr: 0.048,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/bbbwgncnxexhwgbz8qbp/air-max-2017-shoe-MkTmxxOd.jpg',
    sku: 'DV4129-100',
    category: 'Racing',
  },
  // 8. Healthy #3 (Amazon) - ROAS: 3.65x, cover: 31.4d, ₹29,000/day
  {
    id: 'nike-infinityrn-4',
    name: 'Nike InfinityRN 4',
    channel: 'Amazon',
    inventory: 440,
    dailyUnitsSold: 14,
    dailySpend: 29000,
    initialDailySpend: 29000,
    roas: 3.65,
    cpc: 22.4,
    cvr: 0.041,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/ccsubyw6lzx10virtjdu/air-jordan-10-retro-shoe-f3jBkN.jpg',
    sku: 'DR2665-001',
    category: 'Running',
  },
  // 9. Healthy #4 (Shopify) - ROAS: 3.5x, cover: 30.0d, ₹27,000/day
  {
    id: 'nike-vomero-17',
    name: 'Nike Vomero 17',
    channel: 'Shopify',
    inventory: 390,
    dailyUnitsSold: 13,
    dailySpend: 27000,
    initialDailySpend: 27000,
    roas: 3.5,
    cpc: 25.5,
    cvr: 0.039,
    photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/r4rbe0wqytas2utewhs9/air-huarache-shoe-2kvnqX.jpg',
    sku: 'FB1309-100',
    category: 'Running',
  },
  // 10. Healthy #5 (TikTok) - ROAS: 3.4x, cover: 56.7d, ₹21,000/day
  {
    id: 'nike-blazer-mid',
    name: "Nike Blazer Mid '77",
    channel: 'TikTok',
    inventory: 510,
    dailyUnitsSold: 9,
    dailySpend: 21000,
    initialDailySpend: 21000,
    roas: 3.4,
    cpc: 19.8,
    cvr: 0.042,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/gmnsskvj5xjk5zm8bx2m/air-max-720-shoe-Ss8jMq.jpg',
    sku: 'BQ6806-100',
    category: 'Lifestyle',
  },
  // 11. Healthy #6 (Google) - ROAS: 3.55x, cover: 26.25d, ₹16,000/day
  {
    id: 'nike-killshot-2',
    name: 'Nike Killshot 2',
    channel: 'Google',
    inventory: 420,
    dailyUnitsSold: 16,
    dailySpend: 16000,
    initialDailySpend: 16000,
    roas: 3.55,
    cpc: 21.2,
    cvr: 0.037,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/ddb4c566-fcb0-47c0-8184-323ad9edff37/react-infinity-run-flyknit-running-shoe-ZjGHFz.jpg',
    sku: '432997-107',
    category: 'Tennis',
  },
  // 12. Healthy #7 (Meta) - ROAS: 3.45x, cover: 25.3d, ₹11,000/day
  {
    id: 'nike-air-max-2017',
    name: 'Nike Air Max 2017',
    channel: 'Meta',
    inventory: 380,
    dailyUnitsSold: 15,
    dailySpend: 11000,
    initialDailySpend: 11000,
    roas: 3.45,
    cpc: 23.0,
    cvr: 0.036,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/bbbwgncnxexhwgbz8qbp/air-max-2017-shoe-MkTmxxOd.jpg',
    sku: '849559-004',
    category: 'Running',
  },
];

export const INITIAL_LEDGER: GaugesLedgerItem[] = [
  {
    id: 'ledg-init-1',
    timestamp: '2026-10-07 20:14:02',
    product: 'Air Jordan 10 Retro',
    channel: 'Meta',
    issue: 'Sub-floor ROAS (1.64x)',
    actionTaken: 'Pruned bottom 35% ad sets; reallocated ₹9,800/day to ZoomX Vaporfly 3',
    outcome: '+0.72x ROAS lift, ₹28,400/day ad spend efficiency calibrated',
  },
  {
    id: 'ledg-init-2',
    timestamp: '2026-10-07 18:30:45',
    product: 'Nike Joyride Run Flyknit',
    channel: 'Amazon',
    issue: 'Critical Stockout (0 units)',
    actionTaken: 'Paused ad sets (₹0/day); shifted ₹22,000/day to InfinityRN 4; raised restock PO for 378 units',
    outcome: 'Eliminated ₹22,000/day ad waste; 100% budget protected',
    isAuto: true,
  },
];

/**
 * PURE FUNCTION: generateReallocations
 * Generates autonomous capital reallocation recommendations from real product telemetry.
 *
 * Reallocation rules:
 * - Source = stockout, low stock, below floor or below target.
 * - Destination = ROAS >= 3.2x and >= 21 days of cover.
 * - Never move money to a weaker or low-stock campaign.
 * - moved = 20–35% of source spend (stockout: pause fully, move 80%); cap destination at +50%.
 * - destMarginalRoas = destRoas * 0.85; netLiftPerDay = moved * (destMarginalRoas − srcRoas); recommend only if > 0.
 * - confidence = clamp(50 + 10*(destRoas − srcRoas) + min(15, destCover/3) + (sameChannel?5:0), 40, 95).
 */
export function generateReallocations(products: DerivedProduct[]): ReallocationItem[] {
  const recommendations: ReallocationItem[] = [];

  // Source candidates: problem products that have not yet been fixed or paused
  const problemProducts = products.filter(
    (p) => !p.isFixed && !p.paused && (p.inventory <= 0 || p.coverDays < 7 || p.roas < TARGET_ROAS)
  );

  // Track dynamic budget additions for destinations during this generation pass
  const dynamicDestinationAdditions: Record<string, number> = {};
  products.forEach((p) => {
    dynamicDestinationAdditions[p.id] = p.addedSpendFromReallocations || 0;
  });

  for (const src of problemProducts) {
    // Destination candidates: ROAS >= 3.2, cover >= 21d, dest.roas > src.roas, destMarginalRoas > src.roas
    const eligibleDests = products.filter((dest) => {
      if (dest.id === src.id || dest.paused) return false;
      if (dest.inventory == null || isNaN(dest.inventory) || dest.inventory <= 0) return false;
      if (dest.roas < TARGET_ROAS || dest.coverDays < 21) return false;
      if (dest.roas <= src.roas) return false;
      const destMarginal = Number((dest.roas * 0.85).toFixed(3));
      if (destMarginal <= src.roas) return false;

      // Cap destination increase at +50% of current spend
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
      reason = `${src.name} is out of stock (${src.inventory} units); pause ad spend and redirect ${formatINR(Math.round(rawMove))} to ${bestDest.name} (${bestDest.roas.toFixed(2)}x ROAS).`;
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

    // Marginal ROAS and Net Revenue Lift
    const targetMarginalRoas = Number((bestDest.roas * 0.85).toFixed(3));
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
 * PURE FUNCTION: buildPlan
 * Builds an actionable plan from current state and stable actionId.
 * Used identically by FIX button, row Execute, Execute All and Auto-Pilot.
 *
 * buildPlan(state, actionId) → {
 *   issue, evidence[], steps[{label, from, to}], result[{label, from, to}], deltas, confidence, ...
 * }
 */
export function buildPlan(
  state: { products: DerivedProduct[] },
  actionId: string
): ActionPlan {
  if (actionId.startsWith('realloc-')) {
    const cleanId = actionId.replace(/^realloc-/, '');
    let src: DerivedProduct | undefined;
    let dest: DerivedProduct | undefined;

    // Match source and destination products
    for (const p1 of state.products) {
      if (cleanId.startsWith(p1.id + '-')) {
        const destId = cleanId.slice(p1.id.length + 1);
        const p2 = state.products.find((p) => p.id === destId);
        if (p2) {
          src = p1;
          dest = p2;
          break;
        }
      }
    }

    if (!src || !dest) {
      src = state.products.find((p) => cleanId.includes(p.id));
      dest = state.products.find(
        (p) => p.id !== src?.id && p.roas >= TARGET_ROAS && p.coverDays >= 21
      );
    }

    if (!src || !dest) {
      throw new Error(`Unable to resolve campaigns for reallocation action: ${actionId}`);
    }

    let actionTag: 'PAUSE' | 'TRIM' | 'REDIRECT' = 'TRIM';
    let rawMove = 0;
    let sourceSpendAfter = 0;

    if (src.inventory <= 0 || src.status === 'stockout') {
      actionTag = 'PAUSE';
      rawMove = src.dailySpend * 0.8;
      sourceSpendAfter = 0;
    } else if (src.coverDays < 7 || src.status === 'low stock') {
      actionTag = 'REDIRECT';
      const allowableSpend = Math.round(src.dailySpend * (src.coverDays / 14));
      const freed = Math.max(0, src.dailySpend - allowableSpend);
      rawMove = freed * 0.8;
      sourceSpendAfter = allowableSpend;
    } else {
      actionTag = 'TRIM';
      const cut = Math.round(src.dailySpend * 0.35);
      rawMove = cut * 0.7;
      sourceSpendAfter = Math.round(src.dailySpend * 0.65);
    }

    // Destination cap (+50% of current spend)
    const maxAllowedIncrease = dest.dailySpend * 0.5;
    const currentAdded = dest.addedSpendFromReallocations || 0;
    const remainingCap = Math.max(0, maxAllowedIncrease - currentAdded);
    const movedAmount = Math.max(0, Math.min(Math.round(rawMove), Math.round(remainingCap)));

    const targetMarginalRoas = Number((dest.roas * 0.85).toFixed(3));
    const netRevenueLift = Math.max(0, Math.round(movedAmount * (targetMarginalRoas - src.roas)));
    const sameChannel = src.channel.toLowerCase() === dest.channel.toLowerCase();
    const confidence = Math.round(
      Math.min(
        95,
        Math.max(
          40,
          50 + 10 * (dest.roas - src.roas) + Math.min(15, dest.coverDays / 3) + (sameChannel ? 5 : 0)
        )
      )
    );

    const destSpendAfter = dest.dailySpend + movedAmount;
    const whySentence = `${src.name} is ${src.status} at ${src.roas.toFixed(2)}x. ${dest.name} earns ${dest.roas.toFixed(2)}x with ${Math.round(dest.coverDays)} days of stock.`;
    const expectedGainText = `+${formatINR(netRevenueLift)} extra revenue · ${confidence}% confidence`;

    const steps: PlanStep[] = [
      {
        label:
          actionTag === 'PAUSE'
            ? 'Pause Campaign Spend'
            : actionTag === 'REDIRECT'
            ? 'Cap Spend to 14 Days Cover'
            : 'Trim Ineffective Ad Sets (-35%)',
        from: formatINR(src.dailySpend),
        to: formatINR(sourceSpendAfter),
        description:
          actionTag === 'PAUSE'
            ? 'Halt active spending on zero inventory to eliminate click burn.'
            : actionTag === 'REDIRECT'
            ? 'Throttle spend to align velocity with 14-day stock replenishment runway.'
            : 'Prune lowest-performing ad sets and unprofitable placements.',
        title: actionTag === 'PAUSE' ? 'Pause Campaign Spend' : 'Optimize Spend',
        before: formatINR(src.dailySpend),
        after: formatINR(sourceSpendAfter),
      },
      {
        label: `Reallocate Budget to ${dest.name}`,
        from: formatINR(dest.dailySpend),
        to: formatINR(destSpendAfter),
        description: `Route ${formatINR(movedAmount)} to high-performing ${dest.channel} campaign earning ${dest.roas.toFixed(2)}x ROAS.`,
        title: `Reallocate to ${dest.name}`,
        before: formatINR(dest.dailySpend),
        after: formatINR(destSpendAfter),
      },
      {
        label:
          actionTag === 'PAUSE'
            ? 'Raise Priority Restock Order'
            : actionTag === 'REDIRECT'
            ? 'Dispatch Automated Reorder Alert'
            : 'Lower Algorithmic Bid Cap (-10%)',
        from:
          actionTag === 'PAUSE'
            ? '0 units ordered'
            : actionTag === 'REDIRECT'
            ? `${src.coverDays.toFixed(1)}d current cover`
            : `₹${src.cpc.toFixed(2)} CPC`,
        to:
          actionTag === 'PAUSE'
            ? `${Math.round(21 * src.dailyUnitsSold)} units ordered`
            : actionTag === 'REDIRECT'
            ? '14.0d runway'
            : `₹${(src.cpc * 0.9).toFixed(2)} CPC`,
        description:
          actionTag === 'PAUSE'
            ? `Trigger purchase order for 21 days demand (${Math.round(21 * src.dailyUnitsSold)} units).`
            : actionTag === 'REDIRECT'
            ? 'Notify supply chain operations to replenish stock.'
            : 'Enforce disciplined cost-per-click bidding threshold.',
        title: actionTag === 'PAUSE' ? 'Raise Restock Order' : 'Calibrate Bidding',
        before: actionTag === 'PAUSE' ? '0 units' : `${src.coverDays.toFixed(1)}d`,
        after: actionTag === 'PAUSE' ? `${Math.round(21 * src.dailyUnitsSold)} units` : '14.0d',
      },
    ];

    const result: PlanResultTile[] = [
      {
        label: `${src.name} Spend`,
        from: formatINR(src.dailySpend),
        to: formatINR(sourceSpendAfter),
        before: formatINR(src.dailySpend),
        after: formatINR(sourceSpendAfter),
      },
      {
        label: `${dest.name} Spend`,
        from: formatINR(dest.dailySpend),
        to: formatINR(destSpendAfter),
        before: formatINR(dest.dailySpend),
        after: formatINR(destSpendAfter),
      },
      {
        label: 'Net Revenue Lift',
        from: '₹0/day',
        to: `+${formatINR(netRevenueLift)}`,
        before: '₹0/day',
        after: `+${formatINR(netRevenueLift)}`,
      },
    ];

    return {
      actionId,
      actionType: 'reallocation',
      actionTag,
      title: 'Move budget',
      subtitle: `${src.name} (${src.channel}) → ${dest.name} (${dest.channel})`,
      heroAmount: movedAmount,
      heroSubtitle: 'moves to a campaign that earns more',
      sourceCampaignId: src.id,
      sourceProductName: src.name,
      sourceChannel: src.channel,
      sourceSpendBefore: src.dailySpend,
      sourceSpendAfter,
      sourceRoas: src.roas,
      sourceCoverDays: src.coverDays,
      targetCampaignId: dest.id,
      targetProductName: dest.name,
      targetChannel: dest.channel,
      targetSpendBefore: dest.dailySpend,
      targetSpendAfter: destSpendAfter,
      targetRoas: dest.roas,
      targetMarginalRoas,
      targetCoverDays: dest.coverDays,
      movedAmount,
      why: whySentence,
      expectedGain: expectedGainText,
      netRevenueLift,
      confidence,
      details: {
        formula: `${formatINR(movedAmount)} × (${targetMarginalRoas}x − ${src.roas.toFixed(2)}x) = +${formatINR(netRevenueLift)}`,
        sourceId: `${src.channel.toLowerCase()}-${src.id}`,
        targetId: `${dest.channel.toLowerCase()}-${dest.id}`,
        assumptions:
          'Destination marginal ROAS calculated at 85% of baseline ROAS (diminishing marginal returns); destination expansion capped at +50% of current spend.',
      },
      issue: `${src.name} (${src.channel}) ${src.status}`,
      evidence: [
        `Source ROAS: ${src.roas.toFixed(2)}x with ${formatINR(src.dailySpend)} daily spend.`,
        `Inventory runway: ${src.inventory} units (${src.coverDays.toFixed(1)} days of cover).`,
        `Target ROAS: ${dest.roas.toFixed(2)}x with ${Math.round(dest.coverDays)} days cover.`,
      ],
      steps,
      result,
      deltas: {
        sourceSpendDelta: -(src.dailySpend - sourceSpendAfter),
        targetSpendDelta: movedAmount,
        paused: actionTag === 'PAUSE',
        restockUnits: actionTag === 'PAUSE' ? Math.round(21 * src.dailyUnitsSold) : undefined,
        reorderAlert: actionTag === 'REDIRECT',
        projectedRoas:
          actionTag === 'TRIM'
            ? Number((src.roas + (TARGET_ROAS - src.roas) * 0.7).toFixed(2))
            : undefined,
        cpcDelta: actionTag === 'TRIM' ? Number((src.cpc * 0.9).toFixed(2)) : undefined,
      },
      actionButtonLabel: `Move ${formatINR(movedAmount)}`,

      // Compatibility
      issueBanner: `${src.name} (${src.channel}) ${src.status}`,
      resultTiles: result,
      receivingProductId: dest.id,
      receivingProductName: dest.name,
      reallocatedSpend: movedAmount,
    };
  }

  // FIX action: fix-${productId}
  const productId = actionId.replace(/^fix-/, '');
  const product = state.products.find((p) => p.id === productId);
  if (!product) {
    throw new Error(`Product not found for fix action: ${actionId}`);
  }

  // Find best destination candidate (ROAS >= 3.2, cover >= 21d, not paused)
  const eligibleCandidates = state.products.filter(
    (p) =>
      p.id !== product.id &&
      p.inventory > 0 &&
      p.coverDays >= 21 &&
      p.roas >= TARGET_ROAS &&
      !p.paused
  );
  const sameChannelCandidates = eligibleCandidates.filter((p) => p.channel === product.channel);
  const rankedCandidates = (
    sameChannelCandidates.length > 0 ? sameChannelCandidates : eligibleCandidates
  ).sort((a, b) => b.roas - a.roas);
  const bestDest =
    rankedCandidates[0] || state.products.find((p) => p.id !== product.id) || product;

  const destCap = bestDest.dailySpend * 0.5 - (bestDest.addedSpendFromReallocations || 0);
  const destMarginalRoas = Number((bestDest.roas * 0.85).toFixed(3));

  if (product.inventory <= 0 || product.status === 'stockout') {
    const rawMove = product.dailySpend * 0.8;
    const movedAmount = Math.max(0, Math.min(Math.round(rawMove), Math.round(Math.max(0, destCap))));
    const restockUnits = Math.round(21 * product.dailyUnitsSold);
    const netRevenueLift = Math.max(
      0,
      Math.round(movedAmount * (destMarginalRoas - product.roas))
    );
    const sameChannel = product.channel.toLowerCase() === bestDest.channel.toLowerCase();
    const confidence = Math.round(
      Math.min(
        95,
        Math.max(
          40,
          50 + 10 * (bestDest.roas - product.roas) + Math.min(15, bestDest.coverDays / 3) + (sameChannel ? 5 : 0)
        )
      )
    );

    const steps: PlanStep[] = [
      {
        label: 'Pause Campaign & Stop Ad Waste',
        from: formatINR(product.dailySpend),
        to: '₹0/day',
        description: `Trip automated circuit-breaker on ${product.channel} to halt spending on zero inventory.`,
        title: 'Pause Campaign & Stop Ad Waste',
        before: formatINR(product.dailySpend),
        after: '₹0/day',
      },
      {
        label: `Reallocate 80% Budget to ${bestDest.name}`,
        from: formatINR(bestDest.dailySpend),
        to: formatINR(bestDest.dailySpend + movedAmount),
        description: `Shift ${formatINR(movedAmount)} freed capital to high-performing ${bestDest.channel} campaign (capped at +50%).`,
        title: `Reallocate 80% Budget to ${bestDest.name}`,
        before: formatINR(bestDest.dailySpend),
        after: formatINR(bestDest.dailySpend + movedAmount),
      },
      {
        label: 'Raise Restock Request for 21 Days of Demand',
        from: '0 units ordered',
        to: `${restockUnits} units ordered`,
        description: `Dispatch priority procurement purchase order for ${restockUnits} units based on ${product.dailyUnitsSold} pairs/day run-rate.`,
        title: 'Raise Restock Request for 21 Days of Demand',
        before: '0 units ordered',
        after: `${restockUnits} units ordered`,
      },
    ];

    const result: PlanResultTile[] = [
      {
        label: 'Ad Spend at Risk',
        from: formatINR(product.dailySpend),
        to: '₹0/day',
        before: formatINR(product.dailySpend),
        after: '₹0/day (Zero Waste)',
      },
      {
        label: `Reallocated Yield (${bestDest.name})`,
        from: '₹0/day added',
        to: `+${formatINR(netRevenueLift)} rev`,
        before: '₹0/day added',
        after: `+${formatINR(netRevenueLift)} projected rev`,
      },
      {
        label: 'Restock Pipeline',
        from: '0 units',
        to: `${restockUnits} units in transit`,
        before: '0 units',
        after: `${restockUnits} units in transit`,
      },
    ];

    return {
      actionId,
      actionType: 'fix',
      actionTag: 'PAUSE',
      title: 'Fix stockout',
      subtitle: `${product.name} (${product.channel}) → ${bestDest.name} (${bestDest.channel})`,
      heroAmount: movedAmount,
      heroSubtitle: 'budget protected & reallocated to highest yield',
      sourceCampaignId: product.id,
      sourceProductName: product.name,
      sourceChannel: product.channel,
      sourceSpendBefore: product.dailySpend,
      sourceSpendAfter: 0,
      sourceRoas: product.roas,
      sourceCoverDays: 0,
      targetCampaignId: bestDest.id,
      targetProductName: bestDest.name,
      targetChannel: bestDest.channel,
      targetSpendBefore: bestDest.dailySpend,
      targetSpendAfter: bestDest.dailySpend + movedAmount,
      targetRoas: bestDest.roas,
      targetMarginalRoas: destMarginalRoas,
      targetCoverDays: bestDest.coverDays,
      movedAmount,
      why: `${product.name} is out of stock (0 units). Pausing spend and moving ${formatINR(movedAmount)} to ${bestDest.name} (${bestDest.roas.toFixed(2)}x ROAS).`,
      expectedGain: `+${formatINR(netRevenueLift)} extra revenue · ${confidence}% confidence`,
      netRevenueLift,
      confidence,
      details: {
        formula: `${formatINR(movedAmount)} × (${destMarginalRoas}x − ${product.roas.toFixed(2)}x) = +${formatINR(netRevenueLift)}`,
        sourceId: `${product.channel.toLowerCase()}-${product.id}`,
        targetId: `${bestDest.channel.toLowerCase()}-${bestDest.id}`,
        assumptions:
          'Paused zero-inventory spend; reallocated 80% to best performing campaign capped at +50%; raised 21-day restock request.',
      },
      issue: 'Out of stock while ads are still running',
      evidence: [
        `Inventory is 0 units while ${formatINR(product.dailySpend)} in ad spend continues burning.`,
        `Current ROAS ${product.roas.toFixed(2)}x is generating zero-fulfillment clicks and customer bounce.`,
        `Unmet customer demand: ~${product.dailyUnitsSold} pairs/day lost with ₹0 revenue capture.`,
        '100% of current ad spend is at risk with zero inventory runway.',
      ],
      steps,
      result,
      deltas: {
        sourceSpendDelta: -product.dailySpend,
        targetSpendDelta: movedAmount,
        paused: true,
        restockUnits,
      },
      actionButtonLabel: `Move ${formatINR(movedAmount)}`,

      // Compatibility
      issueBanner: 'Out of stock while ads are still running',
      resultTiles: result,
      receivingProductId: bestDest.id,
      receivingProductName: bestDest.name,
      reallocatedSpend: movedAmount,
      restockUnits,
      actionTakenText: `Paused campaign (₹0/day); shifted ${formatINR(movedAmount)} to ${bestDest.name}; raised restock PO for ${restockUnits} units`,
      outcomeText: `Eliminated ${formatINR(product.dailySpend)} ad waste; +${formatINR(netRevenueLift)} proj rev`,
    };
  }

  if (product.coverDays < 7 || product.status === 'low stock') {
    const allowableSpend = Math.round(product.dailySpend * (product.coverDays / 14));
    const freed = Math.max(0, product.dailySpend - allowableSpend);
    const movedAmount = Math.max(0, Math.min(Math.round(freed * 0.8), Math.round(Math.max(0, destCap))));
    const netRevenueLift = Math.max(
      0,
      Math.round(movedAmount * (destMarginalRoas - product.roas))
    );
    const sameChannel = product.channel.toLowerCase() === bestDest.channel.toLowerCase();
    const confidence = Math.round(
      Math.min(
        95,
        Math.max(
          40,
          50 + 10 * (bestDest.roas - product.roas) + Math.min(15, bestDest.coverDays / 3) + (sameChannel ? 5 : 0)
        )
      )
    );

    const steps: PlanStep[] = [
      {
        label: 'Cap Spend to Extend Stock Runway to 14 Days',
        from: formatINR(product.dailySpend),
        to: formatINR(allowableSpend),
        description: `Throttle daily spend by ${Math.round((1 - product.coverDays / 14) * 100)}% to align unit velocity with 14-day supply replenishment window.`,
        title: 'Cap Spend to Extend Stock Runway to 14 Days',
        before: formatINR(product.dailySpend),
        after: formatINR(allowableSpend),
      },
      {
        label: `Reallocate 80% Freed Budget to ${bestDest.name}`,
        from: formatINR(bestDest.dailySpend),
        to: formatINR(bestDest.dailySpend + movedAmount),
        description: `Route ${formatINR(movedAmount)} surplus to scale healthy inventory on ${bestDest.channel}.`,
        title: `Reallocate 80% Freed Budget to ${bestDest.name}`,
        before: formatINR(bestDest.dailySpend),
        after: formatINR(bestDest.dailySpend + movedAmount),
      },
      {
        label: 'Send Automated Reorder Alert',
        from: `${product.coverDays.toFixed(1)}d current cover`,
        to: '14.0d runway (Alert Sent)',
        description: 'Notify supply chain ops and trigger ERP stock replenishment workflow.',
        title: 'Send Automated Reorder Alert',
        before: `${product.coverDays.toFixed(1)}d current cover`,
        after: '14.0d runway (Reorder Alert Sent)',
      },
    ];

    const result: PlanResultTile[] = [
      {
        label: 'Stock Runway',
        from: `${product.coverDays.toFixed(1)} days`,
        to: '14.0 days',
        before: `${product.coverDays.toFixed(1)} days`,
        after: '14.0 days extended',
      },
      {
        label: 'Daily Ad Spend',
        from: formatINR(product.dailySpend),
        to: formatINR(allowableSpend),
        before: formatINR(product.dailySpend),
        after: `${formatINR(allowableSpend)} (Capped)`,
      },
      {
        label: `Reallocated Yield (${bestDest.name})`,
        from: '₹0/day added',
        to: `+${formatINR(netRevenueLift)} rev`,
        before: '₹0/day added',
        after: `+${formatINR(netRevenueLift)} projected rev`,
      },
    ];

    return {
      actionId,
      actionType: 'fix',
      actionTag: 'REDIRECT',
      title: 'Fix low stock',
      subtitle: `${product.name} (${product.channel}) → ${bestDest.name} (${bestDest.channel})`,
      heroAmount: movedAmount,
      heroSubtitle: 'runway extended & surplus reallocated',
      sourceCampaignId: product.id,
      sourceProductName: product.name,
      sourceChannel: product.channel,
      sourceSpendBefore: product.dailySpend,
      sourceSpendAfter: allowableSpend,
      sourceRoas: product.roas,
      sourceCoverDays: product.coverDays,
      targetCampaignId: bestDest.id,
      targetProductName: bestDest.name,
      targetChannel: bestDest.channel,
      targetSpendBefore: bestDest.dailySpend,
      targetSpendAfter: bestDest.dailySpend + movedAmount,
      targetRoas: bestDest.roas,
      targetMarginalRoas: destMarginalRoas,
      targetCoverDays: bestDest.coverDays,
      movedAmount,
      why: `${product.name} has low stock (${product.coverDays.toFixed(1)} days). Capping spend to 14 days and moving ${formatINR(movedAmount)} to ${bestDest.name}.`,
      expectedGain: `+${formatINR(netRevenueLift)} extra revenue · ${confidence}% confidence`,
      netRevenueLift,
      confidence,
      details: {
        formula: `${formatINR(movedAmount)} × (${destMarginalRoas}x − ${product.roas.toFixed(2)}x) = +${formatINR(netRevenueLift)}`,
        sourceId: `${product.channel.toLowerCase()}-${product.id}`,
        targetId: `${bestDest.channel.toLowerCase()}-${bestDest.id}`,
        assumptions:
          'Cap spend to 14 days cover; move 80% freed budget; dispatch automated reorder alert.',
      },
      issue: `Low stock runway (${product.coverDays.toFixed(1)} days) risks premature stockout`,
      evidence: [
        `Only ${product.inventory} units remaining with run-rate of ${product.dailyUnitsSold} units/day.`,
        `Current ad spend of ${formatINR(product.dailySpend)} will exhaust inventory in ${product.coverDays.toFixed(1)} days.`,
        'Stockout runway is under the 7-day critical supply chain buffer.',
        `Spend at risk: ${formatINR(product.dailySpend)} accelerates depletion before restock arrival.`,
      ],
      steps,
      result,
      deltas: {
        sourceSpendDelta: -(product.dailySpend - allowableSpend),
        targetSpendDelta: movedAmount,
        reorderAlert: true,
      },
      actionButtonLabel: `Move ${formatINR(movedAmount)}`,

      // Compatibility
      issueBanner: `Low stock runway (${product.coverDays.toFixed(1)} days) risks premature stockout`,
      resultTiles: result,
      receivingProductId: bestDest.id,
      receivingProductName: bestDest.name,
      reallocatedSpend: movedAmount,
      cappedSpend: allowableSpend,
      actionTakenText: `Capped spend at ${formatINR(allowableSpend)} (14d runway); moved ${formatINR(movedAmount)} to ${bestDest.name}; dispatched reorder alert`,
      outcomeText: `Extended runway from ${product.coverDays.toFixed(1)}d to 14d; +${formatINR(netRevenueLift)} proj rev`,
    };
  }

  // Below target / Below floor
  const isBelowFloor = product.roas < FLOOR_ROAS;
  const cut = Math.round(product.dailySpend * 0.35);
  const newSpend = Math.round(product.dailySpend * 0.65);
  const movedAmount = Math.max(0, Math.min(Math.round(cut * 0.7), Math.round(Math.max(0, destCap))));
  const projectedRoas = Number((product.roas + (TARGET_ROAS - product.roas) * 0.7).toFixed(2));
  const newCpc = Number((product.cpc * 0.9).toFixed(2));
  const netRevenueLift = Math.max(
    0,
    Math.round(movedAmount * (destMarginalRoas - product.roas))
  );
  const sameChannel = product.channel.toLowerCase() === bestDest.channel.toLowerCase();
  const confidence = Math.round(
    Math.min(
      95,
      Math.max(
        40,
        50 + 10 * (bestDest.roas - product.roas) + Math.min(15, bestDest.coverDays / 3) + (sameChannel ? 5 : 0)
      )
    )
  );

  const steps: PlanStep[] = [
    {
      label: 'Trim 35% Spend on Lowest Ad Sets',
      from: formatINR(product.dailySpend),
      to: formatINR(newSpend),
      description: 'Prune bottom-quartile search queries, high-bounce keywords, and unprofitable placements.',
      title: 'Cut 35% Spend on Lowest-Converting Ad Sets',
      before: formatINR(product.dailySpend),
      after: formatINR(newSpend),
    },
    {
      label: `Reallocate 70% of Trim to ${bestDest.name}`,
      from: formatINR(bestDest.dailySpend),
      to: formatINR(bestDest.dailySpend + movedAmount),
      description: `Reallocate ${formatINR(movedAmount)} of savings to high-performing ${bestDest.channel} campaign.`,
      title: `Move 70% of Cut to ${bestDest.name}`,
      before: formatINR(bestDest.dailySpend),
      after: formatINR(bestDest.dailySpend + movedAmount),
    },
    {
      label: 'Lower Algorithmic Bid Cap by 10%',
      from: `₹${product.cpc.toFixed(2)} CPC`,
      to: `₹${newCpc.toFixed(2)} CPC`,
      description: 'Enforce disciplined cost-per-click bidding threshold to curb ad cost inflation.',
      title: 'Lower Algorithmic Bid Cap by 10%',
      before: `₹${product.cpc.toFixed(2)} CPC`,
      after: `₹${newCpc.toFixed(2)} CPC`,
    },
  ];

  const result: PlanResultTile[] = [
    {
      label: 'Campaign ROAS',
      from: `${product.roas.toFixed(2)}x`,
      to: `${projectedRoas.toFixed(2)}x`,
      before: `${product.roas.toFixed(2)}x`,
      after: `${projectedRoas.toFixed(2)}x (Projected)`,
    },
    {
      label: 'Daily Ad Spend',
      from: formatINR(product.dailySpend),
      to: formatINR(newSpend),
      before: formatINR(product.dailySpend),
      after: `${formatINR(newSpend)} (-35%)`,
    },
    {
      label: `Reallocated Yield (${bestDest.name})`,
      from: '₹0/day added',
      to: `+${formatINR(netRevenueLift)} rev`,
      before: '₹0/day added',
      after: `+${formatINR(netRevenueLift)} projected rev`,
    },
  ];

  return {
    actionId,
    actionType: 'fix',
    actionTag: 'TRIM',
    title: isBelowFloor ? 'Fix sub-floor ROAS' : 'Fix below-target ROAS',
    subtitle: `${product.name} (${product.channel}) → ${bestDest.name} (${bestDest.channel})`,
    heroAmount: movedAmount,
    heroSubtitle: 'inefficient ad spend trimmed & reallocated',
    sourceCampaignId: product.id,
    sourceProductName: product.name,
    sourceChannel: product.channel,
    sourceSpendBefore: product.dailySpend,
    sourceSpendAfter: newSpend,
    sourceRoas: product.roas,
    sourceCoverDays: product.coverDays,
    targetCampaignId: bestDest.id,
    targetProductName: bestDest.name,
    targetChannel: bestDest.channel,
    targetSpendBefore: bestDest.dailySpend,
    targetSpendAfter: bestDest.dailySpend + movedAmount,
    targetRoas: bestDest.roas,
    targetMarginalRoas: destMarginalRoas,
    targetCoverDays: bestDest.coverDays,
    movedAmount,
    why: `${product.name} is ${isBelowFloor ? 'below floor' : 'below target'} at ${product.roas.toFixed(2)}x. Moving ${formatINR(movedAmount)} to ${bestDest.name} earning ${bestDest.roas.toFixed(2)}x.`,
    expectedGain: `+${formatINR(netRevenueLift)} extra revenue · ${confidence}% confidence`,
    netRevenueLift,
    confidence,
    details: {
      formula: `${formatINR(movedAmount)} × (${destMarginalRoas}x − ${product.roas.toFixed(2)}x) = +${formatINR(netRevenueLift)}`,
      sourceId: `${product.channel.toLowerCase()}-${product.id}`,
      targetId: `${bestDest.channel.toLowerCase()}-${bestDest.id}`,
      assumptions: `Trim worst 35% ad sets; move 70% of trim; lower bid cap 10%; projected ROAS = roas + (3.2 − roas) × 0.7 = ${projectedRoas}x.`,
    },
    issue: isBelowFloor
      ? `Critical: ROAS (${product.roas.toFixed(2)}x) is below 1.8x breakeven floor`
      : `Below Target: ROAS (${product.roas.toFixed(2)}x) trails 3.2x benchmark`,
    evidence: [
      `Current ROAS of ${product.roas.toFixed(2)}x is ${isBelowFloor ? 'losing money on every ad conversion below 1.8x floor' : 'trailing the 3.2x target profitability benchmark'}.`,
      `Daily ad spend of ${formatINR(product.dailySpend)} running on sub-optimal ad sets.`,
      `Current CPC of ₹${product.cpc.toFixed(2)} and CVR of ${(product.cvr * 100).toFixed(1)}% indicate high acquisition friction.`,
      `Spend at risk: ${formatINR(product.dailySpend)}.`,
    ],
    steps,
    result,
    deltas: {
      sourceSpendDelta: -(product.dailySpend - newSpend),
      targetSpendDelta: movedAmount,
      projectedRoas,
      cpcDelta: newCpc,
    },
    actionButtonLabel: `Move ${formatINR(movedAmount)}`,

    // Compatibility
    issueBanner: isBelowFloor
      ? `Critical: ROAS (${product.roas.toFixed(2)}x) is below 1.8x breakeven floor`
      : `Below Target: ROAS (${product.roas.toFixed(2)}x) trails 3.2x benchmark`,
    resultTiles: result,
    receivingProductId: bestDest.id,
    receivingProductName: bestDest.name,
    reallocatedSpend: movedAmount,
    newSpend,
    projectedRoas,
    actionTakenText: `Cut 35% spend (${formatINR(newSpend)}); shifted ${formatINR(movedAmount)} to ${bestDest.name}; lowered bid cap 10%`,
    outcomeText: `ROAS projected to lift from ${product.roas.toFixed(2)}x to ${projectedRoas.toFixed(2)}x; saved ${formatINR(cut)}`,
  };
}

/**
 * PURE FUNCTION: executeAction
 * Validates, applies deltas to the product catalog, writes a ledger row, returns result summary.
 * Used by FIX, row Execute, Execute All and Auto-Pilot.
 *
 * Idempotent: an already executed action ID is rejected.
 * Double clicks cannot execute twice.
 * If execution fails, throws and leaves input state completely unchanged.
 */
export function executeAction(
  products: ProductModel[],
  actionId: string,
  options?: { isAuto?: boolean; timestampStr?: string; alreadyExecutedIds?: Set<string> }
): { updatedProducts: ProductModel[]; newLedgerEntry: GaugesLedgerItem; plan: ActionPlan } {
  // Idempotency check 1: check alreadyExecutedIds set
  if (options?.alreadyExecutedIds?.has(actionId)) {
    throw new Error(`Action "${actionId}" has already been executed.`);
  }

  const derived = products.map((p) => deriveProduct(p));
  const plan = buildPlan({ products: derived }, actionId);

  const source = products.find((p) => p.id === plan.sourceCampaignId);
  if (!source) {
    throw new Error(`Source campaign "${plan.sourceCampaignId}" not found.`);
  }

  // Idempotency check 2: if source is already fixed
  if (source.isFixed) {
    throw new Error(`Campaign "${source.name}" has already been fixed.`);
  }

  const now = new Date();
  const timeFormatted =
    options?.timestampStr ||
    `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;

  const dest = plan.targetCampaignId
    ? products.find((p) => p.id === plan.targetCampaignId)
    : undefined;

  const updatedProducts = products.map((p) => {
    if (p.id === source.id) {
      return {
        ...p,
        dailySpend: plan.sourceSpendAfter,
        roas: plan.deltas.projectedRoas ?? p.roas,
        cpc: plan.deltas.cpcDelta ?? p.cpc,
        isFixed: true,
        fixedAt: timeFormatted,
        paused: plan.deltas.paused ?? p.paused,
        restockUnitsOrdered: plan.deltas.restockUnits ?? p.restockUnitsOrdered,
        reorderAlertSent: plan.deltas.reorderAlert ?? p.reorderAlertSent,
        appliedActionId: actionId,
        appliedPlan: plan,
      };
    }

    if (dest && p.id === dest.id && plan.movedAmount > 0) {
      const oldSpend = p.dailySpend;
      const oldRev = oldSpend * p.roas;
      const addedSpend = plan.movedAmount;
      const addedRev = addedSpend * (plan.targetMarginalRoas ?? p.roas * 0.85);

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
    id: `ledg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: timeFormatted,
    product: plan.sourceProductName,
    channel: plan.sourceChannel,
    issue: plan.issue,
    actionTaken:
      plan.actionType === 'reallocation'
        ? `[${plan.actionTag}] Moved ${formatINR(plan.movedAmount)} from ${plan.sourceProductName} (${plan.sourceChannel}) → ${plan.targetProductName} (${plan.targetChannel})`
        : plan.steps.map((s) => s.label).join('; '),
    outcome:
      plan.actionType === 'reallocation'
        ? `+${formatINR(plan.netRevenueLift)} proj revenue lift/day (${plan.confidence}% conf)`
        : `+${formatINR(plan.netRevenueLift || 0)} proj revenue; budget efficiency calibrated`,
    isAuto: options?.isAuto ?? false,
  };

  return { updatedProducts, newLedgerEntry, plan };
}

/**
 * Legacy compatibility wrappers (delegate strictly to executeAction)
 */
export function applyFixPlan(
  products: ProductModel[],
  productId: string,
  _plan?: FixPlanSummary,
  timestampStr?: string
) {
  return executeAction(products, `fix-${productId}`, { timestampStr });
}

export function applyReallocation(
  products: ProductModel[],
  reallocation: ReallocationItem,
  isAuto = false,
  timestampStr?: string
) {
  return executeAction(products, reallocation.id, { isAuto, timestampStr });
}

export function computeFixPlan(product: DerivedProduct, allProducts: DerivedProduct[]): FixPlanSummary {
  return buildPlan({ products: allProducts }, `fix-${product.id}`);
}
