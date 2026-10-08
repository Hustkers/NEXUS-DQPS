import {
  INITIAL_PRODUCTS,
  deriveProduct,
  generateReallocations,
  computeFixPlan,
  TARGET_ROAS,
  FLOOR_ROAS,
  formatCurrency,
  type ProductCampaign,
} from './gauges-engine';

/**
 * Unit Test Suite for Gauges Engine & Reallocation Rules:
 * 1. Checks that no money is EVER sent to a below-target or low-stock product.
 * 2. Validates that the net-lift formula holds for every generated row:
 *    netRevenueLift === Math.round(movedAmount * (targetMarginalRoas - sourceRoas))
 * 3. Verifies that all 12 products have varied dailySpend ($800–$4,500/day) and realistic ROAS (1.5x–4.5x).
 * 4. Ensures a stockout product can NEVER look healthy.
 */
export function runGaugesTestSuite() {
  const derived = INITIAL_PRODUCTS.map((p: ProductCampaign) => deriveProduct(p));

  // 1. Spend & ROAS assertions
  const spends = new Set(derived.map((p: ProductCampaign) => p.dailySpend));
  if (spends.size !== derived.length) {
    throw new Error('dailySpend must never be the same value on every card; all cards should have distinct realistic spends.');
  }

  for (const p of derived) {
    if (p.roas < 1.5 || p.roas > 4.5) {
      throw new Error(`ROAS ${p.roas} for ${p.name} violates realistic range 1.5x-4.5x`);
    }
    if (p.dailySpend < 800 || p.dailySpend > 4500) {
      throw new Error(`Daily spend ${p.dailySpend} for ${p.name} violates $800-$4,500/day range`);
    }
  }

  // 2. Stockout health score assertions
  const stockouts = derived.filter((p: ProductCampaign) => p.inventory <= 0);
  if (stockouts.length !== 2) {
    throw new Error(`Expected exactly 2 stockout products, found ${stockouts.length}`);
  }
  for (const s of stockouts) {
    if (s.healthScore >= 25) {
      throw new Error(`Stockout product ${s.name} has health score ${s.healthScore}; a stockout can never exceed 24`);
    }
    if (s.status !== 'stockout') {
      throw new Error(`Stockout product ${s.name} has wrong status ${s.status}`);
    }
  }

  // 3. Reallocation Generation & Mathematical Rule Assertions
  const reallocations = generateReallocations(derived);
  if (reallocations.length === 0) {
    throw new Error('Expected autonomous reallocations to be generated for problem campaigns');
  }

  for (const row of reallocations) {
    const dest = derived.find((p: ProductCampaign) => p.id === row.targetProductId);
    if (!dest) {
      throw new Error(`Destination product ${row.targetProductId} not found`);
    }

    // RULE 1: Never send money to a below-target or low-stock product
    if (dest.roas < TARGET_ROAS) {
      throw new Error(`VIOLATION: Money sent to below-target destination ${dest.name} (${dest.roas}x < 3.2x)`);
    }
    if (dest.coverDays < 21) {
      throw new Error(`VIOLATION: Money sent to destination with insufficient cover ${dest.name} (${dest.coverDays}d < 21d)`);
    }

    // RULE 2: Net Revenue Lift formula check
    // netRevenueLift = Math.round(movedAmount * (targetMarginalRoas - sourceRoas))
    if (row.targetMarginalRoas <= row.sourceRoas) {
      throw new Error(`Marginal ROAS ${row.targetMarginalRoas} does not exceed source ROAS ${row.sourceRoas}`);
    }

    const expectedNetLift = Math.round(row.movedAmount * (row.targetMarginalRoas - row.sourceRoas));
    if (row.netRevenueLift !== expectedNetLift) {
      throw new Error(`Net revenue lift formula violated on row ${row.id}: got ${row.netRevenueLift}, expected ${expectedNetLift}`);
    }

    // RULE 3: Move size within cap (+50% destination cap)
    const maxAllowedDestIncrease = dest.dailySpend * 0.5;
    if (row.movedAmount > maxAllowedDestIncrease) {
      throw new Error(`Moved amount ${row.movedAmount} exceeds +50% destination cap of ${maxAllowedDestIncrease}`);
    }

    // RULE 4: Confidence range 40% - 95%
    if (row.confidence < 40 || row.confidence > 95) {
      throw new Error(`Confidence ${row.confidence}% out of bounds [40, 95] on row ${row.id}`);
    }
  }

  return {
    status: 'PASSED',
    totalProducts: derived.length,
    reallocationsCount: reallocations.length,
    verifiedRules: [
      'Zero money sent to below-target or low-stock destinations',
      'Net revenue lift formula mathematically verified for all rows',
      'Destination increase capped at +50%',
      'Stockouts guaranteed un-healthy (score < 50, critical status)',
      'Distinct realistic spends and ROAS values for all products',
    ],
  };
}
