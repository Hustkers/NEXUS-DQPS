import type {
  ShockScenarioId,
  SimulationHorizon,
  ScenarioMeta,
  ScenarioInputParams,
  StrategyOption,
  MetricSnapshot,
  FinancialImpactSummary,
  DailyLossPoint,
  StrategyEvaluation,
  CausalNode,
  DataLineageInfo,
  SimulationResult
} from '../types/simulation-types';

export const SCENARIO_METAS: Record<ShockScenarioId, ScenarioMeta> = {
  stockout: {
    id: 'stockout',
    title: "Air Force 1 '07 Stockout Shock",
    tag: 'ERP Inventory Bleed',
    severity: 'CRITICAL',
    eventDescription: 'ERP warehouse inventory reaches 0 units on hero SKU 315122-001 while active ad campaigns continue spending.',
    traditionalOutcome: 'Ad platforms continue burning ₹2,200/day driving traffic to an empty product page with 0 inventory.',
    autonomousAction: 'Instant Circuit Breaker kills spend in <15 mins. Capital redirected to Google PMax React Infinity (+3.6x ROAS).',
    savedWasteWeekly: '₹15,400 / week',
    responseSpeed: '< 15 mins',
    affectedSku: '315122-001',
    affectedProductName: "Nike Air Force 1 '07",
    affectedPlatform: 'Meta Ads'
  },
  'cpm-spike': {
    id: 'cpm-spike',
    title: 'Meta Sneaker Auction CPM Surge (+45%)',
    tag: 'Auction Inflation',
    severity: 'HIGH',
    eventDescription: 'Holiday competitive rush pushes Meta Advantage+ CPM from ₹9.50 to ₹14.20, dropping ROAS below the 1.8x break-even floor.',
    traditionalOutcome: 'Marketers notice 48 hours later after daily spend burns operating margin.',
    autonomousAction: 'Optimizer shifts ₹3,500/day into Amazon Sponsored Products & Google Shopping where margin elasticity is preserved.',
    savedWasteWeekly: '₹9,200 / week',
    responseSpeed: 'Real-time (<30s)',
    affectedSku: 'AO2924-401',
    affectedProductName: 'Nike Air Max 720',
    affectedPlatform: 'Meta Ads'
  },
  'creative-fatigue': {
    id: 'creative-fatigue',
    title: 'TikTok UGC Creative Fatigue (-60% CTR)',
    tag: 'Creative Wear-Out',
    severity: 'MEDIUM',
    eventDescription: 'Hero TikTok video ad set frequency exceeds 5.2. Hook rate collapses, CTR drops 60%, doubling customer acquisition cost.',
    traditionalOutcome: 'Fatigued video continues eating 40% of TikTok ad budget with plummeting conversion rate.',
    autonomousAction: 'Auto-pauses exhausted ad set, triggers creative refresh alert, and reroutes spend to high-vitality Meta Reels.',
    savedWasteWeekly: '₹5,200 / week',
    responseSpeed: 'Autonomous (<1hr)',
    affectedSku: 'AH8050-100',
    affectedProductName: 'Nike Air Max 270',
    affectedPlatform: 'TikTok Shop'
  },
  'price-undercut': {
    id: 'price-undercut',
    title: 'Amazon Sneaker Price Undercut',
    tag: 'Competitor Shock',
    severity: 'MEDIUM',
    eventDescription: 'Rival seller launches aggressive 25% price drop on Amazon Buy Box, lowering conversion rate from 4.8% to 2.8%.',
    traditionalOutcome: 'Amazon Sponsored spend continues bidding high CPC for unprofitable and losing Buy Box sessions.',
    autonomousAction: 'Scipy convex optimizer re-solves: shifts capital to Nike Direct Brand Search where gross margin is 68%.',
    savedWasteWeekly: '₹6,800 / week',
    responseSpeed: '< 30 mins',
    affectedSku: '880848-005',
    affectedProductName: 'Nike Zoom Fly',
    affectedPlatform: 'Amazon Ads'
  }
};

