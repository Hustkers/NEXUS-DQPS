'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Cpu,
  Workflow,
  Fingerprint,
  FileText,
  Menu,
  X,
  Sun,
  Moon,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { startThemeTransition } from '@/lib/theme-transition';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isExternal?: boolean;
}

export interface NotchNavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  leftItems?: NavItem[];
  rightItems?: NavItem[];
  showThemeToggle?: boolean;
  ctaText?: string;
  ctaHref?: string;
  githubHref?: string;
}

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Helper component for navigation links
const NavLink = ({ item }: { item: NavItem }) => {
  const Icon = item.icon;
  const isHash = item.href.startsWith('#');

  if (isHash) {
    return (
      <a
        href={item.href}
        className="group flex items-center gap-1.5 text-xs font-mono font-medium text-foreground/75 hover:text-foreground transition-colors whitespace-nowrap"
      >
        <Icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        <span>{item.label}</span>
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      target={item.isExternal ? '_blank' : undefined}
      rel={item.isExternal ? 'noopener noreferrer' : undefined}
      className="group flex items-center gap-1.5 text-xs font-mono font-medium text-foreground/75 hover:text-foreground transition-colors whitespace-nowrap"
    >
      <Icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
      <span>{item.label}</span>
    </Link>
  );
};

// Theme Toggle with smooth circular transition support
const NotchThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-full" />;
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = (e: React.MouseEvent) => {
    const nextTheme = isDark ? 'light' : 'dark';
    startThemeTransition(() => setTheme(nextTheme), e);
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="flex items-center justify-center w-8 h-8 rounded-full border border-border/80 bg-background/80 hover:bg-muted text-foreground/80 hover:text-foreground transition-colors"
      aria-label="Toggle color theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
    </button>
  );
};

const DEFAULT_LEFT_ITEMS: NavItem[] = [
  { label: 'Crisis Scenarios', href: '#shocks', icon: Zap },
  { label: 'Engine Architecture', href: '#bento', icon: Cpu },
  { label: '4-Phase Flow', href: '#pipeline', icon: Workflow }
];

const DEFAULT_RIGHT_ITEMS: NavItem[] = [
  { label: 'Identity Graph', href: '/dashboard/fingerprint', icon: Fingerprint },
  { label: 'Decision Ledger', href: '/dashboard/ledger', icon: FileText }
];

