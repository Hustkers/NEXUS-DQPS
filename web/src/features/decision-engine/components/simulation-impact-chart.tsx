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
import { Icons } from '@/components/icons';
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
    <div className='rounded-xl border border-border bg-popover/95 backdrop-blur-md p-3 shadow-2xl font-mono text-xs text-popover-foreground space-y-2 min-w-[220px]'>
      <div className='font-bold text-foreground border-b border-border/60 pb-1 flex justify-between items-center text-[11px]'>
        <span>{label}</span>
        <span className='text-[10px] text-muted-foreground uppercase font-normal'>
          {horizonLabel}
        </span>
      </div>

      <div className='space-y-1.5 text-[11px]'>
        {/* Baseline */}
        <div className='flex justify-between items-center text-muted-foreground'>
          <span>Baseline:</span>
          <span className='font-mono font-bold text-foreground'>
            {formatVal(d.Baseline)}
          </span>
        </div>

        {/* Shocked / No Action */}
        <div className='flex justify-between items-center text-rose-400'>
          <span className='font-medium'>Shocked (No Action):</span>
          <span className='font-mono font-bold'>
            {formatVal(d.Shocked)}
          </span>
        </div>
        {shockDelta !== 0 && (
          <div className='flex justify-end text-[10px] text-rose-500 font-semibold'>
            Impact: {shockDelta > 0 ? '+' : ''}{formatVal(shockDelta)} vs Baseline
          </div>
        )}

        {/* Mitigated Policy */}
        <div className='flex justify-between items-center text-emerald-400 pt-1 border-t border-border/40'>
          <span className='font-medium'>Mitigated Policy:</span>
          <span className='font-mono font-bold'>
            {formatVal(d.Mitigated)}
          </span>
        </div>
        {mitDelta !== 0 && (
          <div className='flex justify-end text-[10px] text-emerald-400 font-semibold'>
            Net Lift: {mitDelta > 0 ? '+' : ''}{formatVal(mitDelta)} vs Shocked
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
  const horizonLabel = horizonMode === 'horizon' ? `${horizonDays}d Total` : 'Daily';

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
          metric: `${horizonLabel} Margin`,
          Baseline: Math.round(baseline.margin * multiplier),
          Shocked: Math.round(shocked.margin * multiplier),
          Mitigated: Math.round(mitigated.margin * multiplier),
          unit: '₹'
        },
        {
          metric: `${horizonLabel} Loss`,
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
        metric: `${horizonLabel} Spend`,
        Baseline: Math.round(baseline.spend * multiplier),
        Shocked: Math.round(shocked.spend * multiplier),
        Mitigated: Math.round(mitigated.spend * multiplier),
        unit: '₹'
      },
      {
        metric: `Projected Revenue`,
        Baseline: Math.round(baseline.revenue * multiplier),
        Shocked: Math.round(shocked.revenue * multiplier),
        Mitigated: Math.round(mitigated.revenue * multiplier),
        unit: '₹'
      },
      {
        metric: `${horizonLabel} Margin`,
        Baseline: Math.round(baseline.margin * multiplier),
        Shocked: Math.round(shocked.margin * multiplier),
        Mitigated: Math.round(mitigated.margin * multiplier),
        unit: '₹'
      },
      {
        metric: `${horizonLabel} Loss`,
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
    <div className={cn('rounded-xl border border-border bg-card p-4 sm:p-5 font-mono shadow-xs space-y-4 text-card-foreground', className)}>
      {/* Header with Title and Mode Controls */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.barChart className='size-3.5 text-foreground' />
            <h4 className='text-xs font-bold uppercase tracking-wider text-foreground'>
              CHART 1 — POLICY IMPACT COMPARISON
            </h4>
          </div>
          <p className='text-[10px] text-muted-foreground mt-0.5'>
            Ground-truth comparison: Baseline Steady-State vs Shocked (No Action) vs Mitigated Policy
          </p>
        </div>

        {/* Control Toggles */}
        <div className='flex flex-wrap items-center gap-2'>
          {/* Horizon Toggle */}
          <div className='flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border text-[10px]'>
            <button
              type='button'
              onClick={() => setHorizonMode('daily')}
              className={cn(
                'px-2 py-1 rounded font-bold uppercase transition-all duration-75',
                horizonMode === 'daily'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Daily Rate
            </button>
            <button
              type='button'
              onClick={() => setHorizonMode('horizon')}
              className={cn(
                'px-2 py-1 rounded font-bold uppercase transition-all duration-75',
                horizonMode === 'horizon'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {horizonDays}d Horizon
            </button>
          </div>

          {/* Metric Filter Tabs */}
          <div className='flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border text-[10px]'>
            <button
              type='button'
              onClick={() => setMetricFocus('all')}
              className={cn(
                'px-2 py-1 rounded font-bold uppercase transition-all duration-75',
                metricFocus === 'all'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All Metrics
            </button>
            <button
              type='button'
              onClick={() => setMetricFocus('margin-loss')}
              className={cn(
                'px-2 py-1 rounded font-bold uppercase transition-all duration-75',
                metricFocus === 'margin-loss'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Margin &amp; Loss
            </button>
            <button
              type='button'
              onClick={() => setMetricFocus('efficiency')}
              className={cn(
                'px-2 py-1 rounded font-bold uppercase transition-all duration-75',
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
      <div className='flex flex-wrap items-center justify-between text-[11px] px-1 gap-2'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-xs bg-zinc-500' />
            <span className='text-muted-foreground font-semibold'>Baseline</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-xs bg-rose-500' />
            <span className='text-rose-500 font-bold'>Shocked / No Action</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-xs bg-emerald-500' />
            <span className='text-emerald-500 font-bold'>Mitigated ({activeStrategyName})</span>
          </div>
        </div>

        <div className='text-[10px] text-muted-foreground font-semibold'>
          Loss Protected: <span className='text-emerald-400 font-bold'>+₹{lossAvoided.toLocaleString('en-IN')}</span> ({pctLossAvoided.toFixed(1)}%)
        </div>
      </div>

      {/* Main Bar Chart */}
      <div className='h-[230px] w-full pt-1'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={chartData} margin={{ top: 12, right: 15, left: 10, bottom: 5 }} barGap={5}>
            <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='text-border/40' vertical={false} />
            <XAxis
              dataKey='metric'
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#888', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#888', fontSize: 10 }}
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
            <Bar dataKey='Baseline' fill='#71717a' radius={[3, 3, 0, 0]} maxBarSize={30} />
            {/* Shocked / No Action Bar */}
            <Bar dataKey='Shocked' fill='#e11d48' radius={[3, 3, 0, 0]} maxBarSize={30} />
            {/* Mitigated Policy Bar */}
            <Bar dataKey='Mitigated' fill='#10b981' radius={[3, 3, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ground-Truth Policy Comparison Strip */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs'>
        {/* Baseline Card */}
        <div className='p-2.5 rounded-lg bg-background border border-border space-y-1'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground'>
            <span>Baseline Steady-State</span>
            <span className='text-zinc-400 font-mono'>REF</span>
          </div>
          <div className='text-[11px] text-muted-foreground flex justify-between'>
            <span>Daily Spend:</span>
            <span className='font-mono text-foreground font-bold'>₹{baseline.spend.toLocaleString('en-IN')}/d</span>
          </div>
          <div className='text-[11px] text-muted-foreground flex justify-between'>
            <span>Daily Margin:</span>
            <span className='font-mono text-foreground font-bold'>₹{baseline.margin.toLocaleString('en-IN')}/d</span>
          </div>
          <div className='text-[11px] text-muted-foreground flex justify-between'>
            <span>Financial Loss:</span>
            <span className='font-mono text-foreground font-bold'>₹0/d</span>
          </div>
        </div>

        {/* Shocked Card */}
        <div className='p-2.5 rounded-lg bg-background border border-rose-500/30 space-y-1'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-rose-500'>
            <span>Shocked / No Action</span>
            <span className='text-[9px] bg-rose-500/10 px-1.5 py-0.2 rounded font-bold'>UNMITIGATED</span>
          </div>
          <div className='text-[11px] text-muted-foreground flex justify-between'>
            <span>Daily Spend:</span>
            <span className='font-mono text-rose-400 font-bold'>₹{shocked.spend.toLocaleString('en-IN')}/d</span>
          </div>
          <div className='text-[11px] text-muted-foreground flex justify-between'>
            <span>Daily Margin:</span>
            <span className='font-mono text-rose-400 font-bold'>₹{shocked.margin.toLocaleString('en-IN')}/d</span>
          </div>
          <div className='text-[11px] text-muted-foreground flex justify-between'>
            <span>Daily Loss:</span>
            <span className='font-mono text-rose-500 font-bold'>
              -₹{Math.round(financialImpact.dailyLossRate).toLocaleString('en-IN')}/d
            </span>
          </div>
        </div>

        {/* Mitigated Card */}
        <div className='p-2.5 rounded-lg bg-background border border-emerald-500/30 space-y-1'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-emerald-400'>
            <span>Mitigated Policy</span>
            <span className='text-[9px] bg-emerald-500/10 px-1.5 py-0.2 rounded font-bold'>ACTIVE</span>
          </div>
          <div className='text-[11px] text-muted-foreground flex justify-between'>
            <span>Daily Spend:</span>
            <span className='font-mono text-emerald-400 font-bold'>₹{mitigated.spend.toLocaleString('en-IN')}/d</span>
          </div>
          <div className='text-[11px] text-muted-foreground flex justify-between'>
            <span>Daily Margin:</span>
            <span className='font-mono text-emerald-400 font-bold'>₹{mitigated.margin.toLocaleString('en-IN')}/d</span>
          </div>
          <div className='text-[11px] text-muted-foreground flex justify-between'>
            <span>Loss Avoided:</span>
            <span className='font-mono text-emerald-400 font-bold'>
              +₹{Math.round(financialImpact.lossAvoided / horizonDays).toLocaleString('en-IN')}/d
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
