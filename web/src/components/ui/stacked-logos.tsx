"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* =============================================================================
   StackedLogos Component (Full-Bleed Responsive Grid)
   
   Multiple logo sets that animate in/out while stacked on top of each other.
   Supports edge-to-edge full length spanning (extreme left to right) and
   dead-center alignment within every box.
============================================================================= */

export interface StackedLogosProps {
  /** Array of logo groups - each group is an array of React nodes */
  logoGroups: React.ReactNode[][];
  /** Animation duration in seconds. Default: 30 */
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
  duration = 30,
  stagger = 0,
  logoWidth = "200px",
  fullWidth = true,
  className,
}: StackedLogosProps) => {
  const itemCount = logoGroups[0]?.length || 0;
  const columns = logoGroups.length;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);

  // Track mouse position for glow effect
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
        {logoGroups.map((logos, groupIndex) => (
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
            {logos.map((logo, logoIndex) => (
              <div
                key={logoIndex}
                className="stacked-logos__item col-start-1 row-start-1 flex items-center justify-center py-8 sm:py-10 md:py-12 px-3 sm:px-6 w-full h-full text-center select-none"
                data-logo
                style={{ "--i": logoIndex } as React.CSSProperties}
              >
                <div className="stacked-logos__logo w-full flex items-center justify-center text-center">
                  {logo}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

StackedLogos.displayName = "StackedLogos";

export default StackedLogos;
