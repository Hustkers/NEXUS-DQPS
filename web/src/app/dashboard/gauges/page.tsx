'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { RoasGauge } from '@/features/decision-engine/components/roas-gauge';
import {
  ProductAnalysisModal,
  type ProductAnalysisTarget
} from '@/features/decision-engine/components/product-analysis-modal';
import initialEngineState from '@/data/nexus-engine-state.json';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function GaugesPage() {
  const [activePlatform, setActivePlatform] = useState<string>('all');
  const [analyzingProduct, setAnalyzingProduct] = useState<ProductAnalysisTarget | null>(null);
  const campaigns = initialEngineState.campaigns;

  const stockoutCount = campaigns.filter(
    (c: any) =>
      (c.inventory !== undefined && c.inventory <= 0) || c.roasStatus === 'CRITICAL_STOCKOUT'
  ).length;

  const filtered = campaigns.filter((c: any) => {
    if (activePlatform === 'all') return true;
    if (activePlatform === 'stockout') {
      return (
        (c.inventory !== undefined && c.inventory <= 0) ||
        c.roasStatus === 'CRITICAL_STOCKOUT'
      );
    }
    return c.platform === activePlatform;
  });

  const handleFix = (c: any) => {
    toast.error(`Fix Stockout: ${c.productName || c.campaign}`, {
      description: `Circuit breaker active. Inventory is 0 on ${c.platform.toUpperCase()}. Ready for mitigation configuration.`,
      duration: 4000
    });
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.trendingUp className='size-5 text-emerald-600 dark:text-emerald-400' />
            <h1 className='text-xl font-mono font-bold text-foreground uppercase tracking-tight'>
              Campaign ROAS Gauges &amp; Health Scoring Matrix
            </h1>
          </div>
          <p className='text-xs font-mono text-muted-foreground mt-1'>
            35 Multi-Channel Campaigns • {stockoutCount} Active Stockout Circuit-Breakers • Semicircular Target Arcs
          </p>
        </div>

        <div className='flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg border border-border text-xs font-mono uppercase'>
          {(['all', 'stockout', 'meta', 'google', 'amazon', 'tiktok'] as const).map((plat) => (
            <button
              key={plat}
              onClick={() => setActivePlatform(plat)}
              className={cn(
                'px-3 py-1 rounded-md transition-all font-semibold flex items-center gap-1.5',
                activePlatform === plat
                  ? 'bg-card text-foreground font-bold shadow-2xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground',
                plat === 'stockout' && activePlatform === plat && 'text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
              )}
            >
              <span>{plat === 'stockout' ? 'Stockouts' : plat}</span>
              {plat === 'stockout' && (
                <span className='px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-mono'>
                  {stockoutCount}
                </span>
              )}
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
            onFix={() => handleFix(c)}
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