export function NotchNavbar({
  className,
  logo,
  leftItems = DEFAULT_LEFT_ITEMS,
  rightItems = DEFAULT_RIGHT_ITEMS,
  showThemeToggle = false,
  ctaText = 'Enter Mission Control →',
  ctaHref = '/dashboard/overview',
  githubHref = 'https://github.com/Hustkers/NEXUS-DQPS',
  ...props
}: NotchNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const defaultLogo = (
    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
      <div className="size-8 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-mono font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
        N
      </div>
      <div className="flex flex-col text-left">
        <div className="font-mono font-extrabold text-xs tracking-tight flex items-center gap-1.5 leading-none">
          <span>NEXUS-DQPS</span>
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <span className="text-[9px] text-muted-foreground font-mono leading-none tracking-tighter mt-0.5">
          AUTONOMOUS AD ENGINE
        </span>
      </div>
    </Link>
  );

  return (
    <>
      <header
        className={cn('fixed top-0 inset-x-0 z-50 h-16 flex px-0 pointer-events-none', className)}
        {...props}
      >
        {/* Left Side Bar - Flexible width */}
        <div className="flex-1 h-10 bg-background/90 dark:bg-zinc-950/90 backdrop-blur-md z-20 relative min-w-0 pointer-events-auto">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <line
              x1="0"
              y1="39.5"
              x2="100%"
              y2="39.5"
              stroke="currentColor"
              strokeOpacity={0.12}
              strokeWidth={0.75}
              className="text-foreground"
            />
            <line
              x1="0"
              y1="36.5"
              x2="100%"
              y2="36.5"
              stroke="currentColor"
              strokeOpacity={0.06}
              strokeWidth={0.5}
              className="text-foreground"
            />
          </svg>
        </div>

        {/* Responsive Notch Container - 3 Slices */}
        <div className="flex h-16 relative z-10 shrink-0 -ml-px pointer-events-auto">
          {/* Left Slice (Corner Curve) */}
          <div className="w-[50px] h-full relative shrink-0">
            {/* Glass Background */}
            <div
              className="absolute inset-0 bg-background/90 dark:bg-zinc-950/90 backdrop-blur-md"
              style={{ clipPath: "path('M0 0 H50 V64 C25 64 25 40 0 40 Z')" }}
            />
            {/* Outlines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 50 64"
            >
              <path
                d="M0 39.5 C25 39.5 25 63.5 50 63.5"
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.12}
                strokeWidth={0.75}
                className="text-foreground"
              />
              <path
                d="M0 36.5 C25 36.5 25 60.5 50 60.5"
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.06}
                strokeWidth={0.5}
                className="text-foreground"
              />
            </svg>
          </div>

          {/* Center Slice (Flexible Content Area) */}
          <div className="flex-1 h-full relative min-w-0 -ml-px">
            {/* Background & Lines Layer */}
            <div className="absolute inset-0 bg-background/90 dark:bg-zinc-950/90 backdrop-blur-md">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="63.5"
                  x2="100%"
                  y2="63.5"
                  stroke="currentColor"
                  strokeOpacity={0.12}
                  strokeWidth={0.75}
                  className="text-foreground"
                />
                <line
                  x1="0"
                  y1="60.5"
                  x2="100%"
                  y2="60.5"
                  stroke="currentColor"
                  strokeOpacity={0.06}
                  strokeWidth={0.5}
                  className="text-foreground"
                />
              </svg>
            </div>

            {/* Content Layer */}
            <div className="relative w-full h-full flex items-end justify-between pb-2 px-3 sm:px-6 md:px-8 gap-4 md:gap-8">
              {/* Desktop Left Nav */}
              <nav className="hidden md:flex gap-6 mb-1 shrink-0 items-center">
                {leftItems.map((item) => (
                  <NavLink key={item.label} item={item} />
                ))}
              </nav>

              {/* Mobile Menu Button (Left) */}
              <button
                type="button"
                className="md:hidden mb-1 p-1.5 text-foreground/80 hover:text-foreground hover:bg-muted/60 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Logo (Center) */}
              <div className="flex justify-center shrink-0 mx-2 md:mx-4 mb-0.5">
                {logo || defaultLogo}
              </div>

              {/* Desktop Right Nav & Actions */}
              <nav className="hidden md:flex gap-6 items-center shrink-0 mb-0.5">
                {rightItems.map((item) => (
                  <NavLink key={item.label} item={item} />
                ))}

                <div className="flex gap-3 pl-4 border-l border-border/70 shrink-0 items-center">
                  {showThemeToggle && <NotchThemeToggle />}

                  {githubHref && (
                    <a
                      href={githubHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-8 rounded-full border border-border/80 bg-background/80 hover:bg-muted flex items-center justify-center text-foreground/80 hover:text-foreground transition-colors"
                      title="GitHub Repository"
                    >
                      <GithubIcon className="size-4" />
                    </a>
                  )}

                  <Link
                    href={ctaHref}
                    className="px-3.5 py-1.5 text-xs font-mono font-medium text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 rounded-full transition-all shadow-xs hover:shadow-sm whitespace-nowrap"
                  >
                    {ctaText}
                  </Link>
                </div>
              </nav>

              {/* Mobile Right Actions */}
              <div className="md:hidden flex items-center gap-2 mb-1">
                {showThemeToggle && <NotchThemeToggle />}
              </div>
            </div>
          </div>

          {/* Right Slice (Corner Curve) */}
          <div className="w-[50px] h-full relative shrink-0 -ml-px">
            {/* Glass Background */}
            <div
              className="absolute inset-0 bg-background/90 dark:bg-zinc-950/90 backdrop-blur-md"
              style={{ clipPath: "path('M0 0 H50 V40 C25 40 25 64 0 64 Z')" }}
            />
            {/* Outlines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 50 64"
            >
              <path
                d="M0 63.5 C25 63.5 25 39.5 50 39.5"
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.12}
                strokeWidth={0.75}
                className="text-foreground"
              />
              <path
                d="M0 60.5 C25 60.5 25 36.5 50 36.5"
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.06}
                strokeWidth={0.5}
                className="text-foreground"
              />
            </svg>
          </div>
        </div>

        {/* Right Side Bar - Flexible width */}
        <div className="flex-1 h-10 bg-background/90 dark:bg-zinc-950/90 backdrop-blur-md z-20 relative min-w-0 -ml-px pointer-events-auto">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <line
              x1="0"
              y1="39.5"
              x2="100%"
              y2="39.5"
              stroke="currentColor"
              strokeOpacity={0.12}
              strokeWidth={0.75}
              className="text-foreground"
            />
            <line
              x1="0"
              y1="36.5"
              x2="100%"
              y2="36.5"
              stroke="currentColor"
              strokeOpacity={0.06}
              strokeWidth={0.5}
              className="text-foreground"
            />
          </svg>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-background/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-border/80 p-5 md:hidden shadow-xl"
          >
            <nav className="flex flex-col gap-2">
              {[...leftItems, ...rightItems].map((item) => {
                const Icon = item.icon;
                const isHash = item.href.startsWith('#');
                if (isHash) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors font-mono text-xs font-medium text-foreground/80 hover:text-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4 opacity-70" />
                      <span>{item.label}</span>
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors font-mono text-xs font-medium text-foreground/80 hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4 opacity-70" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="h-px bg-border/60 my-2" />

              <div className="flex flex-col gap-2 pt-1">
                {githubHref && (
                  <a
                    href={githubHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/60 transition-colors font-mono text-xs text-foreground/80"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2.5">
                      <GithubIcon className="w-4 h-4" />
                      <span>GitHub Repository</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                  </a>
                )}

                <Link
                  href={ctaHref}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-foreground text-background font-mono text-xs font-medium mt-1 shadow-xs"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{ctaText}</span>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
