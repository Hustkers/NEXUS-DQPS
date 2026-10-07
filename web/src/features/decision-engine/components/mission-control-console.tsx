'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { AnomalyCard } from './anomaly-card';
import { ReallocationFeed } from './reallocation-feed';
import { ScenarioController, ScenarioDefinition } from './scenario-controller';
import { RoasGauge } from './roas-gauge';
import { PlatformBreakdownChart } from './platform-breakdown-chart';
import { DecisionLedgerTable } from './decision-ledger-table';
import { ProductAnalysisModal, type ProductAnalysisTarget } from './product-analysis-modal';
import { GithubGlobe } from './github-globe';
import { GlobePulse } from '@/components/ui/cobe-globe-pulse';
import initialEngineState from '@/data/nexus-engine-state.json';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useChannel, AdChannel } from '@/context/channel-context';

export function MissionControlConsole() {
  const [state, setState] = useState(initialEngineState);
  const [analyzingProduct, setAnalyzingProduct] = useState<ProductAnalysisTarget | null>(null);
  const [consoleGlobeMode, setConsoleGlobeMode] = useState<'arcs' | 'pulse'>('pulse');
  const { channel, setChannel } = useChannel();
  const activeTab = channel;
  const setActiveTab = (tab: string) => setChannel(tab as AdChannel);

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
          explanation: 'Stock level reached zero on Nike ERP SKU 315122-001. ROAS collapsed from 3.8x to 0.15x.',
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
    }
  };

  const handleResetBaseline = () => {
    setState(initialEngineState);
  };

  const filteredCampaigns = state.campaigns.filter((c: any) =>
    activeTab === 'all' ? true : c.platform === activeTab
  );

  return (
    <div className='relative flex flex-1 flex-col gap-8 p-5 md:p-8 bg-slate-50/50 dark:bg-[#08090c] text-foreground min-h-screen selection:bg-slate-200 dark:selection:bg-zinc-800 selection:text-foreground'>
      {/* 1. Header & Live Telemetry (Utilitarian Minimalist) */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5'>
        <div>
          <div className='flex items-center gap-2.5'>
            <span className='size-2 rounded-full bg-emerald-500 shadow-xs' />
            <h1 className='text-xl font-bold font-mono tracking-tight text-foreground'>
              NEXUS D2C
            </h1>
            <span className='text-muted-foreground/60 font-mono text-sm'>/</span>
            <span className='text-sm font-mono text-muted-foreground font-medium'>
              Nike Direct Decision Engine
            </span>
          </div>
          <p className='text-xs text-muted-foreground font-mono mt-1'>
            PostgreSQL 16 • Autonomous allocation active • Floor ROAS 1.80x
          </p>
        </div>

        <div className='flex items-center gap-3 text-xs font-mono'>
          <div className='flex items-center gap-2 text-foreground bg-card px-3 py-1.5 rounded-lg border border-border shadow-2xs'>
            <span className='size-1.5 rounded-full bg-emerald-500' />
            <span className='font-semibold'>Cycle {state.metadata.cycleId}</span>
          </div>
          <span className='text-muted-foreground hidden sm:block text-[11px] font-mono'>
            SLSQP Convex Optimization
          </span>
        </div>
      </div>

      {/* 2. Key Performance Bento Strip */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Blended ROAS */}
        <Card className='border-border/80 bg-card p-5 rounded-xl shadow-xs hover:border-border hover:shadow-sm transition-all'>
          <div className='flex items-center justify-between text-xs font-mono text-muted-foreground uppercase tracking-wider'>
            <span>Blended ROAS</span>
            <span className='text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px] font-bold'>
              {state.telemetry.roasDelta30d}
            </span>
          </div>
          <div className='mt-2.5 flex items-baseline justify-between'>
            <span className='text-2xl font-bold font-mono tracking-tight text-foreground'>
              {state.telemetry.blendedRoas30d.toFixed(2)}x
            </span>
            <span className='text-xs font-mono text-muted-foreground'>
              Target: {state.telemetry.targetRoas.toFixed(2)}x
            </span>
          </div>
          <div className='mt-3 h-1 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden'>
            <div
              className='h-full bg-emerald-500 rounded-full'
              style={{ width: `${Math.min(100, (state.telemetry.blendedRoas30d / state.telemetry.targetRoas) * 100)}%` }}
            />
          </div>
        </Card>

        {/* 30D Spend */}
        <Card className='border-border/80 bg-card p-5 rounded-xl shadow-xs hover:border-border hover:shadow-sm transition-all'>
          <div className='flex items-center justify-between text-xs font-mono text-muted-foreground uppercase tracking-wider'>
            <span>30D Ad Spend</span>
            <span className='text-muted-foreground text-[11px] font-mono'>79% pace</span>
          </div>
          <div className='mt-2.5 flex items-baseline justify-between'>
            <span className='text-2xl font-bold font-mono tracking-tight text-foreground'>
              ₹{(state.telemetry.totalSpend30d / 1000).toFixed(1)}k
            </span>
            <span className='text-xs font-mono text-muted-foreground'>
              Budget: ₹{(state.telemetry.totalManagedBudget / 1000).toFixed(0)}k
            </span>
          </div>
          <div className='mt-3 h-1 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden'>
            <div className='h-full bg-blue-500 rounded-full' style={{ width: '79%' }} />
          </div>
        </Card>

        {/* Net Contribution Margin */}
        <Card className='border-border/80 bg-card p-5 rounded-xl shadow-xs hover:border-border hover:shadow-sm transition-all'>
          <div className='flex items-center justify-between text-xs font-mono text-muted-foreground uppercase tracking-wider'>
            <span>Contribution Margin</span>
            <span className='text-sky-700 dark:text-cyan-400 text-[11px] font-semibold'>56.8% gross</span>
          </div>
          <div className='mt-2.5 flex items-baseline justify-between'>
            <span className='text-2xl font-bold font-mono tracking-tight text-foreground'>
              ₹{(state.telemetry.totalMargin30d / 1000).toFixed(1)}k
            </span>
            <span className='text-xs font-mono text-muted-foreground'>
              Rev: ₹{(state.telemetry.totalRevenue30d / 1000).toFixed(1)}k
            </span>
          </div>
          <div className='mt-3 h-1 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden'>
            <div className='h-full bg-sky-500 dark:bg-cyan-400 rounded-full' style={{ width: '56.8%' }} />
          </div>
        </Card>

        {/* Protected Margin Lift */}
        <Card className='border-border/80 bg-card p-5 rounded-xl shadow-xs hover:border-border hover:shadow-sm transition-all'>
          <div className='flex items-center justify-between text-xs font-mono text-muted-foreground uppercase tracking-wider'>
            <span>Protected Lift</span>
            <span className='text-rose-600 dark:text-rose-400 text-[11px] font-mono'>{state.telemetry.activeAnomaliesCount} anomalies</span>
          </div>
          <div className='mt-2.5 flex items-baseline justify-between'>
            <span className='text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400'>
              +₹{(state.telemetry.projectedMarginUplift / 1000).toFixed(1)}k
            </span>
            <span className='text-xs font-mono text-muted-foreground'>
              Reallocated: ₹{(state.telemetry.reallocationCapitalMoved / 1000).toFixed(1)}k
            </span>
          </div>
          <div className='mt-3 h-1 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden'>
            <div className='h-full bg-emerald-500 rounded-full' style={{ width: '92%' }} />
          </div>
        </Card>
      </div>

      {/* 3. Scenario Controller (Utilitarian Sandbox) */}
      <ScenarioController
        scenarios={state.scenarios}
        onTriggerScenario={handleTriggerScenario}
        onResetBaseline={handleResetBaseline}
      />

      {/* 3.5. Live 3D Global Telemetry & Heatmap Command Center */}
      <div className='rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden'>
        <div className='flex-1 space-y-3.5 w-full'>
          <div className='flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-2.5'>
            <div className='flex items-center gap-2'>
              <Icons.globe className='size-5 text-cyan-400' />
              <h3 className='font-mono text-sm font-bold text-zinc-100 uppercase tracking-tight'>
                Live 3D Global Ad &amp; Sales Telemetry
              </h3>
            </div>
            <div className='flex items-center gap-2'>
              {/* Globe Switcher */}
              <div className='flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5 text-xs font-mono'>
                <button
                  onClick={() => setConsoleGlobeMode('pulse')}
                  className={cn(
                    'px-2.5 py-1 rounded font-semibold transition-all',
                    consoleGlobeMode === 'pulse'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  Sales Pulse
                </button>
                <button
                  onClick={() => setConsoleGlobeMode('arcs')}
                  className={cn(
                    'px-2.5 py-1 rounded font-semibold transition-all',
                    consoleGlobeMode === 'arcs'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  Analysing Arcs
                </button>
              </div>

              <Link
                href='/dashboard/globe'
                className='px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5'
              >
                <span>Full Globe Hub</span>
                <Icons.arrowRight className='size-3' />
              </Link>
            </div>
          </div>

          <p className='text-xs font-mono text-zinc-400 leading-relaxed'>
            {consoleGlobeMode === 'pulse'
              ? 'Real-time customer interaction pulse: Regions with high sales and engagement rendered in Red, decreasingly Yellow, and No Grey. Powered by cobe-globe-pulse.'
              : 'WebGL ad delivery vectors across Meta, Google, Amazon & TikTok. Visualizing network latency and delivery hops via github.com/globe.'}
          </p>

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs'>
            <div className='p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/70'>
              <div className='text-[10px] text-zinc-500'>US-EAST / WEST</div>
              <div className='text-red-400 font-bold'>High Sales (78%)</div>
            </div>
            <div className='p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/70'>
              <div className='text-[10px] text-zinc-500'>WESTERN EUROPE</div>
              <div className='text-orange-400 font-bold'>Strong (56%)</div>
            </div>
            <div className='p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/70'>
              <div className='text-[10px] text-zinc-500'>ASIA-PACIFIC</div>
              <div className='text-yellow-400 font-bold'>Moderate (44%)</div>
            </div>
            <div className='p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/70'>
              <div className='text-[10px] text-zinc-500'>LATAM &amp; SEA</div>
              <div className='text-cyan-400 font-bold'>RL Suppressed</div>
            </div>
          </div>

          <div className='pt-2 flex flex-wrap items-center gap-2'>
            <span className='text-[11px] font-mono text-zinc-500'>Click any active SKU to open 3D Analysis Modal:</span>
            {state.campaigns.slice(0, 3).map((c: any) => (
              <button
                key={c.campaign}
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
                className='px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-cyan-500/60 text-xs font-mono text-zinc-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5'
              >
                <span className='size-1.5 rounded-full bg-cyan-400' />
                <span>{c.productName || c.sku}</span>
              </button>
            ))}
          </div>
        </div>

        {/* The 3D Interactive Canvas */}
        <div className='size-[260px] sm:size-[300px] flex items-center justify-center shrink-0 relative'>
          {consoleGlobeMode === 'arcs' ? (
            <GithubGlobe
              size={260}
              activeSku='315122-001'
              activePlatform='meta'
              accentColor={[0.95, 0.35, 0.45]}
            />
          ) : (
            <GlobePulse size={260} speed={0.0035} />
          )}
        </div>
      </div>

      {/* 4. Diagnostic Anomalies Feed */}
      <div className='space-y-3.5'>
        <div className='flex items-center justify-between border-b border-border/80 pb-2.5'>
          <div className='flex items-center gap-2'>
            <Icons.warning className='size-3.5 text-rose-500' />
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

      {/* 5. Autonomous Budget Reallocation Stream */}
      <ReallocationFeed
        initialItems={state.reallocations}
        campaigns={state.campaigns}
        onExecuteReallocation={(item, details) => {
          setState((prev) => {
            const newLedgerItem = {
              id: details?.ledgerRecord?.id || `ledg-live-${Date.now()}`,
              timestamp: details?.ledgerRecord?.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
              decision: `Set ${item.targetCampaign} spend -> ₹${item.recommendedSpend.toFixed(0)}/day (shifted ₹${Math.abs(item.deltaSpend).toFixed(0)} from ${item.sourceCampaign})`,
              expectedMargin: item.expectedDailyMargin,
              realizedMargin: item.expectedDailyMargin * 0.94,
              variancePct: -6.0,
              accuracyPct: 94.0,
              confidence: item.confidence,
              status: 'executed',
              feedback: 'Reinforced: Model weights updated'
            };

            // Update cumulative capital moved and projected uplift in telemetry
            const updatedTelemetry = {
              ...prev.telemetry,
              reallocationCapitalMoved: +(prev.telemetry.reallocationCapitalMoved + Math.abs(item.deltaSpend)).toFixed(2),
              projectedMarginUplift: +(prev.telemetry.projectedMarginUplift + item.expectedDailyMargin).toFixed(2)
            };

            // Mutate campaigns safely so ROAS gauges reflect the newly executed allocation
            const updatedCampaigns = prev.campaigns.map((c: any) => {
              if (c.campaign === item.targetCampaign) {
                return {
                  ...c,
                  currentDailySpend: Math.round(item.recommendedSpend),
                  roas: item.predictedRoas
                };
              }
              if (c.campaign === item.sourceCampaign) {
                return {
                  ...c,
                  currentDailySpend: Math.max(0, Math.round(c.currentDailySpend - Math.abs(item.deltaSpend)))
                };
              }
              return c;
            });

            return {
              ...prev,
              campaigns: updatedCampaigns,
              telemetry: updatedTelemetry,
              ledger: [newLedgerItem, ...prev.ledger]
            };
          });
        }}
      />

      {/* 6. Multi-Platform Financial Telemetry */}
      <PlatformBreakdownChart
        platforms={state.platforms}
        dailyTrend={state.dailyTrend}
      />

      {/* 7. ROAS Gauges & Health Scoring Matrix */}
      <div className='space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-xs'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3'>
          <div className='flex items-center gap-2'>
            <Icons.trendingUp className='size-3.5 text-emerald-600 dark:text-emerald-400' />
            <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
              Real-Time Campaign Gauges &amp; Health Scoring
            </h3>
            <span className='text-xs font-mono text-muted-foreground'>
              ({filteredCampaigns.length} campaigns)
            </span>
          </div>

          {/* Platform Tab Filters */}
          <div className='flex items-center gap-1 bg-slate-100 dark:bg-zinc-900/60 p-1 rounded-lg border border-border text-xs font-mono'>
            {(['all', 'amazon', 'google', 'meta'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-1 rounded-md transition-all uppercase text-[11px] font-mono tracking-wider active:scale-[0.98]',
                  activeTab === tab
                    ? 'bg-card text-foreground font-bold border border-border shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab}
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

      {/* 8. Closed-Loop Decision Ledger */}
      <DecisionLedgerTable entries={state.ledger} showHeader />

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
