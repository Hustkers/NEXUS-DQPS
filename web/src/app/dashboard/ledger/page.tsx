'use client';

import React from 'react';
import { DecisionLedgerTable } from '@/features/decision-engine/components/decision-ledger-table';
import { useDecisionEngine } from '@/context/decision-engine-store';

export default function LedgerPage() {
  const { ledger } = useDecisionEngine();

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen font-mono'>
      {/* Compact Terminal-Style Header */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3'>
        <div className='space-y-0.5'>
          <div className='flex items-center gap-2.5'>
            <h1 className='text-lg md:text-xl font-mono font-bold text-foreground uppercase tracking-tight'>
              DECISION LEDGER
            </h1>
            <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
              <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse' />
              ✓ AUDITED
            </span>
          </div>
          <p className='text-[11px] font-mono text-muted-foreground'>
            Closed-loop execution • Expected vs realized • Model calibration
          </p>
        </div>

        <div className='text-right'>
          <div className='text-lg font-mono font-bold text-foreground leading-tight'>
            {ledger.length}
          </div>
          <div className='text-[10px] font-mono uppercase tracking-wider text-muted-foreground'>
            AUDITED DECISIONS
          </div>
        </div>
      </div>

      <DecisionLedgerTable entries={ledger} />
    </div>
  );
}
