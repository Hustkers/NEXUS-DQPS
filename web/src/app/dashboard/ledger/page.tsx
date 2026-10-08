'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DecisionLedgerTable, type LedgerItem } from '@/features/decision-engine/components/decision-ledger-table';
import { useDecisionEngine } from '@/context/decision-engine-store';
import initialEngineState from '@/data/nexus-engine-state.json';

export default function LedgerPage() {
  const { ledger: storeLedger } = useDecisionEngine();
  const [apiLedger, setApiLedger] = useState<LedgerItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadLedger() {
      try {
        const res = await fetch('/api/ledger');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.ledger) && isMounted) {
            setApiLedger(data.ledger);
          }
        }
      } catch {}
    }
    loadLedger();
    return () => {
      isMounted = false;
    };
  }, []);

  // Merge store decisions (real-time from all surfaces) with API and seed ledger entries
  const combinedEntries = useMemo(() => {
    const map = new Map<string, any>();

    // 1. Real-time store decisions from all surfaces (highest priority)
    for (const item of storeLedger) {
      map.set(item.id, item);
    }

    // 2. API ledger entries
    for (const item of apiLedger) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }

    // 3. Fallback initial seed entries
    const seed = (initialEngineState.ledger || []) as unknown as LedgerItem[];
    for (const item of seed) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }

    // Sort by timestamp descending
    return Array.from(map.values()).sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return timeB - timeA;
    });
  }, [storeLedger, apiLedger]);

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 md:p-6 bg-[#09090b] text-zinc-100 min-h-screen'>
      {/* Compact Terminal-Style Header */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3'>
        <div className='space-y-0.5'>
          <div className='flex items-center gap-2.5'>
            <span className='size-2 rounded-full bg-emerald-400 animate-pulse' />
            <h1 className='text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight font-sans'>
              Decision Ledger
            </h1>
            <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-900 text-zinc-300 border border-zinc-800'>
              ALL SURFACES UNIFIED
            </span>
          </div>
          <p className='text-[11px] font-sans text-zinc-400'>
            Unified history of all decisions across Gauges, Reallocations, RL Policy, Copilot, &amp; Autonomous Engine
          </p>
        </div>

        <div className='text-right'>
          <div className='text-lg font-mono tabular-nums font-semibold text-zinc-100 leading-tight'>
            {combinedEntries.length}
          </div>
          <div className='text-[10px] font-mono uppercase tracking-wider text-zinc-500'>
            AUDITED DECISIONS
          </div>
        </div>
      </div>

      <DecisionLedgerTable entries={combinedEntries} />
    </div>
  );
}
