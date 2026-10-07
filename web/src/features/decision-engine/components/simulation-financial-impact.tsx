'use client';

import React from 'react';
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
    <div className={cn('space-y-3', className)}>
      {/* Section Header */}
      <div className='flex items-center justify-between px-1'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-semibold text-foreground'>
            Financial overview
          </h3>
          <span className='text-xs text-muted-foreground hidden sm:inline'>
            • {horizonDays} days • {activeStrategyName}
          </span>
        </div>
        <span
          className={cn(
            'text-xs font-medium px-2.5 py-0.5 rounded-full',
            isRecommended
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-muted text-foreground'
          )}
        >
          {isRecommended ? 'Recommended' : 'Selected'}
        </span>
      </div>

      {/* 4-KPI Row */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {/* 1. Projected Loss */}
        <div className='rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-1.5'>
          <div className='text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center justify-between'>
            <span>Projected loss</span>
            <span className='size-1.5 rounded-full bg-rose-500' />
          </div>
          <div className='text-xl font-semibold text-rose-600 dark:text-rose-400 tabular-nums'>
            ₹{financialImpact.lossWithoutMitigation.toLocaleString('en-IN')}
          </div>
          <div className='text-xs text-muted-foreground truncate'>
            ₹{financialImpact.dailyLossRate.toLocaleString('en-IN')}/day unmitigated
          </div>
        </div>

        {/* 2. Loss Avoided */}
        <div className='rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1.5 shadow-2xs'>
          <div className='text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center justify-between'>
            <span>Loss avoided</span>
            <span className='size-1.5 rounded-full bg-emerald-500' />
          </div>
          <div className='text-xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums'>
            +₹{financialImpact.lossAvoided.toLocaleString('en-IN')}
          </div>
          <div className='text-xs text-emerald-700 dark:text-emerald-400 truncate'>
            Capital protected vs no action
          </div>
        </div>

        {/* 3. Revenue Gap */}
        <div className='rounded-xl border border-border bg-card p-4 space-y-1.5'>
          <div className='text-xs font-medium text-muted-foreground flex items-center justify-between'>
            <span>Revenue gap</span>
            <span className='size-1.5 rounded-full bg-zinc-400' />
          </div>
          <div className='text-xl font-semibold text-foreground tabular-nums'>
            ₹{financialImpact.revenueLoss.toLocaleString('en-IN')}
          </div>
          <div className='text-xs text-muted-foreground truncate'>
            Top-line drop vs baseline
          </div>
        </div>

        {/* 4. Contribution Margin */}
        <div className='rounded-xl border border-border bg-card p-4 space-y-1.5'>
          <div className='text-xs font-medium text-muted-foreground flex items-center justify-between'>
            <span>Contribution margin</span>
            <span className='size-1.5 rounded-full bg-blue-500' />
          </div>
          <div className='text-xl font-semibold text-foreground tabular-nums'>
            ₹{totalMitigatedMargin.toLocaleString('en-IN')}
          </div>
          <div className='text-xs text-muted-foreground truncate'>
            ₹{Math.round(mitigated.margin).toLocaleString('en-IN')}/day ({mitigated.roas.toFixed(2)}x ROAS)
          </div>
        </div>
      </div>
    </div>
  );
}
