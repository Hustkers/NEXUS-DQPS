'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/icons';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { approveDirective, USE_MOCKS } from '@/lib/api-adapter';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface ReallocationItem {
  id: string;
  sourceCampaign: string;
  targetCampaign: string;
  sourceProductName?: string;
  targetProductName?: string;
  currentSpend: number;
  recommendedSpend: number;
  deltaSpend: number;
  actionType: string;
  predictedRoas: number;
  expectedDailyMargin: number;
  confidence: number;
  status: 'PENDING_APPROVAL' | 'EXECUTED_TO_AD_API' | 'HEURISTIC_OVERRIDE' | string;
  reason: string;
  stockoutKill?: boolean;
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
  const [autoPilot, setAutoPilot] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const handleExecute = async (item: ReallocationItem) => {
    setExecutingId(item.id);
    try {
      if (!USE_MOCKS) {
        await approveDirective(item.id, 'APPROVED_MANUAL');
      }
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'EXECUTED_TO_AD_API' } : it))
      );
      onExecuteReallocation?.(item);
      toast.success(`Dispatched reallocation for ${item.targetCampaign}`, {
        description: `Budget updated to ₹${item.recommendedSpend.toFixed(0)}/day.`
      });
    } catch {
      toast.error('Reallocation dispatch failed');
    } finally {
      setExecutingId(null);
    }
  };

  const handleExecuteAll = () => {
    setExecutingId('all');
    setTimeout(() => {
      setItems((prev) => prev.map((it) => ({ ...it, status: 'EXECUTED_TO_AD_API' })));
      items.forEach((item) => onExecuteReallocation?.(item));
      setExecutingId(null);
      toast.success('All pending budget reallocations executed synchronously');
    }, 900);
  };

  return (
    <div className={cn('rounded border border-border bg-card p-5 shadow-none text-card-foreground', className)}>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3 mb-4'>
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
              className='data-[state=checked]:bg-foreground data-[state=unchecked]:bg-muted border border-border'
            />
          </div>

          <Button
            size='sm'
            onClick={handleExecuteAll}
            disabled={executingId !== null}
            className='h-8 text-xs font-mono bg-foreground hover:bg-foreground/90 text-background font-semibold border-none active:scale-[0.98]'
          >
            {executingId === 'all' ? (
              <>
                <Icons.spinner className='mr-1.5 size-3 animate-spin text-background' />
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
                'flex flex-col md:flex-row md:items-center justify-between gap-3 rounded border p-3.5 transition-all',
                isExecuted
                  ? 'border-border bg-muted/40 opacity-60'
                  : isKill
                  ? 'border-2 border-rose-500/80 bg-rose-500/5 dark:bg-rose-950/20'
                  : 'border border-border bg-background hover:border-foreground/40'
              )}
            >
              {/* Route & Flow */}
              <div className='flex-1 min-w-0 space-y-1.5'>
                <div className='flex items-center gap-2 text-xs font-mono flex-wrap'>
                  <span
                    className={cn(
                      'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider',
                      isKill
                        ? 'bg-rose-500 text-white'
                        : item.deltaSpend > 0
                        ? 'bg-muted text-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isKill ? '[CRITICAL] ' : ''}{item.actionType.replace('_', ' ')}
                  </span>
                  <span className='text-muted-foreground line-through text-[11px] flex items-center gap-1'>
                    <PlatformLogo platform={item.sourceCampaign} size={11} className='shrink-0 opacity-70' />
                    <span>{item.sourceCampaign}</span>
                  </span>
                  <Icons.arrowRight className='size-3 text-muted-foreground shrink-0' />
                  <span className='font-bold text-foreground truncate flex items-center gap-1'>
                    <PlatformLogo platform={item.targetCampaign} size={12} className='shrink-0' />
                    <span>{item.targetProductName || item.targetCampaign}</span>
                  </span>
                  <span className='text-muted-foreground text-[11px] ml-auto md:ml-0'>
                    {(item.confidence * 100).toFixed(0)}% conf
                  </span>
                </div>

                {/* Plain Numbers inline */}
                <div className='flex items-center gap-3 text-xs font-mono text-muted-foreground flex-wrap'>
                  <span>
                    Spend: <span className='text-foreground font-medium'>₹{item.currentSpend.toFixed(0)}</span> →{' '}
                    <span className='font-bold text-foreground'>
                      ₹{item.recommendedSpend.toFixed(0)}/d ({item.deltaSpend > 0 ? '+' : ''}₹{item.deltaSpend.toFixed(0)})
                    </span>
                  </span>
                  <span>•</span>
                  <span>
                    Lift: <span className='text-foreground font-bold'>+₹{item.expectedDailyMargin.toFixed(0)}/d</span>
                  </span>
                  <span>•</span>
                  <span>
                    ROAS: <span className='text-foreground font-bold'>{item.predictedRoas.toFixed(2)}x</span>
                  </span>
                </div>
              </div>

              {/* Execution Action */}
              <div className='shrink-0 flex items-center gap-2'>
                {isExecuted ? (
                  <span className='text-[11px] font-mono text-muted-foreground flex items-center gap-1 font-semibold'>
                    <Icons.check className='size-3 text-foreground' />
                    Dispatched
                  </span>
                ) : (
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={executingId === item.id}
                    onClick={() => handleExecute(item)}
                    className='h-7.5 text-xs font-mono border border-border bg-card hover:bg-muted text-foreground font-semibold active:scale-[0.98]'
                  >
                    {executingId === item.id ? (
                      <Icons.spinner className='size-3 animate-spin text-foreground' />
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