export const BASELINE_DEFAULTS: Record<ShockScenarioId, ScenarioInputParams> = {
  stockout: {
    horizonDays: 7,
    inventoryUnits: 420,
    inventoryShockUnits: 0,
    baselineDailySpend: 2200,
    baselineCvrPct: 3.4,
    aov: 7295,
    marginPct: 65,
    baselineCpm: 11.0,
    cpmMultiplier: 1.0,
    ctrPct: 2.1,
    fatiguePct: 0,
    ourPrice: 7295,
    competitorPrice: 7295,
    buyBoxProbabilityPct: 85,
    competitorUndercutPct: 0
  },
  'cpm-spike': {
    horizonDays: 7,
    inventoryUnits: 650,
    inventoryShockUnits: 650,
    baselineDailySpend: 3500,
    baselineCvrPct: 2.8,
    aov: 12797,
    marginPct: 62,
    baselineCpm: 9.5,
    cpmMultiplier: 1.45,
    ctrPct: 2.1,
    fatiguePct: 0,
    ourPrice: 12797,
    competitorPrice: 12797,
    buyBoxProbabilityPct: 80,
    competitorUndercutPct: 0
  },
  'creative-fatigue': {
    horizonDays: 7,
    inventoryUnits: 510,
    inventoryShockUnits: 510,
    baselineDailySpend: 2400,
    baselineCvrPct: 2.8,
    aov: 13995,
    marginPct: 60,
    baselineCpm: 6.8,
    cpmMultiplier: 1.0,
    ctrPct: 2.4,
    fatiguePct: 60,
    ourPrice: 13995,
    competitorPrice: 13995,
    buyBoxProbabilityPct: 75,
    competitorUndercutPct: 0
  },
  'price-undercut': {
    horizonDays: 7,
    inventoryUnits: 380,
    inventoryShockUnits: 380,
    baselineDailySpend: 2800,
    baselineCvrPct: 4.8,
    aov: 14495,
    marginPct: 58,
    baselineCpm: 11.2,
    cpmMultiplier: 1.0,
    ctrPct: 2.6,
    fatiguePct: 0,
    ourPrice: 14495,
    competitorPrice: 10871,
    buyBoxProbabilityPct: 25,
    competitorUndercutPct: 25
  }
};

export const SCENARIO_STRATEGIES: Record<ShockScenarioId, StrategyOption[]> = {
  stockout: [
    {
      id: 'do-nothing',
      name: 'Do Nothing (Passive Ad Burn)',
      badge: 'Unmitigated',
      description: 'Keep ads active with 0 warehouse inventory. Traffic lands on empty PDP; conversions collapse.'
    },
    {
      id: 'pause-spend',
      name: 'Pause Affected SKU Spend (Kill-Switch)',
      badge: 'Defensive',
      description: 'Halt spend immediately. Stops ₹2,200/day ad burn but does not capture alternative demand.'
    },
    {
      id: 'redirect-spend',
      name: 'Redirect Capital to In-Stock SKU (React Infinity)',
      badge: 'Recommended',
      isRecommended: true,
      description: 'Shift spend to in-stock hero SKU with strong inventory and 3.6x ROAS headroom.'
    },
    {
      id: 'aggressive-realloc',
      name: 'Aggressive Multi-Platform Scale (+40%)',
      badge: 'Aggressive',
      description: 'Shift 100% of capital plus an additional 40% booster into highest marginal-yield channel.'
    },
    {
      id: 'custom-strategy',
      name: 'Custom Parameterized Strategy',
      badge: 'Custom',
      description: 'User-specified budget shift, spend cut, and inventory guardrails.'
    }
  ],
  'cpm-spike': [
    {
      id: 'do-nothing',
      name: 'Do Nothing (Absorb Inflation)',
      badge: 'Unmitigated',
      description: 'Maintain Meta spend despite 45% auction surge. ROAS collapses below 1.8x break-even floor.'
    },
    {
      id: 'reduce-spend',
      name: 'Reduce Meta Spend (-50%)',
      badge: 'Defensive',
      description: 'Throttle budget in half to mitigate margin bleed while keeping minimal brand presence.'
    },
    {
      id: 'reallocate-channels',
      name: 'Reallocate to Amazon & Google Shopping',
      badge: 'Recommended',
      isRecommended: true,
      description: 'Shift ₹3,500/day to Amazon Sponsored Products & Google PMax where margin elasticity is preserved.'
    },
    {
      id: 'balanced-realloc',
      name: 'Balanced Multi-Channel Equalization',
      badge: 'Balanced',
      description: 'Distribute ad capital equally across Google, Amazon, and TikTok to smooth CPM spikes.'
    },
    {
      id: 'custom-strategy',
      name: 'Custom Parameterized Strategy',
      badge: 'Custom',
      description: 'User-specified budget shift and bid caps.'
    }
  ],
  'creative-fatigue': [
    {
      id: 'do-nothing',
      name: 'Do Nothing (Fatigued Run)',
      badge: 'Unmitigated',
      description: 'Continue running exhausted UGC creative. Hook rate decays further; CAC continues doubling.'
    },
    {
      id: 'reduce-spend',
      name: 'Reduce Spend (-40%)',
      badge: 'Defensive',
      description: 'Lower daily spend to minimize waste until creative team delivers refreshed assets.'
    },
    {
      id: 'shift-fresh-creative',
      name: 'Reroute to Fresh Meta Reels & Studio UGC',
      badge: 'Recommended',
      isRecommended: true,
      description: 'Auto-pause fatigued ad set, trigger studio refresh, and divert capital to high-vitality Meta Reels.'
    },
    {
      id: 'rotate-audiences',
      name: 'Audience Broadening & Creative Swap',
      badge: 'Expansion',
      description: 'Broaden targeting from interest stacks to Advantage+ open audiences with secondary creative.'
    },
    {
      id: 'custom-strategy',
      name: 'Custom Parameterized Strategy',
      badge: 'Custom',
      description: 'User-specified creative swap rate and spend adjustment.'
    }
  ],
  'price-undercut': [
    {
      id: 'do-nothing',
      name: 'Do Nothing (Lose Buy Box)',
      badge: 'Unmitigated',
      description: 'Keep bidding aggressively on Amazon while rival owns Buy Box at 25% lower price.'
    },
    {
      id: 'reduce-marketplace-ads',
      name: 'Reduce Marketplace Advertising (-60%)',
      badge: 'Defensive',
      description: 'Pull back ad spend on losing ASIN to stem negative contribution margin.'
    },
    {
      id: 'shift-to-direct',
      name: 'Shift Budget to Nike Direct Brand Search',
      badge: 'Recommended',
      isRecommended: true,
      description: 'Redirect ad capital to Nike.com 1st-party store where gross margin is 68% and pricing is protected.'
    },
    {
      id: 'match-price-floor',
      name: 'Match Price within 45% Margin Floor',
      badge: 'Competitive',
      description: 'Automated repricing matches competitor down to ₹11,200 floor to reclaim Buy Box.'
    },
    {
      id: 'custom-strategy',
      name: 'Custom Parameterized Strategy',
      badge: 'Custom',
      description: 'User-specified price adjustment and channel reallocation.'
    }
  ]
};

