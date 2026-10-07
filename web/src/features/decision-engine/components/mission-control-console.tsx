'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { AnomalyCard } from './anomaly-card';
import { ReallocationFeed } from './reallocation-feed';
import { ScenarioController, ScenarioDefinition } from './scenario-controller';
import { RoasGauge } from './roas-gauge';
import { PlatformBreakdownChart } from './platform-breakdown-chart';
import { DecisionLedgerTable } from './decision-ledger-table';
import { CausalDagVisualizer } from './causal-dag-visualizer';
import { RcaWaterfallChart } from './rca-waterfall-chart';
import { ScenarioSandbox } from './scenario-sandbox';
import { VoiceBriefingAgent } from '@/features/voice/voice-briefing-agent';
import { USE_MOCKS, FASTAPI_BASE_URL, approveDirective } from '@/lib/api-adapter';
import initialEngineState from '@/data/nexus-engine-state.json';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useChannel, AdChannel } from '@/context/channel-context';

export function MissionControlConsole() {
  const [state, setState] = useState(initialEngineState);
  const [liveMode, setLiveMode] = useState(!USE_MOCKS);
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

  const handleVoiceAuthorize = async (planId: string) => {
    try {
      const receipt = await approveDirective(planId, 'VOICE_BRIEFING_AUTHORIZED');
      setState((prev) => {
        const newLedgerItem = {
          id: `ledg-voice-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          decision: `Voice-Authorized: Throttled stocked-out Meta Hero SKU -> $0/day; Scaled Google Search -> +$800/day`,
          expectedMargin: 2450.0,
          realizedMargin: 2390.0,
          variancePct: -2.4,
          accuracyPct: 97.6,
          confidence: 0.98,
          status: 'executed',
          feedback: 'Voice token authenticated (ElevenLabs HITL)'
        };
        return {
          ...prev,
          ledger: [newLedgerItem, ...prev.ledger],
          telemetry: {
            ...prev.telemetry,
            activeAnomaliesCount: Math.max(0, prev.telemetry.activeAnomaliesCount - 1),
            projectedMarginUplift: prev.telemetry.projectedMarginUplift + 1148
          }
        };
      });
      toast.success('Directive Executed via Voice Authorization', {
        description: `Plan ${planId} signed. Atomic API budget mutate dispatched.`
      });
    } catch (e: any) {
      toast.error('Voice Authorization Failed', { description: e.message });
    }
  };

  const filteredCampaigns = state.campaigns.filter((c: any) =>
    activeTab === 'all' ? true : c.platform === activeTab
  );

  return (
    <div className='relative flex flex-1 flex-col gap-8 p-5 md:p-8 bg-[#08090c] text-zinc-100 min-h-screen selection:bg-zinc-800 selection:text-zinc-200'>
      {/* Background ambient micro-glow */}
      <div
        className='pointer-events-none fixed inset-0 opacity-[0.03]'
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.8) 0%, transparent 60%)'
        }}
        aria-hidden='true'
      />

      {/* 1. Header & Live Telemetry with Mock/Live Adapter Toggle */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-5'>
        <div>
          <div className='flex items-center gap-2.5'>
            <span className='size-2 rounded-full bg-emerald-400 animate-pulse' />
            <h1 className='text-xl font-bold font-mono tracking-tight text-zinc-100'>
              NEXUS D2C
            </h1>
            <span className='text-zinc-700 font-mono text-sm'>/</span>
            <span className='text-sm font-mono text-zinc-400'>
              Autonomous Advertising Intelligence &amp; Decision Engine
            </span>
          </div>
          <p className='text-xs text-zinc-500 font-mono mt-1'>
            DuckDB Columnar Store • Analytical SLSQP Optimizer • Dual-Knapsack Bandits • Floor ROAS 1.80x
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-3 text-xs font-mono'>
          {/* Live vs Mock Data Mode Badge Toggle */}
          <button
            onClick={() => {
              setLiveMode(!liveMode);
              toast.info(`Switched to ${!liveMode ? 'Live Backend (FastAPI)' : 'Deterministic Mock Mode'}`);
            }}
            className={cn(
              'flex items-center gap-2 px-2.5 py-1 rounded-md border text-[11px] transition-colors',
              liveMode
                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400'
            )}
            title="Click to toggle between live backend API and deterministic mock replay"
          >
            <span className={cn('size-1.5 rounded-full', liveMode ? 'bg-emerald-400' : 'bg-amber-400')} />
            <span>{liveMode ? 'API: LIVE FASTAPI (8000)' : 'API: DETERMINISTIC MOCKS'}</span>
          </button>

          <div className='flex items-center gap-2 text-zinc-400 bg-zinc-900/50 px-2.5 py-1 rounded-md border border-zinc-800/80'>
            <span className='size-1.5 rounded-full bg-emerald-400' />
            <span>Cycle {state.metadata.cycleId}</span>
          </div>

          <span className='text-zinc-500 hidden sm:block text-[11px] font-mono'>
            SLSQP Convex Optimization
          </span>
        </div>
      </div>

      {/* 2. Voice HITL Briefing Agent Bar */}
      <VoiceBriefingAgent
        onAuthorizePlan={handleVoiceAuthorize}
        activeDirectiveId="dir_meta_hero_shoe"
      />

      {/* 3. Executive Overview KPI Banner (Blended ROAS, POAS, MER, 24h Spend, At-Risk Out-of-Stock SKUs) */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5'>
        {/* Blended ROAS */}
        <Card className='border-zinc-800/60 bg-zinc-950/40 p-5 rounded-xl shadow-none hover:border-zinc-700/60 transition-colors'>
          <div className='flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider'>
            <span>Blended ROAS</span>
            <span className={cn('font-semibold text-[11px]', hasCriticalAnomaly ? 'text-rose-400' : 'text-emerald-400')}>
              {state.telemetry.roasDelta30d}
            </span>
          </div>
          <div className='mt-2.5 flex items-baseline justify-between'>
            <span className='text-2xl font-bold font-mono tracking-tight text-zinc-100'>
              {state.telemetry.blendedRoas30d.toFixed(2)}x
            </span>
            <span className='text-xs font-mono text-zinc-500'>
              Target: {state.telemetry.targetRoas.toFixed(2)}x
            </span>
          </div>
          <div className='mt-3 h-0.5 w-full bg-zinc-900 rounded-full overflow-hidden'>
            <div
              className={cn('h-full rounded-full', hasCriticalAnomaly ? 'bg-rose-500' : 'bg-emerald-400')}
              style={{ width: `${Math.min(100, (state.telemetry.blendedRoas30d / state.telemetry.targetRoas) * 100)}%` }}
            />
          </div>
        </Card>

        {/* POAS (Profit on Ad Spend) */}
        <Card className='border-zinc-800/60 bg-zinc-950/40 p-5 rounded-xl shadow-none hover:border-zinc-700/60 transition-colors'>
          <div className='flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider'>
            <span>POAS (Profit/Ad Spend)</span>
            <span className='text-emerald-400 text-[11px] font-semibold'>
              {hasCriticalAnomaly ? '2.05x (-30%)' : '2.92x'}
            </span>
          </div>
          <div className='mt-2.5 flex items-baseline justify-between'>
            <span className='text-2xl font-bold font-mono tracking-tight text-zinc-100'>
              {hasCriticalAnomaly ? '2.05x' : '2.92x'}
            </span>
            <span className='text-xs font-mono text-zinc-500'>
              Breakeven: 1.00x
            </span>
          </div>
          <div className='mt-3 h-0.5 w-full bg-zinc-900 rounded-full overflow-hidden'>
            <div className='h-full bg-emerald-400 rounded-full' style={{ width: '73%' }} />
          </div>
        </Card>

        {/* MER (Marketing Efficiency Ratio: Rev / Ad Spend) */}
        <Card className='border-zinc-800/60 bg-zinc-950/40 p-5 rounded-xl shadow-none hover:border-zinc-700/60 transition-colors'>
          <div className='flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider'>
            <span>Portfolio MER</span>
            <span className='text-cyan-400 text-[11px] font-semibold'>
              {hasCriticalAnomaly ? '3.65x (-28%)' : '5.12x'}
            </span>
          </div>
          <div className='mt-2.5 flex items-baseline justify-between'>
            <span className='text-2xl font-bold font-mono tracking-tight text-zinc-100'>
              {hasCriticalAnomaly ? '3.65x' : '5.12x'}
            </span>
            <span className='text-xs font-mono text-zinc-500'>
              Min: 3.50x
            </span>
          </div>
          <div className='mt-3 h-0.5 w-full bg-zinc-900 rounded-full overflow-hidden'>
            <div className='h-full bg-cyan-400 rounded-full' style={{ width: '85%' }} />
          </div>
        </Card>

        {/* 24H Spend */}
        <Card className='border-zinc-800/60 bg-zinc-950/40 p-5 rounded-xl shadow-none hover:border-zinc-700/60 transition-colors'>
          <div className='flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider'>
            <span>24H Ad Spend</span>
            <span className='text-zinc-500 text-[11px] font-mono'>Across 3 Platforms</span>
          </div>
          <div className='mt-2.5 flex items-baseline justify-between'>
            <span className='text-2xl font-bold font-mono tracking-tight text-zinc-100'>
              $18,450
            </span>
            <span className='text-xs font-mono text-zinc-500'>
              Cap: $25,000/d
            </span>
          </div>
          <div className='mt-3 h-0.5 w-full bg-zinc-900 rounded-full overflow-hidden'>
            <div className='h-full bg-blue-400 rounded-full' style={{ width: '74%' }} />
          </div>
        </Card>

        {/* At-Risk Out-of-Stock SKUs */}
        <Card className='border-zinc-800/60 bg-zinc-950/40 p-5 rounded-xl shadow-none hover:border-zinc-700/60 transition-colors'>
          <div className='flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider'>
            <span>At-Risk Stockout SKUs</span>
            <span className={cn('text-[11px] font-mono font-bold', hasCriticalAnomaly ? 'text-rose-400 animate-pulse' : 'text-emerald-400')}>
              {hasCriticalAnomaly ? '1 SKU CRITICAL' : '0 SKUs'}
            </span>
          </div>
          <div className='mt-2.5 flex items-baseline justify-between'>
            <span className={cn('text-2xl font-bold font-mono tracking-tight', hasCriticalAnomaly ? 'text-rose-400' : 'text-zinc-100')}>
              {hasCriticalAnomaly ? '1' : '0'}
            </span>
            <span className='text-xs font-mono text-zinc-500'>
              {hasCriticalAnomaly ? 'Air Jordan / AF1' : '100% In Stock'}
            </span>
          </div>
          <div className='mt-3 h-0.5 w-full bg-zinc-900 rounded-full overflow-hidden'>
            <div
              className={cn('h-full rounded-full', hasCriticalAnomaly ? 'bg-rose-500' : 'bg-emerald-400')}
              style={{ width: hasCriticalAnomaly ? '100%' : '0%' }}
            />
          </div>
        </Card>
      </div>

      {/* 4. Scenario Controller (Operational Shock Simulator) */}
      <ScenarioController
        scenarios={state.scenarios}
        onTriggerScenario={handleTriggerScenario}
        onResetBaseline={handleResetBaseline}
      />

      {/* 5. Causal DAG Visualizer & RCA Waterfall Decomposition */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <CausalDagVisualizer activeAnomaly={hasCriticalAnomaly} />
        <RcaWaterfallChart
          totalLoss={hasCriticalAnomaly ? 3008.25 : 0}
          items={hasCriticalAnomaly ? undefined : [
            { driver: 'Baseline Equilibrium', category: 'Nominal Operations', dollarImpact: 0, percentageShare: 100, color: 'bg-emerald-500' }
          ]}
        />
      </div>

      {/* 6. Diagnostic Anomalies Feed */}
      <div className='space-y-3.5'>
        <div className='flex items-center justify-between border-b border-zinc-800/60 pb-2.5'>
          <div className='flex items-center gap-2'>
            <Icons.warning className='size-3.5 text-rose-400' />
            <h3 className='font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider'>
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

      {/* 9. Multi-Platform Financial Telemetry (Time-Series Trends & Share) */}
      <PlatformBreakdownChart
        platforms={state.platforms}
        dailyTrend={state.dailyTrend}
      />

      {/* 10. ROAS Gauges & Health Scoring Matrix */}
      <div className='space-y-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-5 shadow-none'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/60 pb-3'>
          <div className='flex items-center gap-2'>
            <Icons.trendingUp className='size-3.5 text-emerald-400' />
            <h3 className='font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider'>
              Real-Time Campaign Gauges &amp; Health Scoring
            </h3>
            <span className='text-xs font-mono text-zinc-500'>
              ({filteredCampaigns.length} campaigns)
            </span>
          </div>

          {/* Platform Tab Filters */}
          <div className='flex items-center gap-1 bg-zinc-900/60 p-1 rounded-lg border border-zinc-800/80 text-xs font-mono'>
            {(['all', 'amazon', 'google', 'meta'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-1 rounded-md transition-all uppercase text-[11px] font-mono tracking-wider active:scale-[0.98]',
                  activeTab === tab
                    ? 'bg-zinc-800 text-zinc-100 font-bold border border-zinc-700/60 shadow-none'
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
              targetRoas={camp.targetRoas || 3.2}
              breakevenRoas={camp.breakevenRoas || 1.8}
              healthScore={camp.healthScore}
              compact
            />
          ))}
        </div>
      </div>

      {/* 11. Closed-Loop Decision Ledger & Audit Trail */}
      <DecisionLedgerTable entries={state.ledger} />
    </div>
  );
}
