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
  const { financialImpact, horizonDays, activeStrategyName, isRecommended } = result;

  return (
    <div className={cn('rounded-xl border border-border/80 bg-card p-4 sm:p-5 font-mono shadow-xs space-y-4', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div className='flex items-center gap-2'>
          <Icons.shieldCheck className='size-3.5 text-emerald-500' />
          <h3 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            Financial Impact &amp; Waste Mitigation
          </h3>
        </div>
        <span className='text-[10px] text-muted-foreground uppercase'>
          {horizonDays}-Day Horizon Projections
        </span>
      </div>

      {/* Main Impact Comparison Hero Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
        {/* Without Mitigation */}
        <div className='rounded-lg border border-rose-500/30 bg-rose-500/5 p-3.5 space-y-1.5'>
          <div className='text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between'>
            <span>Without Mitigation</span>
            <span className='px-1 py-0.2 rounded bg-rose-500/20 text-[9px]'>Unmitigated</span>
          </div>
          <div className='text-xs text-muted-foreground'>
            Projected {horizonDays}-Day Loss:
          </div>
          <div className='text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400'>
            ₹{financialImpact.lossWithoutMitigation.toLocaleString('en-IN')}
          </div>
          <div className='text-[10px] text-muted-foreground pt-1 border-t border-rose-500/20'>
            Daily Loss Rate: ₹{financialImpact.dailyLossRate.toLocaleString('en-IN')}/day
          </div>
        </div>

        {/* With Selected Strategy */}
        <div className='rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-1.5'>
          <div className='text-[10px] uppercase font-bold text-foreground flex items-center justify-between'>
            <span>Under Current Strategy</span>
            <span className='px-1 py-0.2 rounded bg-muted text-[9px] truncate max-w-[110px]'>
              {activeStrategyName}
            </span>
          </div>
          <div className='text-xs text-muted-foreground'>
            Projected {horizonDays}-Day Loss:
          </div>
          <div className='text-xl sm:text-2xl font-bold text-foreground'>
            ₹{financialImpact.lossWithMitigation.toLocaleString('en-IN')}
          </div>
          <div className='text-[10px] text-muted-foreground pt-1 border-t border-border/40'>
            Margin Delta: ₹{(financialImpact.lossWithoutMitigation - financialImpact.lossWithMitigation).toLocaleString('en-IN')} protected
          </div>
        </div>

        {/* Loss Avoided / Waste Protected */}
        <div className='rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3.5 space-y-1.5 shadow-2xs'>
          <div className='text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between'>
            <span>Net Capital Protected</span>
            <span className='px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold'>
              {isRecommended ? 'Optimal Yield' : 'Applied'}
            </span>
          </div>
          <div className='text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium'>
            Total Loss Avoided:
          </div>
          <div className='text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400'>
            +₹{financialImpact.lossAvoided.toLocaleString('en-IN')}
          </div>
          <div className='text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1 border-t border-emerald-500/20'>
            Protected Waste Capital: ₹{financialImpact.protectedWasteWeekly.toLocaleString('en-IN')} / week
          </div>
        </div>
      </div>

      {/* Secondary Metrics Strip */}
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs'>
        <div className='rounded-md border border-border/70 p-2.5 bg-slate-50/40 dark:bg-zinc-950/40'>
          <span className='text-[10px] text-muted-foreground block uppercase'>
            Unmitigated Wasted Ad Spend
          </span>
          <span className='font-bold text-rose-500 text-sm'>
            ₹{financialImpact.wastedSpend.toLocaleString('en-IN')}
          </span>
        </div>

        <div className='rounded-md border border-border/70 p-2.5 bg-slate-50/40 dark:bg-zinc-950/40'>
          <span className='text-[10px] text-muted-foreground block uppercase'>
            Gross Revenue Gap
          </span>
          <span className='font-bold text-foreground text-sm'>
            ₹{financialImpact.revenueLoss.toLocaleString('en-IN')}
          </span>
        </div>

        <div className='rounded-md border border-border/70 p-2.5 bg-slate-50/40 dark:bg-zinc-950/40 col-span-2 sm:col-span-1'>
          <span className='text-[10px] text-muted-foreground block uppercase'>
            Direct Contribution Margin Gap
          </span>
          <span className='font-bold text-amber-600 dark:text-amber-400 text-sm'>
            ₹{financialImpact.marginLoss.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}
