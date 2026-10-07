'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import {
  IconCalculator,
  IconTrendingUp,
  IconAlertTriangle,
  IconSparkles,
  IconCheck
} from '@tabler/icons-react';
import type { CampaignStrategy } from '@/lib/strategy-engine/types';
import { simulateBudgetDiminishingReturns } from '@/lib/strategy-engine/prediction-engine';
import { cn } from '@/lib/utils';

interface StrategyWhatIfProps {
  strategy: CampaignStrategy;
  currentDailyBudget: number;
  simulatedBudget: number;
  onBudgetChange: (budget: number) => void;
  aov?: number;
}

export function StrategyWhatIf({
  strategy,
  currentDailyBudget,
  simulatedBudget,
  onBudgetChange,
  aov = 4250
}: StrategyWhatIfProps) {
  const ev = strategy.evaluation;
  const baseBudget = strategy.budgetAllocation || 50000;
  const baseRoas = ev?.expectedRoas || 3.5;
  const baseCpa = ev?.expectedCpa || 420;

  // Real econometric diminishing returns simulation
  const simResult = simulateBudgetDiminishingReturns(
    baseBudget,
    simulatedBudget,
    baseRoas,
    baseCpa,
    aov
  );

  // Generate continuous curve points for Recharts based on real diminishing returns calculation
  const curveData = useMemo(() => {
    const minB = 10000;
    const maxB = 150000;
    const steps = 25;
    const stepSize = (maxB - minB) / (steps - 1);
    const points: Array<{
      spend: number;
      revenue: number;
      roas: number;
      cpa: number;
      conversions: number;
      isCurrent?: boolean;
    }> = [];

    for (let i = 0; i < steps; i++) {
      const spend = Math.round(minB + i * stepSize);
      const res = simulateBudgetDiminishingReturns(baseBudget, spend, baseRoas, baseCpa, aov);
      points.push({
        spend,
        revenue: res.revenue,
        roas: res.roas,
        cpa: res.cpa,
        conversions: res.conversions
      });
    }

    return points;
  }, [baseBudget, baseRoas, baseCpa, aov]);

  const optimalSpend = Math.round(baseBudget * 1.35);

  return (
    <div className='rounded-2xl border border-border/80 bg-card p-6 font-mono space-y-5 shadow-xs'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
        <div>
          <div className='flex items-center gap-2'>
            <IconCalculator className='size-4 text-cyan-400' />
            <h3 className='text-sm sm:text-base font-bold uppercase tracking-tight text-foreground'>
              WHAT IF?
            </h3>
          </div>
          <p className='text-[11px] text-muted-foreground mt-0.5'>
            Test the recommendation before launching. Drag daily budget to simulate econometric response.
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <span
            className={cn(
              'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border',
              simResult.isDiminishingZone
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            )}
          >
            {simResult.isDiminishingZone ? 'DIMINISHING RETURNS ZONE' : 'HIGH EFFICIENCY ZONE'}
          </span>
        </div>
      </div>

      {/* Prominent Budget Slider */}
      <div className='space-y-2 p-4 rounded-xl border border-border/60 bg-muted/20'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-semibold text-foreground uppercase tracking-wider'>
            SIMULATED CAMPAIGN BUDGET
          </span>
          <div className='flex items-baseline gap-1.5'>
            <span className='text-xl font-bold text-cyan-400 tracking-tight'>
              ₹{simulatedBudget.toLocaleString('en-IN')}
            </span>
            <span className='text-[10px] text-muted-foreground'>
              (Baseline: ₹{baseBudget.toLocaleString('en-IN')})
            </span>
          </div>
        </div>

        <input
          type='range'
          min={10000}
          max={150000}
          step={2500}
          value={simulatedBudget}
          onChange={(e) => onBudgetChange(Number(e.target.value))}
          className='w-full h-2 bg-muted/80 rounded-lg appearance-none cursor-pointer accent-cyan-400'
        />

        <div className='flex justify-between text-[10px] text-muted-foreground'>
          <span>₹10,000 (Conservative)</span>
          <span className='text-cyan-400 font-bold'>Current: ₹{simulatedBudget.toLocaleString('en-IN')}</span>
          <span>₹150,000 (Aggressive Scale)</span>
        </div>
      </div>

      {/* Dynamic Calculated KPI Output Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        <div className='p-3.5 rounded-xl border border-border/60 bg-card'>
          <span className='text-[10px] text-muted-foreground uppercase font-bold block'>
            PROJECTED REVENUE
          </span>
          <span className='text-lg sm:text-xl font-bold text-foreground block mt-1'>
            ₹{simResult.revenue.toLocaleString('en-IN')}
          </span>
          <span className='text-[10px] text-muted-foreground block mt-0.5'>
            Non-linear response
          </span>
        </div>

        <div className='p-3.5 rounded-xl border border-border/60 bg-card'>
          <span className='text-[10px] text-muted-foreground uppercase font-bold block'>
            SIMULATED ROAS
          </span>
          <span
            className={cn(
              'text-lg sm:text-xl font-bold block mt-1',
              simResult.roas >= 3.0 ? 'text-emerald-400' : 'text-amber-400'
            )}
          >
            {simResult.roas.toFixed(2)}x
          </span>
          <span className='text-[10px] text-muted-foreground block mt-0.5'>
            Target floor: 3.20x
          </span>
        </div>

        <div className='p-3.5 rounded-xl border border-border/60 bg-card'>
          <span className='text-[10px] text-muted-foreground uppercase font-bold block'>
            ESTIMATED ORDERS
          </span>
          <span className='text-lg sm:text-xl font-bold text-foreground block mt-1'>
            {simResult.conversions} orders
          </span>
          <span className='text-[10px] text-muted-foreground block mt-0.5'>
            AOV ₹{aov.toLocaleString('en-IN')}
          </span>
        </div>

        <div className='p-3.5 rounded-xl border border-border/60 bg-card'>
          <span className='text-[10px] text-muted-foreground uppercase font-bold block'>
            SIMULATED CPA
          </span>
          <span
            className={cn(
              'text-lg sm:text-xl font-bold block mt-1',
              simResult.cpa <= baseCpa * 1.25 ? 'text-cyan-400' : 'text-rose-400'
            )}
          >
            ₹{simResult.cpa.toLocaleString('en-IN')}
          </span>
          <span className='text-[10px] text-muted-foreground block mt-0.5'>
            Base: ₹{baseCpa.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Response Curve Chart (Recharts) with Operating Point */}
      <div className='w-full h-56 sm:h-64 bg-black/20 rounded-xl p-3 border border-border/40 relative'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={curveData} margin={{ top: 15, right: 15, left: 10, bottom: 15 }}>
            <defs>
              <linearGradient id='simRevenueGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#06b6d4' stopOpacity={0.4} />
                <stop offset='95%' stopColor='#06b6d4' stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey='spend'
              stroke='#52525b'
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              stroke='#52525b'
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className='rounded-lg border border-border bg-popover/95 p-2 shadow-xl font-mono text-[11px]'>
                    <div className='font-bold text-foreground mb-1'>Spend: ₹{d.spend.toLocaleString('en-IN')}</div>
                    <div className='text-cyan-400'>Revenue: ₹{d.revenue.toLocaleString('en-IN')}</div>
                    <div className='text-emerald-400'>ROAS: {d.roas.toFixed(2)}x</div>
                    <div className='text-muted-foreground'>Orders: {d.conversions}</div>
                    <div className='text-amber-400'>CPA: ₹{d.cpa.toLocaleString('en-IN')}</div>
                  </div>
                );
              }}
            />

            <Area
              type='monotone'
              dataKey='revenue'
              stroke='#06b6d4'
              strokeWidth={2}
              fill='url(#simRevenueGrad)'
            />

            {/* Operating Point Marker */}
            <ReferenceDot
              x={simulatedBudget}
              y={simResult.revenue}
              r={6}
              fill='#38bdf8'
              stroke='#ffffff'
              strokeWidth={2}
            />

            {/* Optimal Yield Marker Line */}
            <ReferenceLine
              x={optimalSpend}
              stroke='#10b981'
              strokeDasharray='3 3'
              label={{
                value: 'Optimal Yield Threshold',
                fill: '#10b981',
                fontSize: 10,
                position: 'top'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className='absolute bottom-3 left-4 flex items-center gap-4 text-[10px] text-muted-foreground bg-background/80 px-2 py-1 rounded border border-border/40'>
          <span className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-cyan-400 ring-2 ring-white/50' />
            Current Operating Spend (₹{simulatedBudget.toLocaleString('en-IN')})
          </span>
          <span className='flex items-center gap-1.5 text-emerald-400'>
            <span className='size-2 rounded-full bg-emerald-400' />
            Optimal Yield (₹{optimalSpend.toLocaleString('en-IN')})
          </span>
        </div>
      </div>
    </div>
  );
}
