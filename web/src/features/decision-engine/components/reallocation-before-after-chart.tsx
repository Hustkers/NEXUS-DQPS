'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import type { ReallocationExecutionDetails } from '../types/reallocation-execution';

interface ReallocationBeforeAfterChartProps {
  details: ReallocationExecutionDetails;
  className?: string;
}

export function ReallocationBeforeAfterChart({
  details,
  className
}: ReallocationBeforeAfterChartProps) {
  const { chartData } = details;

  return (
    <div className={cn('rounded-lg border border-border/80 bg-slate-50/40 dark:bg-zinc-950/40 p-4 font-mono', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-2 mb-3'>
        <div>
          <h4 className='text-xs font-bold text-foreground uppercase tracking-wider'>
            Before vs After Capital Allocation
          </h4>
          <p className='text-[10px] text-muted-foreground'>
            Marginal return projection model (deterministic optimizer values)
          </p>
        </div>
        <div className='flex items-center gap-3 text-[11px]'>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-xs bg-zinc-400 dark:bg-zinc-600' />
            <span className='text-muted-foreground font-medium'>Before</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-xs bg-emerald-500' />
            <span className='text-emerald-600 dark:text-emerald-400 font-bold'>After</span>
          </div>
        </div>
      </div>

      <div className='h-[180px] w-full pt-1'>
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
                  const beforeVal = Number(payload[0]?.value ?? 0);
                  const afterVal = Number(payload[1]?.value ?? 0);
                  const delta = afterVal - beforeVal;

                  return (
                    <div className='rounded-lg border border-border bg-card p-2.5 shadow-md text-xs font-mono'>
                      <div className='font-bold text-foreground mb-1 border-b border-border/60 pb-1 text-[11px]'>
                        {label}
                      </div>
                      <div className='space-y-1 text-[11px]'>
                        <div className='flex justify-between gap-4 text-muted-foreground'>
                          <span>Before:</span>
                          <span className='font-medium text-foreground'>
                            ₹{beforeVal.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className='flex justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-bold'>
                          <span>After:</span>
                          <span>₹{afterVal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className='flex justify-between gap-4 pt-1 border-t border-border/40 text-[10px]'>
                          <span className='text-muted-foreground'>Delta:</span>
                          <span className={delta >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500 font-bold'}>
                            {delta >= 0 ? '+' : ''}₹{delta.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey='Before' fill='#71717a' radius={[3, 3, 0, 0]} maxBarSize={36} />
            <Bar dataKey='After' fill='#10b981' radius={[3, 3, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
