"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* =============================================================================
   StackedLogos Component (Full-Bleed Responsive Grid)
   
   Multiple logo sets that smoothly rotate while stacked on top of each other.
   Supports edge-to-edge full length spanning (extreme left to right) and
   dead-center alignment within every box.
   
   State-controlled rotation guarantees that EXACTLY ONE brand is visible at any
   moment per cell, making overlapping or smudged brand text physically impossible.
============================================================================= */

export interface StackedLogosProps {
  /** Array of logo groups - each group is an array of React nodes */
  logoGroups: React.ReactNode[][];
  /** Interval in milliseconds between logo rotations. Default: 3600 */
  intervalMs?: number;
  /** Animation duration in seconds (legacy prop). Default: 24 */
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

export const StackedLogos = ({
  logoGroups,
  intervalMs = 3600,
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

  // Controlled active index state guarantees zero overlapping brand rendering
  const [activeStep, setActiveStep] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (isPaused || itemCount <= 1) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % itemCount);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, itemCount, intervalMs]);

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

  return (
    <div
      ref={containerRef}
      className={cn("stacked-logos relative w-full overflow-hidden select-none", className)}
      style={
        {
          "--mouse-x": "0px",
          "--mouse-y": "0px",
          "--logo-width": fullWidth ? colWidthCalc : logoWidth,
          "--cell-height": `${cellHeight}px`,
        } as React.CSSProperties
      }
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .stacked-logos:hover .stacked-logos__glow {
              opacity: 1;
            }
            .stacked-logos:hover .stacked-logos__border-glow {
              opacity: 1;
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
          // Offsets each column so different brands display across the ribbon simultaneously
          const currentVisibleIndex = (activeStep + groupIndex) % logos.length;

          return (
            <div
              key={groupIndex}
              className="stacked-logos__cell relative h-[120px] sm:h-[136px] w-full overflow-hidden flex items-center justify-center"
            >
              {/* Theme-aware vertical divider line */}
              <div className="absolute top-0 bottom-0 right-0 w-px bg-border/60 pointer-events-none" />
              {groupIndex === 0 && (
                <div className="absolute top-0 bottom-0 left-0 w-px bg-border/60 pointer-events-none" />
              )}

              {/* Stacked rotating logos centered inside cell with strict single-item visibility */}
              {logos.map((logo, logoIndex) => {
                const isCurrent = logoIndex === currentVisibleIndex;

                return (
                  <div
                    key={logoIndex}
                    className={cn(
                      "absolute inset-0 flex items-center justify-center px-4 w-full h-full text-center select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      isCurrent
                        ? "opacity-100 scale-100 translate-y-0 filter-none pointer-events-auto visible z-10"
                        : "opacity-0 scale-95 translate-y-3 blur-[4px] pointer-events-none invisible z-0"
                    )}
                  >
                    <div className="w-full flex items-center justify-center text-center">
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
