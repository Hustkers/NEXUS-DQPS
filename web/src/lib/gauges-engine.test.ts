import {
  INITIAL_PRODUCTS,
  deriveProduct,
  generateReallocations,
  buildPlan,
  executeAction,
  TARGET_ROAS,
  FLOOR_ROAS,
  formatINR,
  type ProductModel,
} from './gauges-engine';

/**
 * Acceptance Check Unit Test Suite:
 * 1. buildPlan net-lift formula check
 * 2. "Money never flows to a weaker campaign" (and dest.cover >= 21)
 * 3. Idempotent executeAction (double clicks rejected, failure leaves data unchanged)
 * 4. Stream recompute after each execution (executed row disappears, +50% cap respected, pending count recomputed)
 * 5. Consistent data: ROAS 1.5x-4.5x, spend ₹8,000-45,000 all distinct, positive currency format, stockout score < 50.
 */
export function runGaugesTestSuite() {
  const derived = INITIAL_PRODUCTS.map((p) => deriveProduct(p));

  // ─────────────────────────────────────────────────────────────
  // 1. DATA CONSISTENCY & REALISTIC CONSTRAINTS
  // ─────────────────────────────────────────────────────────────
  const spends = new Set(derived.map((p) => p.dailySpend));
  if (spends.size !== derived.length) {
    throw new Error('dailySpend must never be the same value on every card; all cards must have distinct realistic spends.');
  }

  for (const p of derived) {
    if (p.roas < 1.5 || p.roas > 4.5) {
      throw new Error(`ROAS ${p.roas} for ${p.name} violates realistic range 1.5x-4.5x`);
    }
    if (p.dailySpend < 8000 || p.dailySpend > 45000) {
      throw new Error(`Daily spend ${p.dailySpend} for ${p.name} violates ₹8,000-45,000/day range`);
    }

    const formatted = formatINR(p.dailySpend);
    if (formatted.includes('-')) {
      throw new Error(`Negative currency string generated: ${formatted}`);
    }
  }

  // Stockouts: score < 50 and red status
  const stockouts = derived.filter((p) => p.inventory <= 0);
  if (stockouts.length < 1) {
    throw new Error('Expected stockout products in seed catalog');
  }
  for (const s of stockouts) {
    if (s.healthScore >= 50) {
      throw new Error(`Stockout product ${s.name} has health score ${s.healthScore}; a stockout can never look healthy`);
    }
    if (s.status !== 'stockout') {
      throw new Error(`Stockout product ${s.name} has wrong status ${s.status}`);
    }
    if (!s.footerSummary.startsWith('Sold out ·')) {
      throw new Error(`Stockout product ${s.name} missing 'Sold out ·' footer summary: ${s.footerSummary}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. BUILDPLAN NET-LIFT FORMULA & "NEVER WEAKER CAMPAIGN"
  // ─────────────────────────────────────────────────────────────
  const reallocations = generateReallocations(derived);
  if (reallocations.length === 0) {
    throw new Error('Expected autonomous reallocations to be generated for problem campaigns');
  }

  for (const rec of reallocations) {
    const plan = buildPlan({ products: derived }, rec.id);

    // Assert: Money never flows to a weaker campaign
    if ((plan.targetRoas || 0) < TARGET_ROAS) {
      throw new Error(`VIOLATION: Money sent to below-target destination ${plan.targetProductName} (${plan.targetRoas}x < 3.2x)`);
    }
    if ((plan.targetCoverDays || 0) < 21) {
      throw new Error(`VIOLATION: Money sent to destination with insufficient cover ${plan.targetProductName} (${plan.targetCoverDays}d < 21d)`);
    }
    if ((plan.targetRoas || 0) <= plan.sourceRoas) {
      throw new Error(`VIOLATION: Money sent to weaker destination (${plan.targetRoas}x <= ${plan.sourceRoas}x)`);
    }

    // Assert: Net revenue lift formula: moved * (targetMarginalRoas - sourceRoas)
    const expectedMarginal = Number(((plan.targetRoas || 0) * 0.85).toFixed(3));
    const expectedNetLift = Math.round(plan.movedAmount * (expectedMarginal - plan.sourceRoas));
    if (plan.netRevenueLift !== expectedNetLift) {
      throw new Error(`Net revenue lift formula violated in buildPlan: got ${plan.netRevenueLift}, expected ${expectedNetLift}`);
    }

    // Assert: Cap at +50% of destination spend
    const destCampaign = derived.find((p) => p.id === plan.targetCampaignId);
    if (destCampaign && plan.movedAmount > destCampaign.dailySpend * 0.5) {
      throw new Error(`Moved amount ${plan.movedAmount} exceeds +50% cap for ${destCampaign.name}`);
    }

    // Assert: Confidence within bounds [40, 95]
    if (plan.confidence < 40 || plan.confidence > 95) {
      throw new Error(`Confidence ${plan.confidence}% out of bounds [40, 95]`);
    }
  }

  // Also test buildPlan for FIX action
  const firstProblem = derived.find((p) => p.inventory <= 0 || p.coverDays < 7 || p.roas < TARGET_ROAS);
  if (!firstProblem) {
    throw new Error('Expected at least one problem product for fix');
  }
  const fixPlan = buildPlan({ products: derived }, `fix-${firstProblem.id}`);
  if (!fixPlan.issue || fixPlan.steps.length === 0 || fixPlan.result.length === 0) {
    throw new Error('Fix plan structure incomplete');
  }
  if (fixPlan.evidence.length < 2) {
    throw new Error('Fix plan must have at least 2 evidence bullets');
  }

  // ─────────────────────────────────────────────────────────────
  // 3. IDEMPOTENT EXECUTEACTION & IMMUTABILITY ON FAILURE
  // ─────────────────────────────────────────────────────────────
  const initialCatalog: ProductModel[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  const testActionId = reallocations[0].id;

  // First execution: must succeed
  const executedIds = new Set<string>();
  const firstExec = executeAction(initialCatalog, testActionId, {
    alreadyExecutedIds: executedIds,
  });

  if (!firstExec.updatedProducts || !firstExec.newLedgerEntry || !firstExec.plan) {
    throw new Error('executeAction failed to return updated products or ledger entry');
  }
  executedIds.add(testActionId);

  // Second execution with same actionId: must reject (idempotency check 1)
  let rejectedOnDuplicate = false;
  try {
    executeAction(firstExec.updatedProducts, testActionId, {
      alreadyExecutedIds: executedIds,
    });
  } catch {
    rejectedOnDuplicate = true;
  }
  if (!rejectedOnDuplicate) {
    throw new Error('VIOLATION: executeAction allowed duplicate execution of the same action ID');
  }

  // Executing on an already fixed campaign: must reject (idempotency check 2)
  let rejectedOnAlreadyFixed = false;
  try {
    executeAction(firstExec.updatedProducts, `fix-${firstExec.plan.sourceCampaignId}`, {
      alreadyExecutedIds: new Set(),
    });
  } catch {
    rejectedOnAlreadyFixed = true;
  }
  if (!rejectedOnAlreadyFixed) {
    throw new Error('VIOLATION: executeAction allowed execution on an already fixed campaign');
  }

  // Verify that an invalid execution leaves state completely unchanged
  const beforeBadExec = JSON.stringify(firstExec.updatedProducts);
  try {
    executeAction(firstExec.updatedProducts, 'invalid-action-id-999');
  } catch {
    // Expected to fail
  }
  const afterBadExec = JSON.stringify(firstExec.updatedProducts);
  if (beforeBadExec !== afterBadExec) {
    throw new Error('VIOLATION: Failed execution mutated the catalog state');
  }

  // ─────────────────────────────────────────────────────────────
  // 4. STREAM RECOMPUTE AFTER EXECUTION
  // ─────────────────────────────────────────────────────────────
  const remainingDerived = firstExec.updatedProducts.map((p) => deriveProduct(p));
  const remainingReallocations = generateReallocations(remainingDerived);

  // Executed row must disappear
  const executedRowPresent = remainingReallocations.some((r) => r.id === testActionId);
  if (executedRowPresent) {
    throw new Error('VIOLATION: Executed reallocation row still appears in recommendations');
  }

  // Pending count must decrease or reflect recomputed state
  if (remainingReallocations.length >= reallocations.length) {
    throw new Error(`VIOLATION: Reallocation count did not decrease (before: ${reallocations.length}, after: ${remainingReallocations.length})`);
  }

  // Verify destination cap (+50% cap enforcement)
  const destInFirstExec = firstExec.updatedProducts.find((p) => p.id === firstExec.plan.targetCampaignId);
  if (destInFirstExec) {
    const maxCap = destInFirstExec.dailySpend * 0.5;
    const addedSoFar = destInFirstExec.addedSpendFromReallocations || 0;
    if (addedSoFar > maxCap + 1) {
      throw new Error(`Destination ${destInFirstExec.name} exceeded +50% cap: added ${addedSoFar} vs max ${maxCap}`);
    }
  }

  return {
    status: 'PASSED',
    totalVerified: [
      'buildPlan net-lift formula mathematically verified',
      'Money never flows to a weaker or low-stock campaign',
      'executeAction is strictly idempotent and rejects duplicates',
      'State remains 100% unchanged upon failed action execution',
      'Stream recomputes dynamically and executed recommendations disappear',
      'Destination +50% budget addition cap strictly enforced',
      'Realistic seed catalog: 1.5x-4.5x ROAS, ₹8,000-45,000 distinct spend, positive currency formatting',
    ],
  };
}

// Auto-run if executed directly via node or tsx
if (typeof require !== 'undefined' && require.main === module) {
  const result = runGaugesTestSuite();
  console.log(JSON.stringify(result, null, 2));
}
