'use client';

import React, { useState } from 'react';
import { HistoricalPerformanceSummary, HistoricalCampaign } from '@/lib/strategy-engine/types';
import { SEED_HISTORICAL_CAMPAIGNS } from '@/lib/strategy-engine/historical-engine';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  IconHistory,
  IconTrophy,
  IconAlertTriangle,
  IconCheck,
  IconTrendingUp,
  IconTarget,
  IconSearch,
  IconCoin,
  IconShieldCheck
} from '@tabler/icons-react';

interface HistoricalIntelligenceViewProps {
  summary?: HistoricalPerformanceSummary;
}

export function HistoricalIntelligenceView({ summary }: HistoricalIntelligenceViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  const campaigns = SEED_HISTORICAL_CAMPAIGNS;

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.audience.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || c.platform.toLowerCase() === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const getPlatformBadge = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'google':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'meta':
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'amazon':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'tiktok':
        return 'text-pink-400 border-pink-500/30 bg-pink-500/10';
      default:
        return 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10';
    }
  };

  return (
    <div className='space-y-6 font-mono'>
      {/* 1. Header & High-Level KPIs */}
      <div className='flex items-center justify-between border-b border-border/80 pb-3 flex-wrap gap-2'>
        <div className='flex items-center gap-2.5'>
          <div className='p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'>
            <IconHistory className='size-5' />
          </div>
          <div>
            <h2 className='text-base font-bold text-foreground'>
              Historical Campaign Intelligence Layer
            </h2>
            <p className='text-xs text-muted-foreground'>
              Empirical Account Performance Baseline • 32 Audited Campaigns • No Generic AI Assumptions
            </p>
          </div>
        </div>

        <span className='text-xs px-2.5 py-1 rounded border border-border bg-muted/30 text-foreground font-bold'>
          Evidence Hierarchy: User Account History (Tier 1 Priority)
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
        <div className='rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs'>
          <span className='text-[10px] uppercase text-muted-foreground block'>Campaigns Audited</span>
          <span className='text-2xl font-bold text-foreground block mt-1'>
            {summary?.totalCampaignsAnalyzed || campaigns.length}
          </span>
          <span className='text-[10px] text-muted-foreground block mt-0.5'>Multi-channel telemetry</span>
        </div>

        <div className='rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs'>
          <span className='text-[10px] uppercase text-muted-foreground block'>Cumulative Spend</span>
          <span className='text-xl font-bold text-foreground block mt-1'>
            ₹{(summary?.totalSpend || 1354000).toLocaleString()}
          </span>
          <span className='text-[10px] text-muted-foreground block mt-0.5'>Past 12 months</span>
        </div>

        <div className='rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs'>
          <span className='text-[10px] uppercase text-muted-foreground block'>Cumulative Revenue</span>
          <span className='text-xl font-bold text-foreground block mt-1'>
            ₹{(summary?.totalRevenue || 4630000).toLocaleString()}
          </span>
          <span className='text-[10px] text-muted-foreground block mt-0.5'>Verified sales return</span>
        </div>

        <div className='rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs'>
          <span className='text-[10px] uppercase text-muted-foreground block'>Account Avg ROAS</span>
          <span className='text-2xl font-bold text-emerald-400 block mt-1'>
            {(summary?.averageRoas || 3.42).toFixed(2)}x
          </span>
          <span className='text-[10px] text-emerald-500 block mt-0.5'>Benchmark baseline</span>
        </div>

        <div className='rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs'>
          <span className='text-[10px] uppercase text-muted-foreground block'>Account Avg CPA</span>
          <span className='text-2xl font-bold text-foreground block mt-1'>
            ₹{(summary?.averageCpa || 448).toLocaleString()}
          </span>
          <span className='text-[10px] text-muted-foreground block mt-0.5'>Per completed order</span>
        </div>
      </div>

      {/* Account Historical Champions */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
        <div className='p-3 rounded-xl border border-border/60 bg-muted/10'>
          <span className='text-[10px] text-muted-foreground uppercase block'>Best Channel</span>
          <span className='text-sm font-bold text-emerald-400 block mt-0.5'>
            {summary?.bestPlatform || 'Google (Search & Shopping)'}
          </span>
          <span className='text-[11px] text-muted-foreground block mt-1'>4.62x Avg ROAS • ₹412 CPA</span>
        </div>

        <div className='p-3 rounded-xl border border-border/60 bg-muted/10'>
          <span className='text-[10px] text-muted-foreground uppercase block'>Best Audience Cohort</span>
          <span className='text-sm font-bold text-cyan-400 block mt-0.5'>
            {summary?.bestAudience || '18-35 High-Intent Fitness & Runners'}
          </span>
          <span className='text-[11px] text-muted-foreground block mt-1'>Highest repeat purchase rate</span>
        </div>

        <div className='p-3 rounded-xl border border-border/60 bg-muted/10'>
          <span className='text-[10px] text-muted-foreground uppercase block'>Top Creative Angle</span>
          <span className='text-sm font-bold text-foreground block mt-0.5'>
            {summary?.bestCreative || 'Problem → Solution & Dynamic Carousel'}
          </span>
          <span className='text-[11px] text-muted-foreground block mt-1'>+24% CTR lift over static</span>
        </div>

        <div className='p-3 rounded-xl border border-border/60 bg-muted/10'>
          <span className='text-[10px] text-muted-foreground uppercase block'>Top Geography</span>
          <span className='text-sm font-bold text-foreground block mt-0.5'>
            {summary?.bestLocation || 'Top 8 Metros (Delhi, Mumbai, BLR)'}
          </span>
          <span className='text-[11px] text-muted-foreground block mt-1'>71% of total transaction volume</span>
        </div>
      </div>

      {/* 2. VERIFIED WINNING PATTERNS */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2 border-b border-border/60 pb-2'>
          <IconTrophy className='size-5 text-amber-400' />
          <h3 className='text-sm font-bold text-foreground uppercase tracking-tight'>
            Verified Account Winning Patterns (High Confidence)
          </h3>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {(summary?.winningPatterns || []).map((win) => (
            <div
              key={win.id}
              className='rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2.5 shadow-2xs'
            >
              <div className='flex items-center justify-between'>
                <span className='text-xs font-bold text-emerald-400'>{win.platform}</span>
                <span className='text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-bold'>
                  {win.confidence} CONFIDENCE
                </span>
              </div>

              <div className='text-xs space-y-1'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Audience:</span>
                  <span className='font-bold text-foreground text-right'>{win.audience}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Avg ROAS:</span>
                  <span className='font-bold text-emerald-400'>{win.averageRoas.toFixed(2)}x</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Avg CPA:</span>
                  <span className='font-bold text-foreground'>₹{win.averageCpa.toLocaleString()}</span>
                </div>
              </div>

              <p className='text-[11px] text-muted-foreground border-t border-emerald-500/20 pt-2 leading-relaxed'>
                <span className='font-bold text-foreground'>Proof: </span>
                {win.evidenceSummary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. VERIFIED FAILURE PATTERNS */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2 border-b border-border/60 pb-2'>
          <IconAlertTriangle className='size-5 text-rose-400' />
          <h3 className='text-sm font-bold text-foreground uppercase tracking-tight'>
            Verified Account Failure Patterns (Guardrail Thresholds)
          </h3>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {(summary?.failurePatterns || []).map((fail) => (
            <div
              key={fail.id}
              className='rounded-xl border border-rose-500/40 bg-rose-500/5 p-4 space-y-3 shadow-2xs'
            >
              <div className='flex items-center justify-between'>
                <span className='text-xs font-bold text-rose-400'>{fail.platform} Failure Pattern</span>
                <span className='text-[10px] px-2 py-0.5 rounded border border-rose-500/40 bg-rose-500/20 text-rose-300 font-bold'>
                  Threshold: &gt; ₹{fail.budgetThreshold.toLocaleString()}
                </span>
              </div>

              <p className='text-xs text-foreground font-semibold'>
                {fail.detectedIssue}
              </p>

              <div className='rounded-lg bg-black/40 p-2.5 border border-rose-500/20 space-y-1 text-[11px]'>
                <span className='text-rose-300 font-bold block'>Identified Root Causes:</span>
                {fail.structuredReasons.map((r, rIdx) => (
                  <p key={rIdx} className='text-muted-foreground flex items-start gap-1.5'>
                    <span className='text-rose-400'>✕</span>
                    <span>{r}</span>
                  </p>
                ))}
              </div>

              <div className='rounded-lg bg-amber-500/10 p-2.5 border border-amber-500/30 text-[11px] text-amber-300'>
                <span className='font-bold'>System Guardrail Rule: </span>
                {fail.advice}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. HISTORICAL CAMPAIGNS LOG (32 PAST CAMPAIGNS) */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between border-b border-border/60 pb-2 flex-wrap gap-2'>
          <h3 className='text-sm font-bold text-foreground uppercase tracking-tight'>
            Audited Historical Campaigns ({filteredCampaigns.length} Recorded)
          </h3>

          <div className='flex items-center gap-2'>
            <div className='relative w-48'>
              <IconSearch className='size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search campaigns...'
                className='h-8 pl-8 text-xs font-mono'
              />
            </div>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className='h-8 text-xs font-mono rounded-md border border-border bg-card px-2 text-foreground'
            >
              <option value='all'>All Channels</option>
              <option value='google'>Google</option>
              <option value='meta'>Meta</option>
              <option value='amazon'>Amazon</option>
              <option value='tiktok'>TikTok</option>
            </select>
          </div>
        </div>

        <div className='rounded-xl border border-border/80 overflow-x-auto bg-card'>
          <table className='w-full text-left text-xs'>
            <thead className='bg-muted/40 border-b border-border text-[10px] uppercase text-muted-foreground'>
              <tr>
                <th className='p-3'>Campaign Name</th>
                <th className='p-3'>Platform</th>
                <th className='p-3'>Spend</th>
                <th className='p-3'>Clicks / CTR</th>
                <th className='p-3'>Orders</th>
                <th className='p-3'>CPA</th>
                <th className='p-3'>Revenue</th>
                <th className='p-3'>ROAS</th>
                <th className='p-3'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {filteredCampaigns.map((camp) => (
                <tr key={camp.id} className='hover:bg-muted/20 transition-colors'>
                  <td className='p-3'>
                    <span className='font-bold text-foreground block'>{camp.name}</span>
                    <span className='text-[10px] text-muted-foreground'>{camp.audience} • {camp.location}</span>
                  </td>
                  <td className='p-3'>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getPlatformBadge(camp.platform)}`}>
                      {camp.platform}
                    </span>
                  </td>
                  <td className='p-3 font-semibold'>₹{camp.spend.toLocaleString()}</td>
                  <td className='p-3 text-muted-foreground'>
                    {camp.clicks.toLocaleString()} <span className='text-[10px]'>({(camp.ctr * 100).toFixed(2)}%)</span>
                  </td>
                  <td className='p-3 font-semibold text-foreground'>{camp.conversions}</td>
                  <td className='p-3 font-semibold'>₹{camp.cpa.toLocaleString()}</td>
                  <td className='p-3 font-semibold text-foreground'>₹{camp.revenue.toLocaleString()}</td>
                  <td className='p-3'>
                    <span className={`font-bold ${camp.roas >= 3.2 ? 'text-emerald-400' : camp.roas >= 2.0 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {camp.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className='p-3 text-[10px] text-muted-foreground'>{camp.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
