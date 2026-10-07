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
    <div className={cn('rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-5 shadow-none', className)}>
      <div className='flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.check className='size-3.5 text-zinc-400' />
          <h3 className='font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider'>
            Decision Ledger &amp; Counterfactual Calibration
          </h3>
        </div>
        <span className='text-xs font-mono text-zinc-500'>
          {entries.length} audited decisions
        </span>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-zinc-800/60 text-[10px] text-zinc-500 uppercase tracking-wider'>
              <th className='py-2 px-3 font-medium'>Timestamp</th>
              <th className='py-2 px-3 font-medium'>Allocation Action</th>
              <th className='py-2 px-3 text-right font-medium'>Exp. Margin</th>
              <th className='py-2 px-3 text-right font-medium'>Realized</th>
              <th className='py-2 px-3 text-right font-medium'>Accuracy</th>
              <th className='py-2 px-3 text-right font-medium'>Confidence</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-zinc-900/80'>
            {entries.map((item) => {
              const isPositiveLift = item.realizedMargin >= item.expectedMargin;

              return (
                <tr key={item.id} className='hover:bg-zinc-900/30 transition-colors'>
                  <td className='py-2.5 px-3 text-zinc-500 text-[11px] whitespace-nowrap'>
                    {item.timestamp.split(' ')[1] || item.timestamp}
                  </td>
                  <td className='py-2.5 px-3 text-zinc-300 font-sans text-xs max-w-md truncate'>
                    {item.decision}
                  </td>
                  <td className='py-2.5 px-3 text-right text-zinc-400 whitespace-nowrap'>
                    ${item.expectedMargin.toLocaleString()}
                  </td>
                  <td className='py-2.5 px-3 text-right whitespace-nowrap'>
                    <span className={cn('font-semibold', isPositiveLift ? 'text-emerald-400' : 'text-amber-400')}>
                      ${item.realizedMargin.toLocaleString()}
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right whitespace-nowrap'>
                    <span className={cn('font-medium', item.accuracyPct >= 90 ? 'text-emerald-400' : 'text-amber-400')}>
                      {item.accuracyPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right text-zinc-300 font-medium whitespace-nowrap'>
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
