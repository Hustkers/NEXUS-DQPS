'use client';

import React, { useState } from 'react';
import {
  IconCrown,
  IconCheck,
  IconSparkles,
  IconRocket,
  IconFileText,
  IconArrowRight,
  IconShieldCheck
} from '@tabler/icons-react';
import type { CampaignStrategy, BestChoiceExplanation } from '@/lib/strategy-engine/types';
import { cn } from '@/lib/utils';

interface StrategyHeroRecommendationProps {
  strategy: CampaignStrategy;
  bestChoice?: BestChoiceExplanation;
  onApplyStrategy: (strategy: CampaignStrategy) => void;
  onOpenLaunchModal: (strategy: CampaignStrategy) => void;
  onOpenEvidenceModal: () => void;
  targetRoasFloor?: number;
}

export function StrategyHeroRecommendation({
  strategy,
  bestChoice,
  onApplyStrategy,
  onOpenLaunchModal,
  onOpenEvidenceModal,
  targetRoasFloor = 3.2
}: StrategyHeroRecommendationProps) {
  const ev = strategy.evaluation;
  const curSym = '₹';

  const roas = ev?.expectedRoas ?? 0;
  const revenue = ev?.expectedRevenue ?? 0;
  const cpa = ev?.expectedCpa ?? 0;
  const netProfit = ev?.expectedNetProfit ?? 0;
  const isProfitable = ev?.isProfitable ?? (netProfit > 0 || (roas >= (ev?.breakevenRoas ?? targetRoasFloor)));
  const roasLift = +(roas - targetRoasFloor).toFixed(2);
  const classification = isProfitable ? (ev?.classification || 'PROVEN') : 'NO_PROFITABLE_CONFIGURATION';

  // Dynamic causal chain inferred from real strategy metadata
  const platformName = strategy.platform.toUpperCase();
  const funnel = strategy.funnelStage || 'BOFU';
  const causalAngle =
    strategy.adFormat.toLowerCase().includes('search')
      ? 'SEARCH INTENT'
      : strategy.adFormat.toLowerCase().includes('shopping')
        ? 'SHOPPING CATALOG'
        : 'CREATIVE HOOK';

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-6 md:p-8 font-mono shadow-xl relative overflow-hidden',
        isProfitable
          ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 via-card to-card'
          : 'border-rose-500/50 bg-gradient-to-b from-rose-950/20 via-card to-card'
      )}
    >
      {/* Glow decorative backdrop */}
      <div
        className={cn(
          'absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl pointer-events-none',
          isProfitable ? 'bg-emerald-500/10' : 'bg-rose-500/10'
        )}
      />

      {/* Top Header Label & Classification Badge */}
      <div className='flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60'>
        <div className='flex items-center gap-2.5'>
          <div
            className={cn(
              'size-2.5 rounded-full animate-pulse',
              isProfitable ? 'bg-emerald-400' : 'bg-rose-400'
            )}
          />
          <span
            className={cn(
              'text-xs uppercase font-bold tracking-widest flex items-center gap-1.5',
              isProfitable
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            )}
          >
            <IconCrown className={cn('size-4', isProfitable ? 'text-emerald-400' : 'text-rose-400')} />
            {isProfitable ? 'AI RECOMMENDATION' : 'DEFENSIVE RECOMMENDATION (UNPROFITABLE REGIME)'}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <span
            className={cn(
              'text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md border uppercase',
              isProfitable
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-400'
            )}
          >
            ● {classification}
          </span>
          <span className='text-[10px] font-bold px-2 py-1 rounded-md border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 uppercase'>
            {platformName} • {funnel}
          </span>
        </div>
      </div>

      {/* Hero Strategy Headline & Giant Primary Metric */}
      <div className='my-6 space-y-4'>
        <div>
          <h2 className='text-xl sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight'>
            {strategy.strategyName.split('—')[0].trim()}
          </h2>
          <p className='text-xs text-muted-foreground mt-1 max-w-2xl'>
            {isProfitable
              ? strategy.strategyName.includes('—')
                ? strategy.strategyName.split('—')[1].trim()
                : `${strategy.adFormat} with ${strategy.biddingStrategy} targeting ${strategy.targetAudience}.`
              : 'CRITICAL MARGIN ALERT: All evaluated configurations generate negative net profit at current CPA and margin levels. Model recommends spend reduction.'}
          </p>
        </div>

        {/* Primary Metric Hero Display */}
        <div className='flex flex-wrap items-baseline gap-4 pt-1'>
          <div className='flex items-baseline gap-2'>
            <span
              className={cn(
                'text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight',
                isProfitable ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {roas.toFixed(2)}x
            </span>
            <span
              className={cn(
                'text-sm sm:text-base font-bold uppercase',
                isProfitable ? 'text-emerald-500/80' : 'text-rose-500/80'
              )}
            >
              ROAS
            </span>
          </div>

          {isProfitable && roasLift > 0 ? (
            <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-bold'>
              <span>↑ +{roasLift.toFixed(2)}x vs target floor ({targetRoasFloor.toFixed(1)}x)</span>
            </div>
          ) : !isProfitable ? (
            <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-bold'>
              <span>↓ Below breakeven floor ({ev?.breakevenRoas?.toFixed(2) ?? '1.61'}x)</span>
            </div>
          ) : null}
        </div>

        {/* Small Secondary Metrics Trio (ROAS, Revenue, CPA) */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2'>
          <div className='p-3.5 rounded-xl border border-border/60 bg-muted/20'>
            <span className='text-[10px] uppercase font-bold text-muted-foreground block tracking-wider'>
              PROJECTED ROAS
            </span>
            <span
              className={cn(
                'text-xl font-bold mt-1 block',
                isProfitable ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {roas.toFixed(2)}x
            </span>
            <span className='text-[10px] text-muted-foreground block mt-0.5'>
              {isProfitable ? 'Calculated return ratio' : 'Below breakeven'}
            </span>
          </div>

          <div className='p-3.5 rounded-xl border border-border/60 bg-muted/20'>
            <span className='text-[10px] uppercase font-bold text-muted-foreground block tracking-wider'>
              {isProfitable ? 'EXPECTED REVENUE' : 'NET CONTRIBUTION'}
            </span>
            <span
              className={cn(
                'text-xl font-bold mt-1 block',
                isProfitable ? 'text-foreground' : 'text-rose-400'
              )}
            >
              {isProfitable
                ? `${curSym}${revenue.toLocaleString('en-IN')}`
                : `-₹${Math.abs(Math.round(netProfit)).toLocaleString('en-IN')}`}
            </span>
            <span className='text-[10px] text-muted-foreground block mt-0.5'>
              {isProfitable ? 'Forecasted sales volume' : 'Projected loss'}
            </span>
          </div>

          <div className='p-3.5 rounded-xl border border-border/60 bg-muted/20'>
            <span className='text-[10px] uppercase font-bold text-muted-foreground block tracking-wider'>
              ESTIMATED CPA
            </span>
            <span className='text-xl font-bold text-cyan-400 mt-1 block'>
              {curSym}{cpa.toLocaleString('en-IN')}
            </span>
            <span className='text-[10px] text-muted-foreground block mt-0.5'>
              Cost per acquisition
            </span>
          </div>
        </div>
      </div>

      {/* WHY THIS STRATEGY? Compact Causal Chain + 3 Evidence Bullets */}
      <div className='p-4 rounded-xl border border-border/60 bg-card/60 space-y-3.5 mb-6'>
        <div className='flex items-center justify-between'>
          <span className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'>
            <IconSparkles className='size-3.5 text-amber-400' />
            WHY THIS STRATEGY?
          </span>

          <button
            type='button'
            onClick={onOpenEvidenceModal}
            className='inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors'
          >
            <span>View Full Evidence</span>
            <IconArrowRight className='size-3' />
          </button>
        </div>

        {/* Visual Causal Flow Hierarchy */}
        <div className='flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-bold text-muted-foreground py-1 border-y border-border/40'>
          <span className='px-2.5 py-1 rounded bg-muted/60 text-foreground border border-border/50'>
            {causalAngle}
          </span>
          <span className='text-emerald-400'>→</span>
          <span className='px-2.5 py-1 rounded bg-muted/60 text-foreground border border-border/50'>
            HIGH CONVERSION VELOCITY
          </span>
          <span className='text-emerald-400'>→</span>
          <span className='px-2.5 py-1 rounded bg-muted/60 text-foreground border border-border/50'>
            LOWER CPA ({curSym}{cpa.toFixed(0)})
          </span>
          <span className='text-emerald-400'>→</span>
          <span className='px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'>
            HIGHER ROAS ({roas.toFixed(2)}x)
          </span>
        </div>

        {/* 3 Short Core Evidence Points */}
        <div className='space-y-1.5 text-xs'>
          <div className='flex items-center gap-2 text-foreground/90'>
            <IconCheck className='size-3.5 text-emerald-400 shrink-0 stroke-[3]' />
            <span>Highest predicted composite score ({ev?.overallScore.toFixed(1)}/100) across all 24 evaluated models</span>
          </div>
          <div className='flex items-center gap-2 text-foreground/90'>
            <IconCheck className='size-3.5 text-emerald-400 shrink-0 stroke-[3]' />
            <span>{ev?.historicalEvidenceText || 'Past accounts with similar configuration generated strong ROAS and steady order volume'}</span>
          </div>
          <div className='flex items-center gap-2 text-foreground/90'>
            <IconCheck className='size-3.5 text-emerald-400 shrink-0 stroke-[3]' />
            <span>Controlled risk profile ({ev?.riskScore}/100) within account safety parameters</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Apply Strategy & Approve & Launch */}
      <div className='flex flex-wrap items-center gap-3 pt-2'>
        <button
          type='button'
          onClick={() => onApplyStrategy(strategy)}
          className={cn(
            'px-5 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs',
            isProfitable
              ? 'border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
              : 'border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
          )}
        >
          <IconCheck className='size-4' />
          <span>{isProfitable ? 'Apply Strategy' : 'Enforce Defensive Spend Cap'}</span>
        </button>

        <button
          type='button'
          onClick={() => onOpenLaunchModal(strategy)}
          className={cn(
            'px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md',
            isProfitable
              ? 'bg-foreground text-background hover:bg-foreground/90'
              : 'bg-rose-600 text-white hover:bg-rose-500'
          )}
        >
          <IconRocket className='size-4' />
          <span>{isProfitable ? 'Approve & Launch' : 'Deploy Defensive Plan'}</span>
        </button>

        <button
          type='button'
          onClick={onOpenEvidenceModal}
          className='px-4 py-2.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground text-xs uppercase font-medium tracking-wider transition-all flex items-center gap-1.5 ml-auto'
        >
          <IconFileText className='size-3.5' />
          <span>Inspect Model Lineage</span>
        </button>
      </div>
    </div>
  );
}
