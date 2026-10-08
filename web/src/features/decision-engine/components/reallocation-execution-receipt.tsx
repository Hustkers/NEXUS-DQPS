'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { IconFileText } from '@tabler/icons-react';
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
    <div className={cn('rounded-xl border border-border/80 bg-background/95 p-6 font-mono text-foreground max-w-lg mx-auto shadow-md', className)}>
      {/* Receipt Top Banner */}
      <div className='flex items-center justify-between border-b border-dashed border-border/80 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <span className='size-2 rounded-full bg-emerald-500' />
          <span className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold'>
            NEXUS REALLOCATION RECEIPT
          </span>
        </div>
        <span className='text-[11px] font-mono text-muted-foreground/80 font-semibold'>
          {ledgerRecord.id}
        </span>
      </div>

      <div className='text-center space-y-1 mb-5 pb-3 border-b border-border/60'>
        <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold uppercase tracking-wider font-mono'>
          <Icons.check className='size-3.5' />
          REALLOCATION COMPLETE
        </div>
        <p className='text-xs text-muted-foreground pt-1.5 leading-relaxed'>
          Budget successfully transferred to higher-return campaign and recorded in closed-loop ledger.
        </p>
      </div>

      {/* Auditable Data Grid */}
      <div className='space-y-3 text-xs font-mono'>
        <div className='flex justify-between items-start py-1 border-b border-border/40 gap-4'>
          <span className='text-muted-foreground shrink-0'>Source:</span>
          <span className='font-bold text-foreground text-right truncate max-w-[260px]'>
            {source.productName} ({source.campaign})
          </span>
        </div>

        <div className='flex justify-between items-start py-1 border-b border-border/40 gap-4'>
          <span className='text-muted-foreground shrink-0'>Destination:</span>
          <span className='font-bold text-emerald-500 dark:text-emerald-400 text-right truncate max-w-[260px]'>
            {destination.productName} ({destination.campaign})
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-border/40'>
          <span className='text-muted-foreground'>Budget moved:</span>
          <span className='font-bold text-foreground'>
            ₹{Math.round(capitalMoved).toLocaleString('en-IN')}/day
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-border/40'>
          <span className='text-muted-foreground'>Expected ROAS:</span>
          <span className='font-bold text-emerald-500'>
            {predictedRoas.toFixed(2)}x
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-border/40'>
          <span className='text-muted-foreground'>Expected daily margin:</span>
          <span className='font-bold text-foreground'>
            +₹{Math.round(expectedDailyLift).toLocaleString('en-IN')}/day
          </span>
        </div>

        <div className='flex justify-between items-center py-1 border-b border-border/40'>
          <span className='text-muted-foreground'>Timestamp:</span>
          <span className='text-muted-foreground text-[11px]'>
            {ledgerRecord.timestamp}
          </span>
        </div>

        <div className='flex justify-between items-center py-1'>
          <span className='text-muted-foreground'>Status:</span>
          <span className='font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 px-2 py-0.5 rounded text-[11px] flex items-center gap-1'>
            <Icons.check className='size-3' />
            EXECUTED
          </span>
        </div>
      </div>

      {/* Ledger Seal */}
      <div className='mt-5 pt-3 border-t border-dashed border-border/80 flex items-center justify-between text-[11px] bg-muted/20 p-2.5 rounded-lg border border-border/60'>
        <div className='flex items-center gap-1.5 text-muted-foreground'>
          <Icons.shieldCheck className='size-3.5 text-foreground' />
          <span>Closed-loop verifiable audit trail</span>
        </div>
        <span className='text-[10px] text-foreground font-bold px-1.5 py-0.5 rounded bg-muted border border-border'>
          {ledgerRecord.id}
        </span>
      </div>

      <div className='mt-5 pt-2 flex items-center justify-end gap-2'>
        {onViewLedger && (
          <button
            onClick={onViewLedger}
            className='px-3.5 py-1.5 text-xs font-mono font-bold bg-muted hover:bg-muted/80 text-foreground rounded-lg border border-border transition-all flex items-center gap-1.5'
          >
            <IconFileText className='size-3.5' />
            <span>View Decision</span>
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className='px-3.5 py-1.5 text-xs font-mono font-bold bg-foreground text-background hover:bg-foreground/90 rounded-lg border-none transition-all'
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}

