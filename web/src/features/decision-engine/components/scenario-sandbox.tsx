'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { MetaLogo, GoogleLogo, AmazonLogo } from '@/components/icons/platform-logos';
import {
  AreaChart,
  Area,
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
  totalSpend: number;
  totalRev: number;
  netContribution: number;
  blendedRoas: number;
  poas: number;
}

// Evaluate non-linear Hill saturation function: Hill(x) = beta * (x^eta) / (K^eta + x^eta)
function evalHillRev(channel: 'meta' | 'google' | 'amazon', spend: number): number {
  if (spend <= 0) return 0;
  const { beta, eta, K } = CHANNEL_MODELS[channel];
  const xPow = Math.pow(spend, eta);
  const kPow = Math.pow(K, eta);
  return beta * (xPow / (kPow + xPow));
}

// Compute unit economics & financial projections
function computeFinancials(meta: number, google: number, amazon: number) {
  const metaRev = evalHillRev('meta', meta);
  const googleRev = evalHillRev('google', google);
  const amazonRev = evalHillRev('amazon', amazon);

  const totalSpend = meta + google + amazon;
  const totalRev = metaRev + googleRev + amazonRev;
  const cogs = totalRev * 0.35;
  const grossMargin = totalRev - cogs;
  const variableCosts = totalRev * 0.03; // Ad network transaction & processing fees
  const netContribution = grossMargin - totalSpend - variableCosts;
  const blendedRoas = totalSpend > 0 ? totalRev / totalSpend : 0;
  const poas = totalSpend > 0 ? grossMargin / totalSpend : 0;

  return {
    meta,
    google,
    amazon,
    metaRev,
    googleRev,
    amazonRev,
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

interface CurveTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { spend: number; revenue: number; margin: number } }>;
}

function CurveTooltip({ active, payload }: CurveTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className='rounded-lg border border-border bg-popover/95 p-2.5 shadow-xl font-mono text-xs text-popover-foreground'>
      <div className='text-muted-foreground text-[10px]'>Spend: ₹{d.spend.toLocaleString()}</div>
      <div className='text-cyan-400 font-bold'>Projected Revenue: ₹{d.revenue.toLocaleString()}</div>
      <div className='text-emerald-400 font-semibold'>Net Margin: ₹{d.margin.toLocaleString()}</div>
    </div>
  );
}

interface BreakdownTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { channel: string; 'Current Spend': number; 'Scenario Spend': number; 'Current Revenue': number; 'Scenario Revenue': number } }>;
}

