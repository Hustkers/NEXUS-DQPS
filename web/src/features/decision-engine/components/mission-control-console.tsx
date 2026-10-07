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
import initialEngineState from '@/data/nexus-engine-state.json';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useChannel, AdChannel } from '@/context/channel-context';

export function MissionControlConsole() {
  const [state, setState] = useState(initialEngineState);
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
              ${(state.telemetry.totalSpend30d / 1000).toFixed(1)}k
            </span>
            <span className='text-xs font-mono text-muted-foreground'>
              Budget: ${(state.telemetry.totalManagedBudget / 1000).toFixed(0)}k
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
              ${(state.telemetry.totalMargin30d / 1000).toFixed(1)}k
            </span>
            <span className='text-xs font-mono text-muted-foreground'>
              Rev: ${(state.telemetry.totalRevenue30d / 1000).toFixed(1)}k
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
              +${(state.telemetry.projectedMarginUplift / 1000).toFixed(1)}k
            </span>
            <span className='text-xs font-mono text-muted-foreground'>
              Reallocated: ${(state.telemetry.reallocationCapitalMoved / 1000).toFixed(1)}k
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
            />
          ))}
        </div>
      </div>

      {/* 8. Closed-Loop Decision Ledger */}
      <DecisionLedgerTable entries={state.ledger} />
    </div>
  );
}
