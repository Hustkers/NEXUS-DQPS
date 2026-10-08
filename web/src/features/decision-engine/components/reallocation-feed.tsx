'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/icons';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { useDecisionEngine } from '@/context/decision-engine-store';
import { formatCurrency, getChannelMeta, type ReallocationItem as EngineReallocationItem } from '@/lib/gauges-engine';

export interface LegacyReallocationItem {
  id: string;
  actionType: string;
  sourceCampaign: string;
  targetCampaign: string;
  targetProductName?: string;
  currentSpend: number;
  recommendedSpend: number;
  deltaSpend: number;
  expectedDailyMargin: number;
  predictedRoas: number;
  confidence: number;
  reason: string;
  status: 'PENDING_APPROVAL' | 'EXECUTED_TO_AD_API' | 'HEURISTIC_OVERRIDE' | 'READY_FOR_EXECUTION' | string;
  stockoutKill?: boolean;
  sourceProductId?: string;
  targetProductId?: string;
  sourceProductName?: string;
  sourceChannel?: any;
  targetChannel?: any;
  actionTag?: any;
  sourceSpendBefore?: number;
  sourceSpendAfter?: number;
  targetSpendBefore?: number;
  targetSpendAfter?: number;
  movedAmount?: number;
  sourceRoas?: number;
  targetRoas?: number;
  targetMarginalRoas?: number;
  netRevenueLift?: number;
}

export type ReallocationItem = EngineReallocationItem | LegacyReallocationItem;
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface ReallocationFeedProps {
  initialItems?: any;
  campaigns?: any;
  onExecuteReallocation?: (item: any, details?: any) => void;
  className?: string;
}

