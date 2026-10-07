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
    <div className={cn('rounded border border-[#8A8A8A] bg-[#1A1A1A] p-5 shadow-none text-[#FFFFFF]', className)}>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[#8A8A8A]/40 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.adjustments className='size-3.5 text-[#8A8A8A]' />
          <h3 className='font-mono text-xs font-bold text-[#FFFFFF] uppercase tracking-wider'>
            Autonomous Capital Reallocation Stream
          </h3>
          <span className='text-xs font-mono text-[#8A8A8A]'>
            ({items.filter((it) => it.status !== 'EXECUTED_TO_AD_API').length} pending)
          </span>
        </div>

        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2 text-xs font-mono text-[#8A8A8A]'>
            <span>Auto-Pilot</span>
            <Switch
              checked={autoPilot}
              onCheckedChange={setAutoPilot}
              className='data-[state=checked]:bg-[#FFFFFF] data-[state=unchecked]:bg-[#000000] border border-[#8A8A8A]'
            />
          </div>

          <Button
            size='sm'
            onClick={handleExecuteAll}
            disabled={executingId !== null}
            className='h-8 text-xs font-mono bg-[#FFFFFF] hover:bg-[#8A8A8A] text-[#000000] font-semibold border-none active:scale-[0.98]'
          >
            {executingId === 'all' ? (
              <>
                <Icons.spinner className='mr-1.5 size-3 animate-spin text-[#000000]' />
                Executing...
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
                'flex flex-col md:flex-row md:items-center justify-between gap-3 rounded border p-3.5 transition-all',
                isExecuted
                  ? 'border-[#1A1A1A] bg-[#000000] opacity-50'
                  : isKill
                  ? 'border-2 border-[#FFFFFF] bg-[#000000]'
                  : 'border border-[#8A8A8A]/40 bg-[#000000] hover:border-[#8A8A8A]'
              )}
            >
              {/* Route & Flow */}
              <div className='flex-1 min-w-0 space-y-1.5'>
                <div className='flex items-center gap-2 text-xs flex-wrap'>
                  <span
                    className={cn(
                      'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider',
                      isKill
                        ? 'bg-[#FFFFFF] text-[#000000]'
                        : item.deltaSpend > 0
                        ? 'bg-[#1A1A1A] text-[#FFFFFF] border border-[#8A8A8A]'
                        : 'bg-[#1A1A1A] text-[#8A8A8A] border border-[#8A8A8A]'
                    )}
                  >
                    {isKill ? '[CRITICAL] ' : ''}{item.actionType.replace('_', ' ')}
                  </span>
                  <span className='text-[#8A8A8A] line-through text-[11px]'>{item.sourceCampaign}</span>
                  <Icons.arrowRight className='size-3 text-[#8A8A8A] shrink-0' />
                  <span className='font-bold text-[#FFFFFF] truncate'>
                    {item.targetProductName || item.targetCampaign}
                  </span>
                  <span className='text-[#8A8A8A] text-[11px] ml-auto md:ml-0'>
                    {(item.confidence * 100).toFixed(0)}% conf
                  </span>
                </div>

                {/* Plain Numbers inline */}
                <div className='flex items-center gap-3 text-xs font-mono text-[#8A8A8A] flex-wrap'>
                  <span>
                    Spend: <span className='text-[#FFFFFF] font-medium'>₹{item.currentSpend.toFixed(0)}</span> →{' '}
                    <span className='font-bold text-[#FFFFFF]'>
                      ₹{item.recommendedSpend.toFixed(0)}/d ({item.deltaSpend > 0 ? '+' : ''}₹{item.deltaSpend.toFixed(0)})
                    </span>
                  </span>
                  <span>•</span>
                  <span>
                    Lift: <span className='text-[#FFFFFF] font-bold'>+₹{item.expectedDailyMargin.toFixed(0)}/d</span>
                  </span>
                  <span>•</span>
                  <span>
                    ROAS: <span className='text-[#FFFFFF] font-bold'>{item.predictedRoas.toFixed(2)}x</span>
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
                  <span className='text-[11px] font-mono text-[#8A8A8A] flex items-center gap-1 font-semibold'>
                    <Icons.check className='size-3 text-[#FFFFFF]' />
                    Dispatched
                  </span>
                ) : (
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={isCurrentlyExecuting || executingId !== null}
                    onClick={() => handleExecute(item)}
                    className='h-7.5 text-xs font-mono border border-[#8A8A8A] bg-[#1A1A1A] hover:bg-[#000000] hover:border-[#FFFFFF] text-[#FFFFFF] font-semibold active:scale-[0.98]'
                  >
                    {executingId === item.id ? (
                      <Icons.spinner className='size-3 animate-spin text-[#FFFFFF]' />
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
