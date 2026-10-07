'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import type { SimulationResult } from '../types/simulation-types';

interface SimulationImpactChartProps {
  result: SimulationResult;
  className?: string;
}

interface ImpactTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      metric: string;
      Baseline: number;
      Shocked: number;
      Mitigated: number;
      unit: string;
    };
  }>;
  label?: string;
  horizonLabel: string;
}

function ImpactTooltip({ active, payload, label, horizonLabel }: ImpactTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;

  const isCurrency = d.unit === '₹';
  const formatVal = (v: number) =>
    isCurrency ? `₹${Math.round(v).toLocaleString('en-IN')}` : `${v}${d.unit}`;

  const shockDelta = d.Shocked - d.Baseline;
  const mitDelta = d.Mitigated - d.Shocked;

  return (
    <div className='rounded-xl border border-border bg-popover/95 backdrop-blur-md p-3.5 shadow-xl text-xs text-popover-foreground space-y-2 min-w-[220px]'>
      <div className='font-semibold text-foreground border-b border-border/60 pb-1.5 flex justify-between items-center text-xs'>
        <span>{label}</span>
        <span className='text-xs text-muted-foreground font-normal'>
          {horizonLabel}
        </span>
      </div>

      <div className='space-y-1.5 text-xs'>
        {/* Baseline */}
        <div className='flex justify-between items-center text-muted-foreground'>
          <span>Baseline</span>
          <span className='font-medium text-foreground tabular-nums'>
            {formatVal(d.Baseline)}
          </span>
        </div>

        {/* Shocked / No Action */}
        <div className='flex justify-between items-center text-rose-600 dark:text-rose-400'>
          <span>No action</span>
          <span className='font-medium tabular-nums'>
            {formatVal(d.Shocked)}
          </span>
        </div>
        {shockDelta !== 0 && (
          <div className='flex justify-end text-xs text-rose-600 dark:text-rose-500'>
            Impact: {shockDelta > 0 ? '+' : ''}{formatVal(shockDelta)} vs baseline
          </div>
        )}

        {/* Mitigated Policy */}
        <div className='flex justify-between items-center text-emerald-600 dark:text-emerald-400 pt-1 border-t border-border/40'>
          <span>With response</span>
          <span className='font-medium tabular-nums'>
            {formatVal(d.Mitigated)}
          </span>
        </div>
        {mitDelta !== 0 && (
          <div className='flex justify-end text-xs text-emerald-600 dark:text-emerald-400 font-medium'>
            Net lift: {mitDelta > 0 ? '+' : ''}{formatVal(mitDelta)} vs no action
          </div>
        )}
      </div>
    </div>
  );
}

