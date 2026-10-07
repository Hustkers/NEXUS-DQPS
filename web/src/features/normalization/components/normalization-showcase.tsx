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
  IconDatabase,
  IconCpu,
  IconFileCode,
  IconSparkles,
  IconInfoCircle,
  IconRocket,
  IconCurrencyDollar,
  IconPackage,
  IconShieldCheck,
  IconChartBar,
  IconEye
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
  getCrossChannelOverview,
  UnifiedCommerceRecord
} from '../normalization-engine';

import { NormalizationKpiRibbon } from './normalization-kpi-ribbon';
import { NormalizationGraphs } from './normalization-graphs';
import { NormalizationPipelineTracker } from './normalization-pipeline-tracker';
import { NormalizationFieldMapper } from './normalization-field-mapper';
import { OmnichannelMatrixView } from './omnichannel-matrix-view';

type PlatformKey = 'meta' | 'google' | 'amazon' | 'shopify';
type MainViewMode = 'analytics' | 'split-inspector' | 'omnichannel' | 'mapper';

interface PlatformSpec {
  id: PlatformKey;
  name: string;
  sourceApi: string;
  endpoint: string;
  color: string;
  accentBg: string;
  icon: React.ComponentType<{ className?: string }>;
  rawSample: Record<string, unknown>[];
  problemDescription: string;
  solutionDescription: string;
  keyFeatureBadge: string;
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
    keyFeatureBadge: 'Video Hook & Wearout Telemetry'
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
    keyFeatureBadge: 'Auction Lost IS (Budget Headroom)'
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
    keyFeatureBadge: 'Buy Box Circuit & Halo Sales'
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
    keyFeatureBadge: 'True CM3 & Gateway Deductions'
  }
];

const PLATFORMS_SPECS_MAP: Record<PlatformKey, PlatformSpec> = PLATFORM_SPECS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<PlatformKey, PlatformSpec>
);

function copyToClipboard(text: string, setCopied: (v: boolean) => void, label: string) {
  navigator.clipboard.writeText(text);
  setCopied(true);
  toast.success(`${label} Copied to Clipboard`);
  setTimeout(() => setCopied(false), 2000);
}

