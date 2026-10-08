'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { AnomalyCard } from './anomaly-card';
import { ReallocationFeed } from './reallocation-feed';
import { ScenarioController, ScenarioDefinition } from './scenario-controller';
import { RoasGauge } from './roas-gauge';
import { PlatformBreakdownChart } from './platform-breakdown-chart';
import { DecisionLedgerTable } from './decision-ledger-table';
import { CausalDagVisualizer } from './causal-dag-visualizer';
import { RcaWaterfallChart } from './rca-waterfall-chart';
import { ScenarioSandbox } from './scenario-sandbox';
import { ExecutiveGraphBanner } from './executive-graph-banner';
import { ProductAnalysisModal, type ProductAnalysisTarget } from './product-analysis-modal';
import { GithubGlobe } from './github-globe';
import { GlobePulse } from '@/components/ui/cobe-globe-pulse';
import { GLOBE_REGIONS, PulseMarker } from '@/data/globe-regions';
import { RegionDetailPanel } from '@/components/ui/region-detail-panel';
import initialEngineState from '@/data/nexus-engine-state.json';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useChannel, AdChannel } from '@/context/channel-context';
import { useDecisionEngine } from '@/context/decision-engine-store';
import { FixProtocolModal } from './fix-protocol-modal';
import { computeFixPlan, type DerivedProduct, type FixPlanSummary } from '@/lib/gauges-engine';