export function SimulationImpactChart({
  result,
  className
}: SimulationImpactChartProps) {
  const { baseline, shocked, mitigated, horizonDays, financialImpact, activeStrategyName } = result;

  // Horizon toggle: Daily rate vs Total Horizon
  const [horizonMode, setHorizonMode] = useState<'daily' | 'horizon'>('daily');
  // Metric focus toggle: 'all' (Spend, Revenue, Margin, Loss) | 'margin-loss' | 'efficiency'
  const [metricFocus, setMetricFocus] = useState<'all' | 'margin-loss' | 'efficiency'>('all');

  const multiplier = horizonMode === 'horizon' ? horizonDays : 1;
  const horizonLabel = horizonMode === 'horizon' ? `${horizonDays}d total` : 'Daily';

  // Loss calculations
  const shockedLoss = horizonMode === 'horizon'
    ? financialImpact.lossWithoutMitigation
    : Math.round(financialImpact.dailyLossRate);

  const mitigatedLoss = horizonMode === 'horizon'
    ? financialImpact.lossWithMitigation
    : Math.round(financialImpact.lossWithMitigation / horizonDays);

  const lossAvoided = horizonMode === 'horizon'
    ? financialImpact.lossAvoided
    : Math.round(financialImpact.lossAvoided / horizonDays);

  const pctLossAvoided = shockedLoss > 0 ? ((shockedLoss - mitigatedLoss) / shockedLoss) * 100 : 0;

  // Chart datasets based on selected metric focus
  const chartData = useMemo(() => {
    if (metricFocus === 'efficiency') {
      return [
        {
          metric: 'ROAS (x)',
          Baseline: +baseline.roas.toFixed(2),
          Shocked: +shocked.roas.toFixed(2),
          Mitigated: +mitigated.roas.toFixed(2),
          unit: 'x'
        },
        {
          metric: 'CVR (%)',
          Baseline: +(baseline.clicks > 0 ? (baseline.conversions / baseline.clicks) * 100 : 0).toFixed(2),
          Shocked: +(shocked.clicks > 0 ? (shocked.conversions / shocked.clicks) * 100 : 0).toFixed(2),
          Mitigated: +(mitigated.clicks > 0 ? (mitigated.conversions / mitigated.clicks) * 100 : 0).toFixed(2),
          unit: '%'
        }
      ];
    }

    if (metricFocus === 'margin-loss') {
      return [
        {
          metric: `${horizonLabel} margin`,
          Baseline: Math.round(baseline.margin * multiplier),
          Shocked: Math.round(shocked.margin * multiplier),
          Mitigated: Math.round(mitigated.margin * multiplier),
          unit: '₹'
        },
        {
          metric: `${horizonLabel} loss`,
          Baseline: 0,
          Shocked: Math.round(shockedLoss),
          Mitigated: Math.round(mitigatedLoss),
          unit: '₹'
        }
      ];
    }

    // Default: 'all' (Daily Spend, Projected Revenue, Daily Margin, Loss)
    return [
      {
        metric: `${horizonLabel} spend`,
        Baseline: Math.round(baseline.spend * multiplier),
        Shocked: Math.round(shocked.spend * multiplier),
        Mitigated: Math.round(mitigated.spend * multiplier),
        unit: '₹'
      },
      {
        metric: `Revenue`,
        Baseline: Math.round(baseline.revenue * multiplier),
        Shocked: Math.round(shocked.revenue * multiplier),
        Mitigated: Math.round(mitigated.revenue * multiplier),
        unit: '₹'
      },
      {
        metric: `${horizonLabel} margin`,
        Baseline: Math.round(baseline.margin * multiplier),
        Shocked: Math.round(shocked.margin * multiplier),
        Mitigated: Math.round(mitigated.margin * multiplier),
        unit: '₹'
      },
      {
        metric: `${horizonLabel} loss`,
        Baseline: 0,
        Shocked: Math.round(shockedLoss),
        Mitigated: Math.round(mitigatedLoss),
        unit: '₹'
      }
    ];
  }, [
    baseline,
    shocked,
    mitigated,
    multiplier,
    horizonLabel,
    shockedLoss,
    mitigatedLoss,
    metricFocus
  ]);

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 shadow-xs space-y-4 text-card-foreground', className)}>
      {/* Header with Title and Mode Controls */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
        <div>
          <h4 className='text-sm font-semibold text-foreground'>
            Policy impact comparison
          </h4>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Comparing baseline operating level against crisis and response outcomes.
          </p>
        </div>

        {/* Control Toggles */}
        <div className='flex flex-wrap items-center gap-2'>
          {/* Horizon Toggle */}
          <div className='flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border text-xs'>
            <button
              type='button'
              onClick={() => setHorizonMode('daily')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                horizonMode === 'daily'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Daily rate
            </button>
            <button
              type='button'
              onClick={() => setHorizonMode('horizon')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                horizonMode === 'horizon'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {horizonDays}d total
            </button>
          </div>

          {/* Metric Filter Tabs */}
          <div className='flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border text-xs'>
            <button
              type='button'
              onClick={() => setMetricFocus('all')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                metricFocus === 'all'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All metrics
            </button>
            <button
              type='button'
              onClick={() => setMetricFocus('margin-loss')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                metricFocus === 'margin-loss'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Margin &amp; loss
            </button>
            <button
              type='button'
              onClick={() => setMetricFocus('efficiency')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                metricFocus === 'efficiency'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              ROAS
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className='flex flex-wrap items-center justify-between text-xs px-1 gap-2'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-zinc-500' />
            <span className='text-muted-foreground font-medium'>Baseline</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-rose-500' />
            <span className='text-rose-600 dark:text-rose-400 font-medium'>No action</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-emerald-500' />
            <span className='text-emerald-600 dark:text-emerald-400 font-medium'>With response ({activeStrategyName})</span>
          </div>
        </div>

        <div className='text-xs text-muted-foreground'>
          Loss protected: <span className='text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums'>+₹{lossAvoided.toLocaleString('en-IN')}</span> ({pctLossAvoided.toFixed(1)}%)
        </div>
      </div>

      {/* Main Bar Chart */}
      <div className='h-[240px] w-full pt-1'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={chartData} margin={{ top: 12, right: 15, left: 10, bottom: 5 }} barGap={6}>
            <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='text-border/40' vertical={false} />
            <XAxis
              dataKey='metric'
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#71717a', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#71717a', fontSize: 12 }}
              tickFormatter={(v) => {
                if (metricFocus === 'efficiency') return `${v}x`;
                if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
                if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
                return `₹${v}`;
              }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
              content={<ImpactTooltip horizonLabel={horizonLabel} />}
            />
            {/* Baseline Bar */}
            <Bar dataKey='Baseline' fill='#71717a' radius={[4, 4, 0, 0]} maxBarSize={28} />
            {/* Shocked / No Action Bar */}
            <Bar dataKey='Shocked' fill='#e11d48' radius={[4, 4, 0, 0]} maxBarSize={28} />
            {/* Mitigated Policy Bar */}
            <Bar dataKey='Mitigated' fill='#10b981' radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Policy Comparison Flat Summary */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-border/60'>
        {/* Baseline */}
        <div className='p-3.5 rounded-lg bg-muted/20 border border-border/60 space-y-1.5'>
          <div className='flex items-center justify-between text-xs font-medium text-muted-foreground'>
            <span>Baseline</span>
            <span className='text-xs text-muted-foreground'>Reference</span>
          </div>
          <div className='text-xs text-muted-foreground flex justify-between'>
            <span>Daily spend:</span>
            <span className='text-foreground font-medium tabular-nums'>₹{baseline.spend.toLocaleString('en-IN')}/d</span>
          </div>
          <div className='text-xs text-muted-foreground flex justify-between'>
            <span>Daily margin:</span>
            <span className='text-foreground font-medium tabular-nums'>₹{baseline.margin.toLocaleString('en-IN')}/d</span>
          </div>
          <div className='text-xs text-muted-foreground flex justify-between'>
            <span>Daily loss:</span>
            <span className='text-foreground font-medium tabular-nums'>₹0/d</span>
          </div>
        </div>

        {/* Shocked */}
        <div className='p-3.5 rounded-lg bg-rose-500/5 border border-rose-500/20 space-y-1.5'>
          <div className='flex items-center justify-between text-xs font-medium text-rose-600 dark:text-rose-400'>
            <span>No action</span>
            <span className='text-xs'>Unmitigated</span>
          </div>
          <div className='text-xs text-muted-foreground flex justify-between'>
            <span>Daily spend:</span>
            <span className='text-rose-600 dark:text-rose-400 font-medium tabular-nums'>₹{shocked.spend.toLocaleString('en-IN')}/d</span>
          </div>
          <div className='text-xs text-muted-foreground flex justify-between'>
            <span>Daily margin:</span>
            <span className='text-rose-600 dark:text-rose-400 font-medium tabular-nums'>₹{shocked.margin.toLocaleString('en-IN')}/d</span>
          </div>
          <div className='text-xs text-muted-foreground flex justify-between'>
            <span>Daily loss:</span>
            <span className='text-rose-600 dark:text-rose-400 font-semibold tabular-nums'>
              -₹{Math.round(financialImpact.dailyLossRate).toLocaleString('en-IN')}/d
            </span>
          </div>
        </div>

        {/* Mitigated */}
        <div className='p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1.5'>
          <div className='flex items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400'>
            <span>With response</span>
            <span className='text-xs'>Active</span>
          </div>
          <div className='text-xs text-muted-foreground flex justify-between'>
            <span>Daily spend:</span>
            <span className='text-emerald-600 dark:text-emerald-400 font-medium tabular-nums'>₹{mitigated.spend.toLocaleString('en-IN')}/d</span>
          </div>
          <div className='text-xs text-muted-foreground flex justify-between'>
            <span>Daily margin:</span>
            <span className='text-emerald-600 dark:text-emerald-400 font-medium tabular-nums'>₹{mitigated.margin.toLocaleString('en-IN')}/d</span>
          </div>
          <div className='text-xs text-muted-foreground flex justify-between'>
            <span>Loss avoided:</span>
            <span className='text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums'>
              +₹{Math.round(financialImpact.lossAvoided / horizonDays).toLocaleString('en-IN')}/d
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
