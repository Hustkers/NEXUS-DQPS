'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { IconPackage, IconChevronDown, IconCheck, IconX, IconAlertTriangle } from '@tabler/icons-react';
import type { PlaygroundProductSummary } from '../../types/ad-playground-types';
import { cn } from '@/lib/utils';

interface PlaygroundCompactProductSelectorProps {
  products: PlaygroundProductSummary[];
  selectedProduct: PlaygroundProductSummary;
  onSelectSku: (sku: string) => void;
  isInventoryConstrained?: boolean;
}

export function PlaygroundCompactProductSelector({
  products,
  selectedProduct,
  onSelectSku,
  isInventoryConstrained
}: PlaygroundCompactProductSelectorProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isStockout = selectedProduct.inventory <= 0;
  const isLowStock = selectedProduct.inventory > 0 && selectedProduct.inventory < 25;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='relative font-sans'>
      {/* Compact Main Card (Single selected product) */}
      <div className='rounded-xl border border-zinc-800 bg-[#121215] p-4 transition-all duration-200 hover:border-zinc-700'>
        <div className='flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-800'>
          <span className='text-[10px] uppercase font-semibold tracking-wider text-zinc-400 flex items-center gap-1.5 font-sans'>
            <IconPackage className='size-3.5 text-zinc-300' />
            TARGET PRODUCT
          </span>

          {/* Small Inventory Status Guardrail */}
          <div className='flex items-center gap-1.5'>
            <span
              className={cn(
                'size-2 rounded-full',
                isStockout
                  ? 'bg-rose-500'
                  : isLowStock
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
              )}
            />
            <span
              className={cn(
                'text-[10px] font-mono font-medium uppercase tracking-wider',
                isStockout
                  ? 'text-rose-400'
                  : isLowStock
                    ? 'text-amber-400'
                    : 'text-emerald-400'
              )}
            >
              {isStockout ? 'STOCKOUT' : isLowStock ? 'LOW STOCK' : 'SAFE'}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-3.5'>
          {/* Shoe Thumbnail */}
          <div className='relative size-16 sm:size-18 rounded-lg overflow-hidden bg-muted/40 border border-border/80 shrink-0'>
            {selectedProduct.photoUrl ? (
              <Image
                src={selectedProduct.photoUrl}
                alt={selectedProduct.name}
                fill
                sizes='72px'
                className='object-cover'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                <IconPackage className='size-6' />
              </div>
            )}
          </div>

          {/* Product Meta */}
          <div className='flex-1 min-w-0'>
            <h3 className='text-sm sm:text-base font-semibold text-zinc-100 truncate' title={selectedProduct.name}>
              {selectedProduct.name}
            </h3>
            <p className='text-[11px] text-zinc-400 font-mono mt-0.5 truncate'>
              SKU: {selectedProduct.sku} • {selectedProduct.category}
            </p>

            <div className='flex flex-wrap items-center gap-3 mt-1.5 text-xs font-mono tabular-nums'>
              <span className='font-semibold text-zinc-100'>
                ${selectedProduct.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className='text-zinc-500'>•</span>
              <span className={cn('font-medium', isStockout ? 'text-rose-400 font-bold' : 'text-zinc-300')}>
                {selectedProduct.inventory} units in stock
              </span>
              <span className='text-zinc-500'>•</span>
              <span className='text-zinc-400'>
                {selectedProduct.grossMarginPct}% margin
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Guardrail notice if constrained */}
        {isInventoryConstrained && !isStockout && (
          <div className='mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-mono'>
            <IconAlertTriangle className='size-3 shrink-0' />
            <span>Inventory constrained: Conversion demand exceeds inventory stock</span>
          </div>
        )}

        {/* Change Product Button */}
        <div className='mt-3 pt-3 border-t border-border/60 flex items-center justify-between'>
          <button
            type='button'
            onClick={() => setIsDrawerOpen(true)}
            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted/60 text-xs font-mono font-medium text-foreground transition-all hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500'
          >
            <span>Change product</span>
            <IconChevronDown className='size-3.5 text-muted-foreground' />
          </button>

          <span className='text-[10px] text-muted-foreground font-mono'>
            {products.length} catalog shoes available
          </span>
        </div>
      </div>

      {/* Slide-over Drawer / Modal for Catalog Selection */}
      {isDrawerOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-0 duration-150'>
          <div
            className='relative w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl font-mono text-foreground animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col'
            role='dialog'
            aria-modal='true'
            aria-label='Select Catalog Product'
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-border pb-3 mb-3'>
              <div>
                <h4 className='text-sm font-bold uppercase tracking-tight text-foreground flex items-center gap-1.5'>
                  <IconPackage className='size-4 text-cyan-400' />
                  Select Catalog Product
                </h4>
                <p className='text-[11px] text-muted-foreground mt-0.5'>
                  Choose footwear SKU to load pricing, margin and inventory priors
                </p>
              </div>

              <button
                type='button'
                onClick={() => setIsDrawerOpen(false)}
                className='size-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors'
                aria-label='Close drawer'
              >
                <IconX className='size-4' />
              </button>
            </div>

            {/* Search Input */}
            <div className='mb-3'>
              <input
                type='text'
                placeholder='Search by product name, SKU, or category...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full px-3 py-2 rounded-lg border border-border/80 bg-background text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500'
              />
            </div>

            {/* Product List */}
            <div className='overflow-y-auto space-y-2 pr-1 flex-1 min-h-[260px] scrollbar-thin'>
              {filteredProducts.map((p) => {
                const isSelected = p.sku === selectedProduct.sku;
                const pStockout = p.inventory <= 0;

                return (
                  <button
                    key={p.sku}
                    type='button'
                    onClick={() => {
                      onSelectSku(p.sku);
                      setIsDrawerOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all group',
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500/40'
                        : 'border-border/60 bg-muted/20 hover:border-border hover:bg-muted/50'
                    )}
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      <div className='relative size-12 rounded-lg overflow-hidden bg-muted/50 border border-border/60 shrink-0'>
                        {p.photoUrl ? (
                          <Image
                            src={p.photoUrl}
                            alt={p.name}
                            fill
                            sizes='48px'
                            className='object-cover'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                            <IconPackage className='size-4' />
                          </div>
                        )}
                      </div>

                      <div className='min-w-0'>
                        <div className='text-xs font-semibold text-zinc-100 truncate group-hover:text-zinc-300 transition-colors'>
                          {p.name}
                        </div>
                        <div className='text-[10px] text-zinc-400 mt-0.5 font-mono tabular-nums'>
                          ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • {p.grossMarginPct}% margin
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-3 shrink-0 ml-3'>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                          pStockout
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        )}
                      >
                        {pStockout ? '0 Stock' : `${p.inventory} Units`}
                      </span>

                      {isSelected ? (
                        <div className='size-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center'>
                          <IconCheck className='size-3 stroke-[3]' />
                        </div>
                      ) : (
                        <div className='size-5 rounded-full border border-border/60' />
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className='p-8 text-center text-xs text-muted-foreground'>
                  No products found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
