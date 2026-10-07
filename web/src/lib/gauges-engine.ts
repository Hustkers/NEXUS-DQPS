export type ChannelType = 'Google' | 'Amazon' | 'Meta' | 'TikTok' | 'Shopify';

export type ProductStatus = 'stockout' | 'low stock' | 'below floor' | 'below target' | 'target met' | 'fixed';

export interface ProductModel {
  id: string;
  name: string;
  channel: ChannelType;
  inventory: number;
  dailyUnitsSold: number;
  dailySpend: number; // in INR (₹14,000 - ₹42,000)
  roas: number;       // 1.5x - 4.5x
  cpc: number;
  cvr: number;
  photoUrl?: string;
  sku?: string;
  category?: string;
  // Execution/Fix state
  isFixed?: boolean;
  fixedAt?: string;
  paused?: boolean;
  restockUnitsOrdered?: number;
  reorderAlertSent?: boolean;
  appliedPlan?: FixPlanSummary;
}

export interface DerivedProduct extends ProductModel {
  coverDays: number;
  status: ProductStatus;
  healthScore: number;
  revenue: number;
  effectiveStatus: ProductStatus;
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

export interface GaugesLedgerItem {
  id: string;
  timestamp: string;
  product: string;
  channel: ChannelType;
  issue: string;
  actionTaken: string;
  outcome: string;
}

export const FLOOR_ROAS = 1.8;
export const TARGET_ROAS = 3.2;

/**
 * Derives dynamic metrics from the product state:
 * - coverDays = dailyUnitsSold > 0 ? inventory / dailyUnitsSold : 0
 * - status (in priority order):
 *     1. stockout (inventory 0)
 *     2. low stock (cover < 7 days)
 *     3. below floor (ROAS < 1.8)
 *     4. below target (ROAS < 3.2)
 *     5. target met
 * - health score = min(100, roas/3.2*80)*0.7 + min(100, coverDays/14*100)*0.3
 * Note: A product with 0 stock must never look healthy (cover component = 0, status = stockout).
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

  // Pure health score calculation
  const roasComponent = Math.min(100, (product.roas / TARGET_ROAS) * 80) * 0.7;
  const coverComponent = Math.min(100, (coverDays / 14) * 100) * 0.3;
  let rawHealth = roasComponent + coverComponent;

  // Zero inventory guard: ensure health score is never considered healthy
  if (product.inventory <= 0) {
    rawHealth = Math.min(rawHealth, 35);
  }

  const healthScore = Math.round(Math.min(100, Math.max(0, rawHealth)));
  const revenue = product.dailySpend * product.roas;

  return {
    ...product,
    coverDays,
    status: baseStatus,
    healthScore: product.isFixed ? Math.max(healthScore, 85) : healthScore,
    revenue,
    effectiveStatus: product.isFixed ? 'fixed' : baseStatus,
  };
}

/**
 * Seed dataset of 12 realistic Nike footwear products.
 * Mix: 7 healthy, 2 stockouts, 1 low-stock, 1 below-target, 1 below-floor.
 * Spend: ₹14,000 - ₹42,000/day. ROAS: 1.5x - 4.5x.
 */
export const INITIAL_PRODUCTS: ProductModel[] = [
  // 1. Stockout #1 (Meta)
  {
    id: 'nike-dunk-low',
    name: 'Nike Dunk Low Retro',
    channel: 'Meta',
    inventory: 0,
    dailyUnitsSold: 18,
    dailySpend: 28000,
    roas: 2.35,
    cpc: 34.5,
    cvr: 0.032,
    photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/awjogtdnqxniqqk0wpgf/air-max-270-shoe-2V5C4p.jpg',
    sku: 'DD1391-100',
    category: 'Lifestyle',
  },
  // 2. Stockout #2 (Google)
  {
    id: 'nike-aj1-low',
    name: 'Nike Air Jordan 1 Low',
    channel: 'Google',
    inventory: 0,
    dailyUnitsSold: 22,
    dailySpend: 36000,
    roas: 2.15,
    cpc: 41.2,
    cvr: 0.028,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/qb2ry1p1iv2vqrdfq4oa/air-jordan-1-mid-shoe-BpARGV.jpg',
    sku: '553558-136',
    category: 'Basketball',
  },
  // 3. Low Stock #1 (Amazon) - cover < 7 days (36 / 8 = 4.5 days)
  {
    id: 'nike-pegasus-40',
    name: 'Nike Pegasus 40',
    channel: 'Amazon',
    inventory: 36,
    dailyUnitsSold: 8,
    dailySpend: 24000,
    roas: 3.35,
    cpc: 26.8,
    cvr: 0.038,
    photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/x6jwtxaf3brhu6jisuf5/zoom-fly-running-shoe-OZEAxq.jpg',
    sku: 'DV3853-001',
    category: 'Running',
  },
  // 4. Below Floor #1 (Shopify) - ROAS < 1.8 (1.58x)
  {
    id: 'nike-metcon-9',
    name: 'Nike Metcon 9',
    channel: 'Shopify',
    inventory: 340,
    dailyUnitsSold: 10,
    dailySpend: 32000,
    roas: 1.58,
    cpc: 48.2,
    cvr: 0.021,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/ddb4c566-fcb0-47c0-8184-323ad9edff37/react-infinity-run-flyknit-running-shoe-ZjGHFz.jpg',
    sku: 'DZ2537-001',
    category: 'Training',
  },
  // 5. Below Target #1 (TikTok) - ROAS 2.65x (1.8 <= ROAS < 3.2)
  {
    id: 'nike-invincible-3',
    name: 'Nike Invincible 3',
    channel: 'TikTok',
    inventory: 360,
    dailyUnitsSold: 12,
    dailySpend: 26000,
    roas: 2.65,
    cpc: 31.4,
    cvr: 0.029,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/i1-b714d0a4-53ed-4919-9761-1bddc5dff48f/joyride-run-flyknit-running-shoe-sqfqGQ.jpg',
    sku: 'DR2615-101',
    category: 'Running',
  },
  // 6. Healthy #1 (Meta)
  {
    id: 'nike-af1-07',
    name: "Nike Air Force 1 '07",
    channel: 'Meta',
    inventory: 520,
    dailyUnitsSold: 18,
    dailySpend: 38000,
    roas: 3.8,
    cpc: 24.5,
    cvr: 0.044,
    photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/oplkqwyf7nwnj98f8agj/air-force-1-07-shoe-PATZxx4V.jpg',
    sku: 'CW2288-111',
    category: 'Lifestyle',
  },
  // 7. Healthy #2 (Google)
  {
    id: 'nike-vaporfly-3',
    name: 'Nike ZoomX Vaporfly 3',
    channel: 'Google',
    inventory: 480,
    dailyUnitsSold: 15,
    dailySpend: 34000,
    roas: 4.25,
    cpc: 28.0,
    cvr: 0.048,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/bbbwgncnxexhwgbz8qbp/air-max-2017-shoe-MkTmxxOd.jpg',
    sku: 'DV4129-100',
    category: 'Racing',
  },
  // 8. Healthy #3 (Amazon)
  {
    id: 'nike-infinityrn-4',
    name: 'Nike InfinityRN 4',
    channel: 'Amazon',
    inventory: 440,
    dailyUnitsSold: 14,
    dailySpend: 30000,
    roas: 3.65,
    cpc: 22.4,
    cvr: 0.041,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/ccsubyw6lzx10virtjdu/air-jordan-10-retro-shoe-f3jBkN.jpg',
    sku: 'DR2665-001',
    category: 'Running',
  },
  // 9. Healthy #4 (Shopify)
  {
    id: 'nike-vomero-17',
    name: 'Nike Vomero 17',
    channel: 'Shopify',
    inventory: 390,
    dailyUnitsSold: 13,
    dailySpend: 28000,
    roas: 3.5,
    cpc: 25.5,
    cvr: 0.039,
    photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/r4rbe0wqytas2utewhs9/air-huarache-shoe-2kvnqX.jpg',
    sku: 'FB1309-100',
    category: 'Running',
  },
  // 10. Healthy #5 (TikTok)
  {
    id: 'nike-blazer-mid',
    name: "Nike Blazer Mid '77",
    channel: 'TikTok',
    inventory: 510,
    dailyUnitsSold: 17,
    dailySpend: 25000,
    roas: 3.4,
    cpc: 19.8,
    cvr: 0.042,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/gmnsskvj5xjk5zm8bx2m/air-max-720-shoe-Ss8jMq.jpg',
    sku: 'BQ6806-100',
    category: 'Lifestyle',
  },
  // 11. Healthy #6 (Google)
  {
    id: 'nike-killshot-2',
    name: 'Nike Killshot 2',
    channel: 'Google',
    inventory: 420,
    dailyUnitsSold: 14,
    dailySpend: 22000,
    roas: 3.55,
    cpc: 21.2,
    cvr: 0.037,
    photoUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/ddb4c566-fcb0-47c0-8184-323ad9edff37/react-infinity-run-flyknit-running-shoe-ZjGHFz.jpg',
    sku: '432997-107',
    category: 'Tennis',
  },
  // 12. Healthy #7 (Meta)
  {
    id: 'nike-air-max-2017',
    name: 'Nike Air Max 2017',
    channel: 'Meta',
    inventory: 380,
    dailyUnitsSold: 12,
    dailySpend: 20000,
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
  },
];

/**
 * PURE FUNCTION: computeFixPlan
 * Input: product state (DerivedProduct), all products (DerivedProduct[])
 * Output: FixPlanSummary (issue + evidence + 3 steps + projected result tiles)
 *
 * Requirements:
 * - STOCKOUT: pause campaign (spend -> 0), move 80% to best in-stock product (cover >= 21d, ROAS >= target, prefer same channel), raise restock PO sized to 21 days demand.
 * - LOW STOCK: cap spend so stock lasts 14 days, move 80% of freed budget to best in-stock product, send reorder alert.
 * - BELOW TARGET / BELOW FLOOR: cut 35% spend, move 70% of cut to best product, lower bid cap by 10%. Projected ROAS = roas + (3.2 - roas) * 0.7.
 * - Diminishing returns: Reallocated budget earns 85% of receiving product's ROAS.
 * - Receiving cap: Increase on any receiving campaign is capped at +50%.
 */
export function computeFixPlan(product: DerivedProduct, allProducts: DerivedProduct[]): FixPlanSummary {
  // Find best in-stock product: cover >= 21 days, ROAS >= target (3.2), not the current product, prefer same channel
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
    const addedRevenue = Math.round(reallocatedSpend * (bestProduct.roas * 0.85));

    const steps: FixStep[] = [
      {
        title: 'Pause Campaign & Stop Ad Waste',
        description: `Trip automated circuit-breaker on ${product.channel} ad sets to halt spending on zero inventory.`,
        before: `₹${product.dailySpend.toLocaleString('en-IN')}/day`,
        after: '₹0/day',
      },
      {
        title: `Reallocate 80% Budget to ${bestProduct.name}`,
        description: `Shift ₹${reallocatedSpend.toLocaleString('en-IN')}/day freed capital to high-performing ${bestProduct.channel} campaign (capped at +50%).`,
        before: `₹${Math.round(bestProduct.dailySpend).toLocaleString('en-IN')}/day`,
        after: `₹${Math.round(bestProduct.dailySpend + reallocatedSpend).toLocaleString('en-IN')}/day`,
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
        before: `₹${product.dailySpend.toLocaleString('en-IN')}/day`,
        after: '₹0/day (Zero Waste)',
      },
      {
        label: `Reallocated Yield (${bestProduct.name})`,
        before: '₹0/day added',
        after: `+₹${addedRevenue.toLocaleString('en-IN')}/day projected rev`,
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
        `Inventory is 0 units while ₹${product.dailySpend.toLocaleString('en-IN')}/day in ad spend continues burning.`,
        `Current ROAS ${product.roas.toFixed(2)}x is generating zero-fulfillment clicks and customer bounce.`,
        `Unmet customer demand: ~${product.dailyUnitsSold} pairs/day lost with ₹0 revenue capture.`,
        '100% of current ad spend is at risk with zero inventory runway.',
      ],
      steps,
      resultTiles,
      projectionNote,
      receivingProductId: bestProduct.id,
      receivingProductName: bestProduct.name,
      reallocatedSpend,
      restockUnits,
      actionTakenText: `Paused campaign (₹0/day); shifted ₹${reallocatedSpend.toLocaleString('en-IN')}/day to ${bestProduct.name}; raised restock PO for ${restockUnits} units`,
      outcomeText: `Eliminated ₹${product.dailySpend.toLocaleString('en-IN')}/day ad waste; +₹${addedRevenue.toLocaleString('en-IN')}/day proj rev`,
    };
  }

