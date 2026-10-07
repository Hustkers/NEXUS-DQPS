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
import { ReallocationFlowAnimator } from './reallocation-flow-animator';
import { ReallocationImpactMetrics } from './reallocation-impact-metrics';
import { ReallocationBeforeAfterChart } from './reallocation-before-after-chart';
import { ReallocationSplitBar } from './reallocation-split-bar';
import { ReallocationWhyBetter } from './reallocation-why-better';
import { ReallocationExecutionReceipt } from './reallocation-execution-receipt';
import type { ReallocationExecutionDetails } from '../types/reallocation-execution';

interface ReallocationExecutionModalProps {
  details: ReallocationExecutionDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmExecution?: (details: ReallocationExecutionDetails) => void;
  isAlreadyExecuted?: boolean;
}

export function ReallocationExecutionModal({
  details,
  isOpen,
  onClose,
  onConfirmExecution,
  isAlreadyExecuted = false
}: ReallocationExecutionModalProps) {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'receipt'>('visualizer');

  if (!details) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto font-mono bg-card text-foreground border border-border shadow-2xl p-5 sm:p-6'>
        <DialogHeader className='border-b border-border/80 pb-3 mb-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='size-2.5 rounded-full bg-emerald-500 animate-pulse' />
              <DialogTitle className='text-sm sm:text-base font-bold font-mono uppercase tracking-wider text-foreground'>
                Autonomous Capital Reallocation Console
              </DialogTitle>
            </div>
            <div className='flex items-center gap-1 bg-muted/60 p-0.5 rounded-md border border-border text-xs'>
              <button
                onClick={() => setActiveTab('visualizer')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                  activeTab === 'visualizer'
                    ? 'bg-card text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Capital Flow
              </button>
              <button
                onClick={() => setActiveTab('receipt')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                  activeTab === 'receipt'
                    ? 'bg-card text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Audit Receipt
              </button>
            </div>
          </div>
          <DialogDescription className='text-xs font-mono text-muted-foreground mt-1'>
            Scipy Convex Optimization Directive • Shift ₹{Math.round(details.capitalMoved).toLocaleString('en-IN')}/day to {details.destination.productName}
          </DialogDescription>
        </DialogHeader>

        {activeTab === 'visualizer' ? (
          <div className='space-y-4 pt-1'>
            {/* Phase 1 & 2: Flow Animator */}
            <ReallocationFlowAnimator details={details} />

            {/* Why This Reallocation */}
            <ReallocationWhyBetter details={details} />

            {/* Phase 3 & 4: Chart and Portfolio Split Bar */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <ReallocationBeforeAfterChart details={details} />
              <ReallocationSplitBar details={details} />
            </div>

            {/* Phase 5: Impact Metrics & Before/After Table */}
            <ReallocationImpactMetrics details={details} />

            {/* Action Bar */}
            <div className='flex items-center justify-between pt-3 border-t border-border/80'>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <Icons.shieldCheck className='size-4 text-emerald-500' />
                <span>Deterministic Mathematical Audit Trail</span>
              </div>

              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setActiveTab('receipt')}
                  className='text-xs font-mono font-bold'
                >
                  View Receipt
                </Button>
                <Button
                  size='sm'
                  onClick={onClose}
                  className='text-xs font-mono font-bold bg-foreground text-background hover:bg-foreground/90'
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className='pt-2 space-y-4'>
            <ReallocationExecutionReceipt details={details} onClose={onClose} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
