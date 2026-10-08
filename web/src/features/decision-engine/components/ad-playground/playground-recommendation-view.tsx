'use client';

import React, { useState } from 'react';
import {
  IconSparkles,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconArrowsExchange,
  IconAlertTriangle,
  IconX,
  IconScale
} from '@tabler/icons-react';
import { PlatformLogo } from '@/components/icons/platform-logos';
import type { CandidateAdConfig, AdPlaygroundResult } from '../../types/ad-playground-types';
import { cn } from '@/lib/utils';

interface PlaygroundRecommendationViewProps {
  result: AdPlaygroundResult;
  onSelectCandidate?: (config: CandidateAdConfig) => void;
}

export function PlaygroundRecommendationView({
  result
}: PlaygroundRecommendationViewProps) {
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [comparedCandidate, setComparedCandidate] = useState<CandidateAdConfig | null>(null);

  const candidates = result.candidates;
  const bestCandidate = candidates[0];
  const isStockout = result.inventory <= 0;
  const isProfitable = result.is_profitable;

  const visibleCandidates = showAllCandidates ? candidates : candidates.slice(0, 3);

  return (
    <div className='space-y-4 font-sans'>
      {/* 1. BEST CAMPAIGN HERO CARD */}
      <div className='rounded-2xl border border-zinc-800 bg-[#121215] p-5 relative overflow-hidden shadow-xs'>
        <div className='flex items-center justify-between pb-3 border-b border-zinc-800 mb-4'>
          <div className='flex items-center gap-2'>
            <span className='size-2 rounded-full bg-zinc-400' />
            <span className='text-[10px] uppercase font-semibold tracking-wider text-zinc-300 font-sans'>
              RECOMMENDED CAMPAIGN
            </span>
          </div>

          <span className='text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-200'>
            {isStockout
              ? 'PAUSE SPEND'
              : !isProfitable
                ? 'REDUCE BUDGET'
                : 'RANK #1 OPTIMAL'}
          </span>
        </div>

        {bestCandidate && (
          <div className='space-y-4'>
            {/* Title & Core Meta */}
            <div className='flex flex-col sm:flex-row sm:items-baseline justify-between gap-2'>
              <div>
                <h3 className='text-base sm:text-lg font-semibold text-zinc-100 flex items-center gap-2'>
                  <PlatformLogo platform={bestCandidate.platform} size={16} />
                  <span>{bestCandidate.creative_format || 'UGC Video'} • {bestCandidate.audience_type?.toUpperCase() || 'BROAD'} • {bestCandidate.placement || 'AUTO'}</span>
                </h3>
                <p className='text-xs text-zinc-400 mt-0.5 font-sans'>
                  {bestCandidate.title}
                </p>
              </div>

              <div className='text-left sm:text-right shrink-0'>
                <span className='text-lg font-mono tabular-nums font-bold text-zinc-100'>
                  ${bestCandidate.daily_budget.toLocaleString()}
                  <span className='text-xs font-normal text-zinc-500 font-sans ml-1'>/day</span>
                </span>
                <div className='text-[11px] text-zinc-400 mt-0.5 font-mono tabular-nums'>
                  Total horizon spend: ${bestCandidate.expected_spend.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Financial Telemetry Banner */}
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 font-sans'>
              <div>
                <span className='text-[10px] text-zinc-400 uppercase font-semibold font-sans'>Predicted ROAS</span>
                <div className='text-xl font-mono tabular-nums font-bold text-zinc-100 mt-0.5'>
                  {isStockout ? '0.00x' : `${bestCandidate.predicted_roas.toFixed(2)}x`}
                </div>
              </div>

              <div>
                <span className='text-[10px] text-zinc-400 uppercase font-semibold font-sans'>Expected Profit</span>
                <div
                  className={cn(
                    'text-xl font-mono tabular-nums font-bold mt-0.5',
                    isStockout || bestCandidate.predicted_net_profit < 0 ? 'text-rose-400' : 'text-zinc-100'
                  )}
                >
                  {isStockout
                    ? '$0'
                    : bestCandidate.predicted_net_profit < 0
                      ? `-$${Math.abs(bestCandidate.predicted_net_profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : `$${bestCandidate.predicted_net_profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
              </div>

              <div className='col-span-2 sm:col-span-1'>
                <span className='text-[10px] text-zinc-400 uppercase font-semibold font-sans'>Confidence Score</span>
                <div className='text-xl font-mono tabular-nums font-bold text-zinc-100 mt-0.5'>
                  {Math.round(bestCandidate.confidence_score * 100)}%
                </div>
              </div>
            </div>

            {/* WHY THIS CAMPAIGN? Concise explanation bullets */}
            <div className='pt-1'>
              <span className='text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-2'>
                WHY THIS CAMPAIGN?
              </span>
              <div className='space-y-1.5'>
                {result.why_this_campaign.map((reason, idx) => (
                  <div key={idx} className='flex items-center gap-2 text-xs'>
                    {isStockout || !isProfitable ? (
                      <IconAlertTriangle className='size-3.5 text-amber-400 shrink-0' />
                    ) : (
                      <IconCheck className='size-3.5 text-emerald-400 shrink-0 stroke-[3]' />
                    )}
                    <span className='text-foreground/90'>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. TOP ALTERNATIVES LIST */}
      <div className='rounded-2xl border border-border/80 bg-card p-5'>
        <div className='flex items-center justify-between pb-3 border-b border-border/60 mb-3'>
          <span className='text-[10px] uppercase font-bold tracking-widest text-muted-foreground'>
            TOP ALTERNATIVE CANDIDATES
          </span>
          <span className='text-[10px] text-muted-foreground'>
            Click any candidate to compare
          </span>
        </div>

        <div className='space-y-2'>
          {visibleCandidates.map((cand) => {
            const isTop = cand.rank === 1;

            return (
              <div
                key={cand.config_id}
                onClick={() => setComparedCandidate(cand)}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group text-xs',
                  isTop
                    ? 'border-emerald-500/50 bg-emerald-950/10 hover:border-emerald-500'
                    : 'border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40'
                )}
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <span
                    className={cn(
                      'size-6 rounded-md font-mono text-[11px] font-black flex items-center justify-center shrink-0',
                      isTop ? 'bg-emerald-500 text-slate-950' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    0{cand.rank}
                  </span>

                  <div className='flex items-center gap-2 min-w-0'>
                    <PlatformLogo platform={cand.platform} size={14} className='shrink-0' />
                    <span className='font-semibold text-foreground truncate group-hover:text-cyan-400 transition-colors'>
                      {cand.creative_format || 'UGC'} • {cand.audience_segment?.slice(0, 24) || cand.platform}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-4 shrink-0 font-mono tabular-nums'>
                  <span className='text-zinc-500 hidden sm:block font-sans'>
                    ${cand.daily_budget.toLocaleString()}/day
                  </span>
                  <span className='font-semibold text-zinc-100'>
                    {cand.predicted_roas.toFixed(2)}x
                  </span>
                  <span
                    className={cn(
                      'font-semibold w-24 text-right',
                      cand.predicted_net_profit < 0 ? 'text-rose-400' : 'text-zinc-200'
                    )}
                  >
                    {cand.predicted_net_profit < 0 ? '-' : ''}${Math.abs(cand.predicted_net_profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Toggle to view all 10 candidates */}
        <div className='mt-3 pt-2 border-t border-border/40 text-center'>
          <button
            type='button'
            onClick={() => setShowAllCandidates(!showAllCandidates)}
            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted/60 text-xs font-mono text-muted-foreground hover:text-foreground transition-all'
          >
            <span>{showAllCandidates ? 'Collapse to Top 3' : `View All ${candidates.length} Candidates`}</span>
            {showAllCandidates ? (
              <IconChevronUp className='size-3.5' />
            ) : (
              <IconChevronDown className='size-3.5' />
            )}
          </button>
        </div>
      </div>

      {/* 3. CANDIDATE COMPARISON MODAL */}
      {comparedCandidate && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-0 duration-150'>
          <div
            className='relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl font-mono text-foreground animate-in zoom-in-95 duration-150'
            role='dialog'
            aria-modal='true'
            aria-label='Candidate Comparison'
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-border pb-3 mb-4'>
              <div className='flex items-center gap-2'>
                <IconArrowsExchange className='size-5 text-cyan-400' />
                <h4 className='text-sm font-bold uppercase tracking-tight text-foreground'>
                  CAMPAIGN CANDIDATE COMPARISON
                </h4>
              </div>
              <button
                type='button'
                onClick={() => setComparedCandidate(null)}
                className='size-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors'
              >
                <IconX className='size-4' />
              </button>
            </div>

            {/* Side-by-side comparison */}
            <div className='grid grid-cols-2 gap-4 text-xs'>
              {/* Left Column: #1 Recommended */}
              <div className='p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/10 space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='font-bold text-emerald-400 uppercase text-[10px]'>
                    #1 RECOMMENDED
                  </span>
                  <PlatformLogo platform={bestCandidate.platform} size={14} />
                </div>
                <div className='font-bold text-foreground text-sm truncate'>
                  {bestCandidate.title}
                </div>
                <div className='space-y-1.5 pt-2 border-t border-border/40 text-muted-foreground'>
                  <div className='flex justify-between'>
                    <span className='font-sans text-zinc-400'>ROAS:</span>
                    <span className='font-mono tabular-nums font-semibold text-zinc-100'>{bestCandidate.predicted_roas.toFixed(2)}x</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-sans text-zinc-400'>Net Profit:</span>
                    <span className='font-mono tabular-nums font-semibold text-zinc-100'>${bestCandidate.predicted_net_profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-sans text-zinc-400'>Daily Budget:</span>
                    <span className='font-mono tabular-nums font-semibold text-zinc-100'>${bestCandidate.daily_budget.toLocaleString()}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-sans text-zinc-400'>Confidence:</span>
                    <span className='font-mono tabular-nums font-semibold text-zinc-100'>{Math.round(bestCandidate.confidence_score * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Selected Alternative Candidate */}
              <div className='p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3 font-sans'>
                <div className='flex items-center justify-between'>
                  <span className='font-semibold text-zinc-400 uppercase text-[10px] font-sans'>
                    #{comparedCandidate.rank} CANDIDATE
                  </span>
                  <PlatformLogo platform={comparedCandidate.platform} size={14} />
                </div>
                <div className='font-semibold text-zinc-100 text-sm truncate'>
                  {comparedCandidate.title}
                </div>
                <div className='space-y-1.5 pt-2 border-t border-zinc-800 text-zinc-400'>
                  <div className='flex justify-between'>
                    <span className='font-sans text-zinc-400'>ROAS:</span>
                    <span className='font-mono tabular-nums font-semibold text-zinc-100'>{comparedCandidate.predicted_roas.toFixed(2)}x</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-sans text-zinc-400'>Net Profit:</span>
                    <span className='font-mono tabular-nums font-semibold text-zinc-100'>${comparedCandidate.predicted_net_profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-sans text-zinc-400'>Daily Budget:</span>
                    <span className='font-mono tabular-nums font-semibold text-zinc-100'>${comparedCandidate.daily_budget.toLocaleString()}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-sans text-zinc-400'>Confidence:</span>
                    <span className='font-mono tabular-nums font-semibold text-zinc-100'>{Math.round(comparedCandidate.confidence_score * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delta Banner */}
            <div className='mt-4 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs font-sans'>
              <span className='text-zinc-400'>Incremental Advantage of #1:</span>
              <div className='flex items-center gap-3 font-mono tabular-nums'>
                <span className='font-semibold text-zinc-100'>
                  +${(bestCandidate.predicted_net_profit - comparedCandidate.predicted_net_profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} expected profit
                </span>
                <span className='font-semibold text-zinc-300'>
                  +{(bestCandidate.predicted_roas - comparedCandidate.predicted_roas).toFixed(2)}x ROAS
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
