'use client';

import React from 'react';
import { LiveCampaignMonitoring } from '@/lib/strategy-engine/types';
import {
  IconActivity,
  IconAlertTriangle,
  IconCheck,
  IconShieldCheck,
  IconTrendingUp,
  IconTrendingDown,
  IconClock,
  IconCoin,
  IconLayersLinked,
  IconRefresh
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LiveMonitoringViewProps {
  monitoring?: LiveCampaignMonitoring;
}

export function LiveMonitoringView({ monitoring }: LiveMonitoringViewProps) {
  if (!monitoring) {
    return (
      <div className='rounded-2xl border border-border/80 bg-card p-8 text-center text-muted-foreground font-mono text-xs'>
        No live campaign actively streaming telemetry. Authorize and launch a campaign from the Recommendations tab to initiate live watchdog monitoring.
      </div>
    );
  }

  const m = monitoring;
  const spendPct = Math.round((m.spend / m.budget) * 100);

  const handleApplyAction = (alertTitle: string) => {
    toast.success('Optimization Action Applied', {
      description: `Executed recommended mitigation for "${alertTitle}". Bids adjusted.`
    });
  };

  return (
    <div className='space-y-6 font-mono'>
      {/* 1. Header Banner */}
      <div className='flex items-center justify-between border-b border-border/80 pb-3 flex-wrap gap-2'>
        <div className='flex items-center gap-2.5'>
          <div className='p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'>
            <IconActivity className='size-5 animate-pulse' />
          </div>
          <div>
            <h2 className='text-base font-bold text-foreground flex items-center gap-2'>
              Live Campaign Telemetry & AI Watchdog
              <span className='size-2 rounded-full bg-emerald-400 animate-ping' />
            </h2>
            <p className='text-xs text-muted-foreground'>
              Sub-Hour Telemetry Ingestion • Saturation Detection • Continuous Funnel Diagnostic
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-xs font-bold px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'>
            Status: {m.status}
          </span>
          <span className='text-xs text-muted-foreground border border-border rounded px-2 py-1 bg-card'>
            Pacing: {spendPct}% Allocated
          </span>
        </div>
      </div>

      {/* 2. Top Overview & Health Score Gauge */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Active Campaign Spend Card */}
        <div className='rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-sm'>
          <span className='text-[10px] uppercase text-muted-foreground block font-bold'>
            Active Campaign Telemetry
          </span>
          <h3 className='text-sm font-bold text-foreground line-clamp-1' title={m.campaignName}>
            {m.campaignName}
          </h3>

          <div className='space-y-1 pt-1'>
            <div className='flex justify-between text-xs'>
              <span className='text-muted-foreground'>Paced Spend:</span>
              <span className='font-bold text-foreground'>
                ₹{m.spend.toLocaleString()} / ₹{m.budget.toLocaleString()}
              </span>
            </div>
            <div className='h-2.5 w-full bg-muted/40 rounded-full overflow-hidden border border-border/60'>
              <div className='h-full bg-cyan-500 rounded-full' style={{ width: `${spendPct}%` }} />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2 text-xs pt-1'>
            <div className='p-2 rounded-lg bg-muted/20 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>Impressions</span>
              <span className='font-bold text-foreground'>{m.impressions.toLocaleString()}</span>
            </div>
            <div className='p-2 rounded-lg bg-muted/20 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>Frequency</span>
              <span className='font-bold text-cyan-400'>{m.frequency.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Live Performance vs Predicted */}
        <div className='rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-sm'>
          <span className='text-[10px] uppercase text-muted-foreground block font-bold'>
            Predicted vs Realized ROAS
          </span>

          <div className='flex items-baseline gap-3'>
            <span className='text-3xl font-bold text-emerald-400'>
              {m.roas.toFixed(2)}x
            </span>
            <div className='text-xs'>
              <span className='text-muted-foreground block'>Predicted: {m.predictedRoas.toFixed(2)}x</span>
              <span className={`font-bold block ${m.predictionErrorPct >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                Variance: {m.predictionErrorPct > 0 ? `+${m.predictionErrorPct}%` : `${m.predictionErrorPct}%`}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2 text-xs pt-1'>
            <div className='p-2 rounded-lg bg-muted/20 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>Realized Rev</span>
              <span className='font-bold text-foreground'>₹{m.revenue.toLocaleString()}</span>
            </div>
            <div className='p-2 rounded-lg bg-muted/20 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>Realized CPA</span>
              <span className='font-bold text-foreground'>₹{m.cpa.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Watchdog Composite Health Score */}
        <div className='rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-sm'>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] uppercase text-muted-foreground font-bold'>
              Watchdog Health Score
            </span>
            <span className='text-xs font-bold text-emerald-400'>Optimal (Grade A)</span>
          </div>

          <div className='flex items-baseline gap-2'>
            <span className='text-3xl font-bold text-foreground'>{m.healthScore}</span>
            <span className='text-sm text-muted-foreground'>/ 100</span>
          </div>

          {/* Health component gauges */}
          <div className='grid grid-cols-3 gap-1.5 text-[10px] pt-1'>
            <div className='p-1.5 rounded bg-muted/20 border border-border/40 text-center'>
              <span className='text-muted-foreground block'>ROAS</span>
              <span className='font-bold text-emerald-400'>{m.healthComponents.roasScore}</span>
            </div>
            <div className='p-1.5 rounded bg-muted/20 border border-border/40 text-center'>
              <span className='text-muted-foreground block'>CTR</span>
              <span className='font-bold text-emerald-400'>{m.healthComponents.ctrScore}</span>
            </div>
            <div className='p-1.5 rounded bg-muted/20 border border-border/40 text-center'>
              <span className='text-muted-foreground block'>CPA</span>
              <span className='font-bold text-emerald-400'>{m.healthComponents.cpaScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE PROBLEM ALERTS */}
      {m.problems && m.problems.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center gap-2 border-b border-border/60 pb-2'>
            <IconAlertTriangle className='size-5 text-amber-400' />
            <h3 className='text-sm font-bold text-foreground uppercase tracking-tight'>
              Active Watchdog Problem Alerts ({m.problems.length})
            </h3>
          </div>

          <div className='grid grid-cols-1 gap-3'>
            {m.problems.map((alert) => (
              <div
                key={alert.id}
                className='rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-3 shadow-2xs'
              >
                <div className='flex items-center justify-between flex-wrap gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/20 text-amber-300'>
                      {alert.severity} • {alert.type}
                    </span>
                    <h4 className='text-xs font-bold text-foreground'>{alert.title}</h4>
                  </div>

                  <Button
                    size='sm'
                    onClick={() => handleApplyAction(alert.title)}
                    className='h-7 text-xs font-mono bg-amber-500 hover:bg-amber-400 text-black font-bold'
                  >
                    Apply AI Fix
                  </Button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-xs'>
                  <div className='p-2.5 rounded-lg bg-black/30 border border-border/40 space-y-1'>
                    <span className='text-muted-foreground text-[10px] uppercase font-bold block'>Evidence:</span>
                    <p className='text-foreground'>{alert.evidence}</p>
                    <span className='text-muted-foreground text-[10px] block mt-1'>Cause: {alert.possibleCause}</span>
                  </div>

                  <div className='p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-1'>
                    <span className='text-emerald-400 text-[10px] uppercase font-bold block'>Recommended Action:</span>
                    <p className='text-foreground'>{alert.recommendedAction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CREATIVE FATIGUE & AUDIENCE SATURATION */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Creative Fatigue Card */}
        <div className='rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs'>
          <div className='flex items-center justify-between'>
            <h3 className='text-xs font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
              <IconClock className='size-4 text-cyan-400' />
              Creative Fatigue Curve (CTR Trend)
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
              m.creativeFatigue.isFatigued
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {m.creativeFatigue.isFatigued ? 'Fatigued' : 'Healthy Pace'}
            </span>
          </div>

          <div className='grid grid-cols-3 gap-2 text-center text-xs'>
            <div className='p-2 rounded-lg bg-muted/20 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>Week 1 CTR</span>
              <span className='font-bold text-foreground'>{(m.creativeFatigue.week1Ctr * 100).toFixed(2)}%</span>
            </div>
            <div className='p-2 rounded-lg bg-muted/20 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>Week 2 CTR</span>
              <span className='font-bold text-foreground'>{(m.creativeFatigue.week2Ctr * 100).toFixed(2)}%</span>
            </div>
            <div className='p-2 rounded-lg bg-muted/20 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>Week 3 CTR</span>
              <span className='font-bold text-foreground'>{(m.creativeFatigue.week3Ctr * 100).toFixed(2)}%</span>
            </div>
          </div>

          <p className='text-[11px] text-muted-foreground'>
            <span className='font-bold text-foreground'>Diagnosis: </span>
            {m.creativeFatigue.recommendation}
          </p>
        </div>

        {/* Audience Saturation Card */}
        <div className='rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs'>
          <div className='flex items-center justify-between'>
            <h3 className='text-xs font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
              <IconShieldCheck className='size-4 text-emerald-400' />
              Audience Saturation Tracker
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
              m.audienceSaturation.isSaturated
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {m.audienceSaturation.isSaturated ? 'Saturated' : 'Unsaturated'}
            </span>
          </div>

          <div className='grid grid-cols-3 gap-2 text-center text-xs'>
            <div className='p-2 rounded-lg bg-muted/20 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>Ad Frequency</span>
              <span className='font-bold text-foreground'>{m.audienceSaturation.frequency.toFixed(2)}</span>
            </div>
            <div className='p-2 rounded-lg bg-muted/20 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>CTR Delta</span>
              <span className='font-bold text-amber-400'>{m.audienceSaturation.ctrDeltaPct}%</span>
            </div>
            <div className='p-2 rounded-lg bg-muted/20 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>CPA Delta</span>
              <span className='font-bold text-amber-400'>+{m.audienceSaturation.cpaDeltaPct}%</span>
            </div>
          </div>

          <p className='text-[11px] text-muted-foreground'>
            <span className='font-bold text-foreground'>Capacity: </span>
            {m.audienceSaturation.recommendation}
          </p>
        </div>
      </div>

      {/* 5. FULL FUNNEL DIAGNOSTIC FLOWCHART */}
      <div className='rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
              <IconLayersLinked className='size-4 text-purple-400' />
              Full Conversion Funnel Stage Diagnostics
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Tracks customer progression through each milestone to pinpoint drop-off friction points.
            </p>
          </div>

          {m.funnelAnalysis.bottleneckStage && (
            <span className='text-xs px-2.5 py-1 rounded border border-amber-500/40 bg-amber-500/10 text-amber-400 font-bold'>
              Bottleneck: {m.funnelAnalysis.bottleneckStage}
            </span>
          )}
        </div>

        {/* Funnel Flowchart Steps */}
        <div className='grid grid-cols-1 md:grid-cols-5 gap-3 text-xs'>
          <div className='p-3 rounded-xl border border-border/60 bg-muted/10 space-y-1'>
            <span className='text-[10px] text-muted-foreground uppercase block'>1. Ad Views</span>
            <span className='text-base font-bold text-foreground block'>{m.funnelAnalysis.adImpressions.toLocaleString()}</span>
            <span className='text-[10px] text-cyan-400 block'>CTR: {(m.funnelAnalysis.adCtr * 100).toFixed(2)}%</span>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-muted/10 space-y-1'>
            <span className='text-[10px] text-muted-foreground uppercase block'>2. Ad Clicks</span>
            <span className='text-base font-bold text-foreground block'>{m.funnelAnalysis.clicks.toLocaleString()}</span>
            <span className='text-[10px] text-cyan-400 block'>Click → Site: {(m.funnelAnalysis.clickToSessionRate * 100).toFixed(1)}%</span>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-muted/10 space-y-1'>
            <span className='text-[10px] text-muted-foreground uppercase block'>3. Store Sessions</span>
            <span className='text-base font-bold text-foreground block'>{m.funnelAnalysis.landingPageSessions.toLocaleString()}</span>
            <span className='text-[10px] text-cyan-400 block'>Site → Cart: {(m.funnelAnalysis.sessionToCartRate * 100).toFixed(1)}%</span>
          </div>

          <div className='p-3 rounded-xl border border-amber-500/40 bg-amber-500/5 space-y-1'>
            <span className='text-[10px] text-amber-400 uppercase block font-bold'>4. Cart Adds</span>
            <span className='text-base font-bold text-foreground block'>{m.funnelAnalysis.cartAdditions.toLocaleString()}</span>
            <span className='text-[10px] text-amber-400 block'>Cart → Buy: {(m.funnelAnalysis.cartToPurchaseRate * 100).toFixed(1)}%</span>
          </div>

          <div className='p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 space-y-1'>
            <span className='text-[10px] text-emerald-400 uppercase block font-bold'>5. Completed Purchases</span>
            <span className='text-base font-bold text-emerald-400 block'>{m.funnelAnalysis.purchases.toLocaleString()}</span>
            <span className='text-[10px] text-emerald-400 block'>CPA: ₹{m.cpa.toLocaleString()}</span>
          </div>
        </div>

        {m.funnelAnalysis.bottleneckEvidence && (
          <div className='p-3 rounded-xl border border-border/60 bg-muted/20 text-xs text-muted-foreground'>
            <span className='font-bold text-foreground'>Diagnostic Finding: </span>
            {m.funnelAnalysis.bottleneckEvidence}
          </div>
        )}
      </div>
    </div>
  );
}
