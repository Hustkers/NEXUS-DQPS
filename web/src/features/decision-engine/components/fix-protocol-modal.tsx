'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '@/components/icons';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { cn } from '@/lib/utils';
import type { DerivedProduct, FixPlanSummary } from '@/lib/gauges-engine';

interface FixProtocolModalProps {
  product: DerivedProduct | null;
  plan: FixPlanSummary | null;
  isOpen: boolean;
  isSummaryOnly?: boolean;
  onClose: () => void;
  onExecute: (plan: FixPlanSummary) => void;
}

export function FixProtocolModal({
  product,
  plan,
  isOpen,
  isSummaryOnly = false,
  onClose,
  onExecute,
}: FixProtocolModalProps) {
  // 1: Review, 2: Executing, 3: Result
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [executingStepIndex, setExecutingStepIndex] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize or reset step state
  useEffect(() => {
    if (isOpen) {
      if (isSummaryOnly || product?.isFixed) {
        setStep(3);
      } else {
        setStep(1);
        setExecutingStepIndex(0);
      }
    }
  }, [isOpen, isSummaryOnly, product?.isFixed]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Executing animation sequence (Step 2)
  useEffect(() => {
    if (step !== 2 || !plan) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tickInterval = prefersReducedMotion ? 50 : 700;

    const timer = setInterval(() => {
      setExecutingStepIndex((prev) => {
        if (prev < plan.steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          // Finish execution and transition to Result
          onExecute(plan);
          setTimeout(() => {
            setStep(3);
          }, prefersReducedMotion ? 50 : 350);
          return prev;
        }
      });
    }, tickInterval);

    return () => clearInterval(timer);
  }, [step, plan, onExecute]);

  if (!isOpen || !product || !plan) return null;

  const currentPlan = product.appliedPlan || plan;
  const fixedTimeStr = product.fixedAt
    ? product.fixedAt.includes(' ')
      ? product.fixedAt.split(' ')[1]
      : product.fixedAt
    : new Date().toTimeString().slice(0, 5);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='fix-protocol-title'
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className='relative w-full max-w-xl rounded-xl border border-[#262626] bg-[#0A0A0A] p-6 text-white shadow-2xl font-mono'
      >
        {/* Header Bar */}
        <div className='flex items-center justify-between border-b border-[#1F1F1F] pb-4 mb-4'>
          <div className='flex items-center gap-3 min-w-0'>
            {product.photoUrl ? (
              <div className='size-9 rounded bg-[#171717] overflow-hidden shrink-0 border border-[#262626]'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.photoUrl}
                  alt={product.name}
                  className='size-full object-cover'
                />
              </div>
            ) : null}
            <div className='min-w-0'>
              <div className='flex items-center gap-2'>
                <h3
                  id='fix-protocol-title'
                  className='text-sm font-bold text-white uppercase tracking-tight truncate'
                >
                  {product.name}
                </h3>
                <span className='inline-flex items-center gap-1 text-[10px] text-[#A3A3A3] bg-[#171717] px-2 py-0.5 rounded border border-[#262626]'>
                  <PlatformLogo platform={product.channel.toLowerCase()} size={11} />
                  <span>{product.channel}</span>
                </span>
              </div>
              <p className='text-[11px] text-[#737373] mt-0.5'>
                Autonomous Optimization Protocol • Footwear Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className='size-7 rounded flex items-center justify-center text-[#737373] hover:text-white hover:bg-[#1A1A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
            aria-label='Close modal'
          >
            ✕
          </button>
        </div>

        {/* STEP 1: REVIEW */}
        {step === 1 && (
          <div className='space-y-4'>
            {/* Issue Banner */}
            <div className='rounded-lg border border-red-900/60 bg-red-950/30 p-3.5 flex items-start gap-3'>
              <div className='size-2.5 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse' />
              <div>
                <span className='text-[10px] uppercase font-bold tracking-wider text-red-400 block'>
                  Detected Issue
                </span>
                <p className='text-xs font-semibold text-white mt-0.5'>
                  {currentPlan.issueBanner}
                </p>
              </div>
            </div>

            {/* Evidence Bullets */}
            <div className='rounded-lg border border-[#1F1F1F] bg-[#121212] p-3.5 space-y-2'>
              <span className='text-[10px] uppercase font-bold tracking-wider text-[#A3A3A3] block'>
                Real-Time Evidence &amp; Telemetry
              </span>
              <ul className='space-y-1.5 text-xs text-[#D4D4D4]'>
                {currentPlan.evidence.map((item, idx) => (
                  <li key={idx} className='flex items-start gap-2'>
                    <span className='text-red-400 font-bold'>›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What the fix will do (3 steps before -> after) */}
            <div className='space-y-2.5'>
              <span className='text-[10px] uppercase font-bold tracking-wider text-[#A3A3A3] block'>
                What the Fix Will Do (3 Actions)
              </span>
              <div className='space-y-2'>
                {currentPlan.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className='rounded-lg border border-[#262626] bg-[#141414] p-3 transition-colors hover:border-[#404040]'
                  >
                    <div className='flex items-center justify-between text-xs mb-1'>
                      <span className='font-semibold text-white flex items-center gap-2'>
                        <span className='size-4 rounded-full bg-[#262626] text-[10px] flex items-center justify-center font-bold text-[#A3A3A3]'>
                          {idx + 1}
                        </span>
                        <span>{st.title}</span>
                      </span>
                    </div>
                    <p className='text-[11px] text-[#8A8A8A] pl-6 mb-2'>
                      {st.description}
                    </p>
                    <div className='pl-6 flex items-center gap-2 text-xs'>
                      <span className='text-[#737373] line-through bg-[#0D0D0D] px-2 py-0.5 rounded border border-[#1F1F1F]'>
                        {st.before}
                      </span>
                      <span className='text-[#A3A3A3]'>→</span>
                      <span className='text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50'>
                        {st.after}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className='flex items-center justify-end gap-3 pt-4 border-t border-[#1F1F1F]'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 rounded-lg border border-[#262626] bg-[#141414] text-xs font-semibold text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={() => setStep(2)}
                className='px-5 py-2 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
              >
                Execute Fix
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: EXECUTING */}
        {step === 2 && (
          <div className='py-6 space-y-6 text-center'>
            <div className='flex flex-col items-center justify-center gap-2'>
              <div className='size-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin' />
              <h4 className='text-sm font-bold text-white uppercase tracking-wider mt-2'>
                Executing Optimization Protocol
              </h4>
              <p className='text-xs text-[#737373]'>
                Calibrating bid thresholds, supply routes, and budget reallocations...
              </p>
            </div>

            <div className='space-y-3 text-left max-w-md mx-auto'>
              {currentPlan.steps.map((st, idx) => {
                const isCompleted = idx < executingStepIndex;
                const isCurrent = idx === executingStepIndex;
                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-3 transition-all',
                      isCompleted
                        ? 'border-emerald-800/60 bg-emerald-950/20'
                        : isCurrent
                        ? 'border-white/40 bg-[#171717]'
                        : 'border-[#1F1F1F] bg-[#0F0F0F] opacity-50'
                    )}
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      {isCompleted ? (
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
                      <span
                        className={cn(
                          'text-xs font-semibold truncate',
                          isCompleted
                            ? 'text-emerald-300'
                            : isCurrent
                            ? 'text-white'
                            : 'text-[#737373]'
                        )}
                      >
                        {st.title}
                      </span>
                    </div>

                    <span className='text-[10px] font-mono text-[#8A8A8A] shrink-0'>
                      {isCompleted ? 'Done' : isCurrent ? 'Applying...' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: RESULT */}
        {step === 3 && (
          <div className='space-y-4'>
            {/* Green Fixed Banner */}
            <div className='rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-3.5 flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='size-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold'>
                  ✓
                </div>
                <div>
                  <span className='text-xs font-bold text-emerald-300 uppercase tracking-wider'>
                    Fixed at {fixedTimeStr}
                  </span>
                  <p className='text-[11px] text-emerald-400/80'>
                    Autonomous intervention active &amp; calibrated
                  </p>
                </div>
              </div>
              <span className='text-[10px] font-mono text-emerald-400 bg-emerald-900/50 px-2.5 py-1 rounded border border-emerald-700/60 uppercase font-bold'>
                Active
              </span>
            </div>

            {/* What Was Wrong */}
            <div className='rounded-lg border border-[#1F1F1F] bg-[#121212] p-3.5 space-y-2'>
              <span className='text-[10px] uppercase font-bold tracking-wider text-rose-400 block'>
                What Was Wrong
              </span>
              <p className='text-xs font-semibold text-white'>
                {currentPlan.issueBanner}
              </p>
              <ul className='space-y-1 text-[11px] text-[#A3A3A3] mt-1.5'>
                {currentPlan.evidence.slice(0, 3).map((item, idx) => (
                  <li key={idx} className='flex items-start gap-1.5'>
                    <span className='text-rose-400'>›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What We Fixed list (before -> after) */}
            <div className='rounded-lg border border-[#1F1F1F] bg-[#121212] p-3.5 space-y-2.5'>
              <span className='text-[10px] uppercase font-bold tracking-wider text-emerald-400 block'>
                What We Fixed
              </span>
              <div className='space-y-2 text-xs'>
                {currentPlan.steps.map((st, idx) => (
                  <div key={idx} className='border-b border-[#1F1F1F] last:border-none pb-2 last:pb-0'>
                    <div className='font-semibold text-white flex items-center gap-2'>
                      <span className='text-emerald-400'>✓</span>
                      <span>{st.title}</span>
                    </div>
                    <div className='mt-1 pl-5 flex items-center gap-2 text-[11px]'>
                      <span className='text-[#737373] line-through'>{st.before}</span>
                      <span className='text-[#737373]'>→</span>
                      <span className='text-emerald-400 font-semibold'>{st.after}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Result Tiles (before struck through, after green) */}
            <div>
              <span className='text-[10px] uppercase font-bold tracking-wider text-[#A3A3A3] block mb-2'>
                Projected Impact Summary
              </span>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5'>
                {currentPlan.resultTiles.map((tile, idx) => (
                  <div
                    key={idx}
                    className='rounded-lg border border-[#262626] bg-[#141414] p-3 flex flex-col justify-between'
                  >
                    <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold block mb-1'>
                      {tile.label}
                    </span>
                    <div className='space-y-0.5'>
                      <div className='text-[11px] text-[#737373] line-through font-mono'>
                        {tile.before}
                      </div>
                      <div className='text-xs font-bold text-emerald-400 font-mono'>
                        {tile.after}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-day projection note */}
            <div className='flex items-center gap-2 text-[11px] text-[#737373] bg-[#0F0F0F] p-2.5 rounded border border-[#1F1F1F]'>
              <Icons.info className='size-3.5 text-[#A3A3A3] shrink-0' />
              <span>{currentPlan.projectionNote}</span>
            </div>

            {/* Actions Bar */}
            <div className='flex items-center justify-end pt-3 border-t border-[#1F1F1F]'>
              <button
                type='button'
                onClick={onClose}
                className='px-5 py-2 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
