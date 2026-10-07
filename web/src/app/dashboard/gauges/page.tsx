'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { RoasGauge } from '@/features/decision-engine/components/roas-gauge';
import { ActionDrawer } from '@/features/decision-engine/components/action-drawer';
import { GaugesDecisionLedgerTable } from '@/features/decision-engine/components/gauges-decision-ledger-table';
import { ProductAnalysisModal, type ProductAnalysisTarget } from '@/features/decision-engine/components/product-analysis-modal';
import { useDecisionEngine } from '@/context/decision-engine-store';
import { formatINR, type DerivedProduct } from '@/lib/gauges-engine';
import { cn } from '@/lib/utils';

type FilterChip = 'all' | 'needs_fix' | 'fixed';

export default function GaugesPage() {
  const {
    products,
    ledger,
    topKpis,
    resetToDefaults,
  } = useDecisionEngine();

  // Filters
  const [filterChip, setFilterChip] = useState<FilterChip>('all');
  const [activeChannel, setActiveChannel] = useState<string>('all');

  // Action Drawer interactions
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [drawerInitialState, setDrawerInitialState] = useState<'review' | 'done'>('review');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Analyzing Modal (3D Globe inspection)
  const [analyzingProduct, setAnalyzingProduct] = useState<ProductAnalysisTarget | null>(null);

  // Filter products by Filter Chips & Channel
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filterChip === 'needs_fix') {
        if (p.isFixed || p.status === 'target met') return false;
      } else if (filterChip === 'fixed') {
        if (!p.isFixed) return false;
      }

      if (activeChannel !== 'all') {
        if (p.channel.toLowerCase() !== activeChannel.toLowerCase()) return false;
      }

      return true;
    });
  }, [products, filterChip, activeChannel]);

  // Handle opening FIX in Action Drawer
  const handleOpenFix = (product: DerivedProduct) => {
    setActiveActionId(`fix-${product.id}`);
    setDrawerInitialState('review');
    setIsDrawerOpen(true);
  };

  // Handle opening VIEW FIX summary in Action Drawer
  const handleOpenViewFix = (product: DerivedProduct) => {
    setActiveActionId(`fix-${product.id}`);
    setDrawerInitialState('done');
    setIsDrawerOpen(true);
  };

  // Reset to default test state
  const handleResetToDefaults = () => {
    if (window.confirm('Reset all campaigns and decision ledger to initial state?')) {
      resetToDefaults();
    }
  };

  return (
    <div className='flex flex-1 flex-col gap-4 md:gap-5 p-4 md:p-6 bg-background text-foreground min-h-screen font-mono min-w-0 max-w-full'>
      {/* 1. COMPACT PAGE HEADER */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3'>
        <div className='flex items-center gap-2.5 flex-wrap'>
          <div className='flex items-center gap-2'>
            <Icons.trendingUp className='size-4 text-emerald-500' />
            <h1 className='text-base sm:text-lg font-black text-foreground uppercase tracking-tight'>
              ROAS &amp; HEALTH GAUGES
            </h1>
          </div>
          <div className='flex items-center gap-1.5 text-[10px] text-muted-foreground'>
            <span className='px-1.5 py-0.5 rounded bg-muted/50 border border-border font-bold uppercase'>
              Nike Direct
            </span>
            <span className='px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold'>
              Target: 3.2x • Floor: 1.8x
            </span>
          </div>
        </div>

        <button
          onClick={handleResetToDefaults}
          className='px-2.5 py-1 rounded-md border border-border bg-card hover:bg-muted/40 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer'
          title='Reset campaigns and ledger to factory seed data'
        >
          Reset Data
        </button>
      </div>

      {/* 2. COMPACT TOP COMMAND STRIP (4 KPIs) */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {/* Blended ROAS */}
        <div className='rounded-xl border border-border/80 bg-card p-3 flex flex-col justify-between shadow-2xs hover:border-foreground/30 transition-all'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold'>
            <span>Blended ROAS</span>
            <span className={cn('text-[9px] font-bold', topKpis.blendedRoas >= 3.2 ? 'text-emerald-500' : 'text-sky-500')}>
              {topKpis.blendedRoas >= 3.2 ? '● Target Met' : '○ Pacing'}
            </span>
          </div>
          <div className='text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mt-1'>
            {topKpis.blendedRoas.toFixed(2)}x
          </div>
        </div>

        {/* Daily Ad Spend */}
        <div className='rounded-xl border border-border/80 bg-card p-3 flex flex-col justify-between shadow-2xs hover:border-foreground/30 transition-all'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold'>
            <span>Daily Ad Spend</span>
            <span className='text-[9px] text-muted-foreground'>Active</span>
          </div>
          <div className='text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mt-1'>
            {formatINR(topKpis.totalDailySpend)}/d
          </div>
        </div>

        {/* Open Issues */}
        <div className='rounded-xl border border-border/80 bg-card p-3 flex flex-col justify-between shadow-2xs hover:border-foreground/30 transition-all'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold'>
            <span>Open Issues</span>
            <span
              className={cn(
                'text-[9px] font-bold',
                topKpis.openIssuesCount > 0 ? 'text-amber-500' : 'text-emerald-500'
              )}
            >
              {topKpis.openIssuesCount === 0 ? 'All Clear' : 'Requires Action'}
            </span>
          </div>
          <div
            className={cn(
              'text-xl sm:text-2xl font-extrabold tracking-tight mt-1',
              topKpis.openIssuesCount > 0 ? 'text-amber-500' : 'text-foreground'
            )}
          >
            {topKpis.openIssuesCount}
          </div>
        </div>

        {/* Spend at Risk */}
        <div className='rounded-xl border border-border/80 bg-card p-3 flex flex-col justify-between shadow-2xs hover:border-foreground/30 transition-all'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold'>
            <span>Spend at Risk</span>
            <span
              className={cn(
                'text-[9px] font-bold',
                topKpis.spendAtRisk > 0 ? 'text-rose-500' : 'text-emerald-500'
              )}
            >
              {topKpis.spendAtRisk > 0 ? 'Sub-Floor' : 'Protected'}
            </span>
          </div>
          <div
            className={cn(
              'text-xl sm:text-2xl font-extrabold tracking-tight mt-1',
              topKpis.spendAtRisk > 0 ? 'text-rose-500' : 'text-foreground'
            )}
          >
            {formatINR(topKpis.spendAtRisk)}/d
          </div>
        </div>
      </div>

      {/* 3. UNIFIED COMPACT FILTER BAR */}
      <div className='flex flex-wrap items-center justify-between gap-2.5 p-2 rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs'>
        {/* Filter Chips */}
        <div className='flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/60 text-xs font-semibold'>
          {(
            [
              { id: 'all', label: `All (${products.length})` },
              { id: 'needs_fix', label: `Needs Fix (${topKpis.openIssuesCount})` },
              {
                id: 'fixed',
                label: `Fixed (${products.filter((p) => p.isFixed).length})`,
              },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterChip(chip.id)}
              className={cn(
                'px-2.5 py-1 rounded text-xs transition-all font-mono font-bold cursor-pointer',
                filterChip === chip.id
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Channel Filters */}
        <div className='flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/60 text-xs font-medium'>
          {(['all', 'meta', 'google', 'amazon', 'shopify', 'tiktok'] as const).map(
            (channel) => (
              <button
                key={channel}
                onClick={() => setActiveChannel(channel)}
                className={cn(
                  'px-2 py-0.5 rounded transition-all font-mono text-[10px] uppercase font-bold cursor-pointer',
                  activeChannel === channel
                    ? 'bg-background text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {channel}
              </button>
            )
          )}
        </div>
      </div>

      {/* 4. DENSE, SCAN-FRIENDLY GAUGES GRID (4 Columns on Desktop, 3 on Tablet/Medium) */}
      {filteredProducts.length === 0 ? (
        <div className='rounded-xl border border-border bg-card p-8 text-center text-card-foreground'>
          <p className='text-xs text-muted-foreground'>
            No products match the selected filter criteria.
          </p>
          <button
            onClick={() => {
              setFilterChip('all');
              setActiveChannel('all');
            }}
            className='mt-2 px-3 py-1 rounded bg-foreground text-background text-xs font-bold hover:opacity-90 cursor-pointer'
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3'>
          {filteredProducts.map((p) => (
            <RoasGauge
              key={p.id}
              productName={p.name}
              channel={p.channel}
              inventory={p.inventory}
              coverDays={p.coverDays}
              dailySpend={p.dailySpend}
              currentRoas={p.roas}
              targetRoas={3.2}
              breakevenRoas={1.8}
              maxRoas={6.0}
              healthScore={p.healthScore}
              status={p.status}
              footerSummary={p.footerSummary}
              isFixed={p.isFixed}
              paused={p.paused}
              restockUnitsOrdered={p.restockUnitsOrdered}
              photoUrl={p.photoUrl}
              onFix={() => handleOpenFix(p)}
              onViewFix={() => handleOpenViewFix(p)}
              onAnalyze={() => {
                setAnalyzingProduct({
                  productName: p.name,
                  sku: p.sku || p.id,
                  photoUrl: p.photoUrl,
                  platform: p.channel.toLowerCase(),
                  campaign: `${p.channel.toLowerCase()}-${p.id}`,
                  inventory: p.inventory,
                  roas: p.roas,
                  targetRoas: 3.2,
                  severity: p.isFixed
                    ? 'HEALTHY'
                    : p.status === 'stockout' || p.status === 'below floor'
                    ? 'CRITICAL'
                    : 'HEALTHY',
                });
              }}
            />
          ))}
        </div>
      )}

      {/* 5. DECISION LEDGER AUDIT TABLE */}
      <div className='mt-2'>
        <GaugesDecisionLedgerTable entries={ledger} />
      </div>

      {/* Action Drawer (Used by FIX and View Fix) */}
      <ActionDrawer
        actionId={activeActionId}
        isOpen={isDrawerOpen}
        initialState={drawerInitialState}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* 3D Telemetry Inspection Modal */}
      <ProductAnalysisModal
        product={analyzingProduct}
        isOpen={!!analyzingProduct}
        onClose={() => setAnalyzingProduct(null)}
      />
    </div>
  );
}
