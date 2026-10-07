'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { RoasGauge } from '@/features/decision-engine/components/roas-gauge';
import initialEngineState from '@/data/nexus-engine-state.json';
import { cn } from '@/lib/utils';

export default function GaugesPage() {
  const [activePlatform, setActivePlatform] = useState<string>('all');
  const campaigns = initialEngineState.campaigns;

  const filtered = campaigns.filter((c: any) =>
    activePlatform === 'all' ? true : c.platform === activePlatform
  );

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#07090e] text-zinc-100 min-h-screen'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.trendingUp className='size-5 text-emerald-400' />
            <h1 className='text-xl font-mono font-bold text-zinc-100 uppercase tracking-tight'>
              Campaign ROAS Gauges &amp; Health Scoring Matrix
            </h1>
          </div>
          <p className='text-xs font-mono text-zinc-500 mt-1'>
            modery68 0-100 Campaign Health Score • Semicircular Target Arcs • ERP Stockout Guard
          </p>
        </div>

        <div className='flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-mono uppercase'>
          {(['all', 'meta', 'google', 'amazon', 'tiktok'] as const).map((plat) => (
            <button
              key={plat}
              onClick={() => setActivePlatform(plat)}
              className={cn(
                'px-3 py-1 rounded-md transition-all font-semibold',
                activePlatform === plat
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {filtered.map((c: any) => (
          <RoasGauge
            key={c.campaign}
            campaignName={c.campaign}
            productName={c.productName}
            photoUrl={c.photoUrl}
            platform={c.platform}
            inventory={c.inventory}
            currentRoas={c.roas}
            targetRoas={c.targetRoas}
            breakevenRoas={c.breakevenRoas}
            healthScore={c.healthScore}
          />
        ))}
      </div>
    </div>
  );
}
