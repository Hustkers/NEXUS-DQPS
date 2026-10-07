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
  const [fixingCampaign, setFixingCampaign] = useState<any | null>(null);
  const [fixedCampaigns, setFixedCampaigns] = useState<Record<string, boolean>>({});
  const campaigns = initialEngineState.campaigns;

  const filtered = campaigns.filter((c: any) =>
    activePlatform === 'all' ? true : c.platform === activePlatform
  );

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#000000] text-white min-h-screen'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[#1A1A1A] pb-4'>
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

        <div className='flex items-center gap-1.5 bg-[#1A1A1A] p-1 rounded border border-[#1A1A1A] text-xs font-mono uppercase'>
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
        {filtered.map((c: any) => {
          const isFixed = fixedCampaigns[c.campaign];
          return (
            <RoasGauge
              key={c.campaign}
              campaignName={c.campaign}
              productName={c.productName}
              photoUrl={c.photoUrl}
              platform={c.platform}
              inventory={isFixed ? 150 : c.inventory}
              currentRoas={c.roas}
              targetRoas={c.targetRoas}
              breakevenRoas={c.breakevenRoas}
              healthScore={isFixed ? 88 : c.healthScore}
              onFix={() => setFixingCampaign(c)}
              onAnalyze={() => {
                setAnalyzingProduct({
                  productName: c.productName || c.campaign,
                  sku: c.sku,
                  photoUrl: c.photoUrl,
                  platform: c.platform,
                  campaign: c.campaign,
                  inventory: isFixed ? 150 : c.inventory,
                  roas: c.roas,
                  targetRoas: c.targetRoas,
                  severity: isFixed ? 'HEALTHY' : c.roasStatus === 'CRITICAL_STOCKOUT' ? 'CRITICAL' : 'HEALTHY'
                });
              }}
            />
          );
        })}
      </div>

      {/* Stockout Fix Modal */}
      {fixingCampaign && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'>
          <div className='bg-[#1A1A1A] border border-[#1A1A1A] rounded-lg max-w-md w-full p-6 space-y-4 font-mono'>
            <div className='flex items-center justify-between border-b border-[#000000] pb-3'>
              <h3 className='text-base font-bold text-white uppercase tracking-tight flex items-center gap-2'>
                <span>Fix Stockout Protocol</span>
              </h3>
              <button
                onClick={() => setFixingCampaign(null)}
                className='text-[#8A8A8A] hover:text-white text-xs font-bold'
              >
                ✕
              </button>
            </div>
            <div className='text-xs text-[#8A8A8A] space-y-2'>
              <p>
                <strong className='text-white'>{fixingCampaign.productName || fixingCampaign.campaign}</strong> currently has <span className='text-red-400 font-bold'>0 units stock</span>.
              </p>
              <p>
                Automatic circuit breaker will throttle campaign spend to zero and route dynamic reserve inventory to Shopify/Amazon fulfillment.
              </p>
            </div>
            <div className='flex justify-end gap-2 pt-2 border-t border-[#000000]'>
              <button
                onClick={() => setFixingCampaign(null)}
                className='px-3 py-1.5 rounded border border-[#1A1A1A] text-xs text-white hover:bg-[#333333]'
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setFixedCampaigns((prev) => ({ ...prev, [fixingCampaign.campaign]: true }));
                  setFixingCampaign(null);
                }}
                className='px-3 py-1.5 rounded bg-white text-black text-xs font-bold hover:bg-neutral-200'
              >
                Execute Fix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysing Phase Modal featuring 3D GitHub Globe */}
      <ProductAnalysisModal
        product={analyzingProduct}
        isOpen={!!analyzingProduct}
        onClose={() => setAnalyzingProduct(null)}
      />
    </div>
  );
}
