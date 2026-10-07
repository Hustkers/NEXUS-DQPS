'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/icons';
import { PlatformLogo } from '@/components/icons/platform-logos';
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
                <div className='flex items-center gap-2 text-xs font-mono flex-wrap'>
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
                  <span className='text-[#8A8A8A] line-through text-[11px] flex items-center gap-1'>
                    <PlatformLogo platform={item.sourceCampaign} size={11} className='shrink-0 opacity-70' />
                    <span>{item.sourceCampaign}</span>
                  </span>
                  <Icons.arrowRight className='size-3 text-[#8A8A8A] shrink-0' />
                  <span className='font-bold text-[#FFFFFF] truncate flex items-center gap-1'>
                    <PlatformLogo platform={item.targetCampaign} size={12} className='shrink-0' />
                    <span>{item.targetProductName || item.targetCampaign}</span>
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
              </div>

              {/* Execution Action */}
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
                    disabled={executingId === item.id}
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
    </div>
  );
}
