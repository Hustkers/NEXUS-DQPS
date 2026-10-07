'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { MetaLogo, GoogleLogo, AmazonLogo } from '@/components/icons/platform-logos';
import {
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { toast } from 'sonner';

// ============================================================================
// CALIBRATED HILL SATURATION & MEDIA RESPONSE PARAMETERS (decide/curves.py)
// ============================================================================
export const CHANNEL_MODELS = {
  meta: {
    name: 'Meta Ads',
    beta: 4500.0, // Saturation ceiling
    eta: 1.75, // Shape parameter
    K: 850.0, // Half-saturation spend point
    baselineSpend: 0, // Throttled away from stockout
    stockout: true,
    inventory: 0,
    sku: '315122-001',
    productName: "Nike Air Force 1 '07",
    color: '#3b82f6',
    defaultTag: 'Stockout Throttled'
  },
  google: {
    name: 'Google Search',
    beta: 5500.0,
    eta: 1.45,
    K: 1250.0,
    baselineSpend: 750,
    stockout: false,
    inventory: 850,
    sku: 'BQ8928-011',
    productName: 'Nike Epic React Flyknit 2',
    color: '#10b981',
    defaultTag: 'In-Stock Hero'
  },
  amazon: {
    name: 'Amazon SP',
    beta: 5000.0,
    eta: 2.10,
    K: 700.0,
    baselineSpend: 625,
    stockout: false,
    inventory: 620,
    sku: '310805-137',
    productName: 'Air Jordan 10 Retro',
    color: '#f59e0b',
    defaultTag: 'High Buy-Box'
  }
} as const;

export interface ScenarioAllocationVector {
  meta: number;
  google: number;
  amazon: number;
  metaRev: number;
  googleRev: number;
  amazonRev: number;
  totalSpend: number;
  totalRev: number;
  netContribution: number;
  blendedRoas: number;
  poas: number;
}

// Evaluate non-linear Hill saturation function: Hill(x) = beta * (x^eta) / (K^eta + x^eta)
export function evalHillRev(channel: 'meta' | 'google' | 'amazon', spend: number): number {
  if (spend <= 0) return 0;
  const { beta, eta, K } = CHANNEL_MODELS[channel];
  const xPow = Math.pow(spend, eta);
  const kPow = Math.pow(K, eta);
  return beta * (xPow / (kPow + xPow));
}

// Analytical Marginal ROAS derivative: d(Revenue)/d(Spend) = beta * eta * (K^eta) * (x^(eta - 1)) / ((K^eta + x^eta)^2)
export function evalMarginalRoas(channel: 'meta' | 'google' | 'amazon', spend: number): number {
  if (spend <= 0) return 0;
  const { beta, eta, K } = CHANNEL_MODELS[channel];
  const kPow = Math.pow(K, eta);
  const xPow = Math.pow(spend, eta);
  const xPowMinus1 = Math.pow(spend, eta - 1);
  const denominator = Math.pow(kPow + xPow, 2);
  if (denominator === 0) return 0;
  return (beta * eta * kPow * xPowMinus1) / denominator;
}

// Compute unit economics & financial projections
export function computeFinancials(meta: number, google: number, amazon: number) {
  const metaRev = evalHillRev('meta', meta);
  const googleRev = evalHillRev('google', google);
  const amazonRev = evalHillRev('amazon', amazon);

  const totalSpend = meta + google + amazon;
  const totalRev = metaRev + googleRev + amazonRev;
  const cogs = totalRev * 0.35;
  const grossMargin = totalRev - cogs;
  const variableCosts = totalRev * 0.03; // Ad network fees & transaction processing
  const netContribution = grossMargin - totalSpend - variableCosts;
  const blendedRoas = totalSpend > 0 ? totalRev / totalSpend : 0;
  const poas = totalSpend > 0 ? grossMargin / totalSpend : 0;

  const metaMroas = evalMarginalRoas('meta', meta);
  const googleMroas = evalMarginalRoas('google', google);
  const amazonMroas = evalMarginalRoas('amazon', amazon);

  return {
    meta,
    google,
    amazon,
    metaRev,
    googleRev,
    amazonRev,
    metaMroas,
    googleMroas,
    amazonMroas,
    totalSpend,
    totalRev,
    cogs,
    grossMargin,
    variableCosts,
    netContribution,
    blendedRoas,
    poas
  };
}

// Smooth animated number component with requestAnimationFrame (easeOutCubic)
function AnimatedNumber({
  value,
  formatter = (v: number) => Math.round(v).toLocaleString('en-IN'),
  duration = 380
}: {
  value: number;
  formatter?: (v: number) => string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    prevValueRef.current = value;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(endValue);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <>{formatter(displayValue)}</>;
}

interface CurveTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      spend: number;
      baselineRev: number;
      scenarioRev: number;
      scenarioMargin: number;
    };
  }>;
}

function CurveTooltip({ active, payload }: CurveTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const diffRev = d.scenarioRev - d.baselineRev;

  return (
    <div className='rounded-xl border border-border bg-popover/95 backdrop-blur-md p-3 shadow-2xl font-mono text-xs text-popover-foreground space-y-1.5 min-w-[210px]'>
      <div className='text-muted-foreground text-[10px] font-bold uppercase tracking-wider border-b border-border/60 pb-1 flex justify-between'>
        <span>Total Daily Spend</span>
        <span className='text-foreground'>₹{d.spend.toLocaleString('en-IN')}/d</span>
      </div>
      <div className='flex items-center justify-between'>
        <span className='text-muted-foreground text-[11px]'>Baseline Curve:</span>
        <span className='text-muted-foreground font-semibold'>₹{d.baselineRev.toLocaleString('en-IN')}</span>
      </div>
      <div className='flex items-center justify-between'>
        <span className='text-cyan-400 font-bold'>Scenario Curve:</span>
        <span className='text-cyan-400 font-bold'>₹{d.scenarioRev.toLocaleString('en-IN')}</span>
      </div>
      {diffRev !== 0 && (
        <div className='flex items-center justify-between text-[10px]'>
          <span className='text-muted-foreground'>Curve Lift:</span>
          <span className={diffRev > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {diffRev > 0 ? `+₹${diffRev.toLocaleString('en-IN')}` : `-₹${Math.abs(diffRev).toLocaleString('en-IN')}`}
          </span>
        </div>
      )}
      <div className='flex items-center justify-between pt-1 border-t border-border/60 text-[11px]'>
        <span className='text-emerald-400 font-semibold'>Net Margin:</span>
        <span className='text-emerald-400 font-bold'>₹{d.scenarioMargin.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}

interface BreakdownTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      channel: string;
      'Current Spend': number;
      'Scenario Spend': number;
      'Current Revenue': number;
      'Scenario Revenue': number;
    };
  }>;
}

