'use client';

import React, { useState } from 'react';
import {
  IconCoins,
  IconUsers,
  IconVideo,
  IconLayoutGrid,
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconGauge,
  IconShieldCheck
} from '@tabler/icons-react';
import type { AdPlaygroundConstraints } from '../../types/ad-playground-types';
import { cn } from '@/lib/utils';

interface PlaygroundMinimalControlsProps {
  constraints: AdPlaygroundConstraints;
  onChangeConstraints: (constraints: AdPlaygroundConstraints) => void;
  onRunExperiment: () => void;
  isCalculating: boolean;
}

export function PlaygroundMinimalControls({
  constraints,
  onChangeConstraints,
  onRunExperiment,
  isCalculating
}: PlaygroundMinimalControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const dailyBudget = constraints.daily_budget ?? (constraints.total_budget ? Math.round(constraints.total_budget / constraints.duration_days) : 2000);

  const handleBudgetChange = (newDaily: number) => {
    onChangeConstraints({
      ...constraints,
      daily_budget: newDaily,
      total_budget: newDaily * constraints.duration_days
    });
  };

  const audienceOptions: Array<{ id: NonNullable<AdPlaygroundConstraints['audience']>; label: string; desc: string }> = [
    { id: 'broad', label: 'Broad (Advantage+)', desc: 'AI-directed open demographic exploration' },
    { id: 'lookalike', label: 'Lookalike (1-2%)', desc: '1% lookalike of high-LTV sneaker buyers' },
    { id: 'retargeting', label: 'Retargeting / In-Market', desc: 'Cart abandoners & 30-day viewers' },
    { id: 'search', label: 'Exact Search Intent', desc: 'High-intent exact queries & keyword matching' }
  ];

  const creativeOptions: Array<{ id: NonNullable<AdPlaygroundConstraints['creative']>; label: string; desc: string }> = [
    { id: 'ugc_video', label: 'UGC Video', desc: 'Authentic creator styling clips & unboxings' },
    { id: 'static_image', label: 'Static Image Carousel', desc: 'High-contrast editorial product packshots' },
    { id: 'spark_video', label: 'Spark Native Video', desc: 'Boosted native viral creator posts' },
    { id: 'product_feed', label: 'Product Feed Showcase', desc: 'Dynamic merchant center catalog cards' }
  ];

  const placementOptions: Array<{ id: NonNullable<AdPlaygroundConstraints['placement']>; label: string; desc: string }> = [
    { id: 'auto', label: 'Auto (Advantage+)', desc: 'Multi-channel algorithmic allocation' },
    { id: 'reels', label: 'Reels / Shorts', desc: 'Vertical immersive video placements' },
    { id: 'feed', label: 'Feed Only', desc: 'In-stream timeline shopping units' },
    { id: 'search', label: 'Search & Marketplace Grid', desc: 'Google Search & Amazon Sponsored listings' }
  ];

  const durationOptions = [7, 14, 30];

  const allPlatforms = [
    { id: 'meta', label: 'Meta', color: '#3b82f6' },
    { id: 'google', label: 'Google', color: '#10b981' },
    { id: 'amazon', label: 'Amazon', color: '#f59e0b' },
    { id: 'tiktok', label: 'TikTok', color: '#ec4899' }
  ];

  const togglePlatform = (pId: string) => {
    const current = constraints.platforms || ['meta', 'google', 'amazon', 'tiktok'];
    let updated: string[];
    if (current.includes(pId)) {
      if (current.length === 1) return;
      updated = current.filter((x) => x !== pId);
    } else {
      updated = [...current, pId];
    }
    onChangeConstraints({ ...constraints, platforms: updated });
  };

  return (
    <div className='rounded-xl border border-border/80 bg-card p-4 space-y-4 font-mono'>
      <div className='flex items-center justify-between pb-2 border-b border-border/60'>
        <span className='text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-1.5'>
          <IconCoins className='size-3.5 text-cyan-400' />
          CAMPAIGN CONFIGURATION
        </span>
        <span className='text-[10px] text-muted-foreground font-mono'>
          Live what-if controls
        </span>
      </div>

      {/* 1. Daily Budget Slider (Centerpiece interaction) */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
            Daily Budget
          </span>
          <div className='flex items-baseline gap-1.5'>
            <span className='text-base font-bold text-cyan-400 tracking-tight'>
              ₹{dailyBudget.toLocaleString()}
            </span>
            <span className='text-[10px] text-muted-foreground'>/ day</span>
          </div>
        </div>

        <input
          type='range'
          min={500}
          max={10000}
          step={250}
          value={dailyBudget}
          onChange={(e) => handleBudgetChange(Number(e.target.value))}
          className='w-full h-1.5 bg-muted/60 rounded-lg appearance-none cursor-pointer accent-cyan-400'
        />

        <div className='flex justify-between text-[10px] text-muted-foreground'>
          <span>₹500/day</span>
          <span>₹5,000</span>
          <span>₹10,000/day</span>
        </div>
      </div>

      {/* 2. Grid of Core Variables */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
        {/* Audience */}
        <div className='space-y-1.5'>
          <label className='text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5'>
            <IconUsers className='size-3 text-blue-400' />
            Audience
          </label>
          <select
            value={constraints.audience || 'broad'}
            onChange={(e) => onChangeConstraints({ ...constraints, audience: e.target.value as any })}
            className='w-full px-2.5 py-1.5 rounded-lg border border-border/80 bg-background text-xs font-mono text-foreground focus:outline-none focus:border-cyan-500 cursor-pointer'
          >
            {audienceOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Creative */}
        <div className='space-y-1.5'>
          <label className='text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5'>
            <IconVideo className='size-3 text-emerald-400' />
            Creative Format
          </label>
          <select
            value={constraints.creative || 'ugc_video'}
            onChange={(e) => onChangeConstraints({ ...constraints, creative: e.target.value as any })}
            className='w-full px-2.5 py-1.5 rounded-lg border border-border/80 bg-background text-xs font-mono text-foreground focus:outline-none focus:border-cyan-500 cursor-pointer'
          >
            {creativeOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Placement */}
        <div className='space-y-1.5'>
          <label className='text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5'>
            <IconLayoutGrid className='size-3 text-purple-400' />
            Placement
          </label>
          <select
            value={constraints.placement || 'auto'}
            onChange={(e) => onChangeConstraints({ ...constraints, placement: e.target.value as any })}
            className='w-full px-2.5 py-1.5 rounded-lg border border-border/80 bg-background text-xs font-mono text-foreground focus:outline-none focus:border-cyan-500 cursor-pointer'
          >
            {placementOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div className='space-y-1.5'>
          <label className='text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5'>
            <IconCalendar className='size-3 text-amber-400' />
            Horizon
          </label>
          <select
            value={constraints.duration_days}
            onChange={(e) => onChangeConstraints({ ...constraints, duration_days: Number(e.target.value) })}
            className='w-full px-2.5 py-1.5 rounded-lg border border-border/80 bg-background text-xs font-mono text-foreground focus:outline-none focus:border-cyan-500 cursor-pointer'
          >
            {durationOptions.map((days) => (
              <option key={days} value={days}>
                {days} Days (₹{(dailyBudget * days).toLocaleString()} total)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Advanced Parameters Toggle */}
      <div className='pt-1'>
        <button
          type='button'
          onClick={() => setShowAdvanced(!showAdvanced)}
          className='flex items-center justify-between w-full text-[11px] text-muted-foreground hover:text-foreground py-1 border-t border-border/60 transition-colors'
        >
          <span className='font-bold uppercase tracking-wider flex items-center gap-1'>
            <IconShieldCheck className='size-3.5 text-cyan-400' />
            Advanced Guardrails &amp; Channels
          </span>
          {showAdvanced ? (
            <IconChevronUp className='size-3.5' />
          ) : (
            <IconChevronDown className='size-3.5' />
          )}
        </button>

        {showAdvanced && (
          <div className='mt-2.5 space-y-3 pt-2 text-xs border-t border-border/40'>
            {/* Target ROAS Floor */}
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <span className='text-[11px] text-muted-foreground flex items-center gap-1'>
                  <IconGauge className='size-3 text-emerald-400' />
                  Target ROAS Floor
                </span>
                <span className='font-bold text-foreground'>
                  {constraints.target_roas_floor.toFixed(1)}x
                </span>
              </div>
              <input
                type='range'
                min={1.2}
                max={4.5}
                step={0.1}
                value={constraints.target_roas_floor}
                onChange={(e) => onChangeConstraints({ ...constraints, target_roas_floor: Number(e.target.value) })}
                className='w-full h-1 bg-muted/60 rounded-lg appearance-none cursor-pointer accent-emerald-400'
              />
            </div>

            {/* Allowed Channel Platforms */}
            <div className='space-y-1.5'>
              <span className='text-[10px] text-muted-foreground uppercase font-semibold'>
                Allowed Platforms ({constraints.platforms?.length ?? 4}/4)
              </span>
              <div className='grid grid-cols-4 gap-1.5'>
                {allPlatforms.map((p) => {
                  const isEnabled = (constraints.platforms ?? ['meta', 'google', 'amazon', 'tiktok']).includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type='button'
                      onClick={() => togglePlatform(p.id)}
                      className={cn(
                        'py-1 rounded text-[10px] font-bold border transition-all',
                        isEnabled
                          ? 'border-cyan-500/60 bg-cyan-950/20 text-cyan-400'
                          : 'border-border/60 bg-muted/20 text-muted-foreground opacity-50'
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
