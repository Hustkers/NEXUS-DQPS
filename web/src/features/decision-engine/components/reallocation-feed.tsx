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
    <div className={cn('rounded-xl border border-border bg-card p-5 shadow-none text-card-foreground font-mono', className)}>
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
        <div className='space-y-2.5'>
          {reallocations.map((item) => {
            const isKill = item.actionTag === 'PAUSE';
            const srcMeta = getChannelMeta(item.sourceChannel);
            const tgtMeta = getChannelMeta(item.targetChannel);

            return (
              <div
                key={item.id}
                className={cn(
                  'flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border p-3.5 transition-all',
                  isKill
                    ? 'border-red-900/60 bg-red-950/20 hover:border-red-700/80'
                    : 'border-border bg-background hover:border-foreground/30'
                )}
              >
                {/* Route & Flow */}
                <div className='flex-1 min-w-0 space-y-1.5'>
                  {/* Line 1: Action Tag, Source -> Destination, Reason, Confidence */}
                  <div className='flex items-center gap-2 text-xs flex-wrap'>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider',
                        item.actionTag === 'PAUSE'
                          ? 'bg-red-500 text-black'
                          : item.actionTag === 'REDIRECT'
                          ? 'bg-amber-500 text-black'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      [{item.actionTag}]
                    </span>

                    {/* Source: Product · Channel */}
                    <span className='font-semibold text-foreground flex items-center gap-1.5'>
                      <PlatformLogo platform={srcMeta.name.toLowerCase()} size={12} className='shrink-0' />
                      <span>{item.sourceProductName}</span>
                      <span className='text-[11px] text-muted-foreground'>({srcMeta.name})</span>
                      <span className='text-[10px] text-muted-foreground/60 font-mono'>#{item.sourceCampaign}</span>
                    </span>

                    <Icons.arrowRight className='size-3 text-muted-foreground shrink-0' />

                    {/* Destination: Product · Channel */}
                    <span className='font-bold text-foreground flex items-center gap-1.5'>
                      <PlatformLogo platform={tgtMeta.name.toLowerCase()} size={12} className='shrink-0' />
                      <span>{item.targetProductName}</span>
                      <span className='text-[11px] text-muted-foreground'>({tgtMeta.name})</span>
                    </span>

                    <span className='text-muted-foreground text-[11px] ml-auto md:ml-0 font-medium'>
                      {item.confidence}% conf
                    </span>
                  </div>

                  {/* Line 2: Real numbers with before -> after */}
                  <div className='flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap'>
                    <span>
                      Spend <span className='text-foreground'>{formatINR(item.sourceSpendBefore)}</span> →{' '}
                      <span className='font-bold text-foreground'>
                        {formatINR(item.sourceSpendAfter)}
                      </span>{' '}
                      <span className='text-amber-400 font-semibold'>
                        (−{formatINR(item.movedAmount)})
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      Net lift <span className='text-emerald-400 font-bold'>+{formatINR(item.netRevenueLift)}</span>
                    </span>
                    <span>•</span>
                    <span>
                      Dest. ROAS <span className='text-foreground font-semibold'>{item.targetRoas.toFixed(2)}x</span>
                    </span>
                  </div>

                  {/* One-Line Reason */}
                  <div className='text-[11px] text-muted-foreground'>
                    <span>Reason: {item.reason}</span>
                  </div>
                </div>

                {/* Execution Button */}
                <div className='shrink-0 flex items-center gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleOpenReview(item)}
                    className='h-8 text-xs font-mono border border-border bg-card hover:bg-muted text-foreground font-bold active:scale-[0.98]'
                  >
                    Execute
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* THREE-STEP MODAL FOR SINGLE REALLOCATION */}
      {selectedItem && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150'
          onClick={() => {
            if (modalStep !== 2) setSelectedItem(null);
          }}
          role='dialog'
          aria-modal='true'
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='relative w-full max-w-xl rounded-xl border border-[#262626] bg-[#0A0A0A] p-6 text-white shadow-2xl font-mono'
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-[#1F1F1F] pb-4 mb-4'>
              <div>
                <h3 className='text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2'>
                  <span>[{selectedItem.actionTag}] Capital Reallocation Protocol</span>
                </h3>
                <p className='text-[11px] text-[#737373] mt-0.5'>
                  Shift {formatINR(selectedItem.movedAmount)} from {selectedItem.sourceProductName} to {selectedItem.targetProductName}
                </p>
              </div>
              {modalStep !== 2 && (
                <button
                  onClick={() => setSelectedItem(null)}
                  className='size-7 rounded flex items-center justify-center text-[#737373] hover:text-white hover:bg-[#1A1A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                >
                  ✕
                </button>
              )}
            </div>

            {/* STEP 1: REVIEW */}
            {modalStep === 1 && (
              <div className='space-y-4'>
                {/* Issue Banner */}
                <div className='rounded-lg border border-amber-900/60 bg-amber-950/30 p-3.5 flex items-start gap-3'>
                  <div className='size-2.5 rounded-full bg-amber-400 mt-1.5 shrink-0 animate-pulse' />
                  <div>
                    <span className='text-[10px] uppercase font-bold tracking-wider text-amber-400 block'>
                      Reallocation Opportunity
                    </span>
                    <p className='text-xs font-semibold text-white mt-0.5'>
                      {selectedItem.reason}
                    </p>
                  </div>
                </div>

                {/* Evidence Bullets */}
                <div className='rounded-lg border border-[#1F1F1F] bg-[#121212] p-3.5 space-y-2'>
                  <span className='text-[10px] uppercase font-bold tracking-wider text-[#A3A3A3] block'>
                    Telemetry Evidence
                  </span>
                  <ul className='space-y-1.5 text-xs text-[#D4D4D4]'>
                    <li className='flex items-start gap-2'>
                      <span className='text-amber-400 font-bold'>›</span>
                      <span>Source current spend: {formatINR(selectedItem.sourceSpendBefore)} generating {selectedItem.sourceRoas.toFixed(2)}x ROAS.</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='text-emerald-400 font-bold'>›</span>
                      <span>Destination capacity: {selectedItem.targetProductName} ({selectedItem.targetChannel}) at {selectedItem.targetRoas.toFixed(2)}x ROAS.</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='text-emerald-400 font-bold'>›</span>
                      <span>Destination marginal efficiency (85% yield): {selectedItem.targetMarginalRoas.toFixed(3)}x ROAS.</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='text-emerald-400 font-bold'>›</span>
                      <span>Net daily margin uplift: +{formatINR(selectedItem.netRevenueLift)} ({selectedItem.confidence}% algorithmic confidence).</span>
                    </li>
                  </ul>
                </div>

                {/* What This Will Do (3 actions) */}
                <div className='space-y-2.5'>
                  <span className='text-[10px] uppercase font-bold tracking-wider text-[#A3A3A3] block'>
                    What This Will Do
                  </span>
                  <div className='space-y-2'>
                    {/* Action 1 */}
                    <div className='rounded-lg border border-[#262626] bg-[#141414] p-3'>
                      <span className='text-xs font-semibold text-white block mb-1'>
                        1. Throttle / Pause Source Spend ({selectedItem.sourceProductName})
                      </span>
                      <div className='flex items-center gap-2 text-xs'>
                        <span className='line-through text-[#737373]'>{formatINR(selectedItem.sourceSpendBefore)}</span>
                        <span>→</span>
                        <span className='text-emerald-400 font-bold'>{formatINR(selectedItem.sourceSpendAfter)}</span>
                      </div>
                    </div>
                    {/* Action 2 */}
                    <div className='rounded-lg border border-[#262626] bg-[#141414] p-3'>
                      <span className='text-xs font-semibold text-white block mb-1'>
                        2. Scale Budget on High-Yield Campaign ({selectedItem.targetProductName})
                      </span>
                      <div className='flex items-center gap-2 text-xs'>
                        <span className='line-through text-[#737373]'>{formatINR(selectedItem.targetSpendBefore)}</span>
                        <span>→</span>
                        <span className='text-emerald-400 font-bold'>{formatINR(selectedItem.targetSpendAfter)}</span>
                      </div>
                    </div>
                    {/* Action 3 */}
                    <div className='rounded-lg border border-[#262626] bg-[#141414] p-3'>
                      <span className='text-xs font-semibold text-white block mb-1'>
                        3. Harvest Net Incremental Revenue
                      </span>
                      <div className='flex items-center gap-2 text-xs'>
                        <span className='line-through text-[#737373]'>₹0/day uplift</span>
                        <span>→</span>
                        <span className='text-emerald-400 font-bold'>+{formatINR(selectedItem.netRevenueLift)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className='flex items-center justify-end gap-3 pt-4 border-t border-[#1F1F1F]'>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className='px-4 py-2 rounded-lg border border-[#262626] bg-[#141414] text-xs font-semibold text-[#A3A3A3] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setModalStep(2)}
                    className='px-5 py-2 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
                  >
                    Execute Reallocation
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: EXECUTING */}
            {modalStep === 2 && (
              <div className='py-6 space-y-6 text-center'>
                <div className='flex flex-col items-center justify-center gap-2'>
                  <div className='size-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin' />
                  <h4 className='text-sm font-bold text-white uppercase tracking-wider mt-2'>
                    Dispatching Reallocation Directives
                  </h4>
                  <p className='text-xs text-[#737373]'>
                    Calibrating DSP pacing and dispatching budget shift...
                  </p>
                </div>

                <div className='space-y-3 text-left max-w-md mx-auto'>
                  {[
                    `Throttle ${selectedItem.sourceProductName} spend to ${formatINR(selectedItem.sourceSpendAfter)}`,
                    `Scale ${selectedItem.targetProductName} spend to ${formatINR(selectedItem.targetSpendAfter)}`,
                    `Confirm +${formatINR(selectedItem.netRevenueLift)} net yield capture in ledger`,
                  ].map((stepDesc, idx) => {
                    const isDone = idx < executingStepIndex;
                    const isCurrent = idx === executingStepIndex;
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'flex items-center justify-between rounded-lg border p-3 transition-all',
                          isDone
                            ? 'border-emerald-800/60 bg-emerald-950/20'
                            : isCurrent
                            ? 'border-white/40 bg-[#171717]'
                            : 'border-[#1F1F1F] bg-[#0F0F0F] opacity-50'
                        )}
                      >
                        <div className='flex items-center gap-3 min-w-0'>
                          {isDone ? (
                            <div className='size-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-bold'>
                              ✓
                            </div>
                          ) : isCurrent ? (
                            <div className='size-5 rounded-full border-2 border-white border-t-transparent animate-spin' />
                          ) : (
                            <div className='size-5 rounded-full border border-[#404040] text-[10px] text-[#737373] flex items-center justify-center'>
                              {idx + 1}
                            </div>
                          )}
                          <span className={cn('text-xs font-semibold truncate', isDone ? 'text-emerald-300' : isCurrent ? 'text-white' : 'text-[#737373]')}>
                            {stepDesc}
                          </span>
                        </div>
                        <span className='text-[10px] text-[#8A8A8A] font-mono shrink-0'>
                          {isDone ? 'Done' : isCurrent ? 'Dispatching...' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: RESULT */}
            {modalStep === 3 && (
              <div className='space-y-4'>
                {/* Green Done Banner */}
                <div className='rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-3.5 flex items-center justify-between'>
                  <div className='flex items-center gap-2.5'>
                    <div className='size-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold'>
                      ✓
                    </div>
                    <div>
                      <span className='text-xs font-bold text-emerald-300 uppercase tracking-wider'>
                        Done at {new Date().toTimeString().slice(0, 5)}
                      </span>
                      <p className='text-[11px] text-emerald-400/80'>
                        Reallocation active across channels &amp; logged to Decision Ledger
                      </p>
                    </div>
                  </div>
                  <span className='text-[10px] font-mono text-emerald-400 bg-emerald-900/50 px-2.5 py-1 rounded border border-emerald-700/60 uppercase font-bold'>
                    Executed
                  </span>
                </div>

                {/* 3 Result Tiles */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5'>
                  <div className='rounded-lg border border-[#262626] bg-[#141414] p-3'>
                    <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold block mb-1'>
                      Capital Shifted
                    </span>
                    <div className='text-[11px] text-[#737373] line-through font-mono'>₹0/day</div>
                    <div className='text-xs font-bold text-emerald-400 font-mono'>{formatINR(selectedItem.movedAmount)}</div>
                  </div>

                  <div className='rounded-lg border border-[#262626] bg-[#141414] p-3'>
                    <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold block mb-1'>
                      Net Revenue Lift
                    </span>
                    <div className='text-[11px] text-[#737373] line-through font-mono'>₹0/day</div>
                    <div className='text-xs font-bold text-emerald-400 font-mono'>+{formatINR(selectedItem.netRevenueLift)}</div>
                  </div>

                  <div className='rounded-lg border border-[#262626] bg-[#141414] p-3'>
                    <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold block mb-1'>
                      Effective Yield
                    </span>
                    <div className='text-[11px] text-[#737373] line-through font-mono'>{selectedItem.sourceRoas.toFixed(2)}x</div>
                    <div className='text-xs font-bold text-emerald-400 font-mono'>{selectedItem.targetMarginalRoas.toFixed(3)}x ROAS</div>
                  </div>
                </div>

                {/* What Changed List */}
                <div className='rounded-lg border border-[#1F1F1F] bg-[#121212] p-3.5 space-y-2 text-xs'>
                  <span className='text-[10px] uppercase font-bold tracking-wider text-[#A3A3A3] block'>
                    What Changed
                  </span>
                  <div className='border-b border-[#1F1F1F] pb-2'>
                    <span className='font-semibold text-white'>Source Spend: {selectedItem.sourceProductName}</span>
                    <div className='flex items-center gap-2 mt-0.5 text-[11px]'>
                      <span className='line-through text-[#737373]'>{formatINR(selectedItem.sourceSpendBefore)}</span>
                      <span>→</span>
                      <span className='text-emerald-400 font-semibold'>{formatINR(selectedItem.sourceSpendAfter)}</span>
                    </div>
                  </div>
                  <div>
                    <span className='font-semibold text-white'>Destination Spend: {selectedItem.targetProductName}</span>
                    <div className='flex items-center gap-2 mt-0.5 text-[11px]'>
                      <span className='line-through text-[#737373]'>{formatINR(selectedItem.targetSpendBefore)}</span>
                      <span>→</span>
                      <span className='text-emerald-400 font-semibold'>{formatINR(selectedItem.targetSpendAfter)}</span>
                    </div>
                  </div>
                </div>

                {/* 7-day projection note */}
                <div className='flex items-center gap-2 text-[11px] text-[#737373] bg-[#0F0F0F] p-2.5 rounded border border-[#1F1F1F]'>
                  <Icons.info className='size-3.5 text-[#A3A3A3] shrink-0' />
                  <span>Outcomes are algorithmic projections modeled over a 7-day calibration window.</span>
                </div>

                <div className='flex items-center justify-end pt-3 border-t border-[#1F1F1F]'>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className='px-5 py-2 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXECUTE ALL FLOW MODAL */}
      {executeAllState && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150'
          onClick={() => {
            if (executeAllState !== 'executing') setExecuteAllState(null);
          }}
          role='dialog'
          aria-modal='true'
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='relative w-full max-w-xl rounded-xl border border-[#262626] bg-[#0A0A0A] p-6 text-white shadow-2xl font-mono'
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-[#1F1F1F] pb-4 mb-4'>
              <div>
                <h3 className='text-sm font-bold text-white uppercase tracking-tight'>
                  Autonomous Batch Execution Protocol
                </h3>
                <p className='text-[11px] text-[#737373] mt-0.5'>
                  {reallocations.length} pending capital reallocations queued
                </p>
              </div>
              {executeAllState !== 'executing' && (
                <button
                  onClick={() => setExecuteAllState(null)}
                  className='size-7 rounded flex items-center justify-center text-[#737373] hover:text-white hover:bg-[#1A1A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                >
                  ✕
                </button>
              )}
            </div>

            {/* PREVIEW STEP */}
            {executeAllState === 'preview' && (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='rounded-lg border border-[#262626] bg-[#141414] p-3'>
                    <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold block'>
                      Combined Capital Moved
                    </span>
                    <span className='text-lg font-bold text-white mt-1 block font-mono'>
                      {formatINR(totalMovedAll)}
                    </span>
                  </div>
                  <div className='rounded-lg border border-[#262626] bg-[#141414] p-3'>
                    <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold block'>
                      Combined Net Revenue Lift
                    </span>
                    <span className='text-lg font-bold text-emerald-400 mt-1 block font-mono'>
                      +{formatINR(totalLiftAll)}
                    </span>
                  </div>
                </div>

                <div className='rounded-lg border border-[#1F1F1F] bg-[#121212] p-3.5 space-y-2'>
                  <span className='text-[10px] uppercase font-bold tracking-wider text-[#A3A3A3] block'>
                    Pending Reallocations ({reallocations.length})
                  </span>
                  <div className='space-y-2 max-h-56 overflow-y-auto pr-1 text-xs'>
                    {reallocations.map((it) => (
                      <div key={it.id} className='rounded border border-[#262626] bg-[#0F0F0F] p-2.5 flex items-center justify-between'>
                        <div className='min-w-0'>
                          <span className='text-white font-semibold truncate block'>
                            {it.sourceProductName} → {it.targetProductName}
                          </span>
                          <span className='text-[11px] text-[#737373]'>
                            Moved {formatINR(it.movedAmount)} · Net lift +{formatINR(it.netRevenueLift)}
                          </span>
                        </div>
                        <span className='text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40'>
                          {it.confidence}% conf
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='flex items-center justify-end gap-3 pt-4 border-t border-[#1F1F1F]'>
                  <button
                    onClick={() => setExecuteAllState(null)}
                    className='px-4 py-2 rounded-lg border border-[#262626] bg-[#141414] text-xs font-semibold text-[#A3A3A3] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmExecuteAll}
                    className='px-5 py-2 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
                  >
                    Execute All ({reallocations.length} Actions)
                  </button>
                </div>
              </div>
            )}

            {/* EXECUTING STEP */}
            {executeAllState === 'executing' && (
              <div className='py-8 space-y-6 text-center'>
                <div className='size-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto' />
                <div>
                  <h4 className='text-sm font-bold text-white uppercase tracking-wider'>
                    Executing Reallocations Sequentially
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
              <div className='space-y-4'>
                <div className='rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-4 flex items-center justify-between'>
                  <div className='flex items-center gap-2.5'>
                    <div className='size-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold'>
                      ✓
                    </div>
                    <div>
                      <span className='text-xs font-bold text-emerald-300 uppercase tracking-wider'>
                        Batch Execution Complete at {new Date().toTimeString().slice(0, 5)}
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
                  <div className='rounded-lg border border-[#262626] bg-[#141414] p-3'>
                    <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold block'>
                      Total Capital Moved
                    </span>
                    <span className='text-lg font-bold text-white mt-1 block font-mono'>
                      {formatINR(executeAllSummary.totalMoved)}
                    </span>
                  </div>
                  <div className='rounded-lg border border-[#262626] bg-[#141414] p-3'>
                    <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold block'>
                      Total Projected Lift
                    </span>
                    <span className='text-lg font-bold text-emerald-400 mt-1 block font-mono'>
                      +{formatINR(executeAllSummary.totalLift)}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-2 text-[11px] text-[#737373] bg-[#0F0F0F] p-2.5 rounded border border-[#1F1F1F]'>
                  <Icons.info className='size-3.5 text-[#A3A3A3] shrink-0' />
                  <span>Outcomes are algorithmic projections modeled over a 7-day calibration window.</span>
                </div>

                <div className='flex items-center justify-end pt-3 border-t border-[#1F1F1F]'>
                  <button
                    onClick={() => setExecuteAllState(null)}
                    className='px-5 py-2 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
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
