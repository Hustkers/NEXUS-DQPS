'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface GradientCardItem {
  title: string;
  desc: string;
  gradientFrom: string;
  gradientTo: string;
  step?: string;
  badge?: string;
  href?: string;
  ctaText?: string;
}

export const defaultGradientCards: GradientCardItem[] = [
  {
    title: 'Card one',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    gradientFrom: '#ffbc00',
    gradientTo: '#ff0058',
  },
  {
    title: 'Card two',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    gradientFrom: '#03a9f4',
    gradientTo: '#ff0058',
  },
  {
    title: 'Card three',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    gradientFrom: '#4dff03',
    gradientTo: '#00d0ff',
  },
];

export interface SkewCardsProps {
  cards?: GradientCardItem[];
  className?: string;
  cardWidth?: string;
  cardHeight?: string;
}

export default function SkewCards({
  cards = defaultGradientCards,
  className,
  cardWidth,
  cardHeight,
}: SkewCardsProps) {
  return (
    <>
      <div
        className={cn(
          'flex justify-center items-center flex-wrap py-6 w-full',
          className
        )}
      >
        {cards.map(
          (
            {
              title,
              desc,
              gradientFrom,
              gradientTo,
              step,
              badge,
              href,
              ctaText,
            },
            idx
          ) => (
            <div
              key={idx}
              className={cn(
                'group relative w-[310px] sm:w-[320px] min-h-[400px] h-[415px] m-[30px_16px] sm:m-[35px_22px] transition-all duration-500',
                cardWidth,
                cardHeight
              )}
            >
              {/* Skewed gradient panels */}
              <span
                className="absolute top-0 left-[50px] w-1/2 h-full rounded-lg transform skew-x-[15deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-90px)]"
                style={{
                  background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
                }}
              />
              <span
                className="absolute top-0 left-[50px] w-1/2 h-full rounded-lg transform skew-x-[15deg] blur-[30px] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-90px)]"
                style={{
                  background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
                }}
              />

              {/* Animated blurs */}
              <span className="pointer-events-none absolute inset-0 z-10">
                <span className="absolute top-0 left-0 w-0 h-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-100 animate-blob group-hover:top-[-50px] group-hover:left-[50px] group-hover:w-[100px] group-hover:h-[100px] group-hover:opacity-100" />
                <span className="absolute bottom-0 right-0 w-0 h-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-500 animate-blob animation-delay-1000 group-hover:bottom-[-50px] group-hover:right-[50px] group-hover:w-[100px] group-hover:h-[100px] group-hover:opacity-100" />
              </span>

              {/* Content */}
              <div className="relative z-20 left-0 p-[24px_30px] bg-zinc-950/80 dark:bg-[rgba(255,255,255,0.05)] border border-white/10 backdrop-blur-[14px] shadow-2xl rounded-xl text-white transition-all duration-500 group-hover:left-[-20px] group-hover:p-[44px_30px] flex flex-col justify-between h-full">
                <div>
                  {(step || badge) && (
                    <div className="flex items-center justify-between mb-3">
                      {step && (
                        <span className="font-orbitron text-xl sm:text-2xl font-black text-white/95 tracking-tight">
                          {step}
                        </span>
                      )}
                      {badge && (
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/20">
                          {badge}
                        </span>
                      )}
                    </div>
                  )}

                  <h2 className="text-xl sm:text-2xl font-orbitron font-bold mb-2 tracking-tight text-white leading-tight">
                    {title}
                  </h2>
                  <p className="text-xs sm:text-sm leading-relaxed mb-4 text-white/80 font-sans">
                    {desc}
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={href || '#'}
                    className="inline-block text-xs sm:text-sm font-bold font-mono text-black bg-white px-3.5 py-2 rounded shadow hover:bg-[#ffcf4d] hover:border hover:border-[rgba(255,0,88,0.4)] hover:shadow-md transition-all duration-200 active:scale-95"
                  >
                    {ctaText || 'Read More'}
                  </a>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Tailwind custom utilities for animation and shadows */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes blob {
            0%, 100% { transform: translateY(10px); }
            50% { transform: translate(-10px); }
          }
          .animate-blob { animation: blob 2s ease-in-out infinite; }
          .animation-delay-1000 { animation-delay: -1s; }
          .shadow-\\[0_5px_15px_rgba\\(0\\,0\\,0\\,0\\.08\\)\\] { box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
        `
      }} />
    </>
  );
}

export { SkewCards };

export const DemoOne = () => {
  return <SkewCards />;
};
