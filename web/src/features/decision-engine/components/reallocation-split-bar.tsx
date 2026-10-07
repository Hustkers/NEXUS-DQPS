'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ReallocationExecutionDetails } from '../types/reallocation-execution';

interface ReallocationSplitBarProps {
  details: ReallocationExecutionDetails;
  className?: string;
}

export function ReallocationSplitBar({
  details,
  className
}: ReallocationSplitBarProps) {
  const { allocation } = details;

  // Max value for width scaling
  const maxSpend = Math.max(
    allocation.sourceBefore,
    allocation.destBefore,
    allocation.sourceAfter,
    allocation.destAfter,
    1
  );

  const getWidthPct = (val: number) => {
    return Math.max(8, Math.min(100, Math.round((val / maxSpend) * 100)));
  };

  return (
    <div className={cn('rounded-lg border border-border/80 bg-slate-50/40 dark:bg-zinc-950/40 p-4 font-mono space-y-4', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-2'>
        <h4 className='text-xs font-bold text-foreground uppercase tracking-wider'>
          Portfolio Rebalancing Distribution
        </h4>
        <span className='text-[10px] text-muted-foreground uppercase'>
          Source vs Destination Spend Share
        </span>
      </div>

      {/* BEFORE State */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase'>
          <span>Before Execution</span>
          <span>Total: ₹{(allocation.sourceBefore + allocation.destBefore).toLocaleString('en-IN')}/d</span>
        </div>

        <div className='space-y-1.5'>
          {/* Source Before */}
          <div className='space-y-0.5'>
            <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
              <span className='truncate max-w-[200px] sm:max-w-xs'>{allocation.sourceLabel}</span>
              <span className='font-medium text-foreground'>₹{allocation.sourceBefore.toLocaleString('en-IN')}/d ({allocation.sourceShareBeforePct.toFixed(0)}%)</span>
            </div>
            <div className='w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden'>
              <div
                className='h-full bg-amber-500/70 transition-all rounded-full'
                style={{ width: `${getWidthPct(allocation.sourceBefore)}%` }}
              />
            </div>
          </div>

          {/* Destination Before */}
          <div className='space-y-0.5'>
            <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
              <span className='truncate max-w-[200px] sm:max-w-xs'>{allocation.destLabel}</span>
              <span className='font-medium text-foreground'>₹{allocation.destBefore.toLocaleString('en-IN')}/d ({allocation.destShareBeforePct.toFixed(0)}%)</span>
            </div>
            <div className='w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden'>
              <div
                className='h-full bg-slate-400 dark:bg-zinc-500 transition-all rounded-full'
                style={{ width: `${getWidthPct(allocation.destBefore)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AFTER State */}
      <div className='space-y-2 pt-2 border-t border-border/40'>
        <div className='flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase'>
          <span>After Reallocation</span>
          <span className='text-foreground font-semibold'>Total: ₹{(allocation.sourceAfter + allocation.destAfter).toLocaleString('en-IN')}/d</span>
        </div>

        <div className='space-y-1.5'>
          {/* Source After */}
          <div className='space-y-0.5'>
            <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
              <span className='truncate max-w-[200px] sm:max-w-xs'>{allocation.sourceLabel}</span>
              <span className='font-medium text-amber-600 dark:text-amber-400'>
                ₹{allocation.sourceAfter.toLocaleString('en-IN')}/d ({allocation.sourceShareAfterPct.toFixed(0)}%)
              </span>
            </div>
            <div className='w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden'>
              <div
                className='h-full bg-amber-500 transition-all rounded-full'
                style={{ width: `${getWidthPct(allocation.sourceAfter)}%` }}
              />
            </div>
          </div>

          {/* Destination After */}
          <div className='space-y-0.5'>
            <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
              <span className='truncate max-w-[200px] sm:max-w-xs font-semibold text-foreground'>{allocation.destLabel}</span>
              <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                ₹{allocation.destAfter.toLocaleString('en-IN')}/d ({allocation.destShareAfterPct.toFixed(0)}%)
              </span>
            </div>
            <div className='w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden'>
              <div
                className='h-full bg-emerald-500 transition-all rounded-full shadow-xs'
                style={{ width: `${getWidthPct(allocation.destAfter)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
