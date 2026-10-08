'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { SimulationResult } from '../types/simulation-types';

interface SimulationStrategyComparisonProps {
  result: SimulationResult;
  onSelectStrategy?: (strategyId: string) => void;
  className?: string;
}

export function SimulationStrategyComparison({
  result,
  onSelectStrategy,
  className
}: SimulationStrategyComparisonProps) {
  const { strategyComparisons, activeStrategyId, recommendation, horizonDays } = result;

  return (
    <div className={cn('rounded-xl border border-border/80 bg-card p-4 sm:p-5 font-mono shadow-xs space-y-4', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div className='flex items-center gap-2'>
          <Icons.adjustments className='size-3.5 text-muted-foreground' />
          <h3 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            Strategy Comparison Matrix
          </h3>
        </div>
        <span className='text-[10px] text-muted-foreground uppercase'>
          Evaluated Across {strategyComparisons.length} Policies
        </span>
      </div>

      <div className='overflow-x-auto rounded-lg border border-border/70'>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-border/80 bg-slate-100/70 dark:bg-zinc-900/60 text-[10px] text-muted-foreground uppercase tracking-wider'>
              <th className='py-2.5 px-3 font-semibold'>Policy Strategy</th>
              <th className='py-2.5 px-3 text-right font-semibold text-rose-600 dark:text-rose-400'>
                {horizonDays}d Loss
              </th>
              <th className='py-2.5 px-3 text-right font-semibold'>ROAS</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Revenue</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Margin</th>
              <th className='py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400'>
                Loss Avoided
              </th>
              <th className='py-2.5 px-3 text-center font-semibold'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/60'>
            {strategyComparisons.map((strat) => {
              const isActive = strat.strategyId === activeStrategyId;
              const isRec = strat.isRecommended;

              return (
                <tr
                  key={strat.strategyId}
                  onClick={() => onSelectStrategy?.(strat.strategyId)}
                  className={cn(
                    'transition-colors cursor-pointer',
                    isActive
                      ? 'bg-accent/80 font-semibold'
                      : isRec
                      ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                      : 'hover:bg-muted/30'
                  )}
                >
                  <td className='py-2.5 px-3'>
                    <div className='flex items-center gap-1.5'>
                      <span className='font-bold text-foreground text-[11px] truncate max-w-[220px]'>
                        {strat.strategyName}
                      </span>
                      {isRec && (
                        <span className='text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'>
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 font-medium'>
                    ₹{strat.financialLoss.toLocaleString('en-IN')}
                  </td>
                  <td className='py-2.5 px-3 text-right font-bold text-foreground'>
                    {strat.roas.toFixed(2)}x
                  </td>
                  <td className='py-2.5 px-3 text-right text-muted-foreground'>
                    ₹{strat.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className='py-2.5 px-3 text-right font-medium text-foreground'>
                    ₹{strat.margin.toLocaleString('en-IN')}
                  </td>
                  <td className='py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400'>
                    +₹{strat.lossAvoided.toLocaleString('en-IN')}
                  </td>
                  <td className='py-2.5 px-3 text-center'>
                    {isActive ? (
                      <span className='text-[10px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10'>
                        ACTIVE
                      </span>
                    ) : (
                      <span className='text-[10px] text-muted-foreground hover:text-foreground'>
                        Select
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* NEXUS Recommendation Banner */}
      <div className='rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1.5 text-xs'>
        <div className='flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider text-[11px]'>
          <Icons.check className='size-3.5' />
          NEXUS Recommendation: {recommendation.recommendedStrategyName}
        </div>
        <p className='text-muted-foreground leading-relaxed text-[11px]'>
          {recommendation.reason}
        </p>
        <div className='flex items-center gap-4 pt-1 border-t border-emerald-500/20 text-[10px] text-muted-foreground font-semibold flex-wrap'>
          <span>Expected Loss Avoided: <strong className='text-emerald-600 dark:text-emerald-400'>+₹{recommendation.expectedLossAvoided.toLocaleString('en-IN')}</strong></span>
          <span>•</span>
          <span>Target ROAS: <strong className='text-foreground'>{recommendation.expectedRoas.toFixed(2)}x</strong></span>
          <span>•</span>
          <span>Protected Margin: <strong className='text-foreground'>₹{recommendation.expectedMargin.toLocaleString('en-IN')}</strong></span>
        </div>
      </div>
    </div>
  );
}
