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
                {executionState === 'analysis' && 'Auto-Reallocation Analysis'}
                {executionState === 'executing' && 'Auto-Reallocation In Progress'}
                {executionState === 'completed' && 'Auto-Reallocation Completed'}
                {executionState === 'error' && 'Auto-Reallocation Aborted'}
              </h2>
              <span className='text-[10px] bg-muted border border-border text-muted-foreground px-1.5 py-0.5 rounded-lg font-mono font-bold'>
                {executionState === 'analysis' && '[ANALYSIS]'}
                {executionState === 'executing' && '[EXECUTING]'}
                {executionState === 'completed' && '[AUDITED]'}
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
                  Capital Flow
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
            Scipy Convex Optimization Directive • Shift ₹{Math.round(details.capitalMoved).toLocaleString('en-IN')}/day from {details.source.campaign} to {details.destination.productName}
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className='flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain'>
          {/* ============================================================ */}
          {/* PHASE 6: EXECUTION PROGRESS MODAL VIEW */}
          {/* ============================================================ */}
          {executionState === 'executing' && (
            <div className='py-6 px-4 space-y-6'>
              <div className='text-center space-y-2'>
                <div className='inline-flex items-center gap-2 px-3 py-1 rounded bg-[#1A1A1A] border border-[#1A1A1A] text-xs font-mono text-[#FFFFFF]'>
                  <Icons.spinner className='size-3.5 animate-spin text-[#FFFFFF]' />
                  AUTO-REALLOCATION IN PROGRESS
                </div>
                <p className='text-xs font-mono text-[#8A8A8A]'>
                  Executing deterministic capital rebalance for {details.source.campaign}
                </p>
              </div>

              {/* Structured Step Progress */}
              <div className='max-w-md mx-auto space-y-3 font-mono text-xs'>
                {/* Step 1 */}
                <div className='flex items-center gap-3 p-2.5 rounded bg-[#1A1A1A] border border-[#1A1A1A]'>
                  <span className='font-bold text-xs text-[#FFFFFF]'>
                    {executionStep >= 1 ? '✓' : '○'}
                  </span>
                  <span className={executionStep >= 1 ? 'text-[#FFFFFF] font-bold' : 'text-[#8A8A8A]'}>
                    Anomaly validated
                  </span>
                  {executionStep === 1 && (
                    <Icons.spinner className='size-3 animate-spin text-[#FFFFFF] ml-auto' />
                  )}
                </div>

                {/* Step 2 */}
                <div className='flex items-center gap-3 p-2.5 rounded bg-[#1A1A1A] border border-[#1A1A1A]'>
                  <span className='font-bold text-xs text-[#FFFFFF]'>
                    {executionStep >= 2 ? '✓' : executionStep === 1 ? '●' : '○'}
                  </span>
                  <span className={executionStep >= 2 ? 'text-[#FFFFFF] font-bold' : 'text-[#8A8A8A]'}>
                    Campaign analyzed
                  </span>
                  {executionStep === 2 && (
                    <Icons.spinner className='size-3 animate-spin text-[#FFFFFF] ml-auto' />
                  )}
                </div>

                {/* Step 3 */}
                <div className='flex items-center gap-3 p-2.5 rounded bg-[#1A1A1A] border border-[#1A1A1A]'>
                  <span className='font-bold text-xs text-[#FFFFFF]'>
                    {executionStep >= 3 ? '✓' : executionStep === 2 ? '●' : '○'}
                  </span>
                  <span className={executionStep >= 3 ? 'text-[#FFFFFF] font-bold' : 'text-[#8A8A8A]'}>
                    Eligible targets evaluated
                  </span>
                  {executionStep === 3 && (
                    <Icons.spinner className='size-3 animate-spin text-[#FFFFFF] ml-auto' />
                  )}
                </div>

                {/* Step 4 */}
                <div className='flex items-center gap-3 p-2.5 rounded bg-[#1A1A1A] border border-[#1A1A1A]'>
                  <span className='font-bold text-xs text-[#FFFFFF]'>
                    {executionStep >= 4 ? '✓' : executionStep === 3 ? '●' : '○'}
                  </span>
                  <span className={executionStep >= 4 ? 'text-[#FFFFFF] font-bold' : 'text-[#8A8A8A]'}>
                    Applying allocation
                  </span>
                  {executionStep === 4 && (
                    <Icons.spinner className='size-3 animate-spin text-[#FFFFFF] ml-auto' />
                  )}
                </div>

                {/* Step 5 */}
                <div className='flex items-center gap-3 p-2.5 rounded bg-[#1A1A1A] border border-[#1A1A1A]'>
                  <span className='font-bold text-xs text-[#FFFFFF]'>
                    {executionStep >= 5 ? '✓' : executionStep === 4 ? '●' : '○'}
                  </span>
                  <span className={executionStep >= 5 ? 'text-[#FFFFFF] font-bold' : 'text-[#8A8A8A]'}>
                    Recording decision
                  </span>
                  {executionStep === 5 && (
                    <Icons.spinner className='size-3 animate-spin text-[#FFFFFF] ml-auto' />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* PHASE 6: EXECUTION COMPLETED BANNER */}
          {/* ============================================================ */}
          {executionState === 'completed' && activeTab !== 'receipt' && (
            <div className='p-3.5 mb-3 rounded border border-[#FFFFFF] bg-[#1A1A1A] font-mono text-xs space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='font-bold text-[#FFFFFF] uppercase flex items-center gap-1.5'>
                  <Icons.check className='size-3.5 text-[#FFFFFF]' />
                  REALLOCATION COMPLETED
                </span>
                <span className='text-[10px] text-[#8A8A8A] font-semibold'>
                  Decision ID: {details.ledgerRecord.id}
                </span>
              </div>
              <div className='text-[11px] text-[#8A8A8A] space-y-1 pt-1 border-t border-[#000000]'>
                <div>
                  <span className='text-[#FFFFFF] font-bold'>₹{Math.round(details.capitalMoved).toLocaleString('en-IN')}/day</span> reallocated
                </div>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='text-[#8A8A8A]'>FROM:</span>
                  <span className='text-[#FFFFFF] font-medium'>{details.source.productName} ({details.source.campaign})</span>
                  <Icons.arrowRight className='size-3 text-[#8A8A8A]' />
                  <span className='text-[#8A8A8A]'>TO:</span>
                  <span className='text-[#FFFFFF] font-bold'>{details.destination.productName} ({details.destination.campaign})</span>
                </div>
                <div className='text-[10px] text-[#8A8A8A] pt-0.5'>
                  <span className='text-[#FFFFFF] font-semibold'>Reason:</span> {details.reason}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ERROR STATE */}
          {/* ============================================================ */}
          {executionState === 'error' && (
            <div className='p-4 rounded border border-[#8A8A8A] bg-[#1A1A1A] font-mono text-xs space-y-3'>
              <div className='flex items-center gap-2 text-[#FFFFFF] font-bold'>
                <Icons.warning className='size-4 text-[#FFFFFF]' />
                <span>REALLOCATION ABORTED</span>
              </div>
              <p className='text-xs text-[#8A8A8A] leading-relaxed'>
                {errorMessage || 'Unable to execute reallocation. Zero capital moved.'}
              </p>
              <div className='pt-2 flex justify-end'>
                <Button
                  size='sm'
                  onClick={onClose}
                  className='text-xs font-mono bg-[#FFFFFF] text-[#000000] hover:bg-[#8A8A8A]'
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: DECISION OVERVIEW / ANALYSIS (PHASE 5 UI) */}
          {/* ============================================================ */}
          {executionState !== 'executing' && executionState !== 'error' && activeTab === 'overview' && (
            <div className='space-y-4 pt-1'>
              {/* Real Decision Explanation Grid */}
              <div className='rounded border border-[#1A1A1A] bg-[#1A1A1A] p-4 font-mono text-xs space-y-3'>
                <div className='flex items-center justify-between border-b border-[#000000] pb-2'>
                  <span className='text-[11px] font-bold uppercase tracking-wider text-[#FFFFFF]'>
                    Operational RCA &amp; Directive Specifications
                  </span>
                  <span className='text-[10px] text-[#8A8A8A]'>
                    Autonomy Tier 1 • SLSQP Model
                  </span>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-xs'>
                  {/* Anomaly */}
                  <div className='space-y-0.5 p-2 rounded bg-[#000000] border border-[#1A1A1A]'>
                    <span className='text-[10px] uppercase text-[#8A8A8A] block font-bold'>Anomaly</span>
                    <span className='text-xs font-bold text-[#FFFFFF] truncate block'>
                      {details.anomaly?.productName || details.source.productName} ({details.source.campaign})
                    </span>
                  </div>

                  {/* Severity */}
                  <div className='space-y-0.5 p-2 rounded bg-[#000000] border border-[#1A1A1A]'>
                    <span className='text-[10px] uppercase text-[#8A8A8A] block font-bold'>Severity &amp; Deviation</span>
                    <div className='flex items-center gap-2'>
                      <span className='px-1.5 py-0.2 rounded bg-[#FFFFFF] text-[#000000] text-[10px] font-bold'>
                        [{details.anomaly?.severity || 'CRITICAL'}]
                      </span>
                      <span className='text-xs font-bold text-[#FFFFFF]'>
                        Z {details.anomaly?.zScore !== undefined ? (details.anomaly.zScore > 0 ? `+${details.anomaly.zScore}` : details.anomaly.zScore) : '-2.51'}
                      </span>
                    </div>
                  </div>

                  {/* Root Cause */}
                  <div className='space-y-0.5 p-2 rounded bg-[#000000] border border-[#1A1A1A] md:col-span-2'>
                    <span className='text-[10px] uppercase text-[#8A8A8A] block font-bold'>Diagnostic Root Cause</span>
                    <span className='text-xs text-[#FFFFFF] font-medium leading-relaxed block'>
                      {details.anomaly?.rootCause || details.anomaly?.explanation || 'Inventory depleted while ad retargeting remained active.'}
                    </span>
                  </div>

                  {/* Current Allocation */}
                  <div className='space-y-0.5 p-2 rounded bg-[#000000] border border-[#1A1A1A]'>
                    <span className='text-[10px] uppercase text-[#8A8A8A] block font-bold'>Current Allocation</span>
                    <span className='text-xs font-bold text-[#FFFFFF]'>
                      ₹{Math.round(details.source.currentSpend).toLocaleString('en-IN')}/day
                    </span>
                  </div>

                  {/* Recommended Action */}
                  <div className='space-y-0.5 p-2 rounded bg-[#000000] border border-[#1A1A1A]'>
                    <span className='text-[10px] uppercase text-[#8A8A8A] block font-bold'>Recommended Action</span>
                    <span className='text-xs font-bold text-[#FFFFFF]'>
                      REDUCE ₹{Math.round(details.capitalMoved).toLocaleString('en-IN')}/day
                    </span>
                  </div>

                  {/* Destination */}
                  <div className='space-y-0.5 p-2 rounded bg-[#000000] border border-[#1A1A1A]'>
                    <span className='text-[10px] uppercase text-[#8A8A8A] block font-bold'>Destination Target</span>
                    <div className='flex items-center gap-1.5'>
                      <PlatformLogo platform={details.destination.platform} size={13} className='shrink-0' />
                      <span className='text-xs font-bold text-[#FFFFFF] truncate'>
                        {details.destination.productName} ({details.destination.campaign})
                      </span>
                    </div>
                  </div>

                  {/* Budget Movement */}
                  <div className='space-y-0.5 p-2 rounded bg-[#000000] border border-[#1A1A1A]'>
                    <span className='text-[10px] uppercase text-[#8A8A8A] block font-bold'>Budget Movement</span>
                    <span className='text-xs font-bold text-[#FFFFFF]'>
                      +₹{Math.round(details.capitalMoved).toLocaleString('en-IN')}/day shift
                    </span>
                  </div>

                  {/* Expected Impact */}
                  <div className='space-y-0.5 p-2 rounded bg-[#000000] border border-[#1A1A1A] md:col-span-2'>
                    <span className='text-[10px] uppercase text-[#8A8A8A] block font-bold'>Expected Impact</span>
                    <span className='text-xs font-bold text-[#FFFFFF]'>
                      +₹{Math.round(details.expectedDailyLift).toLocaleString('en-IN')}/day margin lift • {details.predictedRoas.toFixed(2)}x Target ROAS (+{details.destination.roasDeltaPct.toFixed(1)}%)
                    </span>
                  </div>

                  {/* Reason */}
                  <div className='space-y-0.5 p-2 rounded bg-[#000000] border border-[#1A1A1A] md:col-span-2'>
                    <span className='text-[10px] uppercase text-[#8A8A8A] block font-bold'>Optimizer Decision Reason</span>
                    <p className='text-xs text-[#8A8A8A] leading-relaxed'>
                      {details.reason}
                    </p>
                  </div>
                </div>
              </div>

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
