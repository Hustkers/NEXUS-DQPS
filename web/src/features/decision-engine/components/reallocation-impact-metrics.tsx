'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ReallocationExecutionDetails } from '../types/reallocation-execution';

interface ReallocationImpactMetricsProps {
  details: ReallocationExecutionDetails;
  className?: string;
}

export function ReallocationImpactMetrics({
  details,
  className
}: ReallocationImpactMetricsProps) {
  const { metricsComparison, capitalMoved, expectedDailyLift, predictedRoas, destination } = details;

  return (
    <div className={cn('space-y-4 font-mono', className)}>
      {/* Top Impact KPI Pill Row */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5'>
        <div className='rounded-lg border border-border/80 bg-slate-50/60 dark:bg-zinc-950/40 p-3'>
          <div className='text-[10px] text-muted-foreground uppercase tracking-wider'>
            Capital Moved
          </div>
          <div className='text-sm sm:text-base font-bold text-foreground mt-0.5'>
            ₹{Math.round(capitalMoved).toLocaleString('en-IN')}<span className='text-xs font-normal text-muted-foreground'>/day</span>
          </div>
          <div className='text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-0.5'>
            <Icons.arrowRight className='size-2.5 shrink-0' />
            Reallocated
          </div>
        </div>

        <div className='rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3'>
          <div className='text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-bold'>
            Expected Lift
          </div>
          <div className='text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5'>
            +₹{Math.round(expectedDailyLift).toLocaleString('en-IN')}<span className='text-xs font-normal text-muted-foreground'>/day</span>
          </div>
          <div className='text-[10px] text-emerald-600/80 font-medium mt-1'>
            Net Contribution Margin
          </div>
        </div>

        <div className='rounded-lg border border-border/80 bg-slate-50/60 dark:bg-zinc-950/40 p-3'>
          <div className='text-[10px] text-muted-foreground uppercase tracking-wider'>
            New ROAS
          </div>
          <div className='text-sm sm:text-base font-bold text-foreground mt-0.5'>
            {predictedRoas.toFixed(2)}x
          </div>
          <div className='text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-0.5'>
            <Icons.trendingUp className='size-2.5 shrink-0' />
            +{details.destination.roasDeltaPct.toFixed(1)}% vs baseline
          </div>
        </div>

        <div className='rounded-lg border border-border/80 bg-slate-50/60 dark:bg-zinc-950/40 p-3'>
          <div className='text-[10px] text-muted-foreground uppercase tracking-wider'>
            Projected Revenue
          </div>
          <div className='text-sm sm:text-base font-bold text-foreground mt-0.5'>
            ₹{Math.round(destination.newDailyRevenue).toLocaleString('en-IN')}<span className='text-xs font-normal text-muted-foreground'>/day</span>
          </div>
          <div className='text-[10px] text-muted-foreground mt-1'>
            +₹{Math.round(destination.revenueDelta).toLocaleString('en-IN')}/d incremental
          </div>
        </div>
      </div>

      {/* Structured Before / After Metric Comparison Table */}
      <div className='rounded-lg border border-border/80 overflow-hidden'>
        <div className='bg-slate-100/70 dark:bg-zinc-900/50 px-3 py-2 border-b border-border/80 flex items-center justify-between'>
          <span className='text-[11px] font-bold uppercase tracking-wider text-foreground'>
            Decision Telemetry Comparison
          </span>
          <span className='text-[10px] text-muted-foreground uppercase'>
            Deterministic Engine Baseline
          </span>
        </div>

        <div className='divide-y divide-border/60 text-xs'>
          <div className='grid grid-cols-12 px-3 py-2 bg-muted/20 text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            <div className='col-span-4'>Metric</div>
            <div className='col-span-3 text-right'>Before</div>
            <div className='col-span-3 text-right'>After</div>
            <div className='col-span-2 text-right'>Change</div>
          </div>

          {metricsComparison.map((m) => (
            <div
              key={m.key}
              className='grid grid-cols-12 px-3 py-2.5 items-center hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors'
            >
              <div className='col-span-4 font-medium text-foreground truncate'>
                {m.label}
              </div>
              <div className='col-span-3 text-right text-muted-foreground'>
                {m.beforeFormatted}
              </div>
              <div className='col-span-3 text-right font-bold text-foreground'>
                {m.afterFormatted}
              </div>
              <div className='col-span-2 text-right'>
                <span
                  className={cn(
                    'font-bold text-[11px]',
                    m.isPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  )}
                >
                  {m.changeFormatted}
                </span>
                <span className='block text-[9px] text-muted-foreground'>
                  ({m.pctChangeFormatted})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
