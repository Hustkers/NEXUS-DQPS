'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { VGPUCanvas } from './vgpu-canvas';
import { GlowButton } from './glow-button';
import { CardSpotlight } from './card-spotlight';
import { BentoGrid, BentoGridItem } from './bento-grid';
import { NotchNavbar } from './notch-navbar';
import { CylinderCarousel, type CarouselImage } from './cylinder-carousel';
import { PlotFigure, BranchesFigure, PhosphorFigure, RiffleFigure } from './hairline-figures';
import { AnimatedFooter } from '@/components/ui/animated-footer';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const AGENCY_TICKER_ITEMS = [
  'VIRAL CREATIVE HOOK ENGINE',
  'CAUSAL DAG FACTOR ATTRIBUTION',
  'KKT CONVEX MULTI-CHANNEL REALLOCATION',
  'SUB-15 MIN ZERO-STOCKOUT CIRCUIT BREAKER',
  '99.8% DETERMINISTIC IDENTITY GRAPH'
];

const AD_AGENCY_CREATIVES: CarouselImage[] = [
  {
    src: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
    alt: 'Cyber Streetwear Sneaker Ad',
    brand: 'KINETIC AURA',
    title: 'Velocity Sneaker Drop',
    channel: 'Meta Reels 9:16',
    roas: '5.8x ROAS',
    metric: '+48% Hook Rate · $42k Scaled',
  },
  {
    src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    alt: 'Minimalist Smartwatch Ad',
    brand: 'LUMEN CHRONO',
    title: 'Titanium Smart Edition',
    channel: 'TikTok Spark Ad',
    roas: '6.4x ROAS',
    metric: 'Scaled $55k/d · CVR 4.8%',
  },
  {
    src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    alt: 'Studio Audio Headphones Ad',
    brand: 'SONIC APEX',
    title: 'Zero-Latency Wireless',
    channel: 'YouTube Shorts 4K',
    roas: '4.9x ROAS',
    metric: '1.4M Impressions · 38% VTR',
  },
  {
    src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    alt: 'Botanical Skincare Ad',
    brand: 'AURA BOTANICA',
    title: 'Radiance Peptide Serum',
    channel: 'Meta Carousel',
    roas: '7.2x ROAS',
    metric: '+64% Repeat Purchase Rate',
  },
  {
    src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
    alt: 'Electric Hypercar Ad',
    brand: 'VELOX MOBILITY',
    title: 'Aero Coupe Launch',
    channel: 'Google P-Max',
    roas: '5.1x ROAS',
    metric: 'KKT Convex Solved · $80k Spend',
  },
  {
    src: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    alt: 'Artisanal Cold Brew Ad',
    brand: 'ROAST NOIR',
    title: 'Single-Origin Nitro Brew',
    channel: 'TikTok TopView',
    roas: '6.1x ROAS',
    metric: 'Viral Sound · 2.1M Plays',
  },
  {
    src: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
    alt: 'Architectural Eyewear Ad',
    brand: 'OPTIX STUDIO',
    title: 'Polarized Titanium Frames',
    channel: 'Meta Story Ad',
    roas: '6.8x ROAS',
    metric: '+52% Net POAS Lift',
  },
  {
    src: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
    alt: 'Luxury Fragrance Ad',
    brand: 'ATELIER VAPOR',
    title: 'Midnight Amber Extract',
    channel: 'Instagram Boost',
    roas: '8.4x ROAS',
    metric: 'AOV ₹6,800 · 0% Stockout Bleed',
  },
  {
    src: 'https://images.unsplash.com/photo-1483721074577-83a5ce03673b?w=600&auto=format&fit=crop&q=80',
    alt: 'Activewear Apparel Ad',
    brand: 'STRIDE PRO',
    title: 'Seamless Kinetic Legging',
    channel: 'Amazon Sponsored',
    roas: '5.3x ROAS',
    metric: 'Circuit Breaker Auto-Protected',
  },
  {
    src: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
    alt: 'Modern Living Ceramics Ad',
    brand: 'TERRA FORM',
    title: 'Sculptural Vessel Series',
    channel: 'Google Shopping',
    roas: '4.7x ROAS',
    metric: 'DoWhy DAG Causal Factor Isolated',
  },
  {
    src: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=600&auto=format&fit=crop&q=80',
    alt: 'Biometric Ring Ad',
    brand: 'PULSE MATRIX',
    title: 'Circadian Biometric Ring',
    channel: 'Snapchat AR',
    roas: '5.9x ROAS',
    metric: '99.8% Hardware Entropy Match',
  },
  {
    src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    alt: 'High Fashion Editorial Ad',
    brand: 'NOVA COUTURE',
    title: 'Autumn Solstice Runway',
    channel: 'Meta Reels 9:16',
    roas: '7.6x ROAS',
    metric: 'Zero Cookie Attribution Stitched',
  },
];

const HERO_TELEMETRY_STATS = [
  { label: 'AVERAGE CONTRIBUTION POAS', value: '4.82x', change: '+142% vs Human Agencies', tag: 'NET PROFIT' },
  { label: 'MANAGED AD CAPITAL', value: '₹24.8Cr', change: 'Meta · TikTok · Google · Amazon', tag: 'CROSS-CHANNEL' },
  { label: 'ALGORITHMIC INTERVENTION', value: '<15m', change: 'Automated Stockout Circuit Breaker', tag: 'REAL-TIME' },
  { label: 'ZERO-COOKIE ATTRIBUTION', value: '99.8%', change: 'Deterministic Hardware Entropy', tag: 'IDENTITY GRAPH' },
];

