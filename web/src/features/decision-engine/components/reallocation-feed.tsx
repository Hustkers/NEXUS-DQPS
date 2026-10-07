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
    <div className={cn('rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-sm', className)}>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.adjustments className='size-4 text-emerald-400' />
          <h3 className='font-mono text-sm font-bold text-zinc-100'>
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
              className='data-[state=checked]:bg-emerald-500'
            />
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={handleExecuteAll}
            disabled={executingId !== null}
            className='h-8 text-xs font-mono border-zinc-800 text-zinc-300 hover:bg-zinc-900'
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

      {/* Reallocation Rows */}
      <div className='space-y-2.5'>
        {items.map((item) => {
          const isExecuted = item.status === 'EXECUTED_TO_AD_API';
          const isKill = item.stockoutKill;

          return (
            <div
              key={item.id}
              className={cn(
                'flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border p-3.5 transition-all',
                isExecuted
                  ? 'border-zinc-900 bg-zinc-950/40 opacity-60'
                  : isKill
                  ? 'border-rose-500/20 bg-rose-950/10 hover:border-rose-500/40'
                  : 'border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700'
              )}
            >
              {/* Route & Flow */}
              <div className='flex-1 min-w-0 space-y-1.5'>
                <div className='flex items-center gap-2 text-xs font-mono flex-wrap'>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded uppercase',
                      isKill
                        ? 'text-rose-400 bg-rose-950/40'
                        : item.deltaSpend > 0
                        ? 'text-emerald-400 bg-emerald-950/40'
                        : 'text-amber-400 bg-amber-950/40'
                    )}
                  >
                    {item.actionType.replace('_', ' ')}
                  </span>
                  <span className='text-zinc-500 line-through text-[11px]'>{item.sourceCampaign}</span>
                  <Icons.arrowRight className='size-3 text-emerald-400 shrink-0' />
                  <span className='font-bold text-zinc-100 truncate'>
                    {item.targetProductName || item.targetCampaign}
                  </span>
                  <span className='text-zinc-500 text-[11px] ml-auto md:ml-0'>
                    {(item.confidence * 100).toFixed(0)}% conf
                  </span>
                </div>

                {/* Key Numbers inline */}
                <div className='flex items-center gap-4 text-xs font-mono text-zinc-400 flex-wrap'>
                  <span>
                    Spend: <span className='text-zinc-300'>${item.currentSpend.toFixed(0)}</span> →{' '}
                    <span className={cn('font-bold', item.deltaSpend > 0 ? 'text-emerald-400' : 'text-rose-400')}>
                      ${item.recommendedSpend.toFixed(0)}/d ({item.deltaSpend > 0 ? '+' : ''}${item.deltaSpend.toFixed(0)})
                    </span>
                  </span>
                  <span>•</span>
                  <span>
                    Lift:{' '}
                    <span className='text-emerald-400 font-bold'>
                      +${item.expectedDailyMargin.toFixed(0)}/d
                    </span>
                  </span>
                  <span>•</span>
                  <span>
                    ROAS: <span className='text-cyan-400 font-bold'>{item.predictedRoas.toFixed(2)}x</span>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className='shrink-0 flex items-center justify-end'>
                {isExecuted ? (
                  <span className='text-xs font-mono text-emerald-400 flex items-center gap-1'>
                    <Icons.check className='size-3.5' />
                    Executed
                  </span>
                ) : (
                  <Button
                    size='sm'
                    onClick={() => handleExecute(item)}
                    disabled={executingId === item.id}
                    className={cn(
                      'text-xs font-mono h-8 px-3',
                      isKill
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    )}
                  >
                    {executingId === item.id ? (
                      <Icons.spinner className='size-3 animate-spin' />
                    ) : isKill ? (
                      'Kill Spend'
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
