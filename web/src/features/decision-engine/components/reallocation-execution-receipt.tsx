'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ReallocationExecutionDetails } from '../types/reallocation-execution';

interface ReallocationExecutionReceiptProps {
  details: ReallocationExecutionDetails;
  className?: string;
  onClose?: () => void;
}

export function ReallocationExecutionReceipt({
  details,
  className,
  onClose
}: ReallocationExecutionReceiptProps) {
  const { source, destination, capitalMoved, expectedDailyLift, predictedRoas, ledgerRecord } = details;

  return (
    <div className={cn('rounded-xl border border-border bg-card p-5 font-mono shadow-md text-foreground max-w-lg mx-auto', className)}>
      {/* Receipt Top Banner */}
      <div className='flex items-center justify-between border-b border-dashed border-border/80 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <div className='size-2 rounded-full bg-emerald-500 animate-pulse' />
          <span className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold'>
            NEXUS-DQPS AUDIT RECEIPT
          </span>
        </div>
        <span className='text-[10px] text-muted-foreground font-semibold'>
          {ledgerRecord.id}
        </span>
      </div>

      <div className='text-center space-y-1 mb-4 pb-3 border-b border-border/60'>
        <div className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider'>
          <Icons.check className='size-3.5' />
          Capital Reallocation Executed
        </div>
        <p className='text-[11px] text-muted-foreground pt-1'>
          Dispatched to Production Ad Delivery APIs &amp; Ledger
        </p>
      </div>

      {/* Auditable Data Grid */}
      <div className='space-y-2.5 text-xs'>
        <div className='flex justify-between items-center py-1 border-b border-border/40'>
          <span className='text-muted-foreground'>Source Campaign:</span>
          <span className='font-bold text-foreground text-right truncate max-w-[240px]'>
            {source.productName} ({source.campaign})
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-border/40'>
          <span className='text-muted-foreground'>Destination Campaign:</span>
          <span className='font-bold text-emerald-600 dark:text-emerald-400 text-right truncate max-w-[240px]'>
            {destination.productName} ({destination.campaign})
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-border/40'>
          <span className='text-muted-foreground'>Capital Moved:</span>
          <span className='font-bold text-foreground'>
            ₹{Math.round(capitalMoved).toLocaleString('en-IN')}/day
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-border/40'>
          <span className='text-muted-foreground'>Previous Allocation:</span>
          <span className='font-medium text-foreground'>
            ₹{Math.round(destination.currentSpend).toLocaleString('en-IN')}/day
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-border/40'>
          <span className='text-muted-foreground'>New Allocation:</span>
          <span className='font-bold text-emerald-600 dark:text-emerald-400'>
            ₹{Math.round(destination.newSpend).toLocaleString('en-IN')}/day
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-border/40'>
          <span className='text-muted-foreground'>Expected Daily Lift:</span>
          <span className='font-bold text-emerald-600 dark:text-emerald-400'>
            +₹{Math.round(expectedDailyLift).toLocaleString('en-IN')}/day
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-border/40'>
          <span className='text-muted-foreground'>Operating Target ROAS:</span>
          <span className='font-bold text-foreground'>
            {predictedRoas.toFixed(2)}x
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-border/40'>
          <span className='text-muted-foreground'>Timestamp:</span>
          <span className='text-muted-foreground text-[11px]'>
            {ledgerRecord.timestamp}
          </span>
        </div>

        <div className='flex justify-between items-center py-1'>
          <span className='text-muted-foreground'>Audit Status:</span>
          <span className='font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1'>
            <Icons.check className='size-3' />
            EXECUTED ✓
          </span>
        </div>
      </div>

      {/* Ledger Seal */}
      <div className='mt-4 pt-3 border-t border-dashed border-border/80 flex items-center justify-between text-[11px] bg-slate-50/70 dark:bg-zinc-900/50 p-2.5 rounded-lg'>
        <div className='flex items-center gap-1.5 text-muted-foreground'>
          <Icons.shieldCheck className='size-3.5 text-emerald-500' />
          <span>Decision recorded in ledger</span>
        </div>
        <span className='text-[10px] text-foreground font-semibold px-1.5 py-0.5 rounded bg-muted'>
          {ledgerRecord.id}
        </span>
      </div>

      {onClose && (
        <div className='mt-4 pt-2 flex justify-end'>
          <button
            onClick={onClose}
            className='px-3 py-1.5 text-xs font-mono font-bold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border shadow-2xs transition-all'
          >
            Close Receipt
          </button>
        </div>
      )}
    </div>
  );
}
