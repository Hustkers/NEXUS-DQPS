'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { SimulationResult } from '../types/simulation-types';

interface SimulationFinancialImpactProps {
  result: SimulationResult;
  className?: string;
}

export function SimulationFinancialImpact({
  result,
  className
}: SimulationFinancialImpactProps) {
  const { financialImpact, horizonDays, activeStrategyName, isRecommended, mitigated } = result;
  const totalMitigatedMargin = Math.round(mitigated.margin * horizonDays);

  return (
    <div className={cn('space-y-2.5 font-mono', className)}>
      {/* Section Header */}
      <div className='flex items-center justify-between px-1'>
        <div className='flex items-center gap-2'>
          <Icons.shieldCheck className='size-3.5 text-emerald-500' />
          <h3 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            Simulation Results Matrix
          </h3>
          <span className='text-[10px] text-muted-foreground uppercase hidden sm:inline'>
            • {horizonDays}-Day Horizon • {activeStrategyName}
          </span>
        </div>
        <span
          className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider',
            isRecommended
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-muted text-foreground border border-border'
          )}
        >
          {isRecommended ? 'Optimal Policy' : 'Applied Strategy'}
        </span>
      </div>

      {/* Compact 4-KPI Row */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {/* 1. Projected Loss */}
        <div className='rounded-xl border border-rose-500/30 bg-rose-500/5 p-3.5 space-y-1'>
          <div className='text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between'>
            <span>Projected Loss</span>
            <span className='size-1.5 rounded-full bg-rose-500' />
          </div>
          <div className='text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400'>
            ₹{financialImpact.lossWithoutMitigation.toLocaleString('en-IN')}
          </div>
          <div className='text-[10px] text-muted-foreground truncate'>
            ₹{financialImpact.dailyLossRate.toLocaleString('en-IN')}/day unmitigated bleed
          </div>
        </div>

        {/* 2. Loss Avoided */}
        <div className='rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 space-y-1 shadow-2xs'>
          <div className='text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between'>
            <span>Loss Avoided</span>
            <span className='size-1.5 rounded-full bg-emerald-500' />
          </div>
          <div className='text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400'>
            +₹{financialImpact.lossAvoided.toLocaleString('en-IN')}
          </div>
          <div className='text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate'>
            Capital protected vs no-action
          </div>
        </div>

        {/* 3. Revenue Gap */}
        <div className='rounded-xl border border-border bg-card p-3.5 space-y-1'>
          <div className='text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between'>
            <span>Revenue Gap</span>
            <span className='size-1.5 rounded-full bg-zinc-400' />
          </div>
          <div className='text-lg sm:text-xl font-bold text-foreground'>
            ₹{financialImpact.revenueLoss.toLocaleString('en-IN')}
          </div>
          <div className='text-[10px] text-muted-foreground truncate'>
            Gross top-line shock vs baseline
          </div>
        </div>

        {/* 4. Contribution Margin */}
        <div className='rounded-xl border border-border bg-card p-3.5 space-y-1'>
          <div className='text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between'>
            <span>Contribution Margin</span>
            <span className='size-1.5 rounded-full bg-blue-500' />
          </div>
          <div className='text-lg sm:text-xl font-bold text-foreground'>
            ₹{totalMitigatedMargin.toLocaleString('en-IN')}
          </div>
          <div className='text-[10px] text-muted-foreground truncate'>
            ₹{Math.round(mitigated.margin).toLocaleString('en-IN')}/day ({mitigated.roas.toFixed(2)}x ROAS)
          </div>
        </div>
      </div>
    </div>
  );
}
