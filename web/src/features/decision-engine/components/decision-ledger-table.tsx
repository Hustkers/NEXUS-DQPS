'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { cn } from '@/lib/utils';
import type { GaugesLedgerItem } from '@/lib/gauges-engine';

export interface LedgerItem {
  id: string;
  timestamp: string;
  decision?: string;
  product?: string;
  channel?: string;
  issue?: string;
  actionTaken?: string;
  outcome?: string;
  expectedMargin?: number;
  realizedMargin?: number;
  variancePct?: number;
  accuracyPct?: number;
  confidence?: number;
  status?: string;
  feedback?: string;
  isAuto?: boolean;
}

interface DecisionLedgerTableProps {
  entries: (LedgerItem | GaugesLedgerItem)[];
  className?: string;
}

export function DecisionLedgerTable({ entries, className }: DecisionLedgerTableProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-5 shadow-none text-card-foreground font-mono', className)}>
      <div className='flex items-center justify-between border-b border-border pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.check className='size-3.5 text-emerald-400' />
          <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
            Decision Ledger &amp; Counterfactual Calibration
          </h3>
        </div>
        <span className='text-xs font-mono text-muted-foreground'>
          {entries.length} audited decisions
        </span>
      </div>

      {/* Table */}
      <div className='overflow-x-auto rounded-lg border border-border'>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-border bg-muted/60 text-[11px] text-muted-foreground uppercase tracking-wider'>
              <th className='py-2.5 px-3.5 font-semibold'>Timestamp</th>
              <th className='py-2.5 px-3.5 font-semibold'>Product / Target</th>
              <th className='py-2.5 px-3.5 font-semibold'>Issue / Context</th>
              <th className='py-2.5 px-3.5 font-semibold'>Allocation Action</th>
              <th className='py-2.5 px-3.5 text-right font-semibold'>Outcome</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className='py-6 text-center text-muted-foreground text-xs'>
                  No audited decisions logged yet.
                </td>
              </tr>
            ) : (
              entries.map((item: any) => {
                const isAuto = item.isAuto || (item.actionTaken && item.actionTaken.includes('[Auto]'));
                const channel = item.channel || (item.decision && item.decision.includes('meta') ? 'meta' : item.decision && item.decision.includes('google') ? 'google' : 'amazon');
                const displayName = item.product || item.decision?.split('->')[0] || item.decision || 'Catalog Campaign';
                const actionText = item.actionTaken || item.decision || 'Budget reallocated';
                const issueText = item.issue || (item.expectedMargin ? `Exp. Margin: ₹${item.expectedMargin.toLocaleString()}` : 'Algorithmic Optimization');
                const outcomeText = item.outcome || (item.realizedMargin ? `₹${item.realizedMargin.toLocaleString()} (${(item.confidence ? item.confidence * 100 : 95).toFixed(0)}% conf)` : 'Optimized');

                return (
                  <tr key={item.id} className='bg-card hover:bg-muted/40 transition-colors'>
                    <td className='py-3 px-3.5 text-muted-foreground text-[11px] whitespace-nowrap font-medium'>
                      {item.timestamp.split(' ')[1] || item.timestamp}
                    </td>
                    <td className='py-3 px-3.5 text-foreground font-sans text-xs max-w-xs truncate font-medium'>
                      <span className='inline-flex items-center gap-1.5'>
                        <PlatformLogo platform={channel.toLowerCase()} size={12} className='shrink-0' />
                        <span className='truncate'>{displayName}</span>
                        {isAuto && (
                          <span className='text-[9px] font-mono px-1 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 uppercase font-bold'>
                            Auto
                          </span>
                        )}
                      </span>
                    </td>
                    <td className='py-3 px-3.5 text-amber-400/90 text-xs font-mono max-w-xs truncate'>
                      {issueText}
                    </td>
                    <td className='py-3 px-3.5 text-muted-foreground text-xs max-w-sm truncate'>
                      {actionText}
                    </td>
                    <td className='py-3 px-3.5 text-right whitespace-nowrap font-mono text-emerald-400 font-semibold'>
                      {outcomeText}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
