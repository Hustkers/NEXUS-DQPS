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

interface SimulationLossCurveProps {
  result: SimulationResult;
  className?: string;
}

export function SimulationLossCurve({
  result,
  className
}: SimulationLossCurveProps) {
  const { timeSeries, horizonDays, financialImpact } = result;

  return (
    <div className={cn('rounded-xl border border-border/80 bg-card p-4 sm:p-5 font-mono shadow-xs space-y-3', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div>
          <h4 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            Cumulative Financial Loss Trajectory
          </h4>
          <p className='text-[10px] text-muted-foreground'>
            Day-by-day loss accumulation: No Action vs Applied Mitigation Strategy
          </p>
        </div>
        <div className='flex items-center gap-3 text-[10px] font-semibold'>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-xs bg-rose-500' />
            <span className='text-rose-600 dark:text-rose-400'>No Action Loss</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-xs bg-emerald-500' />
            <span className='text-emerald-600 dark:text-emerald-400'>Mitigated Loss</span>
          </div>
        </div>
      </div>

      <div className='h-[200px] w-full pt-1'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={timeSeries} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id='colorNoAction' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#e11d48' stopOpacity={0.25} />
                <stop offset='95%' stopColor='#e11d48' stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id='colorMitigated' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#10b981' stopOpacity={0.25} />
                <stop offset='95%' stopColor='#10b981' stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} className='dark:stroke-zinc-800' />
            <XAxis
              dataKey='label'
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
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const noActionVal = Number(payload[0]?.value ?? 0);
                  const mitigatedVal = Number(payload[1]?.value ?? 0);
                  const saved = noActionVal - mitigatedVal;

                  return (
                    <div className='rounded-lg border border-border bg-card p-2.5 shadow-md text-xs font-mono'>
                      <div className='font-bold text-foreground mb-1 border-b border-border/60 pb-1 text-[11px]'>
                        {label} Cumulative Loss
                      </div>
                      <div className='space-y-1 text-[11px]'>
                        <div className='flex justify-between gap-4 text-rose-500 font-semibold'>
                          <span>No Action:</span>
                          <span>₹{noActionVal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className='flex justify-between gap-4 text-foreground font-medium'>
                          <span>Mitigated:</span>
                          <span>₹{mitigatedVal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className='flex justify-between gap-4 pt-1 border-t border-border/40 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold'>
                          <span>Loss Avoided:</span>
                          <span>+₹{saved.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type='monotone'
              dataKey='noActionLoss'
              stroke='#e11d48'
              strokeWidth={2}
              fillOpacity={1}
              fill='url(#colorNoAction)'
            />
            <Area
              type='monotone'
              dataKey='mitigatedLoss'
              stroke='#10b981'
              strokeWidth={2}
              fillOpacity={1}
              fill='url(#colorMitigated)'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className='pt-1 text-[10px] text-muted-foreground flex items-center justify-between'>
        <span>Day 1 through Day {horizonDays} simulation envelope</span>
        <span className='font-bold text-emerald-600 dark:text-emerald-400'>
          +₹{financialImpact.lossAvoided.toLocaleString('en-IN')} Capital Protected
        </span>
      </div>
    </div>
  );
}
