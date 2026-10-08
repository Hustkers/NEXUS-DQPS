/**
 * Shock Analysis — deterministic scenario shock evaluation model.
 *
 * Every value produced by `computeShockAnalysis` is derived from the pristine
 * `nexus-engine-state.json` baseline plus the scenario definition itself.
 * No randomness, no time dependence, no hardcoded loss figures.
 */

export type ShockSeverityTone = 'critical' | 'high' | 'medium';

/** One aggregate state of the shock scope (affected campaigns + mitigation target). */
export interface ShockScopePoint {
  /** 'Baseline' | 'Shocked' | 'Mitigated' */
  label: string;
  /** Daily revenue in $ for the scope. */
  revenue: number;
  /** Daily gross margin in $ for the scope. */
  margin: number;
  /** Daily ad spend in $ for the scope. */
  spend: number;
  /** revenue / spend; 0 when spend is 0. */
  roas: number;
  /** margin - spend (can be negative). */
  net: number;
}

/** Per-campaign baseline → shocked → mitigated readout row. */
export interface ShockCampaignRow {
  campaign: string;
  productName: string;
  platform: string;
  /** 'affected' = hit by the shock; 'target' = mitigation redirection target. */
  role: 'affected' | 'target';
  baselineRoas: number;
  shockedRoas: number;
  mitigatedRoas: number;
  baselineMargin: number;
  shockedMargin: number;
  mitigatedMargin: number;
  /** Post-shock inventory (stockout scenario sets 0); null for unaffected rows. */
  shockedInventory: number | null;
}

export interface ShockMitigationStep {
  title: string;
  detail: string;
  tone: 'risk' | 'neutral' | 'good';
}

export interface ShockMitigationPlan {
  planTitle: string;
  steps: ShockMitigationStep[];
  targetCampaign: string;
  targetProductName: string;
  targetPlatform: string;
  /** $/day moved from source(s) to target this optimization cycle. */
  movedDaily: number;
  /** $/day gross margin expected from the moved capital (moved × target yield). */
  recoveredDailyMargin: number;
  /** $/day total spend removed from shocked source campaign(s). */
  sourceSpendCutDaily: number;
  /** $/day removed from source but held (not yet redeployed) this cycle. */
  heldDaily: number;
}

export interface ShockLossFigure {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface ShockLoss {
  withoutMitigation: ShockLossFigure;
  withMitigation: ShockLossFigure;
  avoided: ShockLossFigure;
  /** $/day of spend no longer backed by proportional revenue. */
  wastedSpendDaily: number;
  wastedSpendWeekly: number;
}

export interface ShockCausalNode {
  step: number;
  title: string;
  detail: string;
  tone: 'risk' | 'warn' | 'good';
}

/** One row of the DATA LINEAGE audit trail. */
export interface ShockLineageRow {
  /** Human-readable formula. */
  formula: string;
  /** Concrete inputs used (names/values). */
  inputs: string;
  /** Result of applying the formula. */
  output: string;
}

export interface ShockAnalysis {
  scenarioId: string;
  scenarioName: string;
  /** Raw severity string from the scenario definition ('CRITICAL' | 'HIGH' | 'MEDIUM'). */
  severity: string;
  severityTone: ShockSeverityTone;
  injectedEvent: string;
  description: string;
  autonomousResponse: string;
  expectedSavedWaste: string;
  /** Rule-based confidence 0–99 (see confidenceRule). */
  confidencePct: number;
  /** Formula behind confidencePct, displayed in the UI. */
  confidenceRule: string;
  /** Number of campaigns hit by the shock. */
  affectedCount: number;
  /** Scope-weighted Σrevenue / Σspend per state. */
  baselineRoas: number;
  shockedRoas: number;
  mitigatedRoas: number;
  /** True when any shocked campaign ROAS < 1.80x break-even floor. */
  breachesFloor: boolean;
  /** [Baseline, Shocked, Mitigated] scope aggregates (chart source). */
  series: [ShockScopePoint, ShockScopePoint, ShockScopePoint];
  /** Affected campaigns (margin-loss order) followed by the mitigation target. */
  campaignRows: ShockCampaignRow[];
  mitigation: ShockMitigationPlan;
  loss: ShockLoss;
  causalChain: ShockCausalNode[];
  lineage: ShockLineageRow[];
}

export type ShockScenarioId =
  | 'scenario-stockout'
  | 'scenario-cpm-spike'
  | 'scenario-creative-fatigue'
  | 'scenario-competitor-price';

export const SHOCK_SCENARIO_IDS: readonly ShockScenarioId[] = [
  'scenario-stockout',
  'scenario-cpm-spike',
  'scenario-creative-fatigue',
  'scenario-competitor-price'
] as const;
