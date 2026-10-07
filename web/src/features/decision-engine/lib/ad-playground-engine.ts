import type {
  AdPlaygroundConstraints,
  AdPlaygroundResult,
  CandidateAdConfig,
  PlaygroundProductSummary,
  ResponseCurvePoint
} from '../types/ad-playground-types';
import initialEngineState from '@/data/nexus-engine-state.json';

interface ArchetypeDef {
  config_id: string;
  title: string;
  platform: 'meta' | 'google' | 'amazon' | 'tiktok';
  objective: string;
  audience_segment: string;
  bidding_strategy: string;
  budget_weight: number;
  cvr_mult: number;
  cpm_mult: number;
  ctr_mult: number;
  yield_mult: number;
  confidence: number;
  desc: string;
  creative_format: string;
  placement: string;
  audience_type: string;
}

const ARCHETYPES: ArchetypeDef[] = [
  {
    config_id: 'cfg-meta-retarget',
    title: 'Meta Advantage+ High-Intent Retargeting',
    platform: 'meta',
    objective: 'Purchase / Bottom-Funnel',
    audience_segment: 'Website Cart Abandoners & 30d Product Viewers',
    bidding_strategy: 'Target ROAS (3.2x Floor)',
    budget_weight: 0.95,
    cvr_mult: 1.45,
    cpm_mult: 1.25,
    ctr_mult: 1.35,
    yield_mult: 1.15,
    confidence: 0.91,
    desc: 'Focuses spend on bottom-funnel shoppers with demonstrated high purchase intent.',
    creative_format: 'UGC Video',
    placement: 'Reels / Shorts',
    audience_type: 'retargeting'
  },
  {
    config_id: 'cfg-meta-lookalike',
    title: 'Meta Lookalike (1-2% High-Value Buyers)',
    platform: 'meta',
    objective: 'Purchase / Conversion',
    audience_segment: '1% LAL of Top 10% Lifetime Value Footwear Customers',
    bidding_strategy: 'Highest Volume / Lowest Cost',
    budget_weight: 1.2,
    cvr_mult: 1.15,
    cpm_mult: 1.05,
    ctr_mult: 1.1,
    yield_mult: 1.08,
    confidence: 0.88,
    desc: 'Scales acquisition against lookalike clusters resembling high-margin footwear collectors.',
    creative_format: 'UGC Video',
    placement: 'Auto / Advantage+',
    audience_type: 'lookalike'
  },
  {
    config_id: 'cfg-google-pmax',
    title: 'Google Performance Max (Omnichannel Search+Shopping)',
    platform: 'google',
    objective: 'Conversion Value Maximization',
    audience_segment: 'In-Market Athletic Footwear & Custom Search Intent',
    bidding_strategy: 'Target ROAS (3.0x Floor)',
    budget_weight: 1.35,
    cvr_mult: 1.3,
    cpm_mult: 1.15,
    ctr_mult: 1.2,
    yield_mult: 1.12,
    confidence: 0.89,
    desc: 'Leverages Google Smart Bidding across Shopping, Search, YouTube, and Maps.',
    creative_format: 'Product Feed Showcase',
    placement: 'Search / Grid',
    audience_type: 'search'
  },
  {
    config_id: 'cfg-google-brand-sku',
    title: 'Google Search Exact SKU & Brand Match',
    platform: 'google',
    objective: 'Purchase / High Intent',
    audience_segment: "Exact Search Queries (e.g., 'Nike Air Max Buy')",
    bidding_strategy: 'Target CPA (₹450 Ceiling)',
    budget_weight: 0.8,
    cvr_mult: 1.55,
    cpm_mult: 1.4,
    ctr_mult: 1.5,
    yield_mult: 1.2,
    confidence: 0.93,
    desc: 'Defends high-margin branded search traffic with precise keyword intent.',
    creative_format: 'Static Image Carousel',
    placement: 'Search / Grid',
    audience_type: 'search'
  },
  {
    config_id: 'cfg-amazon-exact',
    title: 'Amazon Sponsored Products Exact Keyword Match',
    platform: 'amazon',
    objective: 'Marketplace Purchase',
    audience_segment: 'High-Converting Sneaker Search Terms & Competitor ASINs',
    bidding_strategy: 'Target ACoS / Target ROAS (3.4x)',
    budget_weight: 1.1,
    cvr_mult: 1.4,
    cpm_mult: 1.2,
    ctr_mult: 1.25,
    yield_mult: 1.14,
    confidence: 0.9,
    desc: 'Converts ready-to-buy Amazon Prime members directly on product listings.',
    creative_format: 'Product Feed Showcase',
    placement: 'Search / Grid',
    audience_type: 'search'
  },
  {
    config_id: 'cfg-amazon-category',
    title: 'Amazon Sponsored Brands Category Conquesting',
    platform: 'amazon',
    objective: 'Brand Consideration & Share of Shelf',
    audience_segment: 'Running / Lifestyle Category Top Sellers',
    bidding_strategy: 'Dynamic Bids - Up & Down',
    budget_weight: 1.25,
    cvr_mult: 1.05,
    cpm_mult: 1.1,
    ctr_mult: 1.05,
    yield_mult: 1.02,
    confidence: 0.84,
    desc: 'Positions product banner atop category search results to capture competitor defectors.',
    creative_format: 'Static Image Carousel',
    placement: 'Feed Only',
    audience_type: 'broad'
  },
  {
    config_id: 'cfg-tiktok-spark',
    title: 'TikTok Spark Ads (Creator Sneaker UGC)',
    platform: 'tiktok',
    objective: 'Traffic & Fast Checkout',
    audience_segment: 'Sneakerhead Community & Viral Fit Trends (Ages 18-34)',
    bidding_strategy: 'Lowest Cost / Max Delivery',
    budget_weight: 0.9,
    cvr_mult: 0.88,
    cpm_mult: 0.75,
    ctr_mult: 1.4,
    yield_mult: 0.98,
    confidence: 0.82,
    desc: 'Boosts organic TikTok influencer unboxings and styling clips into native in-feed shopping.',
    creative_format: 'Spark Native Video',
    placement: 'Reels / Shorts',
    audience_type: 'broad'
  },
  {
    config_id: 'cfg-tiktok-interest',
    title: 'TikTok Shop In-Feed Conversion Campaign',
    platform: 'tiktok',
    objective: 'Complete Payment',
    audience_segment: 'Fitness Enthusiasts & Streetwear Aesthetic',
    bidding_strategy: 'Target Cost / CPA',
    budget_weight: 1.0,
    cvr_mult: 0.92,
    cpm_mult: 0.8,
    ctr_mult: 1.2,
    yield_mult: 0.96,
    confidence: 0.8,
    desc: 'Direct video ad with embedded 1-tap checkout badge driving instant cart conversions.',
    creative_format: 'UGC Video',
    placement: 'Feed Only',
    audience_type: 'lookalike'
  },
  {
    config_id: 'cfg-meta-advantage-broad',
    title: 'Meta Advantage+ Broad Audience Exploration',
    platform: 'meta',
    objective: 'Store Purchases',
    audience_segment: 'Unrestricted Demographics (AI Conversion Signal Optimization)',
    bidding_strategy: 'Lowest Cost with Bid Cap',
    budget_weight: 1.45,
    cvr_mult: 1.0,
    cpm_mult: 0.9,
    ctr_mult: 1.0,
    yield_mult: 1.03,
    confidence: 0.86,
    desc: 'Gives Meta algorithm maximum creative freedom to locate incremental buyers across Instagram & Facebook.',
    creative_format: 'UGC Video',
    placement: 'Auto / Advantage+',
    audience_type: 'broad'
  },
  {
    config_id: 'cfg-google-shopping-standard',
    title: 'Google Standard Shopping High-Priority Defense',
    platform: 'google',
    objective: 'Sales & Inventory Clearance',
    audience_segment: 'Shopping Feed Queries (Specific Model & Colorways)',
    bidding_strategy: 'Maximize Clicks with CPC Limit',
    budget_weight: 0.7,
    cvr_mult: 1.2,
    cpm_mult: 0.95,
    ctr_mult: 1.15,
    yield_mult: 1.07,
    confidence: 0.87,
    desc: 'Granular product feed bid controls ensuring low-cost clicks on exact shoe variants.',
    creative_format: 'Product Feed Showcase',
    placement: 'Search / Grid',
    audience_type: 'search'
  }
];

