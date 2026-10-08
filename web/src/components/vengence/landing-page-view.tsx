'use client';

import React from 'react';
import Link from 'next/link';
import { SkewCards, type GradientCardItem } from '@/components/ui/gradient-card-showcase';
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

const ARCHITECTURE_PHASES: GradientCardItem[] = [
  {
    step: '01',
    badge: 'DUCKDB / POSTGRES',
    title: 'Multi-Channel Ingestion',
    desc: 'Unifies ad spend from Meta, Google, Amazon, and TikTok with Shopify orders, GA4 events, and ERP inventory into DuckDB.',
    gradientFrom: '#ffbc00',
    gradientTo: '#ff0058',
    href: '/dashboard/matrix',
    ctaText: 'Launch Multi-Channel Module →'
  },
  {
    step: '02',
    badge: 'ROOT CAUSE RCA',
    title: 'Causal Anomaly Diagnostic',
    desc: 'Z-score metric monitors detect spikes and run counterfactual DAG logic to separate ad issues from inventory stockouts.',
    gradientFrom: '#03a9f4',
    gradientTo: '#ff0058',
    href: '/dashboard/anomalies',
    ctaText: 'Launch Causal Module →'
  },
  {
    step: '03',
    badge: 'SCIPY SOLVER',
    title: 'Convex Capital Allocation',
    desc: 'Equi-marginal solver shifts capital across channels and SKUs along response saturation curves under ±20% safety guardrails.',
    gradientFrom: '#4dff03',
    gradientTo: '#00d0ff',
    href: '/dashboard/reallocations',
    ctaText: 'Launch Convex Module →'
  },
  {
    step: '04',
    badge: 'CLOSED LOOP',
    title: 'Autonomous Dispatch & Audit',
    desc: 'Dispatches API mutations with instant 1-click rollback, comparing realized outcome vs predicted margin in the ledger.',
    gradientFrom: '#a855f7',
    gradientTo: '#ec4899',
    href: '/dashboard/ledger',
    ctaText: 'Launch Autonomous Module →'
  }
];

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
        <div className='max-w-7xl mx-auto w-full mb-10 sm:mb-14'>
          <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-5 border-b border-border/60'>
            <div className='space-y-2 max-w-5xl'>
              <div className='flex items-center gap-2 font-mono text-[11px] sm:text-xs font-bold text-primary uppercase tracking-[0.2em]'>
                <span className='inline-block size-1.5 rounded-full bg-primary animate-pulse' />
                CORE SYSTEM PILLARS
              </div>
              <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-orbitron font-black tracking-tight text-foreground uppercase leading-[1.06]'>
                Engineered for Ground-Truth Profitability
              </h2>
            </div>
            <div className='font-mono text-[11px] sm:text-xs text-muted-foreground tracking-widest uppercase shrink-0 pb-1'>
              [ 04 CORE PILLARS &bull; DUAL-ENGINE ]
            </div>
          </div>
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
        <div className='w-full mb-10 sm:mb-14'>
          <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-5 border-b border-border/60'>
            <div className='space-y-2 max-w-5xl'>
              <div className='flex items-center gap-2 font-mono text-[11px] sm:text-xs font-bold text-primary uppercase tracking-[0.2em]'>
                <span className='inline-block size-1.5 rounded-full bg-primary animate-pulse' />
                CLOSED LOOP EXECUTION
              </div>
              <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-orbitron font-black tracking-tight text-foreground uppercase leading-[1.06]'>
                From Ingestion to Closed-Loop Ledger
              </h2>
            </div>
            <div className='font-mono text-[11px] sm:text-xs text-muted-foreground tracking-widest uppercase shrink-0 pb-1'>
              [ 4-PHASE LIFECYCLE &bull; ZERO FRICTION ]
            </div>
          </div>
        </div>

        <SkewCards
          cards={ARCHITECTURE_PHASES}
          className='py-2'
          cardWidth='w-[280px] sm:w-[290px] xl:w-[285px]'
          cardHeight='min-h-[410px] h-[420px]'
        />
      </section>


      {/* 4. ISOMETRIC ALGORITHMIC TELEMETRY (TACTILE HAIRLINE COCKPIT) */}
      <section id='instruments' className='py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16 relative'>
        <span id='telemetry' className='absolute -top-20' />
        <div className='w-full mb-10 sm:mb-14'>
          <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-5 border-b border-border/60'>
            <div className='space-y-2 max-w-5xl'>
              <div className='flex items-center gap-2 font-mono text-[11px] sm:text-xs font-bold text-primary uppercase tracking-[0.2em]'>
                <span className='inline-block size-1.5 rounded-full bg-primary animate-pulse' />
                TELEMETRY COCKPIT
              </div>
              <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-orbitron font-black tracking-tight text-foreground uppercase leading-[1.06]'>
                Interactive Hairline Telemetry Cockpit
              </h2>
            </div>
            <div className='font-mono text-[11px] sm:text-xs text-muted-foreground tracking-widest uppercase shrink-0 pb-1'>
              [ POINTER-REACTIVE &bull; 3D WIREFRAME ]
            </div>
          </div>
        </div>
        <IsometricTelemetryPanel />
      </section>

      {/* DETERMINISTIC ENGINE TECH STACK HIGHLIGHT GRID */}
      <section className='py-12 sm:py-16 relative z-10 w-full'>
        <div className='mx-auto max-w-7xl px-4 md:px-8 lg:px-12 flex flex-col gap-6 sm:gap-8'>
          <div className='w-full mb-2'>
            <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-5 border-b border-border/60'>
              <div className='space-y-2 max-w-5xl'>
                <div className='flex items-center gap-2 font-mono text-[11px] sm:text-xs font-bold text-primary uppercase tracking-[0.2em]'>
                  <span className='inline-block size-1.5 rounded-full bg-primary animate-pulse' />
                  STACK ARCHITECTURE
                </div>
                <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-orbitron font-black tracking-tight text-foreground uppercase leading-[1.06]'>
                  Engineered with Modern Full-Stack Precision
                </h2>
              </div>
              <div className='font-mono text-[11px] sm:text-xs text-muted-foreground tracking-widest uppercase shrink-0 pb-1'>
                [ NEXT.JS 16 &bull; DUCKDB &bull; SCIPY ]
              </div>
            </div>
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
