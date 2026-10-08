"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* =============================================================================
   StackedLogos Component (Full-Bleed Responsive Grid)
   
   Multiple logo sets that animate in/out while stacked on top of each other.
   Supports edge-to-edge full length spanning (extreme left to right) and
   dead-center alignment within every box.
   
   Mathematically synchronized CSS animation guarantees that EXACTLY ONE brand
   is visible at any given moment per cell, eliminating overlapping and smudged text.
============================================================================= */

export interface StackedLogosProps {
  /** Array of logo groups - each group is an array of React nodes */
  logoGroups: React.ReactNode[][];
  /** Animation duration in seconds for a full cycle. Default: 24 */
  duration?: number;
  /** Stagger factor for animation timing between groups. Default: 0 */
  stagger?: number;
  /** Width of each logo container when not fullWidth. Default: "200px" */
  logoWidth?: string;
  /** Whether to stretch edge-to-edge across the entire website width. Default: true */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * StackedLogos Component
 */
export const StackedLogos = ({
  logoGroups,
  duration = 24,
  stagger = 0,
  logoWidth = "200px",
  fullWidth = true,
  className,
}: StackedLogosProps) => {
  const itemCount = Math.max(logoGroups[0]?.length || 4, 1);
  const columns = logoGroups.length;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);

  // Stagger delays calculated in JavaScript to guarantee cross-browser timing precision
  const baseDelays = React.useMemo(() => {
    return logoGroups.map((_, groupIndex) => {
      if (!stagger || columns <= 1) return 0;
      return Math.sin((groupIndex / columns) * (Math.PI / 4)) * stagger;
    });
  }, [logoGroups, columns, stagger]);

