'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/icons';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { useDecisionEngine } from '@/context/decision-engine-store';
import { formatINR, getChannelMeta, type ReallocationItem as EngineReallocationItem } from '@/lib/gauges-engine';

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
    <div className={cn('rounded-xl border border-border bg-card p-5 shadow-none text-card-foreground font-mono min-w-0 max-w-full', className)}>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.adjustments className='size-3.5 text-muted-foreground' />
          <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
            Autonomous Capital Reallocation Stream
          </h3>
          <span className='text-xs text-muted-foreground'>
            ({reallocations.length} pending)
          </span>
        </div>

        <div className='flex items-center gap-4'>
          {/* Auto-Pilot Toggle */}
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span className={cn(autoPilot && 'text-emerald-400 font-bold')}>Auto-Pilot (≥80% conf)</span>
            <Switch
              checked={autoPilot}
              onCheckedChange={toggleAutoPilot}
              className='data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-muted border border-border'
            />
          </div>

          <Button
            size='sm'
            onClick={handleStartExecuteAll}
            disabled={reallocations.length === 0}
            className='h-8 text-xs font-mono bg-foreground hover:bg-foreground/90 text-background font-bold border-none active:scale-[0.98] shadow-sm'
          >
            Execute All
          </Button>
        </div>
      </div>

      {/* Streamlined Reallocation Rows */}
      {reallocations.length === 0 ? (
        <div className='rounded-lg border border-border bg-muted/20 p-8 text-center'>
          <Icons.check className='size-5 text-emerald-400 mx-auto mb-2' />
          <p className='text-xs font-semibold text-foreground'>
            All Capital Reallocations Executed &amp; Calibrated
          </p>
          <p className='text-[11px] text-muted-foreground mt-0.5'>
            No pending budget rebalancing directives at this optimization tick.
          </p>
        </div>
      ) : (
        <div className='divide-y divide-[#1F1F1F]'>
          {reallocations.map((item) => {
            const isKill = item.actionTag === 'PAUSE';
            const isLowStock = item.actionTag === 'REDIRECT';
            const actionLabel = isKill ? 'PAUSE SPEND' : isLowStock ? 'CAP SPEND' : 'TRIM BUDGET';
            const badgeColor = isKill
              ? 'bg-rose-950/60 text-rose-400 border-rose-800/40'
              : isLowStock
              ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
              : 'bg-neutral-900 text-neutral-300 border-neutral-700/60';

            return (
              <div
                key={item.id}
                className='py-6 px-3 sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors rounded-lg'
              >
                {/* One clear line: Product (Channel) -> Target (Channel) · Move ₹X/day · +₹Y/day · Z% */}
                <div className='flex-1 min-w-0 space-y-1.5'>
                  <div className='flex items-center gap-2 text-xs flex-wrap leading-relaxed'>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono tracking-wider', badgeColor)}>
                      [{actionLabel}]
                    </span>

                    <span className='font-bold text-white break-words'>
                      {item.sourceProductName} ({item.sourceChannel}) → {item.targetProductName} ({item.targetChannel})
                    </span>

                    <span className='text-[#8A8A8A]'>·</span>

                    <span className='text-white font-medium'>
                      Move {formatINR(item.movedAmount)}
                    </span>

                    <span className='text-[#8A8A8A]'>·</span>

                    <span className='text-emerald-400 font-bold'>
                      +{formatINR(item.netRevenueLift)}
                    </span>

                    <span className='text-[#8A8A8A]'>·</span>

                    <span className='text-[#A3A3A3]'>
                      {item.confidence}%
                    </span>
                  </div>

                  {/* Campaign IDs only as small grey secondary text */}
                  <div className='text-[10px] text-[#737373] font-mono'>
                    #{item.sourceCampaign} → #{item.targetCampaign}
                  </div>
                </div>

                {/* Single Execute Button */}
                <div className='shrink-0 flex items-center'>
                  <Button
                    size='sm'
                    onClick={() => handleOpenReview(item)}
                    className='h-8 px-4 text-xs font-mono bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-[0.98]'
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
            className='relative z-10 h-full w-full max-w-[min(560px,100vw)] bg-[#0A0A0A] border-l border-[#262626] p-8 overflow-y-auto overflow-x-hidden font-mono shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 text-white'
            onClick={(e) => e.stopPropagation()}
            role='dialog'
            aria-modal='true'
          >
            {/* Drawer Header */}
            <div className='flex items-start justify-between border-b border-[#1F1F1F] pb-5'>
              <div className='min-w-0 pr-4'>
                <h3 className='text-base font-bold text-white uppercase tracking-tight'>
                  Move budget
                </h3>
                <p className='text-xs text-[#A3A3A3] mt-1 break-words leading-relaxed'>
                  {selectedItem.sourceProductName} ({selectedItem.sourceChannel}) →{' '}
                  {selectedItem.targetProductName} ({selectedItem.targetChannel})
                </p>
              </div>
              {modalStep !== 2 && (
                <button
                  type='button'
                  onClick={() => setSelectedItem(null)}
                  className='size-8 rounded-lg flex items-center justify-center text-[#737373] hover:text-white hover:bg-[#1A1A1A] transition-colors shrink-0'
                  aria-label='Close drawer'
                >
                  ✕
                </button>
              )}
            </div>

            {/* STEP 1: REVIEW */}
            {modalStep === 1 && (
              <div className='space-y-7 my-auto py-4'>
                {/* Big Centered Number Block */}
                <div className='rounded-xl border border-[#262626] bg-[#121212] py-6 px-4 text-center'>
                  <div className='text-3xl font-extrabold text-white tracking-tight font-mono'>
                    {formatINR(selectedItem.movedAmount)}
                  </div>
                  <p className='text-xs text-[#8A8A8A] mt-1.5'>
                    moves to a campaign earning more
                  </p>
                </div>

                {/* From / To Cards (each with 16px padding; badge sits below name) */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {/* FROM CARD */}
                  <div className='rounded-lg border border-[#262626] bg-[#141414] p-4 flex flex-col justify-between'>
                    <div>
                      <span className='text-[10px] uppercase tracking-wider font-semibold text-[#8A8A8A] block'>
                        From
                      </span>
                      <div className='text-xs font-bold text-white mt-1 break-words'>
                        {selectedItem.sourceProductName} · {selectedItem.sourceChannel}
                      </div>
                      <div className='mt-2'>
                        <span className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded border uppercase',
                          selectedItem.actionTag === 'PAUSE'
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                            : selectedItem.actionTag === 'REDIRECT'
                            ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                            : 'bg-neutral-900 text-neutral-300 border-neutral-700/60'
                        )}>
                          {selectedItem.actionTag === 'PAUSE' ? 'PAUSE SPEND' : selectedItem.actionTag === 'REDIRECT' ? 'CAP SPEND' : 'TRIM BUDGET'}
                        </span>
                      </div>
                    </div>
                    <div className='mt-3.5 pt-3 border-t border-[#1F1F1F] space-y-1 text-xs font-mono'>
                      <div className='text-[#D4D4D4]'>
                        {formatINR(selectedItem.sourceSpendBefore)} → {formatINR(selectedItem.sourceSpendAfter)}
                      </div>
                      <div className='text-[#8A8A8A]'>
                        ROAS {selectedItem.sourceRoas.toFixed(2)}x
                      </div>
                    </div>
                  </div>

                  {/* TO CARD */}
                  <div className='rounded-lg border border-[#262626] bg-[#141414] p-4 flex flex-col justify-between'>
                    <div>
                      <span className='text-[10px] uppercase tracking-wider font-semibold text-[#8A8A8A] block'>
                        To
                      </span>
                      <div className='text-xs font-bold text-white mt-1 break-words'>
                        {selectedItem.targetProductName} · {selectedItem.targetChannel}
                      </div>
                      <div className='mt-2'>
                        <span className='text-[10px] font-bold px-2 py-0.5 rounded border uppercase bg-emerald-950/60 text-emerald-400 border-emerald-800/40'>
                          SCALE REVENUE
                        </span>
                      </div>
                    </div>
                    <div className='mt-3.5 pt-3 border-t border-[#1F1F1F] space-y-1 text-xs font-mono'>
                      <div className='text-[#D4D4D4]'>
                        {formatINR(selectedItem.targetSpendBefore)} → {formatINR(selectedItem.targetSpendAfter)}
                      </div>
                      <div className='text-emerald-400 font-semibold'>
                        ROAS {selectedItem.targetRoas.toFixed(2)}x
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why and Expected gain */}
                <div className='space-y-3 rounded-lg border border-[#1F1F1F] bg-[#111111] p-4 text-xs'>
                  <div className='space-y-1'>
                    <span className='text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] block'>
                      Why
                    </span>
                    <p className='text-white leading-relaxed break-words'>
                      {selectedItem.reason}
                    </p>
                  </div>
                  <div className='space-y-1 pt-2.5 border-t border-[#1C1C1C]'>
                    <span className='text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] block'>
                      Expected gain
                    </span>
                    <p className='text-emerald-400 font-bold'>
                      +{formatINR(selectedItem.netRevenueLift)} extra revenue · {selectedItem.confidence}% confidence
                    </p>
                  </div>
                </div>

                {/* Details (collapsed by default: formula, campaign IDs, assumptions) */}
                <details className='rounded-lg border border-[#222222] bg-[#0E0E0E] p-3 text-xs group'>
                  <summary className='cursor-pointer text-[#8A8A8A] hover:text-white font-medium flex items-center justify-between select-none'>
                    <span>Details (formula, campaign IDs, assumptions)</span>
                    <span className='text-[10px] text-[#737373] group-open:rotate-90 transition-transform'>▸</span>
                  </summary>
                  <div className='mt-3 space-y-2.5 pt-2.5 border-t border-[#1A1A1A] text-[11px] text-[#A3A3A3]'>
                    <div>
                      <span className='text-[#737373] block'>Net lift formula:</span>
                      <span className='font-mono text-white'>
                        {formatINR(selectedItem.movedAmount)} × ({selectedItem.targetMarginalRoas}x − {selectedItem.sourceRoas.toFixed(2)}x) = +{formatINR(selectedItem.netRevenueLift)}
                      </span>
                    </div>
                    <div className='grid grid-cols-2 gap-2 text-[10px] font-mono'>
                      <div>
                        <span className='text-[#737373] block'>Source ID:</span>
                        <span className='text-neutral-300'>{selectedItem.sourceCampaign}</span>
                      </div>
                      <div>
                        <span className='text-[#737373] block'>Destination ID:</span>
                        <span className='text-neutral-300'>{selectedItem.targetCampaign}</span>
                      </div>
                    </div>
                    <div className='text-[10px] text-[#737373] leading-relaxed'>
                      Assumptions: Destination marginal ROAS calculated at 85% of baseline ROAS (diminishing marginal returns); destination expansion capped at +50% of current spend.
                    </div>
                  </div>
                </details>

                {/* Action Buttons */}
                <div className='flex items-center justify-end gap-3 pt-4 border-t border-[#1F1F1F]'>
                  <button
                    type='button'
                    onClick={() => setSelectedItem(null)}
                    className='px-4 py-2.5 rounded-lg border border-[#262626] bg-[#141414] text-xs font-semibold text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    onClick={() => setModalStep(2)}
                    className='px-5 py-2.5 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
                  >
                    Move {formatINR(selectedItem.movedAmount)}
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
              <div className='space-y-6 my-auto py-4'>
                {/* Green Banner: Moved at HH:MM */}
                <div className='rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-4 flex items-center justify-between'>
                  <div className='flex items-center gap-2.5'>
                    <div className='size-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold'>
                      ✓
                    </div>
                    <div>
                      <span className='text-xs font-bold text-emerald-300 uppercase tracking-wider'>
                        Moved at {new Date().toTimeString().slice(0, 5)}
                      </span>
                      <p className='text-[11px] text-emerald-400/80'>
                        Added to Decision Ledger
                      </p>
                    </div>
                  </div>
                  <span className='text-[10px] font-mono text-emerald-400 bg-emerald-900/50 px-2.5 py-1 rounded border border-emerald-700/60 uppercase font-bold'>
                    Moved {formatINR(selectedItem.movedAmount)}
                  </span>
                </div>

                {/* The two before -> after lines */}
                <div className='rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 space-y-3 text-xs'>
                  <span className='text-[10px] uppercase font-bold tracking-wider text-[#A3A3A3] block'>
                    Updated Allocations
                  </span>
                  <div className='space-y-2.5'>
                    <div className='flex items-center justify-between'>
                      <span className='text-neutral-300 font-semibold'>{selectedItem.sourceProductName}</span>
                      <span className='font-mono'>
                        <span className='text-[#737373] line-through'>{formatINR(selectedItem.sourceSpendBefore)}</span>{' '}
                        → <span className='text-white font-bold'>{formatINR(selectedItem.sourceSpendAfter)}</span>
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-neutral-300 font-semibold'>{selectedItem.targetProductName}</span>
                      <span className='font-mono'>
                        <span className='text-[#737373] line-through'>{formatINR(selectedItem.targetSpendBefore)}</span>{' '}
                        → <span className='text-emerald-400 font-bold'>{formatINR(selectedItem.targetSpendAfter)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Note that outcomes are projections measured over 7 days */}
                <div className='flex items-center gap-2 text-[11px] text-[#737373] bg-[#0F0F0F] p-3 rounded border border-[#1F1F1F]'>
                  <Icons.info className='size-3.5 text-[#A3A3A3] shrink-0' />
                  <span>Outcomes are projections measured over 7 days.</span>
                </div>

                {/* Close Button */}
                <div className='flex items-center justify-end pt-4 border-t border-[#1F1F1F]'>
                  <button
                    type='button'
                    onClick={() => setSelectedItem(null)}
                    className='px-5 py-2.5 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
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
        <div className='fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200'>
          {/* Backdrop Click */}
          <div
            className='fixed inset-0'
            onClick={() => {
              if (executeAllState !== 'executing') setExecuteAllState(null);
            }}
          />

          {/* Right-Side Drawer: width min(560px, 100vw), padding 32px, 28px gap */}
          <div
            className='relative z-10 h-full w-full max-w-[min(560px,100vw)] bg-[#0A0A0A] border-l border-[#262626] p-8 overflow-y-auto overflow-x-hidden font-mono shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 text-white'
            onClick={(e) => e.stopPropagation()}
            role='dialog'
            aria-modal='true'
          >
            {/* Header */}
            <div className='flex items-start justify-between border-b border-[#1F1F1F] pb-5'>
              <div className='min-w-0 pr-4'>
                <h3 className='text-base font-bold text-white uppercase tracking-tight'>
                  Move all budgets
                </h3>
                <p className='text-xs text-[#A3A3A3] mt-1'>
                  {reallocations.length} pending capital moves queued
                </p>
              </div>
              {executeAllState !== 'executing' && (
                <button
                  type='button'
                  onClick={() => setExecuteAllState(null)}
                  className='size-8 rounded-lg flex items-center justify-center text-[#737373] hover:text-white hover:bg-[#1A1A1A] transition-colors shrink-0'
                  aria-label='Close drawer'
                >
                  ✕
                </button>
              )}
            </div>

            {/* PREVIEW STEP */}
            {executeAllState === 'preview' && (
              <div className='space-y-7 my-auto py-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='rounded-lg border border-[#262626] bg-[#141414] p-4'>
                    <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold block'>
                      Total Capital Moved
                    </span>
                    <span className='text-xl font-bold text-white mt-1 block font-mono'>
                      {formatINR(totalMovedAll)}
                    </span>
                  </div>
                  <div className='rounded-lg border border-[#262626] bg-[#141414] p-4'>
                    <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold block'>
                      Total Expected Gain
                    </span>
                    <span className='text-xl font-bold text-emerald-400 mt-1 block font-mono'>
                      +{formatINR(totalLiftAll)}
                    </span>
                  </div>
                </div>

                <div className='rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 space-y-2'>
                  <span className='text-[10px] uppercase font-bold tracking-wider text-[#A3A3A3] block'>
                    Pending Reallocations ({reallocations.length})
                  </span>
                  <div className='space-y-2 max-h-64 overflow-y-auto pr-1 text-xs'>
                    {reallocations.map((it) => (
                      <div key={it.id} className='rounded border border-[#262626] bg-[#0F0F0F] p-3 flex items-center justify-between'>
                        <div className='min-w-0 pr-2'>
                          <span className='text-white font-semibold truncate block'>
                            {it.sourceProductName} → {it.targetProductName}
                          </span>
                          <span className='text-[11px] text-[#737373]'>
                            Move {formatINR(it.movedAmount)} · Gain +{formatINR(it.netRevenueLift)}
                          </span>
                        </div>
                        <span className='text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 shrink-0'>
                          {it.confidence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='flex items-center justify-end gap-3 pt-4 border-t border-[#1F1F1F]'>
                  <button
                    type='button'
                    onClick={() => setExecuteAllState(null)}
                    className='px-4 py-2.5 rounded-lg border border-[#262626] bg-[#141414] text-xs font-semibold text-[#A3A3A3] hover:text-white transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    onClick={handleConfirmExecuteAll}
                    className='px-5 py-2.5 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
                  >
                    Move All Budget ({reallocations.length} Actions)
                  </button>
                </div>
              </div>
            )}

            {/* EXECUTING STEP */}
            {executeAllState === 'executing' && (
              <div className='py-12 space-y-6 text-center my-auto'>
                <div className='size-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto' />
                <div>
                  <h4 className='text-sm font-bold text-white uppercase tracking-wider'>
                    Moving All Budgets Sequentially
                  </h4>
                  <p className='text-xs text-[#737373] mt-1'>
                    Applying action {executeAllProgress.current} of {executeAllProgress.total}...
                  </p>
                </div>

                <div className='w-full bg-[#1F1F1F] rounded-full h-2 overflow-hidden'>
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
              <div className='space-y-6 my-auto py-4'>
                <div className='rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-4 flex items-center justify-between'>
                  <div className='flex items-center gap-2.5'>
                    <div className='size-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold'>
                      ✓
                    </div>
                    <div>
                      <span className='text-xs font-bold text-emerald-300 uppercase tracking-wider'>
                        Batch Done at {new Date().toTimeString().slice(0, 5)}
                      </span>
                      <p className='text-[11px] text-emerald-400/80'>
                        {executeAllSummary.count} reallocations executed and logged to Decision Ledger
                      </p>
                    </div>
                  </div>
                  <span className='text-[10px] font-mono text-emerald-400 bg-emerald-900/50 px-2.5 py-1 rounded border border-emerald-700/60 uppercase font-bold'>
                    Batch Done
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='rounded-lg border border-[#262626] bg-[#141414] p-4'>
                    <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold block'>
                      Total Capital Moved
                    </span>
                    <span className='text-xl font-bold text-white mt-1 block font-mono'>
                      {formatINR(executeAllSummary.totalMoved)}
                    </span>
                  </div>
                  <div className='rounded-lg border border-[#262626] bg-[#141414] p-4'>
                    <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold block'>
                      Total Projected Lift
                    </span>
                    <span className='text-xl font-bold text-emerald-400 mt-1 block font-mono'>
                      +{formatINR(executeAllSummary.totalLift)}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-2 text-[11px] text-[#737373] bg-[#0F0F0F] p-3 rounded border border-[#1F1F1F]'>
                  <Icons.info className='size-3.5 text-[#A3A3A3] shrink-0' />
                  <span>Outcomes are algorithmic projections modeled over a 7-day calibration window.</span>
                </div>

                <div className='flex items-center justify-end pt-4 border-t border-[#1F1F1F]'>
                  <button
                    type='button'
                    onClick={() => setExecuteAllState(null)}
                    className='px-5 py-2.5 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
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
