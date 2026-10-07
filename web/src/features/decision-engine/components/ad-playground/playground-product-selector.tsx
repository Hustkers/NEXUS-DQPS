'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { IconCheck, IconPackage, IconStar, IconTrendingUp } from '@tabler/icons-react';
import type { PlaygroundProductSummary } from '../../types/ad-playground-types';
import { cn } from '@/lib/utils';

interface PlaygroundProductSelectorProps {
  products: PlaygroundProductSummary[];
  selectedSku: string;
  onSelectSku: (sku: string) => void;
}

export function PlaygroundProductSelector({
  products,
  selectedSku,
  onSelectSku
}: PlaygroundProductSelectorProps) {
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <IconPackage className='size-4 text-cyan-500' />
          <h2 className='text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground'>
            Target Footwear Model ({products.length} Products Catalog)
          </h2>
        </div>
        <span className='text-[11px] font-mono text-muted-foreground'>
          Select product to simulate campaigns
        </span>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[310px] overflow-y-auto p-1 pr-2 scrollbar-thin'>
        {products.map((p) => {
          const isSelected = p.sku === selectedSku;
          const isStockout = p.inventory <= 0;

          return (
            <Card
              key={p.sku}
              onClick={() => onSelectSku(p.sku)}
              className={cn(
                'group relative flex flex-col p-2.5 cursor-pointer rounded-lg border transition-all duration-200 select-none overflow-hidden',
                isSelected
                  ? 'border-cyan-500 bg-cyan-950/20 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/50'
                  : 'border-border/80 bg-card/60 hover:border-cyan-500/40 hover:bg-muted/40'
              )}
            >
              {isSelected && (
                <div className='absolute top-1.5 right-1.5 size-4 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-xs'>
                  <IconCheck className='size-3 stroke-[3]' />
                </div>
              )}

              <div className='relative w-full aspect-square rounded-md overflow-hidden bg-muted/30 mb-2 border border-border/50'>
                {p.photoUrl ? (
                  <Image
                    src={p.photoUrl}
                    alt={p.name}
                    fill
                    sizes='120px'
                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                    <IconPackage className='size-6' />
                  </div>
                )}
              </div>

              <div className='flex flex-col flex-1 justify-between min-w-0'>
                <div>
                  <h3 className='text-xs font-semibold text-foreground truncate group-hover:text-cyan-400 transition-colors'>
                    {p.name}
                  </h3>
                  <div className='flex items-center justify-between text-[10px] font-mono text-muted-foreground mt-0.5'>
                    <span>${p.price.toFixed(0)}</span>
                    <span className='flex items-center gap-0.5 text-amber-500'>
                      <IconStar className='size-2.5 fill-amber-500' />
                      {p.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className='flex items-center justify-between mt-2 pt-1.5 border-t border-border/50 text-[10px] font-mono'>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase',
                      isStockout
                        ? 'bg-rose-950/50 text-rose-400 border border-rose-800/40'
                        : 'bg-emerald-950/40 text-emerald-400'
                    )}
                  >
                    {isStockout ? 'Stockout' : `${p.inventory} Units`}
                  </span>

                  <span className='flex items-center gap-0.5 text-cyan-400 font-semibold'>
                    <IconTrendingUp className='size-2.5' />
                    {p.historicalRoas.toFixed(1)}x
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
