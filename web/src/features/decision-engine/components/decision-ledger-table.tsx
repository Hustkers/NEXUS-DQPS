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
    <div className={cn('rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-sm', className)}>
      <div className='flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.check className='size-4 text-cyan-400' />
          <h3 className='font-mono text-sm font-bold text-zinc-100'>
            Decision Ledger &amp; Counterfactual Calibration
          </h3>
        </div>
        <span className='text-xs font-mono text-zinc-500'>
          {entries.length} audited
        </span>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-zinc-800 text-[11px] text-zinc-500 uppercase tracking-wider'>
              <th className='py-2 px-3'>Time</th>
              <th className='py-2 px-3'>Decision</th>
              <th className='py-2 px-3 text-right'>Exp. Margin</th>
              <th className='py-2 px-3 text-right'>Realized</th>
              <th className='py-2 px-3 text-right'>Accuracy</th>
              <th className='py-2 px-3 text-right'>Conf.</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-zinc-900'>
            {entries.map((item) => {
              const isPositiveLift = item.realizedMargin >= item.expectedMargin;

              return (
                <tr key={item.id} className='hover:bg-zinc-900/40 transition-colors'>
                  <td className='py-2.5 px-3 text-zinc-500 whitespace-nowrap'>{item.timestamp.split(' ')[1] || item.timestamp}</td>
                  <td className='py-2.5 px-3 font-sans text-zinc-200 font-medium max-w-md truncate'>
                    {item.decision}
                  </td>
                  <td className='py-2.5 px-3 text-right text-zinc-400 whitespace-nowrap'>
                    ${item.expectedMargin.toLocaleString()}
                  </td>
                  <td className='py-2.5 px-3 text-right whitespace-nowrap'>
                    <span className={cn('font-bold', isPositiveLift ? 'text-emerald-400' : 'text-amber-400')}>
                      ${item.realizedMargin.toLocaleString()}
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right whitespace-nowrap'>
                    <span className={cn('font-semibold', item.accuracyPct >= 90 ? 'text-emerald-400' : 'text-amber-400')}>
                      {item.accuracyPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right text-cyan-400 font-bold whitespace-nowrap'>
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
