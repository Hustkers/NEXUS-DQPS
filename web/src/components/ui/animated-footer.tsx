"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

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
            <div className="footer-logo-row">
              <span className="logo-mark" aria-hidden="true">
                {brandLogo}
              </span>
              <span className="footer-brand-title">{brandTitle}</span>
            </div>
            <p className="footer-tagline">{tagline}</p>
          </div>

          {/* VengeanceUI Social Flip Button Card (C - O - N - T - A - C - T) */}
          <div className="footer-social-wrap" id="footerSocialFlip">
            <div className="social-flip-card group" id="socialFlipCard">
              {/* Running Gradient Border Lines */}
              <div className="social-border-lines" aria-hidden="true">
                <div className="social-border-line top" />
                <div className="social-border-line bottom" />
              </div>

              {/* Staggered 3D Flip Items */}
              <div className="social-flip-items">
                {/* 1. C - GitHub */}
                <a
                  href="https://github.com/Hustkers/NEXUS-DQPS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-flip-node"
                  aria-label="GitHub @Hustkers"
                >
                  <span className="social-tooltip">GitHub</span>
                  <div className="social-flip-inner">
                    <div className="social-flip-front">C</div>
                    <div className="social-flip-back">
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* 2. O - Twitter / X */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-flip-node"
                  aria-label="Twitter / X"
                >
                  <span className="social-tooltip">Twitter / X</span>
                  <div className="social-flip-inner">
                    <div className="social-flip-front">O</div>
                    <div className="social-flip-back">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* 3. N - LinkedIn */}
                <a
                  href="https://linkedin.com/in/jaygopal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-flip-node"
                  aria-label="LinkedIn @jaygopal"
                >
                  <span className="social-tooltip">LinkedIn</span>
                  <div className="social-flip-inner">
                    <div className="social-flip-front">N</div>
                    <div className="social-flip-back">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.225 0z" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* 4. T - Email */}
                <a
                  href="mailto:jay20gopal@gmail.com"
                  className="social-flip-node"
                  aria-label="Email Jay Gopal"
                >
                  <span className="social-tooltip">Email</span>
                  <div className="social-flip-inner">
                    <div className="social-flip-front">T</div>
                    <div className="social-flip-back">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* 5. A - Discord */}
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-flip-node"
                  aria-label="Discord"
                >
                  <span className="social-tooltip">Discord</span>
                  <div className="social-flip-inner">
                    <div className="social-flip-front">A</div>
                    <div className="social-flip-back">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* 6. C - Repository */}
                <a
                  href="https://github.com/Hustkers/NEXUS-DQPS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-flip-node"
                  aria-label="GitHub Repository"
                >
                  <span className="social-tooltip">Repository</span>
                  <div className="social-flip-inner">
                    <div className="social-flip-front">C</div>
                    <div className="social-flip-back">
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* 7. T - Console */}
                <a href="/dashboard" className="social-flip-node" aria-label="Interactive Console">
                  <span className="social-tooltip">Console</span>
                  <div className="social-flip-inner">
                    <div className="social-flip-front">T</div>
                    <div className="social-flip-back">
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="4 17 10 11 4 5" />
                        <line x1="12" y1="19" x2="20" y2="19" />
                      </svg>
                    </div>
                  </div>
                </a>
              </div>
            </div>
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
