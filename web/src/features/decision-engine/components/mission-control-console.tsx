'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { AnomalyCard } from './anomaly-card';
import { RoasGauge } from './roas-gauge';
import { ReallocationFeed } from './reallocation-feed';
import { PlatformBreakdownChart } from './platform-breakdown-chart';
import { DecisionLedgerTable } from './decision-ledger-table';
import { ScenarioController, ScenarioDefinition } from './scenario-controller';
import { ProductAnalysisModal, type ProductAnalysisTarget } from './product-analysis-modal';
import { GithubGlobe } from './github-globe';
import { GlobePulse } from '@/components/ui/cobe-globe-pulse';
import initialEngineState from '@/data/nexus-engine-state.json';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function MissionControlConsole() {
  const [state, setState] = useState(initialEngineState);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [analyzingProduct, setAnalyzingProduct] = useState<ProductAnalysisTarget | null>(null);
  const [consoleGlobeMode, setConsoleGlobeMode] = useState<'arcs' | 'pulse'>('pulse');

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
          spend: 2200,
          inventory: 0,
          explanation: 'Emergency: Nike Air Force 1 stock depleted to 0 units while meta campaign spent $2,200/day.',
          factors: [
            {
              name: 'Warehouse Depletion',
              deltaPct: -100,
              impactPts: -85.0,
              badge: 'Stock = 0',
              color: 'rose',
              detail: 'Ad traffic landing on sold-out PDP.'
            }
          ]
        };
        return {
          ...prev,
          campaigns: updatedCampaigns,
          anomalies: [stockoutAnomaly, ...prev.anomalies.filter((a) => a.id !== stockoutAnomaly.id)]
        };
      });
    } else if (scenario.id === 'scenario-cpm-spike') {
      setState((prev) => {
        const updatedCampaigns = prev.campaigns.map((c: any) => {
          if (c.platform === 'meta') {
            return {
              ...c,
              roas: Math.max(1.1, c.roas * 0.55),
              roasStatus: 'BELOW_BREAKEVEN',
              healthScore: Math.max(25, c.healthScore - 35)
            };
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
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#07090e] text-zinc-100 min-h-screen'>
      {/* 1. Header & Live Engine Status */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4'>
        <div>
          <div className='flex items-center gap-2.5'>
            <span className='size-2 rounded-full bg-emerald-400 animate-pulse' />
            <h1 className='text-xl font-bold font-mono tracking-tight text-zinc-100'>
              NEXUS D2C
            </h1>
            <span className='text-zinc-600 font-mono text-sm'>/</span>
            <span className='text-sm font-mono text-zinc-400'>
              Nike Direct Decision Engine
            </span>
          </div>
          <p className='text-xs text-zinc-500 font-mono mt-1'>
            PostgreSQL 16 • Autonomous allocation active • Floor ROAS 1.80x
          </p>
        </div>

        <div className='flex items-center gap-3 text-xs font-mono'>
          <div className='flex items-center gap-2 text-zinc-400 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800/80'>
            <span className='size-1.5 rounded-full bg-emerald-400' />
            <span>Cycle {state.metadata.cycleId}</span>
          </div>
          <div className='text-zinc-500 hidden sm:block'>
            SLSQP Hill Convex
          </div>
        </div>
      </div>

      {/* 2. Key Performance Strip (Tremor clean cards) */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Blended ROAS */}
        <Card className='border-zinc-800/80 bg-zinc-950/60 p-4 shadow-sm hover:border-zinc-700/80 transition-all'>
          <div className='flex items-center justify-between text-xs text-zinc-400'>
            <span>Blended ROAS</span>
            <span className='text-emerald-400 font-mono text-[11px] font-semibold'>
              {state.telemetry.roasDelta30d}
            </span>
          </div>
          <div className='mt-2 flex items-baseline justify-between'>
            <span className='text-2xl font-bold font-mono text-emerald-400'>
              {state.telemetry.blendedRoas30d.toFixed(2)}x
            </span>
            <span className='text-xs font-mono text-zinc-500'>
              target {state.telemetry.targetRoas.toFixed(2)}x
            </span>
          </div>
          <div className='mt-3 h-1 w-full bg-zinc-900 rounded-full overflow-hidden'>
            <div
              className='h-full bg-emerald-400 rounded-full'
              style={{ width: `${Math.min(100, (state.telemetry.blendedRoas30d / state.telemetry.targetRoas) * 100)}%` }}
            />
          </div>
        </Card>

        {/* 30D Spend */}
        <Card className='border-zinc-800/80 bg-zinc-950/60 p-4 shadow-sm hover:border-zinc-700/80 transition-all'>
          <div className='flex items-center justify-between text-xs text-zinc-400'>
            <span>30D Ad Spend</span>
            <span className='text-zinc-500 font-mono text-[11px]'>79% pace</span>
          </div>
          <div className='mt-2 flex items-baseline justify-between'>
            <span className='text-2xl font-bold font-mono text-zinc-100'>
              ${(state.telemetry.totalSpend30d / 1000).toFixed(1)}k
            </span>
            <span className='text-xs font-mono text-zinc-500'>
              budget ${(state.telemetry.totalManagedBudget / 1000).toFixed(0)}k
            </span>
          </div>
          <div className='mt-3 h-1 w-full bg-zinc-900 rounded-full overflow-hidden'>
            <div className='h-full bg-blue-500 rounded-full' style={{ width: '79%' }} />
          </div>
        </Card>

        {/* Net Contribution Margin */}
        <Card className='border-zinc-800/80 bg-zinc-950/60 p-4 shadow-sm hover:border-zinc-700/80 transition-all'>
          <div className='flex items-center justify-between text-xs text-zinc-400'>
            <span>Contribution Margin</span>
            <span className='text-cyan-400 font-mono text-[11px] font-semibold'>56.8% gross</span>
          </div>
          <div className='mt-2 flex items-baseline justify-between'>
            <span className='text-2xl font-bold font-mono text-cyan-400'>
              ${(state.telemetry.totalMargin30d / 1000).toFixed(1)}k
            </span>
            <span className='text-xs font-mono text-zinc-500'>
              rev ${(state.telemetry.totalRevenue30d / 1000).toFixed(1)}k
            </span>
          </div>
          <div className='mt-3 h-1 w-full bg-zinc-900 rounded-full overflow-hidden'>
            <div className='h-full bg-cyan-400 rounded-full' style={{ width: '56.8%' }} />
          </div>
        </Card>

        {/* Protected Margin Lift */}
        <Card className='border-zinc-800/80 bg-zinc-950/60 p-4 shadow-sm hover:border-zinc-700/80 transition-all'>
          <div className='flex items-center justify-between text-xs text-zinc-400'>
            <span>Protected Lift</span>
            <span className='text-rose-400 font-mono text-[11px]'>{state.telemetry.activeAnomaliesCount} anomalies</span>
          </div>
          <div className='mt-2 flex items-baseline justify-between'>
            <span className='text-2xl font-bold font-mono text-emerald-400'>
              +${(state.telemetry.projectedMarginUplift / 1000).toFixed(1)}k
            </span>
            <span className='text-xs font-mono text-zinc-500'>
              moved ${(state.telemetry.reallocationCapitalMoved / 1000).toFixed(1)}k
            </span>
          </div>
          <div className='mt-3 h-1 w-full bg-zinc-900 rounded-full overflow-hidden'>
            <div className='h-full bg-emerald-500 rounded-full' style={{ width: '92%' }} />
          </div>
        </Card>
      </div>

      {/* 3. Scenario Controller (Compact Sandbox) */}
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
              className='w-full h-full'
              activeSku='315122-001'
              activePlatform='meta'
              accentColor={[0.95, 0.35, 0.45]}
            />
          ) : (
            <GlobePulse className='w-full h-full' speed={0.0035} />
          )}
        </div>
      </div>

      {/* 4. Diagnostic Anomalies Feed */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between border-b border-zinc-800 pb-2'>
          <div className='flex items-center gap-2'>
            <Icons.warning className='size-4 text-rose-400' />
            <h3 className='font-mono text-sm font-bold text-zinc-100'>
              Active Diagnostic Anomalies
            </h3>
            <span className='text-xs font-mono text-zinc-500'>
              ({state.anomalies.length})
            </span>
          </div>
          <span className='text-xs font-mono text-zinc-500'>
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

      {/* 5. Autonomous Budget Reallocation Feed */}
      <ReallocationFeed
        initialItems={state.reallocations}
        onExecuteReallocation={(item) => {
          setState((prev) => {
            const newLedgerItem = {
              id: `ledg-live-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              decision: `Set ${item.targetCampaign} spend -> $${item.recommendedSpend.toFixed(0)}/day (shifted $${Math.abs(item.deltaSpend).toFixed(0)} from ${item.sourceCampaign})`,
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

      {/* 6. Multi-Platform Financial Telemetry */}
      <PlatformBreakdownChart
        platforms={state.platforms}
        dailyTrend={state.dailyTrend}
      />

      {/* 7. ROAS Gauges & Health Scoring Matrix */}
      <div className='space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3'>
          <div className='flex items-center gap-2'>
            <Icons.trendingUp className='size-4 text-emerald-400' />
            <h3 className='font-mono text-sm font-bold text-zinc-100'>
              Campaign ROAS Gauges &amp; Health Matrix
            </h3>
          </div>

          {/* Platform Tab Filters */}
          <div className='flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs font-mono'>
            {(['all', 'meta', 'google', 'amazon', 'tiktok'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-1 rounded-md transition-all uppercase',
                  activeTab === tab
                    ? 'bg-zinc-800 text-zinc-100 font-bold shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-300'
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
              targetRoas={camp.targetRoas}
              breakevenRoas={camp.breakevenRoas}
              healthScore={camp.healthScore}
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
