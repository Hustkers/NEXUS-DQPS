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
        description: `Shifted $${Math.abs(item.deltaSpend).toLocaleString()}/day. Expected Margin Lift: +$${item.expectedDailyMargin.toLocaleString()}/day.`
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
    <div className={cn('rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-5 shadow-none', className)}>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/60 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.adjustments className='size-3.5 text-zinc-400' />
          <h3 className='font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider'>
            Autonomous Capital Reallocation Stream
          </h3>
          <span className='text-xs font-mono text-zinc-500'>
            ({items.filter((it) => it.status !== 'EXECUTED_TO_AD_API').length} pending)
          </span>
        </div>

        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2 text-xs font-mono text-zinc-400'>
            <span>Auto-Pilot</span>
            <Switch
              checked={autoPilot}
              onCheckedChange={setAutoPilot}
              className='data-[state=checked]:bg-zinc-700'
            />
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={handleExecuteAll}
            disabled={executingId !== null}
            className='h-7 text-xs font-mono border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 active:scale-[0.98]'
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
      <div className='space-y-2'>
        {items.map((item) => {
          const isExecuted = item.status === 'EXECUTED_TO_AD_API';
          const isKill = item.stockoutKill;

          return (
            <div
              key={item.id}
              className={cn(
                'flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border p-3 transition-colors',
                isExecuted
                  ? 'border-zinc-900 bg-zinc-950/20 opacity-50'
                  : isKill
                  ? 'border-rose-950/40 bg-rose-950/10 hover:border-rose-900/60'
                  : 'border-zinc-800/60 bg-zinc-950/30 hover:border-zinc-700/60'
              )}
            >
              {/* Route & Flow */}
              <div className='flex-1 min-w-0 space-y-1'>
                <div className='flex items-center gap-2 text-xs font-mono flex-wrap'>
                  <span
                    className={cn(
                      'text-[10px] font-mono font-medium px-1.5 py-0.5 rounded uppercase tracking-wider',
                      isKill
                        ? 'text-rose-400 bg-rose-950/30 border border-rose-500/20'
                        : item.deltaSpend > 0
                        ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-500/20'
                        : 'text-amber-400 bg-amber-950/30 border border-amber-500/20'
                    )}
                  >
                    {item.actionType.replace('_', ' ')}
                  </span>
                  <span className='text-zinc-600 line-through text-[11px]'>{item.sourceCampaign}</span>
                  <Icons.arrowRight className='size-3 text-zinc-500 shrink-0' />
                  <span className='font-semibold text-zinc-200 truncate'>
                    {item.targetProductName || item.targetCampaign}
                  </span>
                  <span className='text-zinc-500 text-[11px] ml-auto md:ml-0'>
                    {(item.confidence * 100).toFixed(0)}% conf
                  </span>
                </div>

                {/* Plain Numbers inline */}
                <div className='flex items-center gap-3 text-xs font-mono text-zinc-400 flex-wrap'>
                  <span>
                    Spend: <span className='text-zinc-300'>${item.currentSpend.toFixed(0)}</span> →{' '}
                    <span className={cn('font-semibold', item.deltaSpend > 0 ? 'text-emerald-400' : 'text-rose-400')}>
                      ${item.recommendedSpend.toFixed(0)}/d ({item.deltaSpend > 0 ? '+' : ''}${item.deltaSpend.toFixed(0)})
                    </span>
                  </span>
                  <span className='text-zinc-700'>•</span>
                  <span>
                    Lift: <span className='text-emerald-400 font-medium'>+${item.expectedDailyMargin.toFixed(0)}/d</span>
                  </span>
                  <span className='text-zinc-700'>•</span>
                  <span>
                    ROAS: <span className='text-zinc-200 font-medium'>{item.predictedRoas.toFixed(2)}x</span>
                  </span>
                </div>
              </div>

              {/* Execution Action */}
              <div className='shrink-0 flex items-center gap-2'>
                {isExecuted ? (
                  <span className='text-[11px] font-mono text-zinc-600 flex items-center gap-1'>
                    <Icons.check className='size-3' />
                    Dispatched
                  </span>
                ) : (
                  <Button
                    size='sm'
                    variant='ghost'
                    disabled={executingId === item.id}
                    onClick={() => handleExecute(item)}
                    className='h-7 text-xs font-mono border border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 active:scale-[0.98]'
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
