'use client';

import React from 'react';
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

export function SimulationImpactChart({
  result,
  className
}: SimulationImpactChartProps) {
  const { baseline, shocked, mitigated, horizonDays } = result;

  const chartData = [
    {
      metric: 'Daily Spend (₹)',
      Baseline: baseline.spend,
      Shocked: shocked.spend,
      Mitigated: mitigated.spend
    },
    {
      metric: 'Daily Revenue (₹)',
      Baseline: baseline.revenue,
      Shocked: shocked.revenue,
      Mitigated: mitigated.revenue
    },
    {
      metric: 'Daily Margin (₹)',
      Baseline: baseline.margin,
      Shocked: shocked.margin,
      Mitigated: mitigated.margin
    }
  ];

  return (
    <div className={cn('rounded-xl border border-border/80 bg-card p-4 sm:p-5 font-mono shadow-xs space-y-3', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div>
          <h4 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            Policy Impact Comparison (₹)
          </h4>
          <p className='text-[10px] text-muted-foreground'>
            Baseline vs Shocked (No Action) vs Mitigated Strategy
          </p>
        </div>
        <div className='flex items-center gap-3 text-[10px] font-semibold'>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-xs bg-zinc-500' />
            <span className='text-muted-foreground'>Baseline</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-xs bg-rose-500' />
            <span className='text-rose-600 dark:text-rose-400'>Shocked</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-xs bg-emerald-500' />
            <span className='text-emerald-600 dark:text-emerald-400'>Mitigated</span>
          </div>
        </div>
      </div>

      <div className='h-[200px] w-full pt-1'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }} barGap={6}>
            <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} className='dark:stroke-zinc-800' />
            <XAxis
              dataKey='metric'
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#71717a', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#71717a', fontSize: 10 }}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className='rounded-lg border border-border bg-card p-2.5 shadow-md text-xs font-mono'>
                      <div className='font-bold text-foreground mb-1 border-b border-border/60 pb-1 text-[11px]'>
                        {label}
                      </div>
                      <div className='space-y-1 text-[11px]'>
                        <div className='flex justify-between gap-4 text-muted-foreground'>
                          <span>Baseline:</span>
                          <span className='font-medium text-foreground'>
                            ₹{Number(payload[0]?.value ?? 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className='flex justify-between gap-4 text-rose-500 font-semibold'>
                          <span>Shocked:</span>
                          <span>₹{Number(payload[1]?.value ?? 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className='flex justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-bold'>
                          <span>Mitigated:</span>
                          <span>₹{Number(payload[2]?.value ?? 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey='Baseline' fill='#71717a' radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey='Shocked' fill='#e11d48' radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey='Mitigated' fill='#10b981' radius={[3, 3, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
