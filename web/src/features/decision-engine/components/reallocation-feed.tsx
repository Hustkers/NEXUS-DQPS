'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/icons';
import { useDecisionEngine } from '@/context/decision-engine-store';
import { formatINR, type ReallocationItem as EngineReallocationItem } from '@/lib/gauges-engine';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  timestamp?: string;
}

export type ReallocationItem = EngineReallocationItem | LegacyReallocationItem;

export interface ReallocationFeedProps {
  initialItems?: any;
  campaigns?: any;
  onExecuteReallocation?: (item: any, details?: any) => void;
  className?: string;
}

export function ReallocationFeed({ className }: ReallocationFeedProps = {}) {
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

    const tickInterval = prefersReducedMotion ? 50 : 650;

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
    for (let i = 1; i <= total; i++) {
      setExecuteAllProgress({ current: i, total });
      if (!prefersReducedMotion) {
        await new Promise((res) => setTimeout(res, 450));
      }
    }

    const res = await executeAllReallocations();
    setExecuteAllSummary(res);
    setExecuteAllState('result');
    toast.success('All pending budget reallocations executed synchronously');
  };

  const totalMovedAll = reallocations.reduce((acc, it) => acc + it.movedAmount, 0);
  const totalLiftAll = reallocations.reduce((acc, it) => acc + it.netRevenueLift, 0);

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs text-card-foreground font-mono min-w-0 max-w-full space-y-4', className)}>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3'>
        <div className='flex items-center gap-2'>
          <Icons.adjustments className='size-4 text-primary' />
          <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
            Decision Feed
          </h3>
          <span className='px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold'>
            {reallocations.length} pending
          </span>
        </div>

        <div className='flex items-center gap-3'>
          {/* Auto-Pilot Toggle */}
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span className={cn(autoPilot && 'text-emerald-500 font-bold')}>Auto-Pilot</span>
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
            className='h-7 px-3 text-xs font-mono bg-foreground hover:bg-foreground/90 text-background font-bold uppercase tracking-wider rounded-lg shadow-sm active:scale-[0.98]'
          >
            Execute All
          </Button>
        </div>
      </div>

      {/* Streamlined Decision Feed: TIME | PRODUCT | ISSUE | ACTION | OUTCOME */}
      {reallocations.length === 0 ? (
        <div className='rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center space-y-1'>
          <Icons.check className='size-5 text-emerald-500 mx-auto' />
          <p className='text-xs font-bold text-foreground uppercase tracking-wider'>
            All Decisions Executed
          </p>
          <p className='text-[10px] text-muted-foreground'>
            Zero pending budget imbalance across channels.
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {/* Column Header */}
          <div className='hidden md:grid grid-cols-12 gap-3 px-3 py-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider border-b border-border/50'>
            <span className='col-span-1'>Time</span>
            <span className='col-span-3'>Product</span>
            <span className='col-span-3'>Issue</span>
            <span className='col-span-3'>Action</span>
            <span className='col-span-2 text-right'>Outcome</span>
          </div>

          {reallocations.map((item, idx) => {
            const isKill = item.actionTag === 'PAUSE';
            const isRedirect = item.actionTag === 'REDIRECT';

            const timeStr = (item as any).timestamp || `03:${(17 + idx * 4).toString().padStart(2, '0')}`;
            const issueStr = isKill
              ? '⚠ OUT OF STOCK'
              : isRedirect
              ? '⚡ BID SURGE'
              : '📉 ROAS DECAY';
            const issueBadgeColor = isKill
              ? 'text-rose-500 bg-rose-500/10 border-rose-500/30'
              : isRedirect
              ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
              : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';

            const actionStr = isKill
              ? 'Pause campaign → Reallocate 80%'
              : isRedirect
              ? `Redirect spend → ${item.targetChannel}`
              : 'Trim spend → Maximize yield';

            return (
              <div
                key={item.id}
                className='p-3 rounded-lg border border-border/80 bg-card/60 hover:bg-card hover:border-border transition-colors flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-3 items-start md:items-center text-xs'
              >
                {/* 1. TIME */}
                <div className='col-span-1 text-[11px] font-mono text-muted-foreground font-semibold'>
                  {timeStr}
                </div>

                {/* 2. PRODUCT */}
                <div className='col-span-3 min-w-0'>
                  <div className='font-bold text-foreground truncate'>
                    {item.sourceProductName}
                  </div>
                  <div className='text-[10px] text-muted-foreground font-normal truncate'>
                    {item.sourceChannel}
                  </div>
                </div>

                {/* 3. ISSUE */}
                <div className='col-span-3'>
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 font-mono', issueBadgeColor)}>
                    {issueStr}
                  </span>
                </div>

                {/* 4. ACTION */}
                <div className='col-span-3 font-mono text-[11px] text-foreground font-medium'>
                  <div>{actionStr.split('→')[0].trim()}</div>
                  <div className='text-emerald-400 font-semibold text-[10px]'>
                    → {actionStr.split('→')[1]?.trim() || 'Reallocate'}
                  </div>
                </div>

                {/* 5. OUTCOME & BUTTON */}
                <div className='col-span-2 w-full flex md:flex-col items-center md:items-end justify-between gap-1.5'>
                  <div className='text-emerald-400 font-bold font-mono text-xs whitespace-nowrap'>
                    +{formatINR(item.netRevenueLift)}/day
                  </div>
                  <Button
                    size='sm'
                    onClick={() => handleOpenReview(item)}
                    className='h-6 px-2.5 text-[10px] font-mono bg-foreground hover:bg-foreground/90 text-background font-bold uppercase tracking-wider rounded shadow-xs'
                  >
                    Review &amp; Move
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
          <div
            className='fixed inset-0'
            onClick={() => {
              if (modalStep !== 2) setSelectedItem(null);
            }}
          />

          <div
            className='relative z-10 h-full w-full max-w-[min(560px,100vw)] bg-card border-l border-border p-6 sm:p-8 overflow-y-auto overflow-x-hidden font-mono shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 text-card-foreground'
            onClick={(e) => e.stopPropagation()}
            role='dialog'
            aria-modal='true'
          >
            {/* Drawer Header */}
            <div className='flex items-start justify-between border-b border-border/80 pb-4'>
              <div className='min-w-0 pr-4'>
                <h3 className='text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
                  <Icons.adjustments className='size-4 text-primary' />
                  Execute Budget Directive
                </h3>
                <p className='text-xs text-muted-foreground mt-1 break-words leading-relaxed'>
                  {selectedItem.sourceProductName} ({selectedItem.sourceChannel}) →{' '}
                  {selectedItem.targetProductName} ({selectedItem.targetChannel})
                </p>
              </div>
              {modalStep !== 2 && (
                <button
                  type='button'
                  onClick={() => setSelectedItem(null)}
                  className='size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0'
                  aria-label='Close drawer'
                >
                  ✕
                </button>
              )}
            </div>

            {/* STEP 1: REVIEW */}
            {modalStep === 1 && (
              <div className='space-y-5 my-auto py-4'>
                <div className='rounded-xl border border-border bg-muted/30 py-5 px-4 text-center space-y-1'>
                  <div className='text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-mono'>
                    {formatINR(selectedItem.movedAmount)}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Capital diverted toward higher marginal return inventory
                  </p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div className='rounded-lg border border-border bg-muted/20 p-3.5 flex flex-col justify-between space-y-2'>
                    <div>
                      <span className='text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block'>
                        Source Channel
                      </span>
                      <div className='text-xs font-bold text-foreground mt-1 break-words'>
                        {selectedItem.sourceProductName} · {selectedItem.sourceChannel}
                      </div>
                      <div className='mt-2'>
                        <span className={cn(
                          'text-[9px] font-bold px-2 py-0.5 rounded border uppercase',
                          selectedItem.actionTag === 'PAUSE'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            : selectedItem.actionTag === 'REDIRECT'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-muted text-muted-foreground border-border'
                        )}>
                          {selectedItem.actionTag === 'PAUSE' ? 'PAUSE SPEND' : selectedItem.actionTag === 'REDIRECT' ? 'REDIRECT SPEND' : 'TRIM BUDGET'}
                        </span>
                      </div>
                    </div>
                    <div className='pt-2.5 border-t border-border/50 space-y-1 text-xs font-mono'>
                      <div className='text-muted-foreground text-[11px]'>
                        {formatINR(selectedItem.sourceSpendBefore)} → {formatINR(selectedItem.sourceSpendAfter)}
                      </div>
                      <div className='text-muted-foreground text-[10px]'>
                        ROAS {selectedItem.sourceRoas.toFixed(2)}x
                      </div>
                    </div>
                  </div>

                  <div className='rounded-lg border border-border bg-muted/20 p-3.5 flex flex-col justify-between space-y-2'>
                    <div>
                      <span className='text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block'>
                        Destination Channel
                      </span>
                      <div className='text-xs font-bold text-foreground mt-1 break-words'>
                        {selectedItem.targetProductName} · {selectedItem.targetChannel}
                      </div>
                      <div className='mt-2'>
                        <span className='text-[9px] font-bold px-2 py-0.5 rounded border uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'>
                          SCALE YIELD
                        </span>
                      </div>
                    </div>
                    <div className='pt-2.5 border-t border-border/50 space-y-1 text-xs font-mono'>
                      <div className='text-muted-foreground text-[11px]'>
                        {formatINR(selectedItem.targetSpendBefore)} → {formatINR(selectedItem.targetSpendAfter)}
                      </div>
                      <div className='text-emerald-600 dark:text-emerald-400 font-bold text-[10px]'>
                        ROAS {selectedItem.targetRoas.toFixed(2)}x
                      </div>
                    </div>
                  </div>
                </div>

                <div className='space-y-2.5 rounded-lg border border-border/80 bg-muted/20 p-4 text-xs'>
                  <div className='space-y-1'>
                    <span className='text-[10px] uppercase tracking-wider font-bold text-muted-foreground block'>
                      Algorithmic Rationale
                    </span>
                    <p className='text-foreground leading-relaxed break-words font-sans text-xs'>
                      {selectedItem.reason}
                    </p>
                  </div>
                  <div className='space-y-0.5 pt-2 border-t border-border/50'>
                    <span className='text-[10px] uppercase tracking-wider font-bold text-muted-foreground block'>
                      Projected Gain
                    </span>
                    <p className='text-emerald-600 dark:text-emerald-400 font-bold text-xs'>
                      +{formatINR(selectedItem.netRevenueLift)}/day revenue lift • {selectedItem.confidence}% Bayesian confidence
                    </p>
                  </div>
                </div>

                <details className='rounded-lg border border-border/60 bg-muted/10 p-3 text-xs group'>
                  <summary className='cursor-pointer text-muted-foreground hover:text-foreground font-medium flex items-center justify-between select-none'>
                    <span>Mathematical proof &amp; campaign lineage</span>
                    <span className='text-[10px] text-muted-foreground group-open:rotate-90 transition-transform'>▸</span>
                  </summary>
                  <div className='mt-2.5 space-y-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground'>
                    <div>
                      <span className='text-muted-foreground block text-[10px] uppercase font-bold'>Net Lift Formulation:</span>
                      <span className='font-mono text-foreground'>
                        {formatINR(selectedItem.movedAmount)} × ({selectedItem.targetMarginalRoas}x − {selectedItem.sourceRoas.toFixed(2)}x) = +{formatINR(selectedItem.netRevenueLift)}
                      </span>
                    </div>
                    <div className='grid grid-cols-2 gap-2 text-[10px] font-mono'>
                      <div>
                        <span className='text-muted-foreground block'>Source Campaign:</span>
                        <span className='text-foreground font-bold'>{selectedItem.sourceCampaign}</span>
                      </div>
                      <div>
                        <span className='text-muted-foreground block'>Destination Campaign:</span>
                        <span className='text-foreground font-bold'>{selectedItem.targetCampaign}</span>
                      </div>
                    </div>
                  </div>
                </details>

                <div className='flex items-center justify-end gap-2.5 pt-3 border-t border-border/70'>
                  <Button
                    variant='outline'
                    onClick={() => setSelectedItem(null)}
                    className='h-9 text-xs font-mono border-border'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setModalStep(2)}
                    className='h-9 px-5 bg-foreground hover:bg-foreground/90 text-background text-xs font-bold uppercase tracking-wider shadow-sm'
                  >
                    Confirm Move ({formatINR(selectedItem.movedAmount)})
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: EXECUTING */}
            {modalStep === 2 && (
              <div className='py-12 space-y-6 text-center my-auto'>
                <div className='size-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto' />
                <div className='space-y-1.5'>
                  <h4 className='text-sm font-bold text-foreground uppercase tracking-wider'>
                    Executing Reallocation Vector
                  </h4>
                  <p className='text-xs text-muted-foreground'>
                    {executingStepIndex === 0 && 'Validating convex bounds & margin constraints...'}
                    {executingStepIndex === 1 && 'Dispatching ad network reallocation API vector...'}
                    {executingStepIndex >= 2 && 'Committing immutable entry to Decision Ledger...'}
                  </p>
                </div>
                <div className='w-full max-w-xs mx-auto bg-muted rounded-full h-1.5 overflow-hidden'>
                  <div
                    className='bg-primary h-full transition-all duration-300'
                    style={{ width: `${((executingStepIndex + 1) / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: DONE */}
            {modalStep === 3 && (
              <div className='space-y-5 my-auto py-4'>
                <div className='rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center justify-between'>
                  <div className='flex items-center gap-2.5'>
                    <div className='size-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold'>
                      ✓
                    </div>
                    <div>
                      <span className='text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider'>
                        Executed at {new Date().toTimeString().slice(0, 5)}
                      </span>
                      <p className='text-[11px] text-emerald-600/80 dark:text-emerald-400/80'>
                        Committed to Decision Ledger
                      </p>
                    </div>
                  </div>
                  <span className='text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/30 uppercase font-bold'>
                    Moved {formatINR(selectedItem.movedAmount)}
                  </span>
                </div>

                <div className='rounded-lg border border-border bg-muted/20 p-4 space-y-2.5 text-xs'>
                  <span className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground block'>
                    Updated Active Allocations
                  </span>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-foreground font-semibold'>{selectedItem.sourceProductName}</span>
                      <span className='font-mono'>
                        <span className='text-muted-foreground line-through'>{formatINR(selectedItem.sourceSpendBefore)}</span>{' '}
                        → <span className='text-foreground font-bold'>{formatINR(selectedItem.sourceSpendAfter)}</span>
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-foreground font-semibold'>{selectedItem.targetProductName}</span>
                      <span className='font-mono'>
                        <span className='text-muted-foreground line-through'>{formatINR(selectedItem.targetSpendBefore)}</span>{' '}
                        → <span className='text-emerald-600 dark:text-emerald-400 font-bold'>{formatINR(selectedItem.targetSpendAfter)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-end pt-3 border-t border-border/70'>
                  <Button
                    onClick={() => setSelectedItem(null)}
                    className='h-9 px-5 bg-foreground hover:bg-foreground/90 text-background text-xs font-bold uppercase tracking-wider'
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RIGHT-SIDE DRAWER: EXECUTE ALL FLOW */}
      {executeAllState && (
        <div className='fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200'>
          <div
            className='fixed inset-0'
            onClick={() => {
              if (executeAllState !== 'executing') setExecuteAllState(null);
            }}
          />

          <div
            className='relative z-10 h-full w-full max-w-[min(560px,100vw)] bg-card border-l border-border p-6 sm:p-8 overflow-y-auto overflow-x-hidden font-mono shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 text-card-foreground'
            onClick={(e) => e.stopPropagation()}
            role='dialog'
            aria-modal='true'
          >
            <div className='flex items-start justify-between border-b border-border/80 pb-4'>
              <div className='min-w-0 pr-4'>
                <h3 className='text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
                  <Icons.check className='size-4 text-emerald-500' />
                  Execute All Budget Directives
                </h3>
                <p className='text-xs text-muted-foreground mt-1'>
                  {reallocations.length} pending capital rebalancing operations queued
                </p>
              </div>
              {executeAllState !== 'executing' && (
                <button
                  type='button'
                  onClick={() => setExecuteAllState(null)}
                  className='size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0'
                  aria-label='Close drawer'
                >
                  ✕
                </button>
              )}
            </div>

            {/* PREVIEW STEP */}
            {executeAllState === 'preview' && (
              <div className='space-y-5 my-auto py-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='rounded-xl border border-border bg-muted/20 p-3.5'>
                    <span className='text-[10px] text-muted-foreground uppercase font-semibold block'>
                      Total Capital Moved
                    </span>
                    <span className='text-xl font-extrabold text-foreground font-mono mt-1 block'>
                      {formatINR(totalMovedAll)}
                    </span>
                  </div>
                  <div className='rounded-xl border border-border bg-muted/20 p-3.5'>
                    <span className='text-[10px] text-muted-foreground uppercase font-semibold block'>
                      Net Revenue Lift
                    </span>
                    <span className='text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block'>
                      +{formatINR(totalLiftAll)}
                    </span>
                  </div>
                </div>

                <div className='space-y-2 rounded-xl border border-border bg-muted/20 p-4'>
                  <span className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground block'>
                    Queue Summary ({reallocations.length} Directives)
                  </span>
                  <div className='space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs'>
                    {reallocations.map((it) => (
                      <div key={it.id} className='flex items-center justify-between py-1 border-b border-border/40 last:border-b-0'>
                        <span className='text-foreground truncate max-w-[200px]'>
                          {it.sourceProductName} → {it.targetProductName}
                        </span>
                        <span className='font-mono font-bold text-foreground shrink-0'>
                          {formatINR(it.movedAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='flex items-center justify-end gap-2.5 pt-3 border-t border-border/70'>
                  <Button
                    variant='outline'
                    onClick={() => setExecuteAllState(null)}
                    className='h-9 text-xs font-mono border-border'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmExecuteAll}
                    className='h-9 px-5 bg-foreground hover:bg-foreground/90 text-background text-xs font-bold uppercase tracking-wider'
                  >
                    Execute All Now
                  </Button>
                </div>
              </div>
            )}

            {/* EXECUTING STEP */}
            {executeAllState === 'executing' && (
              <div className='py-12 space-y-6 text-center my-auto'>
                <div className='size-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto' />
                <div className='space-y-1.5'>
                  <h4 className='text-sm font-bold text-foreground uppercase tracking-wider'>
                    Executing Reallocations ({executeAllProgress.current} / {executeAllProgress.total})
                  </h4>
                  <p className='text-xs text-muted-foreground'>
                    Dispatching multi-channel API vectors and committing to ledger...
                  </p>
                </div>
                <div className='w-full max-w-xs mx-auto bg-muted rounded-full h-1.5 overflow-hidden'>
                  <div
                    className='bg-primary h-full transition-all duration-300'
                    style={{
                      width: `${(executeAllProgress.current / Math.max(executeAllProgress.total, 1)) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* RESULT STEP */}
            {executeAllState === 'result' && executeAllSummary && (
              <div className='space-y-5 my-auto py-4'>
                <div className='rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center space-y-2'>
                  <div className='size-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold mx-auto'>
                    ✓
                  </div>
                  <h4 className='text-sm font-bold text-foreground uppercase tracking-wider'>
                    All {executeAllSummary.count} Directives Successfully Executed
                  </h4>
                  <p className='text-xs text-emerald-600 dark:text-emerald-400 font-mono'>
                    +{formatINR(executeAllSummary.totalLift)}/day Net Revenue Lift Captured
                  </p>
                </div>

                <div className='flex items-center justify-end pt-3 border-t border-border/70'>
                  <Button
                    onClick={() => setExecuteAllState(null)}
                    className='h-9 px-5 bg-foreground hover:bg-foreground/90 text-background text-xs font-bold uppercase tracking-wider'
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
