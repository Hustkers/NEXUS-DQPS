'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { AnomalyCard, type AnomalyItem } from './anomaly-card';
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
import { ActionDrawer } from './action-drawer';
import { useDecisionEngine } from '@/context/decision-engine-store';
import type { DerivedProduct } from '@/lib/gauges-engine';
import { ReallocationExecutionModal } from './reallocation-execution-modal';
import type { ReallocationExecutionDetails } from '../types/reallocation-execution';

export function MissionControlConsole() {
  const [state, setState] = useState(initialEngineState);
  const { products, ledger } = useDecisionEngine();
  const [analyzingProduct, setAnalyzingProduct] = useState<ProductAnalysisTarget | null>(null);
  const [fixingActionId, setFixingActionId] = useState<string | null>(null);
  const [fixingInitialState, setFixingInitialState] = useState<'review' | 'done'>('review');
  const [isFixDrawerOpen, setIsFixDrawerOpen] = useState(false);
  const [consoleGlobeMode, setConsoleGlobeMode] = useState<'arcs' | 'pulse'>('pulse');
  const [selectedGlobeMarker, setSelectedGlobeMarker] = useState<PulseMarker | null>(null);
  const { channel, setChannel } = useChannel();
  const activeTab = channel;
  const setActiveTab = (tab: string) => setChannel(tab as AdChannel);

  // Auto-Reallocate Modal state for Mission Control
  const [isReallocationModalOpen, setIsReallocationModalOpen] = useState(false);
  const [selectedReallocationDetails, setSelectedReallocationDetails] = useState<ReallocationExecutionDetails | null>(null);
  const [isAlreadyExecuted, setIsAlreadyExecuted] = useState(false);
  const [mitigatingAnomalyId, setMitigatingAnomalyId] = useState<string | null>(null);

  const handleAutoReallocate = async (anomaly: AnomalyItem) => {
    if (mitigatingAnomalyId) return;
    setMitigatingAnomalyId(anomaly.id);

    try {
      const res = await fetch('/api/reallocations/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anomalyId: anomaly.id })
      });

      const data = await res.json();

      if (res.ok && data.success && data.details) {
        setSelectedReallocationDetails(data.details);
        setIsAlreadyExecuted(false);
        setIsReallocationModalOpen(true);
      } else if (data.code === 'ALREADY_REALLOCATED') {
        if (data.details) {
          setSelectedReallocationDetails(data.details);
        }
        setIsAlreadyExecuted(true);
        setIsReallocationModalOpen(true);
        toast.info('Reallocation Already Audited', {
          description: data.message
        });
      } else {
        toast.error('Reallocation Unavailable', {
          description: data.message || 'No safe reallocation path identified for this campaign.'
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not communicate with autonomous optimization engine.';
      toast.error('Analysis Request Failed', {
        description: message
      });
    } finally {
      setMitigatingAnomalyId(null);
    }
  };

  const handleConfirmExecution = async (details: ReallocationExecutionDetails) => {
    const anomalyId = details.anomaly?.id || details.item.id.replace('realloc-', '');
    try {
      const res = await fetch('/api/reallocations/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomalyId,
          targetCampaign: details.destination.campaign,
          deltaSpend: details.capitalMoved
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Mark anomaly as reallocated in state
        setState((prev: any) => ({
          ...prev,
          anomalies: prev.anomalies.map((a: any) =>
            a.id === anomalyId
              ? {
                  ...a,
                  isReallocated: true,
                  reallocationId: data.receipt?.id || details.ledgerRecord.id,
                  reallocatedAt: data.receipt?.timestamp || details.ledgerRecord.timestamp
                }
              : a
          )
        }));

        toast.success(`Autonomous Reallocation Dispatched`, {
          description: `Shifted ₹${Math.round(details.capitalMoved).toLocaleString('en-IN')}/day to ${details.destination.productName}. Decision ID: ${data.receipt?.id || details.ledgerRecord.id}.`
        });

        return {
          success: true,
          receipt: data.receipt,
          details: data.details || details
        };
      } else {
        return {
          success: false,
          error: data.message || 'Execution rejected by closed-loop engine.'
        };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network execution failed.';
      return {
        success: false,
        error: message
      };
    }
  };

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
    <div className='relative flex flex-1 min-w-0 max-w-full flex-col gap-6 md:gap-8 p-3.5 sm:p-5 md:p-8 bg-background text-foreground min-h-screen selection:bg-primary/20 selection:text-foreground'>

      {/* Flagship Product Feature Banner */}
      <div className='rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-card to-card p-5 font-orbitron shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
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

      {/* 3. Scenario Controller (Operational Shock Simulator) */}
      <ScenarioController
        scenarios={state.scenarios}
        onTriggerScenario={handleTriggerScenario}
        onResetBaseline={handleResetBaseline}
      />

      {/* 4. Global Ad & Sales Telemetry */}
      <div className='rounded-xl border border-border bg-card p-5 sm:p-6 shadow-none text-card-foreground flex flex-col 2xl:flex-row items-start justify-between gap-6 relative min-h-[440px] min-w-0 max-w-full overflow-hidden'>
        {/* Left Column: Controls, Regions, Active Products */}
        <div className='flex-1 space-y-3.5 w-full min-w-0'>
          <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2.5'>
            <div className='flex items-center gap-2'>
              <Icons.globe className='size-4 text-foreground' />
              <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
                GLOBAL SALES PULSE
              </h3>
            </div>
            <div className='flex items-center gap-2'>
              {/* Globe Switcher */}
              <div className='flex items-center bg-muted/60 rounded border border-border p-0.5 text-xs font-mono'>
                <button
                  type='button'
                  onClick={() => setConsoleGlobeMode('pulse')}
                  className={cn(
                    'px-2.5 py-0.5 rounded font-semibold transition-all text-[11px]',
                    consoleGlobeMode === 'pulse'
                      ? 'bg-background text-foreground shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Sales Pulse
                </button>
                <button
                  type='button'
                  onClick={() => setConsoleGlobeMode('arcs')}
                  className={cn(
                    'px-2.5 py-0.5 rounded font-semibold transition-all text-[11px]',
                    consoleGlobeMode === 'arcs'
                      ? 'bg-background text-foreground shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Analyzing Arcs
                </button>
              </div>

              <Link
                href='/dashboard/globe'
                className='px-2.5 py-0.5 rounded bg-background border border-border text-[11px] font-mono text-foreground hover:bg-muted transition-colors flex items-center gap-1.5'
              >
                <span>Full Globe Hub</span>
                <Icons.arrowRight className='size-3' />
              </Link>
            </div>
          </div>

          {/* Region Cards Prioritizing: REGION / STATUS / % */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 pt-1 font-mono text-xs'>
            {/* Tile 1: US-EAST / WEST */}
            <button
              type='button'
              onClick={() => {
                const match = GLOBE_REGIONS.find((m) => m.id === 'us-east');
                if (match) setSelectedGlobeMarker((prev) => (prev?.id === 'us-east' ? null : match));
              }}
              className={cn(
                'p-2.5 rounded-lg bg-muted/20 border transition-all text-left cursor-pointer group space-y-0.5',
                selectedGlobeMarker?.id === 'us-east'
                  ? 'border-red-500 ring-1 ring-red-500/50 bg-red-500/10'
                  : 'border-border hover:border-foreground/40'
              )}
            >
              <div className='text-[10px] text-muted-foreground font-semibold truncate'>US-EAST / WEST</div>
              <div className='flex items-center justify-between text-xs font-bold text-foreground'>
                <span className='flex items-center gap-1 text-red-500'>
                  ● HIGH
                </span>
                <span>78%</span>
              </div>
            </button>

            {/* Tile 2: WESTERN EUROPE */}
            <button
              type='button'
              onClick={() => {
                const match = GLOBE_REGIONS.find((m) => m.id === 'eu-west');
                if (match) setSelectedGlobeMarker((prev) => (prev?.id === 'eu-west' ? null : match));
              }}
              className={cn(
                'p-2.5 rounded-lg bg-muted/20 border transition-all text-left cursor-pointer group space-y-0.5',
                selectedGlobeMarker?.id === 'eu-west'
                  ? 'border-amber-500 ring-1 ring-amber-500/50 bg-amber-500/10'
                  : 'border-border hover:border-foreground/40'
              )}
            >
              <div className='text-[10px] text-muted-foreground font-semibold truncate'>WESTERN EUROPE</div>
              <div className='flex items-center justify-between text-xs font-bold text-foreground'>
                <span className='flex items-center gap-1 text-amber-400'>
                  ● STRONG
                </span>
                <span>56%</span>
              </div>
            </button>

            {/* Tile 3: ASIA-PACIFIC */}
            <button
              type='button'
              onClick={() => {
                const match = GLOBE_REGIONS.find((m) => m.id === 'apac');
                if (match) setSelectedGlobeMarker((prev) => (prev?.id === 'apac' ? null : match));
              }}
              className={cn(
                'p-2.5 rounded-lg bg-muted/20 border transition-all text-left cursor-pointer group space-y-0.5',
                selectedGlobeMarker?.id === 'apac'
                  ? 'border-amber-500 ring-1 ring-amber-500/50 bg-amber-500/10'
                  : 'border-border hover:border-foreground/40'
              )}
            >
              <div className='text-[10px] text-muted-foreground font-semibold truncate'>ASIA-PACIFIC</div>
              <div className='flex items-center justify-between text-xs font-bold text-foreground'>
                <span className='flex items-center gap-1 text-amber-400'>
                  ● MODERATE
                </span>
                <span>44%</span>
              </div>
            </button>

            {/* Tile 4: LATAM & SEA */}
            <button
              type='button'
              onClick={() => {
                const match = GLOBE_REGIONS.find((m) => m.id === 'latam');
                if (match) setSelectedGlobeMarker((prev) => (prev?.id === 'latam' ? null : match));
              }}
              className={cn(
                'p-2.5 rounded-lg bg-muted/20 border transition-all text-left cursor-pointer group space-y-0.5',
                selectedGlobeMarker?.id === 'latam'
                  ? 'border-zinc-400 ring-1 ring-zinc-400/50 bg-muted/60'
                  : 'border-border hover:border-foreground/40'
              )}
            >
              <div className='text-[10px] text-muted-foreground font-semibold truncate'>LATAM &amp; SEA</div>
              <div className='flex items-center justify-between text-xs font-bold text-muted-foreground'>
                <span className='flex items-center gap-1 text-muted-foreground'>
                  ● SUPPRESSED
                </span>
                <span>12%</span>
              </div>
            </button>
          </div>

          {/* Active Products List */}
          <div className='pt-1 flex flex-wrap items-center gap-2'>
            <span className='text-[10px] font-mono text-muted-foreground uppercase font-bold'>Active Products:</span>
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
                className='px-2.5 py-0.5 rounded bg-muted/40 border border-border hover:border-foreground/40 text-xs font-mono text-foreground transition-colors flex items-center gap-1.5'
              >
                <PlatformLogo platform={c.platform} size={12} className='shrink-0' />
                <span>{c.productName || c.sku}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: 3D Globe Visualizer */}
        <div className='w-full xl:w-[420px] 2xl:w-[440px] shrink-0 flex items-center justify-center relative min-h-[340px]'>
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

          {/* Non-Disruptive Region Detail Drawer Panel */}
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
      <div className='grid grid-cols-1 2xl:grid-cols-2 gap-4 min-w-0 max-w-full'>
        <CausalDagVisualizer activeAnomaly={hasCriticalAnomaly} />
        <RcaWaterfallChart
          totalLoss={hasCriticalAnomaly ? 3008.25 : 0}
          items={hasCriticalAnomaly ? undefined : [
            { driver: 'Baseline Equilibrium', category: 'Nominal Operations', dollarImpact: 0, percentageShare: 100, color: 'bg-emerald-500' }
          ]}
        />
      </div>

      {/* 6. Active Diagnostic Anomalies */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between border-b border-border/70 pb-2.5'>
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

        {/* 6-Card Quick Scan Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3.5'>
          {state.anomalies.slice(0, 6).map((anom: any) => (
            <AnomalyCard
              key={anom.id}
              anomaly={anom}
              isMitigating={mitigatingAnomalyId === anom.id}
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
              onMitigate={handleAutoReallocate}
              onViewReceipt={(a) => {
                handleAutoReallocate(a);
              }}
            />
          ))}
        </div>
      </div>

      {/* 7. Interactive What-If Scenario Sandbox */}
      <ScenarioSandbox
        onApplyReallocation={(alloc) => {
          setState((prev: any) => ({
            ...prev,
            platforms: prev.platforms.map((p: any) => {
              if (p.platform === 'meta') {
                return { ...p, spend: alloc.meta * 30, revenue: alloc.metaRev * 30 };
              }
              if (p.platform === 'google') {
                return { ...p, spend: alloc.google * 30, revenue: alloc.googleRev * 30 };
              }
              if (p.platform === 'amazon') {
                return { ...p, spend: alloc.amazon * 30, revenue: alloc.amazonRev * 30 };
              }
              return p;
            }),
            telemetry: {
              ...prev.telemetry,
              totalManagedBudget: alloc.totalSpend * 30,
              blendedRoas30d: +alloc.blendedRoas.toFixed(2),
              projectedMarginUplift: Math.round(alloc.netContribution * 30)
            }
          }));
          toast.success('What-If Scenario Vector Applied To Mission Control', {
            description: `Meta: ₹${alloc.meta}/d | Google: ₹${alloc.google}/d | Amazon: ₹${alloc.amazon}/d. Blended ROAS: ${alloc.blendedRoas.toFixed(2)}x.`
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
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-4'>
          {products
            .filter((p: DerivedProduct) => (activeTab === 'all' ? true : p.channel.toLowerCase() === activeTab.toLowerCase()))
            .slice(0, 8)
            .map((p: DerivedProduct) => (
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
                  setFixingActionId(`fix-${p.id}`);
                  setFixingInitialState('review');
                  setIsFixDrawerOpen(true);
                }}
                onViewFix={() => {
                  setFixingActionId(`fix-${p.id}`);
                  setFixingInitialState('done');
                  setIsFixDrawerOpen(true);
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

      {/* Product Analysis Modal */}
      <ProductAnalysisModal
        product={analyzingProduct}
        isOpen={!!analyzingProduct}
        onClose={() => setAnalyzingProduct(null)}
        onMitigate={(prod) => {
          toast.success(`Autonomous mitigation dispatched for ${prod.productName}`);
        }}
      />

      {/* Action Drawer for Overview Gauges */}
      <ActionDrawer
        actionId={fixingActionId}
        isOpen={isFixDrawerOpen}
        initialState={fixingInitialState}
        onClose={() => setIsFixDrawerOpen(false)}
      />

      {/* Auto-Reallocate Execution Modal */}
      <ReallocationExecutionModal
        isOpen={isReallocationModalOpen}
        onClose={() => {
          setIsReallocationModalOpen(false);
          setSelectedReallocationDetails(null);
        }}
        details={selectedReallocationDetails}
        isAlreadyExecuted={isAlreadyExecuted}
        onConfirmExecution={handleConfirmExecution}
        onViewLedger={() => {
          setIsReallocationModalOpen(false);
          const ledgerEl = document.getElementById('decision-ledger');
          if (ledgerEl) {
            ledgerEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
}
