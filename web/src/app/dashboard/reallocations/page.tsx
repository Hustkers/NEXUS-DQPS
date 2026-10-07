'use client';

import React, { useState } from 'react';
import { ReallocationFeed } from '@/features/decision-engine/components/reallocation-feed';
import { RLVisualAnalytics } from '@/features/decision-engine/components/rl-visual-analytics';
import { computeRLAdAllocation } from '@/lib/rl-ad-optimizer';
import initialEngineState from '@/data/nexus-engine-state.json';
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
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#000000] text-white min-h-screen'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[#1A1A1A] pb-4'>
        <div>
          <h1 className='text-xl font-mono font-bold text-white uppercase tracking-tight flex items-center gap-2'>
            <IconCpu className='size-5 text-white' />
            Autonomous Budget Reallocation Feed &amp; RL Policy
          </h1>
          <p className='text-xs font-mono text-[#8A8A8A] mt-1'>
            Reinforcement Learning Contextual Bandit • SLSQP Convex Solver • Stockout Suppression Kill-Switches
          </p>
        </div>

        {/* View Switcher */}
        <div className='flex items-center bg-[#1A1A1A] rounded border border-[#1A1A1A] p-1 text-xs font-mono'>
          <button
            onClick={() => setActiveView('both')}
            className={cn(
              'px-3 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5',
              activeView === 'both' ? 'bg-white text-black font-bold' : 'text-[#8A8A8A] hover:text-white'
            )}
          >
            <IconSparkles className='size-3.5 text-current' />
            Unified View
          </button>
          <button
            onClick={() => setActiveView('rl_analytics')}
            className={cn(
              'px-3 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5',
              activeView === 'rl_analytics' ? 'bg-white text-black font-bold' : 'text-[#8A8A8A] hover:text-white'
            )}
          >
            <IconCpu className='size-3.5' />
            RL Policy Analytics
          </button>
          <button
            onClick={() => setActiveView('feed')}
            className={cn(
              'px-3 py-1.5 rounded transition-all font-semibold',
              activeView === 'feed' ? 'bg-white text-black font-bold' : 'text-[#8A8A8A] hover:text-white'
            )}
          >
            Reallocation Directives
          </button>
        </div>
      </div>

      {/* RL Analytics Suite */}
      {(activeView === 'both' || activeView === 'rl_analytics') && (
        <div className='rounded border border-[#1A1A1A] bg-[#1A1A1A] p-4 sm:p-5 shadow-none'>
          <RLVisualAnalytics data={rlData} />
        </div>
      )}

      {/* Reallocation Feed Directives */}
      {(activeView === 'both' || activeView === 'feed') && (
        <ReallocationFeed initialItems={initialEngineState.reallocations} />
      )}
    </div>
  );
}
