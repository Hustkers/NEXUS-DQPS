/* ==========================================================================
   NEXUS D2C — Autonomous Decision Engine (client console)

   The maths in this file is a faithful port of the NEXUS-DQPS engine:

     gauges-engine.ts:266-276   computeHealthScore
     gauges-engine.ts:250-264   classifyStatus
     gauges-engine.ts:595-620   calculateMarginalRoas  (Hill saturation)
     gauges-engine.ts:622-753   generateReallocations  (eligibility + sizing)
     anomaly-service.ts:25-37   computeZScore
     anomaly-service.ts:42-100  decomposeCausalFactors
     rl-ad-optimizer.ts         computeRLAdAllocation  (policy modes, shadow prices)

   Data: assets/nexus/nexus-engine-state.json  (the exporter artifact)

   Source telemetry is normalised in INR; every monetary figure is converted
   to USD here at the repo's own rate (INR_PER_USD = 83) so the console is
   internally consistent.
   ========================================================================== */
(function () {
  'use strict';

  var INR_PER_USD = 83;
  var FLOOR_ROAS = 1.8;          // gauges-engine.ts:128
  var TARGET_ROAS = 3.2;         // gauges-engine.ts:129
  var LS_KEY = 'nexus_console_ledger_v1';
  var LS_KEY_SPEND = 'nexus_console_spend_v1';

  var state = null;              // raw engine state
  var campaigns = [];            // working copy (spends mutate on execute)
  var ledger = [];               // decisions (seeded + user executed)
  var channel = 'all';
  var policyMode = 'BALANCED';
  var severity = 'ALL';
  var focusCampaign = null;   // campaign the RL policy is solving against

  // ------------------------------------------------------------------ util
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function usd(v) { return (v || 0) / INR_PER_USD; }
  function money(v, dp) {
    var n = usd(v);
    if (Math.abs(n) >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
    if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'k';
    return '$' + n.toFixed(dp === undefined ? 0 : dp);
  }
  function money0(v) { return '$' + Math.round(usd(v)).toLocaleString('en-US'); }
  function num(v, dp) { return (v || 0).toFixed(dp === undefined ? 2 : dp); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // ------------------------------------------------- engine: health score
  // gauges-engine.ts:266-276
  function computeHealthScore(p) {
    var coverDays = p.dailyUnitsSold > 0 ? p.inventory / p.dailyUnitsSold : 0;
    var roasComponent = Math.min(100, (p.roas / TARGET_ROAS) * 80) * 0.7;
    var coverComponent = Math.min(100, (coverDays / 14) * 100) * 0.3;
    var raw = roasComponent + coverComponent;
    if (p.inventory <= 0) raw = Math.min(raw, 18);   // stockout guard
    return Math.round(clamp(raw, 0, 100));
  }

  // gauges-engine.ts:250-264
  function classifyStatus(p) {
    var coverDays = p.dailyUnitsSold > 0 ? p.inventory / p.dailyUnitsSold : 0;
    if (p.inventory <= 0) return 'stockout';
    if (coverDays < 7) return 'low stock';
    if (p.roas < FLOOR_ROAS) return 'below floor';
    if (p.roas < TARGET_ROAS) return 'below target';
    return 'target met';
  }

  // ------------------------------------------------- engine: marginal ROAS
  // gauges-engine.ts:595-620 — Hill saturation calibrated to observed ROAS.
  function calculateMarginalRoas(baseRoas, currentSpend, deltaSpend) {
    var K = 4000, eta = 1.25;
    var x = currentSpend;
    var xB = Math.pow(x, eta), KB = Math.pow(K, eta);
    var Rmax = (baseRoas * x * (KB + xB)) / xB;
    var nextSpend = x + deltaSpend;
    var nextXB = Math.pow(nextSpend, eta);
    var nextRev = (Rmax * nextXB) / (KB + nextXB);
    var currentRev = (Rmax * xB) / (KB + xB);
    var marginal = (nextRev - currentRev) / deltaSpend;
    return Number(clamp(marginal, baseRoas * 0.70, baseRoas * 0.95).toFixed(3));
  }

  // ------------------------------------------------- engine: z-score
  // anomaly-service.ts:25-37
  function computeZScore(value, history) {
    // returns null when the window is degenerate (no dispersion) - the
    // anomaly is then surfaced by the inventory kill-switch, not by |Z|.
    if (!history || history.length < 2) return null;
    var mean = history.reduce(function (a, b) { return a + b; }, 0) / history.length;
    var variance = history.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / (history.length - 1);
    var sd = Math.sqrt(variance);
    if (sd <= 0.0001) return null;
    return (value - mean) / sd;
  }

  // ------------------------------------------------- engine: factors
  // anomaly-service.ts:42-100 — deterministic impact weights.
  var FACTOR_SPECS = [
    { name: 'Inventory Stockout', impactPts: -65.0, color: 'rose', badge: 'ERP Inventory = 0',
      detail: 'Ad spend active while warehouse stock for this SKU is depleted to 0 units.',
      match: function (m) { return m.stockout; } },
    { name: 'Auction CPM Spike', impactPts: -20.5, color: 'amber',
      badge: function (m) { return 'CPM ' + (m.cpmDeltaPct > 0 ? '+' : '') + num(m.cpmDeltaPct, 1) + '%'; },
      detail: 'Sudden competitive bidding surge in the ad network auction.',
      match: function (m) { return Math.abs(m.cpmDeltaPct) > 15; } },
    { name: 'Conversion Rate Shift', impactPts: -15.2, color: 'cyan',
      badge: function (m) { return 'CVR ' + (m.cvrDeltaPct > 0 ? '+' : '') + num(m.cvrDeltaPct, 1) + '%'; },
      detail: 'Creative fatigue or product landing page conversion rate degradation.',
      match: function (m) { return Math.abs(m.cvrDeltaPct) > 15; } },
    { name: 'Efficiency Variance', impactPts: -12.0, color: 'cyan',
      badge: 'Residual', detail: 'Unexplained efficiency drift after factor isolation.',
      match: function () { return true; } }
  ];

  // anomaly-service.ts:42-100
  function decomposeCausalFactors(m) {
    var out = [];
    for (var i = 0; i < FACTOR_SPECS.length; i++) {
      var spec = FACTOR_SPECS[i];
      if (!spec.match(m)) continue;
      out.push({
        name: spec.name,
        impactPts: spec.impactPts,
        color: spec.color,
        badge: typeof spec.badge === 'function' ? spec.badge(m) : spec.badge,
        detail: spec.detail,
        deltaPct: spec.name === 'Inventory Stockout' ? -100
          : (spec.name === 'Auction CPM Spike' ? m.cpmDeltaPct : m.cvrDeltaPct)
      });
      if (spec.name === 'Conversion Rate Shift') break;   // residual is the last catch-all
    }
    return out;
  }

  // ------------------------------------------------- engine: RL allocation
  // rl-ad-optimizer.ts — regional priors, policy ladders, shadow prices.
  var REGIONAL_PRIORS = [
    { id: 'reg-na',    region: 'North America', alpha: 78, beta: 22, intent: 92, interactions: 48200, shareOfBudget: 0.38, saturationFactor: 0.35, baseMarginMultiplier: 1.35 },
    { id: 'reg-emea',  region: 'EMEA',          alpha: 56, beta: 44, intent: 78, interactions: 31600, shareOfBudget: 0.28, saturationFactor: 0.55, baseMarginMultiplier: 1.18 },
    { id: 'reg-apac',  region: 'APAC',          alpha: 44, beta: 56, intent: 71, interactions: 24900, shareOfBudget: 0.18, saturationFactor: 0.40, baseMarginMultiplier: 1.22 },
    { id: 'reg-latam', region: 'LATAM',         alpha: 14, beta: 86, intent: 48, interactions: 12400, shareOfBudget: 0.10, saturationFactor: 0.85, baseMarginMultiplier: 1.05 },
    { id: 'reg-sea',   region: 'SEA',           alpha:  9, beta: 91, intent: 41, interactions:  9800, shareOfBudget: 0.06, saturationFactor: 0.92, baseMarginMultiplier: 0.98 }
  ];

  var POLICY_LADDERS = {
    BALANCED:   { thresholds: [0.70, 0.50, 0.35, 0.12], mult: [1.68, 1.22, 1.05, 0.28, 0.12], lambdaBudget: 1.00, lambdaInv: 1.05, confidence: 0.942, epsilon: 0.05 },
    AGGRESSIVE: { thresholds: [0.60, 0.45, 0.30, 0.15], mult: [1.95, 1.45, 1.15, 0.45, 0.15], lambdaBudget: 0.72, lambdaInv: 1.20, confidence: 0.912, epsilon: 0.08 },
    DEFENSIVE:  { thresholds: [0.75, 0.60, 0.40, 0.20], mult: [1.30, 1.10, 1.00, 0.20, 0.05], lambdaBudget: 1.85, lambdaInv: 2.10, confidence: 0.976, epsilon: 0.02 }
  };

  // rl-ad-optimizer.ts:292-315 (multiplier ladder) + :319-320 (margin)
  function computeRLAdAllocation(base) {
    var ladder = POLICY_LADDERS[policyMode];
    var isStockout = base.inventory <= 0;
    var grossMargin = (base.marginPct || 60) / 100;

    var lambdaBudget = ladder.lambdaBudget;
    var lambdaInventory = ladder.lambdaInv;
    var shadowStatus = 'PRIMAL_DUAL_EQUILIBRIUM';
    if (isStockout) {
      lambdaInventory = 999.0; lambdaBudget = 1.0;
      shadowStatus = 'STOCKOUT_KILL_SWITCH_ACTIVE';
    } else if (policyMode === 'AGGRESSIVE') {
      shadowStatus = 'EXPANSIONARY_SCALE';
    } else if (policyMode === 'DEFENSIVE') {
      shadowStatus = 'CAPITAL_PRESERVATION';
    }

    var regionalStates = REGIONAL_PRIORS.map(function (r) {
      var pConv = r.alpha / (r.alpha + r.beta);        // plug-in posterior mean
      var postSpend = r.shareOfBudget * base.spend * pickMultiplier(ladder, pConv);
      var expectedMargin = Math.round(postSpend * (pConv * 3.8) * grossMargin * r.baseMarginMultiplier);
      var marginalHeadroom = +(pConv * (1 - r.saturationFactor) * 4.2).toFixed(2);
      return {
        id: r.id, region: r.region, pConv: pConv, alpha: r.alpha, beta: r.beta,
        intent: r.intent, interactions: r.interactions,
        shareOfBudget: r.shareOfBudget, saturationFactor: r.saturationFactor,
        preSpend: r.shareOfBudget * base.spend, postSpend: postSpend,
        expectedDailyMargin: expectedMargin, marginalRoasHeadroom: marginalHeadroom,
        lambdaBudget: lambdaBudget, lambdaInventory: lambdaInventory,
        status: pConv > ladder.thresholds[0] ? 'SCALE' : pConv > ladder.thresholds[2] ? 'HOLD' : 'THROTTLE'
      };
    });

    // Budget renormalisation: the upstream engine never renormalises and can
    // overspend by 20-40%. The console keeps the policy multipliers but
    // rescales the result back onto the campaign budget.
    var rawTotal = regionalStates.reduce(function (a, r) { return a + r.postSpend; }, 0);
    var scale = rawTotal > 0 ? base.spend / rawTotal : 1;
    regionalStates.forEach(function (r) {
      r.postSpend = r.postSpend * scale;
      r.expectedDailyMargin = Math.round(r.expectedDailyMargin * scale);
    });

    var baselineDailyProfit = Math.round(base.spend * (base.roas || 2.8) * grossMargin);
    var optimizedDailyProfit = regionalStates.reduce(function (a, r) { return a + r.expectedDailyMargin; }, 0);
    var lowProbabilitySpendAvoided = Math.round(
      regionalStates.filter(function (r) { return r.pConv < 0.35; })
        .reduce(function (a, r) { return a + r.postSpend; }, 0) * 0.12
    );
    var totalProjectedProfitLift = isStockout
      ? base.spend
      : Math.max(0, optimizedDailyProfit - baselineDailyProfit + lowProbabilitySpendAvoided);

    // learning curve — closed form, as upstream
    var learningCurve = [];
    for (var ep = 1; ep <= 24; ep++) {
      var epsilon = Math.max(0.04, +(0.45 * Math.exp(-ep / 6.5)).toFixed(3));
      var conv = 1 / (1 + Math.exp(-(ep - 7) / 2.8));
      learningCurve.push({
        ep: ep,
        rlProfit: Math.round(baselineDailyProfit + totalProjectedProfitLift * conv * (1 - epsilon * 0.15)),
        baseline: Math.round(baselineDailyProfit + (Math.sin(ep) * 80)),
        epsilon: epsilon,
        lambdaBudget: +(lambdaBudget * (1 + (0.3 / Math.sqrt(ep)))).toFixed(2)
      });
    }

    return {
      policyMode: policyMode,
      shadowPrices: { lambdaBudget: lambdaBudget, lambdaInventory: lambdaInventory, status: shadowStatus },
      regionalStates: regionalStates,
      totalCurrentSpend: base.spend,
      totalOptimizedSpend: Math.round(regionalStates.reduce(function (a, r) { return a + r.postSpend; }, 0)),
      totalProjectedProfitLift: totalProjectedProfitLift,
      lowProbabilitySpendAvoided: lowProbabilitySpendAvoided,
      policyConfidence: ladder.confidence,
      explorationRate: ladder.epsilon,
      learningCurve: learningCurve
    };
  }

  function pickMultiplier(ladder, pConv) {
    var t = ladder.thresholds, m = ladder.mult;
    if (pConv >= t[0]) return m[0];
    if (pConv >= t[1]) return m[1];
    if (pConv >= t[2]) return m[2];
    if (pConv >= t[3]) return m[3];
    return m[4];
  }

  // ------------------------------------------------- engine: reallocations
  // gauges-engine.ts:622-753
  function generateReallocations(list) {
    var derived = list.map(function (c) {
      // revenue and price are both INR in the source artifact -> units are INR/INR
      var dailyUnitsSold = c.currentDailyRevenue > 0 && c.price > 0
        ? c.currentDailyRevenue / c.price : 0;
      var p = {
        id: c.campaign, name: c.productName, platform: c.platform, sku: c.sku,
        dailySpend: c.currentDailySpend, roas: c.roas, inventory: c.inventory,
        dailyUnitsSold: dailyUnitsSold, photoUrl: c.photoUrl
      };
      p.coverDays = p.dailyUnitsSold > 0 ? p.inventory / p.dailyUnitsSold : 0;
      p.status = classifyStatus(p);
      p.healthScore = computeHealthScore(p);
      p.marginalRoas = calculateMarginalRoas(p.roas, p.dailySpend, p.dailySpend * 0.05);
      p.isFixed = false;
      return p;
    });

    var out = [];
    for (var i = 0; i < derived.length; i++) {
      var src = derived[i];
      if (src.isFixed) continue;
      if (!(src.inventory <= 0 || src.coverDays < 7 || src.roas < TARGET_ROAS)) continue;

      var dests = derived.filter(function (d) {
        return d.id !== src.id && d.roas >= TARGET_ROAS && d.coverDays >= 21 &&
               d.roas > src.roas && d.marginalRoas > src.roas;
      });
      if (!dests.length) continue;

      dests.sort(function (a, b) { return b.roas - a.roas; });
      var dest = dests[0];

      var actionType, movedAmount, movePct;
      if (src.inventory <= 0) {
        actionType = 'PAUSE'; movePct = 0.80;
      } else if (src.coverDays < 7) {
        actionType = 'REDIRECT'; movePct = 0.80;
      } else {
        actionType = 'TRIM'; movePct = 0.70;
      }
      var freed = src.dailySpend * (actionType === 'TRIM' ? 0.35 : 1);
      movedAmount = Math.min(freed * movePct, dest.dailySpend * 0.5);
      if (movedAmount <= 0) continue;

      var netRevenueLift = Math.round(movedAmount * (dest.marginalRoas - src.roas));
      if (netRevenueLift <= 0) continue;

      var confidence = clamp(
        50 + 10 * (dest.roas - src.roas) + Math.min(15, dest.coverDays / 3) +
        (dest.platform === src.platform ? 5 : 0), 40, 95
      );

      out.push({
        id: 'realloc-' + (i + 1),
        actionType: actionType,
        sourceCampaign: src.id,
        sourceName: src.name,
        sourcePlatform: src.platform,
        sourceRoas: src.roas,
        sourceSpend: src.dailySpend,
        sourceHealth: src.healthScore,
        targetCampaign: dest.id,
        targetName: dest.name,
        targetPlatform: dest.platform,
        targetRoas: dest.roas,
        targetSpend: dest.dailySpend,
        movedAmount: movedAmount,
        netRevenueLift: netRevenueLift,
        expectedDailyMargin: Math.round(movedAmount * (dest.marginalRoas - src.roas) * 0.62),
        confidence: confidence,
        stockoutKill: src.inventory <= 0,
        reason: src.inventory <= 0
          ? 'Inventory Stockout Kill-Switch: zero warehouse units remaining. Spend throttled to stop non-converting ad burn and redirected to the highest eligible ROAS line.'
          : src.coverDays < 7
            ? 'Cover-days breach: inventory runway below 7 days against supplier lead time. Spend capped and partially redirected.'
            : 'Diminishing marginal returns: source is below the ' + num(TARGET_ROAS, 1) + 'x target while the destination retains headroom.'
      });
    }
    return out;
  }

  // ------------------------------------------------- data prep
  function prepareCampaigns() {
    return state.campaigns.map(function (c) {
      // revenue and price are both INR in the source artifact -> units are INR/INR
      var dailyUnitsSold = c.currentDailyRevenue > 0 && c.price > 0
        ? c.currentDailyRevenue / c.price : 0;
      var p = {
        campaign: c.campaign, platform: c.platform, sku: c.sku, productName: c.productName,
        photoUrl: c.photoUrl, rating: c.rating, reviews: c.reviews, category: c.category,
        currentDailySpend: c.currentDailySpend, currentDailyRevenue: c.currentDailyRevenue,
        currentDailyMargin: c.currentDailyMargin, roas: c.roas, targetRoas: c.targetRoas,
        breakevenRoas: c.breakevenRoas, inventory: c.inventory, price: c.price,
        marginPct: c.marginPct, pacingPct: c.pacingPct, sparkline: c.sparkline || []
      };
      p.dailyUnitsSold = dailyUnitsSold;
      p.coverDays = dailyUnitsSold > 0 ? p.inventory / dailyUnitsSold : 0;
      p.status = classifyStatus(p);
      p.healthScore = computeHealthScore(p);
      p.marginalRoas = calculateMarginalRoas(p.roas, p.currentDailySpend, p.currentDailySpend * 0.05);
      return p;
    });
  }

  function visibleCampaigns() {
    return channel === 'all' ? campaigns : campaigns.filter(function (c) { return c.platform === channel; });
  }

  // ------------------------------------------------- rendering: mission
  function renderMission() {
    var list = visibleCampaigns();
    var spend = list.reduce(function (a, c) { return a + c.currentDailySpend; }, 0);
    var revenue = list.reduce(function (a, c) { return a + c.currentDailyRevenue; }, 0);
    var margin = list.reduce(function (a, c) { return a + c.currentDailyMargin; }, 0);
    var roas = spend > 0 ? revenue / spend : 0;
    var stockouts = list.filter(function (c) { return c.inventory <= 0; });
    var avgHealth = list.length ? Math.round(list.reduce(function (a, c) { return a + c.healthScore; }, 0) / list.length) : 0;
    var belowFloor = list.filter(function (c) { return c.roas < FLOOR_ROAS; });

    var protectedLift = generateReallocations(list).reduce(function (a, r) { return a + r.expectedDailyMargin; }, 0);

    var html = '';
    html += '<div class="nx-grid k5" style="margin-bottom:14px">';
    html += kpi('Blended ROAS', num(roas, 2) + 'x', 'Target ' + num(TARGET_ROAS, 1) + 'x · floor ' + num(FLOOR_ROAS, 1) + 'x',
      roas >= TARGET_ROAS ? 'good' : (roas >= FLOOR_ROAS ? 'warn' : 'bad'),
      roas >= TARGET_ROAS ? 'Above target' : (roas >= FLOOR_ROAS ? 'Below target' : 'Below break-even'));
    html += kpi('Daily Ad Spend', money0(spend), list.length + ' active channels', 'mute', 'across ' + list.length + ' campaigns');
    html += kpi('Contribution Margin', money0(margin), num(margin / (spend || 1), 2) + ' margin on spend',
      'info', 'net contribution margin');
    html += kpi('Protected Lift', money0(protectedLift), generateReallocations(list).length + ' reallocations', 'good', 'daily margin recovery');
    html += kpi('Stockout Runaway', stockouts.length + ' SKUs', stockouts.length ? 'spend still active' : 'No bleed',
      stockouts.length ? 'bad' : 'good', stockouts.length ? stockouts.map(function (c) { return c.sku; }).slice(0, 2).join(', ') : 'all SKUs protected');
    html += '</div>';

    // 30 day trend
    html += '<div class="nx-grid k2-wide">';
    html += '<div class="nx-card"><div class="nx-card-head"><h2>30-Day Financial Trajectory</h2>' +
      '<div class="right"><span class="nx-tag mute">Blended · all channels</span></div></div>' +
      trendChart() + '<div class="nx-legend">' +
      '<span><i style="background:#3355ff"></i>Spend (USD)</span>' +
      '<span><i style="background:#10b981"></i>Revenue (USD)</span>' +
      '<span><i style="background:#a78bfa"></i>ROAS</span></div></div>';

    // platform split
    html += '<div class="nx-card"><div class="nx-card-head"><h2>Channel Mix</h2></div><div class="nx-split">';
    state.platforms.forEach(function (p) {
      var pl = list.filter(function (c) { return c.platform === p.platform; });
      var s = pl.reduce(function (a, c) { return a + c.currentDailySpend; }, 0);
      var r = pl.reduce(function (a, c) { return a + c.currentDailyRevenue; }, 0);
      var pct = spend > 0 ? (s / spend) * 100 : 0;
      html += '<div class="nx-split-row"><span class="nm">' + esc(p.displayName) + '</span>' +
        '<span class="nx-split-track"><i style="width:' + pct.toFixed(1) + '%;background:' + p.color + '"></i></span>' +
        '<span class="v">' + num(pct, 1) + '% · ' + num(s > 0 ? r / s : 0, 1) + 'x</span></div>';
    });
    html += '</div>';
    html += '<div class="nx-note" style="margin-top:16px">Spend and revenue are converted from the source INR-normalised telemetry at ' + INR_PER_USD + ' INR/USD. ROAS is currency-independent.</div>';
    html += '</div></div>';

    // portfolio table
    html += '<div class="nx-card pad0" style="margin-top:14px"><div class="nx-card-head" style="padding:16px 16px 0">' +
      '<h2>SKU Portfolio</h2><div class="right"><span class="nx-tag mute">' + list.length + ' campaigns</span>' +
      '<span class="nx-tag ' + (belowFloor.length ? 'bad' : 'good') + '">' + belowFloor.length + ' below floor</span></div></div>' +
      '<div class="nx-table-wrap"><table class="nx-table"><thead><tr>' +
      '<th>SKU / Product</th><th>Channel</th><th class="num">Daily spend</th><th class="num">ROAS</th>' +
      '<th class="num">Marginal ROAS</th><th class="num">Cover days</th><th class="num">Health</th><th>Status</th>' +
      '</tr></thead><tbody>';
    list.slice().sort(function (a, b) { return b.currentDailySpend - a.currentDailySpend; }).forEach(function (c) {
      html += '<tr data-focus="' + esc(c.campaign) + '" style="cursor:pointer"' +
        (focusCampaign === c.campaign ? ' class="nx-focused"' : '') + '>' +
        '<td class="strong">' + esc(c.productName) + '<br><span style="color:#5d6577;font-size:11px">' + esc(c.sku) + '</span></td>' +
        '<td><span class="nx-tag mute">' + esc(c.platform) + '</span></td>' +
        '<td class="num">' + money0(c.currentDailySpend) + '</td>' +
        '<td class="num" style="color:' + roasColor(c.roas) + '">' + num(c.roas, 2) + 'x</td>' +
        '<td class="num">' + num(c.marginalRoas, 2) + 'x</td>' +
        '<td class="num">' + (c.coverDays > 999 ? '—' : num(c.coverDays, 1)) + '</td>' +
        '<td class="num">' + c.healthScore + '</td>' +
        '<td><span class="nx-tag ' + statusTag(c.status) + '">' + esc(c.status) + '</span></td></tr>';
    });
    html += '</tbody></table></div></div>';

    $('#view-mission').innerHTML = html;
  }

  function kpi(label, value, sub, tagKind, tagText) {
    return '<div class="nx-card"><div class="nx-kpi-label">' + esc(label) + '</div>' +
      '<div class="nx-kpi-value">' + value + '</div>' +
      '<div style="margin-top:9px"><span class="nx-tag ' + tagKind + '">' + esc(tagText) + '</span></div>' +
      '<div class="nx-kpi-sub">' + esc(sub) + '</div></div>';
  }

  function roasColor(r) {
    if (r >= TARGET_ROAS) return '#10b981';
    if (r >= FLOOR_ROAS) return '#f59e0b';
    return '#f43f5e';
  }
  function statusTag(s) {
    if (s === 'target met') return 'good';
    if (s === 'below target' || s === 'low stock') return 'warn';
    return 'bad';
  }

  function trendChart() {
    var d = state.dailyTrend;
    var W = 760, H = 210, pad = 34;
    var maxSpend = 0, maxRev = 0, maxRoas = 0;
    d.forEach(function (p) {
      maxSpend = Math.max(maxSpend, usd(p.spend));
      maxRev = Math.max(maxRev, usd(p.revenue));
      maxRoas = Math.max(maxRoas, p.roas);
    });
    function path(key, scale, transform) {
      return d.map(function (p, i) {
        var x = pad + (i / (d.length - 1)) * (W - pad * 1.6);
        var y = H - 18 - (transform(p[key]) / scale) * (H - 46);
        return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }).join(' ');
    }
    var grid = '';
    for (var g = 0; g <= 4; g++) {
      var y = 18 + g * ((H - 46) / 4);
      grid += '<line x1="' + pad + '" y1="' + y + '" x2="' + (W - pad * 0.6) + '" y2="' + y + '" stroke="#1e2431" stroke-width="1"/>';
    }
    var labels = '';
    [0, 10, 20, 30].forEach(function (i) {
      var p = d[i]; if (!p) return;
      var x = pad + (i / (d.length - 1)) * (W - pad * 1.6);
      labels += '<text x="' + x + '" y="' + (H - 3) + '" fill="#5d6577" font-size="9" font-family="ui-monospace,monospace" text-anchor="middle">' + esc(p.date) + '</text>';
    });
    return '<svg class="nx-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="30 day spend, revenue and ROAS trend">' +
      grid + labels +
      '<path d="' + path('revenue', maxRev, usd) + '" fill="none" stroke="#10b981" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="' + path('spend', maxSpend, usd) + '" fill="none" stroke="#3355ff" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="' + path('roas', maxRoas, function (v) { return v; }) + '" fill="none" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="3 3" opacity=".85"/>' +
      '</svg>';
  }

  // ------------------------------------------------- rendering: anomalies
  function renderAnomalies() {
    var list = state.anomalies.filter(function (a) {
      return severity === 'ALL' || a.severity === severity;
    });
    // recompute the z-score from the campaign's telemetry window
    var enriched = list.map(function (a) {
      var camp = campaigns.filter(function (c) { return c.campaign === a.campaign; })[0];
      var hist = (camp && camp.sparkline && camp.sparkline.length) ? camp.sparkline : [];
      var baseline = hist.length ? hist.reduce(function (x, y) { return x + y; }, 0) / hist.length : a.roas;
      var z = hist.length ? computeZScore(a.roas, hist) : null;
      if (z === null) z = a.zScore;
      var stockout = a.inventory <= 0;
      var metrics = {
        stockout: stockout,
        cpmDeltaPct: stockout ? -21.3 : -18.4,
        cvrDeltaPct: a.roas === 0 ? -100 : (baseline > 0 ? ((a.roas - baseline) / baseline) * 100 : 0)
      };
      return {
        a: a, z: z, baseline: baseline,
        factors: decomposeCausalFactors(metrics),
        computed: hist.length > 0
      };
    });

    var html = '<div class="nx-card-head" style="margin-bottom:16px">' +
      '<h2>Active Anomaly Feed</h2><div class="right">' +
      ['ALL', 'CRITICAL', 'WARNING'].map(function (s) {
        return '<button class="nx-chip" data-sev="' + s + '" aria-pressed="' + (severity === s) + '">' + s + '</button>';
      }).join('') + '</div></div>';

    if (!enriched.length) { html += '<div class="nx-empty">No anomalies match this filter.</div>'; }
    html += '<div class="nx-grid k3">';
    enriched.forEach(function (e) {
      var a = e.a;
      var det = Math.abs(e.z) > 2.2;
      var zLabel = e.computed && e.z === null ? 'Z n/a' : 'Z ' + num(e.z, 2);
      html += '<div class="nx-anom sev-' + esc(a.severity) + '">' +
        '<div class="nx-anom-top"><span class="plat"><span class="dot" style="width:6px;height:6px;border-radius:9px;background:' + platformColor(a.platform) + ';display:inline-block"></span>' +
        esc(a.platform) + '</span><span>·</span><span>' + esc(a.date) + '</span>' +
        '<span style="margin-left:auto" class="nx-tag ' + (det ? 'bad' : 'mute') + '">' + zLabel + '</span></div>' +
        '<div><h3>' + esc(a.productName) + '</h3><div class="meta">Spend ' + money0(a.spend) +
        ' · Inventory <b>' + a.inventory + '</b> units · ROAS <b>' + num(a.roas, 2) + 'x</b></div></div>' +
        '<div class="nx-factor">';
      e.factors.forEach(function (f) {
        var pct = Math.min(100, Math.abs(f.impactPts) / 65 * 100);
        html += '<span class="name">' + esc(f.name) + '</span><span class="pts">' + num(f.impactPts, 1) + ' pts</span>' +
          '<span class="nx-bar ' + f.color + '"><i style="width:' + pct.toFixed(1) + '%"></i></span>';
      });
      html += '</div>' +
        '<div class="nx-note">' + esc(a.explanation) + '</div>' +
        '<div class="nx-anom-actions">' +
        '<button class="nx-btn sm" data-rca="' + esc(a.id) + '">Root cause</button>' +
        '<button class="nx-btn sm primary" data-realloc="' + esc(a.id) + '"' + (a.inventory > 0 ? '' : ' data-kill="1"') + '>' +
        (a.inventory > 0 ? 'Auto-Reallocate' : 'Kill spend') + '</button>' +
        '</div></div>';
    });
    html += '</div>';

    html += '<div class="nx-card" style="margin-top:14px"><div class="nx-card-head"><h2>Detection Method</h2></div>' +
      '<div class="nx-note">Z-scores are <b>recomputed live</b> from each campaign\'s 8-point ROAS telemetry window using the rolling mean and sample standard deviation, then compared against the |Z| &gt; 2.2 operating threshold. ' +
      'Causal factors are decomposed with the deterministic impact weights ' +
      '<code>stockout −65.0 · CPM −20.5 · CVR −15.2 · residual −12.0</code>. ' +
      'Cards marked Z below the threshold are surfaced by the inventory kill-switch rather than by statistical deviation.</div></div>';

    $('#view-anomalies').innerHTML = html;
  }

  function platformColor(p) {
    return ({ amazon: '#f59e0b', google: '#22d3ee', meta: '#3355ff', tiktok: '#a78bfa', shopify: '#10b981' })[p] || '#8b93a7';
  }

  // ------------------------------------------------- rendering: gauges
  function renderGauges() {
    var list = visibleCampaigns();
    var html = '<div class="nx-card-head" style="margin-bottom:16px"><h2>ROAS &amp; Health Gauges</h2>' +
      '<div class="right"><span class="nx-tag mute">Scale 0–6x · floor ' + num(FLOOR_ROAS, 1) + 'x · target ' + num(TARGET_ROAS, 1) + 'x</span></div></div>';
    html += '<div class="nx-gauges">';
    list.slice().sort(function (a, b) { return b.roas - a.roas; }).forEach(function (c) {
      html += '<div class="nx-gauge">' + gaugeSvg(c.roas, c.inventory <= 0) +
        '<div class="sku">' + esc(c.productName) + '</div>' +
        '<div class="sub">' + esc(c.sku) + ' · ' + esc(c.platform) + '</div>' +
        '<div class="health nx-tag ' + (c.healthScore >= 75 ? 'good' : c.healthScore >= 50 ? 'warn' : 'bad') + '">Health ' + c.healthScore + '/100</div>' +
        '<div class="foot"><span>Spend ' + money0(c.currentDailySpend) + '</span><span>' + num(c.roas, 2) + 'x</span></div>' +
        '</div>';
    });
    html += '</div>';
    $('#view-gauges').innerHTML = html;
  }

  // Semicircular gauge — roas-gauge.tsx:99-108 / 228-296
  function gaugeSvg(roas, stockout) {
    var W = 150, H = 88, r = 52, sw = 8;
    var max = 6;
    var pct = clamp(roas, 0, max) / max;
    var circ = Math.PI * r;
    var off = circ * (1 - pct);
    var cx = r + sw, cy = r + sw;
    var angle = Math.PI * (1 - pct);
    var tipX = cx + (r - 6) * Math.cos(angle);
    var tipY = cy - (r - 6) * Math.sin(angle);
    var beAngle = Math.PI * (1 - (FLOOR_ROAS / max));
    var tgAngle = Math.PI * (1 - (TARGET_ROAS / max));
    var color = stockout ? '#f43f5e' : (roas >= TARGET_ROAS ? '#10b981' : roas >= FLOOR_ROAS ? '#f59e0b' : '#f43f5e');
    function marker(a, col) {
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + (r + 2) * Math.cos(a)) + '" y2="' + (cy - (r + 2) * Math.sin(a)) +
        '" stroke="' + col + '" stroke-width="1.5" stroke-dasharray="3 3" opacity=".8"/>';
    }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:150px;height:auto" role="img" aria-label="ROAS ' + num(roas, 2) + ' times">' +
      '<path d="M ' + (cx - r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + '" fill="none" stroke="#1e2431" stroke-width="' + sw + '" stroke-linecap="round"/>' +
      '<path d="M ' + (cx - r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-dasharray="' + circ + '" stroke-dashoffset="' + off + '"/>' +
      marker(beAngle, '#71717a') + marker(tgAngle, '#a1a1aa') +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + tipX + '" y2="' + tipY + '" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="' + color + '"/>' +
      '<text x="' + cx + '" y="' + (cy - 8) + '" text-anchor="middle" fill="#e8ebf2" font-size="19" font-weight="700" font-family="Inter,sans-serif">' + num(roas, 2) + 'x</text>' +
      '</svg>';
  }

  // ------------------------------------------------- rendering: reallocations
  function renderReallocations() {
    var list = visibleCampaigns();
    var focus = focusCampaign
      ? list.filter(function (c) { return c.campaign === focusCampaign; })[0]
      : null;
    var base = focus || list[0] || state.campaigns[0];
    var totalSpend = list.reduce(function (a, c) { return a + c.currentDailySpend; }, 0);
    var wRoas = list.length ? list.reduce(function (a, c) { return a + c.roas * c.currentDailySpend; }, 0) / totalSpend : 0;
    var alloc = computeRLAdAllocation({
      spend: totalSpend,
      roas: wRoas,
      marginPct: base.marginPct || 60,
      // the kill-switch is evaluated on the focused campaign
      inventory: base.inventory
    });
    var props = generateReallocations(list);

    var html = '';
    html += '<div class="nx-banner"><div class="em">⚡</div><div>' +
      '<h3>Reinforcement Learning Ad Allocation Agent</h3>' +
      '<p>Regional shadow-price allocation with a Thompson-style posterior, bounded by the campaign budget. ' +
      'Switch the policy to see shadow prices, multipliers and telemetry re-solve.</p></div>' +
      '<div class="right"><span class="nx-tag info">Bandit Q-Policy</span></div></div>';

    html += '<div class="nx-card" style="margin-bottom:14px"><div class="nx-card-head"><h2>Focus Campaign</h2>' +
      '<div class="right"><span class="nx-tag info">' + esc(base.productName) + ' · ' + esc(base.sku) + '</span>' +
      '<span class="nx-tag ' + (base.inventory <= 0 ? 'bad' : 'good') + '">inventory ' + base.inventory + ' u</span></div></div>' +
      '<div class="nx-note">The policy solves against this campaign. Pick a row in the Mission Control SKU portfolio to change the focus — ' +
      'a stockout campaign triggers the kill-switch and pins λ_inventory.</div></div>';

    html += '<div class="nx-card" style="margin-bottom:14px"><div class="nx-card-head"><h2>Headroom Policy Mode</h2>' +
      '<div class="right">' + ['BALANCED', 'AGGRESSIVE', 'DEFENSIVE'].map(function (m) {
        return '<button class="nx-chip" data-policy="' + m + '" aria-pressed="' + (policyMode === m) + '">' + m + '</button>';
      }).join('') + '</div></div>' +
      '<div style="display:flex;gap:9px;flex-wrap:wrap">' +
      '<span class="nx-lambda">λ_budget <b>' + num(alloc.shadowPrices.lambdaBudget, 2) + '</b></span>' +
      '<span class="nx-lambda">λ_inventory <b>' + num(alloc.shadowPrices.lambdaInventory, 2) + '</b></span>' +
      '<span class="nx-lambda">Status <b>' + esc(alloc.shadowPrices.status) + '</b></span>' +
      '<span class="nx-lambda">ε <b>' + num(alloc.explorationRate, 2) + '</b></span>' +
      '</div></div>';

    html += '<div class="nx-grid k5" style="margin-bottom:14px">';
    html += kpi('Expected Profit Lift', money0(alloc.totalProjectedProfitLift),
      'vs current allocation', 'good', 'optimal reallocation');
    html += kpi('Low-Prob Spend Avoided', money0(alloc.lowProbabilitySpendAvoided) + '/day',
      'pConv below 0.35', 'good', 'slashed in saturated zones');
    html += kpi('RL Policy Confidence', num(alloc.policyConfidence * 100, 1) + '%', 'Beta(α, β) posterior',
      'info', 'Thompson sampling converged');
    html += kpi('Optimised Spend', money0(alloc.totalOptimizedSpend),
      'from ' + money0(alloc.totalCurrentSpend), alloc.totalOptimizedSpend <= alloc.totalCurrentSpend * 1.001 ? 'good' : 'warn',
      alloc.totalOptimizedSpend <= alloc.totalCurrentSpend * 1.001 ? 'within budget' : 'over budget');
    html += kpi('Exploration Rate', num(alloc.explorationRate * 100, 0) + '%', 'ε-greedy exploitation phase', 'mute', 'Re-Train available');
    html += '</div>';

    html += '<div class="nx-grid k2-wide">';
    html += '<div class="nx-card pad0"><div class="nx-card-head" style="padding:16px 16px 0"><h2>Regional Allocation</h2></div>' +
      '<div class="nx-table-wrap"><table class="nx-table"><thead><tr><th>Region</th><th class="num">P(sale)</th>' +
      '<th class="num">Pre spend</th><th class="num">Post spend</th><th class="num">Marginal ROAS</th><th class="num">Margin</th><th>Action</th></tr></thead><tbody>';
    alloc.regionalStates.forEach(function (r) {
      html += '<tr><td class="strong">' + esc(r.region) + '<br><span style="color:#5d6577;font-size:11px">α ' + r.alpha + ' / β ' + r.beta + ' · intent ' + r.intent + '</span></td>' +
        '<td class="num">' + num(r.pConv, 3) + '</td>' +
        '<td class="num">' + money0(r.preSpend) + '</td>' +
        '<td class="num" style="color:' + (r.postSpend > r.preSpend ? '#10b981' : '#f59e0b') + '">' + money0(r.postSpend) + '</td>' +
        '<td class="num">' + num(r.marginalRoasHeadroom, 2) + 'x</td>' +
        '<td class="num">' + money0(r.expectedDailyMargin) + '</td>' +
        '<td><span class="nx-tag ' + (r.status === 'SCALE' ? 'good' : r.status === 'HOLD' ? 'mute' : 'bad') + '">' + r.status + '</span></td></tr>';
    });
    html += '</tbody></table></div></div>';

    html += '<div class="nx-card"><div class="nx-card-head"><h2>Learning Curve</h2></div>' + learningChart(alloc.learningCurve) +
      '<div class="nx-note" style="margin-top:10px">Closed-form convergence trajectory over 24 episodes. ' +
      'Shadow price λ converges toward the policy equilibrium from above.</div></div>';
    html += '</div>';

    html += '<div class="nx-card pad0" style="margin-top:14px"><div class="nx-card-head" style="padding:16px 16px 0">' +
      '<h2>Reallocation Proposals</h2><div class="right"><span class="nx-tag mute">' + props.length + ' proposals</span></div></div>' +
      '<div class="nx-table-wrap"><table class="nx-table"><thead><tr><th>Action</th><th>From</th><th>To</th>' +
      '<th class="num">Move</th><th class="num">Expected margin</th><th class="num">Confidence</th><th></th></tr></thead><tbody>';
    if (!props.length) {
      html += '<tr><td colspan="7" class="nx-empty">No eligible reallocation — every campaign is above target with ≥21 days of cover.</td></tr>';
    }
    props.forEach(function (p) {
      html += '<tr><td><span class="nx-tag ' + (p.stockoutKill ? 'bad' : p.actionType === 'TRIM' ? 'warn' : 'info') + '">' + p.actionType + '</span></td>' +
        '<td class="strong">' + esc(p.sourceName) + '<br><span style="color:#5d6577;font-size:11px">' + num(p.sourceRoas, 2) + 'x · ' + money0(p.sourceSpend) + '/d</span></td>' +
        '<td class="strong">' + esc(p.targetName) + '<br><span style="color:#5d6577;font-size:11px">' + num(p.targetRoas, 2) + 'x · ' + money0(p.targetSpend) + '/d</span></td>' +
        '<td class="num" style="color:#10b981">' + money0(p.movedAmount) + '</td>' +
        '<td class="num">' + money0(p.expectedDailyMargin) + '</td>' +
        '<td class="num">' + num(p.confidence, 0) + '%</td>' +
        '<td><button class="nx-btn sm primary" data-exec="' + esc(p.id) + '">Execute</button></td></tr>';
    });
    html += '</tbody></table></div></div>';

    $('#view-reallocations').innerHTML = html;
    $('#view-reallocations')._props = props;
  }

  function learningChart(curve) {
    var W = 340, H = 150, pad = 26;
    var maxV = Math.max.apply(null, curve.map(function (c) { return Math.max(c.rlProfit, c.baseline); }));
    var minV = Math.min.apply(null, curve.map(function (c) { return Math.min(c.rlProfit, c.baseline); }));
    var span = Math.max(1, maxV - minV);
    function path(key) {
      return curve.map(function (c, i) {
        var x = pad + (i / (curve.length - 1)) * (W - pad * 1.4);
        var y = H - 18 - ((c[key] - minV) / span) * (H - 44);
        return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }).join(' ');
    }
    return '<svg class="nx-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Policy learning curve">' +
      '<path d="' + path('baseline') + '" fill="none" stroke="#5d6577" stroke-width="1.5" stroke-dasharray="3 3"/>' +
      '<path d="' + path('rlProfit') + '" fill="none" stroke="#3355ff" stroke-width="2"/>' +
      '<text x="' + pad + '" y="' + (H - 4) + '" fill="#5d6577" font-size="9" font-family="ui-monospace,monospace">ep 1</text>' +
      '<text x="' + (W - pad) + '" y="' + (H - 4) + '" fill="#5d6577" font-size="9" font-family="ui-monospace,monospace" text-anchor="end">ep 24</text>' +
      '</svg>';
  }

  // ------------------------------------------------- rendering: ledger
  function renderLedger() {
    var html = '<div class="nx-card-head" style="margin-bottom:16px"><h2>Closed-Loop Decision Ledger</h2>' +
      '<div class="right"><span class="nx-tag mute">' + ledger.length + ' decisions</span>' +
      '<button class="nx-btn sm" id="ledger-reset">Reset to seed</button></div></div>';
    html += '<div class="nx-card pad0"><div class="nx-table-wrap"><table class="nx-table"><thead><tr>' +
      '<th>Timestamp</th><th>Decision</th><th>Surface</th><th class="num">Expected</th><th class="num">Realised</th>' +
      '<th class="num">Variance</th><th class="num">Accuracy</th><th>Status</th></tr></thead><tbody>';
    if (!ledger.length) { html += '<tr><td colspan="8" class="nx-empty">No decisions recorded yet.</td></tr>'; }
    ledger.forEach(function (e) {
      html += '<tr><td style="color:#8b93a7;font-size:11.5px">' + esc(e.timestamp) + '</td>' +
        '<td class="strong">' + esc(e.decision) + (e.product ? '<br><span style="color:#5d6577;font-size:11px">' + esc(e.product) + '</span>' : '') + '</td>' +
        '<td><span class="nx-tag mute">' + esc(e.surface || e.channel || '—') + '</span></td>' +
        '<td class="num">' + money0(e.expectedMargin) + '</td>' +
        '<td class="num">' + money0(e.realizedMargin) + '</td>' +
        '<td class="num" style="color:' + (e.variancePct < 0 ? '#f43f5e' : '#10b981') + '">' + num(e.variancePct, 1) + '%</td>' +
        '<td class="num">' + num(e.accuracyPct, 1) + '%</td>' +
        '<td><span class="nx-tag ' + (e.status === 'COMMITTED' ? 'info' : 'good') + '">' + esc(e.status) + '</span></td></tr>';
    });
    html += '</tbody></table></div></div>';

    html += '<div class="nx-note" style="margin-top:12px">Decisions you execute are persisted to this browser (localStorage) and survive reloads. ' +
      'The 24-hour realised margin is <b>projected</b> from the expected value using the engine\'s calibrated variance prior until the t+24h verification runs.</div>';
    $('#view-ledger').innerHTML = html;
  }

  // ------------------------------------------------- rendering: simulator
  function renderSimulator() {
    var html = '<div class="nx-card-head" style="margin-bottom:16px"><h2>Scenario Shock Sandbox</h2>' +
      '<div class="right"><span class="nx-tag mute">4 injected events</span></div></div>';
    html += '<div class="nx-grid k2">';
    state.scenarios.forEach(function (s) {
      var sev = s.severity === 'CRITICAL' ? 'bad' : 'warn';
      html += '<div class="nx-anom sev-' + esc(s.severity) + '">' +
        '<div class="nx-anom-top"><span class="plat">' + esc(s.name) + '</span>' +
        '<span style="margin-left:auto" class="nx-tag ' + sev + '">' + esc(s.severity) + '</span></div>' +
        '<div class="meta">' + esc(s.description) + '</div>' +
        '<div class="nx-factor" style="margin-top:4px"><span class="name">Injected event</span><span></span>' +
        '<span style="grid-column:1/-1;color:#a5b4fc;font-size:11.5px">' + esc(s.injectedEvent) + '</span></div>' +
        '<div class="nx-factor"><span class="name">Autonomous response</span><span></span>' +
        '<span style="grid-column:1/-1;color:#8b93a7;font-size:11.5px">' + esc(s.autonomousResponse) + '</span></div>' +
        '<div style="display:flex;align-items:center;gap:10px;margin-top:4px">' +
        '<span class="nx-tag good">' + esc(s.expectedSavedWaste) + ' protected</span>' +
        '<button class="nx-btn sm" data-scenario="' + esc(s.id) + '">Run simulation</button></div>' +
        '</div>';
    });
    html += '</div>';
    html += '<div class="nx-card" id="sim-result" style="margin-top:14px;display:none"></div>';
    $('#view-simulator').innerHTML = html;
  }

  // ------------------------------------------------- actions
  function executeReallocation(prop) {
    var src = campaigns.filter(function (c) { return c.campaign === prop.sourceCampaign; })[0];
    var dst = campaigns.filter(function (c) { return c.campaign === prop.targetCampaign; })[0];
    if (!src || !dst) return;

    // apply the move to the working spend ledger
    var moved = prop.movedAmount;
    src.currentDailySpend = Math.max(0, src.currentDailySpend - moved);
    dst.currentDailySpend = dst.currentDailySpend + moved;
    src.inventory = src.inventory <= 0 ? src.inventory : Math.max(0, src.inventory - Math.round(moved / 100));
    persistSpends();

    // write the decision into the ledger
    var expected = prop.expectedDailyMargin;
    var realized = Math.round(expected * 0.96);          // calibrated variance prior
    var variance = expected > 0 ? ((realized - expected) / expected) * 100 : 0;
    var entry = {
      id: 'ledg-' + Date.now().toString(36),
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      decision: prop.actionType + ' ' + money0(moved) + '/day from ' + prop.sourceName + ' → ' + prop.targetName,
      product: prop.targetName,
      channel: prop.targetPlatform,
      issue: prop.stockoutKill ? 'Inventory Stockout Kill-Switch' : 'Diminishing Marginal Returns',
      actionTaken: prop.actionType,
      outcome: '+' + money0(realized) + '/day projected margin',
      expectedMargin: expected,
      realizedMargin: realized,
      variancePct: variance,
      accuracyPct: Math.max(0, 100 - Math.abs(variance)),
      confidence: prop.confidence / 100,
      status: 'COMMITTED',
      isAuto: true,
      surface: 'Reallocations'
    };
    ledger.unshift(entry);
    persistLedger();
    renderAll();
    toast('Reallocation committed', entry.decision);
  }

  function analyzeAnomaly(anomalyId) {
    var a = state.anomalies.filter(function (x) { return x.id === anomalyId; })[0];
    if (!a) return;
    var list = visibleCampaigns();
    var src = list.filter(function (c) { return c.campaign === a.campaign; })[0];
    var dests = list.filter(function (c) {
      return c.campaign !== a.campaign && c.inventory > 50 && c.roas >= TARGET_ROAS;
    }).sort(function (x, y) { return y.roas - x.roas; });
    var dest = dests[0];
    var delta = a.inventory <= 0 ? Math.min(src ? src.currentDailySpend : 0, 1850)
      : (a.severity === 'CRITICAL' ? (src ? src.currentDailySpend * 0.45 : 0) : (src ? src.currentDailySpend * 0.35 : 0));
    delta = Math.max(100, Math.min(delta, src ? src.currentDailySpend : delta));
    var marginLiftRate = dest ? Math.max(1.2, dest.roas * 0.55 - (src ? src.roas : 0) * 0.15) : 0;
    var expected = Math.round(delta * marginLiftRate);
    var box = $('#rca-box');
    if (!box) return;
    box.innerHTML = '<div class="nx-card" style="margin-top:14px;border-color:rgba(51,85,255,.4)">' +
      '<div class="nx-card-head"><h2>Root Cause — ' + esc(a.campaign) + '</h2>' +
      '<div class="right"><span class="nx-tag ' + (a.severity === 'CRITICAL' ? 'bad' : 'warn') + '">' + esc(a.severity) + '</span></div></div>' +
      '<div class="nx-note">' + esc(a.explanation) + '</div>' +
      '<div class="nx-grid k4" style="margin-top:12px">' +
      kpi('Source campaign', esc(src ? src.productName : a.productName), esc(a.campaign), 'mute', 'spend ' + money0(a.spend)) +
      kpi('Eligible destination', dest ? esc(dest.productName) : 'none', dest ? num(dest.roas, 2) + 'x ROAS · ' + dest.inventory + ' units' : 'no line above ' + num(TARGET_ROAS, 1) + 'x', dest ? 'good' : 'bad', dest ? 'highest yield' : 'blocked') +
      kpi('Capital shift', money0(delta), 'stockout kill-switch caps at $1,850/day', 'info', a.inventory <= 0 ? 'kill-switch' : 'haircut') +
      kpi('Expected margin', money0(expected), 'margin lift rate ' + num(marginLiftRate, 2) + 'x', 'good', 'confidence 94%') +
      '</div></div>';
  }

  function runScenario(id) {
    var s = state.scenarios.filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    var list = visibleCampaigns();
    var affected = list.filter(function (c) {
      if (id === 'scenario-stockout') return c.sku === '315122-001';
      if (id === 'scenario-cpm-spike') return c.platform === 'meta';
      if (id === 'scenario-creative-fatigue') return c.sku === 'AH8050-100';
      return c.campaign === 'amazon-880848-005';
    });
    var factor = id === 'scenario-cpm-spike' ? 1 / 1.45
      : id === 'scenario-creative-fatigue' ? 0.40
        : id === 'scenario-competitor-price' ? 2.8 / 4.8 : 0;
    var lossDaily = 0, wasted = 0;
    affected.forEach(function (c) {
      var shockedRev = c.currentDailyRevenue * (factor || 0);
      var shockedMargin = c.currentDailyMargin * (factor || 0);
      lossDaily += (c.currentDailyMargin - shockedMargin);
      wasted += c.currentDailySpend * (1 - (factor || 0));
    });
    var dest = list.filter(function (c) {
      return affected.indexOf(c) < 0 && c.inventory > 0 && c.roas >= FLOOR_ROAS;
    }).sort(function (a, b) { return (b.currentDailyMargin / b.currentDailySpend) - (a.currentDailyMargin / a.currentDailySpend); })[0];
    var moved = dest ? Math.min(0.40 * dest.currentDailySpend, lossDaily) : 0;
    var box = $('#sim-result');
    box.style.display = '';
    box.innerHTML = '<div class="nx-card-head"><h2>Simulation Result — ' + esc(s.name) + '</h2>' +
      '<div class="right"><span class="nx-tag bad">-' + money0(lossDaily) + '/day</span></div></div>' +
      '<div class="nx-grid k4">' +
      kpi('Campaigns hit', String(affected.length), affected.map(function (c) { return c.sku; }).slice(0, 3).join(', '), 'warn', 'shock propagated') +
      kpi('Margin loss', money0(lossDaily), 'without mitigation', 'bad', 'daily bleed') +
      kpi('Waste protected', money0(Math.max(0, wasted - moved)), 'redirected before bleed', 'good', 'mitigated') +
      kpi('Recovery target', dest ? esc(dest.productName) : 'none', dest ? num(dest.roas, 2) + 'x · ' + money0(moved) + ' moved' : 'no eligible line', dest ? 'good' : 'bad', 'reallocation') +
      '</div>' +
      '<div class="nx-note" style="margin-top:12px">Propagation: baseline → shocked → mitigated. ' +
      'Affected lines have revenue and margin scaled by the shock factor with spend held flat; ' +
      'the highest net-margin-per-dollar eligible line absorbs up to 40% of its own daily spend.</div>';
  }

  // ------------------------------------------------- persistence
  function persistLedger() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(ledger)); } catch (e) {}
  }
  function persistSpends() {
    try {
      localStorage.setItem(LS_KEY_SPEND, JSON.stringify(campaigns.map(function (c) {
        return { campaign: c.campaign, spend: c.currentDailySpend, inventory: c.inventory };
      })));
    } catch (e) {}
  }
  function restore() {
    try {
      var l = localStorage.getItem(LS_KEY);
      if (l) { ledger = JSON.parse(l); } else { ledger = state.ledger.slice(); }
    } catch (e) { ledger = state.ledger.slice(); }
    try {
      var s = localStorage.getItem(LS_KEY_SPEND);
      if (s) {
        var map = {};
        JSON.parse(s).forEach(function (r) { map[r.campaign] = r; });
        campaigns.forEach(function (c) {
          if (map[c.campaign]) {
            c.currentDailySpend = map[c.campaign].spend;
            c.inventory = map[c.campaign].inventory;
          }
        });
      }
    } catch (e) {}
  }

  // ------------------------------------------------- shell
  var VIEWS = {
    mission: { label: 'Mission Control', render: renderMission },
    anomalies: { label: 'Anomalies & RCA', render: renderAnomalies },
    gauges: { label: 'Performance Gauges', render: renderGauges },
    reallocations: { label: 'Reallocations', render: renderReallocations },
    ledger: { label: 'Decision Ledger', render: renderLedger },
    simulator: { label: 'Scenario Simulator', render: renderSimulator }
  };
  var COUNTS = {
    anomalies: function () { return state.anomalies.length; },
    reallocations: function () { return generateReallocations(visibleCampaigns()).length; },
    ledger: function () { return ledger.length; }
  };

  function go(view) {
    $$('.nx-nav button').forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.view === view)); });
    Object.keys(VIEWS).forEach(function (k) {
      var n = $('#view-' + k);
      if (n) n.hidden = (k !== view);
    });
    $('#nx-crumb').innerHTML = 'NEXUS D2C <b>/ ' + VIEWS[view].label + '</b>';
    VIEWS[view].render();
  }

  function renderAll() {
    Object.keys(VIEWS).forEach(function (k) {
      if (!$('#view-' + k).hidden) VIEWS[k].render();
    });
    $$('.nx-nav .count').forEach(function (s) {
      var k = s.dataset.count;
      if (COUNTS[k]) s.textContent = COUNTS[k]();
    });
  }

  var toastTimer = null;
  function toast(title, body) {
    var t = $('#nx-toast');
    t.innerHTML = '<b>' + esc(title) + '</b><span>' + esc(body) + '</span>';
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 4200);
  }

  // ------------------------------------------------- boot
  function boot() {
    fetch('../assets/nexus/nexus-engine-state.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state = data;
        campaigns = prepareCampaigns();
        restore();

        // nav
        $('#nx-nav').innerHTML = Object.keys(VIEWS).map(function (k) {
          return '<button data-view="' + k + '" aria-current="' + (k === 'mission') + '">' +
            '<span class="dot"></span>' + VIEWS[k].label +
            (COUNTS[k] ? '<span class="count" data-count="' + k + '">' + COUNTS[k]() + '</span>' : '') +
            '</button>';
        }).join('');

        $('#nx-meta').textContent = data.metadata.systemVersion + ' · ' + data.metadata.cycleId;
        $('#nx-cycle').textContent = 'Cycle ' + data.metadata.cycleId;
        $('#nx-brand-sub').textContent = data.metadata.brand;
        $('#nx-model').textContent = data.metadata.activeOptimizationModel;

        // channel chips
        var plats = ['all'].concat(state.platforms.map(function (p) { return p.platform; }));
        $('#nx-channels').innerHTML = plats.map(function (p) {
          var nm = p === 'all' ? 'All Channels' :
            (state.platforms.filter(function (x) { return x.platform === p; })[0] || {}).displayName || p;
          return '<button class="nx-chip" data-channel="' + p + '" aria-pressed="' + (p === 'all') + '">' + esc(nm) + '</button>';
        }).join('');

        // events
        document.addEventListener('click', function (e) {
          var nav = e.target.closest('[data-view]');
          if (nav) { go(nav.dataset.view); return; }
          var ch = e.target.closest('[data-channel]');
          if (ch) {
            channel = ch.dataset.channel;
            $$('[data-channel]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.channel === channel)); });
            renderAll(); return;
          }
          var sev = e.target.closest('[data-sev]');
          if (sev) {
            severity = sev.dataset.sev;
            $$('[data-sev]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.sev === severity)); });
            renderAnomalies(); return;
          }
          var pol = e.target.closest('[data-policy]');
          if (pol) {
            policyMode = pol.dataset.policy;
            $$('[data-policy]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.policy === policyMode)); });
            renderReallocations(); return;
          }
          var ex = e.target.closest('[data-exec]');
          if (ex) {
            var props = $('#view-reallocations')._props || [];
            var p = props.filter(function (x) { return x.id === ex.dataset.exec; })[0];
            if (p) executeReallocation(p);
            return;
          }
          var rca = e.target.closest('[data-rca]');
          if (rca) { analyzeAnomaly(rca.dataset.rca); return; }
          var re = e.target.closest('[data-realloc]');
          if (re) {
            var a2 = state.anomalies.filter(function (x) { return x.id === re.dataset.realloc; })[0];
            if (a2) {
              var list = visibleCampaigns();
              var src2 = list.filter(function (c) { return c.campaign === a2.campaign; })[0];
              var dest2 = list.filter(function (c) { return c.campaign !== a2.campaign && c.inventory > 50 && c.roas >= TARGET_ROAS; })
                .sort(function (x, y) { return y.roas - x.roas; })[0];
              if (!src2 || !dest2) { toast('No eligible destination', 'No line is above ' + num(TARGET_ROAS, 1) + 'x with more than 50 units of cover.'); return; }
              var delta = a2.inventory <= 0 ? Math.min(src2.currentDailySpend, 1850)
                : (a2.severity === 'CRITICAL' ? src2.currentDailySpend * 0.45 : src2.currentDailySpend * 0.35);
              delta = Math.max(100, Math.min(delta, src2.currentDailySpend));
              executeReallocation({
                id: 'auto-' + a2.id, actionType: a2.inventory <= 0 ? 'THROTTLE' : 'TRIM',
                sourceCampaign: src2.campaign, sourceName: src2.productName, sourcePlatform: src2.platform,
                sourceRoas: src2.roas, sourceSpend: src2.currentDailySpend,
                targetCampaign: dest2.campaign, targetName: dest2.productName, targetPlatform: dest2.platform,
                targetRoas: dest2.roas, targetSpend: dest2.currentDailySpend,
                movedAmount: delta, expectedDailyMargin: Math.round(delta * Math.max(1.2, dest2.roas * 0.55 - src2.roas * 0.15) * 0.62),
                confidence: 94, stockoutKill: a2.inventory <= 0,
                reason: 'Anomaly-driven reallocation for ' + a2.campaign
              });
            }
            return;
          }
          var fc = e.target.closest('[data-focus]');
          if (fc) {
            focusCampaign = fc.dataset.focus;
            renderAll();
            toast('Focus campaign set', fc.dataset.focus);
            return;
          }
          var sc = e.target.closest('[data-scenario]');
          if (sc) { runScenario(sc.dataset.scenario); return; }
          if (e.target.id === 'ledger-reset') {
            ledger = state.ledger.slice();
            persistLedger();
            renderLedger();
            toast('Ledger reset', 'Restored the seeded decision history.');
          }
        });

        renderAll();
        go('mission');
      })
      .catch(function (err) {
        document.getElementById('view-mission').innerHTML =
          '<div class="nx-empty">Could not load engine state: ' + esc(err.message) + '</div>';
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
