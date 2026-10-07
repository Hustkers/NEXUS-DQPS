'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { RoasGauge } from '@/features/decision-engine/components/roas-gauge';
import { ProductAnalysisModal, type ProductAnalysisTarget } from '@/features/decision-engine/components/product-analysis-modal';
import initialEngineState from '@/data/nexus-engine-state.json';
import { cn } from '@/lib/utils';

export default function GaugesPage() {
  const [activePlatform, setActivePlatform] = useState<string>('all');
  const [analyzingProduct, setAnalyzingProduct] = useState<ProductAnalysisTarget | null>(null);
  const campaigns = initialEngineState.campaigns;

  const filtered = campaigns.filter((c: any) =>
    activePlatform === 'all' ? true : c.platform === activePlatform
  );

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#000000] text-white min-h-screen'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[#8A8A8A] pb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.trendingUp className='size-5 text-white' />
            <h1 className='text-xl font-mono font-bold text-white uppercase tracking-tight'>
              Campaign ROAS Gauges &amp; Health Scoring Matrix
            </h1>
          </div>
          <p className='text-xs font-mono text-[#8A8A8A] mt-1'>
            modery68 0-100 Campaign Health Score • Semicircular Target Arcs • ERP Stockout Guard
          </p>
        </div>

        <div className='flex items-center gap-1.5 bg-[#1A1A1A] p-1 rounded border border-[#8A8A8A] text-xs font-mono uppercase'>
          {(['all', 'meta', 'google', 'amazon', 'shopify'] as const).map((plat) => (
            <button
              key={plat}
              onClick={() => setActivePlatform(plat)}
              className={cn(
                'px-3 py-1 rounded transition-all font-semibold',
                activePlatform === plat
                  ? 'bg-white text-black font-bold'
                  : 'text-[#8A8A8A] hover:text-white'
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
            onAnalyze={() => {
              setAnalyzingProduct({
                productName: c.productName || c.campaign,
                sku: c.sku,
                photoUrl: c.photoUrl,
                platform: c.platform,
                campaign: c.campaign,
                inventory: c.inventory,
                roas: c.roas,
                targetRoas: c.targetRoas,
                severity: c.roasStatus === 'CRITICAL_STOCKOUT' ? 'CRITICAL' : 'HEALTHY'
              });
            }}
          />
        ))}
      </div>

      {/* Analysing Phase Modal featuring 3D GitHub Globe */}
      <ProductAnalysisModal
        product={analyzingProduct}
        isOpen={!!analyzingProduct}
        onClose={() => setAnalyzingProduct(null)}
      />
    </div>
  );
}
