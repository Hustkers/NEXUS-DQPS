'use client';

import React from 'react';
import Link from 'next/link';
import { CardSpotlight } from './card-spotlight';
import { NotchNavbar } from './notch-navbar';
import { IsometricTelemetryPanel } from './isometric-telemetry-panel';
import { AnimatedFooter } from '@/components/ui/animated-footer';
import { WhyUsBento } from './why-us-bento';
import { HighlightGrid } from './highlight-grid';
import { LocomotiveHeroVideo } from './locomotive-hero-video';
import { EcosystemStackedLogos } from './ecosystem-stacked-logos';
import { FaqAccordion } from './faq-accordion';
import { PillarsCardsStack } from './pillars-cards-stack';
import { CornerButton } from '@/components/ui/corner-button';

export function LandingPageView() {
  return (
    <div className='relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-foreground'>
      {/* LANDING PAGE TOP BAR (NotchNavbar with balanced optical symmetry) */}
      <NotchNavbar />

      {/* 0. CINEMATIC FULLSCREEN VIDEO HERO (LOCOMOTIVE AGENCY REEL) */}
      <div id='overview'>
        <LocomotiveHeroVideo />
      </div>

      {/* 1. STACKED LOGOS: MULTI-CHANNEL AD & COMMERCE ECOSYSTEM */}
      <EcosystemStackedLogos />

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

        <PillarsCardsStack />

        {/* Action Gateway: Vengence UI CornerButton CTA */}
        <div className='flex flex-col items-center justify-center pt-8 pb-4 text-center relative z-20'>
          <p className='text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground mb-4'>
            Ready to deploy autonomous capital allocation?
          </p>
          <CornerButton
            href='/dashboard/overview'
            accentColor='#e5ff00'
            className='font-orbitron font-bold text-sm tracking-wider uppercase'
          >
            Get Started
          </CornerButton>
        </div>
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

      {/* FREQUENTLY ASKED QUESTIONS (VENGENCE UI ACCORDION) */}
      <section id='faq' className='py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16 relative z-10'>
        <FaqAccordion />
      </section>

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
