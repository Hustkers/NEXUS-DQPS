'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { useDecisionEngine } from '@/context/decision-engine-store';
import { formatINR, type ActionPlan } from '@/lib/gauges-engine';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export interface ActionDrawerProps {
  actionId: string | null;
  isOpen: boolean;
  initialState?: 'review' | 'done';
  onClose: () => void;
  onViewLedger?: () => void;
}

export function ActionDrawer({
  actionId,
  isOpen,
  initialState = 'review',
  onClose,
  onViewLedger,
}: ActionDrawerProps) {
  const router = useRouter();
  const { buildPlan, executeAction, reallocations, executeAllReallocations } = useDecisionEngine();

  // Step states: 1 = Review, 2 = Running, 3 = Done, 4 = Error
  const [drawerState, setDrawerState] = useState<1 | 2 | 3 | 4>(
    initialState === 'done' ? 3 : 1
  );
  const [runningStepIndex, setRunningStepIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTimestamp, setExecutionTimestamp] = useState<string>('');

  // Execute-all progress tracking
  const [executeAllProgress, setExecuteAllProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [executeAllSummary, setExecuteAllSummary] = useState<{
    count: number;
    totalMoved: number;
    totalLift: number;
  } | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  const isExecuteAll = actionId === 'execute-all';

  // Build the plan purely from the current state
  const plan: ActionPlan | null = useMemo(() => {
    if (!actionId || isExecuteAll) return null;
    try {
      return buildPlan(actionId);
    } catch {
      return null;
    }
  }, [actionId, isExecuteAll, buildPlan]);

  // Aggregate stats for Execute All
  const totalMovedAll = useMemo(
    () => reallocations.reduce((sum, item) => sum + item.movedAmount, 0),
    [reallocations]
  );
  const totalLiftAll = useMemo(
    () => reallocations.reduce((sum, item) => sum + item.netRevenueLift, 0),
    [reallocations]
  );

  // Manage focus trap & restore
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
      setDrawerState(initialState === 'done' ? 3 : 1);
      setRunningStepIndex(0);
      setErrorMessage(null);
      setIsExecuting(false);

      const now = new Date();
      setExecutionTimestamp(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );

      // Focus drawer container
      requestAnimationFrame(() => {
        drawerRef.current?.focus();
      });
    } else {
      if (triggerElementRef.current) {
        triggerElementRef.current.focus();
      }
    }
  }, [isOpen, initialState, actionId]);

  // Keyboard navigation: Escape key closes drawer (unless executing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && drawerState !== 2) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, drawerState, onClose]);

  // Sequential execution timer for State 2 (Running)
  useEffect(() => {
    if (drawerState !== 2 || isExecuteAll || !plan) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stepInterval = prefersReducedMotion ? 50 : 700;
    const totalSteps = plan.steps.length;

    const timer = setInterval(() => {
      setRunningStepIndex((prev) => {
        if (prev < totalSteps - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          // Apply execution through the single executeAction engine
          executeAction(plan.actionId)
            .then(() => {
              const now = new Date();
              setExecutionTimestamp(
                `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
              );
              setTimeout(() => {
                setDrawerState(3);
                setIsExecuting(false);
              }, prefersReducedMotion ? 50 : 350);
            })
            .catch((err) => {
              setErrorMessage(
                err instanceof Error ? err.message : 'Execution failed. State left unchanged.'
              );
              setDrawerState(4);
              setIsExecuting(false);
            });
          return prev;
        }
      });
    }, stepInterval);

    return () => clearInterval(timer);
  }, [drawerState, isExecuteAll, plan, executeAction]);

  // Start single action execution
  const handleStartExecution = () => {
    if (isExecuting) return; // Prevent double-clicks
    setIsExecuting(true);
    setRunningStepIndex(0);
    setDrawerState(2);
  };

  // Start Execute All execution
  const handleStartExecuteAll = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setDrawerState(2);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const total = reallocations.length;
    for (let i = 1; i <= total; i++) {
      setExecuteAllProgress({ current: i, total });
      if (!prefersReducedMotion) {
        await new Promise((res) => setTimeout(res, 400));
      }
    }

    try {
      const summary = await executeAllReallocations();
      setExecuteAllSummary(summary);
      const now = new Date();
      setExecutionTimestamp(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );
      setDrawerState(3);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Execute All failed. State left unchanged.'
      );
      setDrawerState(4);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleNavigateToLedger = () => {
    onClose();
    if (onViewLedger) {
      onViewLedger();
    } else {
      router.push('/dashboard/ledger');
    }
  };

  if (!isOpen) return null;
  if (!isExecuteAll && !plan) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-xs animate-in fade-in duration-200'
      role='dialog'
      aria-modal='true'
      aria-labelledby='action-drawer-title'
    >
      {/* Backdrop click closes drawer */}
      <div
        className='fixed inset-0'
        onClick={() => {
          if (drawerState !== 2) onClose();
        }}
        aria-hidden='true'
      />

      {/* Right-Side Drawer: width min(560px, 100vw), padding 32px, 28px spacing */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className='relative z-10 h-full w-full max-w-[min(560px,100vw)] bg-[#0B0B0B] border-l border-[#262626] p-8 overflow-y-auto overflow-x-hidden font-mono shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 text-white focus:outline-none'
      >
        {/* TOP BAR / HEADER */}
        <div>
          <div className='flex items-start justify-between border-b border-[#1F1F1F] pb-5'>
            <div className='min-w-0 pr-4'>
              <h2
                id='action-drawer-title'
                className='text-base font-bold text-white uppercase tracking-tight break-words'
              >
                {isExecuteAll
                  ? 'Execute All Reallocations'
                  : plan?.title || 'Move budget'}
              </h2>
              <p className='text-[13px] text-[#8A8A8A] mt-1 break-words leading-relaxed'>
                {isExecuteAll
                  ? `${reallocations.length} pending capital reallocations queued`
                  : plan?.subtitle}
              </p>
            </div>

            {drawerState !== 2 && (
              <button
                type='button'
                onClick={onClose}
                className='size-8 rounded-lg flex items-center justify-center text-[#8A8A8A] hover:text-white hover:bg-[#1C1C1C] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                aria-label='Close drawer'
              >
                ✕
              </button>
            )}
          </div>

          {/* ══════════ STATE 1: REVIEW ══════════ */}
          {drawerState === 1 && (
            <div className='space-y-7 py-6 text-[15px] leading-normal'>
              {isExecuteAll ? (
                /* EXECUTE ALL REVIEW */
                <>
                  <div className='rounded-xl border border-[#262626] bg-[#121212] p-6 text-center'>
                    <div className='text-3xl font-extrabold text-white tracking-tight font-mono'>
                      {formatINR(totalMovedAll)}
                    </div>
                    <p className='text-[13px] text-[#8A8A8A] mt-1.5'>
                      total capital reallocated across {reallocations.length} campaigns
                    </p>
                  </div>

                  <div className='rounded-lg border border-[#1F1F1F] bg-[#141414] p-4 flex items-center justify-between'>
                    <span className='text-[13px] text-[#8A8A8A]'>Total Expected Daily Lift:</span>
                    <span className='text-emerald-400 font-bold text-[15px]'>
                      +{formatINR(totalLiftAll)}
                    </span>
                  </div>

                  {/* List of pending moves */}
                  <div className='space-y-2'>
                    <span className='text-[13px] text-[#8A8A8A] uppercase font-bold tracking-wider block'>
                      Queued Capital Moves ({reallocations.length})
                    </span>
                    <div className='divide-y divide-[#1F1F1F] rounded-lg border border-[#222222] bg-[#111111] max-h-60 overflow-y-auto'>
                      {reallocations.map((item) => (
                        <div key={item.id} className='p-3 text-xs flex items-center justify-between gap-2'>
                          <div className='min-w-0'>
                            <span className='font-bold text-white truncate block'>
                              {item.sourceProductName} → {item.targetProductName}
                            </span>
                            <span className='text-[11px] text-[#737373]'>
                              #{item.sourceCampaign} → #{item.targetCampaign}
                            </span>
                          </div>
                          <div className='text-right shrink-0'>
                            <span className='font-mono text-white block'>
                              {formatINR(item.movedAmount)}
                            </span>
                            <span className='text-[11px] text-emerald-400 font-bold'>
                              +{formatINR(item.netRevenueLift)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* SINGLE ACTION REVIEW */
                plan && (
                  <>
                    {/* Hero block (centred): "₹307 / day" large */}
                    <div className='rounded-xl border border-[#262626] bg-[#121212] p-6 text-center'>
                      <div className='text-3xl font-extrabold text-white tracking-tight font-mono'>
                        {formatINR(plan.heroAmount)}
                      </div>
                      <p className='text-[13px] text-[#8A8A8A] mt-1.5'>
                        {plan.heroSubtitle}
                      </p>
                    </div>

                    {plan.actionType === 'reallocation' ? (
                      /* FROM / TO CARDS FOR REALLOCATION */
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {/* FROM CARD */}
                        <div className='rounded-lg border border-[#262626] bg-[#141414] p-4 flex flex-col justify-between'>
                          <div>
                            <span className='text-[13px] text-[#8A8A8A] block'>From</span>
                            <div className='text-[15px] font-bold text-white mt-1 break-words'>
                              {plan.sourceProductName}
                            </div>
                            {/* Channel on its own line below the name (never beside a label) */}
                            <div className='mt-1.5'>
                              <span className='inline-flex items-center gap-1.5 text-xs text-[#A3A3A3] bg-[#1A1A1A] px-2 py-0.5 rounded border border-[#2A2A2A]'>
                                <PlatformLogo platform={plan.sourceChannel.toLowerCase()} size={12} />
                                <span>{plan.sourceChannel}</span>
                              </span>
                            </div>
                          </div>
                          <div className='mt-4 pt-3 border-t border-[#1F1F1F] space-y-1 font-mono text-xs'>
                            <div className='text-[#D4D4D4]'>
                              {formatINR(plan.sourceSpendBefore)} → {formatINR(plan.sourceSpendAfter)}
                            </div>
                            <div className='text-[#8A8A8A]'>
                              ROAS {plan.sourceRoas.toFixed(2)}x
                            </div>
                          </div>
                        </div>

                        {/* TO CARD */}
                        <div className='rounded-lg border border-[#262626] bg-[#141414] p-4 flex flex-col justify-between'>
                          <div>
                            <span className='text-[13px] text-[#8A8A8A] block'>To</span>
                            <div className='text-[15px] font-bold text-white mt-1 break-words'>
                              {plan.targetProductName}
                            </div>
                            {/* Channel on its own line below the name */}
                            <div className='mt-1.5'>
                              <span className='inline-flex items-center gap-1.5 text-xs text-[#A3A3A3] bg-[#1A1A1A] px-2 py-0.5 rounded border border-[#2A2A2A]'>
                                <PlatformLogo platform={(plan.targetChannel || 'meta').toLowerCase()} size={12} />
                                <span>{plan.targetChannel}</span>
                              </span>
                            </div>
                          </div>
                          <div className='mt-4 pt-3 border-t border-[#1F1F1F] space-y-1 font-mono text-xs'>
                            <div className='text-[#D4D4D4]'>
                              {formatINR(plan.targetSpendBefore || 0)} → {formatINR(plan.targetSpendAfter || 0)}
                            </div>
                            <div className='text-emerald-400 font-semibold'>
                              ROAS {(plan.targetRoas || 3.2).toFixed(2)}x
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* FOR FIX BUTTON: Issue banner, 2-4 evidence bullets, before -> after list */
                      <div className='space-y-4'>
                        <div
                          className={cn(
                            'rounded-lg border p-4 flex items-start gap-3',
                            plan.actionTag === 'PAUSE' || plan.sourceRoas < 1.8
                              ? 'border-red-900/60 bg-red-950/30 text-red-200'
                              : 'border-amber-900/60 bg-amber-950/30 text-amber-200'
                          )}
                        >
                          <Icons.alertCircle className='size-5 shrink-0 mt-0.5' />
                          <div className='min-w-0'>
                            <span className='font-bold text-sm block'>{plan.issue}</span>
                            <span className='text-xs opacity-90 block mt-0.5'>
                              {plan.actionTag === 'PAUSE'
                                ? 'Immediate budget pause required to prevent ad burn on zero stock.'
                                : 'Optimization protocol triggered to recover efficiency.'}
                            </span>
                          </div>
                        </div>

                        {/* Evidence bullets */}
                        <div className='rounded-lg border border-[#222222] bg-[#121212] p-4 space-y-2'>
                          <span className='text-[13px] font-bold text-[#8A8A8A] uppercase tracking-wider block'>
                            Observed Telemetry Evidence
                          </span>
                          <ul className='space-y-1.5 text-xs text-[#D4D4D4] list-disc list-inside'>
                            {plan.evidence.map((ev, idx) => (
                              <li key={idx} className='leading-relaxed'>
                                {ev}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Short before -> after list */}
                        <div className='rounded-lg border border-[#222222] bg-[#121212] p-4 space-y-2'>
                          <span className='text-[13px] font-bold text-[#8A8A8A] uppercase tracking-wider block'>
                            Planned Adjustments
                          </span>
                          <div className='space-y-2 text-xs font-mono'>
                            {plan.steps.map((st, idx) => (
                              <div key={idx} className='flex items-center justify-between border-b border-[#1A1A1A] pb-1.5 last:border-none'>
                                <span className='text-neutral-300'>{st.label}</span>
                                <span>
                                  <span className='text-[#737373] line-through'>{st.from}</span> →{' '}
                                  <span className='text-emerald-400 font-bold'>{st.to}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Why: one sentence from the data */}
                    <div className='rounded-lg border border-[#1F1F1F] bg-[#111111] p-4 space-y-1'>
                      <span className='text-[13px] font-bold text-[#8A8A8A] block uppercase tracking-wider'>
                        Why
                      </span>
                      <p className='text-white leading-relaxed break-words'>{plan.why}</p>
                    </div>

                    {/* Expected gain */}
                    <div className='rounded-lg border border-[#1F1F1F] bg-[#111111] p-4 space-y-1'>
                      <span className='text-[13px] font-bold text-[#8A8A8A] block uppercase tracking-wider'>
                        Expected gain
                      </span>
                      <p className='text-emerald-400 font-bold font-mono'>
                        {plan.expectedGain}
                      </p>
                    </div>

                    {/* Details (collapsed by default): formula, campaign IDs, assumptions */}
                    <details className='rounded-lg border border-[#222222] bg-[#0E0E0E] p-4 text-xs group'>
                      <summary className='cursor-pointer text-[#8A8A8A] hover:text-white font-medium flex items-center justify-between select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white'>
                        <span>Details (formula, campaign IDs, assumptions)</span>
                        <span className='text-[11px] text-[#737373] group-open:rotate-90 transition-transform'>
                          ▸
                        </span>
                      </summary>
                      <div className='mt-3 space-y-2.5 pt-2.5 border-t border-[#1A1A1A] text-[11px] text-[#A3A3A3]'>
                        <div>
                          <span className='text-[#737373] block'>Net lift formula:</span>
                          <span className='font-mono text-white break-words'>
                            {plan.details.formula}
                          </span>
                        </div>
                        <div className='grid grid-cols-2 gap-2 font-mono'>
                          <div>
                            <span className='text-[#737373] block'>Source ID:</span>
                            <span className='text-neutral-300'>{plan.details.sourceId}</span>
                          </div>
                          <div>
                            <span className='text-[#737373] block'>Destination ID:</span>
                            <span className='text-neutral-300'>{plan.details.targetId}</span>
                          </div>
                        </div>
                        <div className='text-[#737373] leading-relaxed'>
                          Assumptions: {plan.details.assumptions}
                        </div>
                      </div>
                    </details>
                  </>
                )
              )}
            </div>
          )}

          {/* ══════════ STATE 2: RUNNING ══════════ */}
          {drawerState === 2 && (
            <div className='py-12 space-y-6 text-center'>
              <div className='size-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto' />

              {isExecuteAll ? (
                <div>
                  <h3 className='text-base font-bold text-white uppercase tracking-wider'>
                    Executing Reallocations ({executeAllProgress.current} / {executeAllProgress.total})
                  </h3>
                  <div className='w-full bg-[#1A1A1A] h-2 rounded-full mt-3 overflow-hidden border border-[#262626]'>
                    <div
                      className='bg-emerald-500 h-full transition-all duration-300'
                      style={{
                        width: `${(executeAllProgress.current / Math.max(1, executeAllProgress.total)) * 100}%`,
                      }}
                    />
                  </div>
                  <p className='text-xs text-[#8A8A8A] mt-2'>
                    Applying budget adjustments and writing audit ledger...
                  </p>
                </div>
              ) : (
                plan && (
                  <div className='space-y-4 max-w-sm mx-auto text-left'>
                    <h3 className='text-sm font-bold text-white uppercase tracking-wider text-center'>
                      Executing Action
                    </h3>
                    <div className='space-y-2.5 pt-2'>
                      {plan.steps.map((st, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'p-3 rounded-lg border text-xs flex items-center gap-3 transition-colors',
                            idx <= runningStepIndex
                              ? 'border-emerald-800/80 bg-emerald-950/30 text-white'
                              : 'border-[#1F1F1F] bg-[#121212] text-[#737373]'
                          )}
                        >
                          <div
                            className={cn(
                              'size-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                              idx < runningStepIndex
                                ? 'bg-emerald-500 text-black'
                                : idx === runningStepIndex
                                ? 'border border-emerald-400 border-t-transparent animate-spin'
                                : 'bg-[#222222] text-[#737373]'
                            )}
                          >
                            {idx < runningStepIndex ? '✓' : ''}
                          </div>
                          <span className='font-mono truncate'>{st.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* ══════════ STATE 3: DONE ══════════ */}
          {drawerState === 3 && (
            <div className='space-y-7 py-6 text-[15px] leading-normal'>
              {isExecuteAll && executeAllSummary ? (
                /* EXECUTE ALL DONE SUMMARY */
                <>
                  <div className='rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-4 flex items-center justify-between'>
                    <div className='flex items-center gap-2.5'>
                      <div className='size-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold'>
                        ✓
                      </div>
                      <div>
                        <span className='text-xs font-bold text-emerald-300 uppercase tracking-wider block'>
                          Executed {executeAllSummary.count} moves at {executionTimestamp}
                        </span>
                        <span className='text-[11px] text-emerald-400/80'>
                          Added to Decision Ledger
                        </span>
                      </div>
                    </div>
                    <span className='text-xs font-mono text-emerald-400 bg-emerald-900/50 px-2.5 py-1 rounded border border-emerald-700/60 font-bold'>
                      Moved {formatINR(executeAllSummary.totalMoved)}
                    </span>
                  </div>

                  <div className='rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 space-y-2 text-xs'>
                    <span className='text-[13px] uppercase font-bold tracking-wider text-[#8A8A8A] block'>
                      Portfolio Optimization Summary
                    </span>
                    <div className='flex justify-between py-1 border-b border-[#1A1A1A]'>
                      <span className='text-[#A3A3A3]'>Total Capital Moved:</span>
                      <span className='text-white font-bold font-mono'>
                        {formatINR(executeAllSummary.totalMoved)}
                      </span>
                    </div>
                    <div className='flex justify-between py-1'>
                      <span className='text-[#A3A3A3]'>Total Projected Lift:</span>
                      <span className='text-emerald-400 font-bold font-mono'>
                        +{formatINR(executeAllSummary.totalLift)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* SINGLE ACTION DONE */
                plan && (
                  <>
                    {/* Green banner: "Moved ₹307/day at 14:32" */}
                    <div className='rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-4 flex items-center justify-between'>
                      <div className='flex items-center gap-2.5'>
                        <div className='size-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold'>
                          ✓
                        </div>
                        <div>
                          <span className='text-xs font-bold text-emerald-300 uppercase tracking-wider block'>
                            Moved {formatINR(plan.heroAmount)} at {executionTimestamp}
                          </span>
                          <span className='text-[11px] text-emerald-400/80'>
                            Added to Decision Ledger
                          </span>
                        </div>
                      </div>
                      <span className='text-[10px] font-mono text-emerald-400 bg-emerald-900/50 px-2.5 py-1 rounded border border-emerald-700/60 uppercase font-bold'>
                        CALIBRATED
                      </span>
                    </div>

                    {/* "What changed": the same before -> after lines */}
                    <div className='rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 space-y-3 text-xs'>
                      <span className='text-[13px] uppercase font-bold tracking-wider text-[#8A8A8A] block'>
                        What changed
                      </span>
                      <div className='space-y-2.5'>
                        {plan.steps.map((st, idx) => (
                          <div key={idx} className='flex items-center justify-between border-b border-[#1A1A1A] pb-1.5 last:border-none'>
                            <span className='text-neutral-300 font-medium truncate max-w-[240px]'>
                              {st.label}
                            </span>
                            <span className='font-mono'>
                              <span className='text-[#737373] line-through'>{st.from}</span> →{' '}
                              <span className='text-emerald-400 font-bold'>{st.to}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Three result tiles (before struck through, after in green) */}
                    <div className='grid grid-cols-3 gap-2.5'>
                      {plan.result.map((tile, idx) => (
                        <div key={idx} className='rounded-lg border border-[#262626] bg-[#141414] p-3 text-center'>
                          <span className='text-[11px] text-[#8A8A8A] block truncate' title={tile.label}>
                            {tile.label}
                          </span>
                          <div className='mt-1 text-xs font-mono'>
                            <span className='text-[#737373] line-through block text-[10px]'>
                              {tile.from}
                            </span>
                            <span className='text-emerald-400 font-bold block mt-0.5'>
                              {tile.to}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )
              )}

              {/* Note: "Outcomes are projections. Nexus will measure the actual result over 7 days." */}
              <div className='flex items-center gap-2 text-xs text-[#8A8A8A] bg-[#0E0E0E] p-3 rounded-lg border border-[#1F1F1F]'>
                <Icons.info className='size-4 text-[#A3A3A3] shrink-0' />
                <span>Outcomes are projections. Nexus will measure the actual result over 7 days.</span>
              </div>
            </div>
          )}

          {/* ══════════ STATE 4: ERROR ══════════ */}
          {drawerState === 4 && (
            <div className='py-8 space-y-4'>
              <div className='rounded-lg border border-red-800/80 bg-red-950/40 p-4 text-xs text-red-200'>
                <div className='flex items-center gap-2 font-bold mb-1 text-red-300'>
                  <Icons.alertCircle className='size-4' />
                  <span>Execution Failure</span>
                </div>
                <p className='leading-relaxed'>{errorMessage || 'An error occurred during execution.'}</p>
                <p className='mt-2 text-[#A3A3A3]'>
                  Store data remains completely unchanged.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER BAR */}
        <div className='pt-5 border-t border-[#1F1F1F] flex items-center justify-end gap-3'>
          {drawerState === 1 && (
            <>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2.5 rounded-lg border border-[#262626] bg-[#141414] text-xs font-semibold text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
              >
                Cancel
              </button>
              <button
                type='button'
                disabled={isExecuting}
                aria-busy={isExecuting}
                onClick={isExecuteAll ? handleStartExecuteAll : handleStartExecution}
                className='px-5 py-2.5 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50'
              >
                {isExecuting ? (
                  <span className='flex items-center gap-2'>
                    <span className='size-3 rounded-full border border-black border-t-transparent animate-spin' />
                    <span>Executing...</span>
                  </span>
                ) : isExecuteAll ? (
                  `Execute ${reallocations.length} moves`
                ) : (
                  plan?.actionButtonLabel || `Move ${formatINR(plan?.heroAmount || 0)}`
                )}
              </button>
            </>
          )}

          {drawerState === 3 && (
            <>
              <button
                type='button'
                onClick={handleNavigateToLedger}
                className='px-4 py-2.5 rounded-lg border border-[#262626] bg-[#141414] text-xs font-semibold text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
              >
                View ledger
              </button>
              <button
                type='button'
                onClick={onClose}
                className='px-5 py-2.5 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
              >
                Close
              </button>
            </>
          )}

          {drawerState === 4 && (
            <>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2.5 rounded-lg border border-[#262626] bg-[#141414] text-xs font-semibold text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
              >
                Close
              </button>
              <button
                type='button'
                onClick={() => setDrawerState(1)}
                className='px-5 py-2.5 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
