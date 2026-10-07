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
  const gainerChannels = channels.filter((c) => c.deltaSpend > 0);
  const loserChannels = channels.filter((c) => c.deltaSpend < 0);
  const totalReallocated = channels.reduce((sum, c) => sum + Math.max(0, c.deltaSpend), 0);

  return (
    <div className={cn('rounded-2xl border border-border/80 bg-card p-5 font-mono shadow-xs space-y-5', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2'>
            <Icons.normalization className='size-4 text-emerald-500' />
            Dynamic Budget Flow &amp; Capital Rebalancing Diagram
          </h3>
          <p className='text-[10px] text-muted-foreground'>
            Capital shifts from diminishing-return placements into highest marginal-yield campaigns.
          </p>
        </div>

        <div className='flex items-center gap-2 text-xs'>
          <span className='text-[10px] uppercase font-bold text-muted-foreground'>Capital Rebalanced:</span>
          <span className='font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20'>
            ₹{(totalReallocated / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* 3-Column Visual Flow: Current Allocation -> Autonomous Engine -> New Allocation */}
      <div className='grid grid-cols-1 md:grid-cols-11 gap-4 items-center'>
        {/* Column 1: Current Allocation (4 cols) */}
        <div className='md:col-span-4 space-y-2.5'>
          <div className='text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between'>
            <span>Current Allocation</span>
            <span>Historical</span>
          </div>

          <div className='space-y-2'>
            {channels.map((ch) => (
              <div
                key={ch.platform}
                className='rounded-lg border border-border/70 p-2.5 bg-muted/20 flex items-center justify-between text-xs'
              >
                <div className='flex items-center gap-2'>
                  <span className='size-2 rounded-full' style={{ backgroundColor: ch.color }} />
                  <span className='font-bold text-foreground'>{ch.displayName}</span>
                </div>
                <div className='text-right'>
                  <span className='font-bold text-foreground block'>₹{(ch.currentSpend / 1000).toFixed(0)}k</span>
                  <span className='text-[10px] text-muted-foreground'>{ch.currentSharePct}% share</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Autonomous Reallocation Shift Directives (3 cols) */}
        <div className='md:col-span-3 space-y-2.5 flex flex-col justify-center'>
          <div className='text-[10px] uppercase font-bold text-primary text-center flex items-center justify-center gap-1.5'>
            <Icons.sparkles className='size-3' />
            AI Recommended Shift
          </div>

          <div className='space-y-2 bg-slate-100/50 dark:bg-zinc-950/60 p-2.5 rounded-xl border border-dashed border-border/80'>
            {channels.map((ch) => {
              const isGaining = ch.deltaSpend > 0;
              const isLosing = ch.deltaSpend < 0;

              return (
                <div
                  key={ch.platform}
                  className={cn(
                    'rounded-md px-2 py-1.5 flex items-center justify-between text-[11px] font-bold border transition-all',
                    isGaining && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
                    isLosing && 'bg-rose-500/10 border-rose-500/30 text-rose-500',
                    !isGaining && !isLosing && 'bg-muted/30 border-border text-muted-foreground'
                  )}
                >
                  <span className='truncate max-w-[90px]'>{ch.displayName.split(' ')[0]}</span>
                  <span className='font-mono'>
                    {ch.deltaSpend > 0 ? '+' : ''}₹{(ch.deltaSpend / 1000).toFixed(0)}k
                  </span>
                </div>
              );
            })}
          </div>

          <div className='text-center text-[9px] text-muted-foreground'>
            Money flowing to marginal profit peaks
          </div>
        </div>

        {/* Column 3: Recommended Final Allocation (4 cols) */}
        <div className='md:col-span-4 space-y-2.5'>
          <div className='text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between'>
            <span>Recommended Allocation</span>
            <span>Optimized</span>
          </div>

          <div className='space-y-2'>
            {channels.map((ch) => (
              <div
                key={ch.platform}
                className='rounded-lg border border-border/70 p-2.5 bg-card flex items-center justify-between text-xs ring-1 ring-border/40 shadow-2xs'
              >
                <div className='flex items-center gap-2'>
                  <span className='size-2 rounded-full' style={{ backgroundColor: ch.color }} />
                  <span className='font-bold text-foreground'>{ch.displayName}</span>
                </div>
                <div className='text-right'>
                  <span className='font-bold text-emerald-600 dark:text-emerald-400 block'>
                    ₹{(ch.recommendedSpend / 1000).toFixed(0)}k
                  </span>
                  <span className='text-[10px] text-muted-foreground'>{ch.recommendedSharePct}% share</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
