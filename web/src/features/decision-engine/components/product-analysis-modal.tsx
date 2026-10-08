'use client';

import React, { useState, useMemo } from 'react';
import {
  IconWorld,
  IconActivity,
  IconChartBar,
  IconX,
  IconCheck,
  IconAdjustments,
  IconReportAnalytics,
  IconArrowRight,
  IconAlertTriangle,
  IconDatabase,
  IconCpu,
  IconTrendingUp,
  IconChartPie,
  IconGitFork
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { GithubGlobe } from './github-globe';
import { GlobePulse } from '@/components/ui/cobe-globe-pulse';
import { RLVisualAnalytics } from './rl-visual-analytics';
import { computeRLAdAllocation } from '@/lib/rl-ad-optimizer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const [analysisStage, setAnalysisStage] = useState<'analysing' | 'completed'>('analysing');
  const [viewSection, setViewSection] = useState<'all' | 'globe' | 'rl_analytics'>('all');
  const [isExecuting, setIsExecuting] = useState(false);

  // Automatically transition from "analysing" to "completed" after 2.2 seconds
  React.useEffect(() => {
    if (isOpen) {
      setAnalysisStage('analysing');
      const timer = setTimeout(() => {
        setAnalysisStage('completed');
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, product]);

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

  if (!isOpen || !product || !rlData) return null;

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
    <div className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in-0 duration-200'>
      {/* Container */}
      <div className='relative flex flex-col w-full max-w-6xl max-h-[94vh] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl text-zinc-100'>
        {/* Top Diagnostic Phase Header */}
        <div className='flex flex-wrap items-center justify-between border-b border-zinc-800/80 px-4 sm:px-6 py-3.5 bg-zinc-950 gap-3'>
          <div className='flex items-center gap-3'>
            <div className='flex size-3 items-center justify-center'>
              <span className='size-2 rounded-full bg-zinc-300' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-xs font-mono font-bold uppercase tracking-wider text-zinc-200'>
                  {analysisStage === 'analysing'
                    ? '1. ANALYSING PHASE (SCANNING DELIVERY ARCS)'
                    : '2. ANALYSIS COMPLETED (RL AD ALLOCATION & SALES PULSE)'}
                </span>
                <span className='text-zinc-600 hidden sm:inline'>•</span>
                <span className='text-xs font-mono text-zinc-400 hidden sm:inline'>
                  {analysisStage === 'analysing'
                    ? 'Cross-Channel Latency & Audience Exploration'
                    : 'Regional Sales Telemetry & Interaction Velocity'}
                </span>
              </div>
              <p className='text-[11px] font-mono text-zinc-500 mt-0.5'>
                {analysisStage === 'analysing'
                  ? 'Source: WebGL Ad Delivery Engine'
                  : 'Source: Interaction Telemetry + Thompson Bandit RL'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {/* View Section Toggles */}
            <div className='flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5 text-[11px] font-mono'>
              <button
                onClick={() => setViewSection('all')}
                className={cn(
                  'px-2 py-1 rounded transition-all font-semibold',
                  viewSection === 'all'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                All Views
              </button>
              <button
                onClick={() => setViewSection('globe')}
                className={cn(
                  'px-2 py-1 rounded transition-all font-semibold flex items-center gap-1',
                  viewSection === 'globe'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                <IconWorld className='size-3 text-zinc-400' />
                3D Globe
              </button>
              <button
                onClick={() => setViewSection('rl_analytics')}
                className={cn(
                  'px-2 py-1 rounded transition-all font-semibold flex items-center gap-1',
                  viewSection === 'rl_analytics'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                <IconCpu className='size-3 text-zinc-400' />
                RL Analytics
              </button>
            </div>

            {/* Stage Selector */}
            <div className='flex items-center bg-zinc-900/90 rounded-lg border border-zinc-800 p-0.5 text-[11px] font-mono'>
              <button
                onClick={() => setAnalysisStage('analysing')}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all font-semibold',
                  analysisStage === 'analysing'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                Arcs
              </button>
              <button
                onClick={() => setAnalysisStage('completed')}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all font-semibold',
                  analysisStage === 'completed'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                RL Pulse
              </button>
            </div>

            <Badge
              variant='outline'
              className={cn(
                'font-mono text-xs px-2.5 py-0.5 hidden sm:inline-flex',
                isCritical
                  ? 'border-rose-500/40 text-rose-400 bg-rose-950/30'
                  : 'border-zinc-700 text-zinc-300 bg-zinc-900/50'
              )}
            >
              {isStockout ? 'CRITICAL STOCKOUT' : isCritical ? 'ANOMALY DETECTED' : 'HEALTHY PACE'}
            </Badge>

            <button
              onClick={onClose}
              className='size-8 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors'
            >
              <IconX className='size-4' />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className='flex-1 overflow-y-auto p-4 sm:p-6 space-y-6'>
          {/* SECTION 1: 3D GLOBE & PRODUCT TELEMETRY */}
          {(viewSection === 'all' || viewSection === 'globe') && (
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
              {/* Left: 3D Globe View (Analysing Arcs OR Completed Sales Pulse) */}
              <div className='lg:col-span-7 flex flex-col items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-4 relative overflow-hidden'>
                <div className='w-full flex items-center justify-between text-xs font-mono text-zinc-400 mb-1 px-2'>
                  <div className='flex items-center gap-2'>
                    {analysisStage === 'analysing' ? (
                      <>
                        <IconWorld className='size-4 text-zinc-400' />
                        <span className='font-bold text-zinc-200'>GLOBAL AD DELIVERY ARCS (ANALYSING PHASE)</span>
                      </>
                    ) : (
                      <>
                        <span className='size-2 rounded-full bg-zinc-400' />
                        <span className='font-bold text-zinc-200'>RL CUSTOMER INTERACTION &amp; SALES PULSE</span>
                      </>
                    )}
                  </div>
                  <span className='text-[11px] text-zinc-500'>
                    Interactive • Drag to rotate
                  </span>
                </div>

                {/* The Globe: Switch between GitHub Globe and GlobePulse */}
                <div className='w-full min-h-[340px] flex items-center justify-center overflow-x-auto'>
                  {analysisStage === 'analysing' ? (
                    <GithubGlobe
                      size={320}
                      activeSku={product.sku}
                      activePlatform={product.platform}
                      accentColor={isCritical ? [0.95, 0.35, 0.45] : [0.2, 0.85, 0.6]}
                    />
                  ) : (
                    <div className='flex items-center justify-center'>
                      <GlobePulse size={320} speed={0.0035} />
                    </div>
                  )}
                </div>

                {/* Legend & Channel Strip */}
                {analysisStage === 'completed' ? (
                  <div className='w-full flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-900 font-mono text-[10px]'>
                    <div className='flex items-center gap-1.5 text-zinc-300'>
                      <span className='size-2 rounded-full bg-zinc-100 ring-1 ring-zinc-700' />
                      <span>High Intent: US East/West (78% P_conv)</span>
                    </div>
                    <div className='flex items-center gap-1.5 text-zinc-300'>
                      <span className='size-2 rounded-full bg-zinc-400' />
                      <span>EMEA (56% P_conv)</span>
                    </div>
                    <div className='flex items-center gap-1.5 text-zinc-300'>
                      <span className='size-2 rounded-full bg-zinc-500' />
                      <span>APAC (44% P_conv)</span>
                    </div>
                    <div className='flex items-center gap-1.5 text-zinc-400'>
                      <span className='size-2 rounded-full bg-zinc-700' />
                      <span>Suppressed (Underperforming)</span>
                    </div>
                  </div>
                ) : (
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
                )}
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
          )}

          {/* SECTION 2: REINFORCEMENT LEARNING VISUAL ANALYTICS (FLOWCHARTS, GRAPHS, PIE CHARTS, BAR PLOTS) */}
          {(viewSection === 'all' || viewSection === 'rl_analytics') && (
            <div className='pt-2'>
              <RLVisualAnalytics
                data={rlData}
                onApplyAction={(act) => handleMitigate()}
              />
            </div>
          )}

          {/* SECTION 3: CLOSED LOOP PIPELINE STEPS */}
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
