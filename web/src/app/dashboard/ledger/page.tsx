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
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#000000] text-white min-h-screen'>
      <div>
        <h1 className='text-xl font-mono font-bold text-white uppercase tracking-tight'>
          Closed-Loop Decision Ledger &amp; Reinforcement Learning Store
        </h1>
        <p className='text-xs font-mono text-[#8A8A8A] mt-1'>
          Every executed directive logged • Expected vs Realized Margin measured • Online model calibration
        </p>
      </div>

      <DecisionLedgerTable entries={entries} />
    </div>
  );
}
