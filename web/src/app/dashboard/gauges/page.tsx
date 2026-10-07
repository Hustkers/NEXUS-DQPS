'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { RoasGauge } from '@/features/decision-engine/components/roas-gauge';
import { FixProtocolModal } from '@/features/decision-engine/components/fix-protocol-modal';
import { GaugesDecisionLedgerTable } from '@/features/decision-engine/components/gauges-decision-ledger-table';
import { ProductAnalysisModal, type ProductAnalysisTarget } from '@/features/decision-engine/components/product-analysis-modal';
import { useDecisionEngine } from '@/context/decision-engine-store';
import {
  computeFixPlan,
  formatINR,
  type DerivedProduct,
  type FixPlanSummary,
} from '@/lib/gauges-engine';
import { cn } from '@/lib/utils';

type FilterChip = 'all' | 'needs_fix' | 'fixed';

export default function GaugesPage() {
  const {
    products,
    ledger,
    topKpis,
    executeFix,
    resetToDefaults,
  } = useDecisionEngine();

  // Filters
  const [filterChip, setFilterChip] = useState<FilterChip>('all');
  const [activeChannel, setActiveChannel] = useState<string>('all');

  // Modal interactions
  const [activeModalProduct, setActiveModalProduct] = useState<DerivedProduct | null>(null);
  const [activeModalPlan, setActiveModalPlan] = useState<FixPlanSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryOnly, setIsSummaryOnly] = useState(false);

  // Analysing Modal (3D Globe inspection)
  const [analyzingProduct, setAnalyzingProduct] = useState<ProductAnalysisTarget | null>(null);
  // Filter products by Filter Chips & Channel
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Filter Chip filter
      if (filterChip === 'needs_fix') {
        if (p.isFixed || p.status === 'target met') return false;
      } else if (filterChip === 'fixed') {
        if (!p.isFixed) return false;
      }

      // Channel filter
      if (activeChannel !== 'all') {
        if (p.channel.toLowerCase() !== activeChannel.toLowerCase()) return false;
      }

      return true;
    });
  }, [products, filterChip, activeChannel]);

  // Handle opening FIX modal
  const handleOpenFixModal = (product: DerivedProduct) => {
    const plan = computeFixPlan(product, products);
    setActiveModalProduct(product);
    setActiveModalPlan(plan);
    setIsSummaryOnly(false);
    setIsModalOpen(true);
  };

  // Handle opening VIEW FIX summary modal
  const handleOpenViewFixModal = (product: DerivedProduct) => {
    const plan = product.appliedPlan || computeFixPlan(product, products);
    setActiveModalProduct(product);
    setActiveModalPlan(plan);
    setIsSummaryOnly(true);
    setIsModalOpen(true);
  };

  // Handle execution of fix
  const handleExecuteFix = (plan: FixPlanSummary) => {
    if (!activeModalProduct) return;
    executeFix(activeModalProduct.id, plan);
  };

  // Reset to default test state
  const handleResetToDefaults = () => {
    if (window.confirm('Reset all campaigns and decision ledger to initial state?')) {
      resetToDefaults();
    }
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#000000] text-white min-h-screen font-mono min-w-0 max-w-full overflow-hidden'>
      {/* Header Bar */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[#1A1A1A] pb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.trendingUp className='size-5 text-white' />
            <h1 className='text-lg md:text-xl font-bold text-white uppercase tracking-tight'>
              ROAS &amp; Health Gauges
            </h1>
            <span className='text-[10px] bg-[#141414] border border-[#262626] text-[#A3A3A3] px-2 py-0.5 rounded'>
              Nike Direct Account
            </span>
          </div>
          <p className='text-xs text-[#8A8A8A] mt-1'>
            Autonomous Adstock Optimization • Semicircular Target Arcs (0–6x) • 1.8x Floor &amp; 3.2x Target
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={handleResetToDefaults}
            className='px-3 py-1.5 rounded-lg border border-[#222222] bg-[#121212] hover:bg-[#1A1A1A] text-[11px] text-[#A3A3A3] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
            title='Reset campaigns and ledger to factory seed data'
          >
            Reset Seed Data
          </button>
        </div>
      </div>

      {/* TOP DYNAMIC KPIS (all computed purely from data) */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {/* Blended ROAS */}
        <div className='rounded-xl border border-[#222222] bg-[#0E0E0E] p-4 flex flex-col justify-between'>
          <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold'>
            Blended ROAS
          </span>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-2xl font-bold text-white tracking-tight'>
              {topKpis.blendedRoas.toFixed(2)}x
            </span>
            <span className='text-[10px] text-emerald-400 font-semibold'>
              {topKpis.blendedRoas >= 3.2 ? '● Target Met' : '○ Pacing'}
            </span>
          </div>
          <span className='text-[10px] text-[#737373] mt-1'>
            Total Rev / Total Spend
          </span>
        </div>

        {/* Daily Ad Spend */}
        <div className='rounded-xl border border-[#222222] bg-[#0E0E0E] p-4 flex flex-col justify-between'>
          <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold'>
            Daily Ad Spend
          </span>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-2xl font-bold text-white tracking-tight'>
              {formatINR(topKpis.totalDailySpend)}
            </span>
          </div>
          <span className='text-[10px] text-[#737373] mt-1'>
            Active Managed Capital
          </span>
        </div>

        {/* Open Issues */}
        <div className='rounded-xl border border-[#222222] bg-[#0E0E0E] p-4 flex flex-col justify-between'>
          <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold'>
            Open Issues
          </span>
          <div className='mt-2 flex items-baseline gap-2'>
            <span
              className={cn(
                'text-2xl font-bold tracking-tight',
                topKpis.openIssuesCount > 0 ? 'text-amber-400' : 'text-emerald-400'
              )}
            >
              {topKpis.openIssuesCount}
            </span>
            <span className='text-[10px] text-[#8A8A8A]'>
              {topKpis.openIssuesCount === 0 ? 'All Clear' : 'Requires Action'}
            </span>
          </div>
          <span className='text-[10px] text-[#737373] mt-1'>
            Stockouts &amp; Sub-Floor Alerts
          </span>
        </div>

        {/* Spend at Risk */}
        <div className='rounded-xl border border-[#222222] bg-[#0E0E0E] p-4 flex flex-col justify-between'>
          <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold'>
            Spend at Risk
          </span>
          <div className='mt-2 flex items-baseline gap-2'>
            <span
              className={cn(
                'text-2xl font-bold tracking-tight',
                topKpis.spendAtRisk > 0 ? 'text-red-400' : 'text-emerald-400'
              )}
            >
              {formatINR(topKpis.spendAtRisk)}
            </span>
          </div>
          <span className='text-[10px] text-[#737373] mt-1'>
            In Un-optimized / Out-of-Stock Sets
          </span>
        </div>
      </div>

      {/* FILTER CHIPS (All / Needs fix / Fixed) + CHANNELS */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-[#1A1A1A] pb-3'>
        {/* Filter Chips: All / Needs fix / Fixed */}
        <div className='flex items-center gap-1.5 bg-[#121212] p-1 rounded-lg border border-[#222222] text-xs font-semibold'>
          {(
            [
              { id: 'all', label: 'All Products' },
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
                'px-3 py-1.5 rounded-md transition-all font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                filterChip === chip.id
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-[#8A8A8A] hover:text-white'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Channel Filters */}
        <div className='flex items-center gap-1 bg-[#121212] p-1 rounded-lg border border-[#222222] text-xs font-medium'>
          {(['all', 'meta', 'google', 'amazon', 'shopify', 'tiktok'] as const).map(
            (channel) => (
              <button
                key={channel}
                onClick={() => setActiveChannel(channel)}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all font-mono text-[11px] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                  activeChannel === channel
                    ? 'bg-[#262626] text-white font-bold'
                    : 'text-[#737373] hover:text-white'
                )}
              >
                {channel}
              </button>
            )
          )}
        </div>
      </div>

      {/* GAUGES GRID */}
      {filteredProducts.length === 0 ? (
        <div className='rounded-xl border border-[#222222] bg-[#0E0E0E] p-12 text-center'>
          <p className='text-sm text-[#8A8A8A]'>
            No products match the selected filter criteria.
          </p>
          <button
            onClick={() => {
              setFilterChip('all');
              setActiveChannel('all');
            }}
            className='mt-3 px-4 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-neutral-200'
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-4'>
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
              onFix={() => handleOpenFixModal(p)}
              onViewFix={() => handleOpenViewFixModal(p)}
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

      {/* DECISION LEDGER AUDIT TABLE */}
      <div className='mt-4'>
        <GaugesDecisionLedgerTable entries={ledger} />
      </div>

      {/* 3-STEP FIX PROTOCOL MODAL */}
      <FixProtocolModal
        product={activeModalProduct}
        plan={activeModalPlan}
        isOpen={isModalOpen}
        isSummaryOnly={isSummaryOnly}
        onClose={() => setIsModalOpen(false)}
        onExecute={handleExecuteFix}
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
