'use client';

import React, { useState, useCallback, useLayoutEffect, useRef, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronUp,
  LayoutDashboard,
  Bot,
  Globe,
  AlertTriangle,
  TrendingUp,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  Search,
  Fingerprint,
  Zap,
  ShoppingBag,
  Grid,
  RefreshCw,
  Cpu,
  Layers,
  type LucideIcon
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface VengenceNavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: string;
  shortcut?: string[];
  isNew?: boolean;
  external?: boolean;
  items?: VengenceNavItem[];
}

export interface VengenceNavSection {
  label: string;
  icon: LucideIcon;
  items: VengenceNavItem[];
  defaultOpen?: boolean;
}

export const DEFAULT_VENGENCE_SECTIONS: VengenceNavSection[] = [
  {
    label: 'Autonomous Decision Engine',
    icon: Cpu,
    defaultOpen: true,
    items: [
      {
        title: 'Mission Control',
        url: '/dashboard/overview',
        icon: LayoutDashboard,
        badge: 'LIVE',
        shortcut: ['M', 'C']
      },
      {
        title: 'AI Strategy Engine',
        url: '/dashboard/strategy-engine',
        icon: Bot,
        badge: 'AUTO',
        shortcut: ['A', 'E']
      },
      {
        title: '3D Global Intelligence',
        url: '/dashboard/globe',
        icon: Globe,
        badge: '3D',
        shortcut: ['3', 'G']
      },
      {
        title: 'Diagnostic Anomalies & RCA',
        url: '/dashboard/anomalies',
        icon: AlertTriangle,
        badge: 'RCA',
        shortcut: ['R', 'C']
      },
      {
        title: 'ROAS & Health Gauges',
        url: '/dashboard/gauges',
        icon: TrendingUp,
        shortcut: ['R', 'G']
      },
      {
        title: 'Budget Reallocation Feed',
        url: '/dashboard/reallocations',
        icon: SlidersHorizontal,
        shortcut: ['B', 'R']
      },
      {
        title: 'Ad Playground',
        url: '/dashboard/playground',
        icon: Sparkles,
        shortcut: ['A', 'P']
      },
      {
        title: 'Decision Ledger & Learning',
        url: '/dashboard/ledger',
        icon: CheckCircle2,
        shortcut: ['D', 'L']
      },
      {
        title: 'Visitor Tracking & Attribution',
        url: '/dashboard/tracking',
        icon: Search,
        shortcut: ['V', 'T']
      }
    ]
  },
  {
    label: 'Simulation & Catalog',
    icon: Layers,
    defaultOpen: true,
    items: [
      {
        title: 'Fingerprint Identity Tracker',
        url: '/dashboard/fingerprint',
        icon: Fingerprint,
        shortcut: ['F', 'P']
      },
      {
        title: 'Scenario Shock Sandbox',
        url: '/dashboard/simulator',
        icon: Zap,
        isNew: true,
        badge: 'NEW',
        shortcut: ['S', 'S']
      },
      {
        title: 'Nike Footwear Catalog',
        url: '/dashboard/product',
        icon: ShoppingBag,
        shortcut: ['N', 'P']
      },
      {
        title: 'SKU & Channel Matrix',
        url: '/dashboard/matrix',
        icon: Grid,
        shortcut: ['S', 'M']
      },
      {
        title: 'Live Schema Normalizer',
        url: '/dashboard/normalization',
        icon: RefreshCw,
        shortcut: ['S', 'N']
      }
    ]
  }
];

