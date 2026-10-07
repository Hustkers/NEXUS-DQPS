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
    <div className={cn('rounded-2xl border border-border/80 bg-card p-5 sm:p-6 font-mono shadow-xs space-y-6', className)}>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div className='flex items-center gap-2'>
          <Icons.normalization className='size-4 text-emerald-500' />
          <h2 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            CAPITAL REALLOCATION &amp; FLOW
          </h2>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-[10px] uppercase font-bold text-muted-foreground'>Capital Shifted:</span>
          <span className='font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-xs'>
            ₹{(totalReallocated / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* 1. COMPARATIVE STACKED ALLOCATION BARS (Current vs Recommended) */}
      <div className='space-y-3 bg-muted/15 p-4 rounded-xl border border-border/60'>
        {/* Current Allocation Bar */}
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <span className='size-1.5 rounded-full bg-muted-foreground' />
              CURRENT ALLOCATION (BASELINE)
            </span>
            <span>100% Total</span>
          </div>
          <div className='h-4 w-full bg-border/40 rounded-lg overflow-hidden flex ring-1 ring-border/50'>
            {channels.map((ch) => (
              <div
                key={`current-${ch.platform}`}
                style={{
                  width: `${ch.currentSharePct}%`,
                  backgroundColor: ch.color
                }}
                className='h-full relative group transition-all duration-500 flex items-center justify-center'
                title={`${ch.displayName}: ${ch.currentSharePct}% (₹${(ch.currentSpend / 1000).toFixed(0)}k)`}
              >
                {ch.currentSharePct >= 15 && (
                  <span className='text-[9px] font-bold text-white drop-shadow-xs truncate px-1 select-none'>
                    {ch.displayName.split(' ')[0]} {ch.currentSharePct}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Transition Arrow Indicator */}
        <div className='flex items-center justify-center gap-2 text-[10px] font-bold text-primary py-0.5'>
          <span>↓</span>
          <span className='text-[9px] uppercase tracking-widest text-muted-foreground'>Autonomous Capital Shift</span>
          <span>↓</span>
        </div>

        {/* Recommended Allocation Bar */}
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400'>
            <span className='flex items-center gap-1.5'>
              <span className='size-1.5 rounded-full bg-emerald-500' />
              RECOMMENDED ALLOCATION (OPTIMIZED)
            </span>
            <span>100% Total</span>
          </div>
          <div className='h-4 w-full bg-border/40 rounded-lg overflow-hidden flex ring-1 ring-emerald-500/40'>
            {channels.map((ch) => (
              <div
                key={`rec-${ch.platform}`}
                style={{
                  width: `${ch.recommendedSharePct}%`,
                  backgroundColor: ch.color
                }}
                className='h-full relative group transition-all duration-500 flex items-center justify-center'
                title={`${ch.displayName}: ${ch.recommendedSharePct}% (₹${(ch.recommendedSpend / 1000).toFixed(0)}k)`}
              >
                {ch.recommendedSharePct >= 15 && (
                  <span className='text-[9px] font-bold text-white drop-shadow-xs truncate px-1 select-none'>
                    {ch.displayName.split(' ')[0]} {ch.recommendedSharePct}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CENTRAL ANIMATED FLOW DIAGRAM: Lower Marginal Return -> Higher Marginal Return */}
      <div className='grid grid-cols-1 md:grid-cols-11 gap-4 items-center bg-muted/10 p-4 rounded-xl border border-dashed border-border/70'>
        {/* Left: Donors / Diminishing Returns Channels (4 cols) */}
        <div className='md:col-span-4 space-y-2.5'>
          <div className='text-[10px] uppercase font-bold text-rose-500 flex items-center justify-between'>
            <span>LOWER MARGINAL RETURN</span>
            <span>DONORS</span>
          </div>

          <div className='space-y-2'>
            {loserChannels.map((ch) => (
              <div
                key={ch.platform}
                className='rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 flex items-center justify-between text-xs hover:border-rose-500/60 transition-all'
              >
                <div className='flex items-center gap-2'>
                  <span className='size-2 rounded-full' style={{ backgroundColor: ch.color }} />
                  <div>
                    <span className='font-bold text-foreground block'>{ch.displayName}</span>
                    <span className='text-[9px] text-muted-foreground'>Marginal: ₹{ch.marginalReturn}/₹1</span>
                  </div>
                </div>
                <div className='text-right'>
                  <span className='font-mono font-bold text-rose-500 text-xs block'>
                    -₹{(Math.abs(ch.deltaSpend) / 1000).toFixed(0)}k
                  </span>
                  <span className='text-[9px] text-muted-foreground'>
                    ₹{(ch.currentSpend / 1000).toFixed(0)}k → ₹{(ch.recommendedSpend / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Rebalancing Flow Hub & Animated SVG Stream (3 cols) */}
        <div className='md:col-span-3 flex flex-col items-center justify-center text-center p-2 relative'>
          {/* Animated SVG Stream Lines */}
          <div className='w-full h-12 relative flex items-center justify-center overflow-hidden'>
            <svg className='w-full h-full' viewBox='0 0 100 40' preserveAspectRatio='none'>
              <defs>
                <linearGradient id='streamGrad' x1='0%' y1='0%' x2='100%' y2='0%'>
                  <stop offset='0%' stopColor='#f43f5e' stopOpacity='0.7' />
                  <stop offset='50%' stopColor='#38bdf8' stopOpacity='0.9' />
                  <stop offset='100%' stopColor='#10b981' stopOpacity='0.7' />
                </linearGradient>
              </defs>
              {/* Animated Dashed Flow Path 1 */}
              <path
                d='M 5 10 Q 50 10, 95 10'
                fill='none'
                stroke='url(#streamGrad)'
                strokeWidth='2.5'
                strokeDasharray='4 3'
                className='animate-[dash_1.5s_linear_infinite]'
              />
              {/* Animated Dashed Flow Path 2 */}
              <path
                d='M 5 30 Q 50 30, 95 30'
                fill='none'
                stroke='url(#streamGrad)'
                strokeWidth='2.5'
                strokeDasharray='4 3'
                className='animate-[dash_1.5s_linear_infinite]'
              />
            </svg>
          </div>

          <div className='px-2.5 py-1 rounded-full bg-background border border-border shadow-xs text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 z-10'>
            <span className='size-1.5 rounded-full bg-primary animate-ping' />
            <span>₹{(totalReallocated / 1000).toFixed(0)}k CAPITAL FLOW</span>
          </div>
        </div>

        {/* Right: Gainers / High Marginal Yield Channels (4 cols) */}
        <div className='md:col-span-4 space-y-2.5'>
          <div className='text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between'>
            <span>HIGHER MARGINAL RETURN</span>
            <span>GAINERS</span>
          </div>

          <div className='space-y-2'>
            {gainerChannels.map((ch) => (
              <div
                key={ch.platform}
                className='rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5 flex items-center justify-between text-xs hover:border-emerald-500/60 transition-all'
              >
                <div className='flex items-center gap-2'>
                  <span className='size-2 rounded-full' style={{ backgroundColor: ch.color }} />
                  <div>
                    <span className='font-bold text-foreground block'>{ch.displayName}</span>
                    <span className='text-[9px] text-muted-foreground'>Marginal: ₹{ch.marginalReturn}/₹1</span>
                  </div>
                </div>
                <div className='text-right'>
                  <span className='font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs block'>
                    +₹{(ch.deltaSpend / 1000).toFixed(0)}k
                  </span>
                  <span className='text-[9px] text-muted-foreground'>
                    ₹{(ch.currentSpend / 1000).toFixed(0)}k → ₹{(ch.recommendedSpend / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. CHANNEL DELTA STRIP (4 Compact Cards) */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {channels.map((ch) => {
          const isGaining = ch.deltaSpend > 0;
          const isLosing = ch.deltaSpend < 0;

          return (
            <div
              key={ch.platform}
              className='rounded-xl border border-border/70 bg-card p-3 space-y-2 text-xs transition-all hover:border-foreground/40 shadow-2xs'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-1.5 font-bold text-foreground'>
                  <span className='size-2 rounded-full shrink-0' style={{ backgroundColor: ch.color }} />
                  <span className='text-[11px] truncate'>{ch.displayName}</span>
                </div>
                <span className='font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-muted'>
                  {ch.recommendedSharePct}%
                </span>
              </div>

              <div className='flex items-baseline justify-between'>
                <span className='text-xs text-muted-foreground'>
                  ₹{(ch.currentSpend / 1000).toFixed(0)}k → <strong className='text-foreground'>₹{(ch.recommendedSpend / 1000).toFixed(0)}k</strong>
                </span>
                <span
                  className={cn(
                    'font-mono font-bold text-xs',
                    isGaining && 'text-emerald-600 dark:text-emerald-400',
                    isLosing && 'text-rose-500',
                    !isGaining && !isLosing && 'text-muted-foreground'
                  )}
                >
                  {isGaining ? '↑ +' : isLosing ? '↓ ' : ''}₹{(Math.abs(ch.deltaSpend) / 1000).toFixed(0)}k
                </span>
              </div>

              <div className='flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground'>
                <span>Yield</span>
                <span className='font-bold text-foreground'>₹{ch.marginalReturn}/₹1</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
