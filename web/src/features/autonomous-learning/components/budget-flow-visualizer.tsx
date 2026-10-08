'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ChannelAllocationSummary } from '@/lib/autonomous-learning/types';

interface BudgetFlowVisualizerProps {
  channels: ChannelAllocationSummary[];
  className?: string;
}

export function BudgetFlowVisualizer({ channels, className }: BudgetFlowVisualizerProps) {
  const totalReallocated = channels.reduce((sum, c) => sum + Math.max(0, c.deltaSpend), 0);

  return (
    <div className={cn('rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 font-mono shadow-none space-y-4', className)}>
      <div className='flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3'>
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2'>
            <Icons.normalization className='size-3.5 text-zinc-500' />
            Budget Flow &amp; Rebalancing Distribution
          </h3>
          <p className='text-[10px] text-zinc-500 dark:text-zinc-400'>
            Deterministic capital shift from diminishing-return regimes into highest marginal ROAS campaigns.
          </p>
        </div>

        <div className='flex items-center gap-2 text-xs'>
          <span className='text-[10px] uppercase font-semibold text-zinc-500'>Rebalanced:</span>
          <span className='font-mono font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px]'>
            ${totalReallocated.toLocaleString('en-US')}
          </span>
        </div>
      </div>

      {/* 3-Column Visual Flow: Current Allocation -> Autonomous Shift -> Recommended Allocation */}
      <div className='grid grid-cols-1 md:grid-cols-11 gap-4 items-center'>
        {/* Column 1: Current Allocation (4 cols) */}
        <div className='md:col-span-4 space-y-2'>
          <div className='text-[10px] uppercase font-semibold text-zinc-500 flex items-center justify-between'>
            <span>Current Spend</span>
            <span>Historical Share</span>
          </div>

          <div className='space-y-1.5'>
            {channels.map((ch) => (
              <div
                key={ch.platform}
                className='rounded-md border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between text-xs'
              >
                <div className='flex items-center gap-2'>
                  <span className='size-2 rounded-full' style={{ backgroundColor: ch.color }} />
                  <span className='font-medium text-zinc-900 dark:text-zinc-100'>{ch.displayName}</span>
                </div>
                <div className='text-right'>
                  <span className='font-mono font-bold text-zinc-900 dark:text-zinc-100 block'>
                    ${ch.currentSpend.toLocaleString('en-US')}
                  </span>
                  <span className='font-mono text-[10px] text-zinc-500'>{ch.currentSharePct}% share</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Shift Directives (3 cols) */}
        <div className='md:col-span-3 space-y-2 flex flex-col justify-center'>
          <div className='text-[10px] uppercase font-semibold text-zinc-500 text-center flex items-center justify-center gap-1.5'>
            <Icons.sparkles className='size-3 text-zinc-400' />
            Marginal Delta
          </div>

          <div className='space-y-1.5 bg-zinc-50/50 dark:bg-zinc-900/20 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800'>
            {channels.map((ch) => {
              const isGaining = ch.deltaSpend > 0;
              const isLosing = ch.deltaSpend < 0;

              return (
                <div
                  key={ch.platform}
                  className={cn(
                    'rounded px-2 py-1.5 flex items-center justify-between text-[11px] font-mono border transition-all',
                    isGaining && 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold',
                    isLosing && 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-500',
                    !isGaining && !isLosing && 'bg-transparent border-transparent text-zinc-400'
                  )}
                >
                  <span className='truncate max-w-[85px] text-[10px] uppercase font-medium'>{ch.displayName.split(' ')[0]}</span>
                  <span>
                    {ch.deltaSpend > 0 ? '+' : ''}${ch.deltaSpend.toLocaleString('en-US')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className='text-center text-[9px] text-zinc-400 dark:text-zinc-500 font-mono'>
            Gradient descent allocation
          </div>
        </div>

        {/* Column 3: Recommended Final Allocation (4 cols) */}
        <div className='md:col-span-4 space-y-2'>
          <div className='text-[10px] uppercase font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between'>
            <span>Recommended Spend</span>
            <span>Target Share</span>
          </div>

          <div className='space-y-1.5'>
            {channels.map((ch) => (
              <div
                key={ch.platform}
                className='rounded-md border border-zinc-300 dark:border-zinc-700 p-2.5 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs'
              >
                <div className='flex items-center gap-2'>
                  <span className='size-2 rounded-full' style={{ backgroundColor: ch.color }} />
                  <span className='font-medium text-zinc-900 dark:text-zinc-100'>{ch.displayName}</span>
                </div>
                <div className='text-right'>
                  <span className='font-mono font-bold text-zinc-900 dark:text-zinc-100 block'>
                    ${ch.recommendedSpend.toLocaleString('en-US')}
                  </span>
                  <span className='font-mono text-[10px] text-zinc-500'>{ch.recommendedSharePct}% share</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