export function getPlaygroundProducts(): PlaygroundProductSummary[] {
  const campaigns = initialEngineState.campaigns || [];
  const map = new Map<string, PlaygroundProductSummary>();

  for (const c of campaigns) {
    if (!map.has(c.sku)) {
      map.set(c.sku, {
        sku: c.sku,
        name: c.productName || c.sku,
        category: c.category || 'Footwear',
        price: Number(c.price) || 160,
        rating: Number(c.rating) || 4.5,
        reviews: Number(c.reviews) || 50,
        photoUrl: c.photoUrl || '',
        inventory: Number(c.inventory) ?? 0,
        hasHistoricalData: true,
        historicalRoas: Number(c.roas) || 3.0,
        grossMarginPct: Number(c.marginPct) > 0 ? Number(c.marginPct) : 62
      });
    }
  }

  // Ensure canonical shoes exist with rich data
  if (!map.has('315122-001')) {
    map.set('315122-001', {
      sku: '315122-001',
      name: "Nike Air Force 1 '07",
      category: 'Footwear',
      price: 193,
      rating: 4.8,
      reviews: 1420,
      photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/oplkqwyf7nwnj98f8agj/air-force-1-07-shoe-PATZxx4V.jpg',
      inventory: 93,
      hasHistoricalData: true,
      historicalRoas: 3.4,
      grossMarginPct: 64
    });
  }

  return Array.from(map.values());
}