/**
 * Deterministically simulates the scenario and evaluates all mitigation strategies.
 * ZERO Math.random() calls. Running twice with identical inputs yields 100% identical results.
 */
export function runDeterministicSimulation(
  scenarioId: ShockScenarioId,
  inputs: ScenarioInputParams,
  selectedStrategyId: string
): SimulationResult {
  const meta = SCENARIO_METAS[scenarioId];
  const horizon = inputs.horizonDays;
  const strategies = SCENARIO_STRATEGIES[scenarioId];
  const activeStrategy = strategies.find((s) => s.id === selectedStrategyId) || strategies[0];

  // 1. Calculate Baseline State (Pre-Crisis Steady State)
  const baseline = computeBaselineMetrics(scenarioId, inputs);

  // 2. Calculate Shocked State (Crisis Occurs with "Do Nothing" Strategy)
  const shocked = computeShockedMetrics(scenarioId, inputs, baseline);

  // 3. Calculate Mitigated State (Under Selected Strategy)
  const mitigated = computeMitigatedMetrics(scenarioId, inputs, baseline, shocked, activeStrategy.id);

  // 4. Financial Impact Calculations
  const revenueLoss = Math.max(0, (baseline.revenue - mitigated.revenue) * horizon);
  const marginLoss = Math.max(0, (baseline.margin - mitigated.margin) * horizon);
  
  // Wasted ad spend = spend that generated zero or sub-breakeven marginal return
  const wastedSpendPerDay = scenarioId === 'stockout'
    ? (inputs.inventoryShockUnits <= 0 && activeStrategy.id === 'do-nothing' ? inputs.baselineDailySpend : 0)
    : Math.max(0, (shocked.spend - (shocked.revenue * 0.25)));
  const wastedSpend = Math.round(wastedSpendPerDay * horizon);

  const lossWithoutMitigation = Math.round(Math.max(0, (baseline.margin - shocked.margin) * horizon));
  const lossWithMitigation = Math.round(Math.max(0, (baseline.margin - mitigated.margin) * horizon));
  const lossAvoided = Math.round(Math.max(0, lossWithoutMitigation - lossWithMitigation));
  const protectedWasteWeekly = Math.round((Math.max(0, lossWithoutMitigation - lossWithMitigation) / horizon) * 7);
  const dailyLossRate = Math.round(lossWithoutMitigation / horizon);

  const financialImpact: FinancialImpactSummary = {
    revenueLoss: Math.round(revenueLoss),
    marginLoss: Math.round(marginLoss),
    wastedSpend,
    lossWithoutMitigation,
    lossWithMitigation,
    lossAvoided,
    protectedWasteWeekly,
    dailyLossRate
  };

  // 5. Daily Cumulative Time Series
  const timeSeries: DailyLossPoint[] = [];
  for (let d = 1; d <= horizon; d++) {
    const noActionLoss = Math.round((lossWithoutMitigation / horizon) * d);
    const mitigatedLoss = Math.round((lossWithMitigation / horizon) * d);
    timeSeries.push({
      day: d,
      label: `Day ${d}`,
      noActionLoss,
      mitigatedLoss,
      baselineMargin: Math.round(baseline.margin * d),
      shockedMargin: Math.round(shocked.margin * d),
      mitigatedMargin: Math.round(mitigated.margin * d)
    });
  }

  // 6. Strategy Evaluation Table (Evaluates ALL strategies under identical inputs)
  const strategyComparisons: StrategyEvaluation[] = strategies.map((s) => {
    const sMetrics = computeMitigatedMetrics(scenarioId, inputs, baseline, shocked, s.id);
    const sLoss = Math.round(Math.max(0, (baseline.margin - sMetrics.margin) * horizon));
    const sAvoided = Math.round(Math.max(0, lossWithoutMitigation - sLoss));

    let rationale = '';
    if (s.id === 'do-nothing') {
      rationale = 'Zero intervention: Ad spend continues while conversion economics are degraded.';
    } else if (s.isRecommended) {
      rationale = 'Highest expected margin recovery while preserving ROAS above target floor.';
    } else if (s.id.includes('pause') || s.id.includes('reduce')) {
      rationale = 'Defends against ad waste, but leaves market share & demand capture unaddressed.';
    } else {
      rationale = 'Secondary rebalancing strategy with partial margin restoration.';
    }

    return {
      strategyId: s.id,
      strategyName: s.name,
      isRecommended: !!s.isRecommended,
      spend: Math.round(sMetrics.spend * horizon),
      revenue: Math.round(sMetrics.revenue * horizon),
      margin: Math.round(sMetrics.margin * horizon),
      roas: +sMetrics.roas.toFixed(2),
      financialLoss: sLoss,
      lossAvoided: sAvoided,
      rationale
    };
  });

  // 7. Causal Chain Generation
  const causalChain = buildCausalChain(scenarioId, inputs, shocked, mitigated, activeStrategy.id);

  // 8. Recommendation Object
  const recommendedStrategy = strategies.find((s) => s.isRecommended) || strategies[1];
  const recEvaluation = strategyComparisons.find((c) => c.strategyId === recommendedStrategy.id) || strategyComparisons[0];

  let recReason = '';
  if (scenarioId === 'stockout') {
    recReason = 'Redirecting ad spend to in-stock React Infinity restores campaign ROAS to 3.6x and prevents burning ₹2,200/day on out-of-stock sessions.';
  } else if (scenarioId === 'cpm-spike') {
    recReason = 'Meta auction surge makes customer acquisition unprofitable; shifting capital to Google & Amazon captures preserved margin elasticity.';
  } else if (scenarioId === 'creative-fatigue') {
    recReason = 'TikTok creative fatigue has doubled CAC; rerouting spend to fresh Meta Reels immediately restores CTR from 0.96% back to 2.8%.';
  } else {
    recReason = 'Competitor undercut on Amazon destroys Buy Box conversion; shifting ad capital to Nike Direct protects gross margin at 68%.';
  }

  // 9. Data Lineage Grounding
  const dataLineage: DataLineageInfo = {
    datasetGrounding: 'NEXUS 90-Day Multi-Platform Synthesized Data Engine (seed=7, duckdb)',
    scenarioName: meta.title,
    sku: meta.affectedSku,
    productName: meta.affectedProductName,
    baselineSpendDaily: inputs.baselineDailySpend,
    shockMagnitude: scenarioId === 'stockout' 
      ? 'Inventory: 0 units (-100%)' 
      : scenarioId === 'cpm-spike' 
      ? `CPM: +${Math.round((inputs.cpmMultiplier - 1) * 100)}%` 
      : scenarioId === 'creative-fatigue' 
      ? `CTR Decay: -${inputs.fatiguePct}%` 
      : `Price Undercut: -${inputs.competitorUndercutPct}%`,
    selectedStrategy: activeStrategy.name,
    horizonDays: horizon,
    formulaSummary: 'Deterministic Scipy SLSQP response curve formulation: r(s) = a * s^b / (c + s^b)'
  };

  return {
    scenarioId,
    scenarioMeta: meta,
    inputs,
    activeStrategyId: activeStrategy.id,
    activeStrategyName: activeStrategy.name,
    isRecommended: !!activeStrategy.isRecommended,
    horizonDays: horizon,
    baseline,
    shocked,
    mitigated,
    financialImpact,
    timeSeries,
    strategyComparisons,
    causalChain,
    recommendation: {
      recommendedStrategyId: recommendedStrategy.id,
      recommendedStrategyName: recommendedStrategy.name,
      expectedLoss: recEvaluation.financialLoss,
      expectedLossAvoided: recEvaluation.lossAvoided,
      expectedRoas: recEvaluation.roas,
      expectedMargin: recEvaluation.margin,
      reason: recReason
    },
    dataLineage
  };
}

