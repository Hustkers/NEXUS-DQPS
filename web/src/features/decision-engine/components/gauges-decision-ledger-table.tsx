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
        'rounded-xl border border-[#27272a] bg-[#121215] p-5 shadow-sm text-foreground font-sans',
        className
      )}
    >
      <div className='flex items-center justify-between border-b border-[#27272a] pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.check className='size-3.5 text-emerald-400' />
          <h3 className='text-xs font-semibold text-zinc-100 uppercase tracking-wider font-sans'>
            Autonomous Decision Ledger
          </h3>
        </div>
        <span className='text-xs text-zinc-400 font-mono'>
          {entries.length} audited decisions
        </span>
      </div>

      <div className='overflow-x-auto rounded-lg border border-[#27272a]'>
        <table className='w-full text-left text-xs'>
          <thead>
            <tr className='border-b border-[#27272a] bg-zinc-900/50 text-[11px] text-zinc-400 uppercase tracking-wider font-sans'>
              <th className='py-2.5 px-3.5 font-medium'>Time</th>
              <th className='py-2.5 px-3.5 font-medium'>Product</th>
              <th className='py-2.5 px-3.5 font-medium'>Issue</th>
              <th className='py-2.5 px-3.5 font-medium'>Action Taken</th>
              <th className='py-2.5 px-3.5 font-medium'>Outcome</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-[#27272a]'>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className='py-6 text-center text-zinc-500 text-xs font-sans'>
                  No decision ledger records logged yet.
                </td>
              </tr>
            ) : (
              entries.map((item) => (
                <tr
                  key={item.id}
                  className='bg-[#121215] hover:bg-[#18181b] transition-colors'
                >
                  {/* Time */}
                  <td className='py-3 px-3.5 text-zinc-400 text-[11px] whitespace-nowrap font-mono tabular-nums'>
                    {item.timestamp.split(' ')[1] || item.timestamp}
                  </td>

                  {/* Product + Channel */}
                  <td className='py-3 px-3.5 font-sans text-xs whitespace-nowrap font-medium text-zinc-100'>
                    <div className='flex items-center gap-1.5'>
                      <PlatformLogo
                        platform={item.channel.toLowerCase()}
                        size={12}
                        className='shrink-0'
                      />
                      <span>{item.product}</span>
                    </div>
                  </td>

                  {/* Issue */}
                  <td className='py-3 px-3.5 text-amber-400/90 text-xs font-medium font-sans'>
                    {item.issue}
                  </td>

                  {/* Action Taken */}
                  <td className='py-3 px-3.5 text-zinc-300 text-xs max-w-sm font-sans'>
                    {item.actionTaken}
                  </td>

                  {/* Outcome */}
                  <td className='py-3 px-3.5 text-emerald-400 font-medium text-xs whitespace-nowrap font-mono tabular-nums'>
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
