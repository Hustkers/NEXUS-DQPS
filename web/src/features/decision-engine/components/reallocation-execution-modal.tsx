'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { ReallocationFlowAnimator } from './reallocation-flow-animator';
import { ReallocationImpactMetrics } from './reallocation-impact-metrics';
import { ReallocationBeforeAfterChart } from './reallocation-before-after-chart';
import { ReallocationSplitBar } from './reallocation-split-bar';
import { ReallocationWhyBetter } from './reallocation-why-better';
import { ReallocationExecutionReceipt } from './reallocation-execution-receipt';
import type { ReallocationExecutionDetails } from '../types/reallocation-execution';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ReallocationExecutionModalProps {
  details: ReallocationExecutionDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmExecution?: (details: ReallocationExecutionDetails) => Promise<{ success: boolean; error?: string; message?: string } | void> | void;
  isAlreadyExecuted?: boolean;
  onViewLedger?: () => void;
}

const emptySubscribe = () => () => {};

export function ReallocationExecutionModal({
  details,
  isOpen,
  onClose,
  onConfirmExecution,
  isAlreadyExecuted = false,
  onViewLedger
}: ReallocationExecutionModalProps) {
  const router = useRouter();
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [activeTab, setActiveTab] = useState<'overview' | 'flow' | 'metrics' | 'receipt'>('overview');
  const [executionState, setExecutionState] = useState<'analysis' | 'executing' | 'completed' | 'error'>(
    isAlreadyExecuted ? 'completed' : 'analysis'
  );
  const [executionStep, setExecutionStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [prevProps, setPrevProps] = useState({ isOpen, isAlreadyExecuted });
  if (prevProps.isOpen !== isOpen || prevProps.isAlreadyExecuted !== isAlreadyExecuted) {
    setPrevProps({ isOpen, isAlreadyExecuted });
    if (isOpen) {
      setExecutionState(isAlreadyExecuted ? 'completed' : 'analysis');
      setActiveTab(isAlreadyExecuted ? 'receipt' : 'overview');
      setExecutionStep(0);
      setErrorMessage(null);
    }
  }

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && executionState !== 'executing') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, executionState, onClose]);

  if (!isOpen || !details || !isMounted) return null;

  const handleConfirm = async () => {
    setExecutionState('executing');
    setExecutionStep(1); // 1: Anomaly validated

    // Progressive visual steps
    const timer1 = setTimeout(() => setExecutionStep(2), 350); // 2: Campaign analyzed
    const timer2 = setTimeout(() => setExecutionStep(3), 700); // 3: Eligible targets evaluated
    const timer3 = setTimeout(() => setExecutionStep(4), 1050); // 4: Applying allocation

    try {
      if (onConfirmExecution) {
        const res = await onConfirmExecution(details);
        if (res && res.success === false) {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
          setErrorMessage(res.message || res.error || 'Reallocation execution failed.');
          setExecutionState('error');
          return;
        }
      }

      // Step 5: Recording decision
      setTimeout(() => {
        setExecutionStep(5);
        setTimeout(() => {
          setExecutionState('completed');
          setActiveTab('receipt');
        }, 400);
      }, 1400);
    } catch (err: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      const message = err instanceof Error ? err.message : 'Execution error encountered.';
      setErrorMessage(message);
      setExecutionState('error');
    }
  };

  const handleGoToLedger = () => {
    if (onViewLedger) {
      onViewLedger();
    } else {
      router.push('/dashboard/ledger');
    }
    onClose();
  };

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6'
      role='dialog'
      aria-modal='true'
      aria-labelledby='reallocation-modal-title'
    >
      {/* Sibling Backdrop Overlay */}
      <div
        className='fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in-0 duration-150'
        onClick={() => {
          if (executionState !== 'executing') {
            onClose();
          }
        }}
        aria-hidden='true'
      />

      {/* Centered Modal Container */}
      <div
        className='relative flex flex-col w-full max-w-4xl max-h-[calc(100dvh-32px)] sm:max-h-[88vh] rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl font-mono overflow-hidden animate-in zoom-in-95 duration-150 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/10 before:to-transparent z-10'
      >
        {/* Fixed Modal Header */}
        <div className='shrink-0 border-b border-border/80 p-4 sm:p-5 bg-card/95 backdrop-blur-xs z-10'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-mono font-bold text-foreground'>
                {executionState === 'completed' ? '■' : '●'}
              </span>
              <h2
                id='reallocation-modal-title'
                className='text-sm sm:text-base font-bold font-mono uppercase tracking-wider text-foreground'
              >
                BUDGET REALLOCATION
              </h2>
              <span className='text-[10px] bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-md font-mono font-bold'>
                {executionState === 'analysis' && '[ANALYSIS]'}
                {executionState === 'executing' && '[EXECUTING]'}
                {executionState === 'completed' && '[EXECUTED]'}
                {executionState === 'error' && '[FAILED]'}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              {/* Tab navigation */}
              <div className='flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 text-xs'>
                <button
                  type='button'
                  onClick={() => setActiveTab('overview')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all duration-75 active:scale-[0.96] ${
                    activeTab === 'overview'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Overview
                </button>
                <button
                  type='button'
                  onClick={() => setActiveTab('flow')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all duration-75 active:scale-[0.96] ${
                    activeTab === 'flow'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Money Flow
                </button>
                <button
                  type='button'
                  onClick={() => setActiveTab('metrics')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all duration-75 active:scale-[0.96] ${
                    activeTab === 'metrics'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Forecast
                </button>
                <button
                  type='button'
                  onClick={() => setActiveTab('receipt')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all duration-75 active:scale-[0.96] ${
                    activeTab === 'receipt'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Receipt
                </button>
              </div>

              {/* Close (X) button */}
              <button
                type='button'
                onClick={onClose}
                disabled={executionState === 'executing'}
                aria-label='Close modal'
                className='p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-transparent hover:border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0'
              >
                <Icons.close className='size-4' />
              </button>
            </div>
          </div>

          <p className='text-xs font-mono text-muted-foreground mt-1.5'>
            Moving spend from an underperforming campaign to a higher-return opportunity.
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className='flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain'>
          {/* ============================================================ */}
          {/* PHASE: EXECUTION PROGRESS MODAL VIEW */}
          {/* ============================================================ */}
          {executionState === 'executing' && (
            <div className='py-6 px-4 space-y-6'>
              <div className='text-center space-y-2'>
                <div className='inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-400'>
                  <Icons.spinner className='size-3.5 animate-spin text-cyan-400' />
                  BUDGET REALLOCATION IN PROGRESS
                </div>
                <p className='text-xs font-mono text-muted-foreground'>
                  Transferring ₹{Math.round(details.capitalMoved).toLocaleString('en-IN')}/day from {details.source.campaign} to {details.destination.productName}
                </p>
              </div>

              {/* Structured Step Progress Timeline */}
              <div className='max-w-md mx-auto space-y-2.5 font-mono text-xs'>
                {/* Step 1: Decision selected */}
                <div className='flex items-center gap-3 p-3 rounded-lg bg-card border border-border/80'>
                  <span className='font-bold text-xs text-muted-foreground'>01</span>
                  <span className={cn('flex-1 font-medium', executionStep >= 1 ? 'text-foreground font-bold' : 'text-muted-foreground')}>
                    Decision selected
                  </span>
                  {executionStep > 1 && <Icons.check className='size-3.5 text-emerald-400 ml-auto' />}
                  {executionStep === 1 && <Icons.spinner className='size-3.5 animate-spin text-cyan-400 ml-auto' />}
                </div>

                {/* Step 2: Source budget reduced */}
                <div className='flex items-center gap-3 p-3 rounded-lg bg-card border border-border/80'>
                  <span className='font-bold text-xs text-muted-foreground'>02</span>
                  <span className={cn('flex-1 font-medium', executionStep >= 2 ? 'text-foreground font-bold' : 'text-muted-foreground')}>
                    Source budget reduced (−₹{Math.round(details.capitalMoved).toLocaleString('en-IN')}/d)
                  </span>
                  {executionStep > 2 && <Icons.check className='size-3.5 text-emerald-400 ml-auto' />}
                  {executionStep === 2 && <Icons.spinner className='size-3.5 animate-spin text-cyan-400 ml-auto' />}
                </div>

                {/* Step 3: Destination budget increased */}
                <div className='flex items-center gap-3 p-3 rounded-lg bg-card border border-border/80'>
                  <span className='font-bold text-xs text-muted-foreground'>03</span>
                  <span className={cn('flex-1 font-medium', executionStep >= 3 ? 'text-foreground font-bold' : 'text-muted-foreground')}>
                    Destination budget increased (+₹{Math.round(details.capitalMoved).toLocaleString('en-IN')}/d)
                  </span>
                  {executionStep > 3 && <Icons.check className='size-3.5 text-emerald-400 ml-auto' />}
                  {executionStep === 3 && <Icons.spinner className='size-3.5 animate-spin text-cyan-400 ml-auto' />}
                </div>

                {/* Step 4: Allocation verified */}
                <div className='flex items-center gap-3 p-3 rounded-lg bg-card border border-border/80'>
                  <span className='font-bold text-xs text-muted-foreground'>04</span>
                  <span className={cn('flex-1 font-medium', executionStep >= 4 ? 'text-foreground font-bold' : 'text-muted-foreground')}>
                    Allocation verified
                  </span>
                  {executionStep > 4 && <Icons.check className='size-3.5 text-emerald-400 ml-auto' />}
                  {executionStep === 4 && <Icons.spinner className='size-3.5 animate-spin text-cyan-400 ml-auto' />}
                </div>

                {/* Step 5: Reallocation recorded */}
                <div className='flex items-center gap-3 p-3 rounded-lg bg-card border border-border/80'>
                  <span className='font-bold text-xs text-muted-foreground'>05</span>
                  <span className={cn('flex-1 font-medium', executionStep >= 5 ? 'text-foreground font-bold' : 'text-muted-foreground')}>
                    Reallocation recorded
                  </span>
                  {executionStep >= 5 && <Icons.check className='size-3.5 text-emerald-400 ml-auto' />}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* PHASE 6: EXECUTION COMPLETED BANNER */}
          {/* ============================================================ */}
          {executionState === 'completed' && activeTab !== 'receipt' && (
            <div className='p-3.5 mb-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 font-mono text-xs space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5'>
                  <Icons.check className='size-3.5' />
                  REALLOCATION COMPLETED
                </span>
                <span className='text-[10px] text-muted-foreground font-semibold'>
                  Decision ID: {details.ledgerRecord.id}
                </span>
              </div>
              <div className='text-[11px] text-muted-foreground space-y-1 pt-1 border-t border-border'>
                <div>
                  <span className='text-foreground font-bold'>₹{Math.round(details.capitalMoved).toLocaleString('en-IN')}/day</span> reallocated
                </div>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='text-muted-foreground'>FROM:</span>
                  <span className='text-foreground font-medium'>{details.source.productName} ({details.source.campaign})</span>
                  <Icons.arrowRight className='size-3 text-muted-foreground' />
                  <span className='text-muted-foreground'>TO:</span>
                  <span className='text-foreground font-bold'>{details.destination.productName} ({details.destination.campaign})</span>
                </div>
                <div className='text-[10px] text-muted-foreground pt-0.5'>
                  <span className='text-foreground font-semibold'>Reason:</span> {details.reason}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ERROR STATE */}
          {/* ============================================================ */}
          {executionState === 'error' && (
            <div className='p-6 rounded-xl border border-rose-500/30 bg-rose-500/5 font-mono text-xs space-y-4 max-w-lg mx-auto my-6'>
              <div className='flex items-center gap-2.5 text-rose-500 font-bold text-sm'>
                <Icons.warning className='size-5' />
                <span>REALLOCATION FAILED</span>
              </div>
              <div className='space-y-1.5 pt-1 border-t border-rose-500/20'>
                <span className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>Reason:</span>
                <p className='text-xs text-foreground leading-relaxed font-mono bg-background/50 p-2.5 rounded-lg border border-border/60'>
                  {errorMessage || 'Unable to execute reallocation. Zero capital moved.'}
                </p>
              </div>
              <div className='pt-2 flex items-center justify-end gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={onClose}
                  className='text-xs font-mono h-8 border border-border text-foreground hover:bg-muted'
                >
                  Close
                </Button>
                <Button
                  size='sm'
                  onClick={handleConfirm}
                  className='text-xs font-mono h-8 bg-rose-500 hover:bg-rose-600 text-white font-bold'
                >
                  <Icons.refresh className='mr-1.5 size-3' />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: DECISION OVERVIEW / ANALYSIS (PHASE 5 UI) */}
          {/* ============================================================ */}
          {executionState !== 'executing' && executionState !== 'error' && activeTab === 'overview' && (
            <div className='space-y-4 pt-1'>
              {/* Top Central Visual Money Flow */}
              <ReallocationFlowAnimator details={details} />

              {/* Real Decision Explanation Grid */}
              <div className='rounded-lg border border-border bg-card p-4 font-mono text-xs space-y-3'>
                <div className='flex items-center justify-between border-b border-border pb-2'>
                  <span className='text-[11px] font-bold uppercase tracking-wider text-foreground'>
                    Operational RCA &amp; Directive Specifications
                  </span>
                  <span className='text-[10px] text-muted-foreground'>
                    Autonomy Tier 1 • SLSQP Model
                  </span>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-xs'>
                  {/* Anomaly */}
                  <div className='space-y-0.5 p-2 rounded-lg bg-background border border-border'>
                    <span className='text-[10px] uppercase text-muted-foreground block font-bold'>Anomaly Source</span>
                    <span className='text-xs font-bold text-foreground truncate block'>
                      {details.anomaly?.productName || details.source.productName} ({details.source.campaign})
                    </span>
                  </div>

                  {/* Severity */}
                  <div className='space-y-0.5 p-2 rounded-lg bg-background border border-border'>
                    <span className='text-[10px] uppercase text-muted-foreground block font-bold'>Severity &amp; Deviation</span>
                    <div className='flex items-center gap-2'>
                      <span className={cn(
                        'px-1.5 py-0.2 rounded text-[10px] font-bold border',
                        details.anomaly?.severity === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      )}>
                        [{details.anomaly?.severity || 'CRITICAL'}]
                      </span>
                      <span className='text-xs font-bold text-foreground'>
                        Z {details.anomaly?.zScore !== undefined ? (details.anomaly.zScore > 0 ? `+${details.anomaly.zScore}` : details.anomaly.zScore) : '-2.51'}
                      </span>
                    </div>
                  </div>

                  {/* Root Cause */}
                  <div className='space-y-0.5 p-2 rounded-lg bg-background border border-border md:col-span-2'>
                    <span className='text-[10px] uppercase text-muted-foreground block font-bold'>Diagnostic Root Cause</span>
                    <span className='text-xs text-foreground font-medium leading-relaxed block'>
                      {details.anomaly?.rootCause || details.anomaly?.explanation || 'Inventory depleted while ad retargeting remained active.'}
                    </span>
                  </div>

                  {/* Current Allocation */}
                  <div className='space-y-0.5 p-2 rounded-lg bg-background border border-border'>
                    <span className='text-[10px] uppercase text-muted-foreground block font-bold'>Current Allocation</span>
                    <span className='text-xs font-bold text-foreground'>
                      ₹{Math.round(details.source.currentSpend).toLocaleString('en-IN')}/day
                    </span>
                  </div>

                  {/* Recommended Action */}
                  <div className='space-y-0.5 p-2 rounded-lg bg-background border border-border'>
                    <span className='text-[10px] uppercase text-muted-foreground block font-bold'>Recommended Action</span>
                    <span className='text-xs font-bold text-foreground'>
                      REDUCE ₹{Math.round(details.capitalMoved).toLocaleString('en-IN')}/day
                    </span>
                  </div>

                  {/* Destination */}
                  <div className='space-y-0.5 p-2 rounded-lg bg-background border border-border'>
                    <span className='text-[10px] uppercase text-muted-foreground block font-bold'>Destination Target</span>
                    <div className='flex items-center gap-1.5'>
                      <PlatformLogo platform={details.destination.platform} size={13} className='shrink-0' />
                      <span className='text-xs font-bold text-foreground truncate'>
                        {details.destination.productName} ({details.destination.campaign})
                      </span>
                    </div>
                  </div>

                  {/* Budget Movement */}
                  <div className='space-y-0.5 p-2 rounded-lg bg-background border border-border'>
                    <span className='text-[10px] uppercase text-muted-foreground block font-bold'>Budget Movement</span>
                    <span className='text-xs font-bold text-foreground'>
                      +₹{Math.round(details.capitalMoved).toLocaleString('en-IN')}/day shift
                    </span>
                  </div>

                  {/* Expected Impact */}
                  <div className='space-y-0.5 p-2 rounded-lg bg-background border border-border md:col-span-2'>
                    <span className='text-[10px] uppercase text-muted-foreground block font-bold'>Expected Impact</span>
                    <span className='text-xs font-bold text-foreground'>
                      +₹{Math.round(details.expectedDailyLift).toLocaleString('en-IN')}/day margin lift • {details.predictedRoas.toFixed(2)}x Target ROAS (+{details.destination.roasDeltaPct.toFixed(1)}%)
                    </span>
                  </div>

                  {/* Reason */}
                  <div className='space-y-0.5 p-2 rounded-lg bg-background border border-border md:col-span-2'>
                    <span className='text-[10px] uppercase text-muted-foreground block font-bold'>Optimizer Decision Reason</span>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      {details.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Before vs After Chart */}
              <ReallocationBeforeAfterChart details={details} />

              {/* Why This Reallocation */}
              <ReallocationWhyBetter details={details} />

              {/* Portfolio Split Bar */}
              <ReallocationSplitBar details={details} />
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: CAPITAL FLOW */}
          {/* ============================================================ */}
          {executionState !== 'executing' && executionState !== 'error' && activeTab === 'flow' && (
            <div className='space-y-4 pt-1'>
              <ReallocationFlowAnimator details={details} />
              <ReallocationBeforeAfterChart details={details} />
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: FORECAST & IMPACT METRICS */}
          {/* ============================================================ */}
          {executionState !== 'executing' && executionState !== 'error' && activeTab === 'metrics' && (
            <div className='space-y-4 pt-1'>
              <ReallocationImpactMetrics details={details} />
              <ReallocationBeforeAfterChart details={details} />
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: AUDIT RECEIPT */}
          {/* ============================================================ */}
          {executionState !== 'executing' && executionState !== 'error' && activeTab === 'receipt' && (
            <div className='pt-2 space-y-4'>
              <ReallocationExecutionReceipt
                details={details}
                onClose={onClose}
                onViewLedger={handleGoToLedger}
              />
            </div>
          )}
        </div>

        {/* Fixed Action Footer */}
        {executionState === 'analysis' && (
          <div className='shrink-0 border-t border-border/80 p-4 sm:p-5 bg-card/95 backdrop-blur-xs z-10 flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-2 text-xs font-mono text-muted-foreground'>
              <Icons.shieldCheck className='size-4 text-foreground' />
              <span>Deterministic Mathematical Audit Trail</span>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={onClose}
                className='text-xs font-mono h-8 border border-border bg-muted/30 text-foreground hover:bg-muted font-semibold active:scale-[0.96] rounded-xl transition-all duration-75'
              >
                Cancel
              </Button>
              <Button
                size='sm'
                onClick={handleConfirm}
                className='text-xs font-mono h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold border-none active:scale-[0.96] rounded-xl transition-all duration-75 shadow-xs'
              >
                <Icons.arrowRight className='mr-1.5 size-3' />
                Confirm Reallocation
              </Button>
            </div>
          </div>
        )}

        {executionState === 'completed' && activeTab !== 'receipt' && (
          <div className='shrink-0 border-t border-border/80 p-4 sm:p-5 bg-card/95 backdrop-blur-xs z-10 flex flex-wrap items-center justify-between gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleGoToLedger}
              className='text-xs font-mono h-8 border border-border bg-muted/30 text-foreground hover:bg-muted font-semibold active:scale-[0.96] rounded-xl transition-all duration-75'
            >
              View In Decision Ledger →
            </Button>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setActiveTab('receipt')}
                className='text-xs font-mono h-8 border border-border bg-muted/30 text-foreground hover:bg-muted font-semibold active:scale-[0.96] rounded-xl transition-all duration-75'
              >
                Audit Receipt
              </Button>
              <Button
                size='sm'
                onClick={onClose}
                className='text-xs font-mono h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold border-none active:scale-[0.96] rounded-xl transition-all duration-75 shadow-xs'
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {executionState === 'executing' && (
          <div className='shrink-0 border-t border-border/80 p-3.5 sm:p-4 bg-card/95 backdrop-blur-xs z-10 flex items-center justify-between text-xs font-mono text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Icons.spinner className='size-3.5 animate-spin text-foreground' />
              <span>Optimizing convex budget parameters &amp; updating DuckDB audit log...</span>
            </div>
            <span className='text-[10px] uppercase font-bold text-muted-foreground'>Step {executionStep} of 5</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