  // 2. LOW STOCK (cover < 7 days)
  if (product.coverDays < 7 || product.status === 'low stock') {
    // Cap spend so stock lasts 14 days
    // allowable spend = dailySpend * (coverDays / 14)
    const ratio = Math.max(0.1, Math.min(0.9, product.coverDays / 14));
    const cappedSpend = Math.round(product.dailySpend * ratio);
    const freedBudget = Math.max(0, product.dailySpend - cappedSpend);
    const rawBudgetTransfer = freedBudget * 0.8;
    const reallocatedSpend = Math.round(Math.min(rawBudgetTransfer, receivingMaxIncrease));
    const addedRevenue = Math.round(reallocatedSpend * (bestProduct.roas * 0.85));

    const steps: FixStep[] = [
      {
        title: 'Cap Spend to Extend Stock Runway to 14 Days',
        description: `Throttle daily spend by ${Math.round((1 - ratio) * 100)}% to align unit velocity with 14-day supply replenishment window.`,
        before: `₹${product.dailySpend.toLocaleString('en-IN')}/day`,
        after: `₹${cappedSpend.toLocaleString('en-IN')}/day`,
      },
      {
        title: `Reallocate 80% Freed Budget to ${bestProduct.name}`,
        description: `Route ₹${reallocatedSpend.toLocaleString('en-IN')}/day surplus to scale healthy inventory on ${bestProduct.channel}.`,
        before: `₹${Math.round(bestProduct.dailySpend).toLocaleString('en-IN')}/day`,
        after: `₹${Math.round(bestProduct.dailySpend + reallocatedSpend).toLocaleString('en-IN')}/day`,
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
        before: `₹${product.dailySpend.toLocaleString('en-IN')}/day`,
        after: `₹${cappedSpend.toLocaleString('en-IN')}/day (Capped)`,
      },
      {
        label: `Reallocated Yield (${bestProduct.name})`,
        before: '₹0/day added',
        after: `+₹${addedRevenue.toLocaleString('en-IN')}/day projected rev`,
      },
    ];

    return {
      issueType: 'low_stock',
      issueBanner: `Low stock runway (${product.coverDays.toFixed(1)} days) risks premature stockout`,
      evidence: [
        `Only ${product.inventory} units remaining with run-rate of ${product.dailyUnitsSold} units/day.`,
        `Current ad spend of ₹${product.dailySpend.toLocaleString('en-IN')}/day will exhaust inventory in ${product.coverDays.toFixed(1)} days.`,
        'Stockout runway is under the 7-day critical supply chain buffer.',
        `Spend at risk: ₹${product.dailySpend.toLocaleString('en-IN')}/day accelerates depletion before restock arrival.`,
      ],
      steps,
      resultTiles,
      projectionNote,
      receivingProductId: bestProduct.id,
      receivingProductName: bestProduct.name,
      reallocatedSpend,
      cappedSpend,
      actionTakenText: `Capped spend at ₹${cappedSpend.toLocaleString('en-IN')}/day (14d runway); moved ₹${reallocatedSpend.toLocaleString('en-IN')}/day to ${bestProduct.name}; dispatched reorder alert`,
      outcomeText: `Extended runway from ${product.coverDays.toFixed(1)}d to 14d; +₹${addedRevenue.toLocaleString('en-IN')}/day proj rev`,
    };
  }

