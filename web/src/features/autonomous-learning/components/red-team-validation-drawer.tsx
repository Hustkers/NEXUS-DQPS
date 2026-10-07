'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
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

  const isWarning = validation.status === 'WARNING';
  const isCritical = validation.status === 'CRITICAL';

  return (
    <div
      role='presentation'
      className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md font-mono'
      onClick={onClose}
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-label='AI Red Team Decision Validation'
        onClick={(e) => e.stopPropagation()}
        className='my-auto flex w-full max-w-2xl flex-col gap-4 rounded-2xl border border-border bg-card p-5 text-foreground shadow-2xl'
      >
        <div className='flex items-center justify-between border-b border-border/80 pb-3'>
          <div className='flex items-center gap-2'>
            <Icons.shieldCheck className={cn('size-4', isCritical ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-emerald-500')} />
            <h3 className='text-sm font-bold uppercase tracking-tight text-foreground'>
              AI Red Team Decision Validation &amp; Stress-Test
            </h3>
            <Badge
              variant='outline'
              className={cn(
                'text-[10px] uppercase font-bold',
                isCritical && 'border-rose-500 text-rose-500 bg-rose-500/10',
                isWarning && 'border-amber-500 text-amber-500 bg-amber-500/10',
                !isCritical && !isWarning && 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
              )}
            >
              {validation.status}
            </Badge>
          </div>

          <button
            onClick={onClose}
            aria-label='Close drawer'
            className='size-8 rounded-lg border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        <div className='space-y-3.5 text-xs'>
          {/* Challenge Box */}
          <div className='rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1.5'>
            <span className='text-[10px] uppercase font-bold text-muted-foreground block'>
              Adversarial Challenge Vector
            </span>
            <p className='text-foreground leading-relaxed'>
              {validation.redTeamChallenge}
            </p>
          </div>

          {/* Monte Carlo Stress Test */}
          <div className='rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1.5'>
            <span className='text-[10px] uppercase font-bold text-muted-foreground block'>
              Simulation Stress-Test Result
            </span>
            <p className='text-emerald-600 dark:text-emerald-400 font-bold'>
              {validation.stressTestResult}
            </p>
          </div>

          {/* Safeguards Enforced */}
          <div className='space-y-1.5'>
            <span className='text-[10px] uppercase font-bold text-muted-foreground block'>
              Autonomous Guardrails Enforced Prior to Execution:
            </span>
            <div className='space-y-1'>
              {validation.safeguardsApplied.map((guard, i) => (
                <div key={i} className='flex items-center gap-2 text-muted-foreground text-[11px]'>
                  <Icons.check className='size-3 text-emerald-500 shrink-0' />
                  <span>{guard}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='flex items-center justify-end gap-2 pt-3 border-t border-border/80'>
          <button
            onClick={onClose}
            className='px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground'
          >
            Close
          </button>
          <button
            onClick={() => {
              onConfirmApprove?.();
              onClose();
            }}
            className='px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase shadow-sm'
          >
            Authorize Decision
          </button>
        </div>
      </div>
    </div>
  );
}
