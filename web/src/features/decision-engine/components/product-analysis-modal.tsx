'use client';

import React, { useState } from 'react';
import {
  IconWorld,
  IconActivity,
  IconChartBar,
  IconX,
  IconCheck,
  IconSparkles,
  IconArrowRight,
  IconAlertTriangle,
  IconDatabase,
  IconBolt
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GithubGlobe } from './github-globe';
import { GlobePulse } from '@/components/ui/cobe-globe-pulse';
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

  if (!isOpen || !product) return null;

  const handleMitigate = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      toast.success(`Autonomous Mitigation Executed for ${product.productName}`, {
        description: 'Budget reallocated via SLSQP solver. Sent execution order to Ad API.'
      });
      onMitigate?.(product);
      onClose();
    }, 900);
  };

  const isStockout = product.inventory !== undefined && product.inventory <= 0;
  const isCritical = product.severity === 'CRITICAL' || isStockout || (product.roas !== undefined && product.roas < 1.8);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200'>
      {/* Container */}
      <div className='relative flex flex-col w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-zinc-800 bg-[#07090e] shadow-2xl text-zinc-100'>
        {/* Top Diagnostic Phase Header */}
        <div className='flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-950/80'>
          <div className='flex items-center gap-3'>
            <div className='relative flex size-3 items-center justify-center'>
              <span
                className={cn(
                  'absolute size-3 rounded-full opacity-75 animate-ping',
                  analysisStage === 'analysing' ? 'bg-cyan-400' : 'bg-emerald-400'
                )}
              />
              <span
                className={cn(
                  'size-2 rounded-full',
                  analysisStage === 'analysing' ? 'bg-cyan-400' : 'bg-emerald-400'
                )}
              />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'text-xs font-mono font-bold uppercase tracking-wider',
                    analysisStage === 'analysing' ? 'text-cyan-400' : 'text-emerald-400'
                  )}
                >
                  {analysisStage === 'analysing'
                    ? '1. ANALYSING PHASE'
                    : '2. ANALYSIS COMPLETED (CUSTOMER INTERACTION & SALES HEATMAP)'}
                </span>
                <span className='text-zinc-600'>•</span>
                <span className='text-xs font-mono text-zinc-400'>
                  {analysisStage === 'analysing'
                    ? 'Scanning Ad Delivery Arcs & Cross-Channel Latency'
                    : 'High Sales in Red • Decreasingly Yellow • No Grey'}
                </span>
              </div>
              <p className='text-[11px] font-mono text-zinc-500 mt-0.5'>
                {analysisStage === 'analysing'
                  ? 'Source: GitHub Globe WebGL Engine (github.com/globe)'
                  : 'Source: Cobe Globe Pulse (21st.dev/r/shuding/cobe-globe-pulse)'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {/* Phase Switcher */}
            <div className='flex items-center bg-zinc-900/90 rounded-lg border border-zinc-800 p-0.5 text-[11px] font-mono'>
              <button
                onClick={() => setAnalysisStage('analysing')}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all font-semibold',
                  analysisStage === 'analysing'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                Analysing Arcs
              </button>
              <button
                onClick={() => setAnalysisStage('completed')}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all font-semibold',
                  analysisStage === 'completed'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                Sales Pulse
              </button>
            </div>

            <Badge
              variant='outline'
              className={cn(
                'font-mono text-xs px-2.5 py-0.5',
                isCritical
                  ? 'border-rose-500/40 text-rose-400 bg-rose-950/30'
                  : 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
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
        <div className='flex-1 overflow-y-auto p-6 space-y-6'>
          {/* Main Hero Grid: Left = Globe, Right = Product Analysis & Telemetry */}
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-center'>
            {/* Left: 3D Globe View (Analysing Arcs OR Completed Sales Pulse) */}
            <div className='lg:col-span-7 flex flex-col items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-4 relative overflow-hidden'>
              <div className='w-full flex items-center justify-between text-xs font-mono text-zinc-400 mb-1 px-2'>
                <div className='flex items-center gap-2'>
                  {analysisStage === 'analysing' ? (
                    <>
                      <IconWorld className='size-4 text-cyan-400 animate-spin duration-7000' />
                      <span className='font-bold text-zinc-200'>GLOBAL AD DELIVERY ARCS (ANALYSING)</span>
                    </>
                  ) : (
                    <>
                      <span className='size-2 rounded-full bg-rose-500 animate-pulse' />
                      <span className='font-bold text-rose-300'>HIGH SALES &amp; CUSTOMER INTERACTION PULSE</span>
                    </>
                  )}
                </div>
                <span className='text-[11px] text-zinc-500'>
                  Interactive • Drag to rotate
                </span>
              </div>

              {/* The Globe: Switch between GitHub Globe and GlobePulse */}
              <div className='w-full h-[360px] flex items-center justify-center'>
                {analysisStage === 'analysing' ? (
                  <GithubGlobe
                    className='w-full h-full'
                    activeSku={product.sku}
                    activePlatform={product.platform}
                    accentColor={isCritical ? [0.95, 0.35, 0.45] : [0.2, 0.85, 0.6]}
                  />
                ) : (
                  <div className='w-full h-full max-w-[360px] flex items-center justify-center'>
                    <GlobePulse className='w-full h-full' speed={0.0035} />
                  </div>
                )}
              </div>

              {/* Legend & Channel Strip */}
              {analysisStage === 'completed' ? (
                <div className='w-full flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-900 font-mono text-[10px]'>
                  <div className='flex items-center gap-1.5 text-zinc-300'>
                    <span className='size-2 rounded-full bg-red-500 ring-2 ring-red-500/20' />
                    <span>High Sales (US East / US West)</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-zinc-300'>
                    <span className='size-2 rounded-full bg-orange-500' />
                    <span>EMEA &amp; APAC</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-zinc-300'>
                    <span className='size-2 rounded-full bg-yellow-400' />
                    <span>Decreasing (India / SEA)</span>
                  </div>
                  <div className='text-zinc-500'>
                    No Grey
                  </div>
                </div>
              ) : (
                <div className='w-full grid grid-cols-4 gap-2 pt-3 border-t border-zinc-900 text-center font-mono text-[10px]'>
                  <div className='p-1.5 rounded bg-zinc-900/50 border border-zinc-800/60'>
                    <div className='text-zinc-500'>META ADS</div>
                    <div className='text-cyan-400 font-bold'>US-East / SF</div>
                  </div>
                  <div className='p-1.5 rounded bg-zinc-900/50 border border-zinc-800/60'>
                    <div className='text-zinc-500'>GOOGLE SHOPPING</div>
                    <div className='text-blue-400 font-bold'>EU / London</div>
                  </div>
                  <div className='p-1.5 rounded bg-zinc-900/50 border border-zinc-800/60'>
                    <div className='text-zinc-500'>AMAZON DSP</div>
                    <div className='text-amber-400 font-bold'>APAC / Tokyo</div>
                  </div>
                  <div className='p-1.5 rounded bg-zinc-900/50 border border-zinc-800/60'>
                    <div className='text-zinc-500'>TIKTOK FEED</div>
                    <div className='text-emerald-400 font-bold'>SEA / Singapore</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Product Card & Real-time Diagnostic Telemetry */}
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
                      <Badge variant='outline' className='text-[10px] font-mono border-zinc-700 text-zinc-400'>
                        {product.platform || 'Cross-Platform'}
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

              {/* RCA Factor Decomposition */}
              <div className='rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3'>
                <div className='flex items-center justify-between text-xs font-mono'>
                  <span className='font-bold text-zinc-200 flex items-center gap-1.5'>
                    <IconChartBar className='size-3.5 text-cyan-400' />
                    Causal Factor Breakdown
                  </span>
                  <span className='text-zinc-500 text-[11px]'>|Z| Attribution</span>
                </div>

                <div className='space-y-2'>
                  {(product.factors && product.factors.length > 0
                    ? product.factors
                    : [
                        { name: 'Inventory Depletion', impactPts: isStockout ? -85.0 : -12.5, color: 'rose' },
                        { name: 'Meta CPM Surge', impactPts: -14.2, color: 'amber' },
                        { name: 'Creative Wearout (CTR)', impactPts: -6.8, color: 'cyan' }
                      ]
                  ).map((f, i) => (
                    <div key={i} className='space-y-1 font-mono text-xs'>
                      <div className='flex justify-between text-[11px]'>
                        <span className='text-zinc-400'>{f.name}</span>
                        <span className={cn('font-bold', f.impactPts < 0 ? 'text-rose-400' : 'text-emerald-400')}>
                          {f.impactPts > 0 ? `+${f.impactPts}` : f.impactPts} pts
                        </span>
                      </div>
                      <div className='h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden'>
                        <div
                          className={cn(
                            'h-full rounded-full',
                            f.color === 'rose' || f.impactPts < -30
                              ? 'bg-rose-500'
                              : f.color === 'amber'
                              ? 'bg-amber-500'
                              : 'bg-cyan-500'
                          )}
                          style={{ width: `${Math.min(100, Math.abs(f.impactPts) * 1.2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Explanation text */}
                <p className='text-xs text-zinc-300 leading-relaxed font-sans bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80'>
                  {product.explanation ||
                    `Autonomous engine identified high marginal return capacity across alternative campaigns. Target ad spend reallocation recommended to protect blend ROAS floor 1.80x.`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center gap-3 pt-2'>
                <Button
                  onClick={handleMitigate}
                  disabled={isExecuting}
                  className='flex-1 font-mono text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                >
                  <IconArrowRight className='size-3.5 mr-1.5' />
                  {isExecuting ? 'Dispatching...' : 'Execute Reallocation'}
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

          {/* Bottom Telemetry Pipeline Steps */}
          <div className='rounded-xl border border-zinc-800 bg-zinc-950/70 p-4'>
            <div className='flex items-center justify-between text-xs font-mono text-zinc-400 mb-3'>
              <span className='font-bold text-zinc-200 uppercase tracking-wider'>
                Closed-Loop Telemetry Execution Pipeline
              </span>
              <span className='text-emerald-400'>100% Autonomous Synchronized</span>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-4 gap-3'>
              <div className='p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80'>
                <div className='flex items-center gap-1.5 text-xs font-mono text-emerald-400'>
                  <IconCheck className='size-3.5' />
                  <span>1. Ingest Data</span>
                </div>
                <p className='text-[11px] text-zinc-400 mt-1 font-sans'>
                  Reconciled 4 ad platforms &amp; Shopify ERP in DuckDB.
                </p>
              </div>

              <div className='p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80'>
                <div className='flex items-center gap-1.5 text-xs font-mono text-cyan-400'>
                  <IconCheck className='size-3.5' />
                  <span>2. Anomaly Scan</span>
                </div>
                <p className='text-[11px] text-zinc-400 mt-1 font-sans'>
                  IsolationForest flagged deviation (|Z| &gt; 2.2).
                </p>
              </div>

              <div className='p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80'>
                <div className='flex items-center gap-1.5 text-xs font-mono text-cyan-400'>
                  <IconCheck className='size-3.5' />
                  <span>3. Root-Cause (RCA)</span>
                </div>
                <p className='text-[11px] text-zinc-400 mt-1 font-sans'>
                  Decomposed causal drivers &amp; margin delta.
                </p>
              </div>

              <div className='p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80'>
                <div className='flex items-center gap-1.5 text-xs font-mono text-emerald-400'>
                  <IconSparkles className='size-3.5 text-purple-400' />
                  <span>4. Closed Ledger</span>
                </div>
                <p className='text-[11px] text-zinc-400 mt-1 font-sans'>
                  Real-time audit trail logs forecasted vs realized lift.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
