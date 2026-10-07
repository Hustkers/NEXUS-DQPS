'use client';

import React from 'react';
import {
  IconCrown,
  IconScale,
  IconArrowsExchange,
  IconCheck,
  IconArrowRight
} from '@tabler/icons-react';
import type { CampaignStrategy } from '@/lib/strategy-engine/types';
import { cn } from '@/lib/utils';

interface StrategyComparisonCardsProps {
  top3: CampaignStrategy[];
  onSelectStrategy: (strategy: CampaignStrategy) => void;
  onOpenCompareModal: () => void;
  onOpenAllModal: () => void;
  selectedStrategyId: string;
}

export function StrategyComparisonCards({
  top3,
  onSelectStrategy,
  onOpenCompareModal,
  onOpenAllModal,
  selectedStrategyId
}: StrategyComparisonCardsProps) {
  const curSym = '₹';

  return (
    <div className='rounded-2xl border border-border/80 bg-card p-6 font-mono space-y-4 shadow-xs'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
        <div>
          <div className='flex items-center gap-2'>
            <IconScale className='size-4 text-purple-400' />
            <h3 className='text-sm sm:text-base font-bold uppercase tracking-tight text-foreground'>
              STRATEGY COMPARISON
            </h3>
          </div>
          <p className='text-[11px] text-muted-foreground mt-0.5'>
            Top 3 vetted candidate models ranked by econometric efficiency. Click any card to inspect or test.
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={onOpenCompareModal}
            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted/60 text-xs text-foreground font-semibold transition-colors'
          >
            <IconArrowsExchange className='size-3.5 text-cyan-400' />
            <span>Side-by-Side Matrix</span>
          </button>

          <button
            type='button'
            onClick={onOpenAllModal}
            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs text-cyan-400 font-bold transition-colors'
          >
            <span>Compare All 24 Strategies</span>
            <IconArrowRight className='size-3.5' />
          </button>
        </div>
      </div>

      {/* 3 Compact Strategy Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-1'>
        {top3.map((strat, idx) => {
          const isBest = idx === 0;
          const isSelected = strat.strategyId === selectedStrategyId;
          const ev = strat.evaluation;
          const roas = ev?.expectedRoas ?? 0;
          const cpa = ev?.expectedCpa ?? 0;

          return (
            <div
              key={strat.strategyId}
              onClick={() => onSelectStrategy(strat)}
              className={cn(
                'rounded-xl border p-4.5 cursor-pointer transition-all duration-150 flex flex-col justify-between relative group',
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/15 shadow-sm'
                  : isBest
                    ? 'border-amber-500/50 bg-amber-950/10 hover:border-amber-500'
                    : 'border-border/70 bg-muted/20 hover:border-border hover:bg-muted/40'
              )}
            >
              {/* Card Header: Rank & Badge */}
              <div className='flex items-center justify-between pb-2 border-b border-border/40'>
                <div className='flex items-center gap-2'>
                  <span
                    className={cn(
                      'size-5 rounded font-bold text-[10px] flex items-center justify-center',
                      isBest ? 'bg-amber-500 text-black' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    0{idx + 1}
                  </span>
                  <span className='text-[11px] font-bold uppercase text-foreground'>
                    {strat.platform}
                  </span>
                </div>

                <div className='flex items-center gap-1.5'>
                  {isBest && (
                    <span className='text-[9px] uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40'>
                      BEST
                    </span>
                  )}
                  {isSelected && (
                    <span className='text-[9px] uppercase font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'>
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className='my-3 min-w-0'>
                <h4
                  className='text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-cyan-400 transition-colors'
                  title={strat.strategyName}
                >
                  {strat.strategyName.split('—')[0].trim()}
                </h4>
                <p className='text-[10px] text-muted-foreground mt-0.5 truncate'>
                  {strat.adFormat} • {strat.funnelStage} Funnel
                </p>
              </div>

              {/* Core Metric Pair: ROAS & CPA */}
              <div className='grid grid-cols-2 gap-2 pt-2 border-t border-border/40'>
                <div>
                  <span className='text-[9px] uppercase font-bold text-muted-foreground block'>
                    ROAS
                  </span>
                  <span className='text-base font-bold text-emerald-400'>
                    {roas.toFixed(2)}x
                  </span>
                </div>

                <div>
                  <span className='text-[9px] uppercase font-bold text-muted-foreground block'>
                    CPA
                  </span>
                  <span className='text-base font-bold text-cyan-400'>
                    {curSym}{cpa.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
