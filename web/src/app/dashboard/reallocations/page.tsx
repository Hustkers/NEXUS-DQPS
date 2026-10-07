'use client';

import React, { useState, useEffect } from 'react';
import { ReallocationFeed, type ReallocationItem } from '@/features/decision-engine/components/reallocation-feed';
import { RLVisualAnalytics } from '@/features/decision-engine/components/rl-visual-analytics';
import { computeRLAdAllocation } from '@/lib/rl-ad-optimizer';
import initialEngineState from '@/data/nexus-engine-state.json';
import { IconCpu, IconSparkles, IconLayersIntersect } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export default function ReallocationsPage() {
  const [activeView, setActiveView] = useState<'both' | 'rl_analytics' | 'feed'>('both');
  const [items, setItems] = useState<ReallocationItem[]>(initialEngineState.reallocations as unknown as ReallocationItem[]);

  useEffect(() => {
    let isMounted = true;
    async function loadReallocations() {
      try {
        const res = await fetch('/api/reallocations');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.reallocations) && isMounted) {
            setItems(data.reallocations);
          }
        }
      } catch {
        // Fallback to initialEngineState
      }
    }
    loadReallocations();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute portfolio-level RL ad allocation
  const rlData = React.useMemo(() => {
    return computeRLAdAllocation({
      productName: 'Cross-Portfolio Catalog',
      sku: 'PORTFOLIO-AGGREGATE',
      price: 7295,
      spend: 18450,
      roas: 2.95,
      grossMarginPct: 62,
      inventory: 480
    });
  }, []);

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen min-w-0 max-w-full font-mono'>
      {/* Page Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <IconCpu className='size-5 text-cyan-600 dark:text-cyan-400' />
            <h1 className='text-xl font-bold uppercase tracking-tight text-foreground'>
              Autonomous Budget Reallocation Feed &amp; RL Policy
            </h1>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            Contextual Bandit Dynamic Allocation • SLSQP Convex Solver • Stockout Suppression Kill-Switches
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className='flex items-center bg-muted/60 dark:bg-zinc-900 rounded-lg border border-border p-1 text-xs font-mono'>
          <button
            onClick={() => setActiveView('both')}
            className={cn(
              'px-3 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5',
              activeView === 'both' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <IconSparkles className='size-3.5 text-cyan-500' />
            Unified View
          </button>
          <button
            onClick={() => setActiveView('rl_analytics')}
            className={cn(
              'px-3 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5',
              activeView === 'rl_analytics' ? 'bg-background text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <IconCpu className='size-3.5' />
            RL Policy Analytics
          </button>
          <button
            onClick={() => setActiveView('feed')}
            className={cn(
              'px-3 py-1.5 rounded transition-all font-semibold flex items-center gap-1.5',
              activeView === 'feed' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <IconLayersIntersect className='size-3.5 text-indigo-400' />
            Reallocation Directives
          </button>
        </div>
      </div>

      {/* RL Analytics Suite */}
      {(activeView === 'both' || activeView === 'rl_analytics') && (
        <RLVisualAnalytics data={rlData} />
      )}

      {/* Reallocation Feed Directives */}
      {(activeView === 'both' || activeView === 'feed') && (
        <ReallocationFeed
          initialItems={items}
          campaigns={initialEngineState.campaigns}
        />
      )}
    </div>
  );
}
