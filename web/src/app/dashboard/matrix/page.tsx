'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import initialEngineState from '@/data/nexus-engine-state.json';
import { cn } from '@/lib/utils';

export default function MatrixPage() {
  const campaigns = initialEngineState.campaigns;

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.product className='size-5 text-emerald-600 dark:text-emerald-400' />
            <h1 className='text-xl font-mono font-bold text-foreground uppercase tracking-tight'>
              Nike SKU Economics &amp; Channel Allocation Matrix
            </h1>
          </div>
          <p className='text-xs font-mono text-muted-foreground mt-1'>
            Cross-platform Nike Footwear intelligence: PostgreSQL 16 • ERP Inventory • Gross Margin % • Marginal ROAS
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='font-mono text-xs border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 py-1 px-2.5 shadow-xs'>
            <span className='size-1.5 rounded-full bg-emerald-500 mr-2 animate-ping' />
            POSTGRESQL 16 CONNECTED
          </Badge>
          <Badge variant='outline' className='font-mono text-xs border-border text-muted-foreground bg-muted/40 py-1 px-2.5'>
            {campaigns.length} ACTIVE CAMPAIGNS
          </Badge>
        </div>
      </div>

      <div className='rounded-xl border border-border bg-card p-5 shadow-xs overflow-x-auto'>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider bg-slate-50/50 dark:bg-zinc-900/40'>
              <th className='py-3 px-3'>Shoe / Model</th>
              <th className='py-3 px-3'>Campaign</th>
              <th className='py-3 px-3'>Platform</th>
              <th className='py-3 px-3'>Category</th>
              <th className='py-3 px-3 text-right'>Unit Price</th>
              <th className='py-3 px-3 text-right'>Gross Margin</th>
              <th className='py-3 px-3 text-right'>ERP Stock</th>
              <th className='py-3 px-3 text-right'>Daily Spend</th>
              <th className='py-3 px-3 text-right'>Current ROAS</th>
              <th className='py-3 px-3 text-center'>Health</th>
              <th className='py-3 px-3 text-center'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {campaigns.map((c: any) => {
              const isStockout = c.inventory === 0;

              return (
                <tr key={c.campaign} className='hover:bg-muted/30 transition-colors'>
                  <td className='py-3 px-3 font-medium text-foreground'>
                    <div className='flex items-center gap-2.5'>
                      {c.photoUrl ? (
                        <div className='relative size-8 rounded border border-border bg-muted/20 overflow-hidden shrink-0'>
                          <Image
                            src={c.photoUrl}
                            alt={c.productName || c.sku}
                            fill
                            sizes='32px'
                            className='object-cover'
                          />
                        </div>
                      ) : (
                        <div className='size-8 rounded border border-border bg-muted/40 flex items-center justify-center text-[9px] text-muted-foreground font-bold shrink-0'>
                          NIKE
                        </div>
                      )}
                      <div>
                        <div className='font-bold text-foreground'>{c.productName || c.sku}</div>
                        <div className='text-[10px] text-muted-foreground'>{c.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className='py-3 px-3 font-mono text-muted-foreground'>{c.campaign}</td>
                  <td className='py-3 px-3 capitalize'>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-semibold border',
                        c.platform === 'meta'
                          ? 'border-sky-200 dark:border-blue-500/30 text-sky-700 dark:text-blue-400 bg-sky-50 dark:bg-blue-950/20'
                          : c.platform === 'google'
                          ? 'border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                          : c.platform === 'amazon'
                          ? 'border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20'
                          : 'border-rose-200 dark:border-pink-500/30 text-rose-700 dark:text-pink-400 bg-rose-50 dark:bg-pink-950/20'
                      )}
                    >
                      {c.platform}
                    </span>
                  </td>
                  <td className='py-3 px-3 text-muted-foreground text-[11px]'>{c.category || 'Sportswear'}</td>
                  <td className='py-3 px-3 text-right text-foreground font-bold tabular-nums'>₹{c.price.toFixed(2)}</td>
                  <td className='py-3 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold tabular-nums'>{c.marginPct.toFixed(1)}%</td>
                  <td className='py-3 px-3 text-right font-bold tabular-nums'>
                    {isStockout ? (
                      <span className='text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/40 px-2 py-0.5 rounded'>
                        0 (OUT)
                      </span>
                    ) : (
                      <span className='text-foreground'>{c.inventory.toLocaleString()} units</span>
                    )}
                  </td>
                  <td className='py-3 px-3 text-right text-foreground tabular-nums'>₹{c.currentDailySpend.toFixed(0)}</td>
                  <td className='py-3 px-3 text-right font-bold tabular-nums'>
                    <span
                      className={cn(
                        c.roas < 1.8 ? 'text-rose-600 dark:text-rose-400' : c.roas < 3.2 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                      )}
                    >
                      {c.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className='py-3 px-3 text-center'>
                    <Badge variant='outline' className='text-[10px] py-0 px-1.5 border-border text-foreground font-mono bg-muted/30'>
                      {c.healthScore}/100
                    </Badge>
                  </td>
                  <td className='py-3 px-3 text-center'>
                    <Badge
                      variant='outline'
                      className={cn(
                        'text-[10px] font-mono py-0 px-1.5',
                        isStockout
                          ? 'border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30'
                          : c.roasStatus === 'ABOVE_TARGET'
                          ? 'border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-border text-muted-foreground'
                      )}
                    >
                      {c.roasStatus}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