const VengenceSidebarItem = memo(function VengenceSidebarItem({
  item,
  isActive,
  isHovered,
  onHover,
  isCollapsed
}: {
  item: VengenceNavItem;
  isActive: boolean;
  isHovered: boolean;
  onHover: (href: string) => void;
  isCollapsed: boolean;
}) {
  const Icon = item.icon;

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={item.url}
              scroll={false}
              prefetch={false}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex size-9 items-center justify-center rounded-lg transition-colors',
                isActive
                  ? 'bg-neutral-200/80 dark:bg-zinc-800 text-neutral-900 dark:text-white font-medium shadow-xs'
                  : 'text-neutral-500 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800/60 hover:text-neutral-900 dark:hover:text-zinc-100'
              )}
            >
              {Icon && <Icon className='size-4.5' />}
            </Link>
          }
        />
        <TooltipContent side='right' align='center' className='flex items-center gap-2'>
          <span>{item.title}</span>
          {item.badge && (
            <span className='rounded bg-emerald-500/10 dark:bg-emerald-500/20 px-1 py-0.2 text-[9px] font-mono text-emerald-600 dark:text-emerald-400'>
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div
      onMouseEnter={() => onHover(item.url)}
      className='relative'
    >
      {/* Active background pill */}
      {isActive && (
        <div className='absolute inset-0 rounded-md bg-neutral-100 dark:bg-zinc-800/80 z-0' />
      )}

      {/* Vengence UI sliding hover background with spring physics */}
      {isHovered && (
        <motion.div
          layoutId='vengence-sidebar-hover-bg'
          className='absolute inset-0 rounded-md bg-neutral-100 dark:bg-zinc-800/40 z-0'
          transition={{
            type: 'spring',
            stiffness: 600,
            damping: 35
          }}
        />
      )}

      <Link
        href={item.url}
        scroll={false}
        prefetch={false}
        aria-current={isActive ? 'page' : undefined}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
        className={cn(
          'relative z-10 flex w-full justify-between items-center rounded-md px-2.5 py-1.5 text-sm transition-colors group',
          isActive
            ? 'font-medium text-neutral-900 dark:text-white'
            : 'text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-200'
        )}
      >
        <motion.div
          className='flex items-center gap-2.5 min-w-0 pr-1'
          animate={{ x: isHovered || isActive ? 2 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {Icon && (
            <Icon
              className={cn(
                'size-4 shrink-0 transition-opacity',
                isActive
                  ? 'opacity-100 text-neutral-900 dark:text-white'
                  : 'opacity-70 group-hover:opacity-100'
              )}
            />
          )}
          <span className='truncate text-[13px]'>{item.title}</span>
        </motion.div>

        <div className='flex items-center gap-1.5 shrink-0 ml-auto'>
          {item.badge && (
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-mono font-medium leading-none tracking-tight',
                item.badge === 'LIVE'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : item.badge === 'NEW'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  : item.badge === 'AUTO'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              )}
            >
              {item.badge}
            </span>
          )}

          {item.shortcut && !item.badge && (
            <kbd className='hidden group-hover:inline-flex h-4 items-center gap-0.5 rounded border border-neutral-200/80 dark:border-zinc-700/80 bg-neutral-50 dark:bg-zinc-800/60 px-1 font-mono text-[9px] text-neutral-400 dark:text-zinc-400'>
              {item.shortcut.join('')}
            </kbd>
          )}
        </div>
      </Link>
    </div>
  );
});

