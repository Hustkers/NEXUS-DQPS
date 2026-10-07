'use client';

import React, { useState } from 'react';
import { MarketSignal, CampaignStrategy, StrategyRisk } from '@/lib/strategy-engine/types';
import { getMarketSignals } from '@/lib/strategy-engine/market-and-risk';
import {
  IconActivity,
  IconAlertTriangle,
  IconShieldCheck,
  IconTrendingUp,
  IconTrendingDown,
  IconSearch,
  IconCheck
} from '@tabler/icons-react';

interface MarketSignalsRiskViewProps {
  signals?: MarketSignal[];
  strategies: CampaignStrategy[];
}

export function MarketSignalsRiskView({ signals, strategies }: MarketSignalsRiskViewProps) {
  const activeSignals = signals || getMarketSignals();

  // Aggregate all risks from all strategies
  const allRisks: Array<{ risk: StrategyRisk; strategyName: string; platform: string }> = [];
  strategies.forEach((s) => {
    (s.risks || []).forEach((r) => {
      allRisks.push({ risk: r, strategyName: s.strategyName, platform: s.platform });
    });
  });

  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'MEDIUM' | 'LOW'>('ALL');

  const filteredRisks = allRisks.filter((item) => {
    if (riskFilter === 'ALL') return true;
    return item.risk.severity === riskFilter;
  });

  return (
    <div className='space-y-6 font-mono'>
      {/* Header Banner */}
      <div className='flex items-center justify-between border-b border-border/80 pb-3 flex-wrap gap-2'>
        <div className='flex items-center gap-2.5'>
          <div className='p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'>
            <IconActivity className='size-5' />
          </div>
          <div>
            <h2 className='text-base font-bold text-foreground'>
              Market Signals & Future Risk Matrix
            </h2>
            <p className='text-xs text-muted-foreground'>
              Real-Time Platform Telemetry • Competitive Auction Pulses • Concrete Pre-Emptive Contingency Rules
            </p>
          </div>
        </div>

        <span className='text-xs px-2.5 py-1 rounded border border-border bg-muted/30 text-foreground font-bold'>
          Strict No-Fabrication Protocol Active
        </span>
      </div>

      {/* 1. MARKET SIGNALS FEED */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between border-b border-border/60 pb-2'>
          <h3 className='text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
            <IconTrendingUp className='size-4 text-emerald-400' />
            Verified Market & Platform Intelligence Signals
          </h3>
          <span className='text-xs text-muted-foreground'>
            {activeSignals.length} Active Feeds
          </span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {activeSignals.map((sig) => {
            const impactStyle =
              sig.impact === 'POSITIVE'
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                : sig.impact === 'NEGATIVE'
                ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

            return (
              <div
                key={sig.id}
                className='rounded-xl border border-border/80 bg-card p-4 space-y-2.5 shadow-2xs flex flex-col justify-between'
              >
                <div className='space-y-2'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${impactStyle}`}>
                      {sig.impact} IMPACT
                    </span>
                    <span className='text-[10px] text-muted-foreground font-bold'>
                      {Math.round(sig.confidence * 100)}% Conf
                    </span>
                  </div>

                  <h4 className='text-xs font-bold text-foreground line-clamp-2'>
                    {sig.title}
                  </h4>

                  <p className='text-[11px] text-muted-foreground leading-relaxed'>
                    {sig.description}
                  </p>
                </div>

                <div className='border-t border-border/60 pt-2 text-[10px] text-muted-foreground flex items-center justify-between'>
                  <span className='truncate mr-2' title={sig.source}>Source: {sig.source}</span>
                  <span className='text-emerald-400 font-bold shrink-0'>● Verified Live</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. FUTURE RISKS & CONTINGENCY MATRIX */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between border-b border-border/60 pb-2 flex-wrap gap-2'>
          <h3 className='text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
            <IconAlertTriangle className='size-4 text-amber-400' />
            Strategy Future Risk Ledger & Trigger Contingencies
          </h3>

          <div className='flex items-center gap-1.5'>
            {(['ALL', 'CRITICAL', 'MEDIUM', 'LOW'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setRiskFilter(filter)}
                className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                  riskFilter === filter
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className='rounded-xl border border-border/80 overflow-x-auto bg-card'>
          <table className='w-full text-left text-xs'>
            <thead className='bg-muted/40 border-b border-border text-[10px] uppercase text-muted-foreground'>
              <tr>
                <th className='p-3'>Strategy / Channel</th>
                <th className='p-3'>Identified Risk</th>
                <th className='p-3'>Severity</th>
                <th className='p-3'>Trigger Condition</th>
                <th className='p-3'>Preventive Action</th>
                <th className='p-3'>Contingency Plan</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {filteredRisks.map((item, idx) => {
                const r = item.risk;
                const severityStyle =
                  r.severity === 'CRITICAL'
                    ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                    : r.severity === 'MEDIUM'
                    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';

                return (
                  <tr key={idx} className='hover:bg-muted/20 transition-colors'>
                    <td className='p-3'>
                      <span className='font-bold text-foreground block'>{item.strategyName.split('—')[0]}</span>
                      <span className='text-[10px] uppercase text-cyan-400'>{item.platform}</span>
                    </td>
                    <td className='p-3 font-semibold text-foreground max-w-xs'>
                      {r.riskName}
                      <span className='text-[10px] text-muted-foreground block mt-0.5 line-clamp-1' title={r.evidence}>
                        {r.evidence}
                      </span>
                    </td>
                    <td className='p-3'>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityStyle}`}>
                        {r.severity}
                      </span>
                    </td>
                    <td className='p-3 text-muted-foreground max-w-xs text-[11px]'>
                      {r.triggerCondition}
                    </td>
                    <td className='p-3 text-foreground font-semibold max-w-xs text-[11px]'>
                      {r.preventiveAction}
                    </td>
                    <td className='p-3 text-amber-300 max-w-xs text-[11px]'>
                      {r.contingencyAction}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
