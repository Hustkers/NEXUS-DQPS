'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
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

  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      if (isSummaryOnly || product?.isFixed) {
        setStep(3);
      } else {
        setStep(1);
        setExecutingStepIndex(0);
      }
    }
  }

  const [resultTime, setResultTime] = useState<string | null>(null);

  const titleId = useId();

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
            setResultTime(new Date().toTimeString().slice(0, 5));
          }, prefersReducedMotion ? 50 : 350);
          return prev;
        }
      });
    }, tickInterval);

    return () => clearInterval(timer);
  }, [step, plan, onExecute]);

  if (!isOpen || !product || !plan) return null;

  const currentPlan = product.appliedPlan || plan;
  const fixedTimeStr = resultTime ?? product.fixedAt;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
    >
      <button
        type='button'
        aria-label='Close modal'
        onClick={onClose}
        className='absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md cursor-default'
      />
      <div
        ref={modalRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        className='relative z-10 w-full max-w-xl rounded-2xl border border-border/80 bg-card/95 dark:bg-zinc-900/95 backdrop-blur-xl p-6 text-foreground shadow-2xl font-sans overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 dark:before:via-white/15 before:to-transparent'
      >
        {/* Header Bar */}
        <div className='flex items-center justify-between border-b border-border/70 pb-4 mb-4'>
          <div className='flex items-center gap-3 min-w-0'>
            {product.photoUrl ? (
              <div className='size-9 rounded-xl bg-muted overflow-hidden shrink-0 border border-border/70 shadow-2xs'>
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
                  className='text-sm font-semibold text-foreground uppercase tracking-tight truncate'
                  id={titleId}
                >
                  {product.name}
                </h3>
                <span className='inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/70 font-mono'>
                  <PlatformLogo platform={product.channel.toLowerCase()} size={11} />
                  <span>{product.channel}</span>
                </span>
              </div>
              <p className='text-[11px] text-muted-foreground mt-0.5'>
                Autonomous Optimization Protocol • Footwear Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className='size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all active:scale-[0.92] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            aria-label='Close modal'
          >
            ✕
          </button>
        </div>

        {/* STEP 1: REVIEW */}
        {step === 1 && (
          <div className='space-y-4'>
            {/* Issue Banner */}
            <div className='rounded-xl border border-red-500/30 bg-red-500/10 dark:bg-red-950/20 p-3.5 flex items-start gap-3'>
              <div className='size-2 rounded-full bg-red-500 mt-1.5 shrink-0' />
              <div>
                <span className='text-[10px] uppercase font-mono font-medium tracking-wider text-red-600 dark:text-red-400 block'>
                  Detected Issue
                </span>
                <p className='text-xs font-medium text-foreground mt-0.5 font-sans'>
                  {currentPlan.issueBanner}
                </p>
              </div>
            </div>

            {/* Evidence Bullets */}
            <div className='rounded-xl border border-border/70 bg-muted/40 p-3.5 space-y-2'>
              <span className='text-[10px] uppercase font-mono font-medium tracking-wider text-muted-foreground block'>
                Real-Time Evidence &amp; Telemetry
              </span>
              <ul className='space-y-1.5 text-xs text-foreground/85 font-sans'>
                {currentPlan.evidence.map((item, idx) => (
                  <li key={idx} className='flex items-start gap-2'>
                    <span className='text-red-500 font-mono font-bold'>›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What the fix will do (3 steps before -> after) */}
            <div className='space-y-2.5'>
              <span className='text-[10px] uppercase font-mono font-medium tracking-wider text-muted-foreground block'>
                What the Fix Will Do (3 Actions)
              </span>
              <div className='space-y-2'>
                {currentPlan.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className='rounded-xl border border-border/70 bg-muted/30 p-3 transition-colors hover:border-border'
                  >
                    <div className='flex items-center justify-between text-xs mb-1'>
                      <span className='font-medium text-foreground flex items-center gap-2 font-sans'>
                        <span className='size-4 rounded-full bg-muted text-[10px] flex items-center justify-center font-mono text-muted-foreground'>
                          {idx + 1}
                        </span>
                        <span>{st.title}</span>
                      </span>
                    </div>
                    <p className='text-[11px] text-muted-foreground pl-6 mb-2 font-sans'>
                      {st.description}
                    </p>
                    <div className='pl-6 flex items-center gap-2 text-xs font-mono tabular-nums'>
                      <span className='text-muted-foreground line-through bg-muted/60 px-2 py-0.5 rounded-md border border-border/60'>
                        {st.before}
                      </span>
                      <span className='text-muted-foreground'>→</span>
                      <span className='text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20'>
                        {st.after}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className='flex items-center justify-end gap-3 pt-4 border-t border-border/70'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 rounded-xl border border-border/80 bg-card hover:bg-muted/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-sans'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={() => setStep(2)}
                className='px-5 py-2 rounded-xl bg-foreground text-background text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all duration-150 active:scale-[0.96] shadow-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-sans'
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
              <h4 className='text-sm font-semibold text-foreground uppercase tracking-wider mt-2 font-sans'>
                Executing Optimization Protocol
              </h4>
              <p className='text-xs text-muted-foreground font-sans'>
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
                      'flex items-center justify-between rounded-xl border p-3 transition-all',
                      isCompleted
                        ? 'border-emerald-500/30 bg-emerald-500/10'
                        : isCurrent
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-border/60 bg-muted/20 opacity-50'
                    )}
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      {isCompleted ? (
                        <div className='size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold font-mono'>
                          ✓
                        </div>
                      ) : isCurrent ? (
                        <div className='size-5 rounded-full border-2 border-primary border-t-transparent animate-spin' />
                      ) : (
                        <div className='size-5 rounded-full border border-border text-[10px] text-muted-foreground flex items-center justify-center font-mono'>
                          {idx + 1}
                        </div>
                      )}
                      <span
                        className={cn(
                          'text-xs font-medium truncate font-sans',
                          isCompleted
                            ? 'text-emerald-600 dark:text-emerald-300'
                            : isCurrent
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        )}
                      >
                        {st.title}
                      </span>
                    </div>

                    <span className='text-[10px] font-mono text-muted-foreground shrink-0'>
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
            <div className='rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold font-mono'>
                  ✓
                </div>
                <div>
                  <span className='text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-sans'>
                    Fixed at {fixedTimeStr}
                  </span>
                  <p className='text-[11px] text-emerald-600/90 dark:text-emerald-400/80 font-sans'>
                    Autonomous intervention active &amp; calibrated
                  </p>
                </div>
              </div>
              <span className='text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30 uppercase font-medium'>
                Active
              </span>
            </div>

            {/* What Was Wrong */}
            <div className='rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2'>
              <span className='text-[10px] uppercase font-mono font-medium tracking-wider text-rose-500 block'>
                What Was Wrong
              </span>
              <p className='text-xs font-medium text-foreground font-sans'>
                {currentPlan.issueBanner}
              </p>
              <ul className='space-y-1 text-[11px] text-muted-foreground mt-1.5 font-sans'>
                {currentPlan.evidence.slice(0, 3).map((item, idx) => (
                  <li key={idx} className='flex items-start gap-1.5'>
                    <span className='text-rose-500 font-mono'>›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What We Fixed list (before -> after) */}
            <div className='rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2.5'>
              <span className='text-[10px] uppercase font-mono font-medium tracking-wider text-emerald-500 block'>
                What We Fixed
              </span>
              <div className='space-y-2 text-xs'>
                {currentPlan.steps.map((st, idx) => (
                  <div key={idx} className='border-b border-border/60 last:border-none pb-2 last:pb-0'>
                    <div className='font-medium text-foreground flex items-center gap-2 font-sans'>
                      <span className='text-emerald-500 font-mono'>✓</span>
                      <span>{st.title}</span>
                    </div>
                    <div className='mt-1 pl-5 flex items-center gap-2 text-[11px] font-mono tabular-nums'>
                      <span className='text-muted-foreground line-through'>{st.before}</span>
                      <span className='text-muted-foreground'>→</span>
                      <span className='text-emerald-600 dark:text-emerald-400 font-medium'>{st.after}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Result Tiles (before struck through, after green) */}
            <div>
              <span className='text-[10px] uppercase font-mono font-medium tracking-wider text-muted-foreground block mb-2'>
                Projected Impact Summary
              </span>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5'>
                {currentPlan.resultTiles.map((tile, idx) => (
                  <div
                    key={idx}
                    className='rounded-xl border border-border/70 bg-muted/30 p-3 flex flex-col justify-between'
                  >
                    <span className='text-[10px] text-muted-foreground uppercase font-medium block mb-1 font-sans'>
                      {tile.label}
                    </span>
                    <div className='space-y-0.5'>
                      <div className='text-[11px] text-muted-foreground line-through font-mono tabular-nums'>
                        {tile.before}
                      </div>
                      <div className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums'>
                        {tile.after}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-day projection note */}
            <div className='flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/60 font-sans'>
              <Icons.info className='size-3.5 text-muted-foreground shrink-0' />
              <span>{currentPlan.projectionNote}</span>
            </div>

            {/* Actions Bar */}
            <div className='flex items-center justify-end pt-3 border-t border-border/70'>
              <button
                type='button'
                onClick={onClose}
                className='px-5 py-2 rounded-xl bg-foreground text-background text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all duration-150 active:scale-[0.96] shadow-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-sans'
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
