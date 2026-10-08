'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { OptimizationResult } from '@/lib/autonomous-learning/types';

interface RedTeamValidationDrawerProps {
  validation: OptimizationResult['validationDecision'];
  isOpen: boolean;
  onClose: () => void;
  onConfirmApprove?: () => void;
}

export function RedTeamValidationDrawer({
  validation,
  isOpen,
  onClose,
  onConfirmApprove
}: RedTeamValidationDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      role='presentation'
      className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 font-mono'
      onClick={onClose}
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-label='Decision Validation & Constraints'
        onClick={(e) => e.stopPropagation()}
        className='my-auto flex w-full max-w-2xl flex-col gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 text-zinc-900 dark:text-zinc-100 shadow-xl'
      >
        <div className='flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3'>
          <div className='flex items-center gap-2'>
            <Icons.shieldCheck className='size-3.5 text-zinc-500' />
            <h3 className='text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100'>
              Validation &amp; Guardrail Verification
            </h3>
            <span className='text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'>
              {validation.status}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label='Close drawer'
            className='size-7 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition-colors'
          >
            <Icons.close className='size-3.5' />
          </button>
        </div>

        <div className='space-y-3 text-xs'>
          {/* Challenge Box */}
          <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-3.5 space-y-1'>
            <span className='text-[10px] uppercase font-semibold text-zinc-500 block'>
              Evaluation Vector
            </span>
            <p className='text-zinc-800 dark:text-zinc-200 leading-relaxed text-[11px]'>
              {validation.redTeamChallenge}
            </p>
          </div>

          {/* Monte Carlo Stress Test */}
          <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-3.5 space-y-1'>
            <span className='text-[10px] uppercase font-semibold text-zinc-500 block'>
              Monte Carlo Simulation Outcome
            </span>
            <p className='text-zinc-900 dark:text-zinc-100 font-semibold text-[11px] font-mono'>
              {validation.stressTestResult}
            </p>
          </div>

          {/* Safeguards Enforced */}
          <div className='space-y-1.5'>
            <span className='text-[10px] uppercase font-semibold text-zinc-500 block'>
              Enforced Guardrails:
            </span>
            <div className='space-y-1'>
              {validation.safeguardsApplied.map((guard, i) => (
                <div key={i} className='flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-[11px]'>
                  <Icons.check className='size-3 text-zinc-500 shrink-0' />
                  <span>{guard}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800'>
          <button
            onClick={onClose}
            className='px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmApprove?.();
              onClose();
            }}
            className='px-4 py-1.5 rounded bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold text-xs uppercase'
          >
            Authorize Decision
          </button>
        </div>
      </div>
    </div>
  );
}
