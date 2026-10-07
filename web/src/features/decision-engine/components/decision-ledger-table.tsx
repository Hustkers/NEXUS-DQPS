'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { PlatformLogo } from '@/components/icons/platform-logos';
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
    <div className={cn('rounded border border-border bg-card p-5 shadow-none text-card-foreground', className)}>
      <div className='flex items-center justify-between border-b border-border pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.check className='size-3.5 text-foreground' />
          <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
            Decision Ledger &amp; Counterfactual Calibration
          </h3>
        </div>
        <span className='text-xs font-mono text-muted-foreground'>
          {entries.length} audited decisions
        </span>
      </div>

      {/* Table */}
      <div className='overflow-x-auto rounded border border-border'>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-border bg-muted/60 text-[11px] text-muted-foreground uppercase tracking-wider'>
              <th className='py-2.5 px-3 font-semibold'>Timestamp</th>
              <th className='py-2.5 px-3 font-semibold'>Allocation Action</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Exp. Margin</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Realized</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Accuracy</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Confidence</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {entries.map((item) => {
              return (
                <tr key={item.id} className='bg-card hover:bg-muted/40 transition-colors'>
                  <td className='py-2.5 px-3 text-muted-foreground text-[11px] whitespace-nowrap font-medium'>
                    {item.timestamp.split(' ')[1] || item.timestamp}
                  </td>
                  <td className='py-2.5 px-3 text-foreground font-sans text-xs max-w-md truncate font-medium'>
                    <span className='inline-flex items-center gap-1.5'>
                      <PlatformLogo platform={item.decision} size={12} className='shrink-0 opacity-80' />
                      <span className='truncate'>{item.decision}</span>
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right text-muted-foreground whitespace-nowrap font-mono'>
                    ₹{item.expectedMargin.toLocaleString()}
                  </td>
                  <td className='py-2.5 px-3 text-right whitespace-nowrap font-mono'>
                    <span className='font-bold text-foreground'>
                      ₹{item.realizedMargin.toLocaleString()}
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right whitespace-nowrap font-mono'>
                    <span className='font-bold text-foreground'>
                      {item.accuracyPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right text-foreground font-bold whitespace-nowrap font-mono'>
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