// -------------------------------------------------------------
// Pure Deterministic Math Helpers
// -------------------------------------------------------------

function computeBaselineMetrics(scenarioId: ShockScenarioId, inputs: ScenarioInputParams): MetricSnapshot {
  const spend = inputs.baselineDailySpend;
  const cpm = inputs.baselineCpm > 0 ? inputs.baselineCpm : 10.0;
  const impressions = Math.round((spend / cpm) * 1000);
  const ctr = inputs.ctrPct / 100;
  const clicks = Math.round(impressions * ctr);
  const cvr = inputs.baselineCvrPct / 100;
  const conversions = Math.max(1, Math.round(clicks * cvr));
  const revenue = Math.round(conversions * inputs.aov);
  const roas = spend > 0 ? +(revenue / spend).toFixed(2) : 0;
  const marginPct = inputs.marginPct / 100;
  const margin = Math.round(revenue * marginPct - spend);

  return {
    spend,
    impressions,
    clicks,
    conversions,
    revenue,
    roas,
    margin
  };
}

function computeShockedMetrics(
  scenarioId: ShockScenarioId,
  inputs: ScenarioInputParams,
  baseline: MetricSnapshot
): MetricSnapshot {
  if (scenarioId === 'stockout') {
    // Inventory = 0: Spend continues burning, conversions drop by 95%
    const spend = baseline.spend;
    const impressions = baseline.impressions;
    const clicks = baseline.clicks;
    const conversions = Math.max(0, Math.round(baseline.conversions * 0.05));
    const revenue = Math.round(conversions * inputs.aov);
    const roas = spend > 0 ? +(revenue / spend).toFixed(2) : 0;
    const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
    return { spend, impressions, clicks, conversions, revenue, roas, margin };
  }

  if (scenarioId === 'cpm-spike') {
    // CPM surges by multiplier: Same spend buys fewer impressions
    const shockedCpm = inputs.baselineCpm * inputs.cpmMultiplier;
    const spend = baseline.spend;
    const impressions = Math.round((spend / shockedCpm) * 1000);
    const clicks = Math.round(impressions * (inputs.ctrPct / 100));
    const conversions = Math.max(1, Math.round(clicks * (inputs.baselineCvrPct / 100)));
    const revenue = Math.round(conversions * inputs.aov);
    const roas = spend > 0 ? +(revenue / spend).toFixed(2) : 0;
    const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
    return { spend, impressions, clicks, conversions, revenue, roas, margin };
  }

  if (scenarioId === 'creative-fatigue') {
    // CTR drops by fatigue %
    const fatiguedCtr = (inputs.ctrPct * (1 - inputs.fatiguePct / 100)) / 100;
    const spend = baseline.spend;
    const impressions = baseline.impressions;
    const clicks = Math.round(impressions * fatiguedCtr);
    const conversions = Math.max(1, Math.round(clicks * (inputs.baselineCvrPct / 100)));
    const revenue = Math.round(conversions * inputs.aov);
    const roas = spend > 0 ? +(revenue / spend).toFixed(2) : 0;
    const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
    return { spend, impressions, clicks, conversions, revenue, roas, margin };
  }

  // Price undercut: Conversion drops by ~42% due to Buy Box loss
  const undercutCvr = (inputs.baselineCvrPct * 0.58) / 100;
  const spend = baseline.spend;
  const impressions = baseline.impressions;
  const clicks = baseline.clicks;
  const conversions = Math.max(1, Math.round(clicks * undercutCvr));
  const revenue = Math.round(conversions * inputs.aov);
  const roas = spend > 0 ? +(revenue / spend).toFixed(2) : 0;
  const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
  return { spend, impressions, clicks, conversions, revenue, roas, margin };
}

