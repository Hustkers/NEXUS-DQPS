/**
 * Shock Analysis — deterministic scenario shock evaluation engine.
 *
 * Every value produced by `computeShockAnalysis` is derived from the pristine
 * `nexus-engine-state.json` baseline plus the scenario definition itself.
 * No randomness, no time dependence, no hardcoded loss figures: the same
 * scenario evaluated against the same baseline always yields identical output.
 *
 * Formulas (see DATA LINEAGE section of the panel for the runtime audit trail):
 *   moved      = round2(shiftPct × target.spend)          shiftPct = metadata "40%"
 *   recovered  = moved × (target.margin ÷ target.spend)
 *   cut        = PAUSE_ALL: Σ affected shocked spend
 *                FUND_SHIFT: worst-yield affected first, each ≤ shiftPct × its shocked spend
 *   held       = cut − moved
 *   lossDaily  = baselineNet − shockedNet                 net = margin − spend, scope = affected ∪ target
 *   avoided    = lossDaily − (baselineNet − mitigatedNet)
 *   wasted     = Σ affected spend × (1 − revenue′ ÷ revenue)
 *   confidence = min(99, round(60 + 40 × lossDaily ÷ Σ affected baseline margin))
 */

import initialEngineState from '@/data/nexus-engine-state.json';
import {
  SHOCK_SCENARIO_IDS,
  type ShockAnalysis,
  type ShockCampaignRow,
  type ShockCausalNode,
  type ShockLineageRow,
  type ShockLossFigure,
  type ShockMitigationStep,
  type ShockScopePoint,
  type ShockScenarioId,
  type ShockSeverityTone
} from '../types/shock-analysis';

type RawCampaign = (typeof initialEngineState.campaigns)[number];
type RawScenario = (typeof initialEngineState.scenarios)[number];

const CAMPAIGNS: readonly RawCampaign[] = initialEngineState.campaigns;
const SCENARIOS: readonly RawScenario[] = initialEngineState.scenarios;

/** Engine constraints parsed from baseline metadata ("40%" → 0.4, "1.80x" → 1.8). */
const MAX_SHIFT_PCT =
  parseFloat(initialEngineState.metadata.constraints.maxBudgetShiftPerCycle) / 100;
const BREAKEVEN_FLOOR = parseFloat(initialEngineState.metadata.constraints.breakevenRoasFloor);

export const CONFIDENCE_RULE =
  'min(99, round(60 + 40 × dailyLoss ÷ affectedBaselineMargin)) — deterministic rule over baseline margin exposure';

// ---------------------------------------------------------------------------
// Scenario configuration: affected predicate, transform, mitigation policy
// ---------------------------------------------------------------------------

type ShockTransform = { kind: 'zero' } | { kind: 'scale'; factor: number };

interface ShockScenarioConfig {
  affected: (campaign: RawCampaign) => boolean;
  transform: ShockTransform;
  sourcePolicy: 'PAUSE_ALL' | 'FUND_SHIFT';
  /** Platform whitelist for the mitigation target; empty = any platform. */
  targetPlatforms: readonly string[];
  /** Short human label of the metric transform (causal-chain copy). */
  transformLabel: string;
}

const SHOCK_CONFIGS: Record<ShockScenarioId, ShockScenarioConfig> = {
  'scenario-stockout': {
    affected: (campaign) => campaign.sku === '315122-001',
    transform: { kind: 'zero' },
    sourcePolicy: 'PAUSE_ALL',
    targetPlatforms: ['google'],
    transformLabel: 'revenue & margin zeroed, inventory → 0'
  },
  'scenario-cpm-spike': {
    affected: (campaign) => campaign.platform === 'meta',
    transform: { kind: 'scale', factor: 1 / 1.45 },
    sourcePolicy: 'FUND_SHIFT',
    targetPlatforms: ['amazon', 'google'],
    transformLabel: 'revenue & margin ÷ 1.45 (CPM +45%)'
  },
  'scenario-creative-fatigue': {
    affected: (campaign) => campaign.campaign === 'tiktok-AH8050-100',
    transform: { kind: 'scale', factor: 0.4 },
    sourcePolicy: 'PAUSE_ALL',
    targetPlatforms: ['meta'],
    transformLabel: 'revenue & margin × 0.40 (CTR −60%)'
  },
  'scenario-competitor-price': {
    affected: (campaign) => campaign.campaign === 'amazon-880848-005',
    transform: { kind: 'scale', factor: 2.8 / 4.8 },
    sourcePolicy: 'FUND_SHIFT',
    targetPlatforms: ['google'],
    transformLabel: 'revenue & margin × 0.583 (CVR 4.8% → 2.8%)'
  }
};