const VengenceSidebarSection = memo(function VengenceSidebarSection({
  section,
  hoveredPath,
  pathname,
  onHover,
  isCollapsed
}: {
  section: VengenceNavSection;
  hoveredPath: string | null;
  pathname: string;
  onHover: (href: string) => void;
  isCollapsed: boolean;
}) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? true);
  const SectionIcon = section.icon;

  const isSectionActive = section.items.some((item) => {
    if (item.external) return false;
    return pathname === item.url || pathname.startsWith(item.url + '/');
  });

  if (isCollapsed) {
    return (
      <div className='flex flex-col items-center gap-1 py-1'>
        {section.items.map((item) => (
          <VengenceSidebarItem
            key={item.url}
            item={item}
            isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
            isHovered={hoveredPath === item.url}
            onHover={onHover}
            isCollapsed={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      {/* Category Section Header */}
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors w-full text-left select-none group',
          isSectionActive
            ? 'bg-neutral-100/70 dark:bg-zinc-800/60 text-neutral-900 dark:text-zinc-100'
            : 'text-neutral-500 dark:text-zinc-400 hover:bg-neutral-100/40 dark:hover:bg-zinc-800/30 hover:text-neutral-900 dark:hover:text-zinc-200'
        )}
      >
        <SectionIcon className='h-3.5 w-3.5 opacity-80 group-hover:opacity-100 text-neutral-600 dark:text-zinc-400' />
        <span className='min-w-0 flex-1 truncate font-mono text-[11px] font-medium'>
          {section.label}
        </span>
        <ChevronUp
          className={cn(
            'h-3.5 w-3.5 text-neutral-400 dark:text-zinc-500 transition-transform duration-200',
            !isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Smooth height accordion animation */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { type: 'spring', stiffness: 500, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className='overflow-hidden'
          >
            {/* Indented container with vertical guide border track */}
            <div className='mt-1 ml-3.5 flex flex-col border-l border-neutral-200 dark:border-[#222]/80 dark:border-white/10 pl-2 space-y-0.5'>
              {section.items.map((item) => (
                <VengenceSidebarItem
                  key={item.url}
                  item={item}
                  isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
                  isHovered={hoveredPath === item.url}
                  onHover={onHover}
                  isCollapsed={false}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export function VengenceSidebar({
  sections = DEFAULT_VENGENCE_SECTIONS,
  className
}: {
  sections?: VengenceNavSection[];
  className?: string;
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const sidebarRef = useRef<HTMLDivElement>(null);
  const previousPathname = useRef(pathname);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  // Vengence UI active link auto-scroll reveal logic
  useLayoutEffect(() => {
    const pathChanged = previousPathname.current !== pathname;
    previousPathname.current = pathname;

    const sidebar = sidebarRef.current?.closest('aside') || sidebarRef.current;
    const activeLink = sidebarRef.current?.querySelector<HTMLElement>('a[aria-current="page"]');
    if (!sidebar || !activeLink) return;

    const revealActiveLink = () => {
      if (sidebar.clientHeight === 0) return;

      const sidebarBounds = sidebar.getBoundingClientRect();
      const linkBounds = activeLink.getBoundingClientRect();
      const visibleTop = sidebarBounds.top + sidebar.clientTop;
      const visibleBottom = Math.min(visibleTop + sidebar.clientHeight, window.innerHeight);

      if (linkBounds.top < visibleTop + 16 || linkBounds.bottom > visibleBottom - 16) {
        sidebar.scrollTo({
          top: sidebar.scrollTop + linkBounds.top - (visibleTop + visibleBottom - linkBounds.height) / 2,
          behavior:
            pathChanged && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'smooth'
              : 'instant'
        });
      }
    };

    revealActiveLink();
    const observer = new ResizeObserver(revealActiveLink);
    observer.observe(sidebar);
    return () => observer.disconnect();
  }, [pathname]);

  const handleHover = useCallback((href: string) => {
    setHoveredPath(href);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredPath(null);
  }, []);

  return (
    <div
      ref={sidebarRef}
      className={cn('w-full relative space-y-4 pb-6 select-none', className)}
      onMouseLeave={handleMouseLeave}
    >
      {sections.map((section) => (
        <VengenceSidebarSection
          key={section.label}
          section={section}
          hoveredPath={hoveredPath}
          pathname={pathname}
          onHover={handleHover}
          isCollapsed={isCollapsed}
        />
      ))}
    </div>
  );
}

/**
 * Signature Vengence UI Diagonal Striped Divider
 * Renders down the entire border edge of the sidebar.
 */
export function VengenceDiagonalDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'hidden md:block absolute right-0 top-0 bottom-0 w-[5px] pointer-events-none opacity-40 dark:opacity-60 overflow-hidden z-20',
        className
      )}
      aria-hidden='true'
    >
      {/* Light mode stripes */}
      <div
        className='absolute inset-0 border-r border-neutral-200 dark:hidden'
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, rgba(0,0,0,0.06), rgba(0,0,0,0.06) 1px, transparent 1px, transparent 6px)',
          backgroundSize: '16px 16px'
        }}
      />
      {/* Dark mode stripes */}
      <div
        className='absolute inset-0 border-r border-white/10 hidden dark:block'
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 1px, transparent 1px, transparent 6px)',
          backgroundSize: '16px 16px'
        }}
      />
    </div>
  );
}
