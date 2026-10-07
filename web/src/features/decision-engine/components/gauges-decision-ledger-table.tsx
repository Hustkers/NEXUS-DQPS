'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { cn } from '@/lib/utils';
import type { GaugesLedgerItem } from '@/lib/gauges-engine';

interface GaugesDecisionLedgerTableProps {
  entries: GaugesLedgerItem[];
  className?: string;
}

export function GaugesDecisionLedgerTable({
  entries,
  className,
}: GaugesDecisionLedgerTableProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-5 shadow-xs text-card-foreground font-mono',
        className
      )}
    >
      <div className='flex items-center justify-between border-b border-border pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.check className='size-3.5 text-emerald-600 dark:text-emerald-400' />
          <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
            Autonomous Decision Ledger
          </h3>
        </div>
        <span className='text-xs text-muted-foreground'>
          {entries.length} audited decisions
        </span>
      </div>

      <div className='overflow-x-auto rounded-lg border border-border'>
        <table className='w-full text-left text-xs'>
          <thead>
            <tr className='border-b border-border bg-muted/60 text-[11px] text-muted-foreground uppercase tracking-wider'>
              <th className='py-2.5 px-3.5 font-semibold'>Time</th>
              <th className='py-2.5 px-3.5 font-semibold'>Product</th>
              <th className='py-2.5 px-3.5 font-semibold'>Issue</th>
              <th className='py-2.5 px-3.5 font-semibold'>Action Taken</th>
              <th className='py-2.5 px-3.5 font-semibold'>Outcome</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className='py-6 text-center text-muted-foreground text-xs'>
                  No decision ledger records logged yet.
                </td>
              </tr>
            ) : (
              entries.map((item) => (
                <tr
                  key={item.id}
                  className='bg-card hover:bg-muted/40 transition-colors'
                >
                  {/* Time */}
                  <td className='py-3 px-3.5 text-muted-foreground text-[11px] whitespace-nowrap font-mono'>
                    {item.timestamp.split(' ')[1] || item.timestamp}
                  </td>

                  {/* Product + Channel */}
                  <td className='py-3 px-3.5 font-sans text-xs whitespace-nowrap font-medium text-foreground'>
                    <div className='flex items-center gap-1.5'>
                      <PlatformLogo
                        platform={item.channel.toLowerCase()}
                        size={12}
                        className='shrink-0'
                      />
                      <span>{item.product}</span>
                      {item.isAuto && (
                        <span className='text-[9px] font-mono px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase font-bold'>
                          Auto
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Issue */}
                  <td className='py-3 px-3.5 text-amber-500 text-xs font-medium'>
                    {item.issue}
                  </td>

                  {/* Action Taken */}
                  <td className='py-3 px-3.5 text-muted-foreground text-xs max-w-sm'>
                    {item.actionTaken}
                  </td>

                  {/* Outcome */}
                  <td className='py-3 px-3.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs whitespace-nowrap'>
                    {item.outcome}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
