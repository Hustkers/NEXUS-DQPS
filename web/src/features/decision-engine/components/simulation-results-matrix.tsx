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

  const rows = [
    {
      label: 'Daily Ad Spend',
      base: `₹${baseline.spend.toLocaleString('en-IN')}`,
      shock: `₹${shocked.spend.toLocaleString('en-IN')}`,
      mitigated: `₹${mitigated.spend.toLocaleString('en-IN')}`,
      delta: mitigated.spend - shocked.spend,
      deltaFormatted: `${mitigated.spend >= shocked.spend ? '+' : ''}₹${(mitigated.spend - shocked.spend).toLocaleString('en-IN')}`
    },
    {
      label: 'Daily Impressions',
      base: baseline.impressions.toLocaleString('en-IN'),
      shock: shocked.impressions.toLocaleString('en-IN'),
      mitigated: mitigated.impressions.toLocaleString('en-IN'),
      delta: mitigated.impressions - shocked.impressions,
      deltaFormatted: `${mitigated.impressions >= shocked.impressions ? '+' : ''}${(mitigated.impressions - shocked.impressions).toLocaleString('en-IN')}`
    },
    {
      label: 'Daily Clicks',
      base: baseline.clicks.toLocaleString('en-IN'),
      shock: shocked.clicks.toLocaleString('en-IN'),
      mitigated: mitigated.clicks.toLocaleString('en-IN'),
      delta: mitigated.clicks - shocked.clicks,
      deltaFormatted: `${mitigated.clicks >= shocked.clicks ? '+' : ''}${(mitigated.clicks - shocked.clicks).toLocaleString('en-IN')}`
    },
    {
      label: 'Daily Conversions (Orders)',
      base: baseline.conversions.toLocaleString('en-IN'),
      shock: shocked.conversions.toLocaleString('en-IN'),
      mitigated: mitigated.conversions.toLocaleString('en-IN'),
      delta: mitigated.conversions - shocked.conversions,
      deltaFormatted: `${mitigated.conversions >= shocked.conversions ? '+' : ''}${(mitigated.conversions - shocked.conversions).toLocaleString('en-IN')}`
    },
    {
      label: 'Gross Daily Revenue',
      base: `₹${baseline.revenue.toLocaleString('en-IN')}`,
      shock: `₹${shocked.revenue.toLocaleString('en-IN')}`,
      mitigated: `₹${mitigated.revenue.toLocaleString('en-IN')}`,
      delta: mitigated.revenue - shocked.revenue,
      deltaFormatted: `${mitigated.revenue >= shocked.revenue ? '+' : ''}₹${(mitigated.revenue - shocked.revenue).toLocaleString('en-IN')}`
    },
    {
      label: 'Channel ROAS',
      base: `${baseline.roas.toFixed(2)}x`,
      shock: `${shocked.roas.toFixed(2)}x`,
      mitigated: `${mitigated.roas.toFixed(2)}x`,
      delta: mitigated.roas - shocked.roas,
      deltaFormatted: `${mitigated.roas >= shocked.roas ? '+' : ''}${(mitigated.roas - shocked.roas).toFixed(2)}x`
    },
    {
      label: 'Net Contribution Margin',
      base: `₹${baseline.margin.toLocaleString('en-IN')}`,
      shock: `₹${shocked.margin.toLocaleString('en-IN')}`,
      mitigated: `₹${mitigated.margin.toLocaleString('en-IN')}`,
      delta: mitigated.margin - shocked.margin,
      deltaFormatted: `${mitigated.margin >= shocked.margin ? '+' : ''}₹${(mitigated.margin - shocked.margin).toLocaleString('en-IN')}`
    }
  ];

  return (
    <div className={cn('rounded-xl border border-border/80 bg-card p-4 sm:p-5 font-mono shadow-xs space-y-3', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            Simulation Results Matrix
          </h3>
          <p className='text-[10px] text-muted-foreground'>
            Deterministic multi-channel response ({horizonDays}-day evaluation horizon)
          </p>
        </div>
        <span className='text-[10px] px-2 py-0.5 rounded bg-muted font-bold text-foreground'>
          {activeStrategyName}
        </span>
      </div>

      <div className='overflow-x-auto rounded-lg border border-border/70'>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-border/80 bg-slate-100/70 dark:bg-zinc-900/60 text-[10px] text-muted-foreground uppercase tracking-wider'>
              <th className='py-2.5 px-3 font-semibold'>Performance Metric</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Baseline</th>
              <th className='py-2.5 px-3 text-right font-semibold text-rose-600 dark:text-rose-400'>
                Shocked (No Action)
              </th>
              <th className='py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400'>
                Mitigated
              </th>
              <th className='py-2.5 px-3 text-right font-semibold'>Strategy Delta</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/60'>
            {rows.map((row) => {
              const isPositive = row.delta > 0;
              const isNeutral = row.delta === 0;

              return (
                <tr key={row.label} className='hover:bg-muted/30 transition-colors'>
                  <td className='py-2 px-3 font-medium text-foreground text-[11px] whitespace-nowrap'>
                    {row.label}
                  </td>
                  <td className='py-2 px-3 text-right text-muted-foreground'>
                    {row.base}
                  </td>
                  <td className='py-2 px-3 text-right font-semibold text-rose-600 dark:text-rose-400'>
                    {row.shock}
                  </td>
                  <td className='py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400'>
                    {row.mitigated}
                  </td>
                  <td className='py-2 px-3 text-right font-bold text-[11px]'>
                    <span
                      className={cn(
                        isNeutral
                          ? 'text-muted-foreground'
                          : isPositive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      )}
                    >
                      {row.deltaFormatted}
                    </span>
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
