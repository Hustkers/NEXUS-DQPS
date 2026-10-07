'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { StrategyOption, ScenarioInputParams } from '../types/simulation-types';

interface StrategySelectorProps {
  strategies: StrategyOption[];
  selectedStrategyId: string;
  onSelectStrategy: (strategyId: string) => void;
  inputs: ScenarioInputParams;
  onChangeInputs: (newInputs: ScenarioInputParams) => void;
  className?: string;
  variant?: 'default' | 'minimal';
}

export function StrategySelector({
  strategies,
  selectedStrategyId,
  onSelectStrategy,
  inputs,
  onChangeInputs,
  className,
  variant: _variant = 'default',
}: StrategySelectorProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 shadow-xs space-y-4', className)}>
        <div className='border-b border-border/60 pb-3'>
          <h3 className='text-sm font-semibold text-foreground'>
            Choose a response
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Select an automated mitigation action or configure custom parameters.
          </p>
        </div>

        <div className='space-y-2.5' role='radiogroup' aria-label='Mitigation response options'>
          {strategies.map((strategy) => {
            const isSelected = selectedStrategyId === strategy.id;
            const isRecommended = strategy.isRecommended;

            return (
              <div
                key={strategy.id}
                className={cn(
                  'w-full text-left p-4 rounded-xl border transition-all text-sm flex flex-col gap-1.5',
                  isSelected
                    ? isRecommended
                      ? 'border-emerald-500/80 bg-emerald-500/10 dark:bg-emerald-950/25 shadow-xs ring-1 ring-emerald-500/40'
                      : 'border-foreground bg-accent/70 shadow-xs ring-1 ring-foreground/20'
                    : 'border-border bg-background hover:border-border/80 hover:bg-muted/40'
                )}
              >
                <button
                  type='button'
                  role='radio'
                  aria-checked={isSelected}
                  onClick={() => onSelectStrategy(strategy.id)}
                  className='w-full text-left flex flex-col gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md'
                >
                  <div className='flex items-center justify-between w-full gap-2'>
                    <div className='flex items-center gap-2.5'>
                      <span
                        className={cn(
                          'size-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all',
                          isSelected
                            ? isRecommended
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-foreground bg-foreground'
                            : 'border-muted-foreground/40'
                        )}
                      >
                        {isSelected && <span className='size-1.5 rounded-full bg-background' />}
                      </span>
                      <span className='font-medium text-foreground text-sm'>
                        {strategy.name}
                      </span>
                    </div>

                    {isRecommended && (
                      <span className='text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shrink-0'>
                        Recommended
                      </span>
                    )}
                  </div>

                  <p className='text-xs text-muted-foreground leading-relaxed pl-6'>
                    {strategy.description}
                  </p>
                </button>

                {/* Inline custom sliders only when selected */}
                {isSelected && strategy.id === 'custom-strategy' && (
                  <div className='mt-2.5 pt-3 border-t border-border/60 pl-6 space-y-3'>
                    <div className='space-y-1.5'>
                      <div className='flex justify-between text-xs text-muted-foreground'>
                        <span>Budget reallocation shift</span>
                        <span className='font-semibold text-foreground tabular-nums'>
                          {inputs.customBudgetShiftPct ?? 50}%
                        </span>
                      </div>
                      <input
                        type='range'
                        min={0}
                        max={100}
                        value={inputs.customBudgetShiftPct ?? 50}
                        onChange={(e) =>
                          onChangeInputs({
                            ...inputs,
                            customBudgetShiftPct: parseInt(e.target.value, 10) || 0
                          })
                        }
                        className='w-full accent-emerald-500 h-1.5 bg-muted rounded-lg cursor-pointer'
                      />
                    </div>

                    <div className='space-y-1.5'>
                      <div className='flex justify-between text-xs text-muted-foreground'>
                        <span>Direct spend reduction</span>
                        <span className='font-semibold text-foreground tabular-nums'>
                          {inputs.customSpendReductionPct ?? 25}%
                        </span>
                      </div>
                      <input
                        type='range'
                        min={0}
                        max={100}
                        value={inputs.customSpendReductionPct ?? 25}
                        onChange={(e) =>
                          onChangeInputs({
                            ...inputs,
                            customSpendReductionPct: parseInt(e.target.value, 10) || 0
                          })
                        }
                        className='w-full accent-emerald-500 h-1.5 bg-muted rounded-lg cursor-pointer'
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
}