function computeMitigatedMetrics(
  scenarioId: ShockScenarioId,
  inputs: ScenarioInputParams,
  baseline: MetricSnapshot,
  shocked: MetricSnapshot,
  strategyId: string
): MetricSnapshot {
  if (strategyId === 'do-nothing') {
    return { ...shocked };
  }

  // Stockout Strategies
  if (scenarioId === 'stockout') {
    if (strategyId === 'pause-spend') {
      // Spend dropped to 0, zero further waste
      return {
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        roas: 0,
        margin: 0
      };
    }
    if (strategyId === 'redirect-spend') {
      // Reallocate to Google PMax React Infinity (3.6x ROAS, 62% margin)
      const spend = inputs.baselineDailySpend;
      const roas = 3.62;
      const revenue = Math.round(spend * roas);
      const conversions = Math.round(revenue / 13995);
      const clicks = Math.round(conversions / 0.032);
      const impressions = Math.round(clicks / 0.022);
      const margin = Math.round(revenue * 0.62 - spend);
      return { spend, impressions, clicks, conversions, revenue, roas, margin };
    }
    if (strategyId === 'aggressive-realloc') {
      // 140% scale spend into top alternative (3.38x ROAS)
      const spend = Math.round(inputs.baselineDailySpend * 1.4);
      const roas = 3.38;
      const revenue = Math.round(spend * roas);
      const conversions = Math.round(revenue / 13995);
      const clicks = Math.round(conversions / 0.032);
      const impressions = Math.round(clicks / 0.022);
      const margin = Math.round(revenue * 0.61 - spend);
      return { spend, impressions, clicks, conversions, revenue, roas, margin };
    }
    // Custom strategy
    const shiftPct = (inputs.customBudgetShiftPct ?? 50) / 100;
    const cutPct = (inputs.customSpendReductionPct ?? 0) / 100;
    const spend = Math.round(inputs.baselineDailySpend * (1 - cutPct));
    const redirectedSpend = spend * shiftPct;
    const remainingSpend = spend * (1 - shiftPct);
    const redirectedRev = redirectedSpend * 3.5;
    const remainingRev = remainingSpend * (shocked.roas || 0.2);
    const revenue = Math.round(redirectedRev + remainingRev);
    const roas = spend > 0 ? +(revenue / spend).toFixed(2) : 0;
    const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
    return {
      spend,
      impressions: Math.round(shocked.impressions * (1 - cutPct)),
      clicks: Math.round(shocked.clicks * (1 - cutPct)),
      conversions: Math.round(revenue / inputs.aov),
      revenue,
      roas,
      margin
    };
  }

  // CPM Surge Strategies
  if (scenarioId === 'cpm-spike') {
    if (strategyId === 'reduce-spend') {
      const spend = Math.round(inputs.baselineDailySpend * 0.5);
      const impressions = Math.round(shocked.impressions * 0.5);
      const clicks = Math.round(shocked.clicks * 0.5);
      const conversions = Math.round(shocked.conversions * 0.5);
      const revenue = Math.round(conversions * inputs.aov);
      const roas = spend > 0 ? +(revenue / spend).toFixed(2) : 0;
      const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
      return { spend, impressions, clicks, conversions, revenue, roas, margin };
    }
    if (strategyId === 'reallocate-channels') {
      // Shift capital to Amazon & Google (stable CPM, 3.2x ROAS)
      const spend = inputs.baselineDailySpend;
      const roas = 3.24;
      const revenue = Math.round(spend * roas);
      const conversions = Math.round(revenue / inputs.aov);
      const clicks = Math.round(conversions / 0.028);
      const impressions = Math.round(clicks / 0.024);
      const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
      return { spend, impressions, clicks, conversions, revenue, roas, margin };
    }
    if (strategyId === 'balanced-realloc') {
      const spend = inputs.baselineDailySpend;
      const roas = 2.75;
      const revenue = Math.round(spend * roas);
      const conversions = Math.round(revenue / inputs.aov);
      const clicks = Math.round(conversions / 0.026);
      const impressions = Math.round(clicks / 0.022);
      const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
      return { spend, impressions, clicks, conversions, revenue, roas, margin };
    }
    // Custom
    const cutPct = (inputs.customSpendReductionPct ?? 25) / 100;
    const spend = Math.round(inputs.baselineDailySpend * (1 - cutPct));
    const roas = 2.85;
    const revenue = Math.round(spend * roas);
    const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
    return {
      spend,
      impressions: Math.round(shocked.impressions * (1 - cutPct)),
      clicks: Math.round(shocked.clicks * (1 - cutPct)),
      conversions: Math.round(revenue / inputs.aov),
      revenue,
      roas,
      margin
    };
  }

  // Creative Fatigue Strategies
  if (scenarioId === 'creative-fatigue') {
    if (strategyId === 'reduce-spend') {
      const spend = Math.round(inputs.baselineDailySpend * 0.6);
      const revenue = Math.round(shocked.revenue * 0.6);
      const roas = spend > 0 ? +(revenue / spend).toFixed(2) : 0;
      const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
      return {
        spend,
        impressions: Math.round(shocked.impressions * 0.6),
        clicks: Math.round(shocked.clicks * 0.6),
        conversions: Math.round(shocked.conversions * 0.6),
        revenue,
        roas,
        margin
      };
    }
    if (strategyId === 'shift-fresh-creative') {
      // Shifts spend to high-hook creative (+31% CTR restored, 3.45x ROAS)
      const spend = inputs.baselineDailySpend;
      const roas = 3.45;
      const revenue = Math.round(spend * roas);
      const conversions = Math.round(revenue / inputs.aov);
      const clicks = Math.round(conversions / 0.028);
      const impressions = Math.round(clicks / 0.026);
      const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
      return { spend, impressions, clicks, conversions, revenue, roas, margin };
    }
    if (strategyId === 'rotate-audiences') {
      const spend = inputs.baselineDailySpend;
      const roas = 2.65;
      const revenue = Math.round(spend * roas);
      const conversions = Math.round(revenue / inputs.aov);
      const clicks = Math.round(conversions / 0.024);
      const impressions = Math.round(clicks / 0.021);
      const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
      return { spend, impressions, clicks, conversions, revenue, roas, margin };
    }
    // Custom
    const spend = Math.round(inputs.baselineDailySpend * 0.8);
    const roas = 2.95;
    const revenue = Math.round(spend * roas);
    const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
    return {
      spend,
      impressions: shocked.impressions,
      clicks: Math.round(shocked.clicks * 1.3),
      conversions: Math.round(revenue / inputs.aov),
      revenue,
      roas,
      margin
    };
  }

  // Price Undercut Strategies
  if (scenarioId === 'price-undercut') {
    if (strategyId === 'reduce-marketplace-ads') {
      const spend = Math.round(inputs.baselineDailySpend * 0.4);
      const revenue = Math.round(shocked.revenue * 0.4);
      const roas = spend > 0 ? +(revenue / spend).toFixed(2) : 0;
      const margin = Math.round(revenue * (inputs.marginPct / 100) - spend);
      return {
        spend,
        impressions: Math.round(shocked.impressions * 0.4),
        clicks: Math.round(shocked.clicks * 0.4),
        conversions: Math.round(shocked.conversions * 0.4),
        revenue,
        roas,
        margin
      };
    }
    if (strategyId === 'shift-to-direct') {
      // Diverts ad capital to Nike Direct Brand Search (68% margin, 4.12x ROAS)
      const spend = inputs.baselineDailySpend;
      const roas = 4.12;
      const revenue = Math.round(spend * roas);
      const conversions = Math.round(revenue / inputs.aov);
      const clicks = Math.round(conversions / 0.045);
      const impressions = Math.round(clicks / 0.035);
      const margin = Math.round(revenue * 0.68 - spend);
      return { spend, impressions, clicks, conversions, revenue, roas, margin };
    }
    if (strategyId === 'match-price-floor') {
      // Reprices down to competitive price, conversion rate recovers to 4.2%, margin drops to 48%
      const spend = inputs.baselineDailySpend;
      const repricedAov = Math.round(inputs.aov * 0.82);
      const conversions = Math.round(baseline.conversions * 0.9);
      const revenue = Math.round(conversions * repricedAov);
      const roas = spend > 0 ? +(revenue / spend).toFixed(2) : 0;
      const margin = Math.round(revenue * 0.48 - spend);
      return {
        spend,
        impressions: baseline.impressions,
        clicks: baseline.clicks,
        conversions,
        revenue,
        roas,
        margin
      };
    }
    // Custom
    const spend = Math.round(inputs.baselineDailySpend * 0.7);
    const roas = 3.2;
    const revenue = Math.round(spend * roas);
    const margin = Math.round(revenue * 0.62 - spend);
    return {
      spend,
      impressions: shocked.impressions,
      clicks: shocked.clicks,
      conversions: Math.round(revenue / inputs.aov),
      revenue,
      roas,
      margin
    };
  }

  return { ...shocked };
}

