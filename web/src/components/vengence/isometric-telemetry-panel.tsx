'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TerrainFigure,
  PlotFigure,
  BranchesFigure,
  VaultFigure,
  PhosphorFigure,
  RiffleFigure
} from './hairline-figures';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface InstrumentSpec {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
  stat: string;
  statLabel: string;
  href: string;
  component: React.ComponentType<{
    intensity?: number;
    className?: string;
    label?: string;
    onRead?: (caption: string) => void;
  }>;
}

const INSTRUMENTS: InstrumentSpec[] = [
  {
    id: 'terrain',
    name: 'Convex Response Surface',
    subtitle: 'Non-Linear Hill Saturation & Adstock Dynamics',
    description:
      '81 isometric contour pillars modeling diminishing returns across Meta, Google & Amazon. Pillars elevate under cursor trajectory reflecting marginal yield inflection points.',
    badge: 'HILL EQUATIONS',
    stat: '3.42x',
    statLabel: 'Marginal ROAS Inflection',
    href: '/dashboard/gauges',
    component: TerrainFigure
  },
  {
    id: 'plot',
    name: 'KKT Equi-Marginal Optimizer',
    subtitle: 'PuLP / Scipy Constrained Budget Allocation',
    description:
      'Seven isometric capital vectors that raise and highlight under pointer interaction. Solves bounded convex reallocation under ±20% platform learning bounds.',
    badge: 'SLSQP SOLVER',
    stat: '18ms',
    statLabel: 'Optimization Convergence',
    href: '/dashboard/reallocations',
    component: PlotFigure
  },
  {
    id: 'branches',
    name: 'Counterfactual Causal DAG',
    subtitle: 'DoWhy-GCM Structural Attribution',
    description:
      'Interactive causal DAG where nodes elevate and pull upstream ancestral lineage. Separates Shopify ERP inventory stockouts from platform auction CPM surges.',
    badge: 'CAUSAL DAG',
    stat: '99.4%',
    statLabel: 'Root-Cause Confidence',
    href: '/dashboard/anomalies',
    component: BranchesFigure
  },
  {
    id: 'vault',
    name: 'Capital Circuit Breaker',
    subtitle: 'Automated 15-Minute Kill-Switch Safeguard',
    description:
      'Locking bolt mechanism that engages when zero Shopify orders are registered on active campaigns. Circle the cursor to rotate the dial and verify autonomous unlock.',
    badge: 'KILL-SWITCH',
    stat: '< 15m',
    statLabel: 'Intervention SLA',
    href: '/dashboard/autonomous-engine',
    component: VaultFigure
  },
  {
    id: 'phosphor',
    name: 'Deterministic Entropy Match',
    subtitle: 'Walled-Garden Identity & Canvas Stitching',
    description:
      '7x7 phosphor dot matrix CRT display with lingering decay trails. Visualizes zero-cookie cross-channel session stitching without 3rd-party tracking.',
    badge: 'GPU ENTROPY',
    stat: '99.8%',
    statLabel: 'Attribution Match Rate',
    href: '/dashboard/fingerprint',
    component: PhosphorFigure
  },
  {
    id: 'riffle',
    name: 'Closed-Loop Decision Ledger',
    subtitle: 'Auditable Capital Transaction Stream',
    description:
      'Tactile filing cards that fan out under pointer motion and arrow keys. Every programmatic budget shift is audited with forecasted vs realized margin delta.',
    badge: 'IMMUTABLE AUDIT',
    stat: '₹15.4k/w',
    statLabel: 'Protected Weekly Profit',
    href: '/dashboard/ledger',
    component: RiffleFigure
  }
];

