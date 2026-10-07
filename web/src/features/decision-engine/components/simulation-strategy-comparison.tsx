'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { SimulationResult } from '../types/simulation-types';

interface SimulationStrategyComparisonProps {
  result: SimulationResult;
  onSelectStrategy?: (strategyId: string) => void;
  className?: string;
  variant?: 'default' | 'minimal';
}

export function SimulationStrategyComparison({
  result,
  onSelectStrategy,
  className,
  variant: _variant = 'default',
}: SimulationStrategyComparisonProps) {
  const { strategyComparisons, activeStrategyId, horizonDays } = result;

  // Find the best strategy based on loss avoided
  const bestStrat = strategyComparisons.reduce(
    (best, curr) => (curr.lossAvoided > best.lossAvoided ? curr : best),
    strategyComparisons[0]
  );

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 shadow-xs space-y-4', className)}>
      <div className='border-b border-border/60 pb-3'>
        <h4 className='text-sm font-semibold text-foreground'>
          Strategy comparison
        </h4>
        <p className='text-xs text-muted-foreground mt-0.5'>
          Projected outcomes over {horizonDays} days. Select any row to test that response.
        </p>
      </div>

      <div className='overflow-x-auto rounded-xl border border-border'>
        <table className='w-full text-left text-sm'>
          <thead>
            <tr className='border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground'>
              <th className='py-3 px-4'>Strategy</th>
              <th className='py-3 px-4 text-right'>Loss avoided</th>
              <th className='py-3 px-4 text-right'>ROAS</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/60'>
            {strategyComparisons.map((strat) => {
              const isActive = strat.strategyId === activeStrategyId;
              const isBest = strat.strategyId === bestStrat?.strategyId;

              return (
                <tr
                  key={strat.strategyId}
                  onClick={() => onSelectStrategy?.(strat.strategyId)}
                  className={cn(
                    'transition-colors cursor-pointer text-sm',
                    isActive
                      ? 'bg-accent/80 font-medium'
                      : isBest
                      ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                      : 'hover:bg-muted/40'
                  )}
                >
                  <td className='py-3 px-4'>
                    <div className='flex items-center gap-2'>
                      <span
                        className={cn(
                          'size-2 rounded-full shrink-0',
                          isActive
                            ? 'bg-foreground'
                            : isBest
                            ? 'bg-emerald-500'
                            : 'bg-muted-foreground/30'
                        )}
                      />
                      <span className='font-medium text-foreground'>
                        {strat.strategyName}
                      </span>
                      {isBest && (
                        <span className='text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shrink-0 ml-1'>
                          Best outcome
                        </span>
                      )}
                      {isActive && !isBest && (
                        <span className='text-xs text-muted-foreground font-normal ml-1'>
                          (Selected)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='py-3 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400 tabular-nums'>
                    +₹{strat.lossAvoided.toLocaleString('en-IN')}
                  </td>
                  <td className='py-3 px-4 text-right font-medium text-foreground tabular-nums'>
                    {strat.roas.toFixed(2)}x
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
