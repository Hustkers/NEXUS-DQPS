'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { AnomalyCard } from '@/features/decision-engine/components/anomaly-card';
import initialEngineState from '@/data/nexus-engine-state.json';
import { toast } from 'sonner';

export default function AnomaliesPage() {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'WARNING'>('ALL');
  const anomalies = initialEngineState.anomalies;

  const filtered = anomalies.filter((a: any) =>
    filterSeverity === 'ALL' ? true : a.severity === filterSeverity
  );

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#07090e] text-zinc-100 min-h-screen'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.warning className='size-5 text-rose-400' />
            <h1 className='text-xl font-mono font-bold text-zinc-100 uppercase tracking-tight'>
              Diagnostic Root-Cause Analysis (RCA) &amp; Anomalies
            </h1>
          </div>
          <p className='text-xs font-mono text-zinc-500 mt-1'>
            modery68 4-Week Rolling Baselines • IsolationForest &amp; Z-Score Attribution (|Z| &gt; 2.2)
          </p>
        </div>

        <div className='flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-mono'>
          {(['ALL', 'CRITICAL', 'HIGH', 'WARNING'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                filterSeverity === sev
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {filtered.map((anom: any) => (
          <AnomalyCard
            key={anom.id}
            anomaly={anom}
            onMitigate={(a) => {
              toast.success(`Dispatched mitigation for ${a.campaign}`, {
                description: 'Sent reallocation order to autonomous optimizer.'
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}
