'use client';

import React, { useState, useEffect } from 'react';
import { DecisionLedgerTable, type LedgerItem } from '@/features/decision-engine/components/decision-ledger-table';
import initialEngineState from '@/data/nexus-engine-state.json';

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerItem[]>(initialEngineState.ledger as unknown as LedgerItem[]);

  useEffect(() => {
    let isMounted = true;
    async function loadLedger() {
      try {
        const res = await fetch('/api/ledger');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.ledger) && isMounted) {
            setEntries(data.ledger);
          }
        }
      } catch {
        // Fallback to initialEngineState
      }
    }
    loadLedger();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen'>
      {/* Compact Terminal-Style Header */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3'>
        <div className='space-y-0.5'>
          <div className='flex items-center gap-2.5'>
            <h1 className='text-xl sm:text-2xl font-semibold text-foreground tracking-tight font-sans'>
              Decision Ledger
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
            {initialEngineState.ledger.length}
          </div>
          <div className='text-[10px] font-mono uppercase tracking-wider text-muted-foreground'>
            AUDITED DECISIONS
          </div>
        </div>
      </div>

      <DecisionLedgerTable entries={entries} />
    </div>
  );
}
