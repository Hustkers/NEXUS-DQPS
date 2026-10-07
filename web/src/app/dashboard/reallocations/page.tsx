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
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4'>
        <div>
          <h1 className='text-xl font-mono font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
            <IconCpu className='size-5 text-cyan-500 dark:text-cyan-400' />
            Autonomous Budget Reallocation Feed &amp; RL Policy
          </h1>
          <p className='text-xs font-mono text-muted-foreground mt-1'>
            Reinforcement Learning Contextual Bandit • SLSQP Convex Solver • Stockout Suppression Kill-Switches
          </p>
        </div>

        {/* View Switcher */}
        <div className='flex items-center bg-muted/60 dark:bg-zinc-900 rounded-lg border border-border p-1 text-xs font-mono'>
          <button
            onClick={() => setActiveView('both')}
            className={cn(
              'px-3 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5',
              activeView === 'both' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <IconSparkles className='size-3.5 text-cyan-500' />
            Unified View
          </button>
          <button
            onClick={() => setActiveView('rl_analytics')}
            className={cn(
              'px-3 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5',
              activeView === 'rl_analytics' ? 'bg-background text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <IconCpu className='size-3.5' />
            RL Policy Analytics
          </button>
          <button
            onClick={() => setActiveView('feed')}
            className={cn(
              'px-3 py-1.5 rounded transition-all font-semibold',
              activeView === 'feed' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Reallocation Directives
          </button>
        </div>
      </div>

      {/* RL Analytics Suite */}
      {(activeView === 'both' || activeView === 'rl_analytics') && (
        <div className='rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 sm:p-5 shadow-xl'>
          <RLVisualAnalytics data={rlData} />
        </div>
      )}

      {/* Reallocation Feed Directives */}
      {(activeView === 'both' || activeView === 'feed') && (
        <ReallocationFeed
          initialItems={initialEngineState.reallocations}
          campaigns={initialEngineState.campaigns}
        />
      )}
    </div>
  );
}
