'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import type { SimulationResult } from '../types/simulation-types';

interface AreaLabelProps {
  index?: number;
  x?: number | string;
  y?: number | string;
  totalPoints?: number;
  title?: string;
  color?: string;
}

function DirectAreaLabel(props: AreaLabelProps) {
  const { index, x, y, totalPoints = 0, title = '', color = '#71717a' } = props;
  if (index === totalPoints - 1 && typeof x === 'number' && typeof y === 'number') {
    return (
      <text
        x={x + 8}
        y={y + 4}
        fill={color}
        fontSize={12}
        fontWeight={600}
        textAnchor='start'
      >
        {title}
      </text>
    );
  }
  return null;
}

interface LossTooltipPayload {
  value?: unknown;
}

interface LossTooltipProps {
  active?: boolean;
  payload?: LossTooltipPayload[];
  label?: string;
}

function MinimalLossTooltip({ active, payload, label }: LossTooltipProps) {
  if (active && payload && payload.length) {
    const noActionVal = Number(payload[0]?.value ?? 0);
    const mitigatedVal = Number(payload[1]?.value ?? 0);
    const saved = noActionVal - mitigatedVal;

    return (
      <div className='rounded-xl border border-border bg-popover/95 backdrop-blur-xs p-3 shadow-lg text-xs space-y-1.5'>
        <div className='font-semibold text-foreground pb-1 border-b border-border/60 text-xs'>
          {label}
        </div>
        <div className='space-y-1 text-xs'>
          <div className='flex justify-between gap-4 text-rose-600 dark:text-rose-400 font-medium'>
            <span>No action:</span>
            <span className='tabular-nums'>₹{noActionVal.toLocaleString('en-IN')}</span>
          </div>
          <div className='flex justify-between gap-4 text-foreground font-medium'>
            <span>With response:</span>
            <span className='tabular-nums'>₹{mitigatedVal.toLocaleString('en-IN')}</span>
          </div>
          <div className='flex justify-between gap-4 pt-1 border-t border-border/60 text-emerald-600 dark:text-emerald-400 font-semibold'>
            <span>Loss avoided:</span>
            <span className='tabular-nums'>+₹{saved.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

interface SimulationLossCurveProps {
  result: SimulationResult;
  className?: string;
  variant?: 'default' | 'minimal';
}

export function SimulationLossCurve({
  result,
  className,
  variant: _variant = 'default',
}: SimulationLossCurveProps) {
  const { timeSeries, horizonDays, financialImpact } = result;

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 shadow-xs space-y-4', className)}>
        <div className='border-b border-border/60 pb-3'>
          <h4 className='text-sm font-semibold text-foreground'>
            Cumulative loss over time
          </h4>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Comparing no action against the selected response across {horizonDays} days.
          </p>
        </div>

        <div className='h-[280px] w-full pt-1'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={timeSeries} margin={{ top: 12, right: 90, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id='minColorNoAction' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#e11d48' stopOpacity={0.2} />
                  <stop offset='95%' stopColor='#e11d48' stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id='minColorMitigated' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10b981' stopOpacity={0.2} />
                  <stop offset='95%' stopColor='#10b981' stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} className='dark:stroke-zinc-800/80' />
              <XAxis
                dataKey='label'
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#71717a', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#71717a', fontSize: 12 }}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip content={<MinimalLossTooltip />} />
              <Area
                type='monotone'
                dataKey='noActionLoss'
                stroke='#e11d48'
                strokeWidth={2}
                fillOpacity={1}
                fill='url(#minColorNoAction)'
                label={<DirectAreaLabel totalPoints={timeSeries.length} title='No action' color='#e11d48' />}
              />
              <Area
                type='monotone'
                dataKey='mitigatedLoss'
                stroke='#10b981'
                strokeWidth={2}
                fillOpacity={1}
                fill='url(#minColorMitigated)'
                label={<DirectAreaLabel totalPoints={timeSeries.length} title='With response' color='#10b981' />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className='pt-1 text-xs text-muted-foreground flex items-center justify-between'>
          <span>Evaluated across {horizonDays} days</span>
          <span className='font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums'>
            +₹{financialImpact.lossAvoided.toLocaleString('en-IN')} protected
          </span>
        </div>
      </div>
    );
}
