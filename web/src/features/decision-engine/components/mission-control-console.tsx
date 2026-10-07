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

export function MissionControlConsole() {
  const [state, setState] = useState(initialEngineState);
  const [analyzingProduct, setAnalyzingProduct] = useState<ProductAnalysisTarget | null>(null);
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

  const filteredCampaigns = state.campaigns.filter((c: any) =>
    activeTab === 'all' ? true : c.platform === activeTab
  );

  return (
    <div className='relative flex flex-1 flex-col gap-8 p-5 md:p-8 bg-[#000000] text-white min-h-screen selection:bg-[#1A1A1A] selection:text-white'>
      {/* 1. Header & Live Telemetry (Utilitarian Minimalist) */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8A8A8A] pb-5'>
        <div>
          <div className='flex items-center gap-2.5'>
            <span className='size-2 rounded-full bg-white' />
            <h1 className='text-xl font-bold font-mono tracking-tight text-white'>
              NEXUS D2C
            </h1>
            <span className='text-[#8A8A8A] font-mono text-sm'>/</span>
            <span className='text-sm font-mono text-[#8A8A8A] font-medium'>
              Nike Direct Decision Engine
            </span>
          </div>
          <p className='text-xs text-[#8A8A8A] font-mono mt-1'>
            DuckDB &amp; PostgreSQL 16 • Columnar Store • Analytical SLSQP Optimizer • Dual-Knapsack Bandits • Floor ROAS 1.80x
          </p>
        </div>
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
      <div className='rounded border border-[#8A8A8A] bg-[#1A1A1A] p-6 shadow-none flex flex-col xl:flex-row items-start justify-between gap-6 relative min-h-[460px]'>
        {/* Left Column: Telemetry info, tabs, region tiles, SKU chips */}
        <div className='flex-1 space-y-3.5 w-full min-w-0'>
          <div className='flex flex-wrap items-center justify-between gap-2 border-b border-[#000000] pb-2.5'>
            <div className='flex items-center gap-2'>
              <Icons.globe className='size-5 text-white' />
              <h3 className='font-mono text-sm font-bold text-white uppercase tracking-tight'>
                Live 3D Global Ad &amp; Sales Telemetry
              </h3>
            </div>
            <div className='flex items-center gap-2'>
              {/* Globe Switcher */}
              <div className='flex items-center bg-[#000000] rounded border border-[#8A8A8A] p-0.5 text-xs font-mono'>
                <button
                  type='button'
                  onClick={() => setConsoleGlobeMode('pulse')}
                  className={cn(
                    'px-2.5 py-1 rounded font-semibold transition-all',
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
                    'px-2.5 py-1 rounded font-semibold transition-all',
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
                className='px-2.5 py-1 rounded bg-[#000000] border border-[#8A8A8A] text-xs font-mono text-white hover:bg-white hover:text-black transition-colors flex items-center gap-1.5'
              >
                <span>Full Globe Hub</span>
                <Icons.arrowRight className='size-3' />
              </Link>
            </div>
          </div>

          <p className='text-xs font-mono text-[#8A8A8A] leading-relaxed'>
            {consoleGlobeMode === 'pulse'
              ? 'Real-time customer interaction pulse: High engagement rendered via mechanical telemetry contrast. Powered by cobe-globe-pulse.'
              : 'WebGL ad delivery vectors across Meta, Google, Amazon & Shopify. Visualizing network latency and delivery hops via github.com/globe.'}
          </p>

          {/* Region Status Tiles with Clear Status Dot and Readable Contrast */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs'>
            {/* Tile 1: US-EAST / WEST (High Sales - Red) */}
            <button
              type='button'
              onClick={() => {
                const match = GLOBE_REGIONS.find((m) => m.id === 'us-east');
                if (match) setSelectedGlobeMarker((prev) => (prev?.id === 'us-east' ? null : match));
              }}
              className={cn(
                'p-2.5 rounded bg-[#000000] border transition-all text-left cursor-pointer group',
                selectedGlobeMarker?.id === 'us-east'
                  ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                  : 'border-[#8A8A8A] hover:border-white'
              )}
            >
              <div className='flex items-center gap-1.5 text-[10px] text-zinc-400'>
                <span className='size-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_6px_#ef4444]' />
                <span>US-EAST / WEST</span>
              </div>
              <div className='text-white font-bold mt-0.5'>High Sales (78%)</div>
            </button>

            {/* Tile 2: WESTERN EUROPE (Strong - Amber) */}
            <button
              type='button'
              onClick={() => {
                const match = GLOBE_REGIONS.find((m) => m.id === 'eu-west');
                if (match) setSelectedGlobeMarker((prev) => (prev?.id === 'eu-west' ? null : match));
              }}
              className={cn(
                'p-2.5 rounded bg-[#000000] border transition-all text-left cursor-pointer group',
                selectedGlobeMarker?.id === 'eu-west'
                  ? 'border-amber-500 ring-1 ring-amber-500/50 bg-amber-950/20'
                  : 'border-[#8A8A8A] hover:border-white'
              )}
            >
              <div className='flex items-center gap-1.5 text-[10px] text-zinc-400'>
                <span className='size-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_#f59e0b]' />
                <span>WESTERN EUROPE</span>
              </div>
              <div className='text-white font-bold mt-0.5'>Strong (56%)</div>
            </button>

            {/* Tile 3: ASIA-PACIFIC (Moderate - Readable Amber/Yellow Text) */}
            <button
              type='button'
              onClick={() => {
                const match = GLOBE_REGIONS.find((m) => m.id === 'apac');
                if (match) setSelectedGlobeMarker((prev) => (prev?.id === 'apac' ? null : match));
              }}
              className={cn(
                'p-2.5 rounded bg-[#000000] border transition-all text-left cursor-pointer group',
                selectedGlobeMarker?.id === 'apac'
                  ? 'border-amber-500 ring-1 ring-amber-500/50 bg-amber-950/20'
                  : 'border-[#8A8A8A] hover:border-white'
              )}
            >
              <div className='flex items-center gap-1.5 text-[10px] text-zinc-400'>
                <span className='size-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_#f59e0b]' />
                <span>ASIA-PACIFIC</span>
              </div>
              <div className='text-amber-300 font-bold mt-0.5'>Moderate (44%)</div>
            </button>

            {/* Tile 4: LATAM & SEA (RL Suppressed - Grey) */}
            <button
              type='button'
              onClick={() => {
                const match = GLOBE_REGIONS.find((m) => m.id === 'latam');
                if (match) setSelectedGlobeMarker((prev) => (prev?.id === 'latam' ? null : match));
              }}
              className={cn(
                'p-2.5 rounded bg-[#000000] border transition-all text-left cursor-pointer group',
                selectedGlobeMarker?.id === 'latam'
                  ? 'border-zinc-400 ring-1 ring-zinc-400/50 bg-zinc-900/60'
                  : 'border-[#8A8A8A] hover:border-white'
              )}
            >
              <div className='flex items-center gap-1.5 text-[10px] text-zinc-400'>
                <span className='size-2 rounded-full bg-zinc-500 shrink-0' />
                <span>LATAM &amp; SEA</span>
              </div>
              <div className='text-zinc-200 font-bold mt-0.5'>RL Suppressed</div>
            </button>
          </div>

          <div className='pt-1 flex flex-wrap items-center gap-2'>
            <span className='text-[11px] font-mono text-[#8A8A8A]'>Click any active SKU to open 3D Analysis Modal:</span>
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
                className='px-2.5 py-1 rounded bg-[#000000] border border-[#8A8A8A] hover:border-white text-xs font-mono text-white transition-colors flex items-center gap-1.5'
              >
                <PlatformLogo platform={c.platform} size={12} className='shrink-0' />
                <span>{c.productName || c.sku}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: 3D Interactive Globe centered with Clean Non-Disruptive Overlay Panel */}
        <div className='w-full xl:w-[420px] 2xl:w-[440px] shrink-0 flex items-center justify-center relative min-h-[360px]'>
          <div className='size-[340px] flex items-center justify-center shrink-0 relative'>
            {consoleGlobeMode === 'arcs' ? (
              <GithubGlobe
                size={340}
                activeSku='315122-001'
                activePlatform='meta'
                accentColor={[1, 1, 1]}
              />
            ) : (
              <GlobePulse
                size={340}
                speed={0.0035}
                selectedMarkerId={selectedGlobeMarker?.id}
                onSelectMarker={setSelectedGlobeMarker}
                renderDetailPanel={false}
              />
            )}
          </div>

          {/* Regional Telemetry Detail Overlay Panel */}
          {selectedGlobeMarker && (
            <div className='absolute top-0 right-0 z-50 w-full max-w-[340px] sm:max-w-[380px] shadow-2xl transition-all duration-200 animate-in fade-in-0 slide-in-from-right-4'>
              <RegionDetailPanel
                marker={selectedGlobeMarker}
                isOpen={Boolean(selectedGlobeMarker)}
                onClose={() => setSelectedGlobeMarker(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 5. Causal DAG Visualizer & RCA Waterfall Decomposition */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <CausalDagVisualizer activeAnomaly={hasCriticalAnomaly} />
        <RcaWaterfallChart
          totalLoss={hasCriticalAnomaly ? 3008.25 : 0}
          items={hasCriticalAnomaly ? undefined : [
            { driver: 'Baseline Equilibrium', category: 'Nominal Operations', dollarImpact: 0, percentageShare: 100, color: 'bg-white' }
          ]}
        />
      </div>
      <div className='space-y-3.5'>
        <div className='flex items-center justify-between border-b border-[#8A8A8A] pb-2.5'>
          <div className='flex items-center gap-2'>
            <Icons.warning className='size-3.5 text-white' />
            <h3 className='font-mono text-xs font-bold text-white uppercase tracking-wider'>
              Active Diagnostic Anomalies
            </h3>
            <span className='text-xs font-mono text-[#8A8A8A]'>
              ({state.anomalies.length})
            </span>
          </div>
          <span className='text-xs font-mono text-[#8A8A8A]'>
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
      <ReallocationFeed
        initialItems={state.reallocations}
        onExecuteReallocation={(item) => {
          setState((prev) => {
            const newLedgerItem = {
              id: `ledg-live-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              decision: `Set ${item.targetCampaign} spend -> ₹${item.recommendedSpend.toFixed(0)}/day (shifted ₹${Math.abs(item.deltaSpend).toFixed(0)} from ${item.sourceCampaign})`,
              expectedMargin: item.expectedDailyMargin,
              realizedMargin: item.expectedDailyMargin * 0.94,
              variancePct: -6.0,
              accuracyPct: 94.0,
              confidence: item.confidence,
              status: 'executed',
              feedback: 'Reinforced: Model weights updated'
            };
            return {
              ...prev,
              ledger: [newLedgerItem, ...prev.ledger]
            };
          });
        }}
      />

      {/* 9. Multi-Platform Financial Telemetry (Time-Series Trends & Share) */}
      <PlatformBreakdownChart
        platforms={state.platforms}
        dailyTrend={state.dailyTrend}
      />

      {/* 10. ROAS Gauges & Health Scoring Matrix */}
      <div className='space-y-4 rounded border border-[#8A8A8A] bg-[#1A1A1A] p-5 shadow-none'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-[#000000] pb-3'>
          <div className='flex items-center gap-2'>
            <Icons.trendingUp className='size-3.5 text-white' />
            <h3 className='font-mono text-xs font-bold text-white uppercase tracking-wider'>
              Real-Time Campaign Gauges &amp; Health Scoring
            </h3>
            <span className='text-xs font-mono text-[#8A8A8A]'>
              ({filteredCampaigns.length} campaigns)
            </span>
          </div>

          {/* Platform Tab Filters */}
          <div className='flex items-center gap-1 bg-[#000000] p-1 rounded border border-[#8A8A8A] text-xs font-mono'>
            {(['all', 'amazon', 'google', 'meta'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-1 rounded transition-all uppercase text-[11px] font-mono tracking-wider active:scale-[0.98] inline-flex items-center gap-1.5',
                  activeTab === tab
                    ? 'bg-white text-black font-bold'
                    : 'text-[#8A8A8A] hover:text-white'
                )}
              >
                {tab !== 'all' && <PlatformLogo platform={tab} size={12} className='shrink-0' />}
                <span>{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gauges Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {filteredCampaigns.slice(0, 8).map((camp: any) => (
            <RoasGauge
              key={camp.campaign}
              campaignName={camp.campaign}
              productName={camp.productName}
              photoUrl={camp.photoUrl}
              platform={camp.platform}
              inventory={camp.inventory}
              currentRoas={camp.roas}
              targetRoas={camp.targetRoas || 3.2}
              breakevenRoas={camp.breakevenRoas || 1.8}
              healthScore={camp.healthScore}
              compact
              onAnalyze={() => {
                setAnalyzingProduct({
                  productName: camp.productName || camp.campaign,
                  sku: camp.sku,
                  photoUrl: camp.photoUrl,
                  platform: camp.platform,
                  campaign: camp.campaign,
                  inventory: camp.inventory,
                  roas: camp.roas,
                  targetRoas: camp.targetRoas,
                  severity: camp.roasStatus === 'CRITICAL_STOCKOUT' ? 'CRITICAL' : 'HEALTHY'
                });
              }}
            />
          ))}
        </div>
      </div>

      {/* 11. Closed-Loop Decision Ledger & Audit Trail */}
      <DecisionLedgerTable entries={state.ledger} />

      {/* 9. Analysing Phase Modal featuring 3D GitHub Globe */}
      <ProductAnalysisModal
        product={analyzingProduct}
        isOpen={!!analyzingProduct}
        onClose={() => setAnalyzingProduct(null)}
        onMitigate={(prod) => {
          toast.success(`Autonomous mitigation dispatched for ${prod.productName}`);
        }}
      />
    </div>
  );
}
