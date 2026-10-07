import {
  simulateBudgetDiminishingReturns,
  runWhatIfScenario
} from './strategy-engine/prediction-engine';
import { evaluateStrategy } from './strategy-engine/evaluator';
import { rankAndEvaluateAll } from './strategy-engine/ranker';
import { generateStrategies } from './strategy-engine/generator';
import type { CampaignConfig, CampaignStrategy } from './strategy-engine/types';
import {
  optimizeAutonomousBudget,
  computeHillRevenue,
  computeMarginalProfitHeadroom,
  DEFAULT_WHAT_IF_INPUTS
} from './autonomous-learning/optimizer-engine';
import {
  deriveProduct,
  generateReallocations,
  TARGET_ROAS,
  type ProductModel
} from './gauges-engine';
import { runDeterministicSimulation } from '../features/decision-engine/lib/simulation-engine';
import { computePlaygroundRecommendations } from '../features/decision-engine/lib/ad-playground-engine';

export function runDecisionEngineAuditTestSuite() {
  console.log('\n=== RUNNING DECISION ENGINE AUDIT REGRESSION TESTS ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (!condition) {
      console.error(`❌ FAILED: ${testName} ${detail ? `(${detail})` : ''}`);
      throw new Error(`Test failed: ${testName} ${detail ? `- ${detail}` : ''}`);
    } else {
      console.log(`✅ PASSED: ${testName}`);
      passed++;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. TEST: Zero & Negative Budget Edge Cases
  // ─────────────────────────────────────────────────────────────
  {
    const zeroRes = simulateBudgetDiminishingReturns(50000, 0, 3.5, 420, 2850, 62.0);
    assert(zeroRes.spend === 0, 'Zero budget spend is 0');
    assert(zeroRes.revenue === 0, 'Zero budget revenue is 0');
    assert(zeroRes.conversions === 0, 'Zero budget conversions is 0');
    assert(zeroRes.roas === 0, 'Zero budget ROAS is 0');
    assert(zeroRes.netProfit === 0, 'Zero budget net profit is 0');
    assert(!isNaN(zeroRes.marginalRoas), 'Zero budget marginalRoas is not NaN');
    assert(!zeroRes.isProfitable, 'Zero budget is not profitable');

    const negRes = simulateBudgetDiminishingReturns(50000, -500, 3.5, 420, 2850, 62.0);
    assert(negRes.spend === 0, 'Negative budget spend clamped to 0');
    assert(!isNaN(negRes.netProfit), 'Negative budget net profit is not NaN');
  }

  // ─────────────────────────────────────────────────────────────
  // 2. TEST: Profit Calculation Consistency
  // ─────────────────────────────────────────────────────────────
  {
    const spend = 40000;
    const baseBudget = 30000;
    const marginPct = 65.0;
    const sim = simulateBudgetDiminishingReturns(baseBudget, spend, 3.8, 380, 4250, marginPct);

    const expectedGrossProfit = Math.round(sim.revenue * (marginPct / 100));
    const expectedNetProfit = Math.round(expectedGrossProfit - spend);

    assert(sim.grossProfit === expectedGrossProfit, 'grossProfit matches revenue * marginPct');
    assert(sim.netProfit === expectedNetProfit, 'netProfit matches grossProfit - spend');
    assert(sim.profitRoas === +(expectedGrossProfit / spend).toFixed(2), 'profitRoas matches grossProfit / spend');
  }

  // ─────────────────────────────────────────────────────────────
  // 3. TEST: Marginal Return (MROAS & Marginal Profit)
  // ─────────────────────────────────────────────────────────────
  {
    const baseB = 25000;
    const testSpend = 30000;
    const sim = simulateBudgetDiminishingReturns(baseB, testSpend, 4.0, 350, 3000, 60.0);

    // MROAS must be strictly less than average ROAS in diminishing returns zone
    assert(sim.marginalRoas < sim.roas, 'Diminishing returns: Marginal ROAS is less than average ROAS');
    assert(!isNaN(sim.marginalRoas) && !isNaN(sim.marginalProfit), 'Marginal return values are valid numbers');

    // Optimizer headroom test
    const dHeadroom = computeMarginalProfitHeadroom(100000, 2800000, 1.15, 350000, 60.0, 1.0, 1000);
    assert(!isNaN(dHeadroom), 'Optimizer marginal headroom is valid number');
  }

  // ─────────────────────────────────────────────────────────────
  // 4. TEST: Very High Budget (Saturation Zone)
  // ─────────────────────────────────────────────────────────────
  {
    const hugeSpend = 200000;
    const sim = simulateBudgetDiminishingReturns(25000, hugeSpend, 4.0, 350, 3000, 60.0);
    assert(sim.isDiminishingZone === true, 'Very high budget is flagged in diminishing zone');
    assert(sim.efficiencyIndex < 80, 'Efficiency index drops significantly under over-saturation');
  }

  // ─────────────────────────────────────────────────────────────
  // 5. TEST: "Best Negative Profit" Problem & Defensive Floor
  // ─────────────────────────────────────────────────────────────
  {
    const unprofitableConfig: CampaignConfig = {
      campaignId: 'cmp-unprofitable-test',
      campaignName: 'Deep Loss Campaign',
      productService: 'Budget Socks',
      targetAudience: 'Broad audience',
      targetLocation: 'National',
      industryCategory: 'Apparel',
      totalBudget: 80000,
      campaignDuration: 30,
      objective: 'CONVERSIONS',
      preferredPlatforms: ['tiktok'], // Lower CVR, high loss
      productPrice: 200, // Very low AOV -> CPA exceeds price
      constraints: {
        grossMarginPct: 20 // Tiny gross margin -> guaranteed net deficit
      }
    };

    const strats = generateStrategies(unprofitableConfig);
    const { ranked, top3, bestChoice } = rankAndEvaluateAll(strats, unprofitableConfig);

    // If all strategies are unprofitable, NO strategy can be marked 'SELECTED' as a positive recommendation!
    const allNegative = ranked.every((s) => !s.evaluation?.isProfitable);
    if (allNegative) {
      assert(
        bestChoice.classification === 'NO_PROFITABLE_CONFIGURATION',
        'Unprofitable scenario: bestChoice classified as NO_PROFITABLE_CONFIGURATION'
      );
      assert(
        bestChoice.decisionState === 'NO_PROFITABLE_CONFIGURATION',
        'Unprofitable scenario: decisionState is NO_PROFITABLE_CONFIGURATION'
      );
      assert(
        bestChoice.recommendedAction === 'REDUCE_SPEND',
        'Unprofitable scenario: recommendedAction is REDUCE_SPEND'
      );
      assert(
        top3[0].evaluation?.status === 'DEFENSIVE_FLOOR',
        'Unprofitable scenario: Top ranked strategy status is DEFENSIVE_FLOOR'
      );
      assert(
        !bestChoice.answers.whatAreWeRecommending.includes('We recommend executing'),
        'Unprofitable scenario does NOT tell user to execute/scale'
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 6. TEST: Inventory Critical State & Missing Inventory
  // ─────────────────────────────────────────────────────────────
  {
    // A product with missing inventory (null/undefined/NaN) MUST NOT be treated as healthy!
    const missingInvProduct: ProductModel = {
      id: 'prod-missing-inv',
      name: 'Missing Inventory SKU',
      channel: 'Meta',
      inventory: (undefined as unknown as number),
      dailyUnitsSold: 12,
      dailySpend: 15000,
      roas: 3.8,
      cpc: 8.5,
      cvr: 0.03
    };

    const derived = deriveProduct(missingInvProduct);
    assert(derived.status === 'stockout', 'Missing inventory product is categorized as stockout');
    assert(derived.healthScore < 50, 'Missing inventory product health score is clamped < 50');

    // A product with 0 inventory
    const zeroInvProduct: ProductModel = {
      id: 'prod-zero-inv',
      name: 'Zero Inventory SKU',
      channel: 'Google',
      inventory: 0,
      dailyUnitsSold: 10,
      dailySpend: 20000,
      roas: 4.2,
      cpc: 7.2,
      cvr: 0.04
    };
    const derivedZero = deriveProduct(zeroInvProduct);
    assert(derivedZero.status === 'stockout', 'Zero inventory product is stockout');
    assert(derivedZero.healthScore < 50, 'Zero inventory health score < 50');
  }

  // ─────────────────────────────────────────────────────────────
  // 7. TEST: Budget Reallocation Constraints
  // ─────────────────────────────────────────────────────────────
  {
    const healthyCatalog: ProductModel[] = [
      {
        id: 'p-source-bad',
        name: 'Struggling SKU',
        channel: 'Meta',
        inventory: 100,
        dailyUnitsSold: 5,
        dailySpend: 20000,
        roas: 1.8,
        cpc: 12.0,
        cvr: 0.02
      },
      {
        id: 'p-dest-good',
        name: 'High Yield SKU',
        channel: 'Meta',
        inventory: 500,
        dailyUnitsSold: 15,
        dailySpend: 25000,
        roas: 3.9,
        cpc: 8.0,
        cvr: 0.04
      }
    ];

    const derivedProducts = healthyCatalog.map((p) => deriveProduct(p));
    const reallocs = generateReallocations(derivedProducts);

    assert(reallocs.length > 0, 'Reallocations generated for struggling SKU');
    const first = reallocs[0];
    assert(first.sourceProductName === 'Struggling SKU', 'Reallocation source product is struggling SKU');
    assert(first.targetProductName === 'High Yield SKU', 'Reallocation target product is high yield SKU');
    assert((first.predictedRoas ?? 0) > 1.8, 'Target predicted ROAS is higher than source');
    assert(first.netRevenueLift > 0, 'Net revenue lift is strictly positive');
  }

  // ─────────────────────────────────────────────────────────────
  // 8. TEST: Deterministic Monte Carlo Reproducibility
  // ─────────────────────────────────────────────────────────────
  {
    const inputs1 = { ...DEFAULT_WHAT_IF_INPUTS, totalBudget: 1200000, cpcShiftPct: 15 };
    const inputs2 = { ...DEFAULT_WHAT_IF_INPUTS, totalBudget: 1200000, cpcShiftPct: 15 };

    const optResult1 = optimizeAutonomousBudget(inputs1);
    const optResult2 = optimizeAutonomousBudget(inputs2);

    assert(
      optResult1.validationDecision.stressTestResult === optResult2.validationDecision.stressTestResult,
      'Monte Carlo stress test produces 100% identical results for identical inputs'
    );
    assert(
      optResult1.totalRecommendedBudget === optResult2.totalRecommendedBudget,
      'Recommended budget is 100% deterministic'
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 9. TEST: Ad Playground Decision Engine Consistency
  // ─────────────────────────────────────────────────────────────
  {
    // Test in-stock SKU: 849559-004 (454 units inventory)
    const playgroundRes = computePlaygroundRecommendations({
      sku: '849559-004',
      daily_budget: 3500,
      duration_days: 14,
      target_roas_floor: 2.0,
      platforms: ['meta', 'google'],
      strategy_focus: 'BALANCED',
      audience: 'broad',
      creative: 'static_image',
      placement: 'feed'
    });

    assert(playgroundRes.candidates.length > 0, 'Playground generates candidate configurations');
    assert(playgroundRes.optimal_daily_spend > 0, 'Playground computes positive optimal daily spend for in-stock SKU');
    assert(playgroundRes.curve_points.length === 31, 'Playground computes full response curve (31 points)');
    assert(
      playgroundRes.candidates[0].predicted_net_profit >= playgroundRes.candidates[1].predicted_net_profit,
      'Playground candidates sorted strictly by net profit descending'
    );

    // Test stockout SKU: 315122-001 (0 units in state json)
    const stockoutRes = computePlaygroundRecommendations({
      sku: '315122-001',
      daily_budget: 3500,
      duration_days: 14,
      target_roas_floor: 2.0,
      strategy_focus: 'BALANCED'
    });
    assert(stockoutRes.candidates[0].stockout_risk === true, 'Stockout SKU flags stockout_risk');
    assert(stockoutRes.candidates[0].is_recommended === false, 'Stockout SKU is never recommended');
    assert(stockoutRes.data_quality_warning !== undefined, 'Stockout SKU emits data_quality_warning');
  }

  // ─────────────────────────────────────────────────────────────
  // 10. TEST: Deterministic Shock Simulation
  // ─────────────────────────────────────────────────────────────
  {
    const sim1 = runDeterministicSimulation('stockout', {
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
    }, 'redirect-spend');

    const sim2 = runDeterministicSimulation('stockout', {
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
    }, 'redirect-spend');

    assert(
      sim1.financialImpact.lossAvoided === sim2.financialImpact.lossAvoided,
      'Shock simulation financial impact is 100% identical'
    );
    assert(
      sim1.timeSeries.length === sim2.timeSeries.length,
      'Shock simulation time series length is identical'
    );
  }

  console.log(`\n🎉 ALL ${passed}/${total} AUDIT REGRESSION TESTS PASSED CLEANLY!\n`);
  return { passed, total };
}

// Auto-run if executed directly via node --experimental-strip-types
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('decision-engine-audit.test')) {
  try {
    runDecisionEngineAuditTestSuite();
  } catch (err) {
    console.error('Test suite failed:', err);
    process.exit(1);
  }
}
