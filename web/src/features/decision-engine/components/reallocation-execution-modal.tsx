'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
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

export function ReallocationExecutionModal({
  details,
  isOpen,
  onClose,
  onConfirmExecution,
  isAlreadyExecuted = false,
  onViewLedger
}: ReallocationExecutionModalProps) {
  const router = useRouter();
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

  if (!details) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-3xl max-h-[92vh] overflow-y-auto font-mono bg-[#000000] text-[#FFFFFF] border border-[#1A1A1A] p-5 sm:p-6 shadow-none'>
        {/* Header */}
        <DialogHeader className='border-b border-[#1A1A1A] pb-3 mb-2'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-mono font-bold text-[#FFFFFF]'>
                {executionState === 'completed' ? '■' : '●'}
              </span>
              <DialogTitle className='text-sm sm:text-base font-bold font-mono uppercase tracking-wider text-[#FFFFFF]'>
                {executionState === 'analysis' && 'Auto-Reallocation Analysis'}
                {executionState === 'executing' && 'Auto-Reallocation In Progress'}
                {executionState === 'completed' && 'Auto-Reallocation Completed'}
                {executionState === 'error' && 'Auto-Reallocation Aborted'}
              </DialogTitle>
              <span className='text-[10px] bg-[#1A1A1A] border border-[#1A1A1A] text-[#8A8A8A] px-1.5 py-0.5 rounded font-mono font-bold'>
                {executionState === 'analysis' && '[ANALYSIS]'}
                {executionState === 'executing' && '[EXECUTING]'}
                {executionState === 'completed' && '[AUDITED]'}
                {executionState === 'error' && '[FAILED]'}
              </span>
            </div>

            {/* Tab navigation */}
            <div className='flex items-center gap-1 bg-[#1A1A1A] p-0.5 rounded border border-[#1A1A1A] text-xs'>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#FFFFFF] text-[#000000]'
                    : 'text-[#8A8A8A] hover:text-[#FFFFFF]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('flow')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all ${
                  activeTab === 'flow'
                    ? 'bg-[#FFFFFF] text-[#000000]'
                    : 'text-[#8A8A8A] hover:text-[#FFFFFF]'
                }`}
              >
                Capital Flow
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all ${
                  activeTab === 'metrics'
                    ? 'bg-[#FFFFFF] text-[#000000]'
                    : 'text-[#8A8A8A] hover:text-[#FFFFFF]'
                }`}
              >
                Forecast
              </button>
              <button
                onClick={() => setActiveTab('receipt')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all ${
                  activeTab === 'receipt'
                    ? 'bg-[#FFFFFF] text-[#000000]'
                    : 'text-[#8A8A8A] hover:text-[#FFFFFF]'
                }`}
              >
                Receipt
              </button>
            </div>
          </div>

          <DialogDescription className='text-xs font-mono text-[#8A8A8A] mt-1'>
            Scipy Convex Optimization Directive • Shift ₹{Math.round(details.capitalMoved).toLocaleString('en-IN')}/day from {details.source.campaign} to {details.destination.productName}
          </DialogDescription>
        </DialogHeader>

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

        {/* ============================================================ */}
        {/* BOTTOM ACTION FOOTER */}
        {/* ============================================================ */}
        {executionState === 'analysis' && (
          <div className='flex items-center justify-between pt-4 mt-2 border-t border-[#1A1A1A]'>
            <div className='flex items-center gap-2 text-xs font-mono text-[#8A8A8A]'>
              <Icons.shieldCheck className='size-4 text-[#FFFFFF]' />
              <span>Deterministic Mathematical Audit Trail</span>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={onClose}
                className='text-xs font-mono h-8 border border-[#1A1A1A] bg-[#000000] text-[#FFFFFF] hover:bg-[#1A1A1A] hover:border-[#8A8A8A]'
              >
                Cancel
              </Button>
              <Button
                size='sm'
                onClick={handleConfirm}
                className='text-xs font-mono h-8 bg-[#FFFFFF] hover:bg-[#8A8A8A] text-[#000000] font-bold border-none active:scale-[0.98]'
              >
                <Icons.arrowRight className='mr-1.5 size-3 text-[#000000]' />
                Confirm Reallocation
              </Button>
            </div>
          </div>
        )}

        {executionState === 'completed' && activeTab !== 'receipt' && (
          <div className='flex items-center justify-between pt-4 mt-2 border-t border-[#1A1A1A]'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleGoToLedger}
              className='text-xs font-mono h-8 border border-[#8A8A8A] bg-[#000000] text-[#FFFFFF] hover:bg-[#1A1A1A]'
            >
              View In Decision Ledger →
            </Button>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setActiveTab('receipt')}
                className='text-xs font-mono h-8 border border-[#1A1A1A] bg-[#000000] text-[#FFFFFF] hover:bg-[#1A1A1A]'
              >
                Audit Receipt
              </Button>
              <Button
                size='sm'
                onClick={onClose}
                className='text-xs font-mono h-8 bg-[#FFFFFF] hover:bg-[#8A8A8A] text-[#000000] font-bold border-none'
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