export function isShockScenarioId(value: string): value is ShockScenarioId {
  return (SHOCK_SCENARIO_IDS as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Numeric helpers — locale-independent, fully deterministic
// ---------------------------------------------------------------------------

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function safeRoas(revenue: number, spend: number): number {
  return spend > 0 ? revenue / spend : 0;
}

function groupDigits(whole: string): string {
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

import { formatCurrency as libFormatCurrency, formatINR as libFormatINR } from '@/lib/format';

export function formatUSD(value: number): string {
  return libFormatCurrency(value, { decimals: 2 });
}

export const formatInr = libFormatINR;
export const formatCurrency = formatUSD;

// ---------------------------------------------------------------------------
// Three-state campaign model: baseline → shocked → mitigated
// ---------------------------------------------------------------------------

interface CampaignState {
  revenue: number;
  margin: number;
  spend: number;
  inventory: number;
}

interface AffectedRecord {
  campaign: RawCampaign;
  shocked: CampaignState;
}

function baselineState(campaign: RawCampaign): CampaignState {
  return {
    revenue: campaign.currentDailyRevenue,
    margin: campaign.currentDailyMargin,
    spend: campaign.currentDailySpend,
    inventory: campaign.inventory
  };
}

function shockedState(campaign: RawCampaign, config: ShockScenarioConfig): CampaignState {
  const baseline = baselineState(campaign);
  if (!config.affected(campaign)) return baseline;
  if (config.transform.kind === 'zero') {
    return { revenue: 0, margin: 0, spend: baseline.spend, inventory: 0 };
  }
  return {
    revenue: baseline.revenue * config.transform.factor,
    margin: baseline.margin * config.transform.factor,
    spend: baseline.spend,
    inventory: baseline.inventory
  };
}

function shockedYield(state: CampaignState): number {
  return state.spend > 0 ? state.margin / state.spend : Number.NEGATIVE_INFINITY;
}

// ---------------------------------------------------------------------------
// Target selection & capital plan
// ---------------------------------------------------------------------------

interface TargetSelection {
  target: RawCampaign;
  targetYield: number;
  eligibleCount: number;
}

function selectTarget(
  affectedNames: ReadonlySet<string>,
  config: ShockScenarioConfig
): TargetSelection {
  let target: RawCampaign | null = null;
  let targetYield = Number.NEGATIVE_INFINITY;
  let eligibleCount = 0;

  for (const campaign of CAMPAIGNS) {
    if (affectedNames.has(campaign.campaign)) continue;
    if (config.targetPlatforms.length > 0 && !config.targetPlatforms.includes(campaign.platform)) {
      continue;
    }
    if (campaign.inventory <= 0) continue;
    if (campaign.roas < BREAKEVEN_FLOOR) continue;
    eligibleCount += 1;
    const yieldValue =
      campaign.currentDailySpend > 0
        ? campaign.currentDailyMargin / campaign.currentDailySpend
        : Number.NEGATIVE_INFINITY;
    if (yieldValue > targetYield) {
      targetYield = yieldValue;
      target = campaign;
    }
  }

  if (!target) {
    throw new Error('Shock analysis: no eligible mitigation target in baseline data.');
  }
  return { target, targetYield, eligibleCount };
}

interface CapitalPlan {
  movedDaily: number;
  recoveredDailyMargin: number;
  sourceSpendCutDaily: number;
  heldDaily: number;
  /** FUND_SHIFT trims: campaign name → $/day cut. */
  cutByCampaign: ReadonlyMap<string, number>;
  /** Worst-yield source trimmed first (FUND_SHIFT narrative). */
  primarySource: RawCampaign | null;
}

function planCapital(
  config: ShockScenarioConfig,
  affectedRecords: readonly AffectedRecord[],
  target: RawCampaign,
  targetYield: number
): CapitalPlan {
  const movedPlanned = round2(MAX_SHIFT_PCT * target.currentDailySpend);

  if (config.sourcePolicy === 'PAUSE_ALL') {
    let cutTotal = 0;
    for (const record of affectedRecords) {
      cutTotal += record.shocked.spend;
    }
    const sourceSpendCutDaily = round2(cutTotal);
    return {
      movedDaily: movedPlanned,
      recoveredDailyMargin: movedPlanned * targetYield,
      sourceSpendCutDaily,
      heldDaily: round2(sourceSpendCutDaily - movedPlanned),
      cutByCampaign: new Map(),
      primarySource: null
    };
  }

  // FUND_SHIFT: trim worst shocked-yield sources first, each ≤ shiftPct of its own spend.
  const worstFirst = affectedRecords.toSorted(
    (a, b) => shockedYield(a.shocked) - shockedYield(b.shocked)
  );
  const cutByCampaign = new Map<string, number>();
  let remaining = movedPlanned;
  let sourceSpendCutDaily = 0;
  let primarySource: RawCampaign | null = null;

  for (const record of worstFirst) {
    if (remaining <= 0) break;
    const take = Math.min(MAX_SHIFT_PCT * record.shocked.spend, remaining);
    if (take <= 0) continue;
    cutByCampaign.set(record.campaign.campaign, take);
    sourceSpendCutDaily += take;
    remaining -= take;
    if (!primarySource) primarySource = record.campaign;
  }

  const movedDaily = round2(movedPlanned - remaining);
  const cutTotal = round2(sourceSpendCutDaily);
  return {
    movedDaily,
    recoveredDailyMargin: movedDaily * targetYield,
    sourceSpendCutDaily: cutTotal,
    heldDaily: round2(cutTotal - movedDaily),
    cutByCampaign,
    primarySource
  };
}

function buildMitigatedStates(
  config: ShockScenarioConfig,
  affectedRecords: readonly AffectedRecord[],
  plan: CapitalPlan,
  target: RawCampaign
): Map<string, CampaignState> {
  const mitigated = new Map<string, CampaignState>();

  for (const record of affectedRecords) {
    if (config.sourcePolicy === 'PAUSE_ALL') {
      mitigated.set(record.campaign.campaign, { revenue: 0, margin: 0, spend: 0, inventory: 0 });
      continue;
    }
    const cut = plan.cutByCampaign.get(record.campaign.campaign) ?? 0;
    mitigated.set(record.campaign.campaign, {
      ...record.shocked,
      spend: record.shocked.spend - cut
    });
  }

  // Target gains the moved capital at its baseline yield (target is never shocked).
  const targetState = baselineState(target);
  mitigated.set(target.campaign, {
    revenue: targetState.revenue + plan.movedDaily * (targetState.revenue / targetState.spend),
    margin: targetState.margin + plan.recoveredDailyMargin,
    spend: targetState.spend + plan.movedDaily,
    inventory: targetState.inventory
  });

  return mitigated;
}

// ---------------------------------------------------------------------------
// Scope aggregation, scenario lookup, figures
// ---------------------------------------------------------------------------

interface ScopeAggregate {
  revenue: number;
  margin: number;
  spend: number;
  roas: number;
  net: number;
}

function aggregateStates(states: readonly CampaignState[]): ScopeAggregate {
  let revenue = 0;
  let margin = 0;
  let spend = 0;
  for (const state of states) {
    revenue += state.revenue;
    margin += state.margin;
    spend += state.spend;
  }
  return { revenue, margin, spend, roas: safeRoas(revenue, spend), net: margin - spend };
}

function stateOf(states: ReadonlyMap<string, CampaignState>, campaign: string): CampaignState {
  const state = states.get(campaign);
  if (!state) throw new Error(`Shock analysis: missing state for campaign ${campaign}.`);
  return state;
}

function findScenario(scenarioId: ShockScenarioId): RawScenario {
  const scenario = SCENARIOS.find((entry) => entry.id === scenarioId);
  if (!scenario) throw new Error(`Shock analysis: scenario ${scenarioId} missing from baseline data.`);
  return scenario;
}

function severityToneOf(severity: string): ShockSeverityTone {
  if (severity === 'CRITICAL') return 'critical';
  if (severity === 'HIGH') return 'high';
  return 'medium';
}

function toFigure(daily: number): ShockLossFigure {
  const rounded = round2(daily);
  return { daily: rounded, weekly: round2(rounded * 7), monthly: round2(rounded * 30) };
}

// ---------------------------------------------------------------------------
// Narrative: mitigation steps, causal chain, data lineage (all interpolated)
// ---------------------------------------------------------------------------

interface NarrativeContext {
  scenario: RawScenario;
  config: ShockScenarioConfig;
  affectedRecords: readonly AffectedRecord[];
  target: RawCampaign;
  targetYield: number;
  eligibleCount: number;
  plan: CapitalPlan;
  lossDaily: number;
  lossWithMitigationDaily: number;
  avoidedDaily: number;
  wastedSpendDaily: number;
  confidencePct: number;
  minShockedRoas: number;
  breachesFloor: boolean;
  baselineNet: number;
  shockedNet: number;
  mitigatedNet: number;
  affectedBaselineMargin: number;
}

function affectedLabel(ctx: NarrativeContext): string {
  const first = ctx.affectedRecords[0];
  if (ctx.affectedRecords.length === 1 && first) return first.campaign.campaign;
  return `${ctx.affectedRecords.length} campaigns`;
}

function primarySourceRef(ctx: NarrativeContext): string {
  const source = ctx.plan.primarySource;
  if (!source) return 'worst-yield sources';
  const sourceYield = shockedYield(shockedState(source, ctx.config));
  return `${source.campaign} (lowest shocked yield ${sourceYield.toFixed(2)}x)`;
}

function buildMitigationSteps(ctx: NarrativeContext): ShockMitigationStep[] {
  const { plan, target, targetYield } = ctx;
  const label = affectedLabel(ctx);
  const moved = formatInr(plan.movedDaily);
  const held = formatInr(plan.heldDaily);
  const recovered = formatInr(plan.recoveredDailyMargin);
  const avoided = formatInr(ctx.avoidedDaily);
  const targetRef = `${target.campaign} (${targetYield.toFixed(2)}x yield)`;
  const affectedSpend = ctx.affectedRecords[0]
    ? formatInr(ctx.affectedRecords[0].campaign.currentDailySpend)
    : formatInr(0);

  switch (ctx.scenario.id) {
    case 'scenario-stockout':
      return [
        {
          tone: 'risk',
          title: 'Kill-switch: inventory at zero',
          detail: `SKU 315122-001 hit the 0-unit floor — ${label} keeps spending ${affectedSpend}/day driving traffic to an empty product page.`
        },
        {
          tone: 'neutral',
          title: 'Cycle cap constrains the shift',
          detail: `${moved}/day redeployed this cycle (40% of ${target.campaign} capacity); ${held}/day held until the next cycle.`
        },
        {
          tone: 'good',
          title: 'Redeploy to highest-yield survivor',
          detail: `${moved}/day → ${targetRef} recovers ${recovered}/day gross margin.`
        },
        {
          tone: 'good',
          title: 'Loss contained',
          detail: `Avoids ${avoided}/day (${formatInr(ctx.avoidedDaily * 7)}/week) versus the unmitigated path.`
        }
      ];
    case 'scenario-cpm-spike':
      return [
        {
          tone: 'risk',
          title: 'Auction inflation compresses margin',
          detail: `Meta CPM +45% divides revenue and margin by 1.45 across ${ctx.affectedRecords.length} campaigns — ${formatInr(ctx.lossDaily)}/day at stake.`
        },
        {
          tone: 'neutral',
          title: 'Trim the worst-yield source',
          detail: `Pull ${moved}/day from ${primarySourceRef(ctx)} under the 40% per-cycle cap.`
        },
        {
          tone: 'good',
          title: 'Redeploy outside Meta',
          detail: `${moved}/day → ${targetRef} recovers ${recovered}/day gross margin.`
        },
        {
          tone: 'good',
          title: 'Loss contained',
          detail: `Avoids ${avoided}/day versus the unmitigated path.`
        }
      ];
    case 'scenario-creative-fatigue':
      return [
        {
          tone: 'risk',
          title: 'CTR collapse on the hero creative',
          detail: `CTR −60% on ${label}: revenue and margin ×0.40 while spend stays flat — ${formatInr(ctx.lossDaily)}/day bleed, ${formatInr(ctx.wastedSpendDaily)}/day wasted spend.`
        },
        {
          tone: 'risk',
          title: 'Auto-pause the exhausted ad set',
          detail: `Pausing ${label} halts ${formatInr(plan.sourceSpendCutDaily)}/day of underperforming spend.`
        },
        {
          tone: 'neutral',
          title: 'Cap-constrained shift',
          detail: `${held} held; ${moved} shifted under the 40% target cap.`
        },
        {
          tone: 'good',
          title: 'Redeploy to high-vitality Meta',
          detail: `${moved}/day → ${targetRef} recovers ${recovered}/day; avoids ${avoided}/day.`
        }
      ];
    case 'scenario-competitor-price':
      return [
        {
          tone: 'risk',
          title: 'Buy-box undercut destroys CVR',
          detail: `Conversion rate falls 4.8% → 2.8% (×0.583) on ${label} — ${formatInr(ctx.lossDaily)}/day margin loss.`
        },
        {
          tone: 'neutral',
          title: 'Trim and reroute',
          detail: `Pull ${moved}/day (≤40% of its ${affectedSpend}/day spend) from ${label}.`
        },
        {
          tone: 'good',
          title: 'Redeploy to Google Shopping',
          detail: `${moved}/day → ${targetRef} recovers ${recovered}/day gross margin.`
        },
        {
          tone: 'good',
          title: 'Loss contained',
          detail: `Avoids ${avoided}/day (${formatInr(ctx.avoidedDaily * 7)}/week) versus the unmitigated path.`
        }
      ];
    default:
      throw new Error(`Shock analysis: unsupported scenario ${String(ctx.scenario.id)}.`);
  }
}

function buildCausalChain(ctx: NarrativeContext): ShockCausalNode[] {
  const mitigationDetail =
    ctx.config.sourcePolicy === 'PAUSE_ALL'
      ? `PAUSE_ALL: pause ${affectedLabel(ctx)} (−${formatInr(ctx.plan.sourceSpendCutDaily)}/day), hold ${formatInr(ctx.plan.heldDaily)}/day, redeploy ${formatInr(ctx.plan.movedDaily)}/day → ${ctx.target.campaign}.`
      : `FUND_SHIFT: trim ${formatInr(ctx.plan.sourceSpendCutDaily)}/day from ${primarySourceRef(ctx)}, redeploy ${formatInr(ctx.plan.movedDaily)}/day → ${ctx.target.campaign}.`;

  return [
    {
      step: 1,
      tone: 'risk',
      title: 'Shock Injected',
      detail: ctx.scenario.injectedEvent
    },
    {
      step: 2,
      tone: 'warn',
      title: 'Metric Collapse',
      detail: `${ctx.affectedRecords.length} campaign(s) hit — ${ctx.config.transformLabel}; daily margin −${formatInr(ctx.lossDaily)}.`
    },
    {
      step: 3,
      tone: ctx.breachesFloor ? 'risk' : 'warn',
      title: 'Break-even Floor Check',
      detail: ctx.breachesFloor
        ? `Shocked ROAS ${ctx.minShockedRoas.toFixed(2)}x breaches the ${BREAKEVEN_FLOOR.toFixed(2)}x floor — direct capital bleed.`
        : `Lowest shocked ROAS ${ctx.minShockedRoas.toFixed(2)}x stays above the ${BREAKEVEN_FLOOR.toFixed(2)}x floor — waste signal, not a floor breach.`
    },
    {
      step: 4,
      tone: 'good',
      title: 'Autonomous Mitigation',
      detail: mitigationDetail
    },
    {
      step: 5,
      tone: 'good',
      title: 'Outcome',
      detail: `Loss ${formatInr(ctx.lossDaily)} → ${formatInr(ctx.lossWithMitigationDaily)}/day; ${formatInr(ctx.avoidedDaily)}/day avoided at ${ctx.confidencePct}% confidence.`
    }
  ];
}

function buildLineage(ctx: NarrativeContext): ShockLineageRow[] {
  const { plan, target, targetYield } = ctx;
  return [
    {
      formula: 'target = argmax(margin ÷ spend)',
      inputs: `eligible=${ctx.eligibleCount}; platforms=[${ctx.config.targetPlatforms.join(', ')}]; winner @ ${targetYield.toFixed(4)}x`,
      output: target.campaign
    },
    {
      formula: 'moved = round2(shiftPct × target.spend)',
      inputs: `${(MAX_SHIFT_PCT * 100).toFixed(0)}% × ${target.currentDailySpend.toFixed(2)}`,
      output: formatInr(plan.movedDaily)
    },
    {
      formula: 'recovered = moved × (target.margin ÷ target.spend)',
      inputs: `${plan.movedDaily.toFixed(2)} × (${target.currentDailyMargin.toFixed(2)} ÷ ${target.currentDailySpend.toFixed(2)})`,
      output: formatInr(plan.recoveredDailyMargin)
    },
    {
      formula: 'held = sourceCut − moved',
      inputs: `${plan.sourceSpendCutDaily.toFixed(2)} − ${plan.movedDaily.toFixed(2)}`,
      output: formatInr(plan.heldDaily)
    },
    {
      formula: 'lossDaily = baselineNet − shockedNet',
      inputs: `${ctx.baselineNet.toFixed(2)} − ${ctx.shockedNet.toFixed(2)}`,
      output: formatInr(ctx.lossDaily)
    },
    {
      formula: 'lossWithMit = baselineNet − mitigatedNet',
      inputs: `${ctx.baselineNet.toFixed(2)} − ${ctx.mitigatedNet.toFixed(2)}`,
      output: formatInr(ctx.lossWithMitigationDaily)
    },
    {
      formula: 'avoided = lossDaily − lossWithMit',
      inputs: `${ctx.lossDaily.toFixed(2)} − ${ctx.lossWithMitigationDaily.toFixed(2)}`,
      output: formatInr(ctx.avoidedDaily)
    },
    {
      formula: 'wasted = Σ affected spend × (1 − revenue′ ÷ revenue)',
      inputs: `Σ over ${ctx.affectedRecords.length} affected campaign(s)`,
      output: formatInr(ctx.wastedSpendDaily)
    },
    {
      formula: 'confidence = min(99, round(60 + 40 × loss ÷ affectedMargin))',
      inputs: `${ctx.lossDaily.toFixed(2)} ÷ ${ctx.affectedBaselineMargin.toFixed(2)}`,
      output: `${ctx.confidencePct}%`
    },
    {
      formula: 'breachesFloor = min(shocked ROAS) < floor',
      inputs: `min=${ctx.minShockedRoas.toFixed(2)}x; floor=${BREAKEVEN_FLOOR.toFixed(2)}x`,
      output: ctx.breachesFloor ? 'true' : 'false'
    }
  ];
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function computeShockAnalysis(scenarioId: ShockScenarioId): ShockAnalysis {
  const config = SHOCK_CONFIGS[scenarioId];
  const scenario = findScenario(scenarioId);
  if (!config) throw new Error(`Shock analysis: no configuration for ${scenarioId}.`);

  // 1. Apply the shock transform → shocked campaign states.
  const affectedRecords: AffectedRecord[] = [];
  for (const campaign of CAMPAIGNS) {
    if (config.affected(campaign)) {
      affectedRecords.push({ campaign, shocked: shockedState(campaign, config) });
    }
  }
  if (affectedRecords.length === 0) {
    throw new Error(`Shock analysis: affected predicate matched no campaigns for ${scenarioId}.`);
  }

  const shockedByCampaign = new Map<string, CampaignState>();
  for (const record of affectedRecords) {
    shockedByCampaign.set(record.campaign.campaign, record.shocked);
  }

  // 2. Choose the mitigation target (highest yield outside the blast radius).
  const affectedNames = new Set(affectedRecords.map((record) => record.campaign.campaign));
  const { target, targetYield, eligibleCount } = selectTarget(affectedNames, config);
  shockedByCampaign.set(target.campaign, baselineState(target));

  // 3. Plan the capital move under the 40% cycle cap, then build mitigated states.
  const plan = planCapital(config, affectedRecords, target, targetYield);
  const mitigatedByCampaign = buildMitigatedStates(config, affectedRecords, plan, target);

  // 4. Scope aggregates over affected ∪ target: baseline → shocked → mitigated.
  const scope: RawCampaign[] = [...affectedRecords.map((record) => record.campaign), target];
  const baselineAgg = aggregateStates(scope.map((campaign) => baselineState(campaign)));
  const shockedAgg = aggregateStates(
    scope.map((campaign) => stateOf(shockedByCampaign, campaign.campaign))
  );
  const mitigatedAgg = aggregateStates(
    scope.map((campaign) => stateOf(mitigatedByCampaign, campaign.campaign))
  );

  const series: [ShockScopePoint, ShockScopePoint, ShockScopePoint] = [
    { label: 'Baseline', ...baselineAgg },
    { label: 'Shocked', ...shockedAgg },
    { label: 'Mitigated', ...mitigatedAgg }
  ];

  // 5. Loss model (scope: affected ∪ target).
  const baselineNet = baselineAgg.net;
  const shockedNet = shockedAgg.net;
  const mitigatedNet = mitigatedAgg.net;
  const lossDaily = round2(baselineNet - shockedNet);
  const lossWithMitigationDaily = round2(baselineNet - mitigatedNet);
  const avoidedDaily = round2(lossDaily - lossWithMitigationDaily);

  // 6. Wasted spend: affected spend no longer backed by proportional revenue.
  let wastedSpendDaily = 0;
  for (const record of affectedRecords) {
    const baseline = baselineState(record.campaign);
    wastedSpendDaily +=
      baseline.revenue > 0
        ? baseline.spend * (1 - record.shocked.revenue / baseline.revenue)
        : baseline.spend;
  }
  wastedSpendDaily = round2(wastedSpendDaily);

  // 7. Confidence ratio + break-even floor check over shocked affected campaigns.
  let affectedBaselineMargin = 0;
  for (const record of affectedRecords) {
    affectedBaselineMargin += record.campaign.currentDailyMargin;
  }
  const confidencePct =
    affectedBaselineMargin > 0
      ? Math.min(99, Math.round(60 + (40 * lossDaily) / affectedBaselineMargin))
      : 60;

  let minShockedRoas = Number.POSITIVE_INFINITY;
  for (const record of affectedRecords) {
    minShockedRoas = Math.min(
      minShockedRoas,
      safeRoas(record.shocked.revenue, record.shocked.spend)
    );
  }
  if (!Number.isFinite(minShockedRoas)) minShockedRoas = 0;
  const breachesFloor = minShockedRoas < BREAKEVEN_FLOOR;

  // 8. Per-campaign readout rows: affected (by margin loss) then the target.
  const affectedSorted = affectedRecords.toSorted(
    (a, b) =>
      b.campaign.currentDailyMargin -
      b.shocked.margin -
      (a.campaign.currentDailyMargin - a.shocked.margin)
  );

  const campaignRows: ShockCampaignRow[] = affectedSorted.map((record) => {
    const baseline = baselineState(record.campaign);
    const mitigated = stateOf(mitigatedByCampaign, record.campaign.campaign);
    return {
      campaign: record.campaign.campaign,
      productName: record.campaign.productName,
      platform: record.campaign.platform,
      role: 'affected',
      baselineRoas: safeRoas(baseline.revenue, baseline.spend),
      shockedRoas: safeRoas(record.shocked.revenue, record.shocked.spend),
      mitigatedRoas: safeRoas(mitigated.revenue, mitigated.spend),
      baselineMargin: baseline.margin,
      shockedMargin: record.shocked.margin,
      mitigatedMargin: mitigated.margin,
      shockedInventory: record.shocked.inventory
    };
  });

  const targetBaseline = baselineState(target);
  const targetMitigated = stateOf(mitigatedByCampaign, target.campaign);
  campaignRows.push({
    campaign: target.campaign,
    productName: target.productName,
    platform: target.platform,
    role: 'target',
    baselineRoas: safeRoas(targetBaseline.revenue, targetBaseline.spend),
    shockedRoas: safeRoas(targetBaseline.revenue, targetBaseline.spend),
    mitigatedRoas: safeRoas(targetMitigated.revenue, targetMitigated.spend),
    baselineMargin: targetBaseline.margin,
    shockedMargin: targetBaseline.margin,
    mitigatedMargin: targetMitigated.margin,
    shockedInventory: null
  });

  // 9. Narrative — every sentence interpolated from the values computed above.
  const narrative: NarrativeContext = {
    scenario,
    config,
    affectedRecords,
    target,
    targetYield,
    eligibleCount,
    plan,
    lossDaily,
    lossWithMitigationDaily,
    avoidedDaily,
    wastedSpendDaily,
    confidencePct,
    minShockedRoas,
    breachesFloor,
    baselineNet,
    shockedNet,
    mitigatedNet,
    affectedBaselineMargin
  };

  return {
    scenarioId,
    scenarioName: scenario.name,
    severity: scenario.severity,
    severityTone: severityToneOf(scenario.severity),
    injectedEvent: scenario.injectedEvent,
    description: scenario.description,
    autonomousResponse: scenario.autonomousResponse,
    expectedSavedWaste: scenario.expectedSavedWaste,
    confidencePct,
    confidenceRule: CONFIDENCE_RULE,
    affectedCount: affectedRecords.length,
    baselineRoas: baselineAgg.roas,
    shockedRoas: shockedAgg.roas,
    mitigatedRoas: mitigatedAgg.roas,
    breachesFloor,
    series,
    campaignRows,
    mitigation: {
      planTitle:
        config.sourcePolicy === 'PAUSE_ALL'
          ? 'Autonomous Mitigation Plan — PAUSE_ALL'
          : 'Autonomous Mitigation Plan — FUND_SHIFT',
      steps: buildMitigationSteps(narrative),
      targetCampaign: target.campaign,
      targetProductName: target.productName,
      targetPlatform: target.platform,
      movedDaily: plan.movedDaily,
      recoveredDailyMargin: plan.recoveredDailyMargin,
      sourceSpendCutDaily: plan.sourceSpendCutDaily,
      heldDaily: plan.heldDaily
    },
    loss: {
      withoutMitigation: toFigure(lossDaily),
      withMitigation: toFigure(lossWithMitigationDaily),
      avoided: toFigure(avoidedDaily),
      wastedSpendDaily,
      wastedSpendWeekly: round2(wastedSpendDaily * 7)
    },
    causalChain: buildCausalChain(narrative),
    lineage: buildLineage(narrative)
  };
}
