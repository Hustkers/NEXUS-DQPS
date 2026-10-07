'use client';

import React, { useState, useMemo } from 'react';
import {
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
  IconSparkles,
  IconInfoCircle,
  IconRocket,
  IconCurrencyDollar,
  IconPackage,
  IconShieldCheck
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  problemDescription: string;
  solutionDescription: string;
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
    problemDescription: 'Meta buries purchase and revenue values 4 levels deep in heterogeneous "actions" arrays with creative frequency decay.',
    solutionDescription: 'NEXUS unrolls the actions array, extracts omni_purchase count and monetary value, and computes creative hook & fatigue rates.',
    keyMismatches: [
      { from: 'actions[action_type="omni_purchase"].value', to: 'conversions', note: 'Nested actions array unwrapped to verified order count' },
      { from: 'action_values[omni_purchase].value', to: 'attributed_revenue', note: 'Monetary conversion value extracted & currency-normalized' },
      { from: 'frequency & reach', to: 'wearout_decay_curve', note: 'Monitors ad fatigue to trigger creative refresh before performance dips' },
      { from: 'video_3_sec_watched / impressions', to: 'video_hook_rate_pct', note: 'Measures video hook retention (first 3 seconds)' },
      { from: 'learning_phase_status', to: 'guardrail_status', note: 'Guards budget scaling to prevent algorithm reset' }
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
    problemDescription: 'Google reports spend in micro-cents (1,000,000 micros = $1) and conceals impression share lost to budget constraints.',
    solutionDescription: 'NEXUS divides costMicros by 10^6, calculates Lost IS to uncover budget headroom, and matches SERP quality scores.',
    keyMismatches: [
      { from: 'metrics.costMicros', to: 'spend', note: '1,000,000 micros divided to clean decimal currency float' },
      { from: 'metrics.searchBudgetLostImpressionShare', to: 'budget_lost_is_pct', note: 'Lost Impression Share detects when budget is capping growth' },
      { from: 'metrics.searchRankLostImpressionShare', to: 'rank_lost_is_pct', note: 'Lost IS (Rank) diagnoses bid floor vs ad copy quality' },
      { from: 'ad_group_criterion.qualityInfo.qualityScore', to: 'quality_score (1-10)', note: 'SERP keyword relevance score for bid arbitration' },
      { from: 'campaign.biddingStrategyType', to: 'target_roas_drift', note: 'Detects divergence between target ROAS and actual return' }
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
    problemDescription: 'Amazon blends 14-day attribution windows with catalog halo effects and Buy Box win percentages that can waste budget.',
    solutionDescription: 'NEXUS reconciles 14-day lag, detects cross-SKU halo sales, and triggers Buy Box kill-switches if third-party sellers win the box.',
    keyMismatches: [
      { from: 'buyBoxWinPercentage', to: 'buy_box_kill_switch', note: 'Instantly stops ads if Buy Box is lost to 3rd-party counterfeiters' },
      { from: 'attributedSalesOtherSku14d', to: 'halo_attributed_revenue', note: 'Captures sales of related shoes triggered by this ad' },
      { from: 'fbaFeesEstimate & referralFeeRate', to: 'fba_unit_deductions', note: 'Deducts Amazon FBA handling fees for true net profit' },
      { from: 'cost & attributedSales14d', to: 'spend & attributed_revenue', note: '14-day window reconciled with 1st-party orders' }
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
    problemDescription: 'Storefront webhooks stream raw order and inventory json without ad attribution or payment gateway fee deductions.',
    solutionDescription: 'NEXUS maps customer order histories to calculate new vs returning customer LTV, deducts payment fees, and matches ERP inventory.',
    keyMismatches: [
      { from: 'customer.orders_count == 1', to: 'customer_acquisition_type', note: 'Identifies new customer acquisition (nCAC) vs returning buyer LTV' },
      { from: 'processing_fee (2.9% + $0.30)', to: 'payment_gateway_fee', note: 'Deducts gateway friction for true Contribution Margin 3 (CM3)' },
      { from: 'total_price - COGS - fees - taxes', to: 'net_contribution_margin', note: 'Calculates true profit after all unit costs' },
      { from: 'line_items[0].sku', to: 'sku_id', note: 'Joins Shopify variant barcode to canonical Nike SKU' },
      { from: 'inventory_item.available', to: 'inventory_runway', note: 'Automatically stops ads if warehouse stock reaches 0' }
    ]
  }
];

const PLATFORMS_SPECS_MAP: Record<PlatformKey, PlatformSpec> = PLATFORM_SPECS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<PlatformKey, PlatformSpec>
);

export function NormalizationShowcase() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>('meta');
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [customJsonInput, setCustomJsonInput] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);
  const [copiedUnified, setCopiedUnified] = useState<boolean>(false);
  const [rightViewMode, setRightViewMode] = useState<'visual' | 'json'>('visual');
  const [showGuide, setShowGuide] = useState<boolean>(true);

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

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} Copied to Clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadPresetSample = (idx: number) => {
    setIsCustomMode(false);
    setSelectedSampleIndex(idx);
    setCustomJsonInput('');
    toast.info(`Loaded Sample Payload #${idx + 1} for ${activeSpec.name}`);
  };

  const handleSendToDecisionEngine = () => {
    if (!unifiedRecord) return;
    toast.success('Dispatched to Decision Engine & RL Optimizer', {
      description: `Normalized tensor for SKU ${unifiedRecord.sku_id} (${unifiedRecord.channel.toUpperCase()}) ingested into real-time optimizer cache.`
    });
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen min-w-0 max-w-full font-sans'>
      
      {/* 1. Header Banner & Business Explanation */}
      <div className='flex flex-col gap-3 border-b border-border/80 pb-5'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-2 flex-wrap'>
            <Badge variant='outline' className='bg-cyan-500/10 text-cyan-500 border-cyan-500/30 font-mono text-[11px]'>
              Data Ingestion Layer
            </Badge>
            <Badge variant='outline' className='bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-mono text-[11px]'>
              Real-Time Transformation
            </Badge>
            <Badge variant='outline' className='bg-indigo-500/10 text-indigo-400 border-indigo-500/30 font-mono text-[11px]'>
              Cross-Platform SKU Harmonization
            </Badge>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setShowGuide(!showGuide)}
              className='text-xs font-mono h-8 flex items-center gap-1.5'
            >
              <IconInfoCircle className='size-3.5 text-cyan-500' />
              <span>{showGuide ? 'Hide Feature Guide' : 'How This Feature Works'}</span>
            </Button>
          </div>
        </div>

        <div>
          <h1 className='text-xl sm:text-2xl font-mono font-bold text-foreground uppercase tracking-tight flex items-center gap-2.5 mt-1'>
            <IconArrowsSplit2 className='size-6 text-cyan-500 shrink-0' />
            Live Ad API Normalizer &amp; Schema Harmonizer
          </h1>
          <p className='text-xs sm:text-sm text-muted-foreground mt-1 max-w-4xl leading-relaxed'>
            Every ad network reports metrics differently (Google in micro-cents, Meta in nested arrays, Amazon in halo windows, Shopify in raw webhooks).
            NEXUS automatically translates and unifies these raw payloads in real-time so autonomous decision engines can optimize spend across all channels without calculation errors.
          </p>
        </div>

        {/* 2. User-Friendly Interactive Guide / Walkthrough Card */}
        {showGuide && (
          <div className='rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3 font-mono text-xs animate-in fade-in duration-200'>
            <div className='flex items-center justify-between'>
              <span className='font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]'>
                <IconSparkles className='size-3.5 text-cyan-400' />
                Interactive 3-Step Walkthrough Guide
              </span>
              <button
                onClick={() => setShowGuide(false)}
                className='text-[10px] text-muted-foreground hover:text-foreground'
              >
                Dismiss ✕
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <div className='p-3 rounded-lg bg-card/60 border border-border/70 space-y-1'>
                <div className='flex items-center gap-2 text-foreground font-semibold text-xs'>
                  <span className='size-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px] font-bold'>
                    1
                  </span>
                  Choose Ad Platform
                </div>
                <p className='text-muted-foreground text-[11px] leading-relaxed'>
                  Click any of the 4 platform cards below (Meta, Google, Amazon, Shopify) to inspect its exact live API schema.
                </p>
              </div>

              <div className='p-3 rounded-lg bg-card/60 border border-border/70 space-y-1'>
                <div className='flex items-center gap-2 text-foreground font-semibold text-xs'>
                  <span className='size-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px] font-bold'>
                    2
                  </span>
                  Inspect or Edit Raw JSON
                </div>
                <p className='text-muted-foreground text-[11px] leading-relaxed'>
                  Toggle between preset payloads (#1, #2, #3) or click <strong>&quot;Edit Raw JSON&quot;</strong> to test your own custom ad payload.
                </p>
              </div>

              <div className='p-3 rounded-lg bg-card/60 border border-border/70 space-y-1'>
                <div className='flex items-center gap-2 text-foreground font-semibold text-xs'>
                  <span className='size-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px] font-bold'>
                    3
                  </span>
                  Live Normalization Output
                </div>
                <p className='text-muted-foreground text-[11px] leading-relaxed'>
                  Watch the right panel instantly calculate unified Spend, Revenue, True ROAS, and inventory checks in real-time.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Source Platform Selector Tabs */}
      <div>
        <div className='text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5'>
          <span>Step 1: Select Ad Network API to Normalize</span>
        </div>
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
                  toast.info(`Switched to ${spec.name}`);
                }}
                className={cn(
                  'flex flex-col text-left p-3.5 rounded-xl border transition-all relative overflow-hidden cursor-pointer',
                  isSelected
                    ? 'border-cyan-500/80 bg-card shadow-md ring-2 ring-cyan-500/30'
                    : 'border-border/70 bg-card hover:bg-muted/40 hover:border-border'
                )}
              >
                <div className='flex items-center justify-between w-full'>
                  <div className='flex items-center gap-2.5'>
                    <div
                      className='size-8 rounded-lg flex items-center justify-center font-bold shrink-0'
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
                    <Badge className='bg-cyan-500 text-black text-[9px] font-mono font-bold px-1.5 py-0.5 shrink-0'>
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
      </div>

      {/* 4. Sample Payload Presets & Mode Switcher Bar */}
      <div className='flex flex-wrap items-center justify-between gap-3 bg-muted/40 dark:bg-zinc-900/60 p-3 rounded-lg border border-border/70 text-xs font-mono'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='text-muted-foreground font-semibold'>Step 2: Choose Payload:</span>
          {activeSpec.rawSample.map((_, idx) => (
            <button
              key={idx}
              onClick={() => loadPresetSample(idx)}
              className={cn(
                'px-2.5 py-1 rounded border font-mono text-xs transition-all cursor-pointer',
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
              toast.info('Custom JSON Edit Mode Activated');
            }}
            className={cn(
              'px-2.5 py-1 rounded border font-mono text-xs transition-all flex items-center gap-1 cursor-pointer',
              isCustomMode
                ? 'bg-purple-600 text-white border-purple-600 font-bold'
                : 'bg-card border-border hover:border-purple-500/50 text-foreground'
            )}
          >
            <IconFileCode className='size-3.5' />
            <span>Edit Raw JSON</span>
          </button>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-1.5 text-muted-foreground text-[11px]'>
            <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
            <span>Standard Pydantic Validation Active</span>
          </div>
        </div>
      </div>

      {/* 5. Main Split-Screen Showcase: Raw Payload (Left) -> Unified Record (Right) */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        
        {/* LEFT COLUMN: Raw Platform Partial */}
        <div className='flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs'>
          <div className='flex items-center justify-between p-3.5 bg-muted/60 dark:bg-zinc-900 border-b border-border'>
            <div className='flex items-center gap-2'>
              <div
                className='size-6 rounded flex items-center justify-center shrink-0'
                style={{ backgroundColor: activeSpec.accentBg, color: activeSpec.color }}
              >
                <activeSpec.icon className='size-4' />
              </div>
              <div>
                <span className='text-xs font-mono font-bold text-foreground uppercase'>
                  1. Raw {activeSpec.name} Payload
                </span>
                <span className='text-[10px] font-mono text-muted-foreground ml-2 hidden sm:inline'>
                  (Before Normalization)
                </span>
              </div>
            </div>

            <div className='flex items-center gap-1.5'>
              <Button
                size='sm'
                variant='outline'
                onClick={() =>
                  copyToClipboard(
                    isCustomMode ? customJsonInput : JSON.stringify(currentRawItem, null, 2),
                    setCopiedRaw,
                    'Raw JSON'
                  )
                }
                className='h-7 text-[11px] font-mono px-2 flex items-center gap-1'
                title='Copy Raw JSON'
              >
                {copiedRaw ? <IconCheck className='size-3.5 text-emerald-500' /> : <IconCopy className='size-3.5' />}
                <span>{copiedRaw ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          {/* JSON Display / Live Editor */}
          <div className='p-4 bg-slate-950 font-mono text-xs flex-1 min-h-[380px] max-h-[460px] overflow-auto text-slate-200'>
            {isCustomMode ? (
              <div className='flex flex-col h-full space-y-2'>
                <div className='flex items-center justify-between text-[11px] text-purple-400 border-b border-purple-500/30 pb-1'>
                  <span>✏️ Live JSON Editor (Edits normalize in real-time)</span>
                  <button
                    onClick={() => {
                      setIsCustomMode(false);
                      setCustomJsonInput('');
                    }}
                    className='text-[10px] text-muted-foreground hover:text-white'
                  >
                    Cancel / Reset
                  </button>
                </div>
                <textarea
                  value={customJsonInput}
                  onChange={(e) => setCustomJsonInput(e.target.value)}
                  className='w-full h-full min-h-[340px] bg-transparent text-emerald-400 font-mono text-xs resize-none outline-hidden border-none'
                  placeholder='Paste or edit raw JSON here...'
                />
              </div>
            ) : (
              <pre className='whitespace-pre-wrap leading-relaxed'>
                {currentRawItem ? JSON.stringify(currentRawItem, null, 2) : '// No valid JSON payload'}
              </pre>
            )}
          </div>

          {/* Field-by-Field Mapping Inspector */}
          <div className='p-3.5 bg-muted/30 border-t border-border/70 text-[11px] font-mono'>
            <div className='font-bold text-muted-foreground uppercase text-[10px] mb-2 flex items-center gap-1.5'>
              <IconCpu className='size-3.5 text-cyan-500' />
              Automatic Transformation Rules Applied to This Payload
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {activeSpec.keyMismatches.map((m, idx) => (
                <div key={idx} className='p-2 rounded bg-card/60 border border-border/60 space-y-0.5'>
                  <div className='text-amber-500 font-semibold truncate text-[10px]'>{m.from}</div>
                  <div className='text-emerald-500 font-bold flex items-center gap-1 text-[11px]'>
                    &rarr; {m.to}
                  </div>
                  <div className='text-[10px] text-muted-foreground'>{m.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Canonical UnifiedCommerceRecord */}
        <div className='flex flex-col rounded-xl border border-cyan-500/40 bg-card overflow-hidden shadow-xs'>
          <div className='flex items-center justify-between p-3.5 bg-cyan-950/30 border-b border-cyan-500/30'>
            <div className='flex items-center gap-2'>
              <div className='size-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0'>
                <IconDatabase className='size-4' />
              </div>
              <div>
                <span className='text-xs font-mono font-bold text-cyan-400 uppercase'>
                  2. Canonical Unified Commerce Record
                </span>
                <span className='text-[10px] font-mono text-muted-foreground ml-2 hidden sm:inline'>
                  (Clean Optimizer Output)
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {/* Toggle View: Visual vs JSON */}
              <div className='flex items-center bg-muted/60 p-0.5 rounded border border-border/60 text-[10px] font-mono'>
                <button
                  onClick={() => setRightViewMode('visual')}
                  className={cn(
                    'px-2 py-0.5 rounded font-medium transition-all',
                    rightViewMode === 'visual' ? 'bg-cyan-500 text-black font-bold' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Visual
                </button>
                <button
                  onClick={() => setRightViewMode('json')}
                  className={cn(
                    'px-2 py-0.5 rounded font-medium transition-all',
                    rightViewMode === 'json' ? 'bg-cyan-500 text-black font-bold' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  JSON
                </button>
              </div>

              <Button
                size='sm'
                variant='outline'
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(unifiedRecord, null, 2),
                    setCopiedUnified,
                    'Unified Record'
                  )
                }
                className='h-7 text-[11px] font-mono px-2 flex items-center gap-1'
                title='Copy Unified JSON'
              >
                {copiedUnified ? <IconCheck className='size-3.5 text-emerald-500' /> : <IconCopy className='size-3.5' />}
                <span>{copiedUnified ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          {/* Unified Normalized Metrics Grid */}
          {unifiedRecord ? (
            <div className='p-4 flex flex-col gap-4 flex-1'>
              
              {/* Product Identity Banner */}
              <div className='p-3.5 rounded-lg bg-muted/40 dark:bg-zinc-900 border border-border flex flex-col gap-2 font-mono text-xs'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Canonical Master SKU:</span>
                  <span className='font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30'>
                    {unifiedRecord.sku_id}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Matched Footwear:</span>
                  <span className='font-bold text-foreground'>{unifiedRecord.sku_name}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Cross-Channel ID Match:</span>
                  <span className='text-muted-foreground text-[11px]'>
                    ASIN: {unifiedRecord.asin || 'N/A'} • Shopify: {unifiedRecord.variant_id ? unifiedRecord.variant_id.slice(-8) : 'N/A'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Standard UTC Timestamp:</span>
                  <span className='text-muted-foreground text-[11px]'>{unifiedRecord.timestamp}</span>
                </div>
              </div>

              {rightViewMode === 'visual' ? (
                <>
                  {/* Key Financial KPIs */}
                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono'>
                    <div className='p-2.5 rounded bg-card border border-border/70 flex flex-col'>
                      <span className='text-[10px] text-muted-foreground uppercase'>Clean Spend</span>
                      <span className='text-base font-bold text-foreground mt-0.5'>
                        ${unifiedRecord.spend.toFixed(2)}
                      </span>
                      <span className='text-[9px] text-muted-foreground'>Normalized currency</span>
                    </div>

                    <div className='p-2.5 rounded bg-card border border-border/70 flex flex-col'>
                      <span className='text-[10px] text-muted-foreground uppercase'>Attributed Rev</span>
                      <span className='text-base font-bold text-emerald-500 mt-0.5'>
                        ${unifiedRecord.attributed_revenue.toFixed(2)}
                      </span>
                      <span className='text-[9px] text-emerald-600'>Verified purchases</span>
                    </div>

                    <div className='p-2.5 rounded bg-card border border-border/70 flex flex-col'>
                      <span className='text-[10px] text-muted-foreground uppercase'>Gross Margin</span>
                      <span className='text-base font-bold text-cyan-400 mt-0.5'>
                        ${unifiedRecord.gross_margin.toFixed(2)}
                      </span>
                      <span className='text-[9px] text-cyan-500'>{unifiedRecord.gross_margin_pct}% COGS margin</span>
                    </div>

                    <div className='p-2.5 rounded bg-card border border-border/70 flex flex-col'>
                      <span className='text-[10px] text-muted-foreground uppercase'>Attributed ROAS</span>
                      <span className='text-base font-bold text-indigo-400 mt-0.5'>
                        {unifiedRecord.roas.toFixed(2)}x
                      </span>
                      <span className='text-[9px] text-indigo-500'>True return</span>
                    </div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className='grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono text-[11px]'>
                    <div className='p-2 rounded bg-muted/30 border border-border/50'>
                      <div className='text-muted-foreground text-[9px]'>IMPR</div>
                      <div className='font-bold mt-0.5'>{unifiedRecord.impressions.toLocaleString()}</div>
                    </div>
                    <div className='p-2 rounded bg-muted/30 border border-border/50'>
                      <div className='text-muted-foreground text-[9px]'>CLICKS</div>
                      <div className='font-bold mt-0.5'>{unifiedRecord.clicks.toLocaleString()}</div>
                    </div>
                    <div className='p-2 rounded bg-muted/30 border border-border/50'>
                      <div className='text-muted-foreground text-[9px]'>CTR</div>
                      <div className='font-bold mt-0.5'>{unifiedRecord.ctr}%</div>
                    </div>
                    <div className='p-2 rounded bg-muted/30 border border-border/50'>
                      <div className='text-muted-foreground text-[9px]'>CPC</div>
                      <div className='font-bold mt-0.5'>${unifiedRecord.cpc}</div>
                    </div>
                    <div className='p-2 rounded bg-muted/30 border border-border/50'>
                      <div className='text-muted-foreground text-[9px]'>CPM</div>
                      <div className='font-bold mt-0.5'>${unifiedRecord.cpm}</div>
                    </div>
                    <div className='p-2 rounded bg-muted/30 border border-border/50'>
                      <div className='text-muted-foreground text-[9px]'>STOCK UNITS</div>
                      <div className={cn('font-bold mt-0.5', unifiedRecord.inventory_on_hand === 0 ? 'text-red-500' : 'text-emerald-500')}>
                        {unifiedRecord.inventory_on_hand === 0 ? '0 (STOCKOUT)' : unifiedRecord.inventory_on_hand}
                      </div>
                    </div>
                  </div>

                  {/* Channel-Specific Features */}
                  <div className='p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 flex flex-col gap-2 font-mono text-[11px]'>
                    <div className='flex items-center justify-between text-cyan-400 font-bold uppercase text-[10px]'>
                      <span className='flex items-center gap-1.5'>
                        <IconSparkles className='size-3.5 text-cyan-400' />
                        {activeSpec.name} Telemetry Attributes
                      </span>
                      <Badge variant='outline' className='bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-[9px]'>
                        AI Ready
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
                            <span className='text-muted-foreground block text-[9px]'>LEARNING STATUS</span>
                            <span className='font-bold text-emerald-400'>{unifiedRecord.learning_phase_status ?? 'SUCCESS'}</span>
                          </div>
                        </>
                      )}

                      {unifiedRecord.channel === 'google' && (
                        <>
                          <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                            <span className='text-muted-foreground block text-[9px]'>LOST IS (BUDGET)</span>
                            <span className='font-bold text-amber-400'>{unifiedRecord.search_budget_lost_is_pct}%</span>
                          </div>
                          <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                            <span className='text-muted-foreground block text-[9px]'>LOST IS (RANK)</span>
                            <span className='font-bold text-rose-400'>{unifiedRecord.search_rank_lost_is_pct}%</span>
                          </div>
                          <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                            <span className='text-muted-foreground block text-[9px]'>QUALITY SCORE</span>
                            <span className='font-bold text-emerald-400'>{unifiedRecord.quality_score ?? 9} / 10</span>
                          </div>
                        </>
                      )}

                      {unifiedRecord.channel === 'amazon' && (
                        <>
                          <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                            <span className='text-muted-foreground block text-[9px]'>BUY BOX WIN %</span>
                            <span className={cn('font-bold', (unifiedRecord.buy_box_win_pct ?? 100) < 80 ? 'text-rose-400' : 'text-emerald-400')}>
                              {unifiedRecord.buy_box_win_pct}%
                            </span>
                          </div>
                          <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                            <span className='text-muted-foreground block text-[9px]'>CATALOG HALO REV</span>
                            <span className='font-bold text-cyan-400'>${unifiedRecord.halo_attributed_revenue?.toFixed(2) ?? '0.00'}</span>
                          </div>
                          <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                            <span className='text-muted-foreground block text-[9px]'>FBA DEDUCTIONS</span>
                            <span className='font-bold text-amber-400'>${unifiedRecord.fba_fees?.toFixed(2) ?? '0.00'}</span>
                          </div>
                        </>
                      )}

                      {unifiedRecord.channel === 'shopify' && (
                        <>
                          <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                            <span className='text-muted-foreground block text-[9px]'>ACQUISITION TYPE</span>
                            <span className='font-bold text-purple-400'>{unifiedRecord.customer_acquisition_type}</span>
                          </div>
                          <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                            <span className='text-muted-foreground block text-[9px]'>GATEWAY FEE</span>
                            <span className='font-bold text-amber-400'>${unifiedRecord.payment_gateway_fee?.toFixed(2)}</span>
                          </div>
                          <div className='p-1.5 rounded bg-background/50 border border-border/40'>
                            <span className='text-muted-foreground block text-[9px]'>TRUE CM3 MARGIN</span>
                            <span className='font-bold text-emerald-400'>${unifiedRecord.net_contribution_margin?.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* JSON Tensor View */
                <div className='rounded bg-slate-950 p-3 font-mono text-xs text-cyan-300 overflow-auto max-h-[300px] border border-cyan-500/20'>
                  <pre className='whitespace-pre-wrap leading-tight'>
                    {JSON.stringify(unifiedRecord, null, 2)}
                  </pre>
                </div>
              )}

              {/* Action: Send to Decision Engine */}
              <div className='pt-2 border-t border-border/60 flex items-center justify-between'>
                <span className='text-[10px] text-muted-foreground font-mono'>
                  Ready for real-time budget optimization
                </span>
                <Button
                  size='sm'
                  onClick={handleSendToDecisionEngine}
                  className='bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer'
                >
                  <IconRocket className='size-3.5' />
                  <span>Send to RL Decision Engine</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className='p-8 text-center text-muted-foreground font-mono text-xs'>
              Invalid payload or unable to normalize.
            </div>
          )}
        </div>
      </div>

      {/* 6. Section Feature Guide: What Each Normalization Component Provides */}
      <div className='rounded-xl border border-border/80 bg-card p-5 space-y-4'>
        <div>
          <h3 className='text-sm font-mono font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
            <IconShieldCheck className='size-4 text-emerald-500' />
            What Each Section &amp; Normalization Feature Provides
          </h3>
          <p className='text-xs font-mono text-muted-foreground mt-0.5'>
            Understanding the real-world value of cross-channel schema harmonization in NEXUS-DQPS:
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs'>
          <div className='p-3.5 rounded-lg bg-muted/40 border border-border flex flex-col justify-between'>
            <div>
              <div className='flex items-center gap-1.5 font-bold text-cyan-500 mb-1.5'>
                <IconCurrencyDollar className='size-4' />
                <span>1. Micro-Currency Engine</span>
              </div>
              <p className='text-muted-foreground text-[11px] leading-relaxed'>
                Google Ads outputs spend in micros ($1 = 1,000,000). NEXUS translates this into standard floats and handles daily FX rates so financial totals never glitch.
              </p>
            </div>
            <div className='mt-2 pt-2 border-t border-border/50 text-[10px] text-cyan-500 font-semibold'>
              Prevents $1M budget accounting errors
            </div>
          </div>

          <div className='p-3.5 rounded-lg bg-muted/40 border border-border flex flex-col justify-between'>
            <div>
              <div className='flex items-center gap-1.5 font-bold text-emerald-500 mb-1.5'>
                <IconArrowsSplit2 className='size-4' />
                <span>2. Action Array Unrolling</span>
              </div>
              <p className='text-muted-foreground text-[11px] leading-relaxed'>
                Meta buries revenue inside nested arrays. NEXUS extracts verified purchases, video 3-second hook rates, and creative fatigue curves automatically.
              </p>
            </div>
            <div className='mt-2 pt-2 border-t border-border/50 text-[10px] text-emerald-500 font-semibold'>
              Detects ad fatigue before ROAS drops
            </div>
          </div>

          <div className='p-3.5 rounded-lg bg-muted/40 border border-border flex flex-col justify-between'>
            <div>
              <div className='flex items-center gap-1.5 font-bold text-amber-500 mb-1.5'>
                <IconPackage className='size-4' />
                <span>3. Omnichannel SKU Stitching</span>
              </div>
              <p className='text-muted-foreground text-[11px] leading-relaxed'>
                Connects Amazon ASINs (B07Q8Z9101), Shopify barcodes, and Meta ad tags to the central Nike catalog SKU (e.g. CD4371-001) for unified analysis.
              </p>
            </div>
            <div className='mt-2 pt-2 border-t border-border/50 text-[10px] text-amber-500 font-semibold'>
              Single source of truth across all stores
            </div>
          </div>

          <div className='p-3.5 rounded-lg bg-muted/40 border border-border flex flex-col justify-between'>
            <div>
              <div className='flex items-center gap-1.5 font-bold text-purple-400 mb-1.5'>
                <IconShieldCheck className='size-4' />
                <span>4. Stockout Circuit Breaker</span>
              </div>
              <p className='text-muted-foreground text-[11px] leading-relaxed'>
                Integrates real-time ERP inventory with live ad campaigns. If a shoe size sells out in the warehouse, ad spend is instantly throttled to prevent waste.
              </p>
            </div>
            <div className='mt-2 pt-2 border-t border-border/50 text-[10px] text-purple-400 font-semibold'>
              Zero ad dollars wasted on out-of-stock SKUs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