  // 3. BELOW TARGET / BELOW FLOOR (ROAS < 3.2 or ROAS < 1.8)
  const isBelowFloor = product.roas < FLOOR_ROAS;
  const cutAmount = Math.round(product.dailySpend * 0.35);
  const newSpend = Math.round(product.dailySpend * 0.65);
  const rawBudgetTransfer = cutAmount * 0.7;
  const reallocatedSpend = Math.round(Math.min(rawBudgetTransfer, receivingMaxIncrease));
  const newCpc = Number((product.cpc * 0.9).toFixed(2));
  // Projected ROAS = roas + (3.2 - roas) * 0.7
  const projectedRoas = Number((product.roas + (TARGET_ROAS - product.roas) * 0.7).toFixed(2));
  const addedRevenue = Math.round(reallocatedSpend * (bestProduct.roas * 0.85));
  const newProductRevenue = Math.round(newSpend * projectedRoas);

  const steps: FixStep[] = [
    {
      title: 'Cut 35% Spend on Lowest-Converting Ad Sets',
      description: 'Prune bottom-quartile search queries, high-bounce keywords, and unprofitable placements.',
      before: `₹${product.dailySpend.toLocaleString('en-IN')}/day`,
      after: `₹${newSpend.toLocaleString('en-IN')}/day`,
    },
    {
      title: `Move 70% of Cut to ${bestProduct.name}`,
      description: `Reallocate ₹${reallocatedSpend.toLocaleString('en-IN')}/day of savings to high-performing ${bestProduct.channel} campaign.`,
      before: `₹${Math.round(bestProduct.dailySpend).toLocaleString('en-IN')}/day`,
      after: `₹${Math.round(bestProduct.dailySpend + reallocatedSpend).toLocaleString('en-IN')}/day`,
    },
    {
      title: 'Lower Algorithmic Bid Cap by 10%',
      description: 'Enforce disciplined cost-per-click bidding threshold to curb ad cost inflation.',
      before: `₹${product.cpc.toFixed(2)} CPC`,
      after: `₹${newCpc.toFixed(2)} CPC`,
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
      before: `₹${product.dailySpend.toLocaleString('en-IN')}/day`,
      after: `₹${newSpend.toLocaleString('en-IN')}/day (-35%)`,
    },
    {
      label: 'Total Realized Revenue',
      before: `₹${Math.round(product.dailySpend * product.roas).toLocaleString('en-IN')}/day`,
      after: `₹${(newProductRevenue + addedRevenue).toLocaleString('en-IN')}/day combined`,
    },
  ];

