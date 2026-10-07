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
    <div className={cn('rounded border border-[#8A8A8A] bg-[#1A1A1A] p-5 shadow-none text-[#FFFFFF]', className)}>
      <div className='flex items-center justify-between border-b border-[#8A8A8A]/40 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.check className='size-3.5 text-[#FFFFFF]' />
          <h3 className='font-mono text-xs font-bold text-[#FFFFFF] uppercase tracking-wider'>
            Decision Ledger &amp; Counterfactual Calibration
          </h3>
        </div>
        <span className='text-xs font-mono text-[#8A8A8A]'>
          {entries.length} audited decisions
        </span>
      </div>

      {/* Table */}
      <div className='overflow-x-auto rounded border border-[#8A8A8A]/40'>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-[#8A8A8A] bg-[#000000] text-[11px] text-[#8A8A8A] uppercase tracking-wider'>
              <th className='py-2.5 px-3 font-semibold'>Timestamp</th>
              <th className='py-2.5 px-3 font-semibold'>Allocation Action</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Exp. Margin</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Realized</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Accuracy</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Confidence</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-[#000000]'>
            {entries.map((item) => {
              return (
                <tr key={item.id} className='bg-[#1A1A1A] hover:bg-[#000000] hover:outline hover:outline-1 hover:outline-[#8A8A8A] transition-colors'>
                  <td className='py-2.5 px-3 text-[#8A8A8A] text-[11px] whitespace-nowrap font-medium'>
                    {item.timestamp.split(' ')[1] || item.timestamp}
                  </td>
                  <td className='py-2.5 px-3 text-[#FFFFFF] font-sans text-xs max-w-md truncate font-medium'>
                    <span className='inline-flex items-center gap-1.5'>
                      <PlatformLogo platform={item.decision} size={12} className='shrink-0 opacity-80' />
                      <span className='truncate'>{item.decision}</span>
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right text-[#8A8A8A] whitespace-nowrap font-mono'>
                    ₹{item.expectedMargin.toLocaleString()}
                  </td>
                  <td className='py-2.5 px-3 text-right whitespace-nowrap font-mono'>
                    <span className='font-bold text-[#FFFFFF]'>
                      ₹{item.realizedMargin.toLocaleString()}
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right whitespace-nowrap font-mono'>
                    <span className='font-bold text-[#FFFFFF]'>
                      {item.accuracyPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right text-[#FFFFFF] font-bold whitespace-nowrap font-mono'>
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
