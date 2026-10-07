'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { SimulationResult } from '../types/simulation-types';

interface SimulationResultsMatrixProps {
  result: SimulationResult;
  className?: string;
}

export function SimulationResultsMatrix({
  result,
  className
}: SimulationResultsMatrixProps) {
  const { baseline, shocked, mitigated, horizonDays, activeStrategyName } = result;

  const keyMetrics = [
    {
      label: 'Daily ad spend',
      value: `₹${mitigated.spend.toLocaleString('en-IN')}`,
      comparison: `₹${shocked.spend.toLocaleString('en-IN')} without action`,
      delta: mitigated.spend - shocked.spend,
      deltaText: `${mitigated.spend <= shocked.spend ? '-' : '+'}₹${Math.abs(mitigated.spend - shocked.spend).toLocaleString('en-IN')}/day`,
      isGood: mitigated.spend <= shocked.spend
    },
    {
      label: 'Daily orders',
      value: `${mitigated.conversions.toLocaleString('en-IN')}`,
      comparison: `${shocked.conversions.toLocaleString('en-IN')} without action`,
      delta: mitigated.conversions - shocked.conversions,
      deltaText: `${mitigated.conversions >= shocked.conversions ? '+' : ''}${(mitigated.conversions - shocked.conversions).toLocaleString('en-IN')}/day`,
      isGood: mitigated.conversions >= shocked.conversions
    },
    {
      label: 'Return on ad spend',
      value: `${mitigated.roas.toFixed(2)}x`,
      comparison: `${shocked.roas.toFixed(2)}x without action`,
      delta: mitigated.roas - shocked.roas,
      deltaText: `${mitigated.roas >= shocked.roas ? '+' : ''}${(mitigated.roas - shocked.roas).toFixed(2)}x`,
      isGood: mitigated.roas >= shocked.roas
    },
    {
      label: 'Net daily margin',
      value: `₹${mitigated.margin.toLocaleString('en-IN')}`,
      comparison: `₹${shocked.margin.toLocaleString('en-IN')} without action`,
      delta: mitigated.margin - shocked.margin,
      deltaText: `${mitigated.margin >= shocked.margin ? '+' : ''}₹${(mitigated.margin - shocked.margin).toLocaleString('en-IN')}/day`,
      isGood: mitigated.margin >= shocked.margin
    }
  ];

  const secondaryMetrics = [
    {
      label: 'Daily impressions',
      value: mitigated.impressions.toLocaleString('en-IN'),
      note: `Baseline was ${baseline.impressions.toLocaleString('en-IN')}`
    },
    {
      label: 'Daily clicks',
      value: mitigated.clicks.toLocaleString('en-IN'),
      note: `Baseline was ${baseline.clicks.toLocaleString('en-IN')}`
    },
    {
      label: 'Gross daily revenue',
      value: `₹${mitigated.revenue.toLocaleString('en-IN')}`,
      note: `₹${shocked.revenue.toLocaleString('en-IN')} without action`
    },
    {
      label: 'Baseline daily spend',
      value: `₹${baseline.spend.toLocaleString('en-IN')}`,
      note: 'Normal operating level'
    }
  ];

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 shadow-xs space-y-6', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div>
          <h4 className='text-sm font-semibold text-foreground'>
            Results breakdown
          </h4>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Projected metrics over {horizonDays} days with {activeStrategyName}.
          </p>
        </div>
        <span className='text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-foreground'>
          {activeStrategyName}
        </span>
      </div>

      {/* 4 Key Figures */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {keyMetrics.map((m) => (
          <div key={m.label} className='p-4 rounded-lg bg-muted/30 border border-border/60 space-y-1.5'>
            <div className='text-xs text-muted-foreground font-medium'>
              {m.label}
            </div>
            <div className='text-xl font-semibold text-foreground tracking-tight tabular-nums'>
              {m.value}
            </div>
            <div className='text-xs flex items-center justify-between pt-1 border-t border-border/40 gap-1'>
              <span className='text-muted-foreground truncate'>{m.comparison}</span>
              <span
                className={cn(
                  'font-medium tabular-nums shrink-0',
                  m.delta === 0
                    ? 'text-muted-foreground'
                    : m.isGood
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {m.deltaText}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Plain two-column list for remaining figures */}
      <div className='border-t border-border/60 pt-4'>
        <h5 className='text-xs font-medium text-muted-foreground mb-3'>
          Additional metrics
        </h5>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm'>
          {secondaryMetrics.map((item) => (
            <div
              key={item.label}
              className='flex items-center justify-between py-1.5 border-b border-border/40'
            >
              <div>
                <span className='text-foreground font-medium'>{item.label}</span>
                <span className='text-xs text-muted-foreground block'>{item.note}</span>
              </div>
              <span className='font-medium text-foreground tabular-nums'>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
