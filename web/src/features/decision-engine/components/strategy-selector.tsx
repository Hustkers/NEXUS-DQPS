'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { StrategyOption, ScenarioInputParams } from '../types/simulation-types';

interface StrategySelectorProps {
  strategies: StrategyOption[];
  selectedStrategyId: string;
  onSelectStrategy: (strategyId: string) => void;
  inputs: ScenarioInputParams;
  onChangeInputs: (newInputs: ScenarioInputParams) => void;
  className?: string;
}

export function StrategySelector({
  strategies,
  selectedStrategyId,
  onSelectStrategy,
  inputs,
  onChangeInputs,
  className
}: StrategySelectorProps) {
  const isCustomSelected = selectedStrategyId === 'custom-strategy';

  return (
    <div className={cn('rounded-xl border border-border/80 bg-card p-4 sm:p-5 font-mono shadow-xs space-y-3.5', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div className='flex items-center gap-2'>
          <Icons.check className='size-3.5 text-muted-foreground' />
          <h3 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            Mitigation Strategy Selection
          </h3>
        </div>
        <span className='text-[10px] text-muted-foreground uppercase'>
          Autonomous Decision Framework
        </span>
      </div>

      <div className='space-y-2'>
        {strategies.map((strategy) => {
          const isSelected = selectedStrategyId === strategy.id;
          const isRecommended = strategy.isRecommended;

          return (
            <button
              key={strategy.id}
              type='button'
              onClick={() => onSelectStrategy(strategy.id)}
              className={cn(
                'w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-1',
                isSelected
                  ? isRecommended
                    ? 'border-emerald-500/80 bg-emerald-500/10 dark:bg-emerald-950/20 shadow-xs ring-1 ring-emerald-500/30'
                    : 'border-foreground bg-accent/80 shadow-xs ring-1 ring-foreground/20'
                  : 'border-border/70 bg-slate-50/40 dark:bg-zinc-950/30 hover:border-border hover:bg-slate-100/60 dark:hover:bg-zinc-900/40'
              )}
            >
              <div className='flex items-center justify-between w-full'>
                <span className='font-bold text-foreground flex items-center gap-1.5'>
                  {strategy.name}
                </span>
                {strategy.badge && (
                  <span
                    className={cn(
                      'text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider',
                      isRecommended
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        : strategy.badge === 'Defensive'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        : strategy.badge === 'Unmitigated'
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {strategy.badge}
                  </span>
                )}
              </div>

              <p className='text-[11px] text-muted-foreground leading-relaxed'>
                {strategy.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Custom Strategy Configurator (Shows only when Custom is chosen) */}
      {isCustomSelected && (
        <div className='rounded-lg border border-dashed border-border/90 bg-muted/30 p-3 space-y-3 pt-3 text-xs'>
          <div className='font-bold uppercase tracking-wider text-foreground text-[10px] flex items-center gap-1'>
            <Icons.adjustments className='size-3 text-primary' />
            Custom Parameterized Strategy Bounds
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <div className='flex justify-between text-[10px] text-muted-foreground'>
                <span>Budget Reallocation Shift:</span>
                <span className='font-bold text-foreground'>{inputs.customBudgetShiftPct ?? 50}%</span>
              </div>
              <input
                type='range'
                min={0}
                max={100}
                value={inputs.customBudgetShiftPct ?? 50}
                onChange={(e) =>
                  onChangeInputs({
                    ...inputs,
                    customBudgetShiftPct: parseInt(e.target.value) || 0
                  })
                }
                className='w-full accent-primary h-1 bg-border rounded-lg'
              />
            </div>

            <div className='space-y-1'>
              <div className='flex justify-between text-[10px] text-muted-foreground'>
                <span>Direct Spend Reduction:</span>
                <span className='font-bold text-foreground'>{inputs.customSpendReductionPct ?? 25}%</span>
              </div>
              <input
                type='range'
                min={0}
                max={100}
                value={inputs.customSpendReductionPct ?? 25}
                onChange={(e) =>
                  onChangeInputs({
                    ...inputs,
                    customSpendReductionPct: parseInt(e.target.value) || 0
                  })
                }
                className='w-full accent-primary h-1 bg-border rounded-lg'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
