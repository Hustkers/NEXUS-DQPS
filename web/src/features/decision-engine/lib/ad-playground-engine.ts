import type {
  AdPlaygroundConstraints,
  AdPlaygroundResult,
  CandidateAdConfig,
  PlaygroundProductSummary
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
    desc: 'Focuses spend on bottom-funnel shoppers with demonstrated high purchase intent.'
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
    desc: 'Scales acquisition against lookalike clusters resembling high-margin footwear collectors.'
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
    desc: 'Leverages Google Smart Bidding across Shopping, Search, YouTube, and Maps.'
  },
  {
    config_id: 'cfg-google-brand-sku',
    title: 'Google Search Exact SKU & Brand Match',
    platform: 'google',
    objective: 'Purchase / High Intent',
    audience_segment: "Exact Search Queries (e.g., 'Nike Air Max Buy')",
    bidding_strategy: 'Target CPA ($35 Ceiling)',
    budget_weight: 0.8,
    cvr_mult: 1.55,
    cpm_mult: 1.4,
    ctr_mult: 1.5,
    yield_mult: 1.2,
    confidence: 0.93,
    desc: 'Defends high-margin branded search traffic with precise keyword intent.'
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
    desc: 'Converts ready-to-buy Amazon Prime members directly on product listings.'
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
    desc: 'Positions product banner atop category search results to capture competitor defectors.'
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
    desc: 'Boosts organic TikTok influencer unboxings and styling clips into native in-feed shopping.'
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
    desc: 'Direct video ad with embedded 1-tap checkout badge driving instant cart conversions.'
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
    desc: 'Gives Meta algorithm maximum creative freedom to locate incremental buyers across Instagram & Facebook.'
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
    desc: 'Granular product feed bid controls ensuring low-cost clicks on exact shoe variants.'
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
        price: Number(c.price) || 140,
        rating: Number(c.rating) || 4.5,
        reviews: Number(c.reviews) || 50,
        photoUrl: c.photoUrl || '',
        inventory: Number(c.inventory) || 0,
        hasHistoricalData: true,
        historicalRoas: Number(c.roas) || 3.0,
        grossMarginPct: Number(c.marginPct) > 0 ? Number(c.marginPct) : 62
      });
    }
  }

  return Array.from(map.values());
}