function BreakdownTooltip({ active, payload }: BreakdownTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className='rounded-lg border border-border bg-popover/95 p-2.5 shadow-xl font-mono text-xs text-popover-foreground space-y-1'>
      <div className='font-bold text-foreground'>{d.channel}</div>
      <div className='text-muted-foreground text-[10px]'>Spend: ₹{d['Current Spend']} → ₹{d['Scenario Spend']}</div>
      <div className='text-cyan-400 font-semibold'>Revenue: ₹{d['Current Revenue']} → ₹{d['Scenario Revenue']}</div>
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
  const [appliedVector, setAppliedVector] = useState<{
    timestamp: string;
    financials: ReturnType<typeof computeFinancials>;
    deltaRevenue: number;
    deltaMargin: number;
    deltaRoas: number;
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

  // Generate 25 points along the portfolio diminishing-returns response curve
  const responseCurveData = useMemo(() => {
    const points: Array<{ spend: number; revenue: number; margin: number }> = [];
    // Sample spend from 0 to 3600
    for (let s = 0; s <= 3600; s += 150) {
      if (s === 0) {
        points.push({ spend: 0, revenue: 0, margin: 0 });
        continue;
      }
      // Distribute spend proportionally to current scenario channel weight ratio
      const mWeight = scenario.totalSpend > 0 ? scenario.meta / scenario.totalSpend : 0;
      const gWeight = scenario.totalSpend > 0 ? scenario.google / scenario.totalSpend : 0.55;
      const aWeight = scenario.totalSpend > 0 ? scenario.amazon / scenario.totalSpend : 0.45;

      const f = computeFinancials(s * mWeight, s * gWeight, s * aWeight);
      points.push({
        spend: s,
        revenue: Math.round(f.totalRev),
        margin: Math.round(f.netContribution)
      });
    }
    return points;
  }, [scenario]);

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
      reasons.push('Maintained 0 spend on Meta Ads to eliminate non-converting inventory bleed.');
    }

    if (googleSpend > baseline.google) {
      const gLift = scenario.googleRev - baseline.googleRev;
      reasons.push(
        `Scaled Google Search (+₹${googleSpend - baseline.google}/d) capturing high-intent search queries (+₹${Math.round(gLift)}/d revenue headroom).`
      );
    } else if (googleSpend < baseline.google) {
      reasons.push(
        `Trimmed Google Search (-₹${baseline.google - googleSpend}/d) preventing diminishing returns near the saturation knee.`
      );
    }

    if (amazonSpend > baseline.amazon) {
      const aLift = scenario.amazonRev - baseline.amazonRev;
      reasons.push(
        `Boosted Amazon Sponsored Products (+₹${amazonSpend - baseline.amazon}/d) driving elastic bottom-funnel purchases on Air Jordan 10 (+₹${Math.round(aLift)}/d revenue).`
      );
    } else if (amazonSpend < baseline.amazon) {
      reasons.push(
        `Reduced Amazon SP spend (-₹${baseline.amazon - amazonSpend}/d) preserving margin against auction bid competition.`
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

    return reasons;
  }, [metaSpend, googleSpend, amazonSpend, baseline, scenario, deltaMargin, pctMarginChange]);

  // Handle Apply Scenario Vector
  const handleApply = () => {
    setIsSimulating(true);

    setTimeout(() => {
      setIsSimulating(false);
      const appliedPayload: ScenarioAllocationVector = {
        meta: metaSpend,
        google: googleSpend,
        amazon: amazonSpend,
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
        deltaRoas
      });

      if (onApplyReallocation) {
        onApplyReallocation(appliedPayload);
      }

      toast.success('Applied Scenario Reallocation Vector', {
        description: `Meta: ₹${metaSpend}/d • Google: ₹${googleSpend}/d • Amazon: ₹${amazonSpend}/d. Net Margin Lift: ${deltaMargin >= 0 ? '+' : ''}₹${Math.round(deltaMargin).toLocaleString('en-IN')}/d.`
      });
    }, 850);
  };

  // Reset to baseline
  const handleReset = () => {
    setMetaSpend(CHANNEL_MODELS.meta.baselineSpend);
    setGoogleSpend(CHANNEL_MODELS.google.baselineSpend);
    setAmazonSpend(CHANNEL_MODELS.amazon.baselineSpend);
    setAppliedVector(null);
    toast.info('Sandbox Reset to Baseline Steady-State', {
      description: 'Restored baseline steady-state allocations: Meta ₹0/d, Google ₹750/d, Amazon ₹625/d.'
    });
  };

  // Channel share percentages
  const metaShare = scenario.totalSpend > 0 ? (scenario.meta / scenario.totalSpend) * 100 : 0;
  const googleShare = scenario.totalSpend > 0 ? (scenario.google / scenario.totalSpend) * 100 : 0;
  const amazonShare = scenario.totalSpend > 0 ? (scenario.amazon / scenario.totalSpend) * 100 : 0;

  return (
    <Card className='p-5 border border-border bg-card shadow-none rounded-xl text-card-foreground font-mono'>
      {/* Header Bar */}
      <div className='flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-border pb-3.5'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.sliders className='size-4 text-foreground' />
            <h3 className='text-sm font-bold text-foreground tracking-tight uppercase'>
              Interactive What-If Scenario Sandbox
            </h3>
            <span className='text-[10px] bg-muted border border-border text-muted-foreground px-1.5 py-0.5 rounded font-bold'>
              [SLSQP Hill Saturation Engine]
            </span>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            Adjust channel spend allocations in real-time with instant non-linear Hill saturation, margin lift &amp; portfolio distribution modeling
          </p>
        </div>

        <div className='flex items-center gap-2'>
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
            className='h-8 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-mono font-bold border-none active:scale-[0.97] rounded-lg transition-all duration-75 shadow-xs disabled:opacity-50'
          >
            {isSimulating ? (
              <>
                <Icons.spinner className='mr-1.5 size-3 animate-spin' />
                Simulating SLSQP Vector...
              </>
            ) : appliedVector && !hasSpendChanges ? (
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
      {/* CHANNEL SPEND SLIDERS GRID */}
      {/* ============================================================ */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-5'>
        {/* Meta Ads Slider Card */}
        <div className='p-4 rounded-xl bg-muted/30 border border-border space-y-3 transition-colors'>
          <div className='flex items-center justify-between text-xs font-bold'>
            <span className='flex items-center gap-1.5 text-foreground'>
              <MetaLogo size={14} className='shrink-0' />
              Meta Ads
            </span>
            <div className='flex items-baseline gap-1.5'>
              <span className='text-sm text-foreground font-bold'>₹{metaSpend.toLocaleString('en-IN')}/d</span>
              {metaSpend !== baseline.meta && (
                <span className={`text-[10px] font-semibold ${metaSpend > baseline.meta ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {metaSpend > baseline.meta ? `+₹${metaSpend - baseline.meta}` : `-₹${baseline.meta - metaSpend}`}
                </span>
              )}
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
              <span>₹0/d</span>
              <span>K = ₹850/d</span>
              <span>₹1,500/d</span>
            </div>
          </div>

          <div className='flex items-center justify-between text-[11px] pt-1 border-t border-border/60'>
            <div>
              <span className='text-muted-foreground text-[10px] block'>Forecasted Revenue</span>
              <span className='font-bold text-foreground'>₹{Math.round(scenario.metaRev).toLocaleString('en-IN')}</span>
            </div>
            {metaSpend === 0 ? (
              <Badge variant='outline' className='text-[10px] font-mono border-border text-muted-foreground bg-muted/60'>
                Stockout Throttled
              </Badge>
            ) : (
              <Badge variant='outline' className='text-[10px] font-mono border-rose-500/40 text-rose-500 bg-rose-500/10'>
                ⚠️ Stockout Warning
              </Badge>
            )}
          </div>
        </div>

        {/* Google Search Slider Card */}
        <div className='p-4 rounded-xl bg-muted/30 border border-border space-y-3 transition-colors'>
          <div className='flex items-center justify-between text-xs font-bold'>
            <span className='flex items-center gap-1.5 text-foreground'>
              <GoogleLogo size={14} className='shrink-0' />
              Google Search
            </span>
            <div className='flex items-baseline gap-1.5'>
              <span className='text-sm text-foreground font-bold'>₹{googleSpend.toLocaleString('en-IN')}/d</span>
              {googleSpend !== baseline.google && (
                <span className={`text-[10px] font-semibold ${googleSpend > baseline.google ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {googleSpend > baseline.google ? `+₹${googleSpend - baseline.google}` : `-₹${baseline.google - googleSpend}`}
                </span>
              )}
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
              <span>₹200/d</span>
              <span>K = ₹1,250/d</span>
              <span>₹1,500/d</span>
            </div>
          </div>

          <div className='flex items-center justify-between text-[11px] pt-1 border-t border-border/60'>
            <div>
              <span className='text-muted-foreground text-[10px] block'>Forecasted Revenue</span>
              <span className='font-bold text-foreground'>₹{Math.round(scenario.googleRev).toLocaleString('en-IN')}</span>
            </div>
            <Badge variant='outline' className='text-[10px] font-mono border-border text-foreground bg-muted/60'>
              In-Stock Hero (High Intent)
            </Badge>
          </div>
        </div>

        {/* Amazon SP Slider Card */}
        <div className='p-4 rounded-xl bg-muted/30 border border-border space-y-3 transition-colors'>
          <div className='flex items-center justify-between text-xs font-bold'>
            <span className='flex items-center gap-1.5 text-foreground'>
              <AmazonLogo size={14} className='shrink-0' />
              Amazon SP
            </span>
            <div className='flex items-baseline gap-1.5'>
              <span className='text-sm text-foreground font-bold'>₹{amazonSpend.toLocaleString('en-IN')}/d</span>
              {amazonSpend !== baseline.amazon && (
                <span className={`text-[10px] font-semibold ${amazonSpend > baseline.amazon ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {amazonSpend > baseline.amazon ? `+₹${amazonSpend - baseline.amazon}` : `-₹${baseline.amazon - amazonSpend}`}
                </span>
              )}
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
              <span>₹200/d</span>
              <span>K = ₹700/d</span>
              <span>₹1,500/d</span>
            </div>
          </div>

          <div className='flex items-center justify-between text-[11px] pt-1 border-t border-border/60'>
            <div>
              <span className='text-muted-foreground text-[10px] block'>Forecasted Revenue</span>
              <span className='font-bold text-foreground'>₹{Math.round(scenario.amazonRev).toLocaleString('en-IN')}</span>
            </div>
            <Badge variant='outline' className='text-[10px] font-mono border-border text-foreground bg-muted/60'>
              High Buy-Box (Elastic)
            </Badge>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PHASE 4: BUDGET DISTRIBUTION VISUALIZATION BAR */}
      {/* ============================================================ */}
      <div className='mb-5 p-3.5 rounded-xl bg-muted/20 border border-border space-y-2'>
        <div className='flex items-center justify-between text-[11px]'>
          <span className='font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'>
            <Icons.normalization className='size-3 text-foreground' />
            Simulated Budget Distribution Share
          </span>
          <span className='text-foreground font-bold'>
            Total: ₹{scenario.totalSpend.toLocaleString('en-IN')}/day
          </span>
        </div>

        {/* Multi-segment distribution bar */}
        <div className='h-3 w-full rounded-md overflow-hidden flex bg-muted/50 border border-border/40'>
          {metaShare > 0 && (
            <div
              className='bg-blue-500 transition-all duration-200'
              style={{ width: `${metaShare}%` }}
              title={`Meta Ads: ${metaShare.toFixed(1)}%`}
            />
          )}
          {googleShare > 0 && (
            <div
              className='bg-emerald-500 transition-all duration-200'
              style={{ width: `${googleShare}%` }}
              title={`Google Search: ${googleShare.toFixed(1)}%`}
            />
          )}
          {amazonShare > 0 && (
            <div
              className='bg-amber-500 transition-all duration-200'
              style={{ width: `${amazonShare}%` }}
              title={`Amazon SP: ${amazonShare.toFixed(1)}%`}
            />
          )}
        </div>

        {/* Share Legends */}
        <div className='flex flex-wrap items-center justify-between text-[11px] pt-1'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1.5'>
              <span className='size-2 rounded-xs bg-blue-500' />
              <span className='text-muted-foreground'>Meta:</span>
              <span className='text-foreground font-bold'>{metaShare.toFixed(0)}%</span>
              <span className='text-[10px] text-muted-foreground'>(₹{metaSpend})</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='size-2 rounded-xs bg-emerald-500' />
              <span className='text-muted-foreground'>Google:</span>
              <span className='text-foreground font-bold'>{googleShare.toFixed(0)}%</span>
              <span className='text-[10px] text-muted-foreground'>(₹{googleSpend})</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='size-2 rounded-xs bg-amber-500' />
              <span className='text-muted-foreground'>Amazon:</span>
              <span className='text-foreground font-bold'>{amazonShare.toFixed(0)}%</span>
              <span className='text-[10px] text-muted-foreground'>(₹{amazonSpend})</span>
            </div>
          </div>

          <div className='text-[10px] text-muted-foreground'>
            {deltaSpend !== 0 ? (
              <span className={deltaSpend > 0 ? 'text-amber-500 font-semibold' : 'text-emerald-500 font-semibold'}>
                Budget Delta: {deltaSpend > 0 ? `+₹${deltaSpend}` : `-₹${Math.abs(deltaSpend)}`}/day
              </span>
            ) : (
              <span>Budget Neutral (₹0 delta)</span>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PHASE 5: BEFORE VS SCENARIO COMPARISON MATRIX */}
      {/* ============================================================ */}
      <div className='mb-5 rounded-xl border border-border overflow-hidden'>
        <div className='bg-muted/40 px-3.5 py-2 border-b border-border flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground'>
          <span>Baseline Steady-State vs What-If Scenario Matrix</span>
          <span className='text-[10px] text-muted-foreground font-normal'>Real-time Hill Saturation Deltas</span>
        </div>

        <div className='divide-y divide-border/60 text-xs'>
          {/* Row 1: Total Budget */}
          <div className='grid grid-cols-4 p-2.5 items-center hover:bg-muted/20 transition-colors'>
            <span className='text-muted-foreground font-medium'>Total Daily Budget</span>
            <span className='text-muted-foreground font-mono'>₹{baseline.totalSpend.toLocaleString('en-IN')}/d</span>
            <span className='text-foreground font-bold font-mono'>₹{scenario.totalSpend.toLocaleString('en-IN')}/d</span>
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
            <span className='text-foreground font-bold font-mono'>₹{Math.round(scenario.totalRev).toLocaleString('en-IN')}/d</span>
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

          {/* Row 3: Blended ROAS */}
          <div className='grid grid-cols-4 p-2.5 items-center hover:bg-muted/20 transition-colors'>
            <span className='text-muted-foreground font-medium'>Forecasted Blended ROAS</span>
            <span className='text-muted-foreground font-mono'>{baseline.blendedRoas.toFixed(2)}x</span>
            <span className='text-foreground font-bold font-mono'>{scenario.blendedRoas.toFixed(2)}x</span>
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
            <span className='text-foreground font-bold font-mono'>{scenario.poas.toFixed(2)}x</span>
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
          <div className='grid grid-cols-4 p-2.5 items-center bg-muted/10 hover:bg-muted/20 transition-colors'>
            <span className='text-foreground font-bold flex items-center gap-1.5'>
              <Icons.sparkles className='size-3 text-emerald-400' />
              Net Contribution Margin
            </span>
            <span className='text-muted-foreground font-mono'>₹{Math.round(baseline.netContribution).toLocaleString('en-IN')}/d</span>
            <span className='text-foreground font-bold font-mono'>₹{Math.round(scenario.netContribution).toLocaleString('en-IN')}/d</span>
            <span className='text-right font-mono font-bold'>
              {deltaMargin === 0 ? (
                <span className='text-muted-foreground'>₹0</span>
              ) : deltaMargin > 0 ? (
                <span className='text-emerald-500'>+₹{Math.round(deltaMargin).toLocaleString('en-IN')} (+{pctMarginChange.toFixed(1)}%)</span>
              ) : (
                <span className='text-rose-500'>-₹{Math.abs(Math.round(deltaMargin)).toLocaleString('en-IN')} ({pctMarginChange.toFixed(1)}%)</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PHASE 6: MATHEMATICAL VISUALIZATION GRAPH */}
      {/* ============================================================ */}
      <div className='mb-5 p-4 rounded-xl bg-muted/20 border border-border space-y-3'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-2.5'>
          <div>
            <h4 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
              <Icons.barChart className='size-3.5 text-foreground' />
              {activeChartMode === 'curve'
                ? 'Portfolio Media Response Curve (Hill Saturation)'
                : 'Channel-by-Channel Allocation & Revenue Comparison'}
            </h4>
            <p className='text-[10px] text-muted-foreground mt-0.5'>
              {activeChartMode === 'curve'
                ? 'Shows non-linear diminishing returns curve with active Baseline vs Scenario coordinates'
                : 'Direct before vs what-if comparison across Meta, Google, Amazon, and total portfolio'}
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
            <div className='flex items-center justify-between text-[11px] text-muted-foreground px-1'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1.5'>
                  <span className='size-2 rounded-full bg-cyan-400' />
                  <span>Saturation Revenue Curve</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <span className='size-2.5 rounded-full bg-muted-foreground border border-foreground' />
                  <span>Current Baseline (₹{baseline.totalSpend}, ₹{Math.round(baseline.totalRev)})</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <span className='size-2.5 rounded-full bg-emerald-400 border border-white' />
                  <span className='text-foreground font-bold'>Scenario Vector (₹{scenario.totalSpend}, ₹{Math.round(scenario.totalRev)})</span>
                </div>
              </div>
            </div>

            <div className='h-[200px] w-full pt-2'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={responseCurveData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id='revCurveGradient' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#06b6d4' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#06b6d4' stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='text-border/40' vertical={false} />
                  <XAxis
                    dataKey='spend'
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#888', fontSize: 10 }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#888', fontSize: 10 }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip content={<CurveTooltip />} />
                  <Area
                    type='monotone'
                    dataKey='revenue'
                    stroke='#06b6d4'
                    strokeWidth={2}
                    fillOpacity={1}
                    fill='url(#revCurveGradient)'
                  />
                  {/* Current Baseline Reference Dot */}
                  <ReferenceDot
                    x={baseline.totalSpend}
                    y={Math.round(baseline.totalRev)}
                    r={5}
                    fill='#888'
                    stroke='#fff'
                    strokeWidth={2}
                  />
                  {/* Active Scenario Reference Dot */}
                  <ReferenceDot
                    x={scenario.totalSpend}
                    y={Math.round(scenario.totalRev)}
                    r={7}
                    fill='#10b981'
                    stroke='#ffffff'
                    strokeWidth={2}
                  />
                </AreaChart>
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
                  <span className='size-2 rounded-xs bg-primary' />
                  <span className='text-foreground font-bold'>What-If Scenario</span>
                </div>
              </div>
            </div>

            <div className='h-[200px] w-full pt-2'>
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
      {/* PHASES 7, 10 & 11: APPLIED SCENARIO VECTOR RESULT PANEL */}
      {/* ============================================================ */}
      {appliedVector && (
        <div className='p-4 rounded-xl border border-border bg-muted/40 space-y-3 animate-in fade-in-0 duration-200'>
          <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-2.5'>
            <div className='flex items-center gap-2'>
              <Icons.check className='size-4 text-emerald-500' />
              <span className='font-bold uppercase tracking-wider text-foreground text-xs'>
                Scenario Vector Applied To Dispatch Pipeline
              </span>
              <span className='text-[10px] bg-muted border border-border text-muted-foreground px-1.5 py-0.5 rounded font-bold'>
                {appliedVector.timestamp}
              </span>
            </div>
            <div className='flex items-center gap-2 text-xs'>
              <span className='text-muted-foreground'>Net Margin Lift:</span>
              <span className={`font-bold font-mono ${appliedVector.deltaMargin >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {appliedVector.deltaMargin >= 0 ? '+' : ''}₹{Math.round(appliedVector.deltaMargin).toLocaleString('en-IN')}/day
              </span>
            </div>
          </div>

          {/* Channel Vector Movement Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs'>
            {/* Meta Vector */}
            <div className='p-2.5 rounded-lg bg-background border border-border space-y-1'>
              <div className='text-[10px] text-muted-foreground uppercase flex items-center justify-between font-bold'>
                <span>Meta Ads</span>
                <span className={appliedVector.financials.meta > baseline.meta ? 'text-amber-500' : 'text-muted-foreground'}>
                  {appliedVector.financials.meta > baseline.meta ? `+₹${appliedVector.financials.meta - baseline.meta}` : '±₹0'}
                </span>
              </div>
              <div className='font-bold text-foreground'>
                ₹{baseline.meta}/d → ₹{appliedVector.financials.meta}/d
              </div>
              <div className='text-[10px] text-muted-foreground'>
                Rev: ₹{Math.round(appliedVector.financials.metaRev).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Google Vector */}
            <div className='p-2.5 rounded-lg bg-background border border-border space-y-1'>
              <div className='text-[10px] text-muted-foreground uppercase flex items-center justify-between font-bold'>
                <span>Google Search</span>
                <span className={appliedVector.financials.google >= baseline.google ? 'text-emerald-500' : 'text-amber-500'}>
                  {appliedVector.financials.google >= baseline.google
                    ? `+₹${appliedVector.financials.google - baseline.google}`
                    : `-₹${baseline.google - appliedVector.financials.google}`}
                </span>
              </div>
              <div className='font-bold text-foreground'>
                ₹{baseline.google}/d → ₹{appliedVector.financials.google}/d
              </div>
              <div className='text-[10px] text-muted-foreground'>
                Rev: ₹{Math.round(appliedVector.financials.googleRev).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Amazon Vector */}
            <div className='p-2.5 rounded-lg bg-background border border-border space-y-1'>
              <div className='text-[10px] text-muted-foreground uppercase flex items-center justify-between font-bold'>
                <span>Amazon SP</span>
                <span className={appliedVector.financials.amazon >= baseline.amazon ? 'text-emerald-500' : 'text-amber-500'}>
                  {appliedVector.financials.amazon >= baseline.amazon
                    ? `+₹${appliedVector.financials.amazon - baseline.amazon}`
                    : `-₹${baseline.amazon - appliedVector.financials.amazon}`}
                </span>
              </div>
              <div className='font-bold text-foreground'>
                ₹{baseline.amazon}/d → ₹{appliedVector.financials.amazon}/d
              </div>
              <div className='text-[10px] text-muted-foreground'>
                Rev: ₹{Math.round(appliedVector.financials.amazonRev).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Why It Matters / Economic Rationale */}
          <div className='p-3 rounded-lg bg-background border border-border text-xs space-y-1.5'>
            <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'>
              <Icons.info className='size-3 text-foreground' />
              Optimizer Why It Matters Rationale
            </span>
            <ul className='space-y-1 text-[11px] text-muted-foreground'>
              {scenarioExplanation.map((reason, idx) => (
                <li key={idx} className='flex items-start gap-1.5'>
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