export function NormalizationShowcase() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>('meta');
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [customJsonInput, setCustomJsonInput] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);
  const [copiedUnified, setCopiedUnified] = useState<boolean>(false);
  const [rightViewMode, setRightViewMode] = useState<'visual' | 'json'>('visual');
  const [mainViewMode, setMainViewMode] = useState<MainViewMode>('analytics');
  const [showGuide, setShowGuide] = useState<boolean>(false);

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

  // Omnichannel comparison data
  const omnichannelData = useMemo(() => {
    return getCrossChannelOverview(inventoryMap);
  }, [inventoryMap]);

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
    <div className='flex flex-1 flex-col gap-5 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen min-w-0 max-w-full font-sans'>
      
      {/* 1. Top Header Banner with Live Integrity Status */}
      <div className='flex flex-col gap-3 border-b border-border/80 pb-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-2 flex-wrap'>
            <Badge variant='outline' className='bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-mono text-[11px]'>
              Ingestion Layer
            </Badge>
            <Badge variant='outline' className='bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-[11px]'>
              Real-Time Transformation
            </Badge>
            <Badge variant='outline' className='bg-indigo-500/10 text-indigo-400 border-indigo-500/30 font-mono text-[11px]'>
              Multi-Channel SKU Harmonization
            </Badge>
            <Badge variant='outline' className='bg-purple-500/10 text-purple-400 border-purple-500/30 font-mono text-[11px]'>
              Zero Data Drift
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
              <span>{showGuide ? 'Hide Feature Guide' : 'How This Works'}</span>
            </Button>
          </div>
        </div>

        <div>
          <h1 className='text-xl sm:text-2xl font-mono font-bold text-foreground uppercase tracking-tight flex items-center gap-2.5 mt-0.5'>
            <IconArrowsSplit2 className='size-6 text-cyan-400 shrink-0' />
            Live Ad API Normalizer &amp; Schema Harmonizer
          </h1>
          <p className='text-xs sm:text-sm text-muted-foreground mt-1 max-w-4xl leading-relaxed font-sans'>
            Every ad network reports metrics differently (Google in micro-cents, Meta in nested arrays, Amazon in 14-day halo windows, Shopify in raw webhooks).
            NEXUS automatically harmonizes these heterogeneous payloads into clean, canonical unit economics so autonomous decision engines can optimize spend across all channels without calculation errors.
          </p>
        </div>

        {/* Dismissable Interactive Guide */}
        {showGuide && (
          <div className='rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3 font-mono text-xs animate-in fade-in duration-200'>
            <div className='flex items-center justify-between'>
              <span className='font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]'>
                <IconSparkles className='size-3.5 text-cyan-400' />
                Interactive Normalization Architecture
              </span>
              <button
                onClick={() => setShowGuide(false)}
                className='text-[10px] text-muted-foreground hover:text-foreground cursor-pointer'
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
                  Choose Network &amp; Payload
                </div>
                <p className='text-muted-foreground text-[11px] leading-relaxed'>
                  Select Meta, Google, Amazon, or Shopify. Toggle preset payloads or edit custom JSON live.
                </p>
              </div>

              <div className='p-3 rounded-lg bg-card/60 border border-border/70 space-y-1'>
                <div className='flex items-center gap-2 text-foreground font-semibold text-xs'>
                  <span className='size-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px] font-bold'>
                    2
                  </span>
                  Interactive Graphs &amp; Telemetry
                </div>
                <p className='text-muted-foreground text-[11px] leading-relaxed'>
                  Explore the Unit Economics Waterfall, Creative Video Funnels, Auction Lost Impression Share, and Buy Box win dials.
                </p>
              </div>

              <div className='p-3 rounded-lg bg-card/60 border border-border/70 space-y-1'>
                <div className='flex items-center gap-2 text-foreground font-semibold text-xs'>
                  <span className='size-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px] font-bold'>
                    3
                  </span>
                  RL Decision Dispatch
                </div>
                <p className='text-muted-foreground text-[11px] leading-relaxed'>
                  Deploy clean, validated state tensors directly into the reinforcement learning optimizer cache with 1 click.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Step 1: Network Selection Bar */}
      <div>
        <div className='text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between'>
          <span>Step 1: Select Ad Network API to Normalize</span>
          <span className='text-[10px] text-cyan-400'>Harmonizing 4 Channels</span>
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
                  'flex flex-col text-left p-3.5 rounded-xl border transition-all relative overflow-hidden cursor-pointer font-mono',
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
                      <div className='text-xs font-bold text-foreground'>{spec.name}</div>
                      <div className='text-[10px] text-muted-foreground'>{spec.sourceApi}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <Badge className='bg-cyan-500 text-black text-[9px] font-bold px-1.5 py-0.5 shrink-0'>
                      ACTIVE
                    </Badge>
                  )}
                </div>
                <div className='mt-2.5 pt-2 border-t border-border/50 text-[10px] text-cyan-400/90 truncate flex items-center justify-between'>
                  <span className='truncate'>{spec.keyFeatureBadge}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Step 2: Payload Presets & Mode Switcher Bar */}
      <div className='flex flex-wrap items-center justify-between gap-3 bg-card/60 p-3 rounded-xl border border-border/70 text-xs font-mono shadow-xs'>
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
              setMainViewMode('split-inspector');
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

      {/* 4. Main Navigation View Mode Switcher */}
      <div className='flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-1.5 rounded-xl border border-border/70 font-mono text-xs'>
        <div className='flex items-center gap-1 flex-wrap'>
          <button
            onClick={() => setMainViewMode('analytics')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold cursor-pointer',
              mainViewMode === 'analytics'
                ? 'bg-cyan-500 text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            )}
          >
            <IconChartBar className='size-4' />
            <span>Visual Analytics &amp; Graphs</span>
          </button>

          <button
            onClick={() => setMainViewMode('split-inspector')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold cursor-pointer',
              mainViewMode === 'split-inspector'
                ? 'bg-cyan-500 text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            )}
          >
            <IconEye className='size-4' />
            <span>Side-by-Side Payload Inspector</span>
          </button>

          <button
            onClick={() => setMainViewMode('omnichannel')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold cursor-pointer',
              mainViewMode === 'omnichannel'
                ? 'bg-cyan-500 text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            )}
          >
            <IconArrowsSplit2 className='size-4' />
            <span>Cross-Platform Matrix</span>
          </button>

          <button
            onClick={() => setMainViewMode('mapper')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold cursor-pointer',
              mainViewMode === 'mapper'
                ? 'bg-cyan-500 text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            )}
          >
            <IconCpu className='size-4' />
            <span>Transformation Rules</span>
          </button>
        </div>

        <div className='flex items-center gap-2 pr-1'>
          <Button
            size='sm'
            onClick={handleSendToDecisionEngine}
            className='bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs h-7 px-3 flex items-center gap-1.5 cursor-pointer font-mono'
          >
            <IconRocket className='size-3.5' />
            <span>Dispatch to RL Engine</span>
          </Button>
        </div>
      </div>

      {/* 5. Pipeline Stage Tracker */}
      <NormalizationPipelineTracker record={unifiedRecord} platformName={activeSpec.name} />

      {/* 6. Executive KPI Ribbon */}
      <NormalizationKpiRibbon record={unifiedRecord} platformColor={activeSpec.color} />

      {/* 7. VIEW MODE 1: VISUAL ANALYTICS & GRAPHS (PRIMARY UPGRADE) */}
      {mainViewMode === 'analytics' && (
        <div className='flex flex-col gap-5'>
          {/* Main Graph Suite */}
          <NormalizationGraphs
            record={unifiedRecord}
            omnichannelData={omnichannelData}
            selectedPlatform={selectedPlatform}
          />

          {/* Compact Quick-Look Ingestion Inspector */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {/* Left: Raw Payload Snippet */}
            <div className='rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs flex flex-col font-mono text-xs'>
              <div className='flex items-center justify-between p-3 bg-muted/60 border-b border-border'>
                <span className='font-bold text-foreground text-xs flex items-center gap-1.5 uppercase'>
                  <activeSpec.icon className='size-4 text-cyan-400' />
                  Raw {activeSpec.name} Payload
                </span>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(currentRawItem, null, 2),
                      setCopiedRaw,
                      'Raw JSON'
                    )
                  }
                  className='h-6 text-[10px] px-2 flex items-center gap-1'
                >
                  {copiedRaw ? <IconCheck className='size-3 text-emerald-400' /> : <IconCopy className='size-3' />}
                  <span>Copy</span>
                </Button>
              </div>
              <div className='p-3 bg-slate-950 text-slate-200 overflow-auto max-h-[220px] text-[11px]'>
                <pre className='whitespace-pre-wrap leading-relaxed'>
                  {currentRawItem ? JSON.stringify(currentRawItem, null, 2) : '// No data'}
                </pre>
              </div>
              <div className='p-2 bg-muted/30 border-t border-border/60 text-[10px] text-muted-foreground flex items-center justify-between'>
                <span>API Endpoint: {activeSpec.endpoint}</span>
                <button
                  onClick={() => setMainViewMode('split-inspector')}
                  className='text-cyan-400 hover:underline font-semibold cursor-pointer'
                >
                  Full Editor &rarr;
                </button>
              </div>
            </div>

            {/* Right: Canonical Record Preview */}
            <div className='rounded-xl border border-cyan-500/40 bg-card overflow-hidden shadow-xs flex flex-col font-mono text-xs'>
              <div className='flex items-center justify-between p-3 bg-cyan-950/20 border-b border-cyan-500/30'>
                <span className='font-bold text-cyan-400 text-xs flex items-center gap-1.5 uppercase'>
                  <IconDatabase className='size-4' />
                  Canonical Unified Commerce Record
                </span>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(unifiedRecord, null, 2),
                      setCopiedUnified,
                      'Unified Tensor'
                    )
                  }
                  className='h-6 text-[10px] px-2 flex items-center gap-1 border-cyan-500/40 text-cyan-300'
                >
                  {copiedUnified ? <IconCheck className='size-3 text-emerald-400' /> : <IconCopy className='size-3' />}
                  <span>Copy</span>
                </Button>
              </div>

              <div className='p-3 bg-slate-950 text-cyan-300 overflow-auto max-h-[220px] text-[11px] border-b border-cyan-500/20'>
                <pre className='whitespace-pre-wrap leading-relaxed'>
                  {unifiedRecord ? JSON.stringify(unifiedRecord, null, 2) : '// No record'}
                </pre>
              </div>

              <div className='p-2 bg-cyan-950/30 text-[10px] text-cyan-400 flex items-center justify-between'>
                <span>Status: Ingestion Tensor Ready</span>
                <button
                  onClick={handleSendToDecisionEngine}
                  className='text-cyan-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer'
                >
                  <IconRocket className='size-3' />
                  <span>Send to RL Engine</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. VIEW MODE 2: SPLIT-SCREEN INGESTION INSPECTOR */}
      {mainViewMode === 'split-inspector' && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
          {/* LEFT: Raw Platform Partial */}
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
            <div className='p-4 bg-slate-950 font-mono text-xs flex-1 min-h-[400px] max-h-[500px] overflow-auto text-slate-200'>
              {isCustomMode ? (
                <div className='flex flex-col h-full space-y-2'>
                  <div className='flex items-center justify-between text-[11px] text-purple-400 border-b border-purple-500/30 pb-1'>
                    <span>✏️ Live JSON Editor (Edits normalize in real-time)</span>
                    <button
                      onClick={() => {
                        setIsCustomMode(false);
                        setCustomJsonInput('');
                      }}
                      className='text-[10px] text-muted-foreground hover:text-white cursor-pointer'
                    >
                      Cancel / Reset
                    </button>
                  </div>
                  <textarea
                    value={customJsonInput}
                    onChange={(e) => setCustomJsonInput(e.target.value)}
                    className='w-full h-full min-h-[360px] bg-transparent text-emerald-400 font-mono text-xs resize-none outline-hidden border-none'
                    placeholder='Paste or edit raw JSON here...'
                  />
                </div>
              ) : (
                <pre className='whitespace-pre-wrap leading-relaxed'>
                  {currentRawItem ? JSON.stringify(currentRawItem, null, 2) : '// No valid JSON payload'}
                </pre>
              )}
            </div>

            <div className='p-3 bg-muted/30 border-t border-border/70 text-[11px] font-mono text-muted-foreground flex items-center justify-between'>
              <span>Endpoint: {activeSpec.endpoint}</span>
              <span className='text-cyan-400 font-semibold'>Source: {activeSpec.sourceApi}</span>
            </div>
          </div>

          {/* RIGHT: Canonical Unified Commerce Record */}
          <div className='flex flex-col rounded-xl border border-cyan-500/40 bg-card overflow-hidden shadow-xs'>
            <div className='flex items-center justify-between p-3.5 bg-cyan-950/30 border-b border-cyan-500/30'>
              <div className='flex items-center gap-2'>
                <div className='size-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0'>
                  <IconDatabase className='size-4' />
                </div>
                <div>
                  <span className='text-xs font-mono font-bold text-cyan-400 uppercase'>
                    2. Canonical Unified Record
                  </span>
                  <span className='text-[10px] font-mono text-muted-foreground ml-2 hidden sm:inline'>
                    (Clean Optimizer Output)
                  </span>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <div className='flex items-center bg-muted/60 p-0.5 rounded border border-border/60 text-[10px] font-mono'>
                  <button
                    onClick={() => setRightViewMode('visual')}
                    className={cn(
                      'px-2 py-0.5 rounded font-medium transition-all cursor-pointer',
                      rightViewMode === 'visual' ? 'bg-cyan-500 text-black font-bold' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Visual
                  </button>
                  <button
                    onClick={() => setRightViewMode('json')}
                    className={cn(
                      'px-2 py-0.5 rounded font-medium transition-all cursor-pointer',
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

            {unifiedRecord ? (
              <div className='p-4 flex flex-col gap-4 flex-1'>
                {/* Product Identity Banner */}
                <div className='p-3 rounded-lg bg-muted/40 border border-border flex flex-col gap-2 font-mono text-xs'>
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
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono'>
                      <div className='p-2 rounded bg-card border border-border/70 flex flex-col'>
                        <span className='text-[10px] text-muted-foreground uppercase'>Clean Spend</span>
                        <span className='text-base font-bold text-foreground mt-0.5'>${unifiedRecord.spend.toFixed(2)}</span>
                        <span className='text-[9px] text-muted-foreground'>Normalized float</span>
                      </div>
                      <div className='p-2 rounded bg-card border border-border/70 flex flex-col'>
                        <span className='text-[10px] text-muted-foreground uppercase'>Attributed Rev</span>
                        <span className='text-base font-bold text-emerald-400 mt-0.5'>${unifiedRecord.attributed_revenue.toFixed(2)}</span>
                        <span className='text-[9px] text-emerald-500'>{unifiedRecord.conversions} orders</span>
                      </div>
                      <div className='p-2 rounded bg-card border border-border/70 flex flex-col'>
                        <span className='text-[10px] text-muted-foreground uppercase'>Gross Margin</span>
                        <span className='text-base font-bold text-indigo-400 mt-0.5'>${unifiedRecord.gross_margin.toFixed(2)}</span>
                        <span className='text-[9px] text-indigo-500'>{unifiedRecord.gross_margin_pct}% COGS</span>
                      </div>
                      <div className='p-2 rounded bg-card border border-border/70 flex flex-col'>
                        <span className='text-[10px] text-muted-foreground uppercase'>Attributed ROAS</span>
                        <span className='text-base font-bold text-purple-400 mt-0.5'>{unifiedRecord.roas.toFixed(2)}x</span>
                        <span className='text-[9px] text-purple-500'>True return</span>
                      </div>
                    </div>

                    <div className='grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono text-[11px]'>
                      <div className='p-1.5 rounded bg-muted/30 border border-border/50'>
                        <div className='text-muted-foreground text-[9px]'>IMPR</div>
                        <div className='font-bold mt-0.5'>{unifiedRecord.impressions.toLocaleString()}</div>
                      </div>
                      <div className='p-1.5 rounded bg-muted/30 border border-border/50'>
                        <div className='text-muted-foreground text-[9px]'>CLICKS</div>
                        <div className='font-bold mt-0.5'>{unifiedRecord.clicks.toLocaleString()}</div>
                      </div>
                      <div className='p-1.5 rounded bg-muted/30 border border-border/50'>
                        <div className='text-muted-foreground text-[9px]'>CTR</div>
                        <div className='font-bold mt-0.5'>{unifiedRecord.ctr}%</div>
                      </div>
                      <div className='p-1.5 rounded bg-muted/30 border border-border/50'>
                        <div className='text-muted-foreground text-[9px]'>CPC</div>
                        <div className='font-bold mt-0.5'>${unifiedRecord.cpc}</div>
                      </div>
                      <div className='p-1.5 rounded bg-muted/30 border border-border/50'>
                        <div className='text-muted-foreground text-[9px]'>CPM</div>
                        <div className='font-bold mt-0.5'>${unifiedRecord.cpm}</div>
                      </div>
                      <div className='p-1.5 rounded bg-muted/30 border border-border/50'>
                        <div className='text-muted-foreground text-[9px]'>STOCK UNITS</div>
                        <div className={cn('font-bold mt-0.5', unifiedRecord.inventory_on_hand === 0 ? 'text-red-500' : 'text-emerald-500')}>
                          {unifiedRecord.inventory_on_hand === 0 ? '0 (STOCKOUT)' : unifiedRecord.inventory_on_hand}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className='rounded bg-slate-950 p-3 font-mono text-xs text-cyan-300 overflow-auto max-h-[300px] border border-cyan-500/20'>
                    <pre className='whitespace-pre-wrap leading-tight'>
                      {JSON.stringify(unifiedRecord, null, 2)}
                    </pre>
                  </div>
                )}

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
      )}

      {/* 9. VIEW MODE 3: OMNICHANNEL MATRIX */}
      {mainViewMode === 'omnichannel' && (
        <OmnichannelMatrixView
          items={omnichannelData}
          onSelectPlatform={(p) => {
            setSelectedPlatform(p);
            setSelectedSampleIndex(0);
            setIsCustomMode(false);
          }}
          selectedPlatform={selectedPlatform}
        />
      )}

      {/* 10. VIEW MODE 4: TRANSFORMATION RULES */}
      {mainViewMode === 'mapper' && (
        <NormalizationFieldMapper platform={selectedPlatform} record={unifiedRecord} />
      )}

      {/* 11. Core Normalization Features & Business Guarantees */}
      <div className='rounded-xl border border-border/80 bg-card p-5 space-y-4'>
        <div>
          <h3 className='text-sm font-mono font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
            <IconShieldCheck className='size-4 text-emerald-500' />
            Enterprise Normalization Guarantees &amp; Autonomous Safety
          </h3>
          <p className='text-xs font-mono text-muted-foreground mt-0.5'>
            How NEXUS-DQPS protects marketing capital across heterogeneous ad networks:
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs'>
          <div className='p-3.5 rounded-lg bg-muted/40 border border-border flex flex-col justify-between'>
            <div>
              <div className='flex items-center gap-1.5 font-bold text-cyan-400 mb-1.5'>
                <IconCurrencyDollar className='size-4' />
                <span>1. Micro-Currency Engine</span>
              </div>
              <p className='text-muted-foreground text-[11px] leading-relaxed'>
                Google Ads outputs spend in micros ($1 = 1,000,000). NEXUS translates this into standard floats and handles daily FX rates so financial totals never glitch.
              </p>
            </div>
            <div className='mt-2 pt-2 border-t border-border/50 text-[10px] text-cyan-400 font-semibold'>
              Prevents $1M budget accounting errors
            </div>
          </div>

          <div className='p-3.5 rounded-lg bg-muted/40 border border-border flex flex-col justify-between'>
            <div>
              <div className='flex items-center gap-1.5 font-bold text-emerald-400 mb-1.5'>
                <IconArrowsSplit2 className='size-4' />
                <span>2. Action Array Unrolling</span>
              </div>
              <p className='text-muted-foreground text-[11px] leading-relaxed'>
                Meta buries revenue inside nested arrays. NEXUS extracts verified purchases, video 3-second hook rates, and creative fatigue curves automatically.
              </p>
            </div>
            <div className='mt-2 pt-2 border-t border-border/50 text-[10px] text-emerald-400 font-semibold'>
              Detects ad fatigue before ROAS drops
            </div>
          </div>

          <div className='p-3.5 rounded-lg bg-muted/40 border border-border flex flex-col justify-between'>
            <div>
              <div className='flex items-center gap-1.5 font-bold text-amber-400 mb-1.5'>
                <IconPackage className='size-4' />
                <span>3. Omnichannel SKU Stitching</span>
              </div>
              <p className='text-muted-foreground text-[11px] leading-relaxed'>
                Connects Amazon ASINs (B07Q8Z9101), Shopify barcodes, and Meta ad tags to the central Nike catalog SKU (e.g. CD4371-001) for unified analysis.
              </p>
            </div>
            <div className='mt-2 pt-2 border-t border-border/50 text-[10px] text-amber-400 font-semibold'>
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
