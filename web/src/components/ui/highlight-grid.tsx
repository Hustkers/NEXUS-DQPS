"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface HighlightItem {
  label: string;
  /** Accent colour for this cell. Falls back to the cycled `colors` palette. */
  color?: string;
}

export interface HighlightGridProps {
  /** Rows of cells. Each row can hold a different number of cells. */
  rows?: HighlightItem[][];
  /** Palette cycled for cells without an explicit `color`. */
  colors?: string[];
  /** Highlight transition duration in ms. Defaults to 250. */
  transitionDuration?: number;
  /** Park the highlight on the first cell on mount. Defaults to true. */
  highlightFirst?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

const DEFAULT_COLORS = [
  "#10B981", // emerald
  "#06B6D4", // cyan
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#F59E0B", // amber
  "#6366F1", // indigo
  "#14B8A6", // teal
];

export const NEXUS_PROJECT_TECH_STACK_ROWS: HighlightItem[][] = [
  [
    { label: "next.js 16", color: "#3B82F6" },
    { label: "react 19", color: "#06B6D4" },
    { label: "typescript", color: "#2563EB" },
    { label: "tailwind v4", color: "#0EA5E9" },
    { label: "framer motion", color: "#EC4899" },
    { label: "shadcn ui", color: "#8B5CF6" },
  ],
  [
    { label: "duckdb columnar", color: "#EAB308" },
    { label: "fastapi daemon", color: "#10B981" },
    { label: "scipy kkt solver", color: "#14B8A6" },
    { label: "claude 3.7 & gpt-4o", color: "#EA580C" },
    { label: "timescale postgres", color: "#6366F1" },
    { label: "python engine", color: "#3B82F6" },
  ],
  [
    { label: "zustand state", color: "#F59E0B" },
    { label: "tanstack query", color: "#EF4444" },
    { label: "tanstack table", color: "#10B981" },
    { label: "recharts engine", color: "#06B6D4" },
    { label: "radix ui primitives", color: "#8B5CF6" },
    { label: "pandas & numpy", color: "#3B82F6" },
  ],
];

export function HighlightGrid({
  rows = NEXUS_PROJECT_TECH_STACK_ROWS,
  colors = DEFAULT_COLORS,
  transitionDuration = 250,
  highlightFirst = true,
  className,
}: HighlightGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<number, HTMLElement>>(new Map());
  const activeRef = useRef<{ gi: number; color: string } | null>(null);
  const [active, setActive] = useState<number | null>(highlightFirst ? 0 : null);

  // Flatten rows into cells with a running global index + resolved colour.
  const gridRows = useMemo(() => {
    let gi = 0;
    return rows.map((row) =>
      row.map((item) => {
        const idx = gi++;
        return { label: item.label, color: item.color ?? colors[idx % colors.length], gi: idx };
      }),
    );
  }, [rows, colors]);

  const moveTo = useCallback((gi: number, color: string) => {
    const grid = gridRef.current;
    const highlight = highlightRef.current;
    const el = cellRefs.current.get(gi);
    if (!grid || !highlight || !el) return;

    // Use direct offset positioning relative to gridRef offsetParent for subpixel accuracy
    const left = el.offsetLeft;
    const top = el.offsetTop;
    const width = el.offsetWidth;
    const height = el.offsetHeight;

    if (width === 0 || height === 0) return;

    highlight.style.opacity = "1";
    highlight.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    highlight.style.width = `${width}px`;
    highlight.style.height = `${height}px`;
    highlight.style.backgroundColor = color;
    activeRef.current = { gi, color };
  }, []);

  // Park on the first cell initially, and keep the highlight aligned on resize.
  useEffect(() => {
    let rafId: number;
    const updatePosition = () => {
      if (activeRef.current) {
        moveTo(activeRef.current.gi, activeRef.current.color);
      } else if (highlightFirst && gridRows[0]?.[0]) {
        const first = gridRows[0][0];
        const h = highlightRef.current;
        if (h) {
          h.style.transitionDuration = "0s";
          moveTo(first.gi, first.color);
          rafId = requestAnimationFrame(() => {
            if (h) h.style.transitionDuration = `${transitionDuration}ms`;
          });
        }
      }
    };

    rafId = requestAnimationFrame(updatePosition);

    let resizeRaf: number;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        if (activeRef.current) moveTo(activeRef.current.gi, activeRef.current.color);
      });
    };

    const grid = gridRef.current;
    const ro = grid ? new ResizeObserver(onResize) : null;
    if (grid && ro) ro.observe(grid);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(resizeRaf);
      ro?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [gridRows, highlightFirst, moveTo, transitionDuration]);

  return (
    <div
      className={cn(
        "relative flex min-h-[300px] w-full items-center justify-start overflow-x-auto overflow-y-hidden lg:justify-center py-4",
        className,
      )}
    >
      <div
        ref={gridRef}
        className="relative mx-auto flex h-[255px] sm:h-[285px] w-[96%] min-w-[780px] max-w-[1100px] shrink-0 flex-col border border-border/80 dark:border-white/15 rounded-2xl overflow-hidden backdrop-blur-md bg-card/60 shadow-sm"
      >
        {/* Sliding highlight — solid accent with a radiant gradient sheen layered over it */}
        <div
          ref={highlightRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-0 opacity-0"
          style={{
            backgroundImage:
              "radial-gradient(120% 120% at 50% 0%, rgba(255,255,255,0.32), rgba(255,255,255,0) 52%), linear-gradient(180deg, rgba(255,255,255,0) 55%, rgba(0,0,0,0.22))",
            transitionProperty: "transform, width, height, background-color, opacity",
            transitionDuration: `${transitionDuration}ms`,
            transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        />

        {gridRows.map((row, r) => (
          <div
            key={r}
            className={cn(
              "flex flex-1 w-full",
              r < gridRows.length - 1 && "border-b border-border/70 dark:border-white/15",
            )}
          >
            {row.map((cell, c) => {
              const isActive = active === cell.gi;
              return (
                <div
                  key={cell.gi}
                  ref={(el) => {
                    if (el) cellRefs.current.set(cell.gi, el);
                    else cellRefs.current.delete(cell.gi);
                  }}
                  onMouseEnter={() => {
                    setActive(cell.gi);
                    moveTo(cell.gi, cell.color);
                  }}
                  className={cn(
                    "flex h-full flex-1 items-center justify-center p-2.5 sm:p-3 text-center cursor-pointer transition-colors relative",
                    c < row.length - 1 && "border-r border-border/70 dark:border-white/15",
                  )}
                >
                  <p
                    className={cn(
                      "relative z-[2] pointer-events-none whitespace-nowrap font-mono text-[11px] sm:text-[12px] font-semibold uppercase transition-colors duration-200 select-none tracking-wider",
                      isActive ? "text-white drop-shadow-sm font-bold" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    ( {cell.label} )
                  </p>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HighlightGrid;