  return {
    issueType: isBelowFloor ? 'below_floor' : 'below_target',
    issueBanner: isBelowFloor
      ? `Critical: ROAS (${product.roas.toFixed(2)}x) is below 1.8x breakeven floor`
      : `Below Target: ROAS (${product.roas.toFixed(2)}x) trails 3.2x benchmark`,
    evidence: [
      `Current ROAS of ${product.roas.toFixed(2)}x is ${isBelowFloor ? 'losing money on every ad conversion below 1.8x floor' : 'trailing the 3.2x target profitability benchmark'}.`,
      `Daily ad spend of ₹${product.dailySpend.toLocaleString('en-IN')}/day running on sub-optimal ad sets.`,
      `Current CPC of ₹${product.cpc.toFixed(2)} and CVR of ${(product.cvr * 100).toFixed(1)}% indicate high acquisition friction.`,
      `Spend at risk: ₹${product.dailySpend.toLocaleString('en-IN')}/day.`,
    ],
    steps,
    resultTiles,
    projectionNote,
    receivingProductId: bestProduct.id,
    receivingProductName: bestProduct.name,
    reallocatedSpend,
    newSpend,
    projectedRoas,
    actionTakenText: `Cut 35% spend (₹${newSpend.toLocaleString('en-IN')}/day); shifted ₹${reallocatedSpend.toLocaleString('en-IN')}/day to ${bestProduct.name}; lowered bid cap 10%`,
    outcomeText: `ROAS projected to lift from ${product.roas.toFixed(2)}x to ${projectedRoas.toFixed(2)}x; saved ₹${cutAmount.toLocaleString('en-IN')}/day`,
  };
}