function BreakdownTooltip({ active, payload }: BreakdownTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const spendDiff = d['Scenario Spend'] - d['Current Spend'];
  const revDiff = d['Scenario Revenue'] - d['Current Revenue'];

  return (
    <div className='rounded-xl border border-border bg-popover/95 backdrop-blur-md p-3 shadow-2xl font-mono text-xs text-popover-foreground space-y-1.5 min-w-[220px]'>
      <div className='font-bold text-foreground border-b border-border/60 pb-1 flex justify-between'>
        <span>{d.channel}</span>
      </div>
      <div className='space-y-0.5 text-[11px]'>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Daily Spend:</span>
          <span className='font-mono text-foreground font-semibold'>
            ₹{d['Current Spend'].toLocaleString('en-IN')} → ₹{d['Scenario Spend'].toLocaleString('en-IN')}
          </span>
        </div>
        {spendDiff !== 0 && (
          <div className='flex justify-end text-[10px]'>
            <span className={spendDiff > 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
              {spendDiff > 0 ? `+₹${spendDiff}` : `-₹${Math.abs(spendDiff)}`}
            </span>
          </div>
        )}
      </div>
      <div className='space-y-0.5 pt-1 border-t border-border/60 text-[11px]'>
        <div className='flex justify-between'>
          <span className='text-cyan-400 font-semibold'>Forecasted Revenue:</span>
          <span className='font-mono text-cyan-400 font-bold'>
            ₹{d['Current Revenue'].toLocaleString('en-IN')} → ₹{d['Scenario Revenue'].toLocaleString('en-IN')}
          </span>
        </div>
        {revDiff !== 0 && (
          <div className='flex justify-end text-[10px]'>
            <span className={revDiff > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {revDiff > 0 ? `+₹${revDiff.toLocaleString('en-IN')}` : `-₹${Math.abs(revDiff).toLocaleString('en-IN')}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ScenarioSandbox({
  onApplyReallocation
}: {
  onApplyReallocation?: (alloc: ScenarioAllocationVector) => void;
}) {
  // Baseline initial steady-state
  const baseline = useMemo(() => {
    return computeFinancials(
      CHANNEL_MODELS.meta.baselineSpend,
      CHANNEL_MODELS.google.baselineSpend,
      CHANNEL_MODELS.amazon.baselineSpend
    );
  }, []);

  // Sliders state
  const [metaSpend, setMetaSpend] = useState<number>(CHANNEL_MODELS.meta.baselineSpend);
  const [googleSpend, setGoogleSpend] = useState<number>(CHANNEL_MODELS.google.baselineSpend);
  const [amazonSpend, setAmazonSpend] = useState<number>(CHANNEL_MODELS.amazon.baselineSpend);

  // Interaction & UI states
  const [activeChartMode, setActiveChartMode] = useState<'curve' | 'breakdown'>('curve');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [justApplied, setJustApplied] = useState<boolean>(false);
  const [appliedVector, setAppliedVector] = useState<{
    timestamp: string;
    financials: ReturnType<typeof computeFinancials>;
    deltaRevenue: number;
    deltaMargin: number;
    deltaRoas: number;
    pctRevChange: number;
    pctMarginChange: number;
  } | null>(null);

  // Live scenario calculations driven directly by slider values
  const scenario = useMemo(() => {
    return computeFinancials(metaSpend, googleSpend, amazonSpend);
  }, [metaSpend, googleSpend, amazonSpend]);

  // Deltas vs baseline
  const deltaSpend = scenario.totalSpend - baseline.totalSpend;
  const deltaRevenue = scenario.totalRev - baseline.totalRev;
  const deltaMargin = scenario.netContribution - baseline.netContribution;
  const deltaRoas = scenario.blendedRoas - baseline.blendedRoas;
  const deltaPoas = scenario.poas - baseline.poas;

  const pctRevChange = baseline.totalRev > 0 ? (deltaRevenue / baseline.totalRev) * 100 : 0;
  const pctMarginChange = baseline.netContribution > 0 ? (deltaMargin / baseline.netContribution) * 100 : 0;
  const hasSpendChanges =
    metaSpend !== CHANNEL_MODELS.meta.baselineSpend ||
    googleSpend !== CHANNEL_MODELS.google.baselineSpend ||
    amazonSpend !== CHANNEL_MODELS.amazon.baselineSpend;

  // Generate continuous points along the portfolio diminishing-returns response curve
  // Plots baseline curve vs scenario curve based on respective channel allocations
  const responseCurveData = useMemo(() => {
    const points: Array<{
      spend: number;
      baselineRev: number;
      scenarioRev: number;
      scenarioMargin: number;
    }> = [];

    // Baseline allocation weights
    const baseTotal = baseline.totalSpend > 0 ? baseline.totalSpend : 1375;
    const baseMWeight = baseline.meta / baseTotal;
    const baseGWeight = baseline.google / baseTotal;
    const baseAWeight = baseline.amazon / baseTotal;

    // Scenario allocation weights
    const scenTotal = scenario.totalSpend > 0 ? scenario.totalSpend : 1;
    const scenMWeight = scenario.meta / scenTotal;
    const scenGWeight = scenario.google / scenTotal;
    const scenAWeight = scenario.amazon / scenTotal;

    // Sample spend continuously from 0 to 3600 in steps of 100
    for (let s = 0; s <= 3600; s += 100) {
      const bFin = computeFinancials(s * baseMWeight, s * baseGWeight, s * baseAWeight);
      const sFin = computeFinancials(s * scenMWeight, s * scenGWeight, s * scenAWeight);

      points.push({
        spend: s,
        baselineRev: Math.round(bFin.totalRev),
        scenarioRev: Math.round(sFin.totalRev),
        scenarioMargin: Math.round(sFin.netContribution)
      });
    }

    return points;
  }, [baseline, scenario]);

  // Channel breakdown bar chart data
  const channelBreakdownData = useMemo(() => {
    return [
      {
        channel: 'Meta Ads',
        'Current Spend': baseline.meta,
        'Scenario Spend': scenario.meta,
        'Current Revenue': Math.round(baseline.metaRev),
        'Scenario Revenue': Math.round(scenario.metaRev)
      },
      {
        channel: 'Google Search',
        'Current Spend': baseline.google,
        'Scenario Spend': scenario.google,
        'Current Revenue': Math.round(baseline.googleRev),
        'Scenario Revenue': Math.round(scenario.googleRev)
      },
      {
        channel: 'Amazon SP',
        'Current Spend': baseline.amazon,
        'Scenario Spend': scenario.amazon,
        'Current Revenue': Math.round(baseline.amazonRev),
        'Scenario Revenue': Math.round(scenario.amazonRev)
      },
      {
        channel: 'Total Portfolio',
        'Current Spend': baseline.totalSpend,
        'Scenario Spend': scenario.totalSpend,
        'Current Revenue': Math.round(baseline.totalRev),
        'Scenario Revenue': Math.round(scenario.totalRev)
      }
    ];
  }, [baseline, scenario]);

  // Dynamic explanation generated from actual scenario vector
  const scenarioExplanation = useMemo(() => {
    const reasons: string[] = [];

    if (metaSpend > 0) {
      reasons.push(
        `Allocated ₹${metaSpend}/d to Meta Ads despite warehouse stockout (0 units on Nike Air Force 1 '07) — elevates CAC and conversion drop risk.`
      );
    } else {
      reasons.push('Maintained ₹0 spend on Meta Ads to eliminate non-converting inventory bleed on out-of-stock SKU.');
    }

    if (googleSpend > baseline.google) {
      const gLift = scenario.googleRev - baseline.googleRev;
      reasons.push(
        `Scaled Google Search (+₹${googleSpend - baseline.google}/d) capturing high-intent search queries (+₹${Math.round(gLift)}/d revenue headroom, mROAS ${scenario.googleMroas.toFixed(2)}x).`
      );
    } else if (googleSpend < baseline.google) {
      reasons.push(
        `Trimmed Google Search (-₹${baseline.google - googleSpend}/d) preventing diminishing returns near the saturation knee.`
      );
    }

    if (amazonSpend > baseline.amazon) {
      const aLift = scenario.amazonRev - baseline.amazonRev;
      reasons.push(
        `Boosted Amazon Sponsored Products (+₹${amazonSpend - baseline.amazon}/d) capturing bottom-funnel purchase intent on Air Jordan 10 (+₹${Math.round(aLift)}/d revenue, mROAS ${scenario.amazonMroas.toFixed(2)}x).`
      );
    } else if (amazonSpend < baseline.amazon) {
      reasons.push(
        `Reduced Amazon SP spend (-₹${baseline.amazon - amazonSpend}/d) preserving net margin against auction bid competition.`
      );
    }

    if (deltaMargin > 0) {
      reasons.push(
        `Portfolio net contribution margin expands by +₹${Math.round(deltaMargin).toLocaleString('en-IN')}/day (${pctMarginChange >= 0 ? '+' : ''}${pctMarginChange.toFixed(1)}%).`
      );
    } else if (deltaMargin < 0) {
      reasons.push(
        `Portfolio net margin contracts by -₹${Math.abs(Math.round(deltaMargin)).toLocaleString('en-IN')}/day due to ad-spend saturation or unconstrained traffic burn.`
      );
    }

    if (scenario.blendedRoas < 1.8) {
      reasons.push('⚠️ Alert: Blended ROAS fell below the enterprise breakeven floor of 1.80x.');
    }

    return reasons;
  }, [metaSpend, googleSpend, amazonSpend, baseline, scenario, deltaMargin, pctMarginChange]);

  // Handle Apply Scenario Vector
  const handleApply = () => {
    setIsSimulating(true);

    setTimeout(() => {
      setIsSimulating(false);
      setJustApplied(true);
      setTimeout(() => setJustApplied(false), 2400);

      const appliedPayload: ScenarioAllocationVector = {
        meta: metaSpend,
        google: googleSpend,
        amazon: amazonSpend,
        metaRev: scenario.metaRev,
        googleRev: scenario.googleRev,
        amazonRev: scenario.amazonRev,
        totalSpend: scenario.totalSpend,
        totalRev: scenario.totalRev,
        netContribution: scenario.netContribution,
        blendedRoas: scenario.blendedRoas,
        poas: scenario.poas
      };

      setAppliedVector({
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        financials: scenario,
        deltaRevenue,
        deltaMargin,
        deltaRoas,
        pctRevChange,
        pctMarginChange
      });

      if (onApplyReallocation) {
        onApplyReallocation(appliedPayload);
      }

      toast.success('Applied Scenario Reallocation Vector', {
        description: `Meta: ₹${metaSpend}/d • Google: ₹${googleSpend}/d • Amazon: ₹${amazonSpend}/d. Net Margin Lift: ${deltaMargin >= 0 ? '+' : ''}₹${Math.round(deltaMargin).toLocaleString('en-IN')}/d (${pctMarginChange >= 0 ? '+' : ''}${pctMarginChange.toFixed(1)}%).`
      });
    }, 650);
  };

  // Reset to baseline
  const handleReset = () => {
    setMetaSpend(CHANNEL_MODELS.meta.baselineSpend);
    setGoogleSpend(CHANNEL_MODELS.google.baselineSpend);
    setAmazonSpend(CHANNEL_MODELS.amazon.baselineSpend);
    setAppliedVector(null);
    setJustApplied(false);
    toast.info('Sandbox Reset to Baseline Steady-State', {
      description: 'Restored canonical allocations: Meta ₹0/d, Google ₹750/d, Amazon ₹625/d.'
    });
  };

  // Preset Scenario Handlers
  const applyPreset = (preset: 'optimal' | 'aggressive' | 'conservative' | 'baseline') => {
    if (preset === 'baseline') {
      handleReset();
    } else if (preset === 'optimal') {
      setMetaSpend(0);
      setGoogleSpend(950);
      setAmazonSpend(800);
      toast.success('Loaded SLSQP Optimal Preset', {
        description: 'Meta ₹0/d, Google ₹950/d, Amazon ₹800/d (Maximizes net contribution without stockout bleed).'
      });
    } else if (preset === 'aggressive') {
      setMetaSpend(0);
      setGoogleSpend(1200);
      setAmazonSpend(1050);
      toast.success('Loaded Aggressive Growth Preset', {
        description: 'Meta ₹0/d, Google ₹1,200/d, Amazon ₹1,050/d (Scales revenue while protecting ROAS).'
      });
    } else if (preset === 'conservative') {
      setMetaSpend(0);
      setGoogleSpend(500);
      setAmazonSpend(450);
      toast.success('Loaded Capital Conservation Preset', {
        description: 'Meta ₹0/d, Google ₹500/d, Amazon ₹450/d (Protects cash flow with high ROAS yield).'
      });
    }
  };

  // Channel share percentages
  const metaShare = scenario.totalSpend > 0 ? (scenario.meta / scenario.totalSpend) * 100 : 0;
  const googleShare = scenario.totalSpend > 0 ? (scenario.google / scenario.totalSpend) * 100 : 0;
  const amazonShare = scenario.totalSpend > 0 ? (scenario.amazon / scenario.totalSpend) * 100 : 0;

  const baseMetaShare = baseline.totalSpend > 0 ? (baseline.meta / baseline.totalSpend) * 100 : 0;
  const baseGoogleShare = baseline.totalSpend > 0 ? (baseline.google / baseline.totalSpend) * 100 : 0;
  const baseAmazonShare = baseline.totalSpend > 0 ? (baseline.amazon / baseline.totalSpend) * 100 : 0;

  return (
    <Card className='p-5 border border-border bg-card shadow-none rounded-xl text-card-foreground font-mono min-w-0 max-w-full overflow-hidden space-y-6'>
      {/* ============================================================ */}
      {/* 1. HEADER BAR & CONTROLS */}
      {/* ============================================================ */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4'>
        <div className='space-y-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <Icons.sliders className='size-4 text-foreground' />
            <h3 className='text-sm font-bold text-foreground tracking-tight uppercase'>
              Interactive What-If Scenario Sandbox
            </h3>
            <span className='text-[10px] bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full font-bold'>
              SLSQP Hill Saturation Engine
            </span>
          </div>
          <p className='text-xs text-muted-foreground leading-relaxed'>
            Adjust channel spend allocations in real-time. Live diminishing returns modeling, marginal ROAS derivatives, budget shifts, and net contribution margin tracking.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          {/* Quick Presets */}
          <div className='hidden sm:flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border text-[10px]'>
            <span className='text-muted-foreground px-1.5 font-bold uppercase'>Presets:</span>
            <button
              type='button'
              onClick={() => applyPreset('optimal')}
              className='px-2 py-1 rounded bg-background/80 hover:bg-background text-foreground border border-border hover:border-foreground transition-all active:scale-[0.96] font-semibold'
            >
              Optimal Yield
            </button>
            <button
              type='button'
              onClick={() => applyPreset('aggressive')}
              className='px-2 py-1 rounded bg-background/80 hover:bg-background text-foreground border border-border hover:border-foreground transition-all active:scale-[0.96] font-semibold'
            >
              Aggressive
            </button>
            <button
              type='button'
              onClick={() => applyPreset('conservative')}
              className='px-2 py-1 rounded bg-background/80 hover:bg-background text-foreground border border-border hover:border-foreground transition-all active:scale-[0.96] font-semibold'
            >
              Conservative
            </button>
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={handleReset}
            disabled={isSimulating || (!hasSpendChanges && !appliedVector)}
            className='h-8 text-xs font-mono border border-border bg-muted/30 text-foreground hover:bg-muted font-semibold active:scale-[0.97] rounded-lg transition-all duration-75 disabled:opacity-40'
          >
            <Icons.clock className='mr-1.5 size-3 text-muted-foreground' />
            Reset Baseline
          </Button>

          <Button
            size='sm'
            onClick={handleApply}
            disabled={isSimulating}
            className={`h-8 text-xs font-mono font-bold border-none active:scale-[0.97] rounded-lg transition-all duration-150 shadow-xs ${
              justApplied
                ? 'bg-emerald-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            } disabled:opacity-50`}
          >
            {isSimulating ? (
              <>
                <Icons.spinner className='mr-1.5 size-3 animate-spin' />
                Simulating SLSQP Vector...
              </>
            ) : justApplied || (appliedVector && !hasSpendChanges) ? (
              <>
                <Icons.check className='mr-1.5 size-3' />
                Scenario Vector Applied ✓
              </>
            ) : !hasSpendChanges ? (
              <>
                <Icons.arrowRight className='mr-1.5 size-3' />
                Apply Baseline Vector
              </>
            ) : (
              <>
                <Icons.arrowRight className='mr-1.5 size-3' />
                Apply Scenario Vector
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. GLOBAL SCENARIO KPI CARDS (PHASE 2 & PHASE 9) */}
      {/* ============================================================ */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
        {/* KPI 1: Total Daily Spend */}
        <div
          className={`p-3.5 rounded-xl border bg-muted/20 space-y-1.5 transition-all duration-300 ${
            justApplied ? 'ring-1 ring-primary/60 bg-muted/40' : 'border-border'
          }`}
        >
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            <span>Total Daily Budget</span>
            <span className='font-mono'>₹{baseline.totalSpend}/d</span>
          </div>
          <div className='text-lg font-bold text-foreground font-mono'>
            ₹<AnimatedNumber value={scenario.totalSpend} />/d
          </div>
          <div className='flex items-center gap-1.5 text-[10px]'>
            {deltaSpend === 0 ? (
              <span className='text-muted-foreground font-medium'>Budget Neutral (₹0)</span>
            ) : deltaSpend > 0 ? (
              <span className='text-amber-500 font-semibold'>
                +₹{deltaSpend.toLocaleString('en-IN')} (+{((deltaSpend / baseline.totalSpend) * 100).toFixed(1)}%)
              </span>
            ) : (
              <span className='text-emerald-500 font-semibold'>
                -₹{Math.abs(deltaSpend).toLocaleString('en-IN')} ({((deltaSpend / baseline.totalSpend) * 100).toFixed(1)}%)
              </span>
            )}
          </div>
        </div>

        {/* KPI 2: Forecasted Revenue */}
        <div
          className={`p-3.5 rounded-xl border bg-muted/20 space-y-1.5 transition-all duration-300 ${
            justApplied ? 'ring-1 ring-primary/60 bg-muted/40' : 'border-border'
          }`}
        >
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            <span>Forecasted Revenue</span>
            <span className='font-mono'>₹{Math.round(baseline.totalRev).toLocaleString('en-IN')}/d</span>
          </div>
          <div className='text-lg font-bold text-cyan-400 font-mono'>
            ₹<AnimatedNumber value={Math.round(scenario.totalRev)} />/d
          </div>
          <div className='flex items-center gap-1.5 text-[10px]'>
            {deltaRevenue === 0 ? (
              <span className='text-muted-foreground font-medium'>Baseline Unchanged</span>
            ) : deltaRevenue > 0 ? (
              <span className='text-emerald-500 font-bold'>
                +₹{Math.round(deltaRevenue).toLocaleString('en-IN')} (+{pctRevChange.toFixed(1)}%)
              </span>
            ) : (
              <span className='text-rose-500 font-bold'>
                -₹{Math.abs(Math.round(deltaRevenue)).toLocaleString('en-IN')} ({pctRevChange.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>

        {/* KPI 3: Forecasted Blended ROAS */}
        <div
          className={`p-3.5 rounded-xl border bg-muted/20 space-y-1.5 transition-all duration-300 ${
            justApplied ? 'ring-1 ring-primary/60 bg-muted/40' : 'border-border'
          }`}
        >
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            <span>Forecasted ROAS</span>
            <span className='font-mono'>{baseline.blendedRoas.toFixed(2)}x</span>
          </div>
          <div className='text-lg font-bold text-foreground font-mono'>
            <AnimatedNumber
              value={scenario.blendedRoas}
              formatter={(v) => `${v.toFixed(2)}x`}
            />
          </div>
          <div className='flex items-center gap-1.5 text-[10px]'>
            {deltaRoas === 0 ? (
              <span className='text-muted-foreground font-medium'>±0.00x</span>
            ) : deltaRoas > 0 ? (
              <span className='text-emerald-500 font-bold'>+{deltaRoas.toFixed(2)}x</span>
            ) : (
              <span className='text-rose-500 font-bold'>{deltaRoas.toFixed(2)}x</span>
            )}
            <span className='text-[9px] text-muted-foreground'>(Floor: 1.80x)</span>
          </div>
        </div>

        {/* KPI 4: Blended POAS (Margin / Spend) */}
        <div
          className={`p-3.5 rounded-xl border bg-muted/20 space-y-1.5 transition-all duration-300 ${
            justApplied ? 'ring-1 ring-primary/60 bg-muted/40' : 'border-border'
          }`}
        >
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            <span>Blended POAS</span>
            <span className='font-mono'>{baseline.poas.toFixed(2)}x</span>
          </div>
          <div className='text-lg font-bold text-foreground font-mono'>
            <AnimatedNumber
              value={scenario.poas}
              formatter={(v) => `${v.toFixed(2)}x`}
            />
          </div>
          <div className='flex items-center gap-1.5 text-[10px]'>
            {deltaPoas === 0 ? (
              <span className='text-muted-foreground font-medium'>±0.00x</span>
            ) : deltaPoas > 0 ? (
              <span className='text-emerald-500 font-bold'>+{deltaPoas.toFixed(2)}x</span>
            ) : (
              <span className='text-rose-500 font-bold'>{deltaPoas.toFixed(2)}x</span>
            )}
            <span className='text-[9px] text-muted-foreground'>Margin Yield</span>
          </div>
        </div>

        {/* KPI 5: Net Contribution Margin */}
        <div
          className={`p-3.5 rounded-xl border bg-muted/20 space-y-1.5 transition-all duration-300 col-span-2 sm:col-span-1 lg:col-span-1 ${
            justApplied ? 'ring-1 ring-emerald-500/80 bg-emerald-500/10' : 'border-border'
          }`}
        >
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            <span className='text-foreground font-bold flex items-center gap-1'>
              <Icons.sparkles className='size-3 text-emerald-400' />
              Net Margin
            </span>
            <span className='font-mono'>₹{Math.round(baseline.netContribution).toLocaleString('en-IN')}</span>
          </div>
          <div className='text-lg font-bold text-emerald-400 font-mono'>
            ₹<AnimatedNumber value={Math.round(scenario.netContribution)} />/d
          </div>
          <div className='flex items-center gap-1.5 text-[10px]'>
            {deltaMargin === 0 ? (
              <span className='text-muted-foreground font-medium'>₹0 neutral</span>
            ) : deltaMargin > 0 ? (
              <span className='text-emerald-400 font-bold'>
                +₹{Math.round(deltaMargin).toLocaleString('en-IN')} (+{pctMarginChange.toFixed(1)}%)
              </span>
            ) : (
              <span className='text-rose-500 font-bold'>
                -₹{Math.abs(Math.round(deltaMargin)).toLocaleString('en-IN')} ({pctMarginChange.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. CHANNEL SPEND SLIDERS GRID (PHASE 2, 3, 12) */}
      {/* ============================================================ */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Meta Ads Slider Card */}
        <div className='p-4 rounded-xl bg-muted/30 border border-border space-y-3 transition-colors'>
          <div className='flex items-center justify-between text-xs font-bold'>
            <div className='flex items-center gap-2'>
              <MetaLogo size={16} className='shrink-0' />
              <div>
                <span className='text-foreground block'>Meta Ads</span>
                <span className='text-[10px] text-muted-foreground font-normal'>Nike Air Force 1 '07</span>
              </div>
            </div>
            <div className='flex flex-col items-end'>
              <div className='flex items-baseline gap-1.5'>
                <span className='text-sm text-foreground font-bold font-mono'>
                  ₹<AnimatedNumber value={metaSpend} />/d
                </span>
                {metaSpend !== baseline.meta && (
                  <span className={`text-[10px] font-semibold ${metaSpend > baseline.meta ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {metaSpend > baseline.meta ? `+₹${metaSpend - baseline.meta}` : `-₹${baseline.meta - metaSpend}`}
                  </span>
                )}
              </div>
              <span className='text-[9px] text-muted-foreground font-normal'>Baseline: ₹{baseline.meta}/d</span>
            </div>
          </div>

          <div className='space-y-1.5'>
            <input
              type='range'
              min={0}
              max={1500}
              step={25}
              value={metaSpend}
              onChange={(e) => setMetaSpend(Number(e.target.value))}
              className='w-full accent-blue-500 cursor-pointer h-1.5 bg-muted rounded-lg'
            />
            <div className='flex justify-between text-[10px] text-muted-foreground'>
              <span>Min: ₹0</span>
              <span>K = ₹850/d</span>
              <span>Max: ₹1,500</span>
            </div>
          </div>

          {/* Quick Step Buttons */}
          <div className='flex items-center justify-between pt-1'>
            <div className='flex items-center gap-1.5'>
              <button
                type='button'
                onClick={() => setMetaSpend(Math.max(0, metaSpend - 50))}
                className='px-2 py-0.5 rounded text-[10px] bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border'
              >
                -₹50
              </button>
              <button
                type='button'
                onClick={() => setMetaSpend(Math.min(1500, metaSpend + 50))}
                className='px-2 py-0.5 rounded text-[10px] bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border'
              >
                +₹50
              </button>
            </div>
            <div className='text-[10px] text-muted-foreground font-mono'>
              mROAS: <span className='font-bold text-foreground'>{scenario.metaMroas.toFixed(2)}x</span>
            </div>
          </div>

          <div className='flex items-center justify-between text-[11px] pt-2 border-t border-border/60'>
            <div>
              <span className='text-muted-foreground text-[10px] block'>Forecasted Revenue</span>
              <span className='font-bold text-foreground font-mono'>
                ₹<AnimatedNumber value={Math.round(scenario.metaRev)} />/d
              </span>
            </div>
            {metaSpend === 0 ? (
              <Badge variant='outline' className='text-[10px] font-mono border-border text-muted-foreground bg-muted/60'>
                Stockout Throttled (Safe)
              </Badge>
            ) : (
              <Badge variant='outline' className='text-[10px] font-mono border-rose-500/40 text-rose-500 bg-rose-500/10'>
                ⚠️ Stockout Bleed Warning
              </Badge>
            )}
          </div>

          {/* Constraint Alert when spend is allocated to stockout SKU */}
          {metaSpend > 0 && (
            <div className='p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 space-y-0.5'>
              <span className='font-bold block'>⚠️ Inventory Constraint Warning:</span>
              <span>Nike Air Force 1 '07 has 0 units in stock. Allocating ₹{metaSpend}/d will leak spend into out-of-stock bounce exits.</span>
            </div>
          )}
        </div>

        {/* Google Search Slider Card */}
        <div className='p-4 rounded-xl bg-muted/30 border border-border space-y-3 transition-colors'>
          <div className='flex items-center justify-between text-xs font-bold'>
            <div className='flex items-center gap-2'>
              <GoogleLogo size={16} className='shrink-0' />
              <div>
                <span className='text-foreground block'>Google Search</span>
                <span className='text-[10px] text-muted-foreground font-normal'>Nike Epic React Flyknit 2</span>
              </div>
            </div>
            <div className='flex flex-col items-end'>
              <div className='flex items-baseline gap-1.5'>
                <span className='text-sm text-foreground font-bold font-mono'>
                  ₹<AnimatedNumber value={googleSpend} />/d
                </span>
                {googleSpend !== baseline.google && (
                  <span className={`text-[10px] font-semibold ${googleSpend > baseline.google ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {googleSpend > baseline.google ? `+₹${googleSpend - baseline.google}` : `-₹${baseline.google - googleSpend}`}
                  </span>
                )}
              </div>
              <span className='text-[9px] text-muted-foreground font-normal'>Baseline: ₹{baseline.google}/d</span>
            </div>
          </div>

          <div className='space-y-1.5'>
            <input
              type='range'
              min={200}
              max={1500}
              step={25}
              value={googleSpend}
              onChange={(e) => setGoogleSpend(Number(e.target.value))}
              className='w-full accent-emerald-500 cursor-pointer h-1.5 bg-muted rounded-lg'
            />
            <div className='flex justify-between text-[10px] text-muted-foreground'>
              <span>Min: ₹200</span>
              <span>K = ₹1,250/d</span>
              <span>Max: ₹1,500</span>
            </div>
          </div>

          {/* Quick Step Buttons */}
          <div className='flex items-center justify-between pt-1'>
            <div className='flex items-center gap-1.5'>
              <button
                type='button'
                onClick={() => setGoogleSpend(Math.max(200, googleSpend - 50))}
                className='px-2 py-0.5 rounded text-[10px] bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border'
              >
                -₹50
              </button>
              <button
                type='button'
                onClick={() => setGoogleSpend(Math.min(1500, googleSpend + 50))}
                className='px-2 py-0.5 rounded text-[10px] bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border'
              >
                +₹50
              </button>
            </div>
            <div className='text-[10px] text-muted-foreground font-mono'>
              mROAS: <span className='font-bold text-emerald-400'>{scenario.googleMroas.toFixed(2)}x</span>
            </div>
          </div>

          <div className='flex items-center justify-between text-[11px] pt-2 border-t border-border/60'>
            <div>
              <span className='text-muted-foreground text-[10px] block'>Forecasted Revenue</span>
              <span className='font-bold text-foreground font-mono'>
                ₹<AnimatedNumber value={Math.round(scenario.googleRev)} />/d
              </span>
            </div>
            <Badge variant='outline' className='text-[10px] font-mono border-emerald-500/30 text-emerald-400 bg-emerald-500/10'>
              In-Stock Hero (High Intent)
            </Badge>
          </div>
        </div>

        {/* Amazon SP Slider Card */}
        <div className='p-4 rounded-xl bg-muted/30 border border-border space-y-3 transition-colors'>
          <div className='flex items-center justify-between text-xs font-bold'>
            <div className='flex items-center gap-2'>
              <AmazonLogo size={16} className='shrink-0' />
              <div>
                <span className='text-foreground block'>Amazon SP</span>
                <span className='text-[10px] text-muted-foreground font-normal'>Air Jordan 10 Retro</span>
              </div>
            </div>
            <div className='flex flex-col items-end'>
              <div className='flex items-baseline gap-1.5'>
                <span className='text-sm text-foreground font-bold font-mono'>
                  ₹<AnimatedNumber value={amazonSpend} />/d
                </span>
                {amazonSpend !== baseline.amazon && (
                  <span className={`text-[10px] font-semibold ${amazonSpend > baseline.amazon ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {amazonSpend > baseline.amazon ? `+₹${amazonSpend - baseline.amazon}` : `-₹${baseline.amazon - amazonSpend}`}
                  </span>
                )}
              </div>
              <span className='text-[9px] text-muted-foreground font-normal'>Baseline: ₹{baseline.amazon}/d</span>
            </div>
          </div>

          <div className='space-y-1.5'>
            <input
              type='range'
              min={200}
              max={1500}
              step={25}
              value={amazonSpend}
              onChange={(e) => setAmazonSpend(Number(e.target.value))}
              className='w-full accent-amber-500 cursor-pointer h-1.5 bg-muted rounded-lg'
            />
            <div className='flex justify-between text-[10px] text-muted-foreground'>
              <span>Min: ₹200</span>
              <span>K = ₹700/d</span>
              <span>Max: ₹1,500</span>
            </div>
          </div>

          {/* Quick Step Buttons */}
          <div className='flex items-center justify-between pt-1'>
            <div className='flex items-center gap-1.5'>
              <button
                type='button'
                onClick={() => setAmazonSpend(Math.max(200, amazonSpend - 50))}
                className='px-2 py-0.5 rounded text-[10px] bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border'
              >
                -₹50
              </button>
              <button
                type='button'
                onClick={() => setAmazonSpend(Math.min(1500, amazonSpend + 50))}
                className='px-2 py-0.5 rounded text-[10px] bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border'
              >
                +₹50
              </button>
            </div>
            <div className='text-[10px] text-muted-foreground font-mono'>
              mROAS: <span className='font-bold text-amber-400'>{scenario.amazonMroas.toFixed(2)}x</span>
            </div>
          </div>

          <div className='flex items-center justify-between text-[11px] pt-2 border-t border-border/60'>
            <div>
              <span className='text-muted-foreground text-[10px] block'>Forecasted Revenue</span>
              <span className='font-bold text-foreground font-mono'>
                ₹<AnimatedNumber value={Math.round(scenario.amazonRev)} />/d
              </span>
            </div>
            <Badge variant='outline' className='text-[10px] font-mono border-amber-500/30 text-amber-400 bg-amber-500/10'>
              High Buy-Box (Elastic)
            </Badge>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. BUDGET DISTRIBUTION VISUALIZATION BAR (PHASE 4 & PHASE 8) */}
      {/* ============================================================ */}
      <div className='p-4 rounded-xl bg-muted/20 border border-border space-y-3'>
        <div className='flex flex-wrap items-center justify-between text-xs gap-2'>
          <span className='font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'>
            <Icons.normalization className='size-3.5 text-foreground' />
            Simulated Budget Distribution Comparison
          </span>
          <div className='flex items-center gap-3 text-xs'>
            <span className='text-muted-foreground'>Baseline: ₹{baseline.totalSpend}/d</span>
            <span className='text-foreground font-bold'>
              Scenario: ₹<AnimatedNumber value={scenario.totalSpend} />/d
            </span>
          </div>
        </div>

        {/* Side-by-Side Distribution Bars: Baseline vs Scenario */}
        <div className='space-y-2 pt-1'>
          {/* Baseline Allocation Bar */}
          <div className='space-y-1'>
            <div className='flex justify-between text-[10px] text-muted-foreground'>
              <span>CURRENT BASELINE ALLOCATION</span>
              <span>₹{baseline.totalSpend}/d</span>
            </div>
            <div className='h-2.5 w-full rounded-md overflow-hidden flex bg-muted/50 border border-border/40'>
              {baseMetaShare > 0 && (
                <div
                  className='bg-blue-500/60'
                  style={{ width: `${baseMetaShare}%` }}
                  title={`Meta: ${baseMetaShare.toFixed(1)}%`}
                />
              )}
              {baseGoogleShare > 0 && (
                <div
                  className='bg-emerald-500/70'
                  style={{ width: `${baseGoogleShare}%` }}
                  title={`Google: ${baseGoogleShare.toFixed(1)}%`}
                />
              )}
              {baseAmazonShare > 0 && (
                <div
                  className='bg-amber-500/70'
                  style={{ width: `${baseAmazonShare}%` }}
                  title={`Amazon: ${baseAmazonShare.toFixed(1)}%`}
                />
              )}
            </div>
          </div>

          {/* Scenario Allocation Bar (Animated) */}
          <div className='space-y-1'>
            <div className='flex justify-between text-[10px] text-foreground font-semibold'>
              <span className='flex items-center gap-1'>
                <span>WHAT-IF SCENARIO ALLOCATION</span>
                {hasSpendChanges && (
                  <span className='text-[9px] bg-primary/20 text-primary px-1.5 py-0.2 rounded font-bold'>
                    Live Dynamic Shift
                  </span>
                )}
              </span>
              <span>₹{scenario.totalSpend}/d</span>
            </div>
            <div className='h-3.5 w-full rounded-md overflow-hidden flex bg-muted/60 border border-border/60 shadow-inner'>
              {metaShare > 0 && (
                <div
                  className='bg-blue-500 transition-all duration-300'
                  style={{ width: `${metaShare}%` }}
                  title={`Meta Ads: ${metaShare.toFixed(1)}%`}
                />
              )}
              {googleShare > 0 && (
                <div
                  className='bg-emerald-500 transition-all duration-300'
                  style={{ width: `${googleShare}%` }}
                  title={`Google Search: ${googleShare.toFixed(1)}%`}
                />
              )}
              {amazonShare > 0 && (
                <div
                  className='bg-amber-500 transition-all duration-300'
                  style={{ width: `${amazonShare}%` }}
                  title={`Amazon SP: ${amazonShare.toFixed(1)}%`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Share Legends & Movement Indicators */}
        <div className='flex flex-wrap items-center justify-between text-[11px] pt-1.5 border-t border-border/40 gap-3'>
          <div className='flex flex-wrap items-center gap-4'>
            {/* Meta Share */}
            <div className='flex items-center gap-1.5'>
              <span className='size-2.5 rounded-xs bg-blue-500' />
              <span className='text-muted-foreground'>Meta:</span>
              <span className='text-foreground font-bold font-mono'>{metaShare.toFixed(1)}%</span>
              <span className='text-[10px] text-muted-foreground'>(₹{metaSpend}/d)</span>
              {metaSpend !== baseline.meta && (
                <span className={`text-[10px] font-bold ${metaSpend > baseline.meta ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {metaSpend > baseline.meta ? `↑ +₹${metaSpend - baseline.meta}` : `↓ -₹${baseline.meta - metaSpend}`}
                </span>
              )}
            </div>

            {/* Google Share */}
            <div className='flex items-center gap-1.5'>
              <span className='size-2.5 rounded-xs bg-emerald-500' />
              <span className='text-muted-foreground'>Google:</span>
              <span className='text-foreground font-bold font-mono'>{googleShare.toFixed(1)}%</span>
              <span className='text-[10px] text-muted-foreground'>(₹{googleSpend}/d)</span>
              {googleSpend !== baseline.google && (
                <span className={`text-[10px] font-bold ${googleSpend > baseline.google ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {googleSpend > baseline.google ? `↑ +₹${googleSpend - baseline.google}` : `↓ -₹${baseline.google - googleSpend}`}
                </span>
              )}
            </div>

            {/* Amazon Share */}
            <div className='flex items-center gap-1.5'>
              <span className='size-2.5 rounded-xs bg-amber-500' />
              <span className='text-muted-foreground'>Amazon:</span>
              <span className='text-foreground font-bold font-mono'>{amazonShare.toFixed(1)}%</span>
              <span className='text-[10px] text-muted-foreground'>(₹{amazonSpend}/d)</span>
              {amazonSpend !== baseline.amazon && (
                <span className={`text-[10px] font-bold ${amazonSpend > baseline.amazon ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {amazonSpend > baseline.amazon ? `↑ +₹${amazonSpend - baseline.amazon}` : `↓ -₹${baseline.amazon - amazonSpend}`}
                </span>
              )}
            </div>
          </div>

          <div className='text-[10px] text-muted-foreground font-mono'>
            {deltaSpend !== 0 ? (
              <span className={deltaSpend > 0 ? 'text-amber-500 font-semibold' : 'text-emerald-500 font-semibold'}>
                Net Shift: {deltaSpend > 0 ? `+₹${deltaSpend}` : `-₹${Math.abs(deltaSpend)}`}/day
              </span>
            ) : (
              <span>Capital Neutral (0 net capital delta)</span>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. BEFORE VS SCENARIO COMPARISON MATRIX (PHASE 5) */}
      {/* ============================================================ */}
      <div className='rounded-xl border border-border overflow-x-auto'>
        <div className='bg-muted/40 px-3.5 py-2.5 border-b border-border flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[580px]'>
          <span>Baseline Steady-State vs What-If Scenario Matrix</span>
          <span className='text-[10px] text-muted-foreground font-normal'>Real-Time Dynamic Recalculation</span>
        </div>

        <div className='divide-y divide-border/60 text-xs min-w-[580px]'>
          {/* Header Row */}
          <div className='grid grid-cols-4 p-2.5 bg-muted/10 font-bold text-muted-foreground text-[11px] uppercase tracking-wider'>
            <span>Metric</span>
            <span>Current Baseline</span>
            <span>What-If Scenario</span>
            <span className='text-right'>Variance (Change)</span>
          </div>

          {/* Row 1: Total Daily Budget */}
          <div className='grid grid-cols-4 p-2.5 items-center hover:bg-muted/20 transition-colors'>
            <span className='text-muted-foreground font-medium'>Total Daily Budget</span>
            <span className='text-muted-foreground font-mono'>₹{baseline.totalSpend.toLocaleString('en-IN')}/d</span>
            <span className='text-foreground font-bold font-mono'>
              ₹<AnimatedNumber value={scenario.totalSpend} />/d
            </span>
            <span className='text-right font-mono font-bold'>
              {deltaSpend === 0 ? (
                <span className='text-muted-foreground'>₹0 (Neutral)</span>
              ) : deltaSpend > 0 ? (
                <span className='text-amber-500'>+₹{deltaSpend.toLocaleString('en-IN')} (+{((deltaSpend / baseline.totalSpend) * 100).toFixed(1)}%)</span>
              ) : (
                <span className='text-emerald-500'>-₹{Math.abs(deltaSpend).toLocaleString('en-IN')} ({((deltaSpend / baseline.totalSpend) * 100).toFixed(1)}%)</span>
              )}
            </span>
          </div>

          {/* Row 2: Forecasted Revenue */}
          <div className='grid grid-cols-4 p-2.5 items-center hover:bg-muted/20 transition-colors'>
            <span className='text-muted-foreground font-medium'>Forecasted Revenue</span>
            <span className='text-muted-foreground font-mono'>₹{Math.round(baseline.totalRev).toLocaleString('en-IN')}/d</span>
            <span className='text-cyan-400 font-bold font-mono'>
              ₹<AnimatedNumber value={Math.round(scenario.totalRev)} />/d
            </span>
            <span className='text-right font-mono font-bold'>
              {deltaRevenue === 0 ? (
                <span className='text-muted-foreground'>₹0</span>
              ) : deltaRevenue > 0 ? (
                <span className='text-emerald-500'>+₹{Math.round(deltaRevenue).toLocaleString('en-IN')} (+{pctRevChange.toFixed(1)}%)</span>
              ) : (
                <span className='text-rose-500'>-₹{Math.abs(Math.round(deltaRevenue)).toLocaleString('en-IN')} ({pctRevChange.toFixed(1)}%)</span>
              )}
            </span>
          </div>

          {/* Row 3: Forecasted Blended ROAS */}
          <div className='grid grid-cols-4 p-2.5 items-center hover:bg-muted/20 transition-colors'>
            <span className='text-muted-foreground font-medium'>Forecasted Blended ROAS</span>
            <span className='text-muted-foreground font-mono'>{baseline.blendedRoas.toFixed(2)}x</span>
            <span className='text-foreground font-bold font-mono'>
              <AnimatedNumber value={scenario.blendedRoas} formatter={(v) => `${v.toFixed(2)}x`} />
            </span>
            <span className='text-right font-mono font-bold'>
              {deltaRoas === 0 ? (
                <span className='text-muted-foreground'>0.00x</span>
              ) : deltaRoas > 0 ? (
                <span className='text-emerald-500'>+{deltaRoas.toFixed(2)}x</span>
              ) : (
                <span className='text-rose-500'>{deltaRoas.toFixed(2)}x</span>
              )}
            </span>
          </div>

          {/* Row 4: Blended POAS */}
          <div className='grid grid-cols-4 p-2.5 items-center hover:bg-muted/20 transition-colors'>
            <span className='text-muted-foreground font-medium'>Blended POAS (Margin/Spend)</span>
            <span className='text-muted-foreground font-mono'>{baseline.poas.toFixed(2)}x</span>
            <span className='text-foreground font-bold font-mono'>
              <AnimatedNumber value={scenario.poas} formatter={(v) => `${v.toFixed(2)}x`} />
            </span>
            <span className='text-right font-mono font-bold'>
              {deltaPoas === 0 ? (
                <span className='text-muted-foreground'>0.00x</span>
              ) : deltaPoas > 0 ? (
                <span className='text-emerald-500'>+{deltaPoas.toFixed(2)}x</span>
              ) : (
                <span className='text-rose-500'>{deltaPoas.toFixed(2)}x</span>
              )}
            </span>
          </div>

          {/* Row 5: Net Contribution Margin */}
          <div className='grid grid-cols-4 p-2.5 items-center bg-muted/15 hover:bg-muted/25 transition-colors'>
            <span className='text-foreground font-bold flex items-center gap-1.5'>
              <Icons.sparkles className='size-3 text-emerald-400' />
              Net Contribution Margin
            </span>
            <span className='text-muted-foreground font-mono'>₹{Math.round(baseline.netContribution).toLocaleString('en-IN')}/d</span>
            <span className='text-emerald-400 font-bold font-mono'>
              ₹<AnimatedNumber value={Math.round(scenario.netContribution)} />/d
            </span>
            <span className='text-right font-mono font-bold'>
              {deltaMargin === 0 ? (
                <span className='text-muted-foreground'>₹0</span>
              ) : deltaMargin > 0 ? (
                <span className='text-emerald-400'>+₹{Math.round(deltaMargin).toLocaleString('en-IN')} (+{pctMarginChange.toFixed(1)}%)</span>
              ) : (
                <span className='text-rose-500'>-₹{Math.abs(Math.round(deltaMargin)).toLocaleString('en-IN')} ({pctMarginChange.toFixed(1)}%)</span>
              )}
            </span>
          </div>

          {/* Row 6: COGS (35%) */}
          <div className='grid grid-cols-4 p-2.5 items-center hover:bg-muted/20 transition-colors text-[11px] text-muted-foreground'>
            <span>Product COGS (35% Direct Cost)</span>
            <span className='font-mono'>₹{Math.round(baseline.cogs).toLocaleString('en-IN')}/d</span>
            <span className='font-mono text-foreground'>₹{Math.round(scenario.cogs).toLocaleString('en-IN')}/d</span>
            <span className='text-right font-mono'>
              {Math.round(scenario.cogs - baseline.cogs) >= 0 ? '+' : ''}₹{Math.round(scenario.cogs - baseline.cogs).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. MATHEMATICAL VISUALIZATION GRAPH (PHASE 6) */}
      {/* ============================================================ */}
      <div className='p-4 rounded-xl bg-muted/20 border border-border space-y-3'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
          <div>
            <h4 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
              <Icons.barChart className='size-3.5 text-foreground' />
              {activeChartMode === 'curve'
                ? 'Portfolio Media Response Curve (Hill Saturation)'
                : 'Channel-by-Channel Allocation & Revenue Comparison'}
            </h4>
            <p className='text-[10px] text-muted-foreground mt-0.5'>
              {activeChartMode === 'curve'
                ? 'Compares the continuous Hill diminishing returns curve under Baseline vs What-If Scenario allocations'
                : 'Direct channel-level comparison across Meta Ads, Google Search, Amazon SP, and Total Portfolio'}
            </p>
          </div>

          {/* Chart mode toggle */}
          <div className='flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border text-[11px]'>
            <button
              type='button'
              onClick={() => setActiveChartMode('curve')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all duration-75 active:scale-[0.96] ${
                activeChartMode === 'curve'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Response Curve
            </button>
            <button
              type='button'
              onClick={() => setActiveChartMode('breakdown')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all duration-75 active:scale-[0.96] ${
                activeChartMode === 'breakdown'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Channel Breakdown
            </button>
          </div>
        </div>

        {/* Graph display */}
        {activeChartMode === 'curve' ? (
          <div className='space-y-2'>
            <div className='flex flex-wrap items-center justify-between text-[11px] text-muted-foreground px-1 gap-2'>
              <div className='flex flex-wrap items-center gap-4'>
                <div className='flex items-center gap-1.5'>
                  <span className='size-2 rounded-full bg-cyan-400' />
                  <span className='text-foreground font-semibold'>Scenario Response Curve</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <span className='size-2 rounded-full bg-zinc-500' />
                  <span>Baseline Reference Curve</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <span className='size-2.5 rounded-full bg-zinc-400 border border-white' />
                  <span>Baseline Point (₹{baseline.totalSpend}, ₹{Math.round(baseline.totalRev)})</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <span className='size-2.5 rounded-full bg-emerald-400 border border-white shadow-xs' />
                  <span className='text-emerald-400 font-bold'>
                    Scenario Point (₹{scenario.totalSpend}, ₹{Math.round(scenario.totalRev)})
                  </span>
                </div>
              </div>
            </div>

            <div className='h-[240px] w-full pt-2'>
              <ResponsiveContainer width='100%' height='100%'>
                <ComposedChart data={responseCurveData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id='scenarioRevCurveGradient' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#06b6d4' stopOpacity={0.35} />
                      <stop offset='95%' stopColor='#06b6d4' stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='text-border/40' vertical={false} />
                  <XAxis
                    dataKey='spend'
                    type='number'
                    domain={[0, 3600]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#888', fontSize: 10 }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <YAxis
                    dataKey='scenarioRev'
                    type='number'
                    domain={[0, 'dataMax + 600']}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#888', fontSize: 10 }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip content={<CurveTooltip />} />

                  {/* Baseline Reference Curve (Dashed line) */}
                  <Line
                    type='monotone'
                    dataKey='baselineRev'
                    stroke='#71717a'
                    strokeWidth={1.5}
                    strokeDasharray='4 4'
                    dot={false}
                    isAnimationActive={false}
                  />

                  {/* Active Scenario Diminishing Returns Curve */}
                  <Area
                    type='monotone'
                    dataKey='scenarioRev'
                    stroke='#06b6d4'
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill='url(#scenarioRevCurveGradient)'
                    isAnimationActive={false}
                  />

                  {/* Current Baseline Reference Coordinate */}
                  <ReferenceDot
                    x={baseline.totalSpend}
                    y={Math.round(baseline.totalRev)}
                    r={6}
                    fill='#71717a'
                    stroke='#ffffff'
                    strokeWidth={2}
                  />

                  {/* Active Scenario Reference Coordinate */}
                  <ReferenceDot
                    x={scenario.totalSpend}
                    y={Math.round(scenario.totalRev)}
                    r={8}
                    fill='#10b981'
                    stroke='#ffffff'
                    strokeWidth={2.5}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-[11px] text-muted-foreground px-1'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1.5'>
                  <span className='size-2 rounded-xs bg-muted-foreground' />
                  <span>Current Baseline</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <span className='size-2 rounded-xs bg-blue-500' />
                  <span>Scenario Spend</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <span className='size-2 rounded-xs bg-emerald-500' />
                  <span className='text-foreground font-bold'>Scenario Revenue</span>
                </div>
              </div>
            </div>

            <div className='h-[240px] w-full pt-2'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={channelBreakdownData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }} barGap={4}>
                  <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='text-border/40' vertical={false} />
                  <XAxis dataKey='channel' tickLine={false} axisLine={false} tick={{ fill: '#888', fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#888', fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip content={<BreakdownTooltip />} />
                  <Bar dataKey='Current Spend' fill='#71717a' radius={[3, 3, 0, 0]} />
                  <Bar dataKey='Scenario Spend' fill='#3b82f6' radius={[3, 3, 0, 0]} />
                  <Bar dataKey='Scenario Revenue' fill='#10b981' radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 7, 8, 10 & 11: APPLIED SCENARIO VECTOR RESULT PANEL */}
      {/* ============================================================ */}
      {appliedVector && (
        <div className='p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 backdrop-blur-sm space-y-4 animate-in fade-in-0 duration-300'>
          <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3'>
            <div className='flex items-center gap-2'>
              <Icons.check className='size-4 text-emerald-400' />
              <span className='font-bold uppercase tracking-wider text-foreground text-xs'>
                Scenario Vector Applied To Dispatch Pipeline
              </span>
              <span className='text-[10px] bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full font-bold'>
                {appliedVector.timestamp}
              </span>
            </div>
            <div className='flex items-center gap-2 text-xs'>
              <span className='text-muted-foreground'>Projected Net Margin Lift:</span>
              <span className={`font-bold font-mono text-sm ${appliedVector.deltaMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {appliedVector.deltaMargin >= 0 ? '+' : ''}₹{Math.round(appliedVector.deltaMargin).toLocaleString('en-IN')}/day
                <span className='text-xs ml-1 font-normal'>
                  ({appliedVector.pctMarginChange >= 0 ? '+' : ''}{appliedVector.pctMarginChange.toFixed(1)}%)
                </span>
              </span>
            </div>
          </div>

          {/* Phase 8: Channel Vector Movement Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs'>
            {/* Meta Vector */}
            <div className='p-3 rounded-lg bg-background border border-border space-y-1.5 shadow-2xs'>
              <div className='text-[10px] text-muted-foreground uppercase flex items-center justify-between font-bold'>
                <span className='flex items-center gap-1.5 text-foreground'>
                  <MetaLogo size={12} />
                  Meta Ads
                </span>
                <span className={appliedVector.financials.meta > baseline.meta ? 'text-amber-500' : 'text-muted-foreground'}>
                  {appliedVector.financials.meta > baseline.meta ? `+₹${appliedVector.financials.meta - baseline.meta}` : '±₹0'}
                </span>
              </div>
              <div className='font-bold text-foreground font-mono flex items-center gap-2'>
                <span>₹{baseline.meta}/d</span>
                <Icons.arrowRight className='size-3 text-muted-foreground' />
                <span className='text-cyan-400'>₹{appliedVector.financials.meta}/d</span>
              </div>
              <div className='flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40'>
                <span>Rev Yield:</span>
                <span className='font-mono font-bold text-foreground'>
                  ₹{Math.round(appliedVector.financials.metaRev).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Google Vector */}
            <div className='p-3 rounded-lg bg-background border border-border space-y-1.5 shadow-2xs'>
              <div className='text-[10px] text-muted-foreground uppercase flex items-center justify-between font-bold'>
                <span className='flex items-center gap-1.5 text-foreground'>
                  <GoogleLogo size={12} />
                  Google Search
                </span>
                <span className={appliedVector.financials.google >= baseline.google ? 'text-emerald-500' : 'text-amber-500'}>
                  {appliedVector.financials.google >= baseline.google
                    ? `+₹${appliedVector.financials.google - baseline.google}`
                    : `-₹${baseline.google - appliedVector.financials.google}`}
                </span>
              </div>
              <div className='font-bold text-foreground font-mono flex items-center gap-2'>
                <span>₹{baseline.google}/d</span>
                <Icons.arrowRight className='size-3 text-muted-foreground' />
                <span className='text-emerald-400'>₹{appliedVector.financials.google}/d</span>
              </div>
              <div className='flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40'>
                <span>Rev Yield:</span>
                <span className='font-mono font-bold text-foreground'>
                  ₹{Math.round(appliedVector.financials.googleRev).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Amazon Vector */}
            <div className='p-3 rounded-lg bg-background border border-border space-y-1.5 shadow-2xs'>
              <div className='text-[10px] text-muted-foreground uppercase flex items-center justify-between font-bold'>
                <span className='flex items-center gap-1.5 text-foreground'>
                  <AmazonLogo size={12} />
                  Amazon SP
                </span>
                <span className={appliedVector.financials.amazon >= baseline.amazon ? 'text-emerald-500' : 'text-amber-500'}>
                  {appliedVector.financials.amazon >= baseline.amazon
                    ? `+₹${appliedVector.financials.amazon - baseline.amazon}`
                    : `-₹${baseline.amazon - appliedVector.financials.amazon}`}
                </span>
              </div>
              <div className='font-bold text-foreground font-mono flex items-center gap-2'>
                <span>₹{baseline.amazon}/d</span>
                <Icons.arrowRight className='size-3 text-muted-foreground' />
                <span className='text-amber-400'>₹{appliedVector.financials.amazon}/d</span>
              </div>
              <div className='flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40'>
                <span>Rev Yield:</span>
                <span className='font-mono font-bold text-foreground'>
                  ₹{Math.round(appliedVector.financials.amazonRev).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Phase 10: Financial Impact Summary Tiles */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono'>
            <div className='p-2.5 rounded-lg bg-background/60 border border-border'>
              <span className='text-[10px] text-muted-foreground block'>Projected Revenue</span>
              <span className='font-bold text-cyan-400'>
                {appliedVector.pctRevChange >= 0 ? '+' : ''}{appliedVector.pctRevChange.toFixed(1)}%
              </span>
              <span className='text-[10px] text-muted-foreground block'>
                (+₹{Math.round(appliedVector.deltaRevenue).toLocaleString('en-IN')}/d)
              </span>
            </div>
            <div className='p-2.5 rounded-lg bg-background/60 border border-border'>
              <span className='text-[10px] text-muted-foreground block'>ROAS Shift</span>
              <span className={`font-bold ${appliedVector.deltaRoas >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {appliedVector.deltaRoas >= 0 ? '+' : ''}{appliedVector.deltaRoas.toFixed(2)}x
              </span>
              <span className='text-[10px] text-muted-foreground block'>
                {baseline.blendedRoas.toFixed(2)}x → {appliedVector.financials.blendedRoas.toFixed(2)}x
              </span>
            </div>
            <div className='p-2.5 rounded-lg bg-background/60 border border-border'>
              <span className='text-[10px] text-muted-foreground block'>Margin Expansion</span>
              <span className={`font-bold ${appliedVector.pctMarginChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {appliedVector.pctMarginChange >= 0 ? '+' : ''}{appliedVector.pctMarginChange.toFixed(1)}%
              </span>
              <span className='text-[10px] text-muted-foreground block'>
                (+₹{Math.round(appliedVector.deltaMargin).toLocaleString('en-IN')}/d)
              </span>
            </div>
            <div className='p-2.5 rounded-lg bg-background/60 border border-border'>
              <span className='text-[10px] text-muted-foreground block'>POAS (Gross Yield)</span>
              <span className='font-bold text-foreground'>
                {appliedVector.financials.poas.toFixed(2)}x
              </span>
              <span className='text-[10px] text-muted-foreground block'>
                {appliedVector.financials.poas >= baseline.poas ? '+Yield Accretive' : '-Yield Dilutive'}
              </span>
            </div>
          </div>

          {/* Phase 11: Dynamic Why It Matters / Economic Rationale */}
          <div className='p-3.5 rounded-lg bg-background border border-border text-xs space-y-2'>
            <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'>
              <Icons.info className='size-3 text-foreground' />
              Optimizer Why It Matters Rationale
            </span>
            <ul className='space-y-1.5 text-[11px] text-muted-foreground'>
              {scenarioExplanation.map((reason, idx) => (
                <li key={idx} className='flex items-start gap-2'>
                  <span className='text-foreground font-bold mt-0.5'>•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
