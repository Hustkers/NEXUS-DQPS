'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  onExecuteReallocation?: (item: ReallocationItem) => void;
  className?: string;
}

export function ReallocationFeed({
  initialItems,
  onExecuteReallocation,
  className
}: ReallocationFeedProps) {
  const [items, setItems] = useState<ReallocationItem[]>(initialItems);
  const [autoPilot, setAutoPilot] = useState<boolean>(true);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const handleExecute = (item: ReallocationItem) => {
    setExecutingId(item.id);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: 'EXECUTED_TO_AD_API' } : it
        )
      );
      setExecutingId(null);
      toast.success(`Executed Reallocation on ${item.targetProductName || item.targetCampaign}`, {
        description: `Shifted ₹${Math.abs(item.deltaSpend).toLocaleString()}/day. Expected Margin Lift: +₹${item.expectedDailyMargin.toLocaleString()}/day.`
      });
      onExecuteReallocation?.(item);
    }, 500);
  };

  const handleExecuteAll = () => {
    const pending = items.filter((it) => it.status !== 'EXECUTED_TO_AD_API');
    if (pending.length === 0) {
      toast.info('All Reallocations already executed');
      return;
    }
    setExecutingId('all');
    setTimeout(() => {
      setItems((prev) =>
        prev.map((it) => ({ ...it, status: 'EXECUTED_TO_AD_API' }))
      );
      setExecutingId(null);
      toast.success(`Executed ${pending.length} Reallocations across channels`, {
        description: 'Orders successfully dispatched to Meta, Google, and Amazon APIs.'
      });
      pending.forEach((it) => onExecuteReallocation?.(it));
    }, 900);
  };

  return (
    <div className={cn('rounded-xl border border-border/80 bg-card p-5 shadow-xs', className)}>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.adjustments className='size-3.5 text-muted-foreground' />
          <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
            Autonomous Capital Reallocation Stream
          </h3>
          <span className='text-xs font-mono text-muted-foreground'>
            ({items.filter((it) => it.status !== 'EXECUTED_TO_AD_API').length} pending)
          </span>
        </div>

        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2 text-xs font-mono text-muted-foreground'>
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
            disabled={executingId !== null}
            className='h-8 text-xs font-mono border border-border bg-secondary hover:bg-secondary/80 text-foreground font-semibold shadow-2xs active:scale-[0.98]'
          >
            {executingId === 'all' ? (
              <>
                <Icons.spinner className='mr-1.5 size-3 animate-spin' />
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

          return (
            <div
              key={item.id}
              className={cn(
                'flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all',
                isExecuted
                  ? 'border-border/40 bg-muted/30 opacity-60'
                  : isKill
                  ? 'border-rose-200 dark:border-rose-950/40 bg-rose-50/40 dark:bg-rose-950/10 hover:border-rose-300'
                  : 'border-border/80 bg-slate-50/50 dark:bg-zinc-950/30 hover:border-border hover:shadow-2xs'
              )}
            >
              {/* Route & Flow */}
              <div className='flex-1 min-w-0 space-y-1.5'>
                <div className='flex items-center gap-2 text-xs font-mono flex-wrap'>
                  <span
                    className={cn(
                      'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border',
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
                    {(item.confidence * 100).toFixed(0)}% conf
                  </span>
                </div>

                {/* Plain Numbers inline */}
                <div className='flex items-center gap-3 text-xs font-mono text-muted-foreground flex-wrap'>
                  <span>
                    Spend: <span className='text-foreground font-medium'>₹{item.currentSpend.toFixed(0)}</span> →{' '}
                    <span className={cn('font-bold', item.deltaSpend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                      ₹{item.recommendedSpend.toFixed(0)}/d ({item.deltaSpend > 0 ? '+' : ''}₹{item.deltaSpend.toFixed(0)})
                    </span>
                  </span>
                  <span className='text-muted-foreground/30'>•</span>
                  <span>
                    Lift: <span className='text-emerald-600 dark:text-emerald-400 font-bold'>+₹{item.expectedDailyMargin.toFixed(0)}/d</span>
                  </span>
                  <span className='text-muted-foreground/30'>•</span>
                  <span>
                    ROAS: <span className='text-foreground font-bold'>{item.predictedRoas.toFixed(2)}x</span>
                  </span>
                </div>
              </div>

              {/* Execution Action */}
              <div className='shrink-0 flex items-center gap-2'>
                {isExecuted ? (
                  <span className='text-[11px] font-mono text-muted-foreground flex items-center gap-1 font-semibold'>
                    <Icons.check className='size-3 text-emerald-600' />
                    Dispatched
                  </span>
                ) : (
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={executingId === item.id}
                    onClick={() => handleExecute(item)}
                    className='h-7.5 text-xs font-mono border border-border bg-card hover:bg-accent text-foreground font-semibold shadow-2xs active:scale-[0.98]'
                  >
                    {executingId === item.id ? (
                      <Icons.spinner className='size-3 animate-spin' />
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
    </div>
  );
}