/**
 * PURE STATE TRANSITION: applyFixPlan
 * Applies the executed fix plan to product list and returns updated products + new ledger entry.
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

  // Update target fixed product
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
    // below_floor or below_target
    updatedDailySpend = plan.newSpend ?? Math.round(fixedProduct.dailySpend * 0.65);
    updatedRoas = plan.projectedRoas ?? Number((fixedProduct.roas + (TARGET_ROAS - fixedProduct.roas) * 0.7).toFixed(2));
    updatedCpc = Number((fixedProduct.cpc * 0.9).toFixed(2));
  }

  // Update receiving product if applicable
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
      // Reallocated budget earns 85% of receiving product's ROAS (diminishing returns)
      const oldSpend = p.dailySpend;
      const oldRev = oldSpend * p.roas;
      const addedSpend = reallocated;
      const addedRev = addedSpend * (p.roas * 0.85);

      const newSpend = oldSpend + addedSpend;
      const newRev = oldRev + addedRev;
      const newRoas = Number((newRev / newSpend).toFixed(2));

      // Higher daily sales velocity proportionally from extra revenue
      const velocityMultiplier = newRev / (oldRev || 1);
      const newDailyUnitsSold = Math.max(1, Math.round(p.dailyUnitsSold * velocityMultiplier));

      return {
        ...p,
        dailySpend: Math.round(newSpend),
        roas: newRoas,
        dailyUnitsSold: newDailyUnitsSold,
      };
    }

    return p;
  });

  const newLedgerEntry: GaugesLedgerItem = {
    id: `ledg-fix-${Date.now()}`,
    timestamp: timeFormatted,
    product: fixedProduct.name,
    channel: fixedProduct.channel,
    issue: plan.issueBanner,
    actionTaken: plan.actionTakenText,
    outcome: plan.outcomeText,
  };

  return { updatedProducts, newLedgerEntry };
}
