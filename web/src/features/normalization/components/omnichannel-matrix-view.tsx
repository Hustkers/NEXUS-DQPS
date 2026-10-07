'use client';

import React from 'react';
import {
  IconBrandMeta,
  IconBrandGoogle,
  IconBrandAmazon,
  IconBuildingStore,
  IconArrowsSplit2,
  IconRocket
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CrossChannelComparisonItem } from '../normalization-engine';

interface OmnichannelMatrixViewProps {
  items: CrossChannelComparisonItem[];
  onSelectPlatform: (platform: 'meta' | 'google' | 'amazon' | 'shopify') => void;
  selectedPlatform: 'meta' | 'google' | 'amazon' | 'shopify';
}

function getIcon(key: string) {
  switch (key) {
    case 'meta':
      return IconBrandMeta;
    case 'google':
      return IconBrandGoogle;
    case 'amazon':
      return IconBrandAmazon;
    case 'shopify':
      return IconBuildingStore;
    default:
      return IconArrowsSplit2;
  }
}

function handleDispatchAll() {
  toast.success('Omnichannel Tensor Dispatched to Multi-Arm Bandit', {
    description: 'Normalized data across Meta, Google, Amazon, and Shopify queued for real-time budget arbitration.'
  });
}

export function OmnichannelMatrixView({
  items,
  onSelectPlatform,
  selectedPlatform
}: OmnichannelMatrixViewProps) {
  return (
    <div className='rounded-xl border border-border/80 bg-card p-4 shadow-xs font-mono space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
        <div>
          <h3 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2'>
            <IconArrowsSplit2 className='size-4 text-cyan-400' />
            Omnichannel Unified Matrix &amp; Arbitrage Overview
          </h3>
          <p className='text-[11px] text-muted-foreground mt-0.5'>
            All 4 advertising and storefront channels normalized into a synchronized decision state
          </p>
        </div>

        <Button
          size='sm'
          onClick={handleDispatchAll}
          className='bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer font-mono'
        >
          <IconRocket className='size-3.5' />
          <span>Dispatch All to RL Engine</span>
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3'>
        {items.map((item) => {
          const Icon = getIcon(item.channelKey);
          const isSelected = selectedPlatform === item.channelKey;

          return (
            <button
              type='button'
              key={item.channelKey}
              aria-label={`Select ${item.channel} platform`}
              onClick={() => onSelectPlatform(item.channelKey)}
              className={cn(
                'p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-left font-mono w-full',
                isSelected
                  ? 'border-cyan-500/80 bg-muted/40 shadow-md ring-2 ring-cyan-500/30'
                  : 'border-border/70 bg-card/60 hover:bg-muted/30 hover:border-border'
              )}
            >
              <div className='w-full'>
                <div className='flex items-center justify-between mb-3 w-full'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='size-7 rounded-lg flex items-center justify-center font-bold shrink-0'
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <Icon className='size-4' />
                    </div>
                    <div>
                      <div className='text-xs font-bold text-foreground'>{item.channel}</div>
                      <div className='text-[10px] text-muted-foreground'>SKU: {item.sku}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <Badge className='bg-cyan-500 text-black text-[9px] font-bold px-1.5 py-0'>
                      ACTIVE
                    </Badge>
                  )}
                </div>

                <div className='space-y-1.5 text-xs w-full'>
                  <div className='flex items-center justify-between w-full'>
                    <span className='text-muted-foreground text-[11px]'>Clean Spend:</span>
                    <span className='font-bold text-foreground'>${item.spend.toFixed(2)}</span>
                  </div>
                  <div className='flex items-center justify-between w-full'>
                    <span className='text-muted-foreground text-[11px]'>Attributed Rev:</span>
                    <span className='font-bold text-emerald-400'>${item.revenue.toFixed(2)}</span>
                  </div>
                  <div className='flex items-center justify-between w-full'>
                    <span className='text-muted-foreground text-[11px]'>Net Margin (CM3):</span>
                    <span className='font-bold text-indigo-400'>${item.netMargin.toFixed(2)}</span>
                  </div>
                  <div className='flex items-center justify-between w-full'>
                    <span className='text-muted-foreground text-[11px]'>Attributed ROAS:</span>
                    <span className='font-bold text-purple-400'>{item.roas.toFixed(2)}x</span>
                  </div>
                  <div className='flex items-center justify-between w-full'>
                    <span className='text-muted-foreground text-[11px]'>Orders:</span>
                    <span className='font-bold text-foreground'>{item.conversions} units</span>
                  </div>
                </div>
              </div>

              <div className='mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground w-full'>
                <span>CTR: {item.ctr.toFixed(2)}%</span>
                <span className='text-cyan-400 font-semibold flex items-center gap-1'>
                  Inspect &rarr;
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
