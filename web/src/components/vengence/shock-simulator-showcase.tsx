'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CardSpotlight } from './card-spotlight';
import { GlowButton } from './glow-button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

const SCENARIOS = [
  {
    id: 'stockout',
    title: "Air Force 1 '07 Stockout Shock",
    tag: 'ERP Inventory Bleed',
    severity: 'CRITICAL',
    event: 'ERP warehouse inventory reaches 0 units on hero SKU 315122-001',
    traditionalOutcome: 'Ad platforms continue burning ₹2,200/day driving traffic to an empty product page.',
    autonomousAction: 'Instant Circuit Breaker kills spend in <15 mins. Capital redirected to Google PMax React Infinity (+3.6x ROAS).',
    savedWaste: '₹15,400 / week',
    speed: '< 15 mins',
    metricType: 'Spend Cut',
    delta: '-₹2,200/day'
  },
  {
    id: 'cpm-spike',
    title: 'Meta Sneaker Auction CPM Surge (+45%)',
    tag: 'Auction Inflation',
    severity: 'HIGH',
    event: 'Holiday competitive rush pushes Meta Advantage+ CPM from ₹9.50 to ₹14.20, dropping ROAS below 1.8x floor.',
    traditionalOutcome: 'Marketer notices 48 hours later after daily spend burns margin.',
    autonomousAction: 'Optimizer shifts ₹3,500/day into Amazon Sponsored Products & Google Shopping where margin elasticity is preserved.',
    savedWaste: '₹9,200 / week',
    speed: 'Real-time',
    metricType: 'Reallocated',
    delta: '₹3,500/day'
  },
  {
    id: 'creative-fatigue',
    title: 'TikTok UGC Creative Fatigue (-60% CTR)',
    tag: 'Creative Wear-Out',
    severity: 'MEDIUM',
    event: 'Hero TikTok video frequency exceeds 5.2. Hook rate collapses, CTR drops 60%, doubling CAC.',
    traditionalOutcome: 'Fatigued video continues eating 40% of TikTok ad budget.',
    autonomousAction: 'Auto-pauses exhausted ad set, triggers creative refresh alert, and reroutes spend to high-vitality Meta Reels.',
    savedWaste: '₹5,200 / week',
    speed: 'Autonomous',
    metricType: 'Protected',
    delta: '+31% CTR'
  },
  {
    id: 'price-undercut',
    title: 'Amazon Sneaker Price Undercut',
    tag: 'Competitor Shock',
    severity: 'MEDIUM',
    event: 'Rival seller launches 25% price drop on Amazon, depressing Nike Zoom Fly conversion from 4.8% to 2.8%.',
    traditionalOutcome: 'Amazon Sponsored spend continues bidding high for unprofitable conversions.',
    autonomousAction: 'Scipy convex optimizer re-solves: shifts capital to Nike Direct Brand Search where gross margin is 68%.',
    savedWaste: '₹6,800 / week',
    speed: '< 30 mins',
    metricType: 'Shifted',
    delta: '₹6,800/wk'
  }
];

export function ShockSimulatorShowcase() {
  const [selectedId, setSelectedId] = useState(SCENARIOS[0].id);
  const active = SCENARIOS.find((s) => s.id === selectedId) || SCENARIOS[0];

  return (
    <div className='w-full max-w-5xl mx-auto'>
      {/* Scenario Selection Tabs */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mb-4'>
        {SCENARIOS.map((s) => {
          const isSelected = s.id === selectedId;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                'text-left p-3 rounded-[6px] border transition-colors duration-150 cursor-pointer font-mono shadow-none',
                isSelected
                  ? 'bg-card border-foreground text-foreground shadow-sm'
                  : 'bg-muted/30 border-border hover:border-foreground/60 text-muted-foreground hover:text-foreground'
              )}
            >
              <div className='flex items-center justify-between mb-1'>
                <span className='text-[10px] uppercase font-medium tracking-wider text-muted-foreground'>
                  {s.tag}
                </span>
                <span
                  className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded-[2px] font-bold uppercase font-mono',
                    s.severity === 'CRITICAL' && 'bg-primary text-primary-foreground',
                    s.severity === 'HIGH' && 'bg-card border border-border text-foreground',
                    s.severity === 'MEDIUM' && 'bg-muted border border-border/60 text-muted-foreground'
                  )}
                >
                  {s.severity}
                </span>
              </div>
              <div className='font-sans text-xs font-bold text-foreground line-clamp-1'>
                {s.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Active Scenario Visualizer */}
      <CardSpotlight className='p-6 md:p-8 bg-card border border-border rounded-[6px] text-card-foreground'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-center'>
          {/* Left Details */}
          <div className='lg:col-span-2 space-y-4'>
            <div className='flex items-center gap-2'>
              <span className='font-mono text-[10px] px-2 py-0.5 rounded-[2px] bg-muted border border-border text-foreground font-bold'>
                SHOCK RESPONSE BENCHMARK
              </span>
              <span className='text-xs text-muted-foreground font-mono'>
                Response Latency: {active.speed}
              </span>
            </div>

            <h3 className='text-xl md:text-2xl font-bold tracking-tight text-foreground'>
              {active.title}
            </h3>

            <div className='space-y-3 pt-1'>
              <div className='p-3.5 rounded-[6px] border border-border bg-muted/20 text-xs text-foreground'>
                <div className='font-mono font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5'>
                  <Icons.alertCircle className='size-3.5 text-amber-500' /> Injected Crisis Event
                </div>
                <p className='leading-relaxed text-muted-foreground'>{active.event}</p>
              </div>

              <div className='p-3.5 rounded-[6px] border border-emerald-500/40 bg-emerald-500/5 text-xs text-foreground'>
                <div className='font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5'>
                  <Icons.checkCircle className='size-3.5 text-emerald-500' /> NEXUS Autonomous Action
                </div>
                <p className='leading-relaxed text-foreground font-medium'>
                  {active.autonomousAction}
                </p>
              </div>
            </div>
          </div>

          {/* Right Metrics Card */}
          <div className='rounded-[6px] border border-border bg-muted/10 p-5 flex flex-col justify-between space-y-5 text-center lg:text-left'>
            <div>
              <div className='font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium'>
                Protected Waste Capital
              </div>
              <div className='font-mono text-3xl font-extrabold text-foreground tracking-tight mt-1'>
                {active.savedWaste}
              </div>
              <div className='text-xs text-muted-foreground font-mono mt-1'>
                Delta: {active.delta} ({active.metricType})
              </div>
            </div>

            <div className='pt-3 border-t border-border/50 space-y-2'>
              <div className='text-[11px] text-muted-foreground leading-snug'>
                Simulated on 90-day multi-channel telemetry with 100% mathematical audit trail.
              </div>
              <Link href='/dashboard/simulator' className='block'>
                <GlowButton size='sm' variant='default' className='w-full font-mono text-xs'>
                  Execute in Simulator →
                </GlowButton>
              </Link>
            </div>
          </div>
        </div>
      </CardSpotlight>
    </div>
  );
}
