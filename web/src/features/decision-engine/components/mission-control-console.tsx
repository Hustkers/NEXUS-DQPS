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
import initialEngineState from '@/data/nexus-engine-state.json';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function MissionControlConsole() {
  const [state, setState] = useState(initialEngineState);
  const [activeTab, setActiveTab] = useState<string>('all');

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
            />
          ))}
        </div>
      </div>

      {/* 8. Closed-Loop Decision Ledger */}
      <DecisionLedgerTable entries={state.ledger} />
    </div>
  );
}