  // Track mouse position for radial border & background glow
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || !gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      containerRef.current.style.setProperty("--mouse-x", `${x}px`);
      containerRef.current.style.setProperty("--mouse-y", `${y}px`);
    },
    [],
  );

  const cellHeight = 136;
  const colWidthCalc = fullWidth ? `calc(100% / ${columns})` : logoWidth;

  // Keyframe percentages calculated for the exact number of items:
  // For 4 items: p = 25% window per item. Fades in in 3%, stays solid for 19%, fades out in 3%.
  const p = 100 / itemCount;
  const fadeInEnd = Number((p * 0.12).toFixed(2));
  const fadeOutStart = Number((p * 0.88).toFixed(2));
  const fadeOutEnd = Number(p.toFixed(2));

  return (
    <div
      ref={containerRef}
      className={cn("stacked-logos relative w-full overflow-hidden", className)}
      style={
        {
          "--duration": duration,
          "--items": itemCount,
          "--lists": columns,
          "--stagger": stagger,
          "--logo-width": fullWidth ? colWidthCalc : logoWidth,
          "--cell-height": `${cellHeight}px`,
        } as React.CSSProperties
      }
      onMouseMove={handleMouseMove}
    >
      {/* Self-contained animations ensuring zero smudging or overlapping */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .stacked-logos:hover .stacked-logos__glow {
              opacity: 1;
            }

            .stacked-logos:hover .stacked-logos__border-glow {
              opacity: 1;
            }

            .stacked-logos__item {
              opacity: 0;
              pointer-events: none;
              animation-name: stacked-logos-appear;
              animation-duration: ${duration}s;
              animation-fill-mode: both;
              animation-iteration-count: infinite;
              animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
              will-change: opacity, transform, filter;
            }

            @keyframes stacked-logos-appear {
              0% {
                opacity: 0;
                transform: translateY(8px) scale(0.96);
                filter: blur(4px);
                pointer-events: none;
              }
              ${fadeInEnd}% {
                opacity: 1;
                transform: translateY(0px) scale(1);
                filter: blur(0px);
                pointer-events: auto;
              }
              ${fadeOutStart}% {
                opacity: 1;
                transform: translateY(0px) scale(1);
                filter: blur(0px);
                pointer-events: auto;
              }
              ${fadeOutEnd}% {
                opacity: 0;
                transform: translateY(-8px) scale(0.96);
                filter: blur(4px);
                pointer-events: none;
              }
              100% {
                opacity: 0;
                transform: translateY(-8px) scale(0.96);
                filter: blur(4px);
                pointer-events: none;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .stacked-logos__item {
                animation: none !important;
              }
              .stacked-logos__item:first-child {
                opacity: 1 !important;
                pointer-events: auto !important;
                transform: none !important;
                filter: none !important;
              }
              .stacked-logos__item:not(:first-child) {
                display: none !important;
              }
            }
          `,
        }}
      />

      {/* Grid Container (Full-bleed edge-to-edge) */}
      <div
        ref={gridRef}
        className={cn(
          "grid relative w-full border-y border-border/70",
          !fullWidth && "mx-auto w-fit"
        )}
        style={{
          gridTemplateColumns: fullWidth
            ? `repeat(${columns}, minmax(0, 1fr))`
            : `repeat(${columns}, ${logoWidth})`,
        }}
      >
        {/* Mouse-following background glow overlay */}
        <div
          className="stacked-logos__glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 z-10"
          style={{
            background:
              "radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(251,191,36,0.12), transparent 70%)",
          }}
        />

        {/* Mouse-following border glow overlay */}
        <div
          className="stacked-logos__border-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 z-20"
          style={{
            background:
              "radial-gradient(700px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(251,191,36,0.9), transparent 45%)",
            maskImage: `
              repeating-linear-gradient(to right, transparent, transparent calc(${colWidthCalc} - 1px), black calc(${colWidthCalc} - 1px), black ${colWidthCalc}),
              linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent calc(100% - 1px), black calc(100% - 1px), black 100%)
            `,
            WebkitMaskImage: `
              repeating-linear-gradient(to right, transparent, transparent calc(${colWidthCalc} - 1px), black calc(${colWidthCalc} - 1px), black ${colWidthCalc}),
              linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent calc(100% - 1px), black calc(100% - 1px), black 100%)
            `,
            maskComposite: "add",
            WebkitMaskComposite: "source-over",
          }}
        />

        {/* Left edge glow */}
        <div
          className="stacked-logos__border-glow pointer-events-none absolute top-0 bottom-0 left-0 w-px opacity-0 transition-opacity duration-300 z-20"
          style={{
            background:
              "radial-gradient(700px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(251,191,36,0.9), transparent 45%)",
          }}
        />

        {/* Logo Groups (Columns) */}
        {logoGroups.map((logos, groupIndex) => {
          const baseDelay = baseDelays[groupIndex] || 0;

          return (
            <div
              key={groupIndex}
              className="stacked-logos__cell relative grid min-h-[110px] sm:min-h-[128px] md:min-h-[136px]"
              style={
                {
                  "--index": groupIndex,
                  gridTemplate: "1fr / 1fr",
                } as React.CSSProperties
              }
            >
              {/* Theme-aware vertical divider line */}
              <div className="absolute top-0 bottom-0 right-0 w-px bg-border/60" />
              {groupIndex === 0 && (
                <div className="absolute top-0 bottom-0 left-0 w-px bg-border/60" />
              )}

              {/* Stacked rotating logos centered inside cell */}
              {logos.map((logo, logoIndex) => {
                // Precise negative animation-delay: each item enters its active window sequentially
                const itemDelay =
                  (duration / itemCount) * (itemCount - logoIndex) * -1 +
                  baseDelay;

                return (
                  <div
                    key={logoIndex}
                    className="stacked-logos__item col-start-1 row-start-1 flex items-center justify-center py-8 sm:py-10 md:py-12 px-3 sm:px-6 w-full h-full text-center select-none"
                    data-logo
                    style={
                      {
                        "--i": logoIndex,
                        animationDelay: `${itemDelay.toFixed(3)}s`,
                        WebkitAnimationDelay: `${itemDelay.toFixed(3)}s`,
                      } as React.CSSProperties
                    }
                  >
                    <div className="stacked-logos__logo w-full flex items-center justify-center text-center">
                      {logo}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

StackedLogos.displayName = "StackedLogos";

export default StackedLogos;