export function computePlaygroundRecommendations(
  params: AdPlaygroundConstraints
): AdPlaygroundResult {
  const products = getPlaygroundProducts();
  const product = products.find((p) => p.sku === params.sku) || products[0] || {
    sku: params.sku,
    name: `Product ${params.sku}`,
    category: 'Footwear',
    price: 135,
    rating: 4.5,
    reviews: 50,
    photoUrl: '',
    inventory: 400,
    hasHistoricalData: false,
    historicalRoas: 2.8,
    grossMarginPct: 62
  };

  const totalBudget = params.total_budget > 0 ? params.total_budget : 5000;
  const durationDays = params.duration_days > 0 ? params.duration_days : 14;
  const targetRoasFloor = params.target_roas_floor > 0 ? params.target_roas_floor : 1.8;
  const grossMarginRatio = (product.grossMarginPct || 62) / 100;
  const dailyBudgetRef = totalBudget / durationDays;

  // Curvature parameters per channel
  const channelParams: Record<string, { k: number; b: number; cpm: number; cvr: number }> = {
    meta: { k: product.price * 2.8, b: 0.77, cpm: 9.8, cvr: 0.029 },
    google: { k: product.price * 3.4, b: 0.75, cpm: 13.5, cvr: 0.039 },
    amazon: { k: product.price * 3.1, b: 0.79, cpm: 11.0, cvr: 0.044 },
    tiktok: { k: product.price * 2.4, b: 0.81, cpm: 6.9, cvr: 0.021 }
  };

  let archetypes = ARCHETYPES;
  if (params.platforms && params.platforms.length > 0) {
    const allowed = new Set(params.platforms.map((p) => p.toLowerCase()));
    archetypes = archetypes.filter((a) => allowed.has(a.platform));
  }

  const candidates: CandidateAdConfig[] = [];

  for (const arch of archetypes) {
    const cp = channelParams[arch.platform] || channelParams.meta;

    let strategyMultiplier = 1.0;
    if (params.strategy_focus === 'SCALE_VOLUME') {
      strategyMultiplier = 1.25;
    } else if (params.strategy_focus === 'BALANCED') {
      strategyMultiplier = 1.05;
    }

    const candDailyBudget = Math.round(dailyBudgetRef * arch.budget_weight * strategyMultiplier * 100) / 100;
    const candSpend = Math.round(candDailyBudget * durationDays * 100) / 100;

    // Response saturation curve: r(s) = k * s^b
    const dailyBaseRev = cp.k * Math.pow(candDailyBudget, cp.b);
    let candRevenue = Math.round(dailyBaseRev * arch.yield_mult * durationDays * 100) / 100;
    let candGrossMargin = Math.round(candRevenue * grossMarginRatio * 100) / 100;
    let candNetProfit = Math.round((candGrossMargin - candSpend) * 100) / 100;
    let candRoas = Math.round((candRevenue / Math.max(candSpend, 1)) * 100) / 100;

    // Delivery stats
    const candCpm = Math.round(cp.cpm * arch.cpm_mult * 100) / 100;
    const candImpressions = Math.max(1, Math.round((candSpend / Math.max(candCpm, 0.5)) * 1000));
    const candCtr = 0.022 * arch.ctr_mult;
    const candClicks = Math.max(1, Math.round(candImpressions * candCtr));
    const candCpc = Math.round((candSpend / Math.max(candClicks, 1)) * 100) / 100;

    let candConversions = Math.max(1, Math.round(candRevenue / Math.max(product.price, 1)));
    const candCvr = Math.round((candConversions / Math.max(candClicks, 1)) * 10000) / 100;

    // Stockout constraints
    let stockoutRisk = false;
    if (product.inventory <= 0) {
      stockoutRisk = true;
      candNetProfit = -candSpend;
      candRoas = 0;
    } else if (candConversions > product.inventory) {
      stockoutRisk = true;
      const realizableUnits = product.inventory;
      candRevenue = Math.round(realizableUnits * product.price * 100) / 100;
      candGrossMargin = Math.round(candRevenue * grossMarginRatio * 100) / 100;
      candNetProfit = Math.round((candGrossMargin - candSpend) * 100) / 100;
      candRoas = Math.round((candRevenue / Math.max(candSpend, 1)) * 100) / 100;
      candConversions = realizableUnits;
    }

    const keyDrivers: string[] = [];
    if (arch.cvr_mult > 1.2) {
      keyDrivers.push(`Elevated conversion rate (+${Math.round((arch.cvr_mult - 1) * 100)}% vs channel baseline)`);
    }
    if (arch.cpm_mult < 0.95) {
      keyDrivers.push(`Favorable auction CPM (-${Math.round((1 - arch.cpm_mult) * 100)}% delivery discount)`);
    }
    if (candRoas >= targetRoasFloor) {
      keyDrivers.push(`Comfortably beats ROAS floor (${candRoas.toFixed(2)}x vs ${targetRoasFloor.toFixed(1)}x)`);
    }
    if (cp.b > 0.78) {
      keyDrivers.push(`Low diminishing returns curvature (b=${cp.b.toFixed(2)}), high capital absorption capacity`);
    }
    if (stockoutRisk) {
      keyDrivers.push(`WARNING: Demand (${candConversions} pairs) exceeds available warehouse stock (${product.inventory} units)`);
    }

    let explanation = `${arch.desc} Anticipates $${candNetProfit.toLocaleString()} net profit (${candRoas.toFixed(2)}x ROAS) at $${candDailyBudget.toFixed(0)}/day spend over ${durationDays} days.`;
    if (stockoutRisk && product.inventory <= 0) {
      explanation = 'CRITICAL STOCKOUT: Zero warehouse stock remaining. Spend will deplete margin without fulfilling orders.';
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
      key_drivers: keyDrivers
    });
  }

  // Rank strictly by expected net profit descending
  candidates.sort((a, b) => b.predicted_net_profit - a.predicted_net_profit);

  candidates.forEach((c, idx) => {
    c.rank = idx + 1;
    if (idx === 0) {
      c.is_recommended = true;
    }
  });

  const bestId = candidates[0]?.config_id || '';
  const histSpend = 1200;
  const histRoas = product.historicalRoas || 2.8;
  const baselineProfit = (histSpend * durationDays * histRoas * grossMarginRatio) - (histSpend * durationDays);
  const bestProfit = candidates[0]?.predicted_net_profit || 0;
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
    duration_days: durationDays,
    candidates,
    baseline_historical_roas: histRoas,
    baseline_historical_daily_spend: histSpend,
    best_config_id: bestId,
    profit_lift_over_baseline: profitLift,
    data_quality_warning: product.inventory <= 0 ? 'Product currently has 0 inventory in warehouse stock.' : undefined
  };
}