export function IsometricTelemetryPanel() {
  const [activeId, setActiveId] = useState<string>('terrain');
  const [caption, setCaption] = useState<string>('pointer tracking active');
  const [intensity, setIntensity] = useState<number>(0.65);

  const active = INSTRUMENTS.find((i) => i.id === activeId) || INSTRUMENTS[0];
  const ActiveComponent = active.component;

  return (
    <div className='w-full max-w-5xl mx-auto rounded-3xl border border-border/80 bg-card/70 backdrop-blur-md shadow-2xl overflow-hidden text-card-foreground transition-all'>
      {/* Top Console Navigation Bar */}
      <div className='px-4 sm:px-6 py-3.5 border-b border-border/70 bg-muted/30 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2.5'>
          <div className='size-2.5 rounded-full bg-emerald-500 animate-pulse' />
          <span className='font-orbitron text-xs font-bold tracking-wider uppercase text-foreground'>
            Tactile Telemetry Simulator
          </span>
          <span className='hidden sm:inline font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold'>
            INTERACTIVE • POINTER-REACTIVE
          </span>
        </div>

        {/* Live caption readout from Hairline figure */}
        <div className='flex items-center gap-2 font-mono text-[11px] text-muted-foreground'>
          <span className='text-muted-foreground/60 font-semibold'>READOUT:</span>
          <span className='px-2.5 py-0.5 rounded-md bg-background/90 border border-border/80 text-foreground font-semibold shadow-xs'>
            {caption || 'rest state'}
          </span>
        </div>
      </div>

      {/* Main Interactive Stage & Sidebar */}
      <div className='grid grid-cols-1 lg:grid-cols-12 min-h-[380px]'>
        {/* Left: Tab Selectors */}
        <div className='lg:col-span-4 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-border/70 flex flex-col justify-between space-y-4 bg-muted/10'>
          <div className='space-y-1.5'>
            <div className='font-orbitron text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 pb-1'>
              Select Engine Telemetry
            </div>
            {INSTRUMENTS.map((inst) => {
              const isSelected = inst.id === activeId;
              return (
                <button
                  key={inst.id}
                  onClick={() => setActiveId(inst.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between group cursor-pointer',
                    isSelected
                      ? 'bg-foreground text-background font-bold shadow-md'
                      : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div className='flex flex-col'>
                    <span className='truncate'>{inst.name}</span>
                    <span
                      className={cn(
                        'text-[10px] truncate font-normal',
                        isSelected ? 'text-background/70' : 'text-muted-foreground/60'
                      )}
                    >
                      {inst.badge}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded font-mono',
                      isSelected
                        ? 'bg-background/20 text-background'
                        : 'bg-muted/40 text-muted-foreground group-hover:text-foreground'
                    )}
                  >
                    {inst.stat}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Sensitivity Controller */}
          <div className='p-3 rounded-xl bg-card border border-border/80 space-y-2'>
            <div className='flex items-center justify-between text-[11px] font-mono text-muted-foreground'>
              <span>Dynamic Sensitivity</span>
              <span className='text-foreground font-bold'>{Math.round(intensity * 100)}%</span>
            </div>
            <input
              type='range'
              min='0.1'
              max='1.0'
              step='0.05'
              value={intensity}
              aria-label='Telemetry dynamic sensitivity slider'
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className='w-full accent-primary h-1 bg-muted rounded-lg cursor-pointer'
            />
            <p className='text-[10px] font-mono text-muted-foreground/70 leading-tight'>
              Drag to adjust isometric motion deflection physics.
            </p>
          </div>
        </div>

        {/* Center / Right: Interactive Isometric Stage */}
        <div className='lg:col-span-8 p-6 flex flex-col justify-between items-center relative overflow-hidden bg-card/40'>
          {/* Top metadata pill for current active figure */}
          <div className='w-full flex items-start justify-between gap-4 mb-3'>
            <div>
              <div className='flex items-center gap-2 mb-1'>
                <span className='font-orbitron text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20'>
                  {active.badge}
                </span>
                <h3 className='font-orbitron font-bold text-base sm:text-lg text-foreground'>
                  {active.name}
                </h3>
              </div>
              <p className='text-xs text-muted-foreground max-w-md leading-relaxed'>
                {active.description}
              </p>
              <div className='mt-2.5'>
                <Link
                  href={active.href}
                  className='inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:text-primary/80 transition-colors group'
                >
                  <span>Launch {active.name.split(' ')[0]} in Cockpit →</span>
                </Link>
              </div>
            </div>

            <div className='text-right shrink-0 bg-muted/40 p-2.5 rounded-xl border border-border/70 hidden sm:block'>
              <div className='font-orbitron text-sm font-extrabold text-foreground'>{active.stat}</div>
              <div className='font-mono text-[9px] text-muted-foreground uppercase'>{active.statLabel}</div>
            </div>
          </div>

          {/* The Hairline Figure Container with 5:4 aspect ratio */}
          <div className='w-full max-w-[420px] aspect-[5/4] my-auto flex items-center justify-center relative hairline-container cursor-crosshair'>
            <ActiveComponent
              intensity={intensity}
              className='size-full'
              label={active.name}
              onRead={(text) => setCaption(text)}
            />
          </div>

          {/* Bottom Interactive Hint */}
          <div className='w-full pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground'>
            <span className='flex items-center gap-1.5 text-foreground/80'>
              <span className='size-1.5 rounded-full bg-primary' />
              Move cursor across figure to deform geometry in real-time
            </span>
            <Link
              href={active.href}
              className='hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-primary hover:underline'
            >
              <span>Inspect Live Module →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
