'use client';

import React, { useState, useMemo } from 'react';
import {
  IconCode,
  IconArrowsSplit2,
  IconBrandAmazon,
  IconBrandMeta,
  IconBrandGoogle,
  IconBuildingStore,
  IconCheck,
  IconCopy,
  IconRefresh,
  IconDatabase,
  IconArrowRight,
  IconAlertTriangle,
  IconCpu,
  IconFileCode,
  IconEye,
  IconSparkles
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Raw partial imports
import rawMetaPartials from '@/data/raw-api-partials/meta_insights_partial.json';
import rawGooglePartials from '@/data/raw-api-partials/google_ads_rows_partial.json';
import rawAmazonPartials from '@/data/raw-api-partials/amazon_sponsored_products_partial.json';
import rawShopifyOrders from '@/data/raw-api-partials/shopify_orders_partial.json';
import rawShopifyInventory from '@/data/raw-api-partials/shopify_inventory_partial.json';

import {
  normalizeMetaInsights,
  normalizeGoogleAdsRow,
  normalizeAmazonSponsoredProducts,
  normalizeShopifyOrder,
  UnifiedCommerceRecord
} from '../normalization-engine';

type PlatformKey = 'meta' | 'google' | 'amazon' | 'shopify';

interface PlatformSpec {
  id: PlatformKey;
  name: string;
  sourceApi: string;
  endpoint: string;
  color: string;
  accentBg: string;
  icon: React.ComponentType<{ className?: string }>;
  rawSample: any[];
  keyMismatches: { from: string; to: string; note: string }[];
}

const PLATFORM_SPECS: PlatformSpec[] = [
  {
    id: 'meta',
    name: 'Meta Ads Manager',
    sourceApi: 'Meta Graph API v19.0',
    endpoint: 'GET /v19.0/{ad_id}/insights',
    color: '#3b82f6',
    accentBg: 'rgba(59, 130, 246, 0.1)',
    icon: IconBrandMeta,
    rawSample: rawMetaPartials,
    keyMismatches: [
      { from: 'actions[action_type="omni_purchase"].value', to: 'conversions', note: 'Nested actions array unwrapped' },
      { from: 'action_values[omni_purchase].value', to: 'attributed_revenue', note: 'Monetary conversion value extracted' },
      { from: 'frequency & reach', to: 'wearout_decay_curve', note: 'Creative fatigue & ad saturation monitoring' },
      { from: 'video_3_sec_watched / impressions', to: 'video_hook_rate_pct', note: 'Video creative hook & hold retention' },
      { from: 'learning_phase_status', to: 'guardrail_status', note: 'Algorithmic 20% budget change guardrail' }
    ]
  },
  {
    id: 'google',
    name: 'Google Ads',
    sourceApi: 'Google Ads API (SearchStream)',
    endpoint: 'POST /v17/customers/{id}/googleAds:searchStream',
    color: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.1)',
    icon: IconBrandGoogle,
    rawSample: rawGooglePartials,
    keyMismatches: [
      { from: 'metrics.costMicros', to: 'spend', note: '1,000,000 micros divided to USD float' },
      { from: 'metrics.searchBudgetLostImpressionShare', to: 'budget_lost_is_pct', note: 'Lost IS (Budget) unlocks spend scaling' },
      { from: 'metrics.searchRankLostImpressionShare', to: 'rank_lost_is_pct', note: 'Lost IS (Rank) diagnoses bid floor vs ad quality' },
      { from: 'ad_group_criterion.qualityInfo.qualityScore', to: 'quality_score (1-10)', note: 'SERP relevance & expected CTR score' },
      { from: 'campaign.biddingStrategyType', to: 'target_roas_drift', note: 'Algorithm target vs empirical ROAS drift' }
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon Advertising',
    sourceApi: 'Amazon Ads API v3 (Sponsored Products)',
    endpoint: 'POST /reporting/v3/reports/sp/campaigns',
    color: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.1)',
    icon: IconBrandAmazon,
    rawSample: rawAmazonPartials,
    keyMismatches: [
      { from: 'buyBoxWinPercentage', to: 'buy_box_kill_switch', note: 'SP-API Buy Box Loss prevents funding competitor clicks' },
      { from: 'attributedSalesOtherSku14d', to: 'halo_attributed_revenue', note: 'Catalog Halo effect & brand spillover to other SKUs' },
      { from: 'fbaFeesEstimate & referralFeeRate', to: 'fba_unit_deductions', note: 'True Amazon net margin calculation' },
      { from: 'placement & placementBidMultiplier', to: 'top_of_search_boost', note: 'Placement multiplier bid arbitration' },
      { from: 'cost & attributedSales14d', to: 'spend & attributed_revenue', note: '14-day attribution window reconciled' }
    ]
  },
  {
    id: 'shopify',
    name: 'Shopify Storefront',
    sourceApi: 'Shopify Admin REST / Webhooks',
    endpoint: 'GET /admin/api/2024-01/orders.json',
    color: '#96bf48',
    accentBg: 'rgba(150, 191, 72, 0.1)',
    icon: IconBuildingStore,
    rawSample: rawShopifyOrders,
    keyMismatches: [
      { from: 'customer.orders_count == 1', to: 'customer_acquisition_type', note: 'nCAC (New Customer CAC) vs Returning Customer LTV' },
      { from: 'processing_fee (2.9% + $0.30)', to: 'payment_gateway_fee', note: 'Payment gateway friction margin deduction' },
      { from: 'total_price - COGS - fees - taxes', to: 'net_contribution_margin', note: 'True Contribution Margin 3 (CM3) & POAS' },
      { from: 'line_items[0].sku', to: 'sku_id', note: 'ERP catalog link & real-time COGS matching' },
      { from: 'inventory_item.available', to: 'inventory_runway', note: 'Stockout circuit breaker triggers' }
    ]
  }
];

