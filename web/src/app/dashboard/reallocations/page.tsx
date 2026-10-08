'use client';

import React, { useState } from 'react';
import { ReallocationFeed } from '@/features/decision-engine/components/reallocation-feed';
import { RLVisualAnalytics } from '@/features/decision-engine/components/rl-visual-analytics';
import { computeRLAdAllocation } from '@/lib/rl-ad-optimizer';
import { IconCpu, IconSparkles } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export default function ReallocationsPage() {
  const [activeView, setActiveView] = useState<'feed' | 'rl_analytics' | 'both'>('both');

  // Compute portfolio-level RL ad allocation
  const rlData = React.useMemo(() => {
    return computeRLAdAllocation({
      productName: 'Cross-Portfolio Catalog',
      sku: 'PORTFOLIO-AGGREGATE',
      price: 135,
      spend: 18450,
      roas: 2.95,
      grossMarginPct: 62,
      inventory: 480
    });
  }, []);

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#09090b] text-foreground min-h-screen font-sans'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-4'>
        <div>
          <h1 className='text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2'>
            <IconCpu className='size-5 text-zinc-300' />
            Budget Reallocations
          </h1>
          <p className='text-xs text-zinc-400 mt-1'>
            Autonomous Scipy convex optimizer budget shift proposals and execution ledger.
          </p>
        </div>

        {/* View Switcher */}
        <div className='flex items-center bg-[#121215] rounded-lg border border-[#27272a] p-1 text-xs'>
          <button
            onClick={() => setActiveView('both')}
            className={cn(
              'px-3 py-1.5 rounded transition-all font-medium flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400',
              activeView === 'both' ? 'bg-zinc-100 text-zinc-900 shadow-xs' : 'text-zinc-400 hover:text-zinc-100'
            )}
          >
            <IconSparkles className='size-3.5 text-zinc-700' />
            Unified View
          </button>
          <button
            onClick={() => setActiveView('rl_analytics')}
            className={cn(
              'px-3 py-1.5 rounded transition-all font-medium flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400',
              activeView === 'rl_analytics' ? 'bg-zinc-100 text-zinc-900 shadow-xs' : 'text-zinc-400 hover:text-zinc-100'
            )}
          >
            <IconCpu className='size-3.5' />
            RL Policy Analytics
          </button>
          <button
            onClick={() => setActiveView('feed')}
            className={cn(
              'px-3 py-1.5 rounded transition-all font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400',
              activeView === 'feed' ? 'bg-zinc-100 text-zinc-900 shadow-xs' : 'text-zinc-400 hover:text-zinc-100'
            )}
          >
            Reallocation Directives
          </button>
        </div>
      </div>

      {/* RL Analytics Suite */}
      {(activeView === 'both' || activeView === 'rl_analytics') && (
        <div className='rounded-xl border border-[#27272a] bg-[#121215] p-4 sm:p-5 shadow-sm'>
          <RLVisualAnalytics data={rlData} />
        </div>
      )}

      {/* Reallocation Feed Directives */}
      {(activeView === 'both' || activeView === 'feed') && (
        <ReallocationFeed />
      )}
    </div>
  );
}
