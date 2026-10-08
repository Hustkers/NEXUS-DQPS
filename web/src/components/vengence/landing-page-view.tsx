'use client';

import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { CardSpotlight } from './card-spotlight';
import { BentoGrid, BentoGridItem } from './bento-grid';
import { NotchNavbar } from './notch-navbar';
import { PlotFigure, BranchesFigure, PhosphorFigure, RiffleFigure } from './hairline-figures';
import { IsometricTelemetryPanel } from './isometric-telemetry-panel';
import { AnimatedFooter } from '@/components/ui/animated-footer';
import { WhyUsBento } from './why-us-bento';
import { HighlightGrid } from './highlight-grid';
import { LocomotiveHeroVideo } from './locomotive-hero-video';

export function LandingPageView() {
  return (
    <div className='relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-foreground'>
      {/* LANDING PAGE TOP BAR (NotchNavbar with balanced optical symmetry) */}
      <NotchNavbar />

      {/* 0. CINEMATIC FULLSCREEN VIDEO HERO (LOCOMOTIVE AGENCY REEL) */}
      <div id='overview'>
        <LocomotiveHeroVideo />
      </div>

      {/* 2. EXPANDABLE / AGENT BENTO GRID (FEATURES & ARCHITECTURE) */}
      <section id='features' className='py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-muted/20 border-b border-border/60 scroll-mt-16 relative'>
        <span id='bento' className='absolute -top-20' />
        <div className='text-center max-w-3xl mx-auto mb-14'>
          <div className='font-mono text-xs font-bold text-primary uppercase tracking-widest mb-2'>
            CORE SYSTEM PILLARS
          </div>
          <h2 className='text-3xl md:text-4xl font-orbitron font-extrabold tracking-tight text-foreground mb-4'>
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
            href='/dashboard/reallocations'
            actionText='Launch Convex Reallocations →'
            badge={
              <span className='font-orbitron text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'>
                KKT CONVEX SOLVER
              </span>
            }
            header={
              <div className='grid grid-cols-1 sm:grid-cols-12 gap-3 h-auto sm:h-44 p-3 bg-card border border-border/80 rounded-xl'>
                <div className='sm:col-span-5 h-36 sm:h-full flex items-center justify-center p-1 relative hairline-container cursor-crosshair'>
                  <PlotFigure intensity={0.75} className='size-full max-h-[140px]' label='KKT SLSQP' />
                </div>
                <div className='sm:col-span-7 flex flex-col justify-between font-mono text-xs py-1'>
                  <div className='flex items-center justify-between text-muted-foreground border-b border-border/60 pb-1.5'>
                    <span>PULP / SCIPY FORMULATION</span>
                    <span className='text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]'>OPTIMAL (18ms)</span>
                  </div>
                  <div className='bg-muted/40 p-2 rounded-lg text-[10px] leading-relaxed text-foreground font-mono space-y-0.5 my-1'>
                    <div>max ∑ POAS_k(S_k) • GrossMargin_k</div>
                    <div className='text-muted-foreground text-[9px]'>s.t. ∑ S_k ≤ B_total | ±20% Liquidity Bounds</div>
                    <div className='text-emerald-600 dark:text-emerald-400 text-[9px]'>Circuit Breaker: Zero-Inventory Kill-Switch</div>
                  </div>
                  <div className='text-[10px] text-muted-foreground flex justify-between'>
                    <span>1-Click Rollback</span>
                    <span className='font-bold text-foreground'>Pointer-Reactive</span>
                  </div>
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
            href='/dashboard/anomalies'
            actionText='Launch Causal Diagnostics →'
            badge={
              <span className='font-orbitron text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold'>
                DAG CAUSALITY
              </span>
            }
            header={
              <div className='h-44 rounded-xl bg-card border border-border/80 p-3 font-mono text-xs flex flex-col justify-between'>
                <div className='flex items-center justify-between text-muted-foreground text-[10px] uppercase font-bold border-b border-border/60 pb-1'>
                  <span>DoWhy-GCM Structural DAG</span>
                  <span className='text-sky-500 font-bold'>CAUSAL</span>
                </div>
                <div className='h-24 w-full flex items-center justify-center hairline-container cursor-crosshair'>
                  <BranchesFigure intensity={0.8} className='size-full max-h-[96px]' label='Causal DAG' />
                </div>
                <div className='text-[10px] text-muted-foreground flex justify-between pt-1 border-t border-border/50'>
                  <span>ERP vs Auction CPM</span>
                  <span className='text-emerald-500 font-semibold'>99.4% Confidence</span>
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
            href='/dashboard/fingerprint'
            actionText='Launch Identity Fingerprinter →'
            badge={
              <span className='font-orbitron text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'>
                ZERO COOKIES
              </span>
            }
            header={
              <div className='h-44 rounded-xl bg-card border border-border/80 p-3 font-mono text-xs flex flex-col justify-between'>
                <div className='flex items-center justify-between text-muted-foreground text-[10px] uppercase font-bold border-b border-border/60 pb-1'>
                  <span>Hardware Entropy CRT</span>
                  <span className='text-emerald-500 font-bold'>99.8% MATCH</span>
                </div>
                <div className='h-24 w-full flex items-center justify-center hairline-container cursor-crosshair'>
                  <PhosphorFigure intensity={0.7} className='size-full max-h-[96px]' label='Entropy Phosphor' />
                </div>
                <div className='text-[10px] text-muted-foreground flex justify-between pt-1 border-t border-border/50'>
                  <span>GPU Canvas SHA256</span>
                  <span className='text-foreground font-semibold'>Zero 3P Cookies</span>
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
            href='/dashboard/ledger'
            actionText='Open Decision Ledger →'
            badge={
              <span className='font-orbitron text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold'>
                DUCKDB + POSTGRES
              </span>
            }
            header={
              <div className='grid grid-cols-1 sm:grid-cols-12 gap-3 h-auto sm:h-44 p-3 bg-card border border-border/80 rounded-xl'>
                <div className='sm:col-span-5 h-36 sm:h-full flex items-center justify-center p-1 relative hairline-container cursor-crosshair'>
                  <RiffleFigure intensity={0.65} className='size-full max-h-[140px]' label='Decision Ledger' />
                </div>
                <div className='sm:col-span-7 flex flex-col justify-between font-mono text-xs py-1'>
                  <div className='flex items-center justify-between text-muted-foreground text-[10px] uppercase font-bold border-b border-border/60 pb-1'>
                    <span>Reinforcement Variance Ledger</span>
                    <span className='text-emerald-600 dark:text-emerald-400'>ACCURACY: 96.8%</span>
                  </div>
                  <div className='grid grid-cols-3 gap-1.5 text-center my-1'>
                    <div className='p-1.5 rounded bg-muted/40'>
                      <div className='text-[9px] text-muted-foreground'>Predicted Lift</div>
                      <div className='text-xs font-bold text-foreground'>+₹3,450/d</div>
                    </div>
                    <div className='p-1.5 rounded bg-muted/40'>
                      <div className='text-[9px] text-muted-foreground'>Realized Lift</div>
                      <div className='text-xs font-bold text-emerald-600 dark:text-emerald-400'>+₹3,610/d</div>
                    </div>
                    <div className='p-1.5 rounded bg-muted/40'>
                      <div className='text-[9px] text-muted-foreground'>Variance</div>
                      <div className='text-xs font-bold text-foreground'>+4.7%</div>
                    </div>
                  </div>
                  <div className='text-[10px] text-muted-foreground flex justify-between pt-1 border-t border-border/50'>
                    <span>DuckDB Weights Updated</span>
                    <span className='font-bold text-foreground'>Immutable Ledger</span>
                  </div>
                </div>
              </div>
            }
          />
        </BentoGrid>
      </section>

      {/* 3. 4-PHASE ARCHITECTURAL FLOW (STACK & PIPELINE) */}
      <section id='stack' className='py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16 relative'>
        <span id='pipeline' className='absolute -top-20' />
        <div className='text-center max-w-3xl mx-auto mb-16'>
          <div className='font-mono text-xs font-bold text-primary uppercase tracking-widest mb-2'>
            CLOSED LOOP EXECUTION
          </div>
          <h2 className='text-3xl md:text-4xl font-orbitron font-extrabold tracking-tight text-foreground mb-4'>
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
              badge: 'DUCKDB / POSTGRES',
              href: '/dashboard/matrix'
            },
            {
              step: '02',
              title: 'Causal Anomaly Diagnostic',
              desc: 'Z-score metric monitors detect spikes and run counterfactual DAG logic to separate ad issues from inventory stockouts.',
              badge: 'ROOT CAUSE RCA',
              href: '/dashboard/anomalies'
            },
            {
              step: '03',
              title: 'Convex Capital Allocation',
              desc: 'Equi-marginal solver shifts capital across channels and SKUs along response saturation curves under ±20% safety guardrails.',
              badge: 'SCIPY SOLVER',
              href: '/dashboard/reallocations'
            },
            {
              step: '04',
              title: 'Autonomous Dispatch & Audit',
              desc: 'Dispatches API mutations with instant 1-click rollback, comparing realized outcome vs predicted margin in the ledger.',
              badge: 'CLOSED LOOP',
              href: '/dashboard/ledger'
            }
          ].map((phase, idx) => (
            <CardSpotlight
              key={idx}
              className='p-6 flex flex-col justify-between space-y-4 border-border/80'
            >
              <div>
                <div className='font-orbitron text-2xl font-black text-primary mb-2'>
                  {phase.step}
                </div>
                <div className='font-orbitron text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase font-bold inline-block mb-3'>
                  {phase.badge}
                </div>
                <h3 className='font-orbitron font-bold text-base text-foreground mb-2'>
                  {phase.title}
                </h3>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  {phase.desc}
                </p>
              </div>
              <Link
                href={phase.href}
                className='pt-2.5 border-t border-border/60 text-[11px] font-mono text-primary font-semibold hover:text-primary/80 flex items-center justify-between group/link'
              >
                <span>Launch {phase.title.split(' ')[0]} Module</span>
                <span className='group-hover/link:translate-x-0.5 transition-transform'>→</span>
              </Link>
            </CardSpotlight>
          ))}
        </div>
      </section>

      {/* 4. ISOMETRIC ALGORITHMIC TELEMETRY (TACTILE HAIRLINE COCKPIT) */}
      <section id='instruments' className='py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16 relative'>
        <span id='telemetry' className='absolute -top-20' />
        <div className='text-center max-w-3xl mx-auto mb-12 sm:mb-16'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono tracking-wider uppercase mb-3'>
            <span>●</span> TACTILE ALGORITHMIC TELEMETRY
          </div>
          <h2 className='text-3xl md:text-4xl font-orbitron font-extrabold tracking-tight text-foreground mb-4'>
            Interactive Hairline Telemetry Cockpit
          </h2>
          <p className='text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto'>
            Pointer-reactive isometric wireframe instruments modeled from the mathematical core of NEXUS. Glide your cursor to deform geometry, inspect real-time readouts, and simulate algorithmic defense responses.
          </p>
        </div>
        <IsometricTelemetryPanel />
      </section>

      {/* DETERMINISTIC ENGINE TECH STACK HIGHLIGHT GRID */}
      <section className='py-12 sm:py-16 relative z-10 w-full'>
        <div className='mx-auto max-w-7xl px-4 md:px-8 lg:px-12 flex flex-col gap-6 sm:gap-8'>
          <div className='flex flex-col items-center text-center space-y-3 mb-2'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono tracking-wider uppercase'>
              <span>●</span> DETERMINISTIC ENGINE &amp; TECH STACK
            </div>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-orbitron font-extrabold tracking-tight text-foreground'>
              Engineered with Modern Full-Stack Precision
            </h2>
            <p className='text-sm sm:text-base text-muted-foreground max-w-2xl'>
              Glide across the real-time DuckDB columnar analytics, SciPy KKT solvers, Next.js 16 architecture, and modern full-stack libraries powering NEXUS.
            </p>
          </div>

          <HighlightGrid />
        </div>
      </section>

      {/* WHY US BENTO (CONFIGURED WITH ISOMETRIC VISUALS & TEAM AVATARS) */}
      <WhyUsBento />

      {/* CINEMATIC ASCII ANIMATED FOOTER (CONFIGURED WITH SHARED TOOLTIP TEAM AVATARS) */}
      <AnimatedFooter
        headingLines={['NEXUS']}
        brandLogo='NX'
        brandTitle='nexusdqps'
        tagline='Autonomous multi-channel ad capital optimization & causal anomaly diagnostic engine — halting stockout waste and maximizing net contribution margin in real time.'
        copyright='© 2026 Jay Gopal · NEXUS · All rights reserved.'
        leftImage='/animated-footer/hand-left.jpg'
        rightImage='/animated-footer/hand-right.jpg'
      />
    </div>
  );
}