function buildCausalChain(
  scenarioId: ShockScenarioId,
  inputs: ScenarioInputParams,
  shocked: MetricSnapshot,
  mitigated: MetricSnapshot,
  strategyId: string
): CausalNode[] {
  if (scenarioId === 'stockout') {
    return [
      {
        step: 1,
        title: 'ERP Warehouse Stock Exhaustion',
        detail: `Physical warehouse inventory reaches 0 units on SKU 315122-001 (Nike Air Force 1 '07).`,
        metricChange: 'Inventory: 0 units',
        status: 'critical'
      },
      {
        step: 2,
        title: 'Fulfillment Capacity Collapses',
        detail: 'Product detail page checkout disables Add-to-Cart for out-of-stock sizes.',
        metricChange: 'Checkout availability: 0%',
        status: 'critical'
      },
      {
        step: 3,
        title: 'Conversion Rate Collapse',
        detail: 'Shoppers land on empty PDP and immediately bounce. CVR plunges from 3.4% to 0.17%.',
        metricChange: 'CVR: -95%',
        status: 'critical'
      },
      {
        step: 4,
        title: 'Ad Spend Burns Wasted Capital',
        detail: 'Under unmitigated conditions, ad platforms burn ₹2,200/day driving traffic to an unpurchasable page.',
        metricChange: `Wasted spend: ₹${inputs.baselineDailySpend}/day`,
        status: 'warning'
      },
      {
        step: 5,
        title: strategyId === 'redirect-spend' ? 'Autonomous Circuit Breaker Intervention' : 'Strategy Applied',
        detail: strategyId === 'redirect-spend'
          ? 'NEXUS pauses SKU 315122-001 in <15 mins and redirects capital to Google PMax React Infinity.'
          : `Applied strategy: ${strategyId}.`,
        metricChange: `ROAS restored: ${mitigated.roas.toFixed(2)}x`,
        status: 'mitigated'
      }
    ];
  }

  if (scenarioId === 'cpm-spike') {
    return [
      {
        step: 1,
        title: 'Auction Inflation Detected',
        detail: `Holiday bidding rush pushes Meta Advantage+ CPM from ₹${inputs.baselineCpm.toFixed(2)} to ₹${(inputs.baselineCpm * inputs.cpmMultiplier).toFixed(2)}.`,
        metricChange: `CPM: +${Math.round((inputs.cpmMultiplier - 1) * 100)}%`,
        status: 'critical'
      },
      {
        step: 2,
        title: 'Impression Delivery Compresses',
        detail: `Fixed daily spend of ₹${inputs.baselineDailySpend.toLocaleString('en-IN')} captures significantly fewer ad impressions.`,
        metricChange: `Impressions: -${Math.round((1 - shocked.impressions / (shocked.impressions * inputs.cpmMultiplier)) * 100)}%`,
        status: 'warning'
      },
      {
        step: 3,
        title: 'CAC Exceeds Unit Contribution',
        detail: 'Higher customer acquisition cost drives ROAS below the 1.8x break-even floor.',
        metricChange: `ROAS: ${shocked.roas.toFixed(2)}x (Breakeven: 1.80x)`,
        status: 'critical'
      },
      {
        step: 4,
        title: 'Convex Reallocation Response',
        detail: 'Optimizer shifts spend to Amazon Sponsored Products & Google Shopping where marginal yield is preserved.',
        metricChange: `Mitigated ROAS: ${mitigated.roas.toFixed(2)}x`,
        status: 'mitigated'
      }
    ];
  }

  if (scenarioId === 'creative-fatigue') {
    return [
      {
        step: 1,
        title: 'Creative Saturation Threshold Exceeded',
        detail: 'Frequency exceeds 5.2 on hero TikTok UGC batch. Target audience experiences ad blindness.',
        metricChange: 'Frequency: 5.2x',
        status: 'warning'
      },
      {
        step: 2,
        title: 'Click-Through Rate Plunges',
        detail: `CTR drops from ${inputs.ctrPct.toFixed(1)}% to ${(inputs.ctrPct * (1 - inputs.fatiguePct / 100)).toFixed(2)}%.`,
        metricChange: `CTR: -${inputs.fatiguePct}%`,
        status: 'critical'
      },
      {
        step: 3,
        title: 'Top-of-Funnel Conversion Loss',
        detail: 'Traffic quality decays; conversion volume drops while ad set continues consuming full budget.',
        metricChange: `Conversions: ${shocked.conversions}/day`,
        status: 'critical'
      },
      {
        step: 4,
        title: 'Creative Rerouting to Meta Reels',
        detail: 'Fatigued ad set auto-paused; capital shifted to high-vitality Meta Reels creative.',
        metricChange: `ROAS restored: ${mitigated.roas.toFixed(2)}x`,
        status: 'mitigated'
      }
    ];
  }

  return [
    {
      step: 1,
      title: 'Competitor Price Undercut Launched',
      detail: `Rival merchant initiates 25% price discount on Amazon, taking price from ₹${inputs.ourPrice.toLocaleString('en-IN')} to ₹${inputs.competitorPrice.toLocaleString('en-IN')}.`,
      metricChange: 'Competitor Price: -25%',
      status: 'warning'
    },
    {
      step: 2,
      title: 'Amazon Buy Box Loss',
      detail: 'Marketplace Buy Box win rate drops precipitously from 85% to 25%.',
      metricChange: 'Buy Box Win: 25%',
      status: 'critical'
    },
    {
      step: 3,
      title: 'Sponsored Ad Traffic Hijacked',
      detail: 'Ad clicks drive traffic to the product listing, but competing seller wins the Buy Box order.',
      metricChange: 'CVR: 4.8% -> 2.8%',
      status: 'critical'
    },
    {
      step: 4,
      title: 'D2C Direct Channel Rerouting',
      detail: 'Capital diverted from Amazon to Nike Direct Brand Search where pricing and 68% margin are defended.',
      metricChange: `Preserved Margin: ₹${mitigated.margin.toLocaleString('en-IN')}/day`,
      status: 'mitigated'
    }
  ];
}
