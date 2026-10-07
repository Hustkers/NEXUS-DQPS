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
    beta: 4500.0,
    eta: 1.75,
    K: 850.0,
    baselineSpend: 0,
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
  const variableCosts = totalRev * 0.03;
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

// Smooth animated number component
function AnimatedNumber({
  value,
  formatter = (v: number) => Math.round(v).toLocaleString('en-IN'),
  duration = 320
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
    <div className='rounded-lg border border-border bg-popover/95 backdrop-blur-md p-2.5 shadow-xl font-mono text-xs text-popover-foreground space-y-1 min-w-[190px]'>
      <div className='text-muted-foreground text-[10px] font-bold uppercase tracking-wider border-b border-border/60 pb-1 flex justify-between'>
        <span>Daily Spend</span>
        <span className='text-foreground'>₹{d.spend.toLocaleString('en-IN')}</span>
      </div>
      <div className='flex items-center justify-between'>
        <span className='text-muted-foreground text-[11px]'>Baseline:</span>
        <span className='text-muted-foreground font-semibold'>₹{d.baselineRev.toLocaleString('en-IN')}</span>
      </div>
      <div className='flex items-center justify-between'>
        <span className='text-cyan-400 font-bold'>Scenario:</span>
        <span className='text-cyan-400 font-bold'>₹{d.scenarioRev.toLocaleString('en-IN')}</span>
      </div>
      {diffRev !== 0 && (
        <div className='flex items-center justify-between text-[10px]'>
          <span className='text-muted-foreground'>Lift:</span>
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
    <div className='rounded-lg border border-border bg-popover/95 backdrop-blur-md p-2.5 shadow-xl font-mono text-xs text-popover-foreground space-y-1 min-w-[200px]'>
      <div className='font-bold text-foreground border-b border-border/60 pb-1 flex justify-between'>
        <span>{d.channel}</span>
      </div>
      <div className='flex justify-between text-[11px]'>
        <span className='text-muted-foreground'>Spend:</span>
        <span className='font-mono text-foreground font-semibold'>
          ₹{d['Current Spend']} → ₹{d['Scenario Spend']}
        </span>
      </div>
      {spendDiff !== 0 && (
        <div className='flex justify-end text-[10px]'>
          <span className={spendDiff > 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
            {spendDiff > 0 ? `+₹${spendDiff}` : `-₹${Math.abs(spendDiff)}`}
          </span>
        </div>
      )}
      <div className='flex justify-between text-[11px] pt-1 border-t border-border/60'>
        <span className='text-cyan-400 font-semibold'>Revenue:</span>
        <span className='font-mono text-cyan-400 font-bold'>
          ₹{d['Current Revenue']} → ₹{d['Scenario Revenue']}
        </span>
      </div>
      {revDiff !== 0 && (
        <div className='flex justify-end text-[10px]'>
          <span className={revDiff > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {revDiff > 0 ? `+₹${revDiff}` : `-₹${Math.abs(revDiff)}`}
          </span>
        </div>
      )}
    </div>
  );
}

export function ScenarioSandbox({
  onApplyReallocation
}: {
  onApplyReallocation?: (alloc: ScenarioAllocationVector) => void;
}) {
  const baseline = useMemo(() => {
    return computeFinancials(
      CHANNEL_MODELS.meta.baselineSpend,
      CHANNEL_MODELS.google.baselineSpend,
      CHANNEL_MODELS.amazon.baselineSpend
    );
  }, []);

  const [metaSpend, setMetaSpend] = useState<number>(CHANNEL_MODELS.meta.baselineSpend);
  const [googleSpend, setGoogleSpend] = useState<number>(CHANNEL_MODELS.google.baselineSpend);
  const [amazonSpend, setAmazonSpend] = useState<number>(CHANNEL_MODELS.amazon.baselineSpend);

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

  const scenario = useMemo(() => {
    return computeFinancials(metaSpend, googleSpend, amazonSpend);
  }, [metaSpend, googleSpend, amazonSpend]);

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

  const responseCurveData = useMemo(() => {
    const points: Array<{
      spend: number;
      baselineRev: number;
      scenarioRev: number;
      scenarioMargin: number;
    }> = [];

    const baseTotal = baseline.totalSpend > 0 ? baseline.totalSpend : 1375;
    const baseMWeight = baseline.meta / baseTotal;
    const baseGWeight = baseline.google / baseTotal;
    const baseAWeight = baseline.amazon / baseTotal;

    const scenTotal = scenario.totalSpend > 0 ? scenario.totalSpend : 1;
    const scenMWeight = scenario.meta / scenTotal;
    const scenGWeight = scenario.google / scenTotal;
    const scenAWeight = scenario.amazon / scenTotal;

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
        description: `Meta: ₹${metaSpend}/d • Google: ₹${googleSpend}/d • Amazon: ₹${amazonSpend}/d. Net Margin Lift: ${deltaMargin >= 0 ? '+' : ''}₹${Math.round(deltaMargin).toLocaleString('en-IN')}/d.`
      });
    }, 600);
  };

  const handleReset = () => {
    setMetaSpend(CHANNEL_MODELS.meta.baselineSpend);
    setGoogleSpend(CHANNEL_MODELS.google.baselineSpend);
    setAmazonSpend(CHANNEL_MODELS.amazon.baselineSpend);
    setAppliedVector(null);
    setJustApplied(false);
    toast.info('Sandbox Reset to Baseline Steady-State');
  };

  const applyPreset = (preset: 'optimal' | 'aggressive' | 'conservative' | 'baseline') => {
    if (preset === 'baseline') {
      handleReset();
    } else if (preset === 'optimal') {
      setMetaSpend(0);
      setGoogleSpend(950);
      setAmazonSpend(800);
      toast.success('Loaded SLSQP Optimal Preset');
    } else if (preset === 'aggressive') {
      setMetaSpend(0);
      setGoogleSpend(1200);
      setAmazonSpend(1050);
      toast.success('Loaded Aggressive Growth Preset');
    } else if (preset === 'conservative') {
      setMetaSpend(0);
      setGoogleSpend(500);
      setAmazonSpend(450);
      toast.success('Loaded Capital Conservation Preset');
    }
  };

  const metaShare = scenario.totalSpend > 0 ? (scenario.meta / scenario.totalSpend) * 100 : 0;
  const googleShare = scenario.totalSpend > 0 ? (scenario.google / scenario.totalSpend) * 100 : 0;
  const amazonShare = scenario.totalSpend > 0 ? (scenario.amazon / scenario.totalSpend) * 100 : 0;

  return (
    <Card className='p-4 sm:p-5 border border-border bg-card shadow-none rounded-xl text-card-foreground font-mono min-w-0 max-w-full overflow-hidden space-y-5'>
      {/* 1. HEADER BAR & CONTROLS */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3.5'>
        <div className='flex items-center gap-2'>
          <Icons.sliders className='size-4 text-primary' />
          <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
            What-If Scenario Sandbox
          </h3>
          <span className='text-[10px] bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full font-bold'>
            SLSQP Hill Engine
          </span>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <div className='hidden sm:flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border text-[10px]'>
            <span className='text-muted-foreground px-1 font-bold uppercase'>Presets:</span>
            <button
              type='button'
              onClick={() => applyPreset('optimal')}
              className='px-2 py-0.5 rounded bg-background/80 hover:bg-background text-foreground border border-border transition-all active:scale-[0.96] font-semibold'
            >
              Optimal
            </button>
            <button
              type='button'
              onClick={() => applyPreset('aggressive')}
              className='px-2 py-0.5 rounded bg-background/80 hover:bg-background text-foreground border border-border transition-all active:scale-[0.96] font-semibold'
            >
              Aggressive
            </button>
            <button
              type='button'
              onClick={() => applyPreset('conservative')}
              className='px-2 py-0.5 rounded bg-background/80 hover:bg-background text-foreground border border-border transition-all active:scale-[0.96] font-semibold'
            >
              Conservative
            </button>
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={handleReset}
            disabled={isSimulating || (!hasSpendChanges && !appliedVector)}
            className='h-7 px-2.5 text-xs font-mono border-border bg-muted/30 text-foreground hover:bg-muted font-semibold active:scale-[0.97] rounded-lg disabled:opacity-40'
          >
            <Icons.clock className='mr-1 size-3 text-muted-foreground' />
            Reset
          </Button>

          <Button
            size='sm'
            onClick={handleApply}
            disabled={isSimulating}
            className={`h-7 px-3 text-xs font-mono font-bold border-none active:scale-[0.97] rounded-lg transition-all shadow-xs ${
              justApplied
                ? 'bg-emerald-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            } disabled:opacity-50`}
          >
            {isSimulating ? (
              <>
                <Icons.spinner className='mr-1.5 size-3 animate-spin' />
                Simulating...
              </>
            ) : justApplied || (appliedVector && !hasSpendChanges) ? (
              <>
                <Icons.check className='mr-1.5 size-3' />
                Applied ✓
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

      {/* 2. PRIORITIZED 5 KPIS: TOTAL BUDGET, FORECAST REVENUE, ROAS, POAS, NET MARGIN */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5'>
        {/* KPI 1: TOTAL BUDGET */}
        <div className='p-3 rounded-lg border border-border bg-muted/20 space-y-1'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            <span>TOTAL BUDGET</span>
            <span className='font-mono text-[9px]'>₹{baseline.totalSpend}/d</span>
          </div>
          <div className='text-base sm:text-lg font-bold text-foreground font-mono'>
            ₹<AnimatedNumber value={scenario.totalSpend} />/d
          </div>
          <div className='text-[10px] font-mono'>
            {deltaSpend === 0 ? (
              <span className='text-muted-foreground'>Neutral (₹0)</span>
            ) : deltaSpend > 0 ? (
              <span className='text-amber-500 font-semibold'>+₹{deltaSpend.toLocaleString('en-IN')}</span>
            ) : (
              <span className='text-emerald-500 font-semibold'>-₹{Math.abs(deltaSpend).toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>

        {/* KPI 2: FORECAST REVENUE */}
        <div className='p-3 rounded-lg border border-border bg-muted/20 space-y-1'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            <span>FORECAST REVENUE</span>
            <span className='font-mono text-[9px]'>₹{Math.round(baseline.totalRev).toLocaleString('en-IN')}</span>
          </div>
          <div className='text-base sm:text-lg font-bold text-cyan-400 font-mono'>
            ₹<AnimatedNumber value={Math.round(scenario.totalRev)} />/d
          </div>
          <div className='text-[10px] font-mono'>
            {deltaRevenue === 0 ? (
              <span className='text-muted-foreground'>Baseline</span>
            ) : deltaRevenue > 0 ? (
              <span className='text-emerald-500 font-bold'>+{pctRevChange.toFixed(1)}%</span>
            ) : (
              <span className='text-rose-500 font-bold'>{pctRevChange.toFixed(1)}%</span>
            )}
          </div>
        </div>

        {/* KPI 3: ROAS */}
        <div className='p-3 rounded-lg border border-border bg-muted/20 space-y-1'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            <span>ROAS</span>
            <span className='font-mono text-[9px]'>{baseline.blendedRoas.toFixed(2)}x</span>
          </div>
          <div className='text-base sm:text-lg font-bold text-foreground font-mono'>
            <AnimatedNumber
              value={scenario.blendedRoas}
              formatter={(v) => `${v.toFixed(2)}x`}
            />
          </div>
          <div className='text-[10px] font-mono'>
            {deltaRoas === 0 ? (
              <span className='text-muted-foreground'>±0.00x</span>
            ) : deltaRoas > 0 ? (
              <span className='text-emerald-500 font-bold'>+{deltaRoas.toFixed(2)}x</span>
            ) : (
              <span className='text-rose-500 font-bold'>{deltaRoas.toFixed(2)}x</span>
            )}
          </div>
        </div>

        {/* KPI 4: POAS */}
        <div className='p-3 rounded-lg border border-border bg-muted/20 space-y-1'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            <span>POAS</span>
            <span className='font-mono text-[9px]'>{baseline.poas.toFixed(2)}x</span>
          </div>
          <div className='text-base sm:text-lg font-bold text-foreground font-mono'>
            <AnimatedNumber
              value={scenario.poas}
              formatter={(v) => `${v.toFixed(2)}x`}
            />
          </div>
          <div className='text-[10px] font-mono'>
            {deltaPoas === 0 ? (
              <span className='text-muted-foreground'>±0.00x</span>
            ) : deltaPoas > 0 ? (
              <span className='text-emerald-500 font-bold'>+{deltaPoas.toFixed(2)}x</span>
            ) : (
              <span className='text-rose-500 font-bold'>{deltaPoas.toFixed(2)}x</span>
            )}
          </div>
        </div>

        {/* KPI 5: NET MARGIN */}
        <div className='p-3 rounded-lg border border-border bg-emerald-500/10 space-y-1 col-span-2 sm:col-span-1'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            <span className='text-emerald-400 font-bold flex items-center gap-1'>
              <Icons.sparkles className='size-3' />
              NET MARGIN
            </span>
            <span className='font-mono text-[9px]'>₹{Math.round(baseline.netContribution).toLocaleString('en-IN')}</span>
          </div>
          <div className='text-base sm:text-lg font-bold text-emerald-400 font-mono'>
            ₹<AnimatedNumber value={Math.round(scenario.netContribution)} />/d
          </div>
          <div className='text-[10px] font-mono'>
            {deltaMargin === 0 ? (
              <span className='text-muted-foreground'>₹0</span>
            ) : deltaMargin > 0 ? (
              <span className='text-emerald-400 font-bold'>+{pctMarginChange.toFixed(1)}%</span>
            ) : (
              <span className='text-rose-500 font-bold'>{pctMarginChange.toFixed(1)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. VISUAL CHANNEL ALLOCATION BARS + SLIDERS */}
      <div className='p-4 rounded-xl bg-muted/20 border border-border space-y-4'>
        <div className='flex items-center justify-between text-xs'>
          <span className='font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'>
            <Icons.normalization className='size-3.5 text-foreground' />
            Visual Channel Allocation
          </span>
          <span className='text-xs font-mono font-bold text-foreground'>
            ₹<AnimatedNumber value={scenario.totalSpend} />/day total
          </span>
        </div>

        {/* Horizontal Visual Channel Bars: Meta, Google, Amazon */}
        <div className='space-y-2.5 font-mono text-xs'>
          {/* Meta Bar */}
          <div className='space-y-1'>
            <div className='flex items-center justify-between text-[11px]'>
              <div className='flex items-center gap-1.5 font-bold'>
                <MetaLogo size={12} />
                <span>Meta Ads</span>
                <span className='text-[10px] text-muted-foreground font-normal'>(Air Force 1 - Stockout)</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-foreground font-bold'>₹{metaSpend}/d</span>
                <span className='text-muted-foreground text-[10px]'>{metaShare.toFixed(0)}%</span>
              </div>
            </div>
            <div className='h-2 w-full rounded bg-muted/60 overflow-hidden'>
              <div
                className='h-full bg-blue-500 transition-all duration-300'
                style={{ width: `${Math.max(metaShare, 0)}%` }}
              />
            </div>
          </div>

          {/* Google Bar */}
          <div className='space-y-1'>
            <div className='flex items-center justify-between text-[11px]'>
              <div className='flex items-center gap-1.5 font-bold'>
                <GoogleLogo size={12} />
                <span>Google Search</span>
                <span className='text-[10px] text-muted-foreground font-normal'>(Epic React - In-Stock)</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-foreground font-bold'>₹{googleSpend}/d</span>
                <span className='text-muted-foreground text-[10px]'>{googleShare.toFixed(0)}%</span>
              </div>
            </div>
            <div className='h-2 w-full rounded bg-muted/60 overflow-hidden'>
              <div
                className='h-full bg-emerald-500 transition-all duration-300'
                style={{ width: `${Math.max(googleShare, 0)}%` }}
              />
            </div>
          </div>

          {/* Amazon Bar */}
          <div className='space-y-1'>
            <div className='flex items-center justify-between text-[11px]'>
              <div className='flex items-center gap-1.5 font-bold'>
                <AmazonLogo size={12} />
                <span>Amazon SP</span>
                <span className='text-[10px] text-muted-foreground font-normal'>(Air Jordan 10)</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-foreground font-bold'>₹{amazonSpend}/d</span>
                <span className='text-muted-foreground text-[10px]'>{amazonShare.toFixed(0)}%</span>
              </div>
            </div>
            <div className='h-2 w-full rounded bg-muted/60 overflow-hidden'>
              <div
                className='h-full bg-amber-500 transition-all duration-300'
                style={{ width: `${Math.max(amazonShare, 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-border/50'>
          {/* Meta Slider */}
          <div className='p-3 rounded-lg bg-card border border-border space-y-2'>
            <div className='flex items-center justify-between text-xs'>
              <span className='font-bold text-foreground'>Meta Spend</span>
              <span className='font-mono font-bold text-foreground'>₹{metaSpend}/d</span>
            </div>
            <input
              type='range'
              min={0}
              max={1500}
              step={25}
              value={metaSpend}
              onChange={(e) => setMetaSpend(Number(e.target.value))}
              className='w-full accent-blue-500 cursor-pointer h-1.5 bg-muted rounded-lg'
            />
            <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
              <span>mROAS: {scenario.metaMroas.toFixed(2)}x</span>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  onClick={() => setMetaSpend(Math.max(0, metaSpend - 50))}
                  className='px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80'
                >
                  -50
                </button>
                <button
                  type='button'
                  onClick={() => setMetaSpend(Math.min(1500, metaSpend + 50))}
                  className='px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80'
                >
                  +50
                </button>
              </div>
            </div>
          </div>

          {/* Google Slider */}
          <div className='p-3 rounded-lg bg-card border border-border space-y-2'>
            <div className='flex items-center justify-between text-xs'>
              <span className='font-bold text-foreground'>Google Spend</span>
              <span className='font-mono font-bold text-foreground'>₹{googleSpend}/d</span>
            </div>
            <input
              type='range'
              min={200}
              max={1500}
              step={25}
              value={googleSpend}
              onChange={(e) => setGoogleSpend(Number(e.target.value))}
              className='w-full accent-emerald-500 cursor-pointer h-1.5 bg-muted rounded-lg'
            />
            <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
              <span>mROAS: {scenario.googleMroas.toFixed(2)}x</span>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  onClick={() => setGoogleSpend(Math.max(200, googleSpend - 50))}
                  className='px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80'
                >
                  -50
                </button>
                <button
                  type='button'
                  onClick={() => setGoogleSpend(Math.min(1500, googleSpend + 50))}
                  className='px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80'
                >
                  +50
                </button>
              </div>
            </div>
          </div>

          {/* Amazon Slider */}
          <div className='p-3 rounded-lg bg-card border border-border space-y-2'>
            <div className='flex items-center justify-between text-xs'>
              <span className='font-bold text-foreground'>Amazon Spend</span>
              <span className='font-mono font-bold text-foreground'>₹{amazonSpend}/d</span>
            </div>
            <input
              type='range'
              min={200}
              max={1500}
              step={25}
              value={amazonSpend}
              onChange={(e) => setAmazonSpend(Number(e.target.value))}
              className='w-full accent-amber-500 cursor-pointer h-1.5 bg-muted rounded-lg'
            />
            <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
              <span>mROAS: {scenario.amazonMroas.toFixed(2)}x</span>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  onClick={() => setAmazonSpend(Math.max(200, amazonSpend - 50))}
                  className='px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80'
                >
                  -50
                </button>
                <button
                  type='button'
                  onClick={() => setAmazonSpend(Math.min(1500, amazonSpend + 50))}
                  className='px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80'
                >
                  +50
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE RESPONSE CURVE */}
      <div className='p-4 rounded-xl bg-muted/20 border border-border space-y-3'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-2.5'>
          <h4 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
            <Icons.barChart className='size-3.5 text-foreground' />
            Portfolio Media Response Curve
          </h4>

          <div className='flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border text-[11px]'>
            <button
              type='button'
              onClick={() => setActiveChartMode('curve')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
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
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                activeChartMode === 'breakdown'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Breakdown
            </button>
          </div>
        </div>

        {activeChartMode === 'curve' ? (
          <div className='space-y-1'>
            <div className='flex flex-wrap items-center justify-between text-[10px] text-muted-foreground px-1 gap-3'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-1'>
                  <span className='size-2 rounded-full bg-cyan-400' />
                  <span className='text-foreground font-semibold'>Scenario Curve</span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='size-2 rounded-full bg-zinc-500' />
                  <span>Baseline</span>
                </div>
              </div>
              <div className='flex items-center gap-3 font-mono'>
                <span>Baseline: ₹{baseline.totalSpend} / ₹{Math.round(baseline.totalRev)}</span>
                <span className='text-emerald-400 font-bold'>
                  Scenario: ₹{scenario.totalSpend} / ₹{Math.round(scenario.totalRev)}
                </span>
              </div>
            </div>

            <div className='h-[220px] w-full pt-1'>
              <ResponsiveContainer width='100%' height='100%'>
                <ComposedChart data={responseCurveData} margin={{ top: 10, right: 15, left: 5, bottom: 5 }}>
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

                  <Line
                    type='monotone'
                    dataKey='baselineRev'
                    stroke='#71717a'
                    strokeWidth={1.5}
                    strokeDasharray='4 4'
                    dot={false}
                    isAnimationActive={false}
                  />

                  <Area
                    type='monotone'
                    dataKey='scenarioRev'
                    stroke='#06b6d4'
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill='url(#scenarioRevCurveGradient)'
                    isAnimationActive={false}
                  />

                  <ReferenceDot
                    x={baseline.totalSpend}
                    y={Math.round(baseline.totalRev)}
                    r={5}
                    fill='#71717a'
                    stroke='#ffffff'
                    strokeWidth={1.5}
                  />

                  <ReferenceDot
                    x={scenario.totalSpend}
                    y={Math.round(scenario.totalRev)}
                    r={6}
                    fill='#10b981'
                    stroke='#ffffff'
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className='h-[220px] w-full pt-1'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={channelBreakdownData} margin={{ top: 10, right: 15, left: 5, bottom: 5 }} barGap={4}>
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
        )}
      </div>

      {/* 5. COMPACT COMPARISON TABLE */}
      <div className='rounded-xl border border-border overflow-x-auto'>
        <div className='bg-muted/40 px-3 py-2 border-b border-border flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[540px]'>
          <span>Comparison Matrix</span>
          <span className='text-[10px] text-muted-foreground font-normal'>Dynamic Recalculation</span>
        </div>

        <div className='divide-y divide-border/60 text-xs min-w-[540px]'>
          <div className='grid grid-cols-4 p-2 bg-muted/10 font-bold text-muted-foreground text-[10px] uppercase tracking-wider'>
            <span>Metric</span>
            <span>Current</span>
            <span>Scenario</span>
            <span className='text-right'>Variance</span>
          </div>

          {/* Row 1 */}
          <div className='grid grid-cols-4 p-2 items-center hover:bg-muted/20 transition-colors'>
            <span className='text-muted-foreground'>Total Budget</span>
            <span className='text-muted-foreground font-mono'>₹{baseline.totalSpend}/d</span>
            <span className='text-foreground font-bold font-mono'>₹<AnimatedNumber value={scenario.totalSpend} />/d</span>
            <span className='text-right font-mono font-semibold'>
              {deltaSpend === 0 ? '±0' : deltaSpend > 0 ? `+₹${deltaSpend}` : `-₹${Math.abs(deltaSpend)}`}
            </span>
          </div>

          {/* Row 2 */}
          <div className='grid grid-cols-4 p-2 items-center hover:bg-muted/20 transition-colors'>
            <span className='text-muted-foreground'>Forecast Revenue</span>
            <span className='text-muted-foreground font-mono'>₹{Math.round(baseline.totalRev).toLocaleString('en-IN')}/d</span>
            <span className='text-cyan-400 font-bold font-mono'>₹<AnimatedNumber value={Math.round(scenario.totalRev)} />/d</span>
            <span className='text-right font-mono font-semibold'>
              {deltaRevenue >= 0 ? `+${pctRevChange.toFixed(1)}%` : `${pctRevChange.toFixed(1)}%`}
            </span>
          </div>

          {/* Row 3 */}
          <div className='grid grid-cols-4 p-2 items-center hover:bg-muted/20 transition-colors'>
            <span className='text-muted-foreground'>Blended ROAS</span>
            <span className='text-muted-foreground font-mono'>{baseline.blendedRoas.toFixed(2)}x</span>
            <span className='text-foreground font-bold font-mono'>{scenario.blendedRoas.toFixed(2)}x</span>
            <span className='text-right font-mono font-semibold'>
              {deltaRoas >= 0 ? `+${deltaRoas.toFixed(2)}x` : `${deltaRoas.toFixed(2)}x`}
            </span>
          </div>

          {/* Row 4 */}
          <div className='grid grid-cols-4 p-2 items-center hover:bg-muted/20 transition-colors'>
            <span className='text-muted-foreground'>Blended POAS</span>
            <span className='text-muted-foreground font-mono'>{baseline.poas.toFixed(2)}x</span>
            <span className='text-foreground font-bold font-mono'>{scenario.poas.toFixed(2)}x</span>
            <span className='text-right font-mono font-semibold'>
              {deltaPoas >= 0 ? `+${deltaPoas.toFixed(2)}x` : `${deltaPoas.toFixed(2)}x`}
            </span>
          </div>

          {/* Row 5 */}
          <div className='grid grid-cols-4 p-2 items-center bg-muted/15 font-bold hover:bg-muted/25 transition-colors'>
            <span className='text-emerald-400 flex items-center gap-1'>
              <Icons.sparkles className='size-3' />
              Net Margin
            </span>
            <span className='text-muted-foreground font-mono font-normal'>₹{Math.round(baseline.netContribution).toLocaleString('en-IN')}/d</span>
            <span className='text-emerald-400 font-mono'>₹<AnimatedNumber value={Math.round(scenario.netContribution)} />/d</span>
            <span className='text-right font-mono text-emerald-400'>
              {deltaMargin >= 0 ? `+${pctMarginChange.toFixed(1)}%` : `${pctMarginChange.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* 6. APPLIED CONFIRMATION TILE (ONLY VISIBLE ON APPLICATION) */}
      {appliedVector && (
        <div className='p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/20 text-xs flex items-center justify-between gap-3 font-mono animate-in fade-in-0 duration-200'>
          <div className='flex items-center gap-2'>
            <Icons.check className='size-4 text-emerald-400' />
            <span className='font-bold text-foreground uppercase'>Applied Vector at {appliedVector.timestamp}</span>
          </div>
          <div className='flex items-center gap-3'>
            <span className='text-muted-foreground'>Net Margin Lift:</span>
            <span className='font-bold text-emerald-400 font-mono'>
              {appliedVector.deltaMargin >= 0 ? '+' : ''}₹{Math.round(appliedVector.deltaMargin).toLocaleString('en-IN')}/day
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
