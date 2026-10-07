'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface LedgerItem {
  id: string;
  timestamp: string;
  decision: string;
  expectedMargin: number;
  realizedMargin: number;
  variancePct: number;
  accuracyPct: number;
  confidence: number;
  status: string;
  feedback: string;
}

interface DecisionLedgerTableProps {
  entries: LedgerItem[];
  className?: string;
}

export function DecisionLedgerTable({ entries, className }: DecisionLedgerTableProps) {
  return (
    <div className={cn('rounded-xl border border-border/80 bg-card p-5 shadow-xs', className)}>
      <div className='flex items-center justify-between border-b border-border/80 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.check className='size-3.5 text-muted-foreground' />
          <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
            Decision Ledger &amp; Counterfactual Calibration
          </h3>
        </div>
        <span className='text-xs font-mono text-muted-foreground'>
          {entries.length} audited decisions
        </span>
      </div>

      {/* Table */}
      <div className='overflow-x-auto rounded-lg border border-border/60'>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-border/80 bg-slate-50/70 dark:bg-zinc-900/40 text-[10px] text-muted-foreground uppercase tracking-wider'>
              <th className='py-2.5 px-3 font-semibold'>Timestamp</th>
              <th className='py-2.5 px-3 font-semibold'>Allocation Action</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Exp. Margin</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Realized</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Accuracy</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Confidence</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/60'>
            {entries.map((item) => {
              const isPositiveLift = item.realizedMargin >= item.expectedMargin;

              return (
                <tr key={item.id} className='hover:bg-slate-50/80 dark:hover:bg-zinc-900/30 transition-colors'>
                  <td className='py-2.5 px-3 text-muted-foreground text-[11px] whitespace-nowrap font-medium'>
                    {item.timestamp.split(' ')[1] || item.timestamp}
                  </td>
                  <td className='py-2.5 px-3 text-foreground font-sans text-xs max-w-md truncate font-medium'>
                    {item.decision}
                  </td>
                  <td className='py-2.5 px-3 text-right text-muted-foreground whitespace-nowrap'>
                    ${item.expectedMargin.toLocaleString()}
                  </td>
                  <td className='py-2.5 px-3 text-right whitespace-nowrap'>
                    <span className={cn('font-bold', isPositiveLift ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                      ${item.realizedMargin.toLocaleString()}
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right whitespace-nowrap'>
                    <span className={cn('font-bold', item.accuracyPct >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                      {item.accuracyPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right text-foreground font-bold whitespace-nowrap'>
                    {(item.confidence * 100).toFixed(0)}%
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
