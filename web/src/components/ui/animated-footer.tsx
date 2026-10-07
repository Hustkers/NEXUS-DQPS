"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { SharedTooltipAvatars, type AvatarItem } from "@/components/ui/shared-tooltip-avatars";

export const DEFAULT_TEAM_MEMBERS: AvatarItem[] = [
  {
    id: "jay-gopal-tripathy",
    name: "Jay Gopal Tripathy",
    image: "/team/jay-gopal.webp",
  },
  {
    id: "shivam-kumar",
    name: "Shivam Kumar",
    image: "https://github.com/shi-ivam.png",
  },
  {
    id: "abhisekh",
    name: "Abhisekh",
    image: "https://github.com/Abhishek-singh06.png",
  },
  {
    id: "pragyan-jain",
    name: "Pragyan Jain",
    image: "https://github.com/pragyan43jain.png",
  },
  {
    id: "anushree-tiwari",
    name: "Anushree Tiwari",
    image: "https://github.com/anuut1.png",
  },
  {
    id: "garv-gupta",
    name: "Garv Gupta",
    image: "https://github.com/garv2412.png",
  },
];

export interface AnimatedFooterProps {
  /** Large heading displayed across the bottom edge. Defaults to ["NEXUS"]. */
  headingLines?: string[];
  /** Brand mark displayed in top-left badge. Defaults to "NX". */
  brandLogo?: string;
  /** Brand title next to mark. Defaults to "nexusdqps". */
  brandTitle?: string;
  /** Brand tagline. */
  tagline?: string;
  /** Copyright text displayed at the bottom. */
  copyright?: string;
  /** Left image URL, sampled into ASCII art. Must be same-origin or CORS-enabled. */
  leftImage?: string;
  /** Right image URL, sampled into ASCII art. Must be same-origin or CORS-enabled. */
  rightImage?: string;
  /** Team members for shared tooltip avatars. */
  teamMembers?: AvatarItem[];
  /** Extra class names for the root element. */
  className?: string;
}

const DEFAULT_ASCII_CHARS = "..::-=+xX#0369";
const HIGHLIGHT_LIFETIME = 300; // ms a hovered cell stays lit
const CLUSTER_SIZE = 10; // max cells a hover ripple spreads across
const PARALLAX_EASE = 0.05;
const FPS_INTERVAL = 1000 / 36; // Cap at 36fps for smooth, efficient rendering

interface Cell {
  col: number;
  row: number;
  char: string;
  highlightEndTime: number;
}

interface Hand {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cells: Map<string, Cell>;
  cellList: Cell[];
  rows: number;
  columns: number;
  cellSize: number;
  baselineOffset: number;
  direction: 1 | -1;
}

/** Build high-definition ASCII cell grid by sampling brightness & boosting contour contrast */
function buildHandCells(
  image: HTMLImageElement,
  cols: number,
  chars: string
): { rows: number; cells: Map<string, Cell> } {
  const rows = Math.max(1, Math.round(cols / (image.naturalWidth / image.naturalHeight || 1)));
  const sampler = document.createElement("canvas");
  sampler.width = cols;
  sampler.height = rows;
  const sCtx = sampler.getContext("2d");
  const cells = new Map<string, Cell>();
  if (!sCtx) return { rows, cells };

  sCtx.drawImage(image, 0, 0, cols, rows);
  const pixels = sCtx.getImageData(0, 0, cols, rows).data;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offset = (r * cols + c) * 4;
      const brightness =
        (pixels[offset] * 0.299 + pixels[offset + 1] * 0.587 + pixels[offset + 2] * 0.114) / 255;
      const darkness = 1 - brightness;
      // Skip pure background only (keeps finger contours & fine anatomical details)
      if (darkness < 0.05) continue;
      const norm = Math.min(1, Math.max(0, (darkness - 0.05) / 0.95));
      const boosted = Math.pow(norm, 0.82);
      const charIdx = Math.min(chars.length - 1, Math.max(1, Math.floor(boosted * chars.length)));
      cells.set(`${c},${r}`, {
        col: c,
        row: r,
        char: chars[charIdx],
        highlightEndTime: 0,
      });
    }
  }
  return { rows, cells };
}

/** Light up a wandering cluster of cells starting from startCell */
function highlightCluster(cells: Map<string, Cell>, startCell: Cell) {
  const now = Date.now();
  startCell.highlightEndTime = now + HIGHLIGHT_LIFETIME;
  const steps = Math.floor(Math.random() * CLUSTER_SIZE) + 1;
  let current = startCell;
  const lit = [startCell];

  for (let s = 0; s < steps; s++) {
    const nbs: Cell[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nb = cells.get(`${current.col + dx},${current.row + dy}`);
        if (nb && !lit.includes(nb)) nbs.push(nb);
      }
    }
    if (!nbs.length) break;
    const next = nbs[Math.floor(Math.random() * nbs.length)];
    next.highlightEndTime = now + HIGHLIGHT_LIFETIME + s * 10;
    lit.push(next);
    current = next;
  }
}

