'use client';

import React from 'react';
import { ReallocationFeed } from '@/features/decision-engine/components/reallocation-feed';
import initialEngineState from '@/data/nexus-engine-state.json';

export default function ReallocationsPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen'>
      <div className='border-b border-border/80 pb-4'>
        <h1 className='text-xl font-mono font-bold text-foreground uppercase tracking-tight'>
          Autonomous Budget Reallocation Feed
        </h1>
        <p className='text-xs font-mono text-muted-foreground mt-1'>
          scipy SLSQP Convex Solver • Response Saturation Curves • Stockout Kill-Switch Directives
        </p>
      </div>

      <ReallocationFeed initialItems={initialEngineState.reallocations} />
    </div>
  );
}