/**
 * Evaluates the non-linear Hill response function:
 * Revenue(s) = (a * s^b) / (c + s^b)
 */
function hillRevenue(
  spend: number,
  a: number,
  b: number,
  c: number
): number {
  if (spend <= 0) return 0;
  const sb = Math.pow(spend, b);
  return (a * sb) / (c + sb);
}

/**
 * Evaluates marginal yield dRevenue / dSpend:
 * dR/ds = (a * b * c * s^(b-1)) / (c + s^b)^2
 */
function hillMarginalYield(
  spend: number,
  a: number,
  b: number,
  c: number
): number {
  if (spend <= 0.01) return 0;
  const sb = Math.pow(spend, b);
  const denom = Math.pow(c + sb, 2);
  const num = a * b * c * Math.pow(spend, b - 1);
  return denom > 0 ? num / denom : 0;
}

export function computePlaygroundRecommendations(
  params: AdPlaygroundConstraints
): AdPlaygroundResult {
  const products = getPlaygroundProducts();
  const product = products.find((p) => p.sku === params.sku) || products[0] || {
    sku: params.sku,
    name: `Product ${params.sku}`,
    category: 'Footwear',
    price: 180,
    rating: 4.5,
    reviews: 50,
    photoUrl: '',
    inventory: 93,
    hasHistoricalData: false,
    historicalRoas: 3.0,
    grossMarginPct: 62
  };

  const durationDays = params.duration_days > 0 ? params.duration_days : 7;
  const targetRoasFloor = params.target_roas_floor > 0 ? params.target_roas_floor : 1.8;
  const grossMarginRatio = (product.grossMarginPct || 62) / 100;

  // Determine daily budget: direct parameter takes precedence over total_budget
  let dailyBudget = params.daily_budget && params.daily_budget > 0
    ? params.daily_budget
    : params.total_budget && params.total_budget > 0
      ? Math.round(params.total_budget / durationDays)
      : 2000;

  dailyBudget = Math.max(100, Math.min(25000, dailyBudget));
  const totalBudget = dailyBudget * durationDays;

  // 1. Parameter modifiers from selected UI dimensions
  let audienceFactor = 1.0;
  if (params.audience === 'retargeting') audienceFactor = 1.35;
  else if (params.audience === 'lookalike') audienceFactor = 1.15;
  else if (params.audience === 'search') audienceFactor = 1.25;
  else audienceFactor = 1.0; // broad

  let creativeFactor = 1.0;
  if (params.creative === 'ugc_video') creativeFactor = 1.22;
  else if (params.creative === 'spark_video') creativeFactor = 1.18;
  else if (params.creative === 'product_feed') creativeFactor = 1.12;
  else creativeFactor = 1.0; // static_image

  let placementFactor = 1.0;
  if (params.placement === 'auto') placementFactor = 1.12;
  else if (params.placement === 'reels') placementFactor = 1.08;
  else if (params.placement === 'search') placementFactor = 1.15;
  else placementFactor = 1.0; // feed

  const combinedStrategyFactor = audienceFactor * creativeFactor * placementFactor;

  // 2. Calibrate Hill Parameters for this product
  // a (capacity ceiling in daily revenue): 4.5x - 7.5x product scale
  const capacityA = product.price * 65 * combinedStrategyFactor;
  // b (elasticity): realistic diminishing returns curvature 1.4 - 1.8
  const elasticityB = 1.62;
  // c (half saturation spend): spend level where 50% capacity is reached
  const halfSaturationC = Math.pow(2400, elasticityB);

  // 3. Compute continuous Hill response curve points (0 to 3x budget range)
  const maxCurveSpend = Math.max(6000, dailyBudget * 2.2);
  const steps = 30;
  const stepSize = maxCurveSpend / steps;
  const curvePoints: ResponseCurvePoint[] = [];

  let optimalSpend = dailyBudget;
  let maxProfitEncountered = -Infinity;
  let saturationSpend = maxCurveSpend * 0.75;

  for (let i = 0; i <= steps; i++) {
    const s = Math.round(i * stepSize);
    const rev = Math.round(hillRevenue(s, capacityA, elasticityB, halfSaturationC));
    const grossMargin = rev * grossMarginRatio;
    const netProfit = Math.round(grossMargin - s);
    const roas = s > 0 ? +(rev / s).toFixed(2) : 0;
    const marginalYield = +(hillMarginalYield(s, capacityA, elasticityB, halfSaturationC) * grossMarginRatio).toFixed(2);

    if (netProfit > maxProfitEncountered) {
      maxProfitEncountered = netProfit;
      optimalSpend = s;
    }

    if (marginalYield < 1.05 && saturationSpend === maxCurveSpend * 0.75 && s > 1500) {
      saturationSpend = s;
    }

    curvePoints.push({
      spend: s,
      revenue: rev,
      profit: netProfit,
      roas,
      marginalYield,
      isCurrent: false,
      isOptimal: false,
      isSaturation: false
    });
  }

  // Tag points closest to operating point, optimal, and saturation
  let closestCurrentIdx = 0;
  let minDiffCurrent = Infinity;
  let closestOptimalIdx = 0;
  let minDiffOptimal = Infinity;

  curvePoints.forEach((pt, idx) => {
    const diffCur = Math.abs(pt.spend - dailyBudget);
    if (diffCur < minDiffCurrent) {
      minDiffCurrent = diffCur;
      closestCurrentIdx = idx;
    }
    const diffOpt = Math.abs(pt.spend - optimalSpend);
    if (diffOpt < minDiffOptimal) {
      minDiffOptimal = diffOpt;
      closestOptimalIdx = idx;
    }
  });

  if (curvePoints[closestCurrentIdx]) curvePoints[closestCurrentIdx].isCurrent = true;
  if (curvePoints[closestOptimalIdx]) curvePoints[closestOptimalIdx].isOptimal = true;

  // 4. Evaluate 10 Candidate Configurations
  let archetypes = ARCHETYPES;
  if (params.platforms && params.platforms.length > 0) {
    const allowed = new Set(params.platforms.map((p) => p.toLowerCase()));
    archetypes = archetypes.filter((a) => allowed.has(a.platform));
  }

  const isMissingInventory = product.inventory == null || isNaN(product.inventory);
  const isStockout = isMissingInventory || product.inventory <= 0;
  const candidates: CandidateAdConfig[] = [];

  for (const arch of archetypes) {
    let strategyMultiplier = 1.0;
    if (params.strategy_focus === 'SCALE_VOLUME') {
      strategyMultiplier = 1.25;
    } else if (params.strategy_focus === 'BALANCED') {
      strategyMultiplier = 1.05;
    }

    // Align with active user parameters if matching archetype
    let userModifier = 1.0;
    if (params.audience && arch.audience_type === params.audience) userModifier *= 1.1;
    if (params.creative && arch.creative_format?.toLowerCase().includes(params.creative.replace('_', ' '))) userModifier *= 1.12;

    const candDailyBudget = Math.round(dailyBudget * arch.budget_weight * strategyMultiplier * 100) / 100;
    const candSpend = Math.round(candDailyBudget * durationDays * 100) / 100;

    // Daily revenue through calibrated Hill function
    const baseDailyRev = hillRevenue(candDailyBudget, capacityA, elasticityB, halfSaturationC);
    let candRevenue = Math.round(baseDailyRev * arch.yield_mult * userModifier * durationDays * 100) / 100;
    let candConversions = Math.max(1, Math.round(candRevenue / Math.max(product.price, 1)));

    let stockoutRisk = false;
    let candGrossMargin = Math.round(candRevenue * grossMarginRatio * 100) / 100;
    let candNetProfit = Math.round((candGrossMargin - candSpend) * 100) / 100;
    let candRoas = Math.round((candRevenue / Math.max(candSpend, 1)) * 100) / 100;

    // Realistic Stockout & Inventory Guardrail
    if (isStockout) {
      stockoutRisk = true;
      candNetProfit = -candSpend;
      candRoas = 0;
      candRevenue = 0;
      candGrossMargin = 0;
      candConversions = 0;
    } else if (candConversions > product.inventory) {
      stockoutRisk = true;
      // Realizable sales strictly capped by inventory stock
      const realizableRev = product.inventory * product.price;
      candRevenue = Math.round(realizableRev * 100) / 100;
      candGrossMargin = Math.round(candRevenue * grossMarginRatio * 100) / 100;
      candNetProfit = Math.round((candGrossMargin - candSpend) * 100) / 100;
      candRoas = Math.round((candRevenue / Math.max(candSpend, 1)) * 100) / 100;
      candConversions = product.inventory;
    }

    const candCpm = Math.round(12.5 * arch.cpm_mult * 100) / 100;
    const candImpressions = Math.max(1, Math.round((candSpend / Math.max(candCpm, 0.5)) * 1000));
    const candCtr = 0.024 * arch.ctr_mult;
    const candClicks = Math.max(1, Math.round(candImpressions * candCtr));
    const candCpc = Math.round((candSpend / Math.max(candClicks, 1)) * 100) / 100;
    const candCvr = Math.round((candConversions / Math.max(candClicks, 1)) * 10000) / 100;

    const keyDrivers: string[] = [];
    if (arch.cvr_mult > 1.2) {
      keyDrivers.push(`Conversion yield +${Math.round((arch.cvr_mult - 1) * 100)}% via high-intent targeting`);
    }
    if (arch.cpm_mult < 0.95) {
      keyDrivers.push(`Favorable auction pricing (-${Math.round((1 - arch.cpm_mult) * 100)}% CPM discount)`);
    }
    if (candRoas >= targetRoasFloor) {
      keyDrivers.push(`Surpasses ROAS target (${candRoas.toFixed(2)}x vs ${targetRoasFloor.toFixed(1)}x)`);
    }
    if (!stockoutRisk && product.inventory > candConversions) {
      keyDrivers.push(`Sufficient warehouse inventory (${product.inventory} units available)`);
    }

    let explanation = `${arch.desc} Delivers ₹${candNetProfit.toLocaleString()} expected profit at ₹${candDailyBudget.toLocaleString()}/day over ${durationDays} days.`;
    if (isStockout) {
      explanation = 'CRITICAL STOCKOUT: Zero warehouse stock remaining. Advertising spend will deplete capital with zero fulfillment.';
    } else if (stockoutRisk && candNetProfit < 0) {
      explanation = `INVENTORY CONSTRAINT: Campaign demand (${candConversions} pairs) exhausts warehouse stock (${product.inventory} pairs), causing unfulfilled ad spend.`;
    }

    candidates.push({
      rank: 0,
      config_id: arch.config_id,
      title: arch.title,
      platform: arch.platform,
      objective: arch.objective,
      audience_segment: arch.audience_segment,
      bidding_strategy: arch.bidding_strategy,
      daily_budget: candDailyBudget,
      duration_days: durationDays,
      expected_spend: candSpend,
      predicted_impressions: candImpressions,
      predicted_clicks: candClicks,
      predicted_cpc: candCpc,
      predicted_cpm: candCpm,
      predicted_conversions: candConversions,
      predicted_cvr: candCvr,
      predicted_revenue: candRevenue,
      predicted_gross_margin: candGrossMargin,
      predicted_net_profit: candNetProfit,
      predicted_roas: candRoas,
      confidence_score: arch.confidence,
      is_recommended: false,
      stockout_risk: stockoutRisk,
      explanation,
      key_drivers: keyDrivers,
      creative_format: arch.creative_format,
      placement: arch.placement,
      audience_type: arch.audience_type
    });
  }

  // 5. Rank strictly by expected net profit descending
  candidates.sort((a, b) => b.predicted_net_profit - a.predicted_net_profit);

  candidates.forEach((c, idx) => {
    c.rank = idx + 1;
    if (idx === 0) {
      c.is_recommended = c.predicted_net_profit > 0 && !isStockout;
    }
  });

  const bestCandidate = candidates[0];
  const isProfitable = Boolean(bestCandidate && bestCandidate.predicted_net_profit > 0 && !isStockout);

  let profitabilityStatus: 'PROFITABLE' | 'UNPROFITABLE_INVENTORY_STOCKOUT' | 'UNPROFITABLE_OVERSPENDING' | 'UNPROFITABLE_LOW_ROAS' = 'PROFITABLE';
  let recommendedAction: 'SCALE' | 'MAINTAIN' | 'REDUCE_SPEND' | 'PAUSE_STOCKOUT' = 'MAINTAIN';

  if (isStockout) {
    profitabilityStatus = 'UNPROFITABLE_INVENTORY_STOCKOUT';
    recommendedAction = 'PAUSE_STOCKOUT';
  } else if (!isProfitable) {
    profitabilityStatus = bestCandidate && bestCandidate.stockout_risk
      ? 'UNPROFITABLE_OVERSPENDING'
      : 'UNPROFITABLE_LOW_ROAS';
    recommendedAction = 'REDUCE_SPEND';
  } else if (dailyBudget < optimalSpend * 0.75) {
    recommendedAction = 'SCALE';
  } else if (dailyBudget > saturationSpend) {
    recommendedAction = 'REDUCE_SPEND';
  }

  // 6. Concise "Why this campaign?" bullet reasons
  const whyReasons: string[] = [];
  if (isStockout) {
    whyReasons.push('Warehouse stock depleted (0 units available)');
    whyReasons.push('Pausing spend prevents guaranteed margin destruction');
    whyReasons.push('Restock before deploying acquisition capital');
  } else if (!isProfitable) {
    whyReasons.push('Current budget over-saturates unit economic margin');
    whyReasons.push('Reduce spend to lower acquisition cost below gross profit');
    whyReasons.push('Reallocate capital to higher marginal yield SKUs');
  } else {
    whyReasons.push('Highest expected marginal profit across all 10 candidates');
    whyReasons.push(`Warehouse stock healthy (${product.inventory} units available to fulfill demand)`);
    if (dailyBudget <= saturationSpend) {
      whyReasons.push('Operating comfortably below diminishing returns saturation threshold');
    } else {
      whyReasons.push('Captures maximum viable volume within acceptable ROAS floor');
    }
  }

  const histSpend = 1200;
  const histRoas = product.historicalRoas || 3.0;
  const baselineProfit = (histSpend * durationDays * histRoas * grossMarginRatio) - (histSpend * durationDays);
  const bestProfit = bestCandidate ? bestCandidate.predicted_net_profit : 0;
  const profitLift = Math.round((bestProfit - baselineProfit) * 100) / 100;

  return {
    sku: product.sku,
    product_name: product.name,
    category: product.category,
    price: product.price,
    gross_margin_pct: product.grossMarginPct,
    inventory: product.inventory,
    photo_url: product.photoUrl,
    total_budget_constraint: totalBudget,
    daily_budget: dailyBudget,
    duration_days: durationDays,
    candidates,
    baseline_historical_roas: histRoas,
    baseline_historical_daily_spend: histSpend,
    best_config_id: bestCandidate?.config_id || '',
    profit_lift_over_baseline: profitLift,
    data_quality_warning: isStockout
      ? 'CRITICAL: Product currently has 0 inventory in warehouse stock. Do not launch campaigns.'
      : undefined,
    curve_points: curvePoints,
    optimal_daily_spend: optimalSpend,
    saturation_daily_spend: saturationSpend,
    marginal_profit_at_operating_point: +(hillMarginalYield(dailyBudget, capacityA, elasticityB, halfSaturationC) * grossMarginRatio - 1).toFixed(2),
    is_profitable: isProfitable,
    profitability_status: profitabilityStatus,
    recommended_action: recommendedAction,
    why_this_campaign: whyReasons,
    hill_parameters: {
      capacity_a: Math.round(capacityA),
      elasticity_b: elasticityB,
      half_saturation_c: Math.round(halfSaturationC)
    }
  };
}
