'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/icons';
import { useDecisionEngine } from '@/context/decision-engine-store';
import { formatINR, type ReallocationItem } from '@/lib/gauges-engine';
import { ActionDrawer } from './action-drawer';
import { cn } from '@/lib/utils';

export type { ReallocationItem } from '@/lib/gauges-engine';

export interface ReallocationFeedProps {
  initialItems?: any;
  campaigns?: any;
  onExecuteReallocation?: (item: any, details?: any) => void;
  className?: string;
}

export function ReallocationFeed({ className }: ReallocationFeedProps = {}) {
  const { reallocations, autoPilot, toggleAutoPilot } = useDecisionEngine();

  // Drawer state
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenRowExecute = (item: ReallocationItem) => {
    setSelectedActionId(item.id);
    setIsDrawerOpen(true);
  };

  const handleOpenExecuteAll = () => {
    if (reallocations.length === 0) return;
    setSelectedActionId('execute-all');
    setIsDrawerOpen(true);
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-5 shadow-none text-card-foreground font-mono',
        className
      )}
    >
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3 mb-2'>
        <div className='flex items-center gap-2'>
          <Icons.adjustments className='size-3.5 text-muted-foreground' />
          <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
            Autonomous Capital Reallocation Stream
          </h3>
          <span className='text-xs text-muted-foreground'>
            ({reallocations.length} pending)
          </span>
        </div>

        <div className='flex items-center gap-4'>
          {/* Auto-Pilot Toggle */}
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span className={cn(autoPilot && 'text-emerald-400 font-bold')}>
              Auto-Pilot (≥80% conf)
            </span>
            <Switch
              checked={autoPilot}
              onCheckedChange={toggleAutoPilot}
              className='data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-muted border border-border'
            />
          </div>

          <Button
            size='sm'
            onClick={handleOpenExecuteAll}
            disabled={reallocations.length === 0}
            className='h-8 text-xs font-mono bg-foreground hover:bg-foreground/90 text-background font-bold border-none active:scale-[0.98] shadow-sm'
          >
            Execute All
          </Button>
        </div>
      </div>

      {/* Streamlined Reallocation Rows */}
      {reallocations.length === 0 ? (
        <div className='rounded-lg border border-border bg-muted/20 p-8 text-center my-2'>
          <Icons.check className='size-5 text-emerald-400 mx-auto mb-2' />
          <p className='text-xs font-semibold text-foreground'>
            All Capital Reallocations Executed &amp; Calibrated
          </p>
          <p className='text-[11px] text-muted-foreground mt-0.5'>
            No pending budget rebalancing directives at this optimization tick.
          </p>
        </div>
      ) : (
        <div className='divide-y divide-[#1F1F1F]'>
          {reallocations.map((item) => {
            const isPause = item.actionTag === 'PAUSE';
            const isRedirect = item.actionTag === 'REDIRECT';
            const actionLabel = isPause
              ? 'PAUSE'
              : isRedirect
              ? 'REDIRECT'
              : 'TRIM';

            const badgeColor = isPause
              ? 'bg-rose-950/60 text-rose-400 border-rose-800/40'
              : isRedirect
              ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
              : 'bg-neutral-900 text-neutral-300 border-neutral-700/60';

            return (
              <div
                key={item.id}
                className='py-6 px-3 sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-all duration-300 rounded-lg group'
              >
                {/* One readable line: Zoom Fly (Shopify) → Air Max 2017 (Amazon) · ₹307/day · +₹1,850/day · 82% */}
                <div className='flex-1 min-w-0 space-y-1.5'>
                  <div className='flex items-center gap-2 text-xs flex-wrap leading-relaxed'>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono tracking-wider',
                        badgeColor
                      )}
                    >
                      [{actionLabel}]
                    </span>

                    <span className='font-bold text-white break-words'>
                      {item.sourceProductName} ({item.sourceChannel}) →{' '}
                      {item.targetProductName} ({item.targetChannel})
                    </span>

                    <span className='text-[#8A8A8A]'>·</span>

                    <span className='text-white font-medium'>
                      {formatINR(item.movedAmount)}
                    </span>

                    <span className='text-[#8A8A8A]'>·</span>

                    <span className='text-emerald-400 font-bold'>
                      +{formatINR(item.netRevenueLift)}
                    </span>

                    <span className='text-[#8A8A8A]'>·</span>

                    <span className='text-[#A3A3A3]'>{item.confidence}%</span>
                  </div>

                  {/* Campaign IDs only as small grey secondary text */}
                  <div className='text-[11px] text-[#737373] font-mono'>
                    #{item.sourceCampaign} → #{item.targetCampaign}
                  </div>
                </div>

                {/* Single Execute Button */}
                <div className='shrink-0 flex items-center'>
                  <Button
                    size='sm'
                    onClick={() => handleOpenRowExecute(item)}
                    className='h-8 px-4 text-xs font-mono bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-[0.98]'
                  >
                    Execute
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Drawer (Single Shared Right-Side Drawer Component) */}
      <ActionDrawer
        actionId={selectedActionId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