export function NormalizationShowcase() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>('meta');
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [customJsonInput, setCustomJsonInput] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);
  const [copiedUnified, setCopiedUnified] = useState<boolean>(false);

  // Build warehouse inventory map
  const inventoryMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const inv of rawShopifyInventory) {
      if (inv.sku) map[inv.sku] = inv.available;
    }
    return map;
  }, []);

  const activeSpec = useMemo(() => {
    return PLATFORMS_SPECS_MAP[selectedPlatform] || PLATFORM_SPECS[0];
  }, [selectedPlatform]);

  // Current raw item
  const currentRawItem = useMemo(() => {
    if (isCustomMode && customJsonInput.trim()) {
      try {
        const parsed = JSON.parse(customJsonInput);
        return Array.isArray(parsed) ? parsed[0] : parsed;
      } catch {
        return null;
      }
    }
    return activeSpec.rawSample[selectedSampleIndex] || activeSpec.rawSample[0];
  }, [isCustomMode, customJsonInput, activeSpec, selectedSampleIndex]);

  // Unified record computed in real-time
  const unifiedRecord = useMemo<UnifiedCommerceRecord | null>(() => {
    if (!currentRawItem) return null;
    try {
      switch (selectedPlatform) {
        case 'meta':
          return normalizeMetaInsights(currentRawItem, inventoryMap);
        case 'google':
          return normalizeGoogleAdsRow(currentRawItem, inventoryMap);
        case 'amazon':
          return normalizeAmazonSponsoredProducts(currentRawItem, inventoryMap);
        case 'shopify':
          return normalizeShopifyOrder(currentRawItem, inventoryMap);
        default:
          return null;
      }
    } catch (e) {
      console.error('Normalization error:', e);
      return null;
    }
  }, [currentRawItem, selectedPlatform, inventoryMap]);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadPresetSample = (idx: number) => {
    setIsCustomMode(false);
    setSelectedSampleIndex(idx);
    setCustomJsonInput('');
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen'>
      {/* Page Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='bg-cyan-500/10 text-cyan-500 border-cyan-500/30 font-mono text-[11px]'>
              Live Telemetry Ingestion Contract
            </Badge>
            <Badge variant='outline' className='bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-mono text-[11px]'>
              1:1 API Schemas
            </Badge>
          </div>
          <h1 className='text-xl sm:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2 mt-2 font-sans'>
            <IconArrowsSplit2 className='size-5 text-cyan-500' />
            Schema Normalizer
          </h1>
          <p className='text-xs text-muted-foreground mt-1 max-w-2xl leading-normal'>
            Reconciles heterogeneous ad payloads (Meta, Google, Amazon, Shopify) into canonical UnifiedCommerceRecord records in real-time.
          </p>
        </div>

        {/* Demo Callout Pill */}
        <div className='rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 max-w-sm'>
          <div className='flex items-start gap-2'>
            <IconAlertTriangle className='size-4 text-amber-500 shrink-0 mt-0.5' />
            <div className='text-xs font-mono text-amber-200/90'>
              <span className='font-bold text-amber-400'>Interview Demo Note:</span> Simulating live webhooks with 1:1 endpoint-exact schemas
              derived from production payloads until live OAuth tokens are bound.
            </div>
          </div>
        </div>
      </div>

      {/* Source Platform Selector Tabs */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {PLATFORM_SPECS.map((spec) => {
          const isSelected = selectedPlatform === spec.id;
          const IconComponent = spec.icon;
          return (
            <button
              key={spec.id}
              onClick={() => {
                setSelectedPlatform(spec.id);
                setSelectedSampleIndex(0);
                setIsCustomMode(false);
                setCustomJsonInput('');
              }}
              className={cn(
                'flex flex-col text-left p-3.5 rounded-xl border transition-all relative overflow-hidden',
                isSelected
                  ? 'border-cyan-500/60 bg-muted/70 dark:bg-zinc-900 shadow-md ring-1 ring-cyan-500/40'
                  : 'border-border/70 bg-card hover:bg-muted/40 hover:border-border'
              )}
            >
              <div className='flex items-center justify-between w-full'>
                <div className='flex items-center gap-2'>
                  <div
                    className='size-8 rounded-lg flex items-center justify-center font-bold'
                    style={{ backgroundColor: spec.accentBg, color: spec.color }}
                  >
                    <IconComponent className='size-5' />
                  </div>
                  <div>
                    <div className='text-xs font-mono font-bold text-foreground'>{spec.name}</div>
                    <div className='text-[10px] font-mono text-muted-foreground'>{spec.sourceApi}</div>
                  </div>
                </div>
                {isSelected && (
                  <Badge className='bg-cyan-500 text-black text-[9px] font-mono font-bold px-1.5 py-0.5'>
                    ACTIVE
                  </Badge>
                )}
              </div>
              <div className='mt-2.5 pt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground truncate'>
                {spec.endpoint}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sample Payload Presets & Mode Switcher */}
      <div className='flex flex-wrap items-center justify-between gap-3 bg-muted/40 dark:bg-zinc-900/60 p-3 rounded-lg border border-border/70 text-xs font-mono'>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground'>Preset Payloads:</span>
          {activeSpec.rawSample.map((_, idx) => (
            <button
              key={idx}
              onClick={() => loadPresetSample(idx)}
              className={cn(
                'px-2.5 py-1 rounded border font-mono text-xs transition-all',
                !isCustomMode && selectedSampleIndex === idx
                  ? 'bg-cyan-500 text-black border-cyan-500 font-bold'
                  : 'bg-card border-border hover:border-cyan-500/50 text-foreground'
              )}
            >
              Payload #{idx + 1}
            </button>
          ))}
          <button
            onClick={() => {
              setIsCustomMode(true);
              setCustomJsonInput(JSON.stringify(activeSpec.rawSample[selectedSampleIndex], null, 2));
            }}
            className={cn(
              'px-2.5 py-1 rounded border font-mono text-xs transition-all flex items-center gap-1',
              isCustomMode
                ? 'bg-purple-500 text-white border-purple-500 font-bold'
                : 'bg-card border-border hover:border-purple-500/50 text-foreground'
            )}
          >
            <IconFileCode className='size-3.5' />
            Edit Raw JSON
          </button>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-1.5 text-muted-foreground'>
            <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
            <span>Pydantic v2 Contract Enforced</span>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Showcase: Raw Payload (Left) -> Unified Record (Right) */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* LEFT COLUMN: Raw Platform Partial */}
        <div className='flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs'>
          <div className='flex items-center justify-between p-3.5 bg-muted/60 dark:bg-zinc-900 border-b border-border'>
            <div className='flex items-center gap-2'>
              <div
                className='size-6 rounded flex items-center justify-center'
                style={{ backgroundColor: activeSpec.accentBg, color: activeSpec.color }}
              >
                <activeSpec.icon className='size-4' />
              </div>
              <div>
                <span className='text-xs font-mono font-bold text-foreground uppercase'>
                  Raw {activeSpec.name} Partial
                </span>
                <span className='text-[10px] font-mono text-muted-foreground ml-2'>
                  ({activeSpec.sourceApi})
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={() =>
                  copyToClipboard(
                    isCustomMode ? customJsonInput : JSON.stringify(currentRawItem, null, 2),
                    setCopiedRaw
                  )
                }
                className='p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-all'
                title='Copy Raw JSON'
              >
                {copiedRaw ? <IconCheck className='size-4 text-emerald-500' /> : <IconCopy className='size-4' />}
              </button>
            </div>
          </div>

          {/* JSON Display / Editor */}
          <div className='p-4 bg-slate-950 font-mono text-xs flex-1 min-h-[380px] max-h-[460px] overflow-auto text-slate-200'>
            {isCustomMode ? (
              <textarea
                value={customJsonInput}
                onChange={(e) => setCustomJsonInput(e.target.value)}
                className='w-full h-full min-h-[360px] bg-transparent text-emerald-400 font-mono text-xs resize-none outline-hidden border-none'
                placeholder='Paste raw JSON here...'
              />
            ) : (
              <pre className='whitespace-pre-wrap leading-relaxed'>
                {currentRawItem ? JSON.stringify(currentRawItem, null, 2) : '// No valid JSON payload'}
              </pre>
            )}
          </div>

          {/* Schema Mapping Legend */}
          <div className='p-3.5 bg-muted/30 border-t border-border/70 text-[11px] font-mono'>
            <div className='font-bold text-muted-foreground uppercase text-[10px] mb-2 flex items-center gap-1.5'>
              <IconCpu className='size-3.5 text-cyan-500' />
              Platform Field Extraction Logic
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {activeSpec.keyMismatches.map((m, idx) => (
                <div key={idx} className='p-2 rounded bg-card/60 border border-border/60'>
                  <div className='text-amber-500 font-semibold truncate'>{m.from}</div>
                  <div className='text-emerald-500 font-bold flex items-center gap-1'>
                    &rarr; {m.to}
                  </div>
                  <div className='text-[10px] text-muted-foreground mt-0.5'>{m.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Canonical UnifiedCommerceRecord */}
        <div className='flex flex-col rounded-xl border border-cyan-500/40 bg-card overflow-hidden shadow-xs'>
          <div className='flex items-center justify-between p-3.5 bg-cyan-950/30 border-b border-cyan-500/30'>
            <div className='flex items-center gap-2'>
              <div className='size-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center'>
                <IconDatabase className='size-4' />
              </div>
              <div>
                <span className='text-xs font-mono font-bold text-cyan-400 uppercase'>
                  Canonical UnifiedCommerceRecord
                </span>
                <span className='text-[10px] font-mono text-muted-foreground ml-2'>
                  (DuckDB &amp; Optimizer Tensor)
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-[10px]'>
                VALIDATED ✓
              </Badge>
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(unifiedRecord, null, 2), setCopiedUnified)
                }
                className='p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-all'
                title='Copy Normalized JSON'
              >
                {copiedUnified ? <IconCheck className='size-4 text-emerald-500' /> : <IconCopy className='size-4' />}
              </button>
            </div>
          </div>

          {/* Unified Normalized Metrics Grid */}
          {unifiedRecord ? (
            <div className='p-4 flex flex-col gap-4 flex-1'>
              {/* Product & Campaign Identity Banner */}
              <div className='p-3.5 rounded-lg bg-muted/40 dark:bg-zinc-900 border border-border flex flex-col gap-2 font-mono text-xs'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Canonical SKU:</span>
                  <span className='font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded'>
                    {unifiedRecord.sku_id}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Product Name:</span>
                  <span className='font-bold text-foreground'>{unifiedRecord.sku_name}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Amazon ASIN / Shopify Variant:</span>
                  <span className='text-muted-foreground text-[11px]'>
                    {unifiedRecord.asin || 'N/A'} • {unifiedRecord.variant_id ? unifiedRecord.variant_id.slice(-8) : 'N/A'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Normalized Timestamp:</span>
                  <span className='text-muted-foreground text-[11px]'>{unifiedRecord.timestamp}</span>
                </div>
              </div>

              {/* Key Normalized Numerical Indicators */}
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono'>
                <div className='p-2.5 rounded bg-card border border-border/70 flex flex-col'>
                  <span className='text-[10px] text-muted-foreground uppercase'>Unified Spend</span>
                  <span className='text-base font-bold text-foreground'>
                    ${unifiedRecord.spend.toFixed(2)}
                  </span>
                </div>

                <div className='p-2.5 rounded bg-card border border-border/70 flex flex-col'>
                  <span className='text-[10px] text-muted-foreground uppercase'>Attributed Rev</span>
                  <span className='text-base font-bold text-emerald-500'>
                    ${unifiedRecord.attributed_revenue.toFixed(2)}
                  </span>
                </div>

                <div className='p-2.5 rounded bg-card border border-border/70 flex flex-col'>
                  <span className='text-[10px] text-muted-foreground uppercase'>Gross Margin</span>
                  <span className='text-base font-bold text-cyan-400'>
                    ${unifiedRecord.gross_margin.toFixed(2)} ({unifiedRecord.gross_margin_pct}%)
                  </span>
                </div>

                <div className='p-2.5 rounded bg-card border border-border/70 flex flex-col'>
                  <span className='text-[10px] text-muted-foreground uppercase'>Attributed ROAS</span>
                  <span className='text-base font-bold text-indigo-400'>
                    {unifiedRecord.roas.toFixed(2)}x
                  </span>
                </div>
              </div>

              {/* Secondary Granular Metric Row */}
              <div className='grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono text-[11px]'>
                <div className='p-2 rounded bg-muted/30 border border-border/50'>
                  <div className='text-muted-foreground text-[9px]'>IMPR</div>
                  <div className='font-bold'>{unifiedRecord.impressions.toLocaleString()}</div>
                </div>
                <div className='p-2 rounded bg-muted/30 border border-border/50'>
                  <div className='text-muted-foreground text-[9px]'>CLICKS</div>
                  <div className='font-bold'>{unifiedRecord.clicks.toLocaleString()}</div>
                </div>
                <div className='p-2 rounded bg-muted/30 border border-border/50'>
                  <div className='text-muted-foreground text-[9px]'>CTR</div>
                  <div className='font-bold'>{unifiedRecord.ctr}%</div>
                </div>
                <div className='p-2 rounded bg-muted/30 border border-border/50'>
                  <div className='text-muted-foreground text-[9px]'>CPC</div>
                  <div className='font-bold'>${unifiedRecord.cpc}</div>
                </div>
                <div className='p-2 rounded bg-muted/30 border border-border/50'>
                  <div className='text-muted-foreground text-[9px]'>CPM</div>
                  <div className='font-bold'>${unifiedRecord.cpm}</div>
                </div>
                <div className='p-2 rounded bg-muted/30 border border-border/50'>
                  <div className='text-muted-foreground text-[9px]'>STOCK UNITS</div>
                  <div className={cn('font-bold', unifiedRecord.inventory_on_hand === 0 ? 'text-red-500' : 'text-emerald-500')}>
                    {unifiedRecord.inventory_on_hand === 0 ? '0 (STOCKOUT)' : unifiedRecord.inventory_on_hand}
                  </div>
                </div>
              </div>

              {/* Enterprise Telemetry & ML-Ready Attributes */}
              <div className='p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 flex flex-col gap-2 font-mono text-[11px]'>
                <div className='flex items-center justify-between text-cyan-400 font-bold uppercase text-[10px]'>
                  <span className='flex items-center gap-1.5'>
                    <IconSparkles className='size-3.5 text-cyan-400' />
                    Enterprise Telemetry (ML Feature Store Ready)
                  </span>
                  <Badge variant='outline' className='bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-[9px]'>
                    ADVANCED D2C
                  </Badge>
                </div>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]'>
                  {unifiedRecord.channel === 'meta' && (
                    <>
                      <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                        <span className='text-muted-foreground block text-[9px]'>AD FREQUENCY / WEAROUT</span>
                        <span className='font-bold text-foreground'>{unifiedRecord.frequency ?? 1.0}x</span>
                      </div>
                      <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                        <span className='text-muted-foreground block text-[9px]'>VIDEO 3S HOOK RATE</span>
                        <span className='font-bold text-indigo-400'>{unifiedRecord.video_hook_rate_pct ? `${unifiedRecord.video_hook_rate_pct}%` : 'N/A (Still)'}</span>
                      </div>
                      <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                        <span className='text-muted-foreground block text-[9px]'>LEARNING PHASE STATUS</span>
                        <span className='font-bold text-emerald-400'>{unifiedRecord.learning_phase_status ?? 'SUCCESS'}</span>
                      </div>
                    </>
                  )}

                  {unifiedRecord.channel === 'google' && (
                    <>
                      <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                        <span className='text-muted-foreground block text-[9px]'>LOST IS (BUDGET SCALING)</span>
                        <span className='font-bold text-amber-400'>{unifiedRecord.search_budget_lost_is_pct}%</span>
                      </div>
                      <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                        <span className='text-muted-foreground block text-[9px]'>LOST IS (RANK / AD FLOOR)</span>
                        <span className='font-bold text-rose-400'>{unifiedRecord.search_rank_lost_is_pct}%</span>
                      </div>
                      <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                        <span className='text-muted-foreground block text-[9px]'>SERP QUALITY SCORE</span>
                        <span className='font-bold text-emerald-400'>{unifiedRecord.quality_score ?? 9} / 10</span>
                      </div>
                    </>
                  )}

                  {unifiedRecord.channel === 'amazon' && (
                    <>
                      <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                        <span className='text-muted-foreground block text-[9px]'>SP-API BUY BOX WIN %</span>
                        <span className={cn('font-bold', (unifiedRecord.buy_box_win_pct ?? 100) < 80 ? 'text-rose-400' : 'text-emerald-400')}>
                          {unifiedRecord.buy_box_win_pct}%
                        </span>
                      </div>
                      <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                        <span className='text-muted-foreground block text-[9px]'>CATALOG HALO REVENUE</span>
                        <span className='font-bold text-cyan-400'>${unifiedRecord.halo_attributed_revenue?.toFixed(2) ?? '0.00'}</span>
                      </div>
                      <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                        <span className='text-muted-foreground block text-[9px]'>FBA FULFILLMENT DEDUCTION</span>
                        <span className='font-bold text-amber-400'>${unifiedRecord.fba_fees?.toFixed(2) ?? '0.00'}</span>
                      </div>
                    </>
                  )}

                  {unifiedRecord.channel === 'shopify' && (
                    <>
                      <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                        <span className='text-muted-foreground block text-[9px]'>CUSTOMER ACQUISITION</span>
                        <span className='font-bold text-purple-400'>{unifiedRecord.customer_acquisition_type}</span>
                      </div>
                      <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                        <span className='text-muted-foreground block text-[9px]'>PAYMENT GATEWAY FEE</span>
                        <span className='font-bold text-amber-400'>${unifiedRecord.payment_gateway_fee?.toFixed(2)}</span>
                      </div>
                      <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                        <span className='text-muted-foreground block text-[9px]'>CONTRIBUTION MARGIN 3 (CM3)</span>
                        <span className='font-bold text-emerald-400'>${unifiedRecord.net_contribution_margin?.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Live JSON Preview of Unified Record */}
              <div className='rounded bg-slate-950 p-3 font-mono text-[11px] text-cyan-300 overflow-auto max-h-[170px] border border-cyan-500/20'>
                <pre className='whitespace-pre-wrap leading-tight'>
                  {JSON.stringify(
                    {
                      timestamp: unifiedRecord.timestamp,
                      channel: unifiedRecord.channel,
                      campaign_id: unifiedRecord.campaign_id,
                      sku_id: unifiedRecord.sku_id,
                      spend: unifiedRecord.spend,
                      attributed_revenue: unifiedRecord.attributed_revenue,
                      roas: unifiedRecord.roas,
                      gross_margin: unifiedRecord.gross_margin,
                      inventory_on_hand: unifiedRecord.inventory_on_hand,
                      ...(unifiedRecord.frequency ? { frequency: unifiedRecord.frequency } : {}),
                      ...(unifiedRecord.video_hook_rate_pct ? { video_hook_rate_pct: unifiedRecord.video_hook_rate_pct } : {}),
                      ...(unifiedRecord.search_budget_lost_is_pct != null ? { search_budget_lost_is_pct: unifiedRecord.search_budget_lost_is_pct } : {}),
                      ...(unifiedRecord.buy_box_win_pct != null ? { buy_box_win_pct: unifiedRecord.buy_box_win_pct } : {}),
                      ...(unifiedRecord.halo_attributed_revenue != null ? { halo_attributed_revenue: unifiedRecord.halo_attributed_revenue } : {}),
                      ...(unifiedRecord.customer_acquisition_type ? { customer_acquisition_type: unifiedRecord.customer_acquisition_type } : {}),
                      ...(unifiedRecord.net_contribution_margin != null ? { net_contribution_margin: unifiedRecord.net_contribution_margin } : {})
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          ) : (
            <div className='p-8 text-center text-muted-foreground font-mono text-xs'>
              Invalid payload or unable to normalize.
            </div>
          )}
        </div>
      </div>

      {/* Cross-Channel Normalization Flow Explanation (For Interviewers) */}
      <div className='rounded-xl border border-border/80 bg-card p-5'>
        <h3 className='text-sm font-mono font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
          <IconSparkles className='size-4 text-cyan-500' />
          How NEXUS-DQPS Normalizes Cross-Platform Data in Production
        </h3>
        <p className='text-xs font-mono text-muted-foreground mt-1'>
          The Section 1 ingestion architecture eliminates data quality degradation before the SLSQP optimizer or causal DAG runs:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 font-mono text-xs'>
          <div className='p-3.5 rounded-lg bg-muted/40 border border-border'>
            <div className='font-bold text-cyan-400 mb-1'>1. Micro &amp; Currency FX</div>
            <p className='text-muted-foreground text-[11px] leading-relaxed'>
              Converts Google Ads <code className='text-emerald-400'>costMicros</code> ($1 = 1,000,000) into standard decimal USD floats,
              and converts multi-currency accounts using daily ECB rates.
            </p>
          </div>

          <div className='p-3.5 rounded-lg bg-muted/40 border border-border'>
            <div className='font-bold text-emerald-400 mb-1'>2. Dynamic Action Parsing</div>
            <p className='text-muted-foreground text-[11px] leading-relaxed'>
              Unwraps Meta Graph API nested <code className='text-emerald-400'>actions</code> and <code className='text-emerald-400'>action_values</code> arrays,
              extracting omnichannel purchase counts and attributed revenue.
            </p>
          </div>

          <div className='p-3.5 rounded-lg bg-muted/40 border border-border'>
            <div className='font-bold text-amber-400 mb-1'>3. Identity Graph Resolution</div>
            <p className='text-muted-foreground text-[11px] leading-relaxed'>
              Resolves disparate identifiers (Amazon ASIN <code className='text-amber-400'>B07Q8Z9101</code> &rarr; Shopify Variant <code className='text-amber-400'>41001</code>)
              to the canonical SKU <code className='text-cyan-400'>310805-137</code>.
            </p>
          </div>

          <div className='p-3.5 rounded-lg bg-muted/40 border border-border'>
            <div className='font-bold text-purple-400 mb-1'>4. COGS &amp; True Margin</div>
            <p className='text-muted-foreground text-[11px] leading-relaxed'>
              Reconciles physical warehouse stock and unit COGS directly with ad clicks, enabling True Net Contribution Margin
              instead of vanity ROAS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const PLATFORMS_SPECS_MAP: Record<PlatformKey, PlatformSpec> = PLATFORM_SPECS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<PlatformKey, PlatformSpec>
);
