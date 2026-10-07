'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { RegionalRLState } from '@/lib/rl-ad-optimizer';
import { IconArrowUpRight, IconArrowDownRight, IconArrowRight } from '@tabler/icons-react';

interface CapitalFlowVisualizerProps {
  regionalStates: RegionalRLState[];
  selectedRegionId?: string | null;
  onSelectRegion?: (id: string | null) => void;
  className?: string;
}

export function CapitalFlowVisualizer({
  regionalStates,
  selectedRegionId,
  onSelectRegion,
  className
}: CapitalFlowVisualizerProps) {
  // Separate into donor regions (slashed/suppressed) and recipient regions (boosted/expanded)
  const donors = useMemo(
    () => regionalStates.filter((r) => r.spendDeltaPct < 0).sort((a, b) => a.spendDeltaPct - b.spendDeltaPct),
    [regionalStates]
  );

  const recipients = useMemo(
    () => regionalStates.filter((r) => r.spendDeltaPct > 0).sort((a, b) => b.spendDeltaPct - a.spendDeltaPct),
    [regionalStates]
  );

  const totalDiverted = useMemo(
    () => donors.reduce((acc, r) => acc + Math.max(0, r.currentDailySpend - r.recommendedDailySpend), 0),
    [donors]
  );

  const totalInjected = useMemo(
    () => recipients.reduce((acc, r) => acc + Math.max(0, r.recommendedDailySpend - r.currentDailySpend), 0),
    [recipients]
  );

  return (
    <div className={cn('rounded-xl border border-border bg-card/70 p-4 sm:p-5 font-mono space-y-4', className)}>
      {/* Header with high-level direction */}
      <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5'>
        <div className='flex items-center gap-2'>
          <span className='size-2 rounded-full bg-emerald-400 animate-pulse' />
          <h4 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            CAPITAL REALLOCATION FLOW
          </h4>
        </div>
        <div className='flex items-center gap-3 text-[11px]'>
          <span className='text-rose-400 font-bold'>
            -₹{totalDiverted.toLocaleString('en-IN')}/day Pruned
          </span>
          <span className='text-muted-foreground'>→</span>
          <span className='text-emerald-400 font-bold'>
            +₹{totalInjected.toLocaleString('en-IN')}/day Boosted
          </span>
        </div>
      </div>

      {/* Visual Flow Columns */}
      <div className='grid grid-cols-1 md:grid-cols-12 gap-4 items-center'>
        {/* Left Column: Donor Regions (Low Headroom / Suppressed) */}
        <div className='md:col-span-5 space-y-2'>
          <div className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center justify-between'>
            <span>LOW HEADROOM (SUPPRESS)</span>
            <span className='text-rose-400'>CUTS</span>
          </div>

          <div className='space-y-1.5'>
            {donors.map((r) => (
              <button
                key={r.id}
                type='button'
                onClick={() => onSelectRegion?.(r.id)}
                className={cn(
                  'w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer group',
                  selectedRegionId === r.id
                    ? 'bg-rose-500/15 border-rose-400 ring-1 ring-rose-400/40'
                    : 'bg-muted/20 border-border/60 hover:border-rose-500/40'
                )}
              >
                <div className='flex items-center gap-2 min-w-0'>
                  <span className='size-2 rounded-full shrink-0' style={{ backgroundColor: r.color }} />
                  <div className='truncate'>
                    <div className='text-xs font-bold text-foreground truncate'>{r.countryCode}</div>
                    <div className='text-[10px] text-muted-foreground'>
                      ₹{r.currentDailySpend} → ₹{r.recommendedDailySpend}
                    </div>
                  </div>
                </div>

                <div className='text-right shrink-0'>
                  <div className='text-xs font-black text-rose-400 flex items-center justify-end'>
                    <IconArrowDownRight className='size-3.5' />
                    {r.spendDeltaPct}%
                  </div>
                  <div className='text-[9px] text-muted-foreground'>{(r.conversionProbability * 100).toFixed(0)}% P(Sale)</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Animated Flow Channel */}
        <div className='md:col-span-2 flex flex-col items-center justify-center py-2'>
          <div className='hidden md:flex flex-col items-center gap-1 text-cyan-400'>
            <div className='size-8 rounded-full border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center'>
              <IconArrowRight className='size-4 animate-pulse' />
            </div>
            <span className='text-[9px] uppercase text-muted-foreground font-bold tracking-tighter mt-1'>
              DIVERSION
            </span>
          </div>
          <div className='md:hidden flex items-center justify-center gap-2 text-cyan-400 py-1'>
            <IconArrowDownRight className='size-4' />
            <span className='text-[10px] uppercase font-bold'>Capital Rerouted</span>
          </div>
        </div>

        {/* Right Column: Recipient Regions (High Headroom / Scaled) */}
        <div className='md:col-span-5 space-y-2'>
          <div className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center justify-between'>
            <span>HIGH HEADROOM (SCALE)</span>
            <span className='text-emerald-400'>INJECTION</span>
          </div>

          <div className='space-y-1.5'>
            {recipients.map((r) => (
              <button
                key={r.id}
                type='button'
                onClick={() => onSelectRegion?.(r.id)}
                className={cn(
                  'w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer group',
                  selectedRegionId === r.id
                    ? 'bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-400/40'
                    : 'bg-muted/20 border-border/60 hover:border-emerald-500/40'
                )}
              >
                <div className='flex items-center gap-2 min-w-0'>
                  <span className='size-2 rounded-full shrink-0' style={{ backgroundColor: r.color }} />
                  <div className='truncate'>
                    <div className='text-xs font-bold text-foreground truncate'>{r.countryCode}</div>
                    <div className='text-[10px] text-muted-foreground'>
                      ₹{r.currentDailySpend} → ₹{r.recommendedDailySpend}
                    </div>
                  </div>
                </div>

                <div className='text-right shrink-0'>
                  <div className='text-xs font-black text-emerald-400 flex items-center justify-end'>
                    <IconArrowUpRight className='size-3.5' />
                    +{r.spendDeltaPct}%
                  </div>
                  <div className='text-[9px] text-emerald-500 font-bold'>{(r.conversionProbability * 100).toFixed(0)}% P(Sale)</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Stacked Budget Allocation Bar: BEFORE vs AFTER */}
      <div className='pt-2 border-t border-border/40 space-y-2'>
        <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold'>
          <span>BUDGET ALLOCATION (BEFORE vs AFTER RL)</span>
          <span>REGIONAL SHARE</span>
        </div>

        {/* BEFORE Bar */}
        <div className='space-y-1'>
          <div className='flex items-center justify-between text-[9px] text-muted-foreground'>
            <span>BEFORE RL</span>
            <span>100% BLENDED</span>
          </div>
          <div className='h-3 w-full rounded flex overflow-hidden bg-muted/40'>
            {regionalStates.map((r) => {
              const totalPre = regionalStates.reduce((acc, x) => acc + x.currentDailySpend, 0);
              const pct = totalPre > 0 ? (r.currentDailySpend / totalPre) * 100 : 20;
              return (
                <div
                  key={`pre-${r.id}`}
                  style={{ width: `${pct}%`, backgroundColor: r.color }}
                  className='h-full transition-all opacity-70 hover:opacity-100'
                  title={`Before RL: ${r.countryCode} ₹${r.currentDailySpend} (${pct.toFixed(0)}%)`}
                />
              );
            })}
          </div>
        </div>

        {/* AFTER Bar */}
        <div className='space-y-1'>
          <div className='flex items-center justify-between text-[9px] text-emerald-400 font-bold'>
            <span>AFTER RL OPTIMAL</span>
            <span>CONCENTRATED INTO HIGH HEADROOM</span>
          </div>
          <div className='h-3.5 w-full rounded flex overflow-hidden bg-muted/40 ring-1 ring-emerald-500/30'>
            {regionalStates.map((r) => {
              const totalPost = regionalStates.reduce((acc, x) => acc + x.recommendedDailySpend, 0);
              const pct = totalPost > 0 ? (r.recommendedDailySpend / totalPost) * 100 : 20;
              return (
                <div
                  key={`post-${r.id}`}
                  style={{ width: `${pct}%`, backgroundColor: r.color }}
                  className='h-full transition-all hover:brightness-125'
                  title={`After RL: ${r.countryCode} ₹${r.recommendedDailySpend} (${pct.toFixed(0)}%)`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
