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
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#07090e] text-zinc-100 min-h-screen'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.product className='size-5 text-emerald-400' />
            <h1 className='text-xl font-mono font-bold text-zinc-100 uppercase tracking-tight'>
              Nike SKU Economics &amp; Channel Allocation Matrix
            </h1>
          </div>
          <p className='text-xs font-mono text-zinc-500 mt-1'>
            Cross-platform Nike Footwear intelligence: PostgreSQL 16 • ERP Inventory • Gross Margin % • Marginal ROAS
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='font-mono text-xs border-emerald-500/40 text-emerald-400 bg-emerald-950/30 py-1 px-2.5'>
            <span className='size-1.5 rounded-full bg-emerald-400 mr-2 animate-ping' />
            POSTGRESQL 16 CONNECTED
          </Badge>
          <Badge variant='outline' className='font-mono text-xs border-zinc-700 text-zinc-300 py-1 px-2.5'>
            35 ACTIVE CAMPAIGNS
          </Badge>
        </div>
      </div>

      <div className='rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-sm overflow-x-auto'>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-zinc-800 text-[11px] text-zinc-500 uppercase tracking-wider'>
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
          <tbody className='divide-y divide-zinc-900'>
            {campaigns.map((c: any) => {
              const isStockout = c.inventory === 0;

              return (
                <tr key={c.campaign} className='hover:bg-zinc-900/40 transition-colors'>
                  <td className='py-3 px-3 font-medium text-zinc-200'>
                    <div className='flex items-center gap-2.5'>
                      {c.photoUrl ? (
                        <div className='relative size-8 rounded border border-zinc-800 bg-zinc-900 overflow-hidden shrink-0'>
                          <Image
                            src={c.photoUrl}
                            alt={c.productName || c.sku}
                            fill
                            sizes='32px'
                            className='object-cover'
                          />
                        </div>
                      ) : (
                        <div className='size-8 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center text-[9px] text-zinc-600 shrink-0'>
                          NIKE
                        </div>
                      )}
                      <div>
                        <div className='font-bold text-zinc-100'>{c.productName || c.sku}</div>
                        <div className='text-[10px] text-zinc-500'>{c.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className='py-3 px-3 font-mono text-zinc-400'>{c.campaign}</td>
                  <td className='py-3 px-3 capitalize text-zinc-300'>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] border',
                        c.platform === 'meta'
                          ? 'border-blue-500/30 text-blue-400 bg-blue-950/20'
                          : c.platform === 'google'
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20'
                          : c.platform === 'amazon'
                          ? 'border-amber-500/30 text-amber-400 bg-amber-950/20'
                          : 'border-pink-500/30 text-pink-400 bg-pink-950/20'
                      )}
                    >
                      {c.platform}
                    </span>
                  </td>
                  <td className='py-3 px-3 text-zinc-400 text-[11px]'>{c.category || 'Sportswear'}</td>
                  <td className='py-3 px-3 text-right text-zinc-300 font-bold'>${c.price.toFixed(2)}</td>
                  <td className='py-3 px-3 text-right text-emerald-400 font-bold'>{c.marginPct.toFixed(1)}%</td>
                  <td className='py-3 px-3 text-right font-bold'>
                    {isStockout ? (
                      <span className='text-rose-400 bg-rose-950/50 border border-rose-500/40 px-2 py-0.5 rounded'>
                        0 (OUT)
                      </span>
                    ) : (
                      <span className='text-zinc-300'>{c.inventory.toLocaleString()} units</span>
                    )}
                  </td>
                  <td className='py-3 px-3 text-right text-zinc-300'>${c.currentDailySpend.toFixed(0)}</td>
                  <td className='py-3 px-3 text-right font-bold'>
                    <span
                      className={cn(
                        c.roas < 1.8 ? 'text-rose-400' : c.roas < 3.2 ? 'text-amber-400' : 'text-emerald-400'
                      )}
                    >
                      {c.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className='py-3 px-3 text-center'>
                    <Badge variant='outline' className='text-[10px] py-0 px-1 border-zinc-700 text-zinc-300 font-mono'>
                      {c.healthScore}/100
                    </Badge>
                  </td>
                  <td className='py-3 px-3 text-center'>
                    <Badge
                      variant='outline'
                      className={cn(
                        'text-[10px] font-mono py-0 px-1.5',
                        isStockout
                          ? 'border-rose-500/40 text-rose-400 bg-rose-950/30'
                          : c.roasStatus === 'ABOVE_TARGET'
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
                          : 'border-zinc-700 text-zinc-300'
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
