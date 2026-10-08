'use client';

import React from 'react';
import Link from 'next/link';
import { ContainerScroll, CardSticky } from '@/components/ui/cards-stack';
import { PlotFigure, BranchesFigure, PhosphorFigure, RiffleFigure } from './hairline-figures';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface PillarCardData {
  id: string;
  step: string;
  tag: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  actionText: string;
  figure: React.ReactNode;
}

export function PillarsCardsStack() {
  const cards: PillarCardData[] = [
    {
      id: 'pillar-1',
      step: '01',
      tag: 'Deterministic Math',
      badge: 'KKT CONVEX SOLVER',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      title: 'Equi-Marginal Bounded Budget Optimizer (PuLP / Scipy)',
      description:
        'Solves the Karush-Kuhn-Tucker (KKT) constrained optimization problem across channels. Reallocates capital to equalize marginal contribution profit under strict ±20% daily liquidity stability bounds to preserve ad platform algorithmic learning phases.',
      icon: <Icons.trendingUp className='size-5 text-emerald-500' />,
      href: '/dashboard/reallocations',
      actionText: 'Launch Convex Reallocations →',
      figure: (
        <div className='grid grid-cols-1 sm:grid-cols-12 gap-3 h-auto sm:h-44 p-3 bg-muted/30 border border-border/80 rounded-2xl'>
          <div className='sm:col-span-5 h-36 sm:h-full flex items-center justify-center p-1 relative hairline-container cursor-crosshair'>
            <PlotFigure intensity={0.75} className='size-full max-h-[140px]' label='KKT SLSQP' />
          </div>
          <div className='sm:col-span-7 flex flex-col justify-between font-mono text-xs py-1'>
            <div className='flex items-center justify-between text-muted-foreground border-b border-border/60 pb-1.5'>
              <span className='text-[10px] uppercase font-bold'>PULP / SCIPY FORMULATION</span>
              <span className='text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]'>
                OPTIMAL (18ms)
              </span>
            </div>
            <div className='bg-background/80 p-2 rounded-lg text-[10px] leading-relaxed text-foreground font-mono space-y-0.5 my-1 border border-border/50'>
              <div>max ∑ POAS_k(S_k) • GrossMargin_k</div>
              <div className='text-muted-foreground text-[9px]'>s.t. ∑ S_k ≤ B_total | ±20% Liquidity Bounds</div>
              <div className='text-emerald-600 dark:text-emerald-400 text-[9px]'>
                Circuit Breaker: Zero-Inventory Kill-Switch
              </div>
            </div>
            <div className='text-[10px] text-muted-foreground flex justify-between pt-0.5'>
              <span>1-Click Rollback</span>
              <span className='font-bold text-foreground'>Pointer-Reactive</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'pillar-2',
      step: '02',
      tag: 'Causal Inference',
      badge: 'DAG CAUSALITY',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      title: 'Counterfactual DAG Engine',
      description:
        'Separates ad copy failures from external confounders. When ROAS drops, factor decomposition isolates website latency, buy-box undercutting, and ERP stockouts before touching creative spend.',
      icon: <Icons.checkCircle className='size-5 text-sky-500' />,
      href: '/dashboard/anomalies',
      actionText: 'Launch Causal Diagnostics →',
      figure: (
        <div className='grid grid-cols-1 sm:grid-cols-12 gap-3 h-auto sm:h-44 p-3 bg-muted/30 border border-border/80 rounded-2xl'>
          <div className='sm:col-span-5 h-36 sm:h-full flex items-center justify-center p-1 relative hairline-container cursor-crosshair'>
            <BranchesFigure intensity={0.8} className='size-full max-h-[140px]' label='Causal DAG' />
          </div>
          <div className='sm:col-span-7 flex flex-col justify-between font-mono text-xs py-1'>
            <div className='flex items-center justify-between text-muted-foreground text-[10px] uppercase font-bold border-b border-border/60 pb-1.5'>
              <span>DoWhy-GCM Structural DAG</span>
              <span className='text-sky-500 font-bold'>CAUSAL</span>
            </div>
            <div className='bg-background/80 p-2.5 rounded-lg text-[10px] text-muted-foreground my-1 border border-border/50 leading-relaxed'>
              <div className='text-foreground font-semibold mb-0.5'>Structural Causal Model</div>
              <div>Estimates average treatment effects (ATE) across attribution paths isolating ad saturation from supply shocks.</div>
            </div>
            <div className='text-[10px] text-muted-foreground flex justify-between pt-1 border-t border-border/50'>
              <span>ERP vs Auction CPM</span>
              <span className='text-emerald-500 font-semibold'>99.4% Confidence</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'pillar-3',
      step: '03',
      tag: 'Identity Graph',
      badge: 'ZERO COOKIES',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      title: 'Walled-Garden Hardware Stitcher',
      description:
        '99.8% deterministic hardware entropy fingerprinting stitches YouTube impressions, TikTok ads, and Amazon marketplace checkouts without 3rd-party cookies or UTM parameters.',
      icon: <Icons.lock className='size-5' />,
      href: '/dashboard/fingerprint',
      actionText: 'Launch Identity Fingerprinter →',
      figure: (
        <div className='grid grid-cols-1 sm:grid-cols-12 gap-3 h-auto sm:h-44 p-3 bg-muted/30 border border-border/80 rounded-2xl'>
          <div className='sm:col-span-5 h-36 sm:h-full flex items-center justify-center p-1 relative hairline-container cursor-crosshair'>
            <PhosphorFigure intensity={0.7} className='size-full max-h-[140px]' label='Entropy Phosphor' />
          </div>
          <div className='sm:col-span-7 flex flex-col justify-between font-mono text-xs py-1'>
            <div className='flex items-center justify-between text-muted-foreground text-[10px] uppercase font-bold border-b border-border/60 pb-1.5'>
              <span>Hardware Entropy CRT</span>
              <span className='text-emerald-500 font-bold'>99.8% MATCH</span>
            </div>
            <div className='bg-background/80 p-2.5 rounded-lg text-[10px] text-muted-foreground my-1 border border-border/50 leading-relaxed'>
              <div className='text-foreground font-semibold mb-0.5'>GPU Canvas SHA256 Stitcher</div>
              <div>Captures WebGL rendering primitives and screen refresh entropy to stitch cross-device purchase trajectories.</div>
            </div>
            <div className='text-[10px] text-muted-foreground flex justify-between pt-1 border-t border-border/50'>
              <span>GPU Canvas SHA256</span>
              <span className='text-foreground font-semibold'>Zero 3P Cookies</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'pillar-4',
      step: '04',
      tag: 'Continuous Feedback',
      badge: 'DUCKDB + POSTGRES',
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
      title: 'Autonomous Execution Ledger with Reinforcement Feedback',
      description:
        'Every single budget shift is committed to an immutable ledger with predicted vs realized contribution margin. Model weights and adstock decay curves automatically tune in DuckDB/PostgreSQL based on accuracy variances.',
      icon: <Icons.clipboardText className='size-5 text-primary' />,
      href: '/dashboard/ledger',
      actionText: 'Open Decision Ledger →',
      figure: (
        <div className='grid grid-cols-1 sm:grid-cols-12 gap-3 h-auto sm:h-44 p-3 bg-muted/30 border border-border/80 rounded-2xl'>
          <div className='sm:col-span-5 h-36 sm:h-full flex items-center justify-center p-1 relative hairline-container cursor-crosshair'>
            <RiffleFigure intensity={0.65} className='size-full max-h-[140px]' label='Decision Ledger' />
          </div>
          <div className='sm:col-span-7 flex flex-col justify-between font-mono text-xs py-1'>
            <div className='flex items-center justify-between text-muted-foreground text-[10px] uppercase font-bold border-b border-border/60 pb-1.5'>
              <span>Reinforcement Variance Ledger</span>
              <span className='text-emerald-600 dark:text-emerald-400 font-semibold'>ACCURACY: 96.8%</span>
            </div>
            <div className='grid grid-cols-3 gap-1.5 text-center my-1'>
              <div className='p-1.5 rounded-lg bg-background/80 border border-border/50'>
                <div className='text-[9px] text-muted-foreground'>Predicted Lift</div>
                <div className='text-xs font-bold text-foreground'>+₹3,450/d</div>
              </div>
              <div className='p-1.5 rounded-lg bg-background/80 border border-border/50'>
                <div className='text-[9px] text-muted-foreground'>Realized Lift</div>
                <div className='text-xs font-bold text-emerald-600 dark:text-emerald-400'>+₹3,610/d</div>
              </div>
              <div className='p-1.5 rounded-lg bg-background/80 border border-border/50'>
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
      )
    }
  ];

  return (
    <ContainerScroll
      className='w-full max-w-5xl mx-auto pt-4'
      style={{ paddingBottom: '90vh' }}
    >
      {cards.map((card, index) => {
        const isLast = index === cards.length - 1;
        return (
          <CardSticky
            key={card.id}
            index={index}
            incrementY={16}
            incrementZ={10}
            baseTop={88}
            className='w-full'
            style={{
              marginBottom: isLast ? '0px' : '45vh'
            }}
          >
            <div className='rounded-3xl border border-border/80 bg-card dark:bg-zinc-950 shadow-2xl p-6 sm:p-8 md:p-10 transition-all duration-300 relative overflow-hidden group hover:border-primary/50'>
              {/* Top Bar: Tag Badge & Big Step Index */}
              <div className='flex items-center justify-between gap-4 mb-4 sm:mb-6 border-b border-border/60 pb-4'>
                <div className='flex items-center gap-3 flex-wrap'>
                  <span className='p-2 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center'>
                    {card.icon}
                  </span>
                  <span className='font-mono text-xs font-bold text-muted-foreground tracking-wider uppercase'>
                    {card.tag}
                  </span>
                  <span
                    className={cn(
                      'font-orbitron text-[10px] px-2.5 py-0.5 rounded-full font-bold border',
                      card.badgeColor
                    )}
                  >
                    {card.badge}
                  </span>
                </div>

                {/* Step number matching video (01, 02, 03, 04) */}
                <div className='font-orbitron font-extrabold text-3xl sm:text-4xl text-primary/80 tracking-tight'>
                  {card.step}
                </div>
              </div>

              {/* Middle Grid: Title + Description on left, Hairline Instrument on right */}
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
                <div className='lg:col-span-5 flex flex-col justify-between space-y-4'>
                  <div>
                    <h3 className='font-orbitron font-bold text-xl sm:text-2xl text-foreground tracking-tight leading-snug mb-3 group-hover:text-primary transition-colors'>
                      {card.title}
                    </h3>
                    <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
                      {card.description}
                    </p>
                  </div>

                  <div className='pt-2'>
                    <Link
                      href={card.href}
                      className='inline-flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-primary hover:text-primary/80 transition-colors group/link'
                    >
                      <span>{card.actionText}</span>
                      <span className='group-hover/link:translate-x-1 transition-transform'>→</span>
                    </Link>
                  </div>
                </div>

                {/* Hairline Visual Figure Preview */}
                <div className='lg:col-span-7 w-full'>
                  {card.figure}
                </div>
              </div>
            </div>
          </CardSticky>
        );
      })}
    </ContainerScroll>
  );
}

export default PillarsCardsStack;