export function ReallocationFeed({ className, initialItems, campaigns, onExecuteReallocation }: ReallocationFeedProps = {}) {
  const {
    reallocations,
    autoPilot,
    toggleAutoPilot,
    executeReallocation,
    executeAllReallocations,
  } = useDecisionEngine();

  // Single item 3-step modal
  const [selectedItem, setSelectedItem] = useState<EngineReallocationItem | null>(null);
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1);
  const [executingStepIndex, setExecutingStepIndex] = useState<number>(0);

  // Execute All modal states: 'preview' | 'executing' | 'result' | null
  const [executeAllState, setExecuteAllState] = useState<'preview' | 'executing' | 'result' | null>(null);
  const [executeAllProgress, setExecuteAllProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [executeAllSummary, setExecuteAllSummary] = useState<{ count: number; totalMoved: number; totalLift: number } | null>(null);

  // Escape key listener for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedItem && modalStep !== 2) {
          setSelectedItem(null);
        }
        if (executeAllState && executeAllState !== 'executing') {
          setExecuteAllState(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, modalStep, executeAllState]);

  // Single row step 2 sequential ticking
  useEffect(() => {
    if (!selectedItem || modalStep !== 2) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tickInterval = prefersReducedMotion ? 50 : 700;

    const timer = setInterval(() => {
      setExecutingStepIndex((prev) => {
        if (prev < 2) {
          return prev + 1;
        } else {
          clearInterval(timer);
          executeReallocation(selectedItem);
          setTimeout(() => {
            setModalStep(3);
          }, prefersReducedMotion ? 50 : 350);
          return prev;
        }
      });
    }, tickInterval);

    return () => clearInterval(timer);
  }, [selectedItem, modalStep, executeReallocation]);

  // Handle single item execute button click
  const handleOpenReview = (item: EngineReallocationItem) => {
    setSelectedItem(item);
    setModalStep(1);
    setExecutingStepIndex(0);
  };

  // Handle Execute All flow
  const handleStartExecuteAll = () => {
    if (reallocations.length === 0) return;
    setExecuteAllProgress({ current: 0, total: reallocations.length });
    setExecuteAllState('preview');
  };

  const handleConfirmExecuteAll = async () => {
    setExecuteAllState('executing');
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const total = reallocations.length;
    // Step through visual progress
    for (let i = 1; i <= total; i++) {
      setExecuteAllProgress({ current: i, total });
      if (!prefersReducedMotion) {
        await new Promise((res) => setTimeout(res, 500));
      }
    }

    const res = await executeAllReallocations();
    setExecuteAllSummary(res);
    setExecuteAllState('result');
    toast.success('All pending budget reallocations executed synchronously');
  };

  // Aggregated preview stats for Execute All
  const totalMovedAll = reallocations.reduce((acc, it) => acc + it.movedAmount, 0);
  const totalLiftAll = reallocations.reduce((acc, it) => acc + it.netRevenueLift, 0);

  return (
    <div className={cn('rounded-xl border border-[#27272a] bg-[#121215] p-5 shadow-none text-foreground font-sans min-w-0 max-w-full', className)}>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.adjustments className='size-3.5 text-zinc-400' />
          <h3 className='text-xs font-semibold text-zinc-100 uppercase tracking-wider font-sans'>
            Autonomous Capital Reallocation Stream
          </h3>
          <span className='text-xs text-zinc-400 font-mono'>
            ({reallocations.length} pending)
          </span>
        </div>

        <div className='flex items-center gap-4'>
          {/* Auto-Pilot Toggle */}
          <div className='flex items-center gap-2 text-xs text-zinc-400'>
            <span className={cn(autoPilot && 'text-emerald-400 font-medium')}>Auto-Pilot (≥80% conf)</span>
            <Switch
              checked={autoPilot}
              onCheckedChange={toggleAutoPilot}
              className='data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-zinc-800 border border-zinc-700'
            />
          </div>

          <Button
            size='sm'
            onClick={handleStartExecuteAll}
            disabled={reallocations.length === 0}
            className='h-8 text-xs font-sans bg-zinc-100 hover:bg-white text-zinc-900 font-semibold border-none active:scale-[0.98] shadow-xs'
          >
            Execute All
          </Button>
        </div>
      </div>

      {/* Streamlined Reallocation Rows */}
      {reallocations.length === 0 ? (
        <div className='rounded-lg border border-[#27272a] bg-zinc-900/30 p-8 text-center'>
          <Icons.check className='size-5 text-emerald-400 mx-auto mb-2' />
          <p className='text-xs font-semibold text-zinc-100'>
            All Capital Reallocations Executed &amp; Calibrated
          </p>
          <p className='text-[11px] text-zinc-400 mt-0.5'>
            No pending budget rebalancing directives at this optimization tick.
          </p>
        </div>
      ) : (
        <div className='divide-y divide-[#27272a]'>
          {reallocations.map((item) => {
            const isKill = item.actionTag === 'PAUSE';
            const isLowStock = item.actionTag === 'REDIRECT';
            const actionLabel = isKill ? 'PAUSE SPEND' : isLowStock ? 'CAP SPEND' : 'TRIM BUDGET';
            const badgeColor = isKill
              ? 'bg-zinc-900 text-red-400 border-zinc-800'
              : isLowStock
              ? 'bg-zinc-900 text-amber-400 border-zinc-800'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800';

            return (
              <div
                key={item.id}
                className='py-5 px-3 sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors rounded-lg font-sans'
              >
                {/* One clear line: Product (Channel) -> Target (Channel) · Move $X/day · +$Y/day · Z% */}
                <div className='flex-1 min-w-0 space-y-1.5'>
                  <div className='flex items-center gap-2 text-xs flex-wrap leading-relaxed'>
                    <span className={cn('text-[10px] font-mono font-medium px-2 py-0.5 rounded border uppercase tracking-wider', badgeColor)}>
                      [{actionLabel}]
                    </span>

                    <span className='font-semibold text-zinc-100 break-words'>
                      {item.sourceProductName} ({item.sourceChannel}) → {item.targetProductName} ({item.targetChannel})
                    </span>

                    <span className='text-zinc-600'>·</span>

                    <span className='text-zinc-200 font-mono tabular-nums font-medium'>
                      Move {formatCurrency(item.movedAmount)}
                    </span>

                    <span className='text-zinc-600'>·</span>

                    <span className='text-emerald-400 font-mono tabular-nums font-semibold'>
                      +{formatCurrency(item.netRevenueLift)}
                    </span>

                    <span className='text-zinc-600'>·</span>

                    <span className='text-zinc-400 font-mono tabular-nums'>
                      {item.confidence}%
                    </span>
                  </div>

                  {/* Campaign IDs only as small grey secondary text */}
                  <div className='text-[10px] text-zinc-500 font-mono'>
                    #{item.sourceCampaign} → #{item.targetCampaign}
                  </div>
                </div>

                {/* Single Execute Button */}
                <div className='shrink-0 flex items-center'>
                  <Button
                    size='sm'
                    onClick={() => handleOpenReview(item)}
                    className='h-8 px-4 text-xs font-sans bg-zinc-100 hover:bg-white text-zinc-900 font-semibold uppercase tracking-wider rounded-lg shadow-xs transition-all active:scale-[0.98]'
                  >
                    Execute
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RIGHT-SIDE REALLOCATION CONSOLE DRAWER */}
      {selectedItem && (
        <div className='fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200'>
          {/* Backdrop Click */}
          <div
            className='fixed inset-0'
            onClick={() => {
              if (modalStep !== 2) setSelectedItem(null);
            }}
          />

          {/* Right-Side Drawer: width min(560px, 100vw), padding 32px, 28px gap */}
          <div
            className='relative z-10 h-full w-full max-w-[min(560px,100vw)] bg-[#121215] border-l border-[#27272a] p-8 overflow-y-auto overflow-x-hidden font-sans shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 text-foreground'
            onClick={(e) => e.stopPropagation()}
            role='dialog'
            aria-modal='true'
          >
            {/* Drawer Header */}
            <div className='flex items-start justify-between border-b border-[#27272a] pb-5'>
              <div className='min-w-0 pr-4'>
                <h3 className='text-base font-semibold text-zinc-100 uppercase tracking-tight font-sans'>
                  Move budget
                </h3>
                <p className='text-xs text-zinc-400 mt-1 break-words leading-relaxed font-sans'>
                  {selectedItem.sourceProductName} ({selectedItem.sourceChannel}) →{' '}
                  {selectedItem.targetProductName} ({selectedItem.targetChannel})
                </p>
              </div>
              {modalStep !== 2 && (
                <button
                  type='button'
                  onClick={() => setSelectedItem(null)}
                  className='size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0'
                  aria-label='Close drawer'
                >
                  ✕
                </button>
              )}
            </div>

            {/* STEP 1: REVIEW */}
            {modalStep === 1 && (
              <div className='space-y-7 my-auto py-4 font-sans'>
                {/* Big Centered Number Block */}
                <div className='rounded-xl border border-[#27272a] bg-[#18181b] py-6 px-4 text-center'>
                  <div className='text-3xl font-extrabold text-zinc-100 tracking-tight font-mono tabular-nums'>
                    {formatCurrency(selectedItem.movedAmount)}
                  </div>
                  <p className='text-xs text-zinc-400 mt-1.5 font-sans'>
                    moves to a campaign earning more
                  </p>
                </div>

                {/* From / To Cards (each with 16px padding; badge sits below name) */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {/* FROM CARD */}
                  <div className='rounded-lg border border-[#27272a] bg-[#18181b] p-4 flex flex-col justify-between'>
                    <div>
                      <span className='text-[10px] uppercase font-mono font-medium tracking-wider text-zinc-400 block'>
                        From
                      </span>
                      <div className='text-xs font-semibold text-zinc-100 mt-1 break-words font-sans'>
                        {selectedItem.sourceProductName} · {selectedItem.sourceChannel}
                      </div>
                      <div className='mt-2'>
                        <span className={cn(
                          'text-[10px] font-mono font-medium px-2 py-0.5 rounded border uppercase',
                          selectedItem.actionTag === 'PAUSE'
                            ? 'bg-zinc-900 text-red-400 border-zinc-800'
                            : selectedItem.actionTag === 'REDIRECT'
                            ? 'bg-zinc-900 text-amber-400 border-zinc-800'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                        )}>
                          {selectedItem.actionTag === 'PAUSE' ? 'PAUSE SPEND' : selectedItem.actionTag === 'REDIRECT' ? 'CAP SPEND' : 'TRIM BUDGET'}
                        </span>
                      </div>
                    </div>
                    <div className='mt-3.5 pt-3 border-t border-[#27272a] space-y-1 text-xs font-mono tabular-nums'>
                      <div className='text-zinc-200'>
                        {formatCurrency(selectedItem.sourceSpendBefore)} → {formatCurrency(selectedItem.sourceSpendAfter)}
                      </div>
                      <div className='text-zinc-400'>
                        ROAS {selectedItem.sourceRoas.toFixed(2)}x
                      </div>
                    </div>
                  </div>

                  {/* TO CARD */}
                  <div className='rounded-lg border border-[#27272a] bg-[#18181b] p-4 flex flex-col justify-between'>
                    <div>
                      <span className='text-[10px] uppercase font-mono font-medium tracking-wider text-zinc-400 block'>
                        To
                      </span>
                      <div className='text-xs font-semibold text-zinc-100 mt-1 break-words font-sans'>
                        {selectedItem.targetProductName} · {selectedItem.targetChannel}
                      </div>
                      <div className='mt-2'>
                        <span className='text-[10px] font-mono font-medium px-2 py-0.5 rounded border uppercase bg-zinc-900 text-emerald-400 border-zinc-800'>
                          SCALE REVENUE
                        </span>
                      </div>
                    </div>
                    <div className='mt-3.5 pt-3 border-t border-[#27272a] space-y-1 text-xs font-mono tabular-nums'>
                      <div className='text-zinc-200'>
                        {formatCurrency(selectedItem.targetSpendBefore)} → {formatCurrency(selectedItem.targetSpendAfter)}
                      </div>
                      <div className='text-emerald-400 font-semibold'>
                        ROAS {selectedItem.targetRoas.toFixed(2)}x
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why and Expected gain */}
                <div className='space-y-3 rounded-lg border border-[#27272a] bg-[#18181b] p-4 text-xs font-sans'>
                  <div className='space-y-1'>
                    <span className='text-[10px] uppercase font-mono font-medium tracking-wider text-zinc-400 block'>
                      Why
                    </span>
                    <p className='text-zinc-200 leading-relaxed break-words font-sans'>
                      {selectedItem.reason}
                    </p>
                  </div>
                  <div className='space-y-1 pt-2.5 border-t border-[#27272a]'>
                    <span className='text-[10px] uppercase font-mono font-medium tracking-wider text-zinc-400 block'>
                      Expected gain
                    </span>
                    <p className='text-emerald-400 font-semibold font-sans'>
                      +{formatCurrency(selectedItem.netRevenueLift)} extra revenue · {selectedItem.confidence}% confidence
                    </p>
                  </div>
                </div>

                {/* Details (collapsed by default: formula, campaign IDs, assumptions) */}
                <details className='rounded-lg border border-[#27272a] bg-zinc-900/40 p-3 text-xs group font-sans'>
                  <summary className='cursor-pointer text-zinc-400 hover:text-zinc-100 font-medium flex items-center justify-between select-none font-sans'>
                    <span>Details (formula, campaign IDs, assumptions)</span>
                    <span className='text-[10px] text-zinc-500 group-open:rotate-90 transition-transform'>▸</span>
                  </summary>
                  <div className='mt-3 space-y-2.5 pt-2.5 border-t border-[#27272a] text-[11px] text-zinc-400 font-sans'>
                    <div>
                      <span className='text-zinc-500 block font-sans'>Net lift formula:</span>
                      <span className='font-mono tabular-nums text-zinc-200'>
                        {formatCurrency(selectedItem.movedAmount)} × ({selectedItem.targetMarginalRoas}x − {selectedItem.sourceRoas.toFixed(2)}x) = +{formatCurrency(selectedItem.netRevenueLift)}
                      </span>
                    </div>
                    <div className='grid grid-cols-2 gap-2 text-[10px] font-mono'>
                      <div>
                        <span className='text-zinc-500 block font-sans'>Source ID:</span>
                        <span className='text-zinc-300'>#{selectedItem.sourceCampaign}</span>
                      </div>
                      <div>
                        <span className='text-zinc-500 block font-sans'>Destination ID:</span>
                        <span className='text-zinc-300'>#{selectedItem.targetCampaign}</span>
                      </div>
                    </div>
                    <div className='text-[10px] text-zinc-400 leading-relaxed font-sans'>
                      Assumptions: Destination marginal ROAS calculated via analytical Hill saturation auction curve derivatives (diminishing marginal returns); destination expansion capped at +50% of current spend.
                    </div>
                  </div>
                </details>

                {/* Action Buttons */}
                <div className='flex items-center justify-end gap-3 pt-4 border-t border-[#27272a]'>
                  <button
                    type='button'
                    onClick={() => setSelectedItem(null)}
                    className='px-4 py-2.5 rounded-lg border border-[#27272a] bg-[#18181b] text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors font-sans'
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    onClick={() => setModalStep(2)}
                    className='px-5 py-2.5 rounded-lg bg-zinc-100 text-zinc-900 text-xs font-semibold uppercase tracking-wider hover:bg-white transition-all shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 font-sans'
                  >
                    Move {formatCurrency(selectedItem.movedAmount)}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: EXECUTING */}
            {modalStep === 2 && (
              <div className='py-12 space-y-6 text-center my-auto'>
                <div className='size-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto' />
                <div>
                  <h4 className='text-sm font-bold text-white uppercase tracking-wider'>
                    Moving Budget
                  </h4>
                  <p className='text-xs text-[#737373] mt-1'>
                    Rebalancing daily allocations across channels...
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: DONE COMPACT STATE */}
            {modalStep === 3 && (
              <div className='space-y-6 my-auto py-4 font-sans'>
                {/* Green Banner: Moved at HH:MM */}
                <div className='rounded-lg border border-emerald-800/40 bg-emerald-950/30 p-4 flex items-center justify-between'>
                  <div className='flex items-center gap-2.5'>
                    <div className='size-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold font-mono'>
                      ✓
                    </div>
                    <div>
                      <span className='text-xs font-semibold text-emerald-300 uppercase tracking-wider font-sans'>
                        Moved at {new Date().toTimeString().slice(0, 5)}
                      </span>
                      <p className='text-[11px] text-emerald-400/80 font-sans'>
                        Added to Decision Ledger
                      </p>
                    </div>
                  </div>
                  <span className='text-[10px] font-mono tabular-nums text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60 uppercase font-medium'>
                    Moved {formatCurrency(selectedItem.movedAmount)}
                  </span>
                </div>

                {/* The two before -> after lines */}
                <div className='rounded-lg border border-[#27272a] bg-[#18181b] p-4 space-y-3 text-xs font-sans'>
                  <span className='text-[10px] uppercase font-mono font-medium tracking-wider text-zinc-400 block'>
                    Updated Allocations
                  </span>
                  <div className='space-y-2.5 font-sans'>
                    <div className='flex items-center justify-between'>
                      <span className='text-zinc-200 font-medium'>{selectedItem.sourceProductName}</span>
                      <span className='font-mono tabular-nums'>
                        <span className='text-zinc-500 line-through'>{formatCurrency(selectedItem.sourceSpendBefore)}</span>{' '}
                        → <span className='text-zinc-100 font-semibold'>{formatCurrency(selectedItem.sourceSpendAfter)}</span>
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-zinc-200 font-medium'>{selectedItem.targetProductName}</span>
                      <span className='font-mono tabular-nums'>
                        <span className='text-zinc-500 line-through'>{formatCurrency(selectedItem.targetSpendBefore)}</span>{' '}
                        → <span className='text-emerald-400 font-semibold'>{formatCurrency(selectedItem.targetSpendAfter)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Note that outcomes are projections measured over 7 days */}
                <div className='flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-900/50 p-3 rounded border border-[#27272a] font-sans'>
                  <Icons.info className='size-3.5 text-zinc-400 shrink-0' />
                  <span>Outcomes are projections measured over 7 days.</span>
                </div>

                {/* Close Button */}
                <div className='flex items-center justify-end pt-4 border-t border-[#27272a]'>
                  <button
                    type='button'
                    onClick={() => setSelectedItem(null)}
                    className='px-5 py-2.5 rounded-lg bg-zinc-100 text-zinc-900 text-xs font-semibold uppercase tracking-wider hover:bg-white transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 font-sans'
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RIGHT-SIDE DRAWER: EXECUTE ALL FLOW */}
      {executeAllState && (
        <div className='fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans'>
          {/* Backdrop Click */}
          <div
            className='fixed inset-0'
            onClick={() => {
              if (executeAllState !== 'executing') setExecuteAllState(null);
            }}
          />

          {/* Right-Side Drawer: width min(560px, 100vw), padding 32px, 28px gap */}
          <div
            className='relative z-10 h-full w-full max-w-[min(560px,100vw)] bg-[#121215] border-l border-[#27272a] p-8 overflow-y-auto overflow-x-hidden font-sans shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 text-foreground'
            onClick={(e) => e.stopPropagation()}
            role='dialog'
            aria-modal='true'
          >
            {/* Header */}
            <div className='flex items-start justify-between border-b border-[#27272a] pb-5'>
              <div className='min-w-0 pr-4'>
                <h3 className='text-base font-semibold text-zinc-100 uppercase tracking-tight font-sans'>
                  Move all budgets
                </h3>
                <p className='text-xs text-zinc-400 mt-1 font-sans'>
                  {reallocations.length} pending capital moves queued
                </p>
              </div>
              {executeAllState !== 'executing' && (
                <button
                  type='button'
                  onClick={() => setExecuteAllState(null)}
                  className='size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0'
                  aria-label='Close drawer'
                >
                  ✕
                </button>
              )}
            </div>

            {/* PREVIEW STEP */}
            {executeAllState === 'preview' && (
              <div className='space-y-7 my-auto py-4 font-sans'>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='rounded-lg border border-[#27272a] bg-[#18181b] p-4'>
                    <span className='text-[10px] text-zinc-400 uppercase font-medium block font-sans'>
                      Total Capital Moved
                    </span>
                    <span className='text-xl font-bold text-zinc-100 mt-1 block font-mono tabular-nums'>
                      {formatCurrency(totalMovedAll)}
                    </span>
                  </div>
                  <div className='rounded-lg border border-[#27272a] bg-[#18181b] p-4'>
                    <span className='text-[10px] text-zinc-400 uppercase font-medium block font-sans'>
                      Total Expected Gain
                    </span>
                    <span className='text-xl font-bold text-emerald-400 mt-1 block font-mono tabular-nums'>
                      +{formatCurrency(totalLiftAll)}
                    </span>
                  </div>
                </div>

                <div className='rounded-lg border border-[#27272a] bg-[#18181b] p-4 space-y-2 font-sans'>
                  <span className='text-[10px] uppercase font-mono font-medium tracking-wider text-zinc-400 block'>
                    Pending Reallocations ({reallocations.length})
                  </span>
                  <div className='space-y-2 max-h-64 overflow-y-auto pr-1 text-xs'>
                    {reallocations.map((it) => (
                      <div key={it.id} className='rounded border border-[#27272a] bg-zinc-900/40 p-3 flex items-center justify-between font-sans'>
                        <div className='min-w-0 pr-2'>
                          <span className='text-zinc-100 font-medium truncate block font-sans'>
                            {it.sourceProductName} → {it.targetProductName}
                          </span>
                          <span className='text-[11px] text-zinc-400 font-mono tabular-nums'>
                            Move {formatCurrency(it.movedAmount)} · Gain +{formatCurrency(it.netRevenueLift)}
                          </span>
                        </div>
                        <span className='text-[10px] font-mono tabular-nums text-emerald-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 shrink-0'>
                          {it.confidence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='flex items-center justify-end gap-3 pt-4 border-t border-[#27272a]'>
                  <button
                    type='button'
                    onClick={() => setExecuteAllState(null)}
                    className='px-4 py-2.5 rounded-lg border border-[#27272a] bg-[#18181b] text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors font-sans'
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    onClick={handleConfirmExecuteAll}
                    className='px-5 py-2.5 rounded-lg bg-zinc-100 text-zinc-900 text-xs font-semibold uppercase tracking-wider hover:bg-white transition-all shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 font-sans'
                  >
                    Move All Budget ({reallocations.length} Actions)
                  </button>
                </div>
              </div>
            )}

            {/* EXECUTING STEP */}
            {executeAllState === 'executing' && (
              <div className='py-12 space-y-6 text-center my-auto font-sans'>
                <div className='size-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto' />
                <div>
                  <h4 className='text-sm font-semibold text-zinc-100 uppercase tracking-wider font-sans'>
                    Moving All Budgets Sequentially
                  </h4>
                  <p className='text-xs text-zinc-400 mt-1 font-sans'>
                    Applying action {executeAllProgress.current} of {executeAllProgress.total}...
                  </p>
                </div>

                <div className='w-full bg-zinc-800 rounded-full h-2 overflow-hidden'>
                  <div
                    className='bg-emerald-500 h-full transition-all duration-300'
                    style={{
                      width: `${(executeAllProgress.current / Math.max(1, executeAllProgress.total)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* COMBINED RESULT STEP */}
            {executeAllState === 'result' && executeAllSummary && (
              <div className='space-y-6 my-auto py-4 font-sans'>
                <div className='rounded-lg border border-emerald-800/40 bg-emerald-950/30 p-4 flex items-center justify-between'>
                  <div className='flex items-center gap-2.5'>
                    <div className='size-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold font-mono'>
                      ✓
                    </div>
                    <div>
                      <span className='text-xs font-semibold text-emerald-300 uppercase tracking-wider font-sans'>
                        Batch Done at {new Date().toTimeString().slice(0, 5)}
                      </span>
                      <p className='text-[11px] text-emerald-400/80 font-sans'>
                        {executeAllSummary.count} reallocations executed and logged to Decision Ledger
                      </p>
                    </div>
                  </div>
                  <span className='text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60 uppercase font-medium'>
                    Batch Done
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='rounded-lg border border-[#27272a] bg-[#18181b] p-4'>
                    <span className='text-[10px] text-zinc-400 uppercase font-medium block font-sans'>
                      Total Capital Moved
                    </span>
                    <span className='text-xl font-bold text-zinc-100 mt-1 block font-mono tabular-nums'>
                      {formatCurrency(executeAllSummary.totalMoved)}
                    </span>
                  </div>
                  <div className='rounded-lg border border-[#27272a] bg-[#18181b] p-4'>
                    <span className='text-[10px] text-zinc-400 uppercase font-medium block font-sans'>
                      Total Projected Lift
                    </span>
                    <span className='text-xl font-bold text-emerald-400 mt-1 block font-mono tabular-nums'>
                      +{formatCurrency(executeAllSummary.totalLift)}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-900/50 p-3 rounded border border-[#27272a] font-sans'>
                  <Icons.info className='size-3.5 text-zinc-400 shrink-0' />
                  <span>Outcomes are algorithmic projections modeled over a 7-day calibration window.</span>
                </div>

                <div className='flex items-center justify-end pt-4 border-t border-[#27272a]'>
                  <button
                    type='button'
                    onClick={() => setExecuteAllState(null)}
                    className='px-5 py-2.5 rounded-lg bg-zinc-100 text-zinc-900 text-xs font-semibold uppercase tracking-wider hover:bg-white transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 font-sans'
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
