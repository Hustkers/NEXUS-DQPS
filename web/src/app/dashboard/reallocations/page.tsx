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
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background text-foreground min-h-screen font-sans'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4'>
        <div>
          <h1 className='text-xl sm:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2'>
            <IconCpu className='size-5 text-foreground/80' />
            Budget Reallocations
          </h1>
          <p className='text-xs text-muted-foreground mt-1'>
            Autonomous Scipy convex optimizer budget shift proposals and execution ledger.
          </p>
        </div>

        {/* View Switcher - Apple Segmented Control */}
        <div className='flex items-center bg-muted/60 p-1 rounded-xl border border-border/70 text-xs shadow-2xs'>
          <button
            onClick={() => setActiveView('both')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-all duration-150 font-medium flex items-center gap-1.5 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              activeView === 'both' ? 'bg-background text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <IconSparkles className='size-3.5 text-foreground/70' />
            Unified View
          </button>
          <button
            onClick={() => setActiveView('rl_analytics')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-all duration-150 font-medium flex items-center gap-1.5 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              activeView === 'rl_analytics' ? 'bg-background text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <IconCpu className='size-3.5' />
            RL Policy Analytics
          </button>
          <button
            onClick={() => setActiveView('feed')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-all duration-150 font-medium active:scale-[0.96] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              activeView === 'feed' ? 'bg-background text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Reallocation Directives
          </button>
        </div>
      </div>

      {/* RL Analytics Suite */}
      {(activeView === 'both' || activeView === 'rl_analytics') && (
        <div className='relative rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/35 dark:before:via-white/10 before:to-transparent'>
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
