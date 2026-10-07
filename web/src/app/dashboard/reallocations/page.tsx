'use client';

import React from 'react';
import { ReallocationFeed } from '@/features/decision-engine/components/reallocation-feed';
import initialEngineState from '@/data/nexus-engine-state.json';

export default function ReallocationsPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#07090e] text-zinc-100 min-h-screen'>
      <div>
        <h1 className='text-xl font-mono font-bold text-zinc-100 uppercase tracking-tight'>
          Autonomous Budget Reallocation Feed
        </h1>
        <p className='text-xs font-mono text-zinc-500 mt-1'>
          scipy SLSQP Convex Solver • Response Saturation Curves • Stockout Kill-Switch Directives
        </p>
      </div>

      <ReallocationFeed initialItems={initialEngineState.reallocations} />
    </div>
  );
}
