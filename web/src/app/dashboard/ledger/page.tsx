'use client';

import React from 'react';
import { DecisionLedgerTable } from '@/features/decision-engine/components/decision-ledger-table';
import initialEngineState from '@/data/nexus-engine-state.json';

export default function LedgerPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen'>
      <div>
        <h1 className='text-xl font-mono font-bold text-foreground uppercase tracking-tight'>
          Closed-Loop Decision Ledger &amp; Reinforcement Learning Store
        </h1>
        <p className='text-xs font-mono text-muted-foreground mt-1'>
          Every executed directive logged • Expected vs Realized Margin measured • Online model calibration
        </p>
      </div>

      <DecisionLedgerTable entries={initialEngineState.ledger} />
    </div>
  );
}
