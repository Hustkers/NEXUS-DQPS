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
    <div className='flex flex-1 flex-col gap-4 p-4 md:p-6 bg-[#09090b] text-zinc-100 min-h-screen'>
      {/* Compact Terminal-Style Header */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3'>
        <div className='space-y-0.5'>
          <div className='flex items-center gap-2.5'>
            <span className='size-2 rounded-full bg-zinc-400' />
            <h1 className='text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight font-sans'>
              Decision Ledger
            </h1>
            <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-900 text-zinc-300 border border-zinc-800'>
              AUDITED
            </span>
          </div>
          <p className='text-[11px] font-sans text-zinc-400'>
            Closed-loop execution • Expected vs realized margin • Continuous model calibration
          </p>
        </div>

        <div className='text-right'>
          <div className='text-lg font-mono tabular-nums font-semibold text-zinc-100 leading-tight'>
            {entries.length}
          </div>
          <div className='text-[10px] font-mono uppercase tracking-wider text-zinc-500'>
            AUDITED DECISIONS
          </div>
        </div>
      </div>

      <DecisionLedgerTable entries={entries} />
    </div>
  );
}
