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
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#000000] text-white min-h-screen'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.product className='size-5 text-white' />
            <h1 className='text-xl font-mono font-bold text-white uppercase tracking-tight'>
              Nike SKU Economics &amp; Channel Allocation Matrix
            </h1>
          </div>
          <p className='text-xs font-mono text-[#8A8A8A] mt-1'>
            Cross-platform Nike Footwear intelligence: PostgreSQL 16 • ERP Inventory • Gross Margin % • Marginal ROAS
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='font-mono text-xs border-[#1A1A1A] text-white bg-[#1A1A1A] py-1 px-2.5 shadow-none'>
            <span className='size-1.5 rounded-full bg-white mr-2' />
            POSTGRESQL 16 CONNECTED
          </Badge>
          <Badge variant='outline' className='font-mono text-xs border-[#1A1A1A] text-[#8A8A8A] bg-[#000000] py-1 px-2.5'>
            {campaigns.length} ACTIVE CAMPAIGNS
          </Badge>
        </div>
      </div>

      <div className='rounded border border-[#1A1A1A] bg-[#1A1A1A] p-5 shadow-none overflow-x-auto'>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-[#1A1A1A] text-[11px] text-[#8A8A8A] uppercase tracking-wider bg-[#000000]'>
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
          <tbody className='divide-y divide-[#000000]'>
            {campaigns.map((c: any) => {
              const isStockout = c.inventory === 0;

              return (
                <tr key={c.campaign} className='hover:bg-[#000000] transition-colors'>
                  <td className='py-3 px-3 font-medium text-white'>
                    <div className='flex items-center gap-2.5'>
                      {c.photoUrl ? (
                        <div className='relative size-8 rounded border border-[#1A1A1A] bg-[#000000] overflow-hidden shrink-0'>
                          <Image
                            src={c.photoUrl}
                            alt={c.productName || c.sku}
                            fill
                            sizes='32px'
                            className='object-cover'
                          />
                        </div>
                      ) : (
                        <div className='size-8 rounded border border-[#1A1A1A] bg-[#000000] flex items-center justify-center text-[9px] text-[#8A8A8A] font-bold shrink-0'>
                          NIKE
                        </div>
                      )}
                      <div>
                        <div className='font-bold text-white'>{c.productName || c.sku}</div>
                        <div className='text-[10px] text-[#8A8A8A]'>{c.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className='py-3 px-3 font-mono text-[#8A8A8A]'>{c.campaign}</td>
                  <td className='py-3 px-3 capitalize'>
                    <span
                      className='px-2 py-0.5 rounded text-[10px] font-semibold border border-[#1A1A1A] text-white bg-[#000000]'
                    >
                      {c.platform}
                    </span>
                  </td>
                  <td className='py-3 px-3 text-[#8A8A8A] text-[11px]'>{c.category || 'Sportswear'}</td>
                  <td className='py-3 px-3 text-right text-white font-bold tabular-nums'>₹{c.price.toFixed(2)}</td>
                  <td className='py-3 px-3 text-right text-white font-bold tabular-nums'>{c.marginPct.toFixed(1)}%</td>
                  <td className='py-3 px-3 text-right font-bold tabular-nums'>
                    {isStockout ? (
                      <span className='text-black bg-white font-mono px-2 py-0.5 rounded font-bold'>
                        0 (OUT)
                      </span>
                    ) : (
                      <span className='text-white'>{c.inventory.toLocaleString()} units</span>
                    )}
                  </td>
                  <td className='py-3 px-3 text-right text-white tabular-nums'>₹{c.currentDailySpend.toFixed(0)}</td>
                  <td className='py-3 px-3 text-right font-bold tabular-nums'>
                    <span
                      className={cn(
                        'font-mono',
                        c.roas < 1.8 ? 'text-black bg-white px-1.5 py-0.5 rounded' : c.roas < 3.2 ? 'text-[#8A8A8A]' : 'text-white'
                      )}
                    >
                      {c.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className='py-3 px-3 text-center'>
                    <Badge variant='outline' className='text-[10px] py-0 px-1.5 border-none text-white font-mono bg-[#000000]'>
                      {c.healthScore}/100
                    </Badge>
                  </td>
                  <td className='py-3 px-3 text-center'>
                    <Badge
                      variant='outline'
                      className={cn(
                        'text-[10px] font-mono py-0 px-1.5 border-none',
                        isStockout
                          ? 'text-black bg-white font-bold'
                          : c.roasStatus === 'ABOVE_TARGET'
                          ? 'text-white bg-[#1A1A1A]'
                          : 'text-[#8A8A8A] bg-[#000000]'
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