export function LandingPageView() {
  const [tickerIndex, setTickerIndex] = useState(0);

  // Rotating kinetic headline badge
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % AGENCY_TICKER_ITEMS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-foreground'>
      {/* LANDING PAGE TOP BAR (NotchNavbar with balanced optical symmetry) */}
      <NotchNavbar />

      {/* 1. AD AGENCY HERO SECTION WITH 3D CYLINDER CAROUSEL */}
      <section id='overview' className='relative pt-24 pb-20 md:pt-28 md:pb-32 overflow-hidden border-b border-border/60 scroll-mt-16'>
        {/* VGPU Canvas Dynamic Waveform Background Layer */}
        <div className='absolute inset-0 pointer-events-none overflow-hidden z-0'>
          <VGPUCanvas className='opacity-40 dark:opacity-50' intensity={0.85} />
          {/* Ambient Radial Spotlight */}
          <div className='absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(59,130,246,0.12),transparent_70%)] pointer-events-none' />
        </div>

        <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center'>
          {/* Animated Agency Eyebrow Status Badge with Ping Indicator */}
          <div className='inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border/80 bg-background/85 dark:bg-zinc-950/85 backdrop-blur-md shadow-xs mb-6 group hover:border-primary/40 transition-all duration-300'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'></span>
            </span>
            <span className='font-mono text-[11px] font-semibold tracking-wider uppercase text-foreground/90'>
              AUTONOMOUS AD AGENCY
            </span>
            <span className='h-3 w-px bg-border/80' />
            <span className='font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 transition-opacity duration-300'>
              {AGENCY_TICKER_ITEMS[tickerIndex]}
            </span>
          </div>

          {/* Master Ad Agency Headline with Static Gradient Text Animations */}
          <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.035em] text-foreground max-w-5xl leading-[1.08] mb-6 apple-display'>
            We Automate Winning Ad Creatives &{' '}
            <span className='relative inline-block'>
              <span className='bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600 dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300 bg-clip-text text-transparent font-black'>
                Multi-Channel Capital.
              </span>
              <span className='absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/60 to-indigo-500/0' />
            </span>
          </h1>

          {/* Ad Agency Mission Statement Subtitle */}
          <p className='text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl font-normal leading-relaxed mb-8 apple-subhead'>
            Where elite creative direction meets mathematical convex optimization. NEXUS autonomously tests, scales, and protects your D2C advertising budget across Meta, TikTok, Google, and Amazon — eliminating budget bleed in &lt;15 minutes to guarantee ground-truth net contribution profit.
          </p>

          {/* Primary Action Button Group */}
          <div className='flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12'>
            <GlowButton
              href='/dashboard/overview'
              size='lg'
              variant='default'
              className='font-mono text-sm shadow-md'
            >
              Enter NEXUS D2C →
            </GlowButton>

            <GlowButton
              href='/dashboard/playground'
              size='lg'
              variant='outline'
              className='font-mono text-sm'
            >
              Live Ad Playground →
            </GlowButton>

            <GlowButton
              href='/dashboard/simulator'
              size='lg'
              variant='outline'
              className='font-mono text-sm'
            >
              Campaign Simulator
            </GlowButton>
          </div>

          {/* 3D CYLINDER CAROUSEL CENTERPIECE (VengenceUI Component) */}
          <div className='w-full max-w-6xl my-4 relative'>
            {/* Subtle Ambient Floor Glow */}
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-64 bg-blue-500/10 dark:bg-blue-600/15 blur-3xl rounded-full pointer-events-none' />

            <div className='relative z-10'>
              <CylinderCarousel
                images={AD_AGENCY_CREATIVES}
                cardWidth={230}
                animationDuration={38}
                className='h-[480px] md:h-[540px]'
              />
            </div>

            {/* Micro Ticker Caption under Carousel */}
            <div className='flex items-center justify-center gap-2 mt-2 font-mono text-[11px] text-muted-foreground/80 tracking-wider uppercase'>
              <Sparkles className='size-3 text-blue-500' />
              <span>12 AUTONOMOUS AD FORMATS • 3D ROTATING PERSPECTIVE • HOVER TO PAUSE</span>
            </div>
          </div>

          {/* LIVE AGENCY TELEMETRY METRIC STRIP */}
          <div className='w-full max-w-6xl mt-10 sm:mt-14'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4'>
              {HERO_TELEMETRY_STATS.map((stat, idx) => (
                <div
                  key={idx}
                  className='p-4 sm:p-5 rounded-2xl bg-card/60 dark:bg-zinc-900/60 backdrop-blur-md border border-border/80 flex flex-col justify-between text-left group hover:border-primary/40 transition-colors'
                >
                  <div className='flex items-center justify-between gap-1 mb-2'>
                    <span className='font-mono text-[10px] text-muted-foreground uppercase tracking-wider'>
                      {stat.label}
                    </span>
                    <span className='font-mono text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold'>
                      {stat.tag}
                    </span>
                  </div>
                  <div className='font-mono text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-1'>
                    {stat.value}
                  </div>
                  <div className='font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate'>
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPANDABLE / AGENT BENTO GRID (FEATURES & ARCHITECTURE) */}
      <section id='features' className='py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-muted/20 border-b border-border/60 scroll-mt-16 relative'>
        <span id='bento' className='absolute -top-20' />
        <div className='text-center max-w-3xl mx-auto mb-14'>
          <div className='font-mono text-xs font-bold text-primary uppercase tracking-widest mb-2'>
            CORE SYSTEM PILLARS
          </div>
          <h2 className='text-3xl md:text-4xl font-extrabold tracking-[-0.025em] text-foreground mb-4 apple-title'>
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
              <span className='font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'>
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
              <span className='font-mono text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold'>
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
              <span className='font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'>
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
              <span className='font-mono text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold'>
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
