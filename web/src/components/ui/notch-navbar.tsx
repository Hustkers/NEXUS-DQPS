'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  Zap,
  SquareX,
  Layers,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isExternal?: boolean;
  isSpecial?: boolean;
}

export interface NotchNavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  leftItems?: NavItem[];
  rightItems?: NavItem[];
  showThemeToggle?: boolean;
  githubHref?: string;
}

// GitHub Icon
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

// Terminal prompt icon for Console
const TerminalPromptIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const DEFAULT_LEFT_ITEMS: NavItem[] = [
  { label: 'Overview', href: '#overview', icon: Home },
  { label: 'Features', href: '#features', icon: SquareX }
];

const DEFAULT_RIGHT_ITEMS: NavItem[] = [
  { label: 'Pipeline', href: '#stack', icon: Layers },
  { label: 'Simulator', href: '/dashboard/simulator', icon: Zap },
  { label: 'Enter App', href: '/dashboard/overview', icon: TerminalPromptIcon, isSpecial: true }
];

export function NotchNavbar({
  className,
  logo,
  leftItems = DEFAULT_LEFT_ITEMS,
  rightItems = DEFAULT_RIGHT_ITEMS,
  showThemeToggle = true,
  githubHref = 'https://github.com/Hustkers/NEXUS-DQPS',
  ...props
}: NotchNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Overview');

  // Track active anchor based on hash or scroll position
  useEffect(() => {
    const updateActiveByHash = () => {
      const hash = window.location.hash;
      if (hash === '#features' || hash === '#bento') {
        setActiveItem('Features');
      } else if (hash === '#stack' || hash === '#pipeline') {
        setActiveItem('Pipeline');
      } else {
        setActiveItem('Overview');
      }
    };

    updateActiveByHash();
    window.addEventListener('hashchange', updateActiveByHash);
    return () => window.removeEventListener('hashchange', updateActiveByHash);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Target style logo from Screenshot 1: [NX] nexusdqps (matching [CG] contextgc)
  const defaultLogo = (
    <Link href="/" className="flex items-center gap-2 group shrink-0 mb-0.5">
      <div className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg px-2 py-0.5 font-bold font-sans text-xs tracking-tight flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
        NX
      </div>
      <span className="font-bold text-sm sm:text-base tracking-tight text-foreground font-sans">
        nexusdqps
      </span>
    </Link>
  );

  const renderNavLink = (item: NavItem) => {
    const Icon = item.icon;
    const isHash = item.href.startsWith('#');
    const isActive = activeItem === item.label;

    if (item.isSpecial) {
      // Primary Enter App button
      return (
        <Link
          key={item.label}
          href={item.href}
          className="group flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors whitespace-nowrap bg-emerald-500/10 dark:bg-emerald-500/15 hover:bg-emerald-500/25 px-3 py-1 rounded-full border border-emerald-500/30 shadow-2xs"
        >
          <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform" />
          <span>{item.label} →</span>
        </Link>
      );
    }

    const content = (
      <>
        <Icon className={cn('w-4 h-4', isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100')} />
        <span>{item.label}</span>
      </>
    );

    const baseClasses = cn(
      'group flex items-center gap-1.5 text-sm transition-[transform,background-color,color] duration-150 active:duration-75 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap select-none active:scale-[0.96]',
      isActive
        ? 'bg-neutral-100/90 dark:bg-zinc-800/90 backdrop-blur-xs text-neutral-900 dark:text-white font-semibold px-3 py-1 rounded-full shadow-2xs border border-neutral-200/50 dark:border-white/10'
        : 'text-neutral-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-zinc-800/50 font-medium px-2.5 py-1 rounded-full'
    );

    if (isHash) {
      return (
        <a
          key={item.label}
          href={item.href}
          onClick={() => setActiveItem(item.label)}
          className={baseClasses}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        onClick={() => setActiveItem(item.label)}
        target={item.isExternal ? '_blank' : undefined}
        rel={item.isExternal ? 'noopener noreferrer' : undefined}
        className={baseClasses}
      >
        {content}
      </Link>
    );
  };

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
              strokeOpacity={0.14}
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
                strokeOpacity={0.14}
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
          <div className="flex-1 h-full relative min-w-0 lg:min-w-[780px] xl:min-w-[800px] -ml-px">
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
                  strokeOpacity={0.14}
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

            {/* Content Layer (Balanced 3-part layout: Left Nav | Center Logo | Right Nav) */}
            <div className="relative w-full h-full flex items-end justify-between pb-2.5 px-4 sm:px-6 lg:px-9">
              {/* Desktop Left Nav: Overview, Workflow */}
              <nav className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0 mb-0.5">
                {leftItems.map((item) => renderNavLink(item))}
              </nav>

              {/* Mobile Menu Button (Left) */}
              <button
                type="button"
                className="lg:hidden mb-1 p-1.5 text-foreground/80 hover:text-foreground hover:bg-muted/60 rounded-md transition-colors z-20"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Logo (Exact Center: [NX] nexusdqps) */}
              <div className="flex items-center justify-center shrink-0 mb-0.5 mx-3 lg:mx-6 z-20 pointer-events-auto">
                {logo || defaultLogo}
              </div>

              {/* Desktop Right Nav: Features, Stack, | , Theme Toggle, GitHub */}
              <nav className="hidden lg:flex items-center gap-2.5 xl:gap-3.5 shrink-0 mb-0.5">
                {rightItems.map((item) => renderNavLink(item))}

                {/* Vertical Divider Line */}
                <div className="h-4 w-px bg-border/70 mx-0.5 shrink-0" />

                {/* Circular Theme Toggle */}
                {showThemeToggle && <ThemeToggle />}

                {/* Circular GitHub Repo Button */}
                {githubHref && (
                  <a
                    href={githubHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-8 rounded-full border border-border/80 bg-background/80 hover:bg-muted flex items-center justify-center text-foreground/80 hover:text-foreground transition-colors cursor-pointer shrink-0"
                    title="GitHub Repository"
                  >
                    <GithubIcon className="size-4 shrink-0" />
                  </a>
                )}
              </nav>

              {/* Mobile Right Actions */}
              <div className="lg:hidden flex items-center gap-2 mb-1 ml-auto z-20">
                {showThemeToggle && <ThemeToggle />}
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
                strokeOpacity={0.14}
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
              strokeOpacity={0.14}
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
            className="fixed inset-x-0 top-16 z-40 bg-background/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-border/80 p-5 lg:hidden shadow-xl"
          >
            <nav className="flex flex-col gap-2">
              {[...leftItems, ...rightItems].map((item) => {
                const Icon = item.icon;
                const isHash = item.href.startsWith('#');
                const isConsole = item.isSpecial;

                if (isHash) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors font-sans text-sm font-medium text-foreground/85 hover:text-foreground"
                      onClick={() => {
                        setActiveItem(item.label);
                        setIsMobileMenuOpen(false);
                      }}
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
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-lg transition-colors font-sans text-sm font-medium',
                      isConsole
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30'
                        : 'text-foreground/85 hover:text-foreground hover:bg-muted/60'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4 opacity-80" />
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
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/60 transition-colors font-sans text-sm text-foreground/80"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2.5">
                      <GithubIcon className="w-4 h-4" />
                      <span>GitHub Repository</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                  </a>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
