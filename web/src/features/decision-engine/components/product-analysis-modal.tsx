'use client';

import React, { useState, useMemo } from 'react';
import {
  IconWorld,
  IconX,
  IconCheck,
  IconReportAnalytics,
  IconArrowRight,
  IconAlertTriangle,
  IconCpu,
  IconReceipt2
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { GithubGlobe } from './github-globe';
import { RLVisualAnalytics } from './rl-visual-analytics';
import { computeRLAdAllocation } from '@/lib/rl-ad-optimizer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Ground-truth SKU bill of materials and factory unit economics from DATASET.md §2
const SKU_COGS_MAP: Record<string, { inrCogs: number; usdCogs: number; inrMsrp: number }> = {
  '310805-137': { inrCogs: 5800, usdCogs: 69.05, inrMsrp: 15995 }, // Air Jordan 10 Retro
  '880848-005': { inrCogs: 5250, usdCogs: 62.50, inrMsrp: 14495 }, // Nike Zoom Fly
  'AH8050-100': { inrCogs: 4800, usdCogs: 57.14, inrMsrp: 13995 }, // Nike Air Max 270
  '315122-001': { inrCogs: 3150, usdCogs: 37.50, inrMsrp: 7495 },  // Nike Air Force 1 '07
  'CD4371-001': { inrCogs: 5800, usdCogs: 69.05, inrMsrp: 13995 }, // Nike React Infinity Run Flyknit
  'AO2924-401': { inrCogs: 4500, usdCogs: 53.57, inrMsrp: 12797 }, // Nike Air Zoom Pegasus 36
  'BQ8928-011': { inrCogs: 3900, usdCogs: 46.43, inrMsrp: 10397 }, // Nike Epic React Flyknit 2
  '942851-002': { inrCogs: 3800, usdCogs: 45.24, inrMsrp: 10995 }, // Nike Air Zoom Pegasus 35
  '849559-004': { inrCogs: 5500, usdCogs: 65.48, inrMsrp: 15995 }, // Nike Air Max 2017
  'AT5405-001': { inrCogs: 5200, usdCogs: 61.90, inrMsrp: 14995 }, // Nike Joyride Run Flyknit
};

export interface ProductAnalysisTarget {
  id?: string | number;
  productName: string;
  sku?: string;
  photoUrl?: string;
  category?: string;
  price?: number;
  platform?: string;
  campaign?: string;
  inventory?: number;
  roas?: number;
  spend?: number;
  targetRoas?: number;
  grossMarginPct?: number;
  explanation?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'WARNING' | 'HEALTHY';
  factors?: Array<{
    name: string;
    impactPts: number;
    deltaPct?: number;
    color?: string;
    detail?: string;
  }>;
}

interface ProductAnalysisModalProps {
  product: ProductAnalysisTarget | null;
  isOpen: boolean;
  onClose: () => void;
  onMitigate?: (product: ProductAnalysisTarget) => void;
}

export function ProductAnalysisModal({
  product,
  isOpen,
  onClose,
  onMitigate
}: ProductAnalysisModalProps) {
  const [freightZone, setFreightZone] = useState<'zone2' | 'zone8' | 'blended'>('blended');
  const [currencyView, setCurrencyView] = useState<'usd' | 'inr'>('usd');
  const [isExecuting, setIsExecuting] = useState(false);

  // Compute RL ad allocation data for the product
  const rlData = useMemo(() => {
    if (!product) return null;
    return computeRLAdAllocation({
      productName: product.productName,
      sku: product.sku,
      price: product.price,
      spend: product.spend,
      roas: product.roas,
      grossMarginPct: product.grossMarginPct,
      inventory: product.inventory
    });
  }, [product]);

  // Compute Itemized Contribution Margin 3 (CM3) Waterfall from DATASET.md §3.4
  const cm3Data = useMemo(() => {
    if (!product) return null;
    const price = product.price ?? 160;
    const skuData = product.sku ? SKU_COGS_MAP[product.sku] : undefined;
    const cogsUsd = skuData ? skuData.usdCogs : Math.round(price * 0.38 * 100) / 100;
    const cogsInr = skuData ? skuData.inrCogs : Math.round(cogsUsd * 84);
    const cm1Usd = price - cogsUsd;

    const gatewayFeeUsd = Math.round((price * 0.029 + 0.30) * 100) / 100;
    const gatewayFeeInr = Math.round(gatewayFeeUsd * 84);
    const cm2Usd = cm1Usd - gatewayFeeUsd;

    let currentFreightUsd = 7.90;
    let currentFreightInr = 664;
    if (freightZone === 'zone2') {
      currentFreightUsd = 4.80;
      currentFreightInr = 403;
    } else if (freightZone === 'zone8') {
      currentFreightUsd = 18.50;
      currentFreightInr = 1554;
    }

    const effectiveRoas = product.roas && product.roas > 0 ? product.roas : 3.0;
    const cacUsd = Math.round((price / effectiveRoas) * 100) / 100;
    const cacInr = Math.round(cacUsd * 84);

    const totalCostUsd = cogsUsd + gatewayFeeUsd + currentFreightUsd + cacUsd;
    const netCm3Usd = Math.round((price - totalCostUsd) * 100) / 100;
    const netCm3Inr = Math.round(netCm3Usd * 84);
    const netCm3Pct = Math.round((netCm3Usd / price) * 1000) / 10;
    const poas = cacUsd > 0 ? Math.round((netCm3Usd / cacUsd) * 100) / 100 : 0;

    return {
      price,
      cogsUsd,
      cogsInr,
      cm1Usd,
      gatewayFeeUsd,
      gatewayFeeInr,
      cm2Usd,
      currentFreightUsd,
      currentFreightInr,
      cacUsd,
      cacInr,
      totalCostUsd,
      netCm3Usd,
      netCm3Inr,
      netCm3Pct,
      poas,
    };
  }, [product, freightZone]);

  if (!isOpen || !product || !rlData || !cm3Data) return null;

  const handleMitigate = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      toast.success(`RL Ad Reallocation Executed for ${product.productName}`, {
        description: `Scaled high-headroom ads (+68% NA) and eliminated $${rlData.lowProbabilitySpendAvoided.toLocaleString()} in low-probability spend. Profit lift +$${rlData.totalProjectedProfitLift.toLocaleString()}.`
      });
      onMitigate?.(product);
      onClose();
    }, 850);
  };

  const isStockout = product.inventory !== undefined && product.inventory <= 0;
  const isCritical = product.severity === 'CRITICAL' || isStockout || (product.roas !== undefined && product.roas < 1.8);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/50 dark:bg-black/75 backdrop-blur-md animate-in fade-in-0 duration-200'>
      {/* Container */}
      <div className='relative flex flex-col w-full max-w-6xl max-h-[94vh] overflow-hidden rounded-2xl border border-border/80 bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-2xl text-foreground font-mono before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 dark:before:via-white/15 before:to-transparent'>
        {/* Top Diagnostic Phase Header */}
        <div className='flex flex-wrap items-center justify-between border-b border-border/70 px-4 sm:px-6 py-3.5 bg-card/90 dark:bg-zinc-950/90 gap-3'>
          <div className='flex items-center gap-3'>
            <div className='flex size-3 items-center justify-center'>
              <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-xs font-mono font-bold uppercase tracking-wider text-foreground'>
                  ANALYSIS &amp; TELEMETRY OVERVIEW
                </span>
                <span className='text-muted-foreground/60 hidden sm:inline'>•</span>
                <span className='text-xs font-mono text-muted-foreground hidden sm:inline'>
                  Cross-Channel Delivery Arcs, CM3 Waterfall &amp; RL Policy
                </span>
              </div>
              <p className='text-[11px] font-mono text-muted-foreground mt-0.5'>
                Source: WebGL Ad Delivery Engine • Reconciled ERP COGS • Thompson Bandit RL
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2.5'>
            <Badge
              variant='outline'
              className={cn(
                'font-mono text-xs px-2.5 py-0.5 inline-flex rounded-lg',
                isCritical
                  ? 'border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10'
                  : 'border-border/80 text-muted-foreground bg-muted/40'
              )}
            >
              {isStockout ? 'CRITICAL STOCKOUT' : isCritical ? 'ANOMALY DETECTED' : 'HEALTHY PACE'}
            </Badge>

            <button
              onClick={onClose}
              className='size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all active:scale-[0.92]'
            >
              <IconX className='size-3.5' />
            </button>
          </div>
        </div>

        {/* Modal Body - Unified All-in-One View */}
        <div className='flex-1 overflow-y-auto p-4 sm:p-6 space-y-6'>
          {/* SECTION 1: 3D GLOBE & PRODUCT TELEMETRY */}
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
            {/* Left: 3D Globe View (Global Ad Delivery Arcs) */}
            <div className='lg:col-span-7 flex flex-col items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-4 relative overflow-hidden'>
              <div className='w-full flex items-center justify-between text-xs font-mono text-zinc-400 mb-1 px-2'>
                <div className='flex items-center gap-2'>
                  <IconWorld className='size-4 text-zinc-400' />
                  <span className='font-bold text-zinc-200'>GLOBAL AD DELIVERY ARCS &amp; TELEMETRY</span>
                </div>
                <span className='text-[11px] text-zinc-500'>
                  Interactive • Drag to rotate
                </span>
              </div>

              {/* The Globe */}
              <div className='w-full min-h-[340px] flex items-center justify-center overflow-x-auto'>
                <GithubGlobe
                  size={320}
                  activeSku={product.sku}
                  activePlatform={product.platform}
                  accentColor={isCritical ? [0.95, 0.35, 0.45] : [0.2, 0.85, 0.6]}
                />
              </div>

              {/* Channel Strip & Regional PoPs */}
              <div className='w-full grid grid-cols-4 gap-2 pt-3 border-t border-zinc-900 text-center font-mono text-[10px]'>
                <div className='p-1.5 rounded bg-zinc-900/50 border border-zinc-800/60 flex flex-col items-center justify-center gap-0.5'>
                  <div className='flex items-center gap-1 text-zinc-400 font-semibold'>
                    <PlatformLogo platform='meta' size={11} className='shrink-0' />
                    <span>META ADS</span>
                  </div>
                  <div className='text-zinc-200 font-bold'>US-East / SF</div>
                </div>
                <div className='p-1.5 rounded bg-zinc-900/50 border border-zinc-800/60 flex flex-col items-center justify-center gap-0.5'>
                  <div className='flex items-center gap-1 text-zinc-400 font-semibold'>
                    <PlatformLogo platform='google' size={11} className='shrink-0' />
                    <span>GOOGLE ADS</span>
                  </div>
                  <div className='text-zinc-200 font-bold'>EU / London</div>
                </div>
                <div className='p-1.5 rounded bg-zinc-900/50 border border-zinc-800/60 flex flex-col items-center justify-center gap-0.5'>
                  <div className='flex items-center gap-1 text-zinc-400 font-semibold'>
                    <PlatformLogo platform='amazon' size={11} className='shrink-0' />
                    <span>AMAZON DSP</span>
                  </div>
                  <div className='text-zinc-200 font-bold'>APAC / Tokyo</div>
                </div>
                <div className='p-1.5 rounded bg-zinc-900/50 border border-zinc-800/60 flex flex-col items-center justify-center gap-0.5'>
                  <div className='flex items-center gap-1 text-zinc-400 font-semibold'>
                    <PlatformLogo platform='shopify' size={11} className='shrink-0' />
                    <span>SHOPIFY D2C</span>
                  </div>
                  <div className='text-zinc-200 font-bold'>SEA / Singapore</div>
                </div>
              </div>
            </div>

              {/* Right: Product Card & RCA Factor Decomposition */}
              <div className='lg:col-span-5 flex flex-col justify-between h-full space-y-4'>
                {/* Product Header Card */}
                <div className='rounded-xl border border-zinc-800 bg-zinc-950/70 p-4'>
                  <div className='flex items-start gap-3.5'>
                    {product.photoUrl ? (
                      <div className='relative size-16 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden shrink-0'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.photoUrl}
                          alt={product.productName}
                          className='size-full object-cover'
                        />
                      </div>
                    ) : (
                      <div className='size-16 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center font-mono text-zinc-600 text-xs shrink-0'>
                        NIKE
                      </div>
                    )}

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-[10px] font-mono border-zinc-700 text-zinc-300 inline-flex items-center gap-1.5'>
                          {product.platform && <PlatformLogo platform={product.platform} size={11} className='shrink-0' />}
                          <span>{product.platform || 'Cross-Platform'}</span>
                        </Badge>
                        {product.sku && (
                          <span className='text-[10px] font-mono text-zinc-500'>
                            SKU {product.sku}
                          </span>
                        )}
                      </div>
                      <h3 className='font-mono text-base font-bold text-zinc-100 truncate mt-1'>
                        {product.productName}
                      </h3>
                      <div className='flex items-center gap-3 text-xs font-mono text-zinc-400 mt-1'>
                        {product.price !== undefined && (
                          <span>${Number(product.price).toFixed(2)}</span>
                        )}
                        <span>•</span>
                        <span className={cn(isStockout ? 'text-rose-400 font-bold' : 'text-zinc-300')}>
                          Inv: {product.inventory ?? 'Adequate'}
                        </span>
                        <span>•</span>
                        <span className='text-emerald-400'>
                          ROAS: {product.roas ? `${product.roas.toFixed(2)}x` : '3.15x'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RL Headroom Summary Card */}
                <div className='rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3'>
                  <div className='flex items-center justify-between text-xs font-mono'>
                    <span className='font-bold text-zinc-200 flex items-center gap-1.5'>
                      <IconCpu className='size-3.5 text-cyan-400' />
                      RL Policy Headroom Scope
                    </span>
                    <span className='text-emerald-400 font-bold'>+{rlData.profitLiftPct}% Profit Lift</span>
                  </div>

                  <p className='text-xs text-zinc-300 leading-relaxed font-sans bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80'>
                    The Reinforcement Learning agent detected <strong className='text-emerald-400'>high marginal headroom in North America</strong> (+68% ad spend) and <strong className='text-rose-400'>slashed low-probability spend in LatAm &amp; SEA</strong> to eliminate negative-ROAS capital bleed.
                  </p>

                  <div className='grid grid-cols-2 gap-2 text-xs font-mono'>
                    <div className='p-2 rounded bg-zinc-900/60 border border-zinc-800'>
                      <div className='text-zinc-500 text-[10px]'>PROJECTED MARGIN GAIN</div>
                      <div className='text-emerald-400 font-bold text-sm'>+${rlData.totalProjectedProfitLift.toLocaleString()}/mo</div>
                    </div>
                    <div className='p-2 rounded bg-zinc-900/60 border border-zinc-800'>
                      <div className='text-zinc-500 text-[10px]'>WASTED SPEND PRUNED</div>
                      <div className='text-rose-400 font-bold text-sm'>${rlData.lowProbabilitySpendAvoided.toLocaleString()}/day</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex items-center gap-3 pt-1'>
                  <Button
                    onClick={handleMitigate}
                    disabled={isExecuting}
                    className='flex-1 font-mono text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-950'
                  >
                    <IconArrowRight className='size-3.5 mr-1.5' />
                    {isExecuting ? 'Dispatching to Ad API...' : 'Execute RL Reallocation'}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={onClose}
                    className='font-mono text-xs border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>

          {/* SECTION 2: CONTRIBUTION MARGIN 3 (CM3) WATERFALL (DATASET.MD §3.4) */}
          <div className='rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-4 font-mono'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3'>
                <div className='flex items-center gap-2.5'>
                  <div className='size-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0'>
                    <IconReceipt2 className='size-4' />
                  </div>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h4 className='text-xs font-bold text-zinc-100 uppercase tracking-wide'>
                        Itemized Contribution Margin 3 (CM3) Waterfall
                      </h4>
                      <Badge variant='outline' className='text-[9px] border-zinc-700 bg-zinc-900 text-zinc-300'>
                        DATASET.md §3.4
                      </Badge>
                    </div>
                    <p className='text-[11px] text-zinc-400 mt-0.5 font-sans'>
                      Reconciled ERP COGS, 2.9% + $0.30 gateway fee, zone-skipping freight &amp; customer acquisition cost (CAC).
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2 flex-wrap'>
                  {/* Currency Toggle */}
                  <div className='flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5 text-[10px]'>
                    <button
                      onClick={() => setCurrencyView('usd')}
                      className={cn(
                        'px-2 py-0.5 rounded transition-all font-semibold',
                        currencyView === 'usd' ? 'bg-zinc-800 text-zinc-100 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'
                      )}
                    >
                      USD ($)
                    </button>
                    <button
                      onClick={() => setCurrencyView('inr')}
                      className={cn(
                        'px-2 py-0.5 rounded transition-all font-semibold',
                        currencyView === 'inr' ? 'bg-zinc-800 text-zinc-100 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'
                      )}
                    >
                      INR (₹ @ 84)
                    </button>
                  </div>

                  {/* Freight Routing Switcher */}
                  <div className='flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5 text-[10px]'>
                    <button
                      onClick={() => setFreightZone('zone2')}
                      className={cn(
                        'px-2 py-0.5 rounded transition-all font-semibold',
                        freightZone === 'zone2' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
                      )}
                    >
                      Zone 2 Local ($4.80)
                    </button>
                    <button
                      onClick={() => setFreightZone('blended')}
                      className={cn(
                        'px-2 py-0.5 rounded transition-all font-semibold',
                        freightZone === 'blended' ? 'bg-zinc-800 text-zinc-100 shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
                      )}
                    >
                      Blended ($7.90)
                    </button>
                    <button
                      onClick={() => setFreightZone('zone8')}
                      className={cn(
                        'px-2 py-0.5 rounded transition-all font-semibold',
                        freightZone === 'zone8' ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
                      )}
                    >
                      Zone 8 Cross-Country ($18.50)
                    </button>
                  </div>
                </div>
              </div>

              {/* Waterfall Steps Grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs'>
                {/* Step 1: MSRP */}
                <div className='p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between'>
                  <div className='text-zinc-500 text-[10px] uppercase font-semibold'>1. Retail MSRP</div>
                  <div className='my-1.5'>
                    <div className='text-base font-bold text-zinc-100'>
                      {currencyView === 'usd' ? `+$${cm3Data.price.toFixed(2)}` : `+₹${Math.round(cm3Data.price * 84).toLocaleString('en-IN')}`}
                    </div>
                    <div className='text-[10px] text-zinc-400'>
                      {currencyView === 'usd' ? `₹${Math.round(cm3Data.price * 84).toLocaleString('en-IN')} anchor` : `$${cm3Data.price.toFixed(2)} USD`}
                    </div>
                  </div>
                  <div className='text-[9px] text-zinc-500'>100% Gross Subtotal</div>
                </div>

                {/* Step 2: ERP COGS */}
                <div className='p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between'>
                  <div className='text-zinc-500 text-[10px] uppercase font-semibold'>2. ERP Unit COGS</div>
                  <div className='my-1.5'>
                    <div className='text-base font-bold text-rose-400'>
                      {currencyView === 'usd' ? `-$${cm3Data.cogsUsd.toFixed(2)}` : `-₹${cm3Data.cogsInr.toLocaleString('en-IN')}`}
                    </div>
                    <div className='text-[10px] text-zinc-400'>
                      CM1: ${cm3Data.cm1Usd.toFixed(2)} ({(cm3Data.cm1Usd / cm3Data.price * 100).toFixed(1)}%)
                    </div>
                  </div>
                  <div className='text-[9px] text-zinc-500'>Direct Manufacturing</div>
                </div>

                {/* Step 3: Gateway Fee */}
                <div className='p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between'>
                  <div className='text-zinc-500 text-[10px] uppercase font-semibold'>3. Gateway Fee</div>
                  <div className='my-1.5'>
                    <div className='text-base font-bold text-amber-400'>
                      {currencyView === 'usd' ? `-$${cm3Data.gatewayFeeUsd.toFixed(2)}` : `-₹${cm3Data.gatewayFeeInr.toLocaleString('en-IN')}`}
                    </div>
                    <div className='text-[10px] text-zinc-400'>
                      Stripe 2.9% + $0.30
                    </div>
                  </div>
                  <div className='text-[9px] text-zinc-500'>Payment Friction</div>
                </div>

                {/* Step 4: Freight */}
                <div className='p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between'>
                  <div className='text-zinc-500 text-[10px] uppercase font-semibold flex items-center justify-between'>
                    <span>4. Freight</span>
                    {freightZone === 'zone8' && (
                      <span className='text-[8px] text-rose-400 font-bold bg-rose-950 px-1 rounded'>Δ -$13.70</span>
                    )}
                  </div>
                  <div className='my-1.5'>
                    <div className={cn('text-base font-bold', freightZone === 'zone8' ? 'text-rose-400' : freightZone === 'zone2' ? 'text-emerald-400' : 'text-zinc-200')}>
                      {currencyView === 'usd' ? `-$${cm3Data.currentFreightUsd.toFixed(2)}` : `-₹${cm3Data.currentFreightInr.toLocaleString('en-IN')}`}
                    </div>
                    <div className='text-[10px] text-zinc-400'>
                      {freightZone === 'zone2' ? 'Zone 2 Local' : freightZone === 'zone8' ? 'Zone 8 Coast-Coast' : '75/25 Blended Avg'}
                    </div>
                  </div>
                  <div className='text-[9px] text-zinc-500'>
                    {freightZone === 'zone8' ? 'Zone-Skip Penalty' : 'Optimal Logistics'}
                  </div>
                </div>

                {/* Step 5: CAC Allocation */}
                <div className='p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between'>
                  <div className='text-zinc-500 text-[10px] uppercase font-semibold'>5. Unit CAC</div>
                  <div className='my-1.5'>
                    <div className='text-base font-bold text-indigo-400'>
                      {currencyView === 'usd' ? `-$${cm3Data.cacUsd.toFixed(2)}` : `-₹${cm3Data.cacInr.toLocaleString('en-IN')}`}
                    </div>
                    <div className='text-[10px] text-zinc-400'>
                      Spend / {product.roas ? `${product.roas.toFixed(2)}x ROAS` : '3.0x'}
                    </div>
                  </div>
                  <div className='text-[9px] text-zinc-500'>Ad Acquisition Cost</div>
                </div>

                {/* Step 6: Realized Net CM3 */}
                <div className={cn(
                  'p-3 rounded-lg border flex flex-col justify-between',
                  cm3Data.netCm3Usd > 0
                    ? 'bg-emerald-950/30 border-emerald-800/80'
                    : 'bg-rose-950/30 border-rose-800/80'
                )}>
                  <div className='text-zinc-400 text-[10px] uppercase font-semibold flex items-center justify-between'>
                    <span>6. Net CM3</span>
                    <span className={cn('font-bold', cm3Data.netCm3Usd > 0 ? 'text-emerald-400' : 'text-rose-400')}>
                      {cm3Data.netCm3Pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className='my-1.5'>
                    <div className={cn('text-lg font-bold', cm3Data.netCm3Usd > 0 ? 'text-emerald-300' : 'text-rose-300')}>
                      {currencyView === 'usd' ? `+$${cm3Data.netCm3Usd.toFixed(2)}` : `+₹${cm3Data.netCm3Inr.toLocaleString('en-IN')}`}
                    </div>
                    <div className='text-[10px] text-zinc-400'>
                      POAS: <strong className='text-zinc-200'>{cm3Data.poas.toFixed(2)}x</strong>
                    </div>
                  </div>
                  <div className='text-[9px] text-zinc-400 font-bold'>
                    True Cash Left / Unit
                  </div>
                </div>
              </div>

              {/* Progress Stack Bar of Cost Absorption */}
              <div className='space-y-1.5 bg-zinc-900/40 p-3 rounded-lg border border-zinc-900'>
                <div className='flex items-center justify-between text-[11px] text-zinc-400'>
                  <span className='font-semibold'>MSRP Cost Absorption Breakdown</span>
                  <span>Net Margin Retained: <strong className='text-emerald-400'>{cm3Data.netCm3Pct.toFixed(1)}%</strong> (${cm3Data.netCm3Usd.toFixed(2)})</span>
                </div>
                <div className='h-3 w-full bg-zinc-900 rounded-full overflow-hidden flex'>
                  <div style={{ width: `${(cm3Data.cogsUsd / cm3Data.price) * 100}%` }} className='bg-rose-500/80 h-full' title={`COGS: ${(cm3Data.cogsUsd / cm3Data.price * 100).toFixed(1)}%`} />
                  <div style={{ width: `${(cm3Data.gatewayFeeUsd / cm3Data.price) * 100}%` }} className='bg-amber-500/80 h-full' title={`Gateway Fee: ${(cm3Data.gatewayFeeUsd / cm3Data.price * 100).toFixed(1)}%`} />
                  <div style={{ width: `${(cm3Data.currentFreightUsd / cm3Data.price) * 100}%` }} className='bg-sky-500/80 h-full' title={`Freight: ${(cm3Data.currentFreightUsd / cm3Data.price * 100).toFixed(1)}%`} />
                  <div style={{ width: `${(cm3Data.cacUsd / cm3Data.price) * 100}%` }} className='bg-indigo-500/80 h-full' title={`CAC: ${(cm3Data.cacUsd / cm3Data.price * 100).toFixed(1)}%`} />
                  <div style={{ width: `${Math.max(0, cm3Data.netCm3Pct)}%` }} className='bg-emerald-500/90 h-full' title={`Net CM3: ${cm3Data.netCm3Pct.toFixed(1)}%`} />
                </div>
                <div className='flex items-center justify-between text-[9px] text-zinc-500 pt-0.5 flex-wrap gap-2'>
                  <span className='flex items-center gap-1'><span className='size-1.5 rounded-full bg-rose-500' /> COGS ({(cm3Data.cogsUsd / cm3Data.price * 100).toFixed(1)}%)</span>
                  <span className='flex items-center gap-1'><span className='size-1.5 rounded-full bg-amber-500' /> Gateway ({(cm3Data.gatewayFeeUsd / cm3Data.price * 100).toFixed(1)}%)</span>
                  <span className='flex items-center gap-1'><span className='size-1.5 rounded-full bg-sky-500' /> Freight ({(cm3Data.currentFreightUsd / cm3Data.price * 100).toFixed(1)}%)</span>
                  <span className='flex items-center gap-1'><span className='size-1.5 rounded-full bg-indigo-500' /> CAC ({(cm3Data.cacUsd / cm3Data.price * 100).toFixed(1)}%)</span>
                  <span className='flex items-center gap-1 text-emerald-400 font-bold'><span className='size-1.5 rounded-full bg-emerald-500' /> Net CM3 ({cm3Data.netCm3Pct.toFixed(1)}%)</span>
                </div>
              </div>

              {/* Stockout Warning Banner in CM3 Waterfall */}
              {isStockout && (
                <div className='p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-2'>
                    <IconAlertTriangle className='size-4 text-rose-400 shrink-0' />
                    <span><strong>STOCKOUT SHOCK ACTIVE (0 UNITS):</strong> Unit economics theoretical only. Autonomous kill-switch engaged to eliminate $840/day ad spend bleed.</span>
                  </div>
                  <span className='font-mono font-bold text-rose-200 bg-rose-900/80 px-2 py-0.5 rounded border border-rose-700 whitespace-nowrap text-[10px]'>
                    &lambda;_inv = 999.0
                  </span>
                </div>
              )}
            </div>

          {/* SECTION 3: REINFORCEMENT LEARNING VISUAL ANALYTICS (FLOWCHARTS, GRAPHS, PIE CHARTS, BAR PLOTS) */}
          <div className='pt-2'>
            <RLVisualAnalytics
              data={rlData}
              onApplyAction={() => handleMitigate()}
            />
          </div>

          {/* SECTION 4: CLOSED LOOP PIPELINE STEPS */}
          <div className='rounded-xl border border-zinc-800 bg-zinc-950/70 p-4'>
            <div className='flex items-center justify-between text-xs font-mono text-zinc-400 mb-3'>
              <span className='font-bold text-zinc-200 uppercase tracking-wider'>
                Reinforcement Learning Closed-Loop Execution Pipeline
              </span>
              <span className='text-zinc-400 text-[11px]'>Status: Active</span>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-4 gap-3'>
              <div className='p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80'>
                <div className='flex items-center gap-1.5 text-xs font-mono text-zinc-200'>
                  <IconCheck className='size-3.5 text-zinc-400' />
                  <span>1. Ingest Signals</span>
                </div>
                <p className='text-[11px] text-zinc-400 mt-1 font-sans'>
                  Reconciles regional customer purchase intent &amp; inventory state.
                </p>
              </div>

              <div className='p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80'>
                <div className='flex items-center gap-1.5 text-xs font-mono text-zinc-200'>
                  <IconCheck className='size-3.5 text-zinc-400' />
                  <span>2. Bandit Q-Policy</span>
                </div>
                <p className='text-[11px] text-zinc-400 mt-1 font-sans'>
                  Evaluates conversion probability and marginal ad headroom.
                </p>
              </div>

              <div className='p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80'>
                <div className='flex items-center gap-1.5 text-xs font-mono text-zinc-300'>
                  <IconCheck className='size-3.5' />
                  <span>3. Ad Reallocation</span>
                </div>
                <p className='text-[11px] text-zinc-400 mt-1 font-sans'>
                  Suppresses low-probability regions; boosts high-profit zones.
                </p>
              </div>

              <div className='p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80'>
                <div className='flex items-center gap-1.5 text-xs font-mono text-zinc-300'>
                  <IconReportAnalytics className='size-3.5 text-zinc-400' />
                  <span>4. Outcome Ledger</span>
                </div>
                <p className='text-[11px] text-zinc-400 mt-1 font-sans'>
                  Measures realized vs expected lift to refine future policy weights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
