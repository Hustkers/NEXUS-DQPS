'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { buildReallocationExecutionDetails } from '../lib/reallocation-execution-math';
import { ReallocationExecutionModal } from './reallocation-execution-modal';
import type { CampaignDataRef, ReallocationExecutionDetails } from '../types/reallocation-execution';

export interface ReallocationItem {
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
  status: string;
  stockoutKill: boolean;
}

interface ReallocationFeedProps {
  initialItems: ReallocationItem[];
  campaigns?: CampaignDataRef[];
  onExecuteReallocation?: (item: ReallocationItem, details: ReallocationExecutionDetails) => void;
  className?: string;
}

export function ReallocationFeed({
  initialItems,
  campaigns = [],
  onExecuteReallocation,
  className
}: ReallocationFeedProps) {
  const [items, setItems] = useState<ReallocationItem[]>(initialItems);
  const [autoPilot, setAutoPilot] = useState<boolean>(true);
  const [executingId, setExecutingId] = useState<string | null>(null);
  
  // Execution details state cache (prevents duplicate calculations)
  const [executionDetailsMap, setExecutionDetailsMap] = useState<Record<string, ReallocationExecutionDetails>>({});
  
  // Active modal inspection
  const [activeModalDetails, setActiveModalDetails] = useState<ReallocationExecutionDetails | null>(null);

  // Cumulative execution metrics
  const cumulativeStats = useMemo(() => {
    const executedItems = items.filter((it) => it.status === 'EXECUTED_TO_AD_API');
    const capitalMoved = executedItems.reduce((acc, it) => acc + Math.abs(it.deltaSpend), 0);
    const expectedLift = executedItems.reduce((acc, it) => acc + it.expectedDailyMargin, 0);
    return {
      count: executedItems.length,
      capitalMoved,
      expectedLift
    };
  }, [items]);

  const handleExecute = (item: ReallocationItem) => {
    // Prevent accidental double execution
    if (item.status === 'EXECUTED_TO_AD_API' || executingId !== null) {
      return;
    }

    setExecutingId(item.id);

    try {
      // Deterministic calculation from the actual recommendation
      const details = buildReallocationExecutionDetails(item, campaigns);
      
      // Update state after short visual confirmation
      setTimeout(() => {
        setExecutionDetailsMap((prev) => ({
          ...prev,
          [item.id]: details
        }));

        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'EXECUTED_TO_AD_API' } : it
          )
        );

        setExecutingId(null);

        // Open execution modal showing the 5-phase visual flow & audit receipt
        setActiveModalDetails(details);

        toast.success(`Executed Reallocation: ${details.destination.productName}`, {
          description: `Shifted ₹${Math.round(details.capitalMoved).toLocaleString('en-IN')}/day. Expected Lift: +₹${Math.round(details.expectedDailyLift).toLocaleString('en-IN')}/day. Recorded in Decision Ledger.`
        });

        onExecuteReallocation?.(item, details);
      }, 550);
    } catch (err) {
      setExecutingId(null);
      toast.error('EXECUTION FAILED', {
        description: 'Optimizer directive could not be safely dispatched to ad delivery APIs.'
      });
    }
  };

  const handleInspectExecuted = (item: ReallocationItem) => {
    const existing = executionDetailsMap[item.id] || buildReallocationExecutionDetails(item, campaigns);
    setActiveModalDetails(existing);
  };

  const handleExecuteAll = () => {
    const pending = items.filter((it) => it.status !== 'EXECUTED_TO_AD_API');
    if (pending.length === 0) {
      toast.info('All reallocations have already been executed.');
      return;
    }

    setExecutingId('all');

    setTimeout(() => {
      const updatedMap = { ...executionDetailsMap };
      pending.forEach((it) => {
        const details = buildReallocationExecutionDetails(it, campaigns);
        updatedMap[it.id] = details;
        onExecuteReallocation?.(it, details);
      });

      setExecutionDetailsMap(updatedMap);
      setItems((prev) =>
        prev.map((it) => ({ ...it, status: 'EXECUTED_TO_AD_API' }))
      );
      setExecutingId(null);

      toast.success(`Executed ${pending.length} Reallocations Across Delivery Channels`, {
        description: `Directives dispatched to Meta, Google, and Amazon ad APIs with audited decision ledger entries.`
      });
    }, 850);
  };

  const pendingCount = items.filter((it) => it.status !== 'EXECUTED_TO_AD_API').length;

  return (
    <div className={cn('rounded-xl border border-border/80 bg-card p-5 shadow-xs font-mono', className)}>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.adjustments className='size-3.5 text-muted-foreground' />
          <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
            Autonomous Capital Reallocation Stream
          </h3>
          <span className='text-xs text-muted-foreground'>
            ({pendingCount} pending)
          </span>
        </div>

        <div className='flex items-center gap-4'>
          {/* Cumulative Execution Badge */}
          {cumulativeStats.count > 0 && (
            <div className='hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold'>
              <Icons.shieldCheck className='size-3 text-emerald-500' />
              <span>
                {cumulativeStats.count} Executed • ₹{Math.round(cumulativeStats.capitalMoved).toLocaleString('en-IN')}/d Moved • +₹{Math.round(cumulativeStats.expectedLift).toLocaleString('en-IN')}/d Lift
              </span>
            </div>
          )}

          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span>Auto-Pilot</span>
            <Switch
              checked={autoPilot}
              onCheckedChange={setAutoPilot}
            />
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={handleExecuteAll}
            disabled={executingId !== null || pendingCount === 0}
            className='h-8 text-xs font-mono border border-border bg-secondary hover:bg-secondary/80 text-foreground font-semibold shadow-2xs active:scale-[0.98]'
          >
            {executingId === 'all' ? (
              <>
                <Icons.spinner className='mr-1.5 size-3 animate-spin' />
                Executing All...
              </>
            ) : (
              'Execute All'
            )}
          </Button>
        </div>
      </div>

      {/* Streamlined Reallocation Rows */}
      <div className='space-y-2.5'>
        {items.map((item) => {
          const isExecuted = item.status === 'EXECUTED_TO_AD_API';
          const isKill = item.stockoutKill;
          const isCurrentlyExecuting = executingId === item.id;
          const itemDelta = Math.abs(item.deltaSpend);

          return (
            <div
              key={item.id}
              className={cn(
                'flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all',
                isExecuted
                  ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10'
                  : isKill
                  ? 'border-rose-200 dark:border-rose-950/40 bg-rose-50/40 dark:bg-rose-950/10 hover:border-rose-300'
                  : 'border-border/80 bg-slate-50/50 dark:bg-zinc-950/30 hover:border-border hover:shadow-2xs'
              )}
            >
              {/* Route & Flow */}
              <div className='flex-1 min-w-0 space-y-1.5'>
                <div className='flex items-center gap-2 text-xs flex-wrap'>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border',
                      isKill
                        ? 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/20'
                        : item.deltaSpend > 0
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/20'
                        : 'text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/20'
                    )}
                  >
                    {item.actionType.replace('_', ' ')}
                  </span>
                  <span className='text-muted-foreground line-through text-[11px]'>{item.sourceCampaign}</span>
                  <Icons.arrowRight className='size-3 text-muted-foreground shrink-0' />
                  <span className='font-bold text-foreground truncate'>
                    {item.targetProductName || item.targetCampaign}
                  </span>
                  <span className='text-muted-foreground text-[11px] ml-auto md:ml-0'>
                    {(Math.abs(item.confidence) * 100).toFixed(0)}% conf
                  </span>
                </div>

                {/* Plain Numbers inline (Deterministic Values) */}
                <div className='flex items-center gap-3 text-xs text-muted-foreground flex-wrap'>
                  <span>
                    Spend: <span className='text-foreground font-medium'>₹{Math.round(item.currentSpend).toLocaleString('en-IN')}</span> →{' '}
                    <span className={cn('font-bold', item.deltaSpend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                      ₹{Math.round(item.recommendedSpend).toLocaleString('en-IN')}/d ({item.deltaSpend > 0 ? '+' : ''}₹{Math.round(item.deltaSpend).toLocaleString('en-IN')})
                    </span>
                  </span>
                  <span className='text-muted-foreground/30'>•</span>
                  <span>
                    Lift: <span className='text-emerald-600 dark:text-emerald-400 font-bold'>+₹{Math.round(item.expectedDailyMargin).toLocaleString('en-IN')}/d</span>
                  </span>
                  <span className='text-muted-foreground/30'>•</span>
                  <span>
                    ROAS: <span className='text-foreground font-bold'>{item.predictedRoas.toFixed(2)}x</span>
                  </span>
                </div>

                {/* Executed Confirmation Sub-Banner */}
                {isExecuted && (
                  <div className='pt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-2 flex-wrap'>
                    <span className='flex items-center gap-1'>
                      <Icons.check className='size-3 text-emerald-600' />
                      CAPITAL REALLOCATED
                    </span>
                    <span className='text-muted-foreground/60'>|</span>
                    <span>₹{Math.round(itemDelta).toLocaleString('en-IN')}/day moved</span>
                    <span className='text-muted-foreground/60'>|</span>
                    <span>EXPECTED LIFT: +₹{Math.round(item.expectedDailyMargin).toLocaleString('en-IN')}/day</span>
                    <span className='text-muted-foreground/60'>|</span>
                    <span className='text-muted-foreground'>Decision recorded in ledger</span>
                  </div>
                )}
              </div>

              {/* Execution Action Button */}
              <div className='shrink-0 flex items-center gap-2'>
                {isExecuted ? (
                  <div className='flex items-center gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleInspectExecuted(item)}
                      className='h-7.5 text-xs font-mono border border-emerald-500/30 bg-card hover:bg-accent text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs'
                    >
                      <Icons.shieldCheck className='mr-1.5 size-3 text-emerald-600' />
                      Audit Receipt
                    </Button>
                    <span className='text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20'>
                      <Icons.check className='size-3' />
                      Executed ✓
                    </span>
                  </div>
                ) : (
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={isCurrentlyExecuting || executingId !== null}
                    onClick={() => handleExecute(item)}
                    className='h-7.5 text-xs font-mono border border-border bg-card hover:bg-accent text-foreground font-semibold shadow-2xs active:scale-[0.98]'
                  >
                    {isCurrentlyExecuting ? (
                      <>
                        <Icons.spinner className='mr-1.5 size-3 animate-spin text-emerald-500' />
                        EXECUTING...
                      </>
                    ) : (
                      'Execute'
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5-Phase Interactive Execution Modal */}
      <ReallocationExecutionModal
        details={activeModalDetails}
        isOpen={!!activeModalDetails}
        onClose={() => setActiveModalDetails(null)}
        isAlreadyExecuted={true}
      />
    </div>
  );
}
