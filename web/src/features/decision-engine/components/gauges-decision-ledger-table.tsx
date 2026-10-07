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
        'rounded-xl border border-[#222222] bg-[#0E0E0E] p-5 shadow-sm text-white font-mono',
        className
      )}
    >
      <div className='flex items-center justify-between border-b border-[#1A1A1A] pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.check className='size-3.5 text-emerald-400' />
          <h3 className='text-xs font-bold text-white uppercase tracking-wider'>
            Autonomous Decision Ledger
          </h3>
        </div>
        <span className='text-xs text-[#8A8A8A]'>
          {entries.length} audited decisions
        </span>
      </div>

      <div className='overflow-x-auto rounded-lg border border-[#1F1F1F]'>
        <table className='w-full text-left text-xs'>
          <thead>
            <tr className='border-b border-[#1F1F1F] bg-[#141414] text-[11px] text-[#8A8A8A] uppercase tracking-wider'>
              <th className='py-2.5 px-3.5 font-semibold'>Time</th>
              <th className='py-2.5 px-3.5 font-semibold'>Product</th>
              <th className='py-2.5 px-3.5 font-semibold'>Issue</th>
              <th className='py-2.5 px-3.5 font-semibold'>Action Taken</th>
              <th className='py-2.5 px-3.5 font-semibold'>Outcome</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-[#1A1A1A]'>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className='py-6 text-center text-[#737373] text-xs'>
                  No decision ledger records logged yet.
                </td>
              </tr>
            ) : (
              entries.map((item) => (
                <tr
                  key={item.id}
                  className='bg-[#0A0A0A] hover:bg-[#121212] transition-colors'
                >
                  {/* Time */}
                  <td className='py-3 px-3.5 text-[#8A8A8A] text-[11px] whitespace-nowrap font-mono'>
                    {item.timestamp.split(' ')[1] || item.timestamp}
                  </td>

                  {/* Product + Channel */}
                  <td className='py-3 px-3.5 font-sans text-xs whitespace-nowrap font-medium text-white'>
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
                  <td className='py-3 px-3.5 text-amber-300/90 text-xs font-medium'>
                    {item.issue}
                  </td>

                  {/* Action Taken */}
                  <td className='py-3 px-3.5 text-[#D4D4D4] text-xs max-w-sm'>
                    {item.actionTaken}
                  </td>

                  {/* Outcome */}
                  <td className='py-3 px-3.5 text-emerald-400 font-semibold text-xs whitespace-nowrap'>
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
