'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { Icons } from '@/components/icons';
import { RoasGauge } from '@/features/decision-engine/components/roas-gauge';
import { FixProtocolModal } from '@/features/decision-engine/components/fix-protocol-modal';
import { GaugesDecisionLedgerTable } from '@/features/decision-engine/components/gauges-decision-ledger-table';
import { ProductAnalysisModal, type ProductAnalysisTarget } from '@/features/decision-engine/components/product-analysis-modal';
import {
  INITIAL_PRODUCTS,
  INITIAL_LEDGER,
  deriveProduct,
  computeFixPlan,
  applyFixPlan,
  type ProductModel,
  type DerivedProduct,
  type FixPlanSummary,
  type GaugesLedgerItem,
  type ChannelType,
} from '@/lib/gauges-engine';
import { cn } from '@/lib/utils';

type FilterChip = 'all' | 'needs_fix' | 'fixed';

const LOCAL_STORAGE_PRODUCTS_KEY = 'nexus_roas_gauges_products_v2';
const LOCAL_STORAGE_LEDGER_KEY = 'nexus_roas_gauges_ledger_v2';

export default function GaugesPage() {
  const [, startTransition] = useTransition();

  // State: products and decision ledger
  const [products, setProducts] = useState<ProductModel[]>(INITIAL_PRODUCTS);
  const [ledgerEntries, setLedgerEntries] = useState<GaugesLedgerItem[]>(INITIAL_LEDGER);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

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

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
        const savedLedger = localStorage.getItem(LOCAL_STORAGE_LEDGER_KEY);

        if (savedProducts) {
          const parsed = JSON.parse(savedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
          }
        }
        if (savedLedger) {
          const parsed = JSON.parse(savedLedger);
          if (Array.isArray(parsed)) {
            setLedgerEntries(parsed);
          }
        }
      }
    } catch {
      // Fallback silently to default in-memory state
    } finally {
      setIsClientLoaded(true);
    }
  }, []);

  // Save to LocalStorage upon updates
  useEffect(() => {
    if (!isClientLoaded) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
        localStorage.setItem(LOCAL_STORAGE_LEDGER_KEY, JSON.stringify(ledgerEntries));
      }
    } catch {
      // Ignore write errors
    }
  }, [products, ledgerEntries, isClientLoaded]);

  // Derive products dynamically
  const derivedProducts = useMemo(() => {
    return products.map((p) => deriveProduct(p));
  }, [products]);

  // Dynamic Top KPIs derived purely from data
  const { blendedRoas, totalDailySpend, openIssuesCount, spendAtRisk } = useMemo(() => {
    let totalSpend = 0;
    let totalRev = 0;
    let issues = 0;
    let atRisk = 0;

    for (const p of derivedProducts) {
      totalSpend += p.dailySpend;
      totalRev += p.revenue;

      const needsFix = !p.isFixed && p.status !== 'target met';
      if (needsFix) {
        issues += 1;
        atRisk += p.dailySpend;
      }
    }

    const blended = totalSpend > 0 ? totalRev / totalSpend : 0;
    return {
      blendedRoas: blended,
      totalDailySpend: totalSpend,
      openIssuesCount: issues,
      spendAtRisk: atRisk,
    };
  }, [derivedProducts]);

  // Filter products by Filter Chips & Channel
  const filteredProducts = useMemo(() => {
    return derivedProducts.filter((p) => {
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
  }, [derivedProducts, filterChip, activeChannel]);

  // Handle opening FIX modal
  const handleOpenFixModal = (product: DerivedProduct) => {
    const plan = computeFixPlan(product, derivedProducts);
    setActiveModalProduct(product);
    setActiveModalPlan(plan);
    setIsSummaryOnly(false);
    setIsModalOpen(true);
  };

  // Handle opening VIEW FIX summary modal
  const handleOpenViewFixModal = (product: DerivedProduct) => {
    const plan = product.appliedPlan || computeFixPlan(product, derivedProducts);
    setActiveModalProduct(product);
    setActiveModalPlan(plan);
    setIsSummaryOnly(true);
    setIsModalOpen(true);
  };

  // Handle execution of fix
  const handleExecuteFix = (plan: FixPlanSummary) => {
    if (!activeModalProduct) return;

    startTransition(() => {
      const { updatedProducts, newLedgerEntry } = applyFixPlan(
        products,
        activeModalProduct.id,
        plan
      );

      setProducts(updatedProducts);
      setLedgerEntries((prev) => [newLedgerEntry, ...prev]);

      // Update active modal product with latest fixed state
      const refreshed = updatedProducts.find((p) => p.id === activeModalProduct.id);
      if (refreshed) {
        setActiveModalProduct(deriveProduct(refreshed));
      }
    });
  };

  // Reset to default test state
  const handleResetToDefaults = () => {
    if (window.confirm('Reset all campaigns and decision ledger to initial state?')) {
      setProducts(INITIAL_PRODUCTS);
      setLedgerEntries(INITIAL_LEDGER);
      try {
        localStorage.removeItem(LOCAL_STORAGE_PRODUCTS_KEY);
        localStorage.removeItem(LOCAL_STORAGE_LEDGER_KEY);
      } catch {
        // noop
      }
    }
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#000000] text-white min-h-screen font-mono'>
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
            Autonomous Adstock Optimization • Semicircular Target Arcs • 1.8x Floor &amp; 3.2x Target
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
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        {/* Blended ROAS */}
        <div className='rounded-xl border border-[#222222] bg-[#0E0E0E] p-4 flex flex-col justify-between'>
          <span className='text-[10px] text-[#8A8A8A] uppercase font-semibold'>
            Blended ROAS
          </span>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-2xl font-bold text-white tracking-tight'>
              {blendedRoas.toFixed(2)}x
            </span>
            <span className='text-[10px] text-emerald-400 font-semibold'>
              {blendedRoas >= 3.2 ? '● Target Met' : '○ Pacing'}
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
              ₹{totalDailySpend.toLocaleString('en-IN')}
            </span>
            <span className='text-[10px] text-[#8A8A8A]'>/day</span>
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
                openIssuesCount > 0 ? 'text-amber-400' : 'text-emerald-400'
              )}
            >
              {openIssuesCount}
            </span>
            <span className='text-[10px] text-[#8A8A8A]'>
              {openIssuesCount === 0 ? 'All Clear' : 'Requires Action'}
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
                spendAtRisk > 0 ? 'text-red-400' : 'text-emerald-400'
              )}
            >
              ₹{spendAtRisk.toLocaleString('en-IN')}
            </span>
            <span className='text-[10px] text-[#8A8A8A]'>/day</span>
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
              { id: 'needs_fix', label: `Needs Fix (${openIssuesCount})` },
              {
                id: 'fixed',
                label: `Fixed (${derivedProducts.filter((p) => p.isFixed).length})`,
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
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
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
              healthScore={p.healthScore}
              status={p.status}
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
        <GaugesDecisionLedgerTable entries={ledgerEntries} />
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