export function MissionControlConsole() {
  const [state, setState] = useState(initialEngineState);
  const { products, ledger, executeFix } = useDecisionEngine();
  const [analyzingProduct, setAnalyzingProduct] = useState<ProductAnalysisTarget | null>(null);
  const [fixingProduct, setFixingProduct] = useState<DerivedProduct | null>(null);
  const [fixingPlan, setFixingPlan] = useState<FixPlanSummary | null>(null);
  const [isFixModalOpen, setIsFixModalOpen] = useState(false);
  const [isSummaryOnly, setIsSummaryOnly] = useState(false);
  const [consoleGlobeMode, setConsoleGlobeMode] = useState<'arcs' | 'pulse'>('pulse');
  const [selectedGlobeMarker, setSelectedGlobeMarker] = useState<PulseMarker | null>(null);
  const { channel, setChannel } = useChannel();
  const activeTab = channel;
  const setActiveTab = (tab: string) => setChannel(tab as AdChannel);

  const hasCriticalAnomaly = state.anomalies.some(
    (a: any) => a.severity === 'CRITICAL' || a.factors?.some((f: any) => f.badge === 'Stockout')
  );

  const handleTriggerScenario = (scenario: ScenarioDefinition) => {
    if (scenario.id === 'scenario-stockout') {
      setState((prev) => {
        const updatedCampaigns = prev.campaigns.map((c: any) => {
          if (c.sku === '315122-001' || c.campaign.includes('315122-001') || c.campaign.includes('107')) {
            return {
              ...c,
              inventory: 0,
              roas: 0.15,
              roasStatus: 'CRITICAL_STOCKOUT',
              healthScore: 12
            };
          }
          return c;
        });
        const stockoutAnomaly = {
          id: `anom-shock-${Date.now()}`,
          campaign: 'meta-315122-001',
          platform: 'meta',
          sku: '315122-001',
          productName: "Nike Air Force 1 '07",
          photoUrl: 'https://c.static-nike.com/a/images/t_PDP_1728_v1/oplkqwyf7nwnj98f8agj/air-force-1-07-shoe-PATZxx4V.jpg',
          date: 'Live Now',
          severity: 'CRITICAL' as const,
          zScore: -4.8,
          roas: 0.15,
          spend: 4200,
          inventory: 0,
          explanation: 'Stock level reached zero on Nike ERP SKU 315122-001. ROAS collapsed from 3.8x to 0.15x (-96%).',
          factors: [
            {
              name: 'Inventory Stockout',
              deltaPct: -100,
              impactPts: -68.0,
              badge: 'Stockout',
              color: 'rose',
              detail: 'Available inventory: 0 units across US fulfillment'
            },
            {
              name: 'Conversion Collapse',
              deltaPct: -95,
              impactPts: -22.0,
              badge: 'CVR Loss',
              color: 'rose',
              detail: 'Checkout conversion dropped from 3.4% to 0.1%'
            }
          ]
        };
        return {
          ...prev,
          campaigns: updatedCampaigns,
          anomalies: [stockoutAnomaly, ...prev.anomalies],
          telemetry: {
            ...prev.telemetry,
            activeAnomaliesCount: prev.telemetry.activeAnomaliesCount + 1,
            blendedRoas30d: 3.42,
            roasDelta30d: '-37.0% (shocked)'
          }
        };
      });
      toast.error('Operational Shock Injected', {
        description: 'Hero SKU stockout triggered. ROAS collapsed across Meta channels.'
      });
    } else {
      setState((prev) => {
        const updatedCampaigns = prev.campaigns.map((c: any) => {
          if (c.platform === 'meta') {
            return { ...c, roas: +(c.roas * 0.75).toFixed(2), healthScore: Math.max(20, c.healthScore - 25) };
          }
          return c;
        });
        return { ...prev, campaigns: updatedCampaigns };
      });
      toast.warning('Ad Fatigue Shock Injected', {
        description: 'Meta creative fatigue simulated with 25% efficiency degradation.'
      });
    }
  };

  const handleResetBaseline = () => {
    setState(initialEngineState);
    toast.info('Telemetry Restored', {
      description: 'Reset to canonical baseline with optimal channel balance.'
    });
  };

  return (
    <div className='relative flex flex-1 min-w-0 max-w-full flex-col gap-6 md:gap-8 p-3.5 sm:p-5 md:p-8 bg-background text-foreground min-h-screen selection:bg-primary/20 selection:text-foreground'>

      {/* 1. Page Header */}
      <div className='flex flex-col gap-1 border-b border-border/50 pb-4'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-2.5'>
            <h1 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground font-sans'>
              Mission Control
            </h1>
            <span className='font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'>
              Autonomous Loop Live
            </span>
          </div>
        </div>
        <p className='text-xs sm:text-sm text-muted-foreground max-w-2xl leading-normal'>
          Real-time omnichannel telemetry, active anomaly detection, and autonomous capital allocation.
        </p>
      </div>

      {/* Flagship Product Feature Banner: Autonomous Learning & Live What-If Simulator */}
      <div className='rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-card to-card p-5 font-mono shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
        <div className='space-y-1 max-w-2xl'>
          <div className='flex items-center gap-2'>
            <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
            <span className='text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400'>
              Flagship Capability • Primary Autonomous Loop
            </span>
          </div>
          <h2 className='text-base sm:text-lg font-bold uppercase tracking-tight text-foreground'>
            WHERE SHOULD THE NEXT ₹ GO?
          </h2>
          <p className='text-xs text-muted-foreground leading-relaxed'>
            The engine analyzes historical campaign outcomes, models non-linear diminishing returns (Hill saturation curves), and continuously re-allocates multi-channel budgets to maximize incremental profit.
          </p>
        </div>

        <Link
          href='/dashboard/autonomous-engine'
          className='px-4 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:bg-foreground/90 transition-all shrink-0 flex items-center gap-2 shadow-sm'
        >
          <Icons.sliders className='size-3.5 text-emerald-400' />
          Launch Live What-If Simulator →
        </Link>
      </div>

      {/* 2. Executive Overview KPI Banner & Trajectory Graphs */}
      <ExecutiveGraphBanner
        state={state}
        hasCriticalAnomaly={hasCriticalAnomaly}
        channel={channel}
      />

      {/* 4. Scenario Controller (Operational Shock Simulator) */}
      <ScenarioController
        scenarios={state.scenarios}
        onTriggerScenario={handleTriggerScenario}
        onResetBaseline={handleResetBaseline}
      />

      {/* 3.5. Live 3D Global Telemetry & Heatmap Command Center */}
      <div className='rounded border border-[#1A1A1A] bg-[#1A1A1A] p-6 shadow-none text-white flex flex-col gap-5 relative min-h-[520px]'>
        {/* Header: Telemetry info, live status badge, mode switcher */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-[#000000] pb-3'>
          <div className='flex items-center gap-2.5'>
            <Icons.globe className='size-5 text-white' />
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='font-mono text-sm font-bold text-white uppercase tracking-tight'>
                Live 3D Global Ad &amp; Sales Telemetry
              </h3>
              <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-white border border-[#8A8A8A] bg-[#000000]'>
                <span className='size-1.5 rounded-full bg-white animate-pulse' />
                LIVE
              </span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {/* Globe Switcher */}
            <div className='flex items-center bg-[#000000] rounded border border-[#1A1A1A] p-0.5 text-xs font-mono'>
              <button
                type='button'
                onClick={() => setConsoleGlobeMode('pulse')}
                className={cn(
                  'px-3 py-1 rounded font-semibold transition-all',
                  consoleGlobeMode === 'pulse'
                    ? 'bg-white text-black font-bold'
                    : 'text-[#8A8A8A] hover:text-white'
                )}
              >
                Sales Pulse
              </button>
              <button
                type='button'
                onClick={() => setConsoleGlobeMode('arcs')}
                className={cn(
                  'px-3 py-1 rounded font-semibold transition-all',
                  consoleGlobeMode === 'arcs'
                    ? 'bg-white text-black font-bold'
                    : 'text-[#8A8A8A] hover:text-white'
                )}
              >
                Analysing Arcs
              </button>
            </div>

            <Link
              href='/dashboard/globe'
              className='px-3 py-1 rounded bg-[#000000] border border-[#1A1A1A] text-xs font-mono text-white hover:bg-white hover:text-black transition-colors flex items-center gap-1.5'
            >
              <span>Full Globe Hub</span>
              <Icons.arrowRight className='size-3' />
            </Link>
          </div>
        </div>

        {/* Command Grid: Regions on Left, Enlarged 3D Globe with Recent Purchases on Right */}
        <div className='flex flex-col 2xl:flex-row items-center 2xl:items-start justify-between gap-6 2xl:gap-8 w-full'>
          {/* Left Column: Regions on the Left side of the globe */}
          <div className='w-full 2xl:w-[360px] flex flex-col gap-3.5 shrink-0'>
            <p className='text-xs font-mono text-[#8A8A8A] leading-relaxed'>
              {consoleGlobeMode === 'pulse'
                ? 'Real-time regional telemetry matrix: Grounded in DATASET.md Nike catalog economics. Powered by amCharts 5 3D Orthographic Globe.'
                : 'WebGL ad delivery vectors across Meta, Google, Amazon & Shopify. Visualizing network latency and delivery hops via NEXUS 3D WebGL engine.'}
            </p>

            {/* Telemetry Density Legend Bar */}
            <div className='flex flex-wrap items-center justify-between gap-2 pt-1 pb-0.5 font-mono text-[11px] text-[#8A8A8A] border-t border-[#000000]'>
              <div className='flex items-center gap-1.5'>
                <Icons.globe className='size-3.5 text-white' />
                <span className='text-white font-semibold tracking-wider uppercase text-[10px]'>
                  Regional Telemetry Matrix
                </span>
                <span className='text-[10px] text-[#8A8A8A] hidden sm:inline'>• Click to inspect</span>
              </div>
              <div className='flex items-center gap-2 text-[10px]'>
                <span className='text-[#8A8A8A] font-mono'>16%</span>
                <div className='w-24 sm:w-28 h-1 rounded-full bg-[#000000] overflow-hidden flex border border-[#1A1A1A]'>
                  <div className='h-full bg-[#8A8A8A]/40 w-1/4' />
                  <div className='h-full bg-[#8A8A8A] w-1/4' />
                  <div className='h-full bg-white/70 w-1/4' />
                  <div className='h-full bg-white w-1/4' />
                </div>
                <span className='text-white font-bold font-mono'>88% Max</span>
              </div>
            </div>

            {/* Region Status Tiles (Stacked vertically on the left) */}
            <div className='grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-1 gap-2 font-mono text-xs max-h-[460px] overflow-y-auto pr-1 [scrollbar-width:thin]'>
              {GLOBE_REGIONS.map((reg) => {
                const isSelected = selectedGlobeMarker?.id === reg.id;
                const dotType = (reg.heatPct ?? 0) >= 75 ? 'solid' : (reg.heatPct ?? 0) >= 45 ? 'hollow' : 'dimmed';
                const meterBarClass =
                  (reg.heatPct ?? 0) >= 80
                    ? 'bg-white'
                    : (reg.heatPct ?? 0) >= 60
                    ? 'bg-white/80'
                    : (reg.heatPct ?? 0) >= 40
                    ? 'bg-[#8A8A8A]'
                    : 'bg-[#8A8A8A]/40';

                return (
                  <button
                    key={reg.id}
                    type='button'
                    onClick={() => {
                      setSelectedGlobeMarker((prev) => (prev?.id === reg.id ? null : reg));
                    }}
                    className={cn(
                      'group relative p-2.5 rounded bg-[#000000] border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between min-h-[82px]',
                      isSelected
                        ? 'border-white ring-1 ring-white bg-[#1A1A1A]'
                        : 'border-[#1A1A1A] hover:border-[#8A8A8A]'
                    )}
                  >
                    {/* Header row: Zone name + Status Dot + Level Tag */}
                    <div className='flex items-center justify-between gap-1 text-[10px]'>
                      <div className='flex items-center gap-1.5 truncate'>
                        {dotType === 'solid' ? (
                          <span className='size-2 rounded-full bg-white shrink-0' />
                        ) : dotType === 'hollow' ? (
                          <span className='size-2 rounded-full border border-white shrink-0' />
                        ) : (
                          <span className='size-2 rounded-full border border-[#8A8A8A] shrink-0' />
                        )}
                        <span className='font-mono font-semibold text-white truncate'>
                          {reg.shortName || reg.name}
                        </span>
                      </div>
                      <span className='text-[9px] px-1 py-0.5 rounded border border-[#1A1A1A] text-[#8A8A8A] font-mono font-medium shrink-0 bg-[#1A1A1A]'>
                        {reg.velocityLabel || reg.volume}
                      </span>
                    </div>

                    {/* Status label and key metrics */}
                    <div className='my-1'>
                      <div className='font-mono font-bold text-xs text-white tracking-tight'>
                        {reg.statusLabel || reg.name}
                      </div>
                      <div className='text-[10px] text-[#8A8A8A] flex items-center justify-between gap-1 mt-0.5 font-mono'>
                        <span className='truncate'>{reg.metricsSummary || reg.label}</span>
                        <span className='text-white font-bold text-[9px] shrink-0'>
                          {reg.roas ? `${reg.roas} ROAS` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Intensity Bar */}
                    <div className='w-full pt-0.5'>
                      <div className='h-1 w-full rounded-full bg-[#1A1A1A] overflow-hidden'>
                        <div
                          className={cn('h-full rounded-full transition-all duration-300', meterBarClass)}
                          style={{ width: `${reg.heatPct ?? 50}%` }}
                        />
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className='absolute bottom-1 right-2 text-[8px] font-mono font-bold uppercase text-black bg-white px-1 py-0.2 rounded'>
                        ACTIVE
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* SKU Quick Select Strip Grounded in DATASET.md */}
            <div className='pt-2 flex flex-wrap items-center gap-2 border-t border-[#000000]'>
              <span className='text-[10px] font-mono text-[#8A8A8A]'>Active SKU Telemetry:</span>
              {state.campaigns.slice(0, 3).map((c: any) => (
                <button
                  key={c.campaign}
                  type='button'
                  onClick={() => {
                    setAnalyzingProduct({
                      productName: c.productName || c.sku,
                      sku: c.sku,
                      photoUrl: c.photoUrl,
                      platform: c.platform,
                      campaign: c.campaign,
                      inventory: c.inventory,
                      roas: c.roas,
                      spend: c.currentDailySpend,
                      severity: c.inventory === 0 ? 'CRITICAL' : 'HEALTHY'
                    });
                  }}
                  className='px-2.5 py-1 rounded bg-[#000000] border border-[#1A1A1A] hover:border-white text-xs font-mono text-white transition-colors flex items-center gap-2'
                >
                  <PlatformLogo platform={c.platform} size={11} className='shrink-0' />
                  <span>{c.productName || c.sku}</span>
                  <span className='text-[10px] text-[#8A8A8A]'>${c.currentDailySpend?.toFixed(0)}/d</span>
                  <span className='text-[10px] font-mono text-white font-bold'>{c.roas}x</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Enlarged 3D Globe with Recent Purchases & Dynamic Connecting Lines */}
          <div className='flex-1 w-full flex flex-col items-center justify-center relative min-h-[580px]'>
            <div className='flex items-center justify-center relative transition-all duration-300 w-full'>
              {consoleGlobeMode === 'arcs' ? (
                <GithubGlobe
                  size={580}
                  activeSku='315122-001'
                  activePlatform='meta'
                  accentColor={[1, 1, 1]}
                />
              ) : (
                <GlobePulse
                  size={580}
                  selectedRegionId={selectedGlobeMarker?.id}
                  selectedMarkerId={selectedGlobeMarker?.id}
                  onSelectRegion={setSelectedGlobeMarker}
                  onSelectMarker={setSelectedGlobeMarker}
                  renderDetailPanel={false}
                  showRecentPurchases={true}
                  maxOrders={4}
                />
              )}
            </div>

            <div className='text-[10px] font-mono text-[#8A8A8A] tracking-wider text-center mt-3'>
              DRAG TO ROTATE 3D GLOBE • CLICK RECENT PURCHASES OR HEATMAP DOTS TO INSPECT TELEMETRY
            </div>

            {/* Regional Telemetry Detail Overlay Panel */}
            {selectedGlobeMarker && (
              <div className='absolute top-0 right-0 z-50 w-full max-w-[340px] sm:max-w-[380px] shadow-none transition-all duration-200 animate-in fade-in-0 slide-in-from-right-4'>
                <RegionDetailPanel
                  marker={selectedGlobeMarker}
                  isOpen={Boolean(selectedGlobeMarker)}
                  onClose={() => setSelectedGlobeMarker(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Causal DAG Visualizer & RCA Waterfall Decomposition */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 min-w-0 max-w-full'>
        <CausalDagVisualizer activeAnomaly={hasCriticalAnomaly} />
        <RcaWaterfallChart
          totalLoss={hasCriticalAnomaly ? 3008.25 : 0}
          items={hasCriticalAnomaly ? undefined : [
            { driver: 'Baseline Equilibrium', category: 'Nominal Operations', dollarImpact: 0, percentageShare: 100, color: 'bg-white' }
          ]}
        />
      </div>
      <div className='space-y-3.5'>
        <div className='flex items-center justify-between border-b border-border pb-2.5'>
          <div className='flex items-center gap-2'>
            <Icons.warning className='size-3.5 text-foreground' />
            <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
              Active Diagnostic Anomalies
            </h3>
            <span className='text-xs font-mono text-muted-foreground'>
              ({state.anomalies.length})
            </span>
          </div>
          <span className='text-xs font-mono text-muted-foreground'>
            14d Baseline • |Z| &gt; 2.2
          </span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {state.anomalies.slice(0, 3).map((anom: any) => (
            <AnomalyCard
              key={anom.id}
              anomaly={anom}
              onAnalyze={(a) => {
                setAnalyzingProduct({
                  id: a.id,
                  productName: a.productName || a.campaign,
                  sku: a.sku,
                  photoUrl: a.photoUrl,
                  platform: a.platform,
                  campaign: a.campaign,
                  inventory: a.inventory,
                  roas: a.roas,
                  spend: a.spend,
                  explanation: a.explanation,
                  severity: a.severity,
                  factors: a.factors
                });
              }}
              onMitigate={(a) => {
                toast.success(`Dispatched mitigation for ${a.campaign}`, {
                  description: 'Triggered optimizer to reallocate capital to highest marginal-yield campaign.'
                });
              }}
            />
          ))}
        </div>
      </div>

      {/* 7. Interactive What-If Scenario Sandbox */}
      <ScenarioSandbox
        onApplyReallocation={(alloc) => {
          toast.success('What-If Scenario Vector Applied', {
            description: `Meta: $${alloc.meta}/d | Google: $${alloc.google}/d | Amazon: $${alloc.amazon}/d`
          });
        }}
      />

      {/* 8. Autonomous Budget Reallocation Stream */}
      <ReallocationFeed />

      {/* 9. Multi-Platform Financial Telemetry (Time-Series Trends & Share) */}
      <PlatformBreakdownChart
        platforms={state.platforms}
        dailyTrend={state.dailyTrend}
      />

      {/* 10. ROAS Gauges & Health Scoring Matrix */}
      <div className='space-y-4 rounded-xl border border-border bg-card p-5 shadow-none text-card-foreground'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
          <div className='flex items-center gap-2'>
            <Icons.trendingUp className='size-3.5 text-foreground' />
            <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
              Real-Time Campaign Gauges &amp; Health Scoring
            </h3>
            <span className='text-xs font-mono text-muted-foreground'>
              ({products.length} campaigns)
            </span>
          </div>

          {/* Platform Tab Filters */}
          <div className='flex items-center gap-1 bg-muted/60 p-1 rounded border border-border text-xs font-mono'>
            {(['all', 'amazon', 'google', 'meta', 'shopify', 'tiktok'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-1 rounded transition-all uppercase text-[11px] font-mono tracking-wider active:scale-[0.98] inline-flex items-center gap-1.5',
                  activeTab === tab
                    ? 'bg-background text-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab !== 'all' && <PlatformLogo platform={tab} size={12} className='shrink-0' />}
                <span>{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gauges Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
          {products
            .filter((p) => (activeTab === 'all' ? true : p.channel.toLowerCase() === activeTab.toLowerCase()))
            .slice(0, 8)
            .map((p) => (
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
                compact
                onFix={() => {
                  const plan = computeFixPlan(p, products);
                  setFixingProduct(p);
                  setFixingPlan(plan);
                  setIsSummaryOnly(false);
                  setIsFixModalOpen(true);
                }}
                onViewFix={() => {
                  const plan = p.appliedPlan || computeFixPlan(p, products);
                  setFixingProduct(p);
                  setFixingPlan(plan);
                  setIsSummaryOnly(true);
                  setIsFixModalOpen(true);
                }}
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
                      : 'HEALTHY'
                  });
                }}
              />
            ))}
        </div>
      </div>

      {/* 11. Closed-Loop Decision Ledger & Audit Trail */}
      <DecisionLedgerTable entries={ledger} />

      {/* 9. Analysing Phase Modal featuring 3D GitHub Globe */}
      <ProductAnalysisModal
        product={analyzingProduct}
        isOpen={!!analyzingProduct}
        onClose={() => setAnalyzingProduct(null)}
        onMitigate={(prod) => {
          toast.success(`Autonomous mitigation dispatched for ${prod.productName}`);
        }}
      />

      {/* Fix Protocol Modal for Overview Gauges */}
      <FixProtocolModal
        product={fixingProduct}
        plan={fixingPlan}
        isOpen={isFixModalOpen}
        isSummaryOnly={isSummaryOnly}
        onClose={() => setIsFixModalOpen(false)}
        onExecute={(plan) => {
          if (fixingProduct) {
            executeFix(fixingProduct.id, plan);
          }
        }}
      />
    </div>
  );
}
