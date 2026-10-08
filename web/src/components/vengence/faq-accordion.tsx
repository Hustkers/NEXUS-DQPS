'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export interface FaqAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: FaqItem[];
  title?: string;
  badge?: string;
  subtitle?: string;
}

export const NEXUS_FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How does NEXUS prevent ad spend waste when inventory goes out of stock?',
    answer:
      'NEXUS bridges your Shopify ERP inventory feeds with ad channels every 15 minutes. When SKU stock levels hit zero, an autonomous circuit breaker halts the specific campaign or ad set within minutes—preventing wasted ad spend while leaving healthy inventory campaigns active.'
  },
  {
    question: 'How is NEXUS different from generic LLM agents or rules-based ad tools?',
    answer:
      'Generic LLMs hallucinate when balancing multi-variable constraints across ad networks. NEXUS pairs deterministic SciPy KKT convex optimization with DoWhy-GCM causal inference. The mathematical optimizer converges in 18ms under ±20% platform learning bounds, while causal DAGs isolate actual ad creative fatigue from external factors like site latency or buy-box loss.'
  },
  {
    question: 'Does NEXUS require 3rd-party tracking cookies or UTM parameters?',
    answer:
      'No. NEXUS incorporates a 99.8% deterministic hardware entropy engine utilizing GPU Canvas SHA256 and WebGL fingerprinting. Cross-channel touchpoints across YouTube, TikTok, and Amazon are stitched into a unified customer journey without relying on deprecated third-party cookies or fragile UTM tags.'
  },
  {
    question: 'Can human operators review or override automated budget reallocations?',
    answer:
      'Yes. NEXUS supports both Autonomous Mode and Supervised Mode. In Supervised Mode, every recommended budget shift triggers a dashboard notification with 1-click execution. In Autonomous Mode, guardrails enforce strict daily liquidity limits, and every mutation includes instant 1-click rollback.'
  },
  {
    question: 'Which ad platforms and ecommerce systems are natively supported?',
    answer:
      'NEXUS provides bidirectional API connectors for Meta Ads (Facebook & Instagram), Google Ads (Search, Performance Max & YouTube), Amazon Sponsored Products, and TikTok Ads, with real-time order, inventory, and SKU data synchronized directly from Shopify and GA4.'
  },
  {
    question: 'How does the reinforcement variance ledger ensure financial accuracy?',
    answer:
      'Every programmatic budget shift is committed to an immutable DuckDB and PostgreSQL ledger with predicted versus realized margin delta. At the end of each attribution window, realized lift is reconciled against forecasts to continually tune Hill saturation curves and adstock decay parameters.'
  }
];

export function FaqAccordion({
  items = NEXUS_FAQ_ITEMS,
  title = 'Frequently Asked Questions',
  badge,
  subtitle = 'Clear answers on our deterministic solver, causal DAG root-cause attribution, zero-cookie hardware stitcher, and autonomous execution guardrails.',
  className,
  ...props
}: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto py-8 relative font-sans', className)} {...props}>
      {(title || subtitle) && (
        <div className='text-center max-w-3xl mx-auto mb-10 sm:mb-14'>
          {title && (
            <h2 className='text-3xl md:text-4xl font-orbitron font-extrabold tracking-tight text-foreground mb-4'>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className='text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto'>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <ul className='w-full mx-auto list-none p-0 flex flex-col space-y-3'>
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={index}
              className={cn(
                'w-full relative rounded-2xl overflow-hidden transition-all duration-300 ease-in border',
                isActive
                  ? 'border-primary/40 bg-card/90 shadow-lg'
                  : 'border-border/80 bg-card/50 hover:border-border hover:bg-card/70'
              )}
            >
              <button
                type='button'
                className={cn(
                  'flex flex-row items-center justify-start w-full min-h-[64px] py-4 sm:py-5 relative m-0 px-4 pl-14 sm:pl-16 cursor-pointer',
                  'border-l-[6px] md:border-l-[10px] transition-colors duration-200 text-left outline-none text-base md:text-lg',
                  isActive
                    ? 'border-l-primary bg-primary/5 text-foreground font-semibold font-orbitron'
                    : 'border-l-border/80 bg-transparent text-foreground/80 hover:border-l-primary/60 hover:text-foreground'
                )}
                onClick={() => toggleItem(index)}
                aria-expanded={isActive}
              >
                {/* Plus/Minus Indicator */}
                <span
                  className={cn(
                    'absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 transition-all duration-200 leading-none select-none font-mono',
                    isActive
                      ? 'text-[28px] sm:text-[34px] font-bold text-primary'
                      : 'text-[22px] sm:text-[26px] font-normal text-muted-foreground'
                  )}
                >
                  {isActive ? '−' : '+'}
                </span>

                <span className='pr-8 text-sm sm:text-base font-orbitron font-bold tracking-tight'>
                  {item.question}
                </span>

                {/* Chevron */}
                <span
                  className={cn(
                    'absolute right-5 sm:right-6 block size-2.5 border-t-2 border-r-2 transition-transform duration-200 ease-in-out',
                    isActive
                      ? 'rotate-[-45deg] border-primary translate-y-0.5'
                      : 'rotate-[135deg] border-muted-foreground -translate-y-0.5'
                  )}
                />
              </button>

              <div
                className={cn(
                  'grid transition-all duration-300 ease-in-out w-full',
                  'border-l-[6px] md:border-l-[10px]',
                  isActive
                    ? 'grid-rows-[1fr] border-l-primary bg-primary/5'
                    : 'grid-rows-[0fr] border-l-border/80 bg-transparent'
                )}
              >
                <div className='overflow-hidden'>
                  <div className='flex flex-row items-start justify-start w-full px-4 pl-14 sm:pl-16 pb-6 pt-2 text-xs sm:text-sm md:text-base font-normal text-muted-foreground leading-relaxed'>
                    <span className='opacity-95'>{item.answer}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FaqAccordion;
