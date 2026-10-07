'use client';

import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { VGPUCanvas } from './vgpu-canvas';
import { GlowButton } from './glow-button';
import { CardSpotlight } from './card-spotlight';
import { BentoGrid, BentoGridItem } from './bento-grid';
import { StatsMatrix } from './stats-matrix';
import { ShockSimulatorShowcase } from './shock-simulator-showcase';

const HERO_STATS = [
  {
    label: 'Protected Capital',
    value: '₹15,400/wk',
    sublabel: 'Stockout kill-switch waste cut',
    trend: 'live' as const,
    badge: 'CIRCUIT BREAKER'
  },
  {
    label: 'Hardware Attribution',
    value: '99.8%',
    sublabel: 'Deterministic entropy match',
    trend: 'up' as const,
    change: '+3.2x ROAS'
  },
  {
    label: 'Circuit SLA',
    value: '< 15 mins',
    sublabel: 'Out-of-stock throttling speed',
    trend: 'up' as const,
    change: 'REAL-TIME'
  },
  {
    label: 'Optimization Stability',
    value: '±20%',
    sublabel: 'Bounded KKT convex budget shift',
    trend: 'neutral' as const,
    change: 'SCIPY / PULP'
  }
];

export function LandingPageView() {
  return (
    <div className='relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-foreground'>
      {/* HERO SECTION WITH VGPU CANVAS BACKGROUND */}
      <section id='overview' className='relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden border-b border-border/60 scroll-mt-16'>
        {/* VGPU Canvas Dynamic Waveform */}
        <VGPUCanvas className='opacity-80' intensity={1.1} />

        <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center'>
          {/* Hackathon Pill */}
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono font-medium mb-6 animate-in fade-in slide-in-from-top-2 duration-500'>
            <span className='size-1.5 rounded-full bg-emerald-500' />
            <span>DataQuest 3.0 • Problem Statement & Solution</span>
          </div>

          {/* Master Headline as the Central Problem Question */}
          <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl leading-[1.1] mb-6'>
            How Can D2C Brands Stop Ad Budget Bleed Autonomously?
          </h1>

          {/* Proposed Solution Subtitle */}
          <p className='text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed mb-8'>
            <span className='text-foreground font-semibold'>The NEXUS Solution:</span> An AI-native closed loop pairing causal diagnostics with Scipy convex optimization — halting stockout waste in &lt;15 minutes to guarantee positive net contribution profit.
          </p>

          {/* Primary Button Group with VengenceUI Button Forge Styling */}
          <div className='flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-16'>
            <GlowButton
              href='/dashboard/overview'
              size='lg'
              variant='default'
              className='font-mono text-sm shadow-md'
            >
              Launch Mission Control Cockpit →
            </GlowButton>

            <GlowButton
              href='#shocks'
              size='lg'
              variant='outline'
              className='font-mono text-sm'
            >
              Test 4 Shock Scenarios
            </GlowButton>

            <GlowButton
              href='/dashboard/fingerprint'
              size='lg'
              variant='pill'
              className='font-mono text-xs px-4'
            >
              Hardware Fingerprint Demo
            </GlowButton>
          </div>

          {/* Clean No-Counter Stats Matrix */}
          <div className='w-full max-w-5xl'>
            <StatsMatrix stats={HERO_STATS} />
          </div>
        </div>
      </section>

      {/* 3. SHOCK SIMULATOR SHOWCASE (WORKFLOW & SCENARIOS) */}
      <section id='workflow' className='py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16 relative'>
        <span id='shocks' className='absolute -top-20' />
        <div className='text-center max-w-3xl mx-auto mb-12'>
          <div className='font-mono text-xs font-bold text-primary uppercase tracking-widest mb-2'>
            STRESS TEST BENCHMARK
          </div>
          <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4'>
            Four Real-World Crisis Scenarios
          </h2>
          <p className='text-sm md:text-base text-muted-foreground leading-relaxed'>
            Standard marketers take 48–72 hours to diagnose inventory and auction anomalies.
            NEXUS intervenes in sub-15 minutes with automated circuit breakers and Scipy convex reallocation.
          </p>
        </div>

        <ShockSimulatorShowcase />
      </section>

      {/* 4. EXPANDABLE / AGENT BENTO GRID (FEATURES & ARCHITECTURE) */}
      <section id='features' className='py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-border/60 scroll-mt-16 relative'>
        <span id='bento' className='absolute -top-20' />
        <div className='text-center max-w-3xl mx-auto mb-14'>
          <div className='font-mono text-xs font-bold text-primary uppercase tracking-widest mb-2'>
            CORE SYSTEM PILLARS
          </div>
          <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4'>
            Engineered for Ground-Truth Profitability
          </h2>
          <p className='text-sm md:text-base text-muted-foreground leading-relaxed'>
            Why generic LLM agents fail: LLMs cannot perform multi-variable bounded convex optimization reliably.
            NEXUS decouples mathematical rigor from narrative root-cause diagnostics.
          </p>
        </div>

        <BentoGrid>
          {/* Item 1: Bounded Convex Optimizer (Span 2) */}
          <BentoGridItem
            className='md:col-span-2'
            tag='Deterministic Math'
            title='Equi-Marginal Bounded Budget Optimizer (PuLP / Scipy)'
            description='Solves the Karush-Kuhn-Tucker (KKT) constrained optimization problem across channels. Reallocates capital to equalize marginal contribution profit under strict ±20% daily liquidity stability bounds to preserve ad platform algorithmic learning phases.'
            icon={<Icons.trendingUp className='size-5' />}
            badge={
              <span className='font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'>
                KKT CONVEX SOLVER
              </span>
            }
            header={
              <div className='h-40 rounded-xl bg-card border border-border/80 p-4 font-mono text-xs flex flex-col justify-between'>
                <div className='flex items-center justify-between text-muted-foreground border-b border-border/60 pb-2'>
                  <span>PULP / SCIPY FORMULATION</span>
                  <span className='text-emerald-600 dark:text-emerald-400 font-semibold'>STATUS: OPTIMAL</span>
                </div>
                <div className='bg-muted/40 p-3 rounded-lg text-[11px] leading-relaxed text-foreground font-mono space-y-1'>
                  <div>max ∑ POAS_k(S_k) • GrossMargin_k</div>
                  <div className='text-muted-foreground'>s.t. ∑ S_k ≤ B_total | S_k(1-0.20) ≤ S_k^new ≤ S_k(1+0.20)</div>
                  <div className='text-emerald-600 dark:text-emerald-400'>Circuit Breaker: if Inventory_k == 0 ⇒ S_k^new = 0 (Kill-Switch)</div>
                </div>
                <div className='text-[10px] text-muted-foreground flex justify-between'>
                  <span>Execution: 1-Click Rollback Enabled</span>
                  <span>Solves in 18ms</span>
                </div>
              </div>
            }
          />

          {/* Item 2: Causal Inference vs Correlational LLMs (Span 1) */}
          <BentoGridItem
            tag='Causal Inference'
            title='Counterfactual DAG Engine'
            description='Separates ad copy failures from external confounders. When ROAS drops, factor decomposition isolates website latency, buy-box undercutting, and ERP stockouts before touching creative spend.'
            icon={<Icons.checkCircle className='size-5' />}
            badge={
              <span className='font-mono text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold'>
                DAG CAUSALITY
              </span>
            }
            header={
              <div className='h-40 rounded-xl bg-card border border-border/80 p-4 font-mono text-xs flex flex-col justify-between'>
                <div className='text-muted-foreground text-[10px] uppercase font-bold'>
                  Factor Decomposition
                </div>
                <div className='space-y-2'>
                  <div>
                    <div className='flex justify-between text-[11px] mb-0.5'>
                      <span>Inventory Depletion</span>
                      <span className='text-destructive font-bold'>-18 pts</span>
                    </div>
                    <div className='w-full h-1.5 rounded-full bg-muted overflow-hidden'>
                      <div className='h-full bg-destructive w-[65%]' />
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-between text-[11px] mb-0.5'>
                      <span>Auction CPM Inflation</span>
                      <span className='text-amber-500 font-bold'>+9 pts</span>
                    </div>
                    <div className='w-full h-1.5 rounded-full bg-muted overflow-hidden'>
                      <div className='h-full bg-amber-500 w-[35%]' />
                    </div>
                  </div>
                </div>
                <div className='text-[10px] text-muted-foreground'>
                  Result: Zero Creative Blame
                </div>
              </div>
            }
          />

          {/* Item 3: Hardware Fingerprinting (Span 1) */}
          <BentoGridItem
            tag='Identity Graph'
            title='Walled-Garden Hardware Stitcher'
            description='99.8% deterministic hardware entropy fingerprinting stitches YouTube impressions, TikTok ads, and Amazon marketplace checkouts without 3rd-party cookies or UTM parameters.'
            icon={<Icons.lock className='size-5' />}
            badge={
              <span className='font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'>
                ZERO COOKIES
              </span>
            }
            header={
              <div className='h-40 rounded-xl bg-card border border-border/80 p-4 font-mono text-xs flex flex-col justify-between'>
                <div className='text-muted-foreground text-[10px] uppercase font-bold flex justify-between'>
                  <span>Deterministic Entropy</span>
                  <span className='text-emerald-500 font-bold'>99.8% MATCH</span>
                </div>
                <div className='p-2 rounded bg-muted/40 font-mono text-[10px] space-y-1 text-muted-foreground truncate'>
                  <div>HASH: d8a9f24b-321a</div>
                  <div>DEVICE: Apple M-Series GPU</div>
                  <div>CANVAS: Canvas2D SHA256 Match</div>
                </div>
                <div className='text-[11px] font-bold text-foreground'>
                  YouTube (10:14) → Amazon Buy (16:35)
                </div>
              </div>
            }
          />

          {/* Item 4: Closed-Loop Ledger (Span 2) */}
          <BentoGridItem
            className='md:col-span-2'
            tag='Continuous Feedback'
            title='Autonomous Execution Ledger with Reinforcement Feedback'
            description='Every single budget shift is committed to an immutable ledger with predicted vs realized contribution margin. Model weights and adstock decay curves automatically tune in DuckDB/PostgreSQL based on accuracy variances.'
            icon={<Icons.clipboardText className='size-5' />}
            badge={
              <span className='font-mono text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold'>
                DUCKDB + POSTGRES
              </span>
            }
            header={
              <div className='h-40 rounded-xl bg-card border border-border/80 p-4 font-mono text-xs flex flex-col justify-between'>
                <div className='flex items-center justify-between text-muted-foreground text-[10px] uppercase font-bold border-b border-border/60 pb-1.5'>
                  <span>Historical Variance Telemetry</span>
                  <span className='text-emerald-600 dark:text-emerald-400'>ACCURACY: 96.8%</span>
                </div>
                <div className='grid grid-cols-3 gap-2 text-center'>
                  <div className='p-2 rounded bg-muted/40'>
                    <div className='text-[10px] text-muted-foreground'>Predicted Lift</div>
                    <div className='text-sm font-bold text-foreground'>+₹3,450/d</div>
                  </div>
                  <div className='p-2 rounded bg-muted/40'>
                    <div className='text-[10px] text-muted-foreground'>Realized Lift</div>
                    <div className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>+₹3,610/d</div>
                  </div>
                  <div className='p-2 rounded bg-muted/40'>
                    <div className='text-[10px] text-muted-foreground'>Variance</div>
                    <div className='text-sm font-bold text-foreground'>+4.7%</div>
                  </div>
                </div>
                <div className='text-[10px] text-muted-foreground flex justify-between'>
                  <span>Reinforcement: Adstock weights updated</span>
                  <span>Audit Trail: Immutable</span>
                </div>
              </div>
            }
          />
        </BentoGrid>
      </section>

      {/* 5. 4-PHASE ARCHITECTURAL FLOW (STACK & PIPELINE) */}
      <section id='stack' className='py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16 relative'>
        <span id='pipeline' className='absolute -top-20' />
        <div className='text-center max-w-3xl mx-auto mb-16'>
          <div className='font-mono text-xs font-bold text-primary uppercase tracking-widest mb-2'>
            CLOSED LOOP EXECUTION
          </div>
          <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4'>
            From Ingestion to Closed-Loop Ledger
          </h2>
          <p className='text-sm md:text-base text-muted-foreground leading-relaxed'>
            How NEXUS operates from end-to-end without human friction while keeping full human-in-the-loop control.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          {[
            {
              step: '01',
              title: 'Multi-Channel Ingestion',
              desc: 'Unifies ad spend from Meta, Google, Amazon, and TikTok with Shopify orders, GA4 events, and ERP inventory into DuckDB.',
              badge: 'DUCKDB / POSTGRES'
            },
            {
              step: '02',
              title: 'Causal Anomaly Diagnostic',
              desc: 'Z-score metric monitors detect spikes and run counterfactual DAG logic to separate ad issues from inventory stockouts.',
              badge: 'ROOT CAUSE RCA'
            },
            {
              step: '03',
              title: 'Convex Capital Allocation',
              desc: 'Equi-marginal solver shifts capital across channels and SKUs along response saturation curves under ±20% safety guardrails.',
              badge: 'SCIPY SOLVER'
            },
            {
              step: '04',
              title: 'Autonomous Dispatch & Audit',
              desc: 'Dispatches API mutations with instant 1-click rollback, comparing realized outcome vs predicted margin in the ledger.',
              badge: 'CLOSED LOOP'
            }
          ].map((phase, idx) => (
            <CardSpotlight
              key={idx}
              className='p-6 flex flex-col justify-between space-y-4 border-border/80'
            >
              <div>
                <div className='font-mono text-2xl font-extrabold text-primary mb-2'>
                  {phase.step}
                </div>
                <div className='font-mono text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase font-bold inline-block mb-3'>
                  {phase.badge}
                </div>
                <h3 className='font-bold text-base text-foreground mb-2'>
                  {phase.title}
                </h3>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  {phase.desc}
                </p>
              </div>
              <div className='pt-2 border-t border-border/60 text-[11px] font-mono text-primary font-semibold'>
                Active Phase →
              </div>
            </CardSpotlight>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION SPOTLIGHT BANNER */}
      <section className='py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto'>
        <CardSpotlight className='p-8 md:p-12 text-center bg-card border-primary/30 shadow-xl space-y-6'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono font-medium'>
            <span>Ready for Live Hackathon Demonstration</span>
          </div>

          <h2 className='text-3xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl mx-auto leading-tight'>
            Experience Autonomous Ad Capital Interventions Live
          </h2>

          <p className='text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed'>
            Dive into the interactive mission control console, inspect simulated anomalies, view the KKT optimization vectors, and approve budget reallocations.
          </p>

          <div className='flex flex-wrap items-center justify-center gap-4 pt-2'>
            <GlowButton
              href='/dashboard/overview'
              size='lg'
              variant='default'
              className='font-mono text-sm shadow-md'
            >
              Launch Mission Control →
            </GlowButton>

            <GlowButton
              href='/dashboard/simulator'
              size='lg'
              variant='outline'
              className='font-mono text-sm'
            >
              Open Crisis Simulator
            </GlowButton>
          </div>
        </CardSpotlight>
      </section>

      {/* 7. CLEAN SYSTEM FOOTER */}
      <footer className='border-t border-border/80 bg-muted/20 py-12 px-4 sm:px-6 lg:px-8 text-xs font-mono text-muted-foreground'>
        <div className='max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6'>
          <div className='flex items-center gap-3'>
            <span className='font-bold text-foreground'>NEXUS-DQPS</span>
            <span>•</span>
            <span>DataQuest 3.0 Hackathon Master Submission</span>
          </div>

          <div className='flex flex-wrap items-center gap-6'>
            <Link href='/dashboard/overview' className='hover:text-foreground transition-colors'>
              Mission Control
            </Link>
            <Link href='/dashboard/matrix' className='hover:text-foreground transition-colors'>
              SKU Matrix
            </Link>
            <Link href='/dashboard/fingerprint' className='hover:text-foreground transition-colors'>
              Identity Graph
            </Link>
            <Link href='/dashboard/ledger' className='hover:text-foreground transition-colors'>
              Decision Ledger
            </Link>
            <a
              href='https://github.com/Hustkers/NEXUS-DQPS'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-foreground transition-colors flex items-center gap-1'
            >
              <Icons.brandGithub className='size-3.5' /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