export function AnimatedFooter({
  headingLines = ["NEXUS"],
  brandLogo = "NX",
  brandTitle = "nexusdqps",
  tagline = "Autonomous multi-channel ad capital optimization & causal anomaly diagnostic engine — halting stockout waste and maximizing net contribution margin in real time.",
  copyright = "© 2026 Jay Gopal · NEXUS · All rights reserved.",
  leftImage = "/animated-footer/hand-left.jpg",
  rightImage = "/animated-footer/hand-right.jpg",
  teamMembers = DEFAULT_TEAM_MEMBERS,
  className,
}: AnimatedFooterProps) {
  const rootRef = useRef<HTMLElement>(null);
  const leftWrapRef = useRef<HTMLDivElement>(null);
  const rightWrapRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);

  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = rootRef.current;
    const leftWrap = leftWrapRef.current;
    const rightWrap = rightWrapRef.current;
    const leftCanvas = leftCanvasRef.current;
    const rightCanvas = rightCanvasRef.current;
    if (!root || !leftWrap || !rightWrap || !leftCanvas || !rightCanvas) return;

    let hands: Hand[] = [];
    const isMobile = window.innerWidth <= 680;
    const columns = isMobile ? 48 : 80;
    const cellSize = isMobile ? 12 : 18;
    const fontSize = isMobile ? 11 : 16;

    const setupHand = (
      image: HTMLImageElement,
      canvas: HTMLCanvasElement,
      direction: 1 | -1
    ) => {
      const res = buildHandCells(image, columns, DEFAULT_ASCII_CHARS);
      if (!res.cells.size) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = columns * cellSize * dpr;
      canvas.height = res.rows * cellSize * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `600 ${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      const metrics = ctx.measureText("X");
      const glyphHeight =
        (metrics.actualBoundingBoxAscent || fontSize * 0.7) +
        (metrics.actualBoundingBoxDescent || 2);
      const baselineOffset =
        cellSize / 2 + glyphHeight / 2 - (metrics.actualBoundingBoxDescent || 2);

      hands.push({
        canvas,
        ctx,
        cells: res.cells,
        cellList: Array.from(res.cells.values()),
        rows: res.rows,
        columns,
        cellSize,
        baselineOffset,
        direction,
      });
    };

    const loadHand = (src: string, canvas: HTMLCanvasElement, dir: 1 | -1) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => setupHand(img, canvas, dir);
      img.src = src;
      if (img.complete && img.naturalWidth) {
        setupHand(img, canvas, dir);
      }
    };

    loadHand(leftImage, leftCanvas, 1);
    loadHand(rightImage, rightCanvas, -1);

    const hoverHand = (hand: Hand, clientX: number, clientY: number) => {
      const rect = hand.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const mouseCol = ((clientX - rect.left) / rect.width) * hand.columns;
      const mouseRow = ((clientY - rect.top) / rect.height) * hand.rows;

      let closest: Cell | null = null;
      let closestDist = Infinity;
      for (let i = 0; i < hand.cellList.length; i++) {
        const cell = hand.cellList[i];
        const dx = mouseCol - cell.col;
        const dy = mouseRow - cell.row;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = cell;
        }
      }
      if (closest && closestDist <= 7) {
        highlightCluster(hand.cells, closest);
      }
    };

    const pointer = { x: 0, y: 0 };
    const drift = { x: 0, y: 0 };
    let curtainOffset = 100;
    let targetCurtain = 100;
    let isVisible = false;
    let rafId = 0;
    let lastFrameTime = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const w = rect.width || 1;
      const h = rect.height || 1;
      pointer.x = ((e.clientX - rect.left) / w - 0.5) * 36;
      pointer.y = ((e.clientY - rect.top) / h - 0.5) * 36;
      hands.forEach((h) => hoverHand(h, e.clientX, e.clientY));
    };
    root.addEventListener("mousemove", onMouseMove);

    const renderHand = (
      hand: Hand,
      now: number,
      charCol: string,
      hoverBg: string,
      hoverChar: string
    ) => {
      const ctx = hand.ctx;
      const cs = hand.cellSize;
      const w = hand.columns * cs;
      const h = hand.rows * cs;
      ctx.clearRect(0, 0, w, h);

      const list = hand.cellList;
      for (let i = 0; i < list.length; i++) {
        const cell = list[i];
        const x = cell.col * cs;
        const y = cell.row * cs;
        const isLit = cell.highlightEndTime > now;

        if (isLit) {
          ctx.fillStyle = hoverBg;
          ctx.fillRect(x, y, cs, cs);
          ctx.fillStyle = hoverChar;
        } else {
          ctx.fillStyle = charCol;
        }
        ctx.fillText(cell.char, x + cs / 2, y + hand.baselineOffset);
      }
    };

    const frame = (timestamp: number) => {
      if (!isVisible) return;
      rafId = requestAnimationFrame(frame);

      if (timestamp - lastFrameTime < FPS_INTERVAL) return;
      lastFrameTime = timestamp;

      const style = getComputedStyle(document.documentElement);
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark" ||
        document.documentElement.classList.contains("dark") ||
        (!document.documentElement.getAttribute("data-theme") &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      const charColor =
        style.getPropertyValue("--footer-ascii-color").trim() ||
        (isDark ? "#94a3b8" : "#1e40af");
      const hoverBg =
        style.getPropertyValue("--footer-accent").trim() ||
        style.getPropertyValue("--accent").trim() ||
        "#2563eb";
      const hoverChar =
        style.getPropertyValue("--footer-on-accent").trim() ||
        style.getPropertyValue("--on-accent").trim() ||
        "#ffffff";

      const now = Date.now();
      for (let i = 0; i < hands.length; i++) {
        renderHand(hands[i], now, charColor, hoverBg, hoverChar);
      }

      drift.x += (pointer.x - drift.x) * PARALLAX_EASE;
      drift.y += (pointer.y - drift.y) * PARALLAX_EASE;
      curtainOffset += (targetCurtain - curtainOffset) * 0.08;

      leftWrap.style.transform = `translateY(-50%) translateX(${-curtainOffset}%) translate(${drift.x}px, ${-drift.y}px)`;
      rightWrap.style.transform = `translateY(-50%) translateX(${curtainOffset}%) translate(${-drift.x}px, ${-drift.y}px)`;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (entry.isIntersecting) {
            isVisible = true;
            targetCurtain = 0;
            root.classList.add("is-revealed");
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(frame);
          } else {
            isVisible = false;
            targetCurtain = 100;
            cancelAnimationFrame(rafId);
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(root);

    return () => {
      cancelAnimationFrame(rafId);
      root.removeEventListener("mousemove", onMouseMove);
      observer.disconnect();
    };
  }, [leftImage, rightImage, resolvedTheme]);

  return (
    <footer
      ref={rootRef}
      className={cn("animated-footer", className)}
      id="animatedFooter"
      role="contentinfo"
    >
      {/* ── Top Utility & Navigation Bar ────────────────────────────── */}
      <div className="footer-wrap">
        <div className="footer-top-nav">
          <div className="footer-brand">
            <Link href="/" className="footer-logo-row group cursor-pointer inline-flex items-center gap-2" title="Return to top">
              <span className="logo-mark font-orbitron font-black group-hover:scale-105 transition-transform" aria-hidden="true">
                {brandLogo}
              </span>
              <span className="footer-brand-title font-orbitron font-bold group-hover:text-foreground transition-colors">{brandTitle}</span>
            </Link>
            <p className="footer-tagline">{tagline}</p>
          </div>

          {/* Quick Platform Links */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3.5 text-xs font-mono text-muted-foreground my-2 lg:my-0">
            <Link href="/dashboard/overview" className="hover:text-foreground transition-colors">Cockpit</Link>
            <span className="opacity-25">•</span>
            <Link href="/dashboard/playground" className="hover:text-foreground transition-colors">Playground</Link>
            <span className="opacity-25">•</span>
            <Link href="/dashboard/reallocations" className="hover:text-foreground transition-colors">Reallocations</Link>
            <span className="opacity-25">•</span>
            <Link href="/dashboard/anomalies" className="hover:text-foreground transition-colors">Diagnostics</Link>
            <span className="opacity-25">•</span>
            <Link href="/dashboard/ledger" className="hover:text-foreground transition-colors">Ledger</Link>
          </div>

          {/* VengeanceUI Shared Tooltip Team Avatars */}
          <div className="footer-social-wrap" id="footerTeamAvatars">
            <SharedTooltipAvatars
              items={teamMembers}
              className="py-0"
            />
          </div>

        </div>
      </div>

      {/* ── Center Stage: ASCII Hands Canvas Scene ─────────────────── */}
      <div className="footer-ascii-stage" aria-hidden="true">
        <div ref={leftWrapRef} className="footer-hand-wrap left" id="leftHandWrap">
          <canvas ref={leftCanvasRef} id="leftHandCanvas" className="footer-hand-canvas" />
        </div>
        <div ref={rightWrapRef} className="footer-hand-wrap right" id="rightHandWrap">
          <canvas ref={rightCanvasRef} id="rightHandCanvas" className="footer-hand-canvas" />
        </div>
      </div>

      {/* ── Bottom Stage: Masked Character Reveal Heading & Bottom Bar */}
      <div className="footer-display-stage">
        {headingLines.map((word, wi) => (
          <div key={`${word}-${wi}`} className="footer-display-heading" aria-label={word}>
            {Array.from(word).map((ch, ci) => (
              <span key={ci} className="af-char-wrap">
                <span
                  className="af-char"
                  style={{ transitionDelay: `${ci * 0.08}s` }}
                >
                  {ch === " " ? "\u00A0" : ch}
                </span>
              </span>
            ))}
          </div>
        ))}

        <div className="footer-bottom-bar footer-wrap">
          <span>{copyright}</span>
        </div>
      </div>
    </footer>
  );
}

export default AnimatedFooter;
