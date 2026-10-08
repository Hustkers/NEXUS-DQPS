'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ReallocationExecutionDetails } from '../types/reallocation-execution';

interface ReallocationExecutionReceiptProps {
  details: ReallocationExecutionDetails;
  className?: string;
  onClose?: () => void;
  onViewLedger?: () => void;
}

export function ReallocationExecutionReceipt({
  details,
  className,
  onClose,
  onViewLedger
}: ReallocationExecutionReceiptProps) {
  const { source, destination, capitalMoved, expectedDailyLift, predictedRoas, ledgerRecord } = details;

  return (
    <div className={cn('rounded border border-[#8A8A8A] bg-[#1A1A1A] p-5 font-mono shadow-none text-[#FFFFFF] max-w-lg mx-auto', className)}>
      {/* Receipt Top Banner */}
      <div className='flex items-center justify-between border-b border-dashed border-[#8A8A8A] pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-mono font-bold text-[#FFFFFF]'>■</span>
          <span className='text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold'>
            NEXUS-DQPS AUDIT RECEIPT
          </span>
        </div>
        <span className='text-[10px] text-[#8A8A8A] font-semibold'>
          {ledgerRecord.id}
        </span>
      </div>

      <div className='text-center space-y-1 mb-4 pb-3 border-b border-[#000000]'>
        <div className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#FFFFFF] text-[#000000] text-xs font-bold uppercase tracking-wider font-mono'>
          <Icons.check className='size-3.5 text-[#000000]' />
          Capital Reallocation Executed
        </div>
        <p className='text-[11px] text-[#8A8A8A] pt-1'>
          Dispatched to Production Ad Delivery APIs &amp; Recorded in Decision Ledger
        </p>
      </div>

      {/* Auditable Data Grid */}
      <div className='space-y-2.5 text-xs font-mono'>
        <div className='flex justify-between items-center py-1 border-b border-[#000000]'>
          <span className='text-[#8A8A8A]'>Source Campaign:</span>
          <span className='font-bold text-[#FFFFFF] text-right truncate max-w-[240px]'>
            {source.productName} ({source.campaign})
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-[#000000]'>
          <span className='text-[#8A8A8A]'>Destination Campaign:</span>
          <span className='font-bold text-[#FFFFFF] text-right truncate max-w-[240px]'>
            {destination.productName} ({destination.campaign})
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-[#000000]'>
          <span className='text-[#8A8A8A]'>Capital Moved:</span>
          <span className='font-bold text-[#FFFFFF]'>
            ${Math.round(capitalMoved).toLocaleString('en-US')}/day
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-[#000000]'>
          <span className='text-[#8A8A8A]'>Previous Allocation:</span>
          <span className='font-medium text-[#8A8A8A]'>
            ${Math.round(destination.currentSpend).toLocaleString('en-US')}/day
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-[#000000]'>
          <span className='text-[#8A8A8A]'>New Allocation:</span>
          <span className='font-bold text-[#FFFFFF]'>
            ${Math.round(destination.newSpend).toLocaleString('en-US')}/day
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-[#000000]'>
          <span className='text-[#8A8A8A]'>Expected Daily Lift:</span>
          <span className='font-bold text-[#FFFFFF]'>
            +${Math.round(expectedDailyLift).toLocaleString('en-US')}/day
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-[#000000]'>
          <span className='text-[#8A8A8A]'>Operating Target ROAS:</span>
          <span className='font-bold text-[#FFFFFF]'>
            {predictedRoas.toFixed(2)}x
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-[#000000]'>
          <span className='text-[#8A8A8A]'>Timestamp:</span>
          <span className='text-[#8A8A8A] text-[11px]'>
            {ledgerRecord.timestamp}
          </span>
        </div>

        <div className='flex justify-between items-center py-1'>
          <span className='text-[#8A8A8A]'>Audit Status:</span>
          <span className='font-bold bg-[#FFFFFF] text-[#000000] px-1.5 py-0.5 rounded text-[11px] flex items-center gap-1'>
            <Icons.check className='size-3 text-[#000000]' />
            EXECUTED
          </span>
        </div>
      </div>

      {/* Ledger Seal */}
      <div className='mt-4 pt-3 border-t border-dashed border-[#8A8A8A] flex items-center justify-between text-[11px] bg-[#000000] p-2.5 rounded border border-[#1A1A1A]'>
        <div className='flex items-center gap-1.5 text-[#8A8A8A]'>
          <Icons.shieldCheck className='size-3.5 text-[#FFFFFF]' />
          <span>Decision recorded in closed-loop ledger</span>
        </div>
        <span className='text-[10px] text-[#FFFFFF] font-bold px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#8A8A8A]'>
          {ledgerRecord.id}
        </span>
      </div>

      <div className='mt-4 pt-2 flex items-center justify-end gap-2'>
        {onViewLedger && (
          <button
            onClick={onViewLedger}
            className='px-3 py-1.5 text-xs font-mono font-bold bg-[#000000] hover:bg-[#1A1A1A] text-[#FFFFFF] rounded border border-[#8A8A8A] transition-all'
          >
            View in Decision Ledger →
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className='px-3 py-1.5 text-xs font-mono font-bold bg-[#FFFFFF] hover:bg-[#8A8A8A] text-[#000000] rounded border-none transition-all'
          >
            Close Receipt
          </button>
        )}
      </div>
    </div>
  );
}
