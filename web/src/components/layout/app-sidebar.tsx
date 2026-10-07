'use client';

import React, { useState, useCallback, memo, startTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Compass,
  Activity,
  Fingerprint,
  Package,
  ChevronUp,
  ExternalLink,
  LayoutDashboard,
  Globe,
  AlertTriangle,
  TrendingUp,
  Sliders,
  CheckSquare,
  Sparkles,
  Kanban,
  Layers,
  ChevronsDown,
  User,
  CreditCard,
  Bell,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { OrgSwitcher } from '../org-switcher';
import { ChannelSwitcher } from '../channel-switcher';

// Vengeance UI stylized logo mark
const VengeanceLogoMark = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

// Vengeance UI active state cursor pointer
const VengeanceCursorIcon = () => (
  <svg
    className="size-3.5 shrink-0 text-foreground ml-auto opacity-90 transition-transform"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 5.879z" />
  </svg>
);

interface SidebarLinkItem {
  name: string;
  href: string;
  badge?: string;
  external?: boolean;
}

interface SidebarSectionData {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SidebarLinkItem[];
}

const VENGEANCE_SECTIONS: SidebarSectionData[] = [
  {
    name: 'Mission Intelligence',
    icon: Compass,
    items: [
      { name: 'Mission Control Cockpit', href: '/dashboard/overview', badge: 'Live' },
      { name: '3D Global Intelligence', href: '/dashboard/globe', badge: 'New' },
      { name: 'Landing Pitch & Story', href: '/', external: true }
    ]
  },
  {
    name: 'Decision Intelligence',
    icon: Activity,
    items: [
      { name: 'Diagnostic Anomalies & RCA', href: '/dashboard/anomalies' },
      { name: 'ROAS & Health Gauges', href: '/dashboard/gauges', badge: 'Fix' },
      { name: 'Budget Reallocation Feed', href: '/dashboard/reallocations' },
      { name: 'Decision Ledger & Learning', href: '/dashboard/ledger', badge: 'Audited' }
    ]
  },
  {
    name: 'Attribution & Sandbox',
    icon: Fingerprint,
    items: [
      { name: 'Fingerprint Identity Tracker', href: '/dashboard/fingerprint', badge: '99.8%' },
      { name: 'Scenario Shock Sandbox', href: '/dashboard/simulator', badge: 'New' }
    ]
  },
  {
    name: 'Commerce & Catalog',
    icon: Package,
    items: [
      { name: 'Nike Footwear Catalog', href: '/dashboard/product' },
      { name: 'SKU & Channel Matrix', href: '/dashboard/matrix' }
    ]
  }
];

const SidebarItem = memo(function SidebarItem({
  item,
  isActive,
  isHovered,
  onHover
}: {
  item: SidebarLinkItem;
  isActive: boolean;
  isHovered: boolean;
  onHover: (href: string) => void;
}) {
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (item.external) {
        return;
      }
      e.preventDefault();
      startTransition(() => {
        router.push(item.href);
      });
    },
    [item.external, router, item.href]
  );

  return (
    <div onMouseEnter={() => onHover(item.href)} className="relative">
      {isActive && (
        <div className="absolute inset-0 rounded-md bg-neutral-100 dark:bg-zinc-800/80 z-0" />
      )}
      {isHovered && !isActive && (
        <motion.div
          layoutId="sidebar-hover-bg"
          className="absolute inset-0 rounded-md bg-neutral-100/70 dark:bg-zinc-800/40 z-0"
          transition={{
            type: 'spring',
            stiffness: 600,
            damping: 35
          }}
        />
      )}
      <Link
        href={item.href}
        onClick={item.external ? undefined : handleClick}
        prefetch={false}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
        className={cn(
          'relative z-10 flex w-full justify-between items-center rounded-md px-3 py-1.5 text-xs transition-colors font-medium',
          isActive
            ? 'font-medium text-neutral-900 dark:text-white'
            : 'text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-200'
        )}
      >
        <span className="truncate">{item.name}</span>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {item.badge && (
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-mono font-medium leading-none',
                item.badge === 'Fix'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              )}
            >
              {item.badge}
            </span>
          )}

          {item.external && <ExternalLink className="size-3 opacity-50" />}

          {isActive && <VengeanceCursorIcon />}
        </div>
      </Link>
    </div>
  );
});

const SidebarSection = memo(function SidebarSection({
  section,
  isOpen,
  onToggle,
  hoveredPath,
  pathname,
  onHover
}: {
  section: SidebarSectionData;
  isOpen: boolean;
  onToggle: (name: string) => void;
  hoveredPath: string | null;
  pathname: string;
  onHover: (href: string) => void;
}) {
  const SectionIcon = section.icon;
  const isSectionActive = section.items.some((item) => {
    if (item.external) return false;
    return pathname === item.href.split('#')[0];
  });

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => onToggle(section.name)}
        className={cn(
          'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider font-mono transition-colors w-full text-left select-none group',
          isSectionActive
            ? 'text-neutral-900 dark:text-zinc-100'
            : 'text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-200'
        )}
      >
        <SectionIcon className="h-3.5 w-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
        <span className="min-w-0 flex-1 truncate">{section.name}</span>
        <ChevronUp
          className={cn(
            'h-3.5 w-3.5 text-neutral-400 dark:text-zinc-500 transition-transform duration-200',
            !isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="mt-1 ml-4 flex flex-col border-l border-neutral-200 dark:border-zinc-800/80 pl-2 space-y-0.5">
          {section.items.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              isActive={!item.external && pathname === item.href}
              isHovered={hoveredPath === item.href}
              onHover={onHover}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Mission Intelligence': true,
    'Decision Intelligence': true,
    'Attribution & Sandbox': true,
    'Commerce & Catalog': true
  });

  const toggleSection = useCallback((name: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  }, []);

  const handleHover = useCallback((href: string) => {
    setHoveredPath(href);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredPath(null);
  }, []);

  const user = {
    fullName: 'Nexus AI Director',
    emailAddresses: [{ emailAddress: 'director@nexus-engine.ai' }]
  };
  const organization = { name: 'Nike Direct D2C' };
  const signOut = () => router.push('/dashboard/overview');

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* 1. Vengeance UI Top Brand Header */}
      <SidebarHeader className="p-0 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-sidebar-border/60">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-6 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <VengeanceLogoMark className="size-3.5 rotate-45" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-sm tracking-tight text-foreground font-sans">
                NEXUS UI
              </span>
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
          </Link>
        </div>

        {/* Brand & Channel Quick Selectors */}
        <div className="p-2 flex flex-col gap-1.5">
          <OrgSwitcher />
          <ChannelSwitcher />
        </div>
      </SidebarHeader>

      {/* 2. Vengeance UI Tree Navigation Content */}
      <SidebarContent className="overflow-x-hidden p-2.5 space-y-4" onMouseLeave={handleMouseLeave}>
        {VENGEANCE_SECTIONS.map((section) => (
          <SidebarSection
            key={section.name}
            section={section}
            isOpen={openSections[section.name] ?? true}
            onToggle={toggleSection}
            hoveredPath={hoveredPath}
            pathname={pathname}
            onHover={handleHover}
          />
        ))}
      </SidebarContent>

      {/* 3. Vengeance UI Sidebar Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-2 bg-sidebar">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-left"
              />
            }
          >
            {user && <UserAvatarProfile className="h-8 w-8 rounded-lg" showInfo user={user} />}
            <ChevronsDown className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-lg bg-popover border-border shadow-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="px-2 py-1.5">
                  {user && <UserAvatarProfile className="h-8 w-8 rounded-lg" showInfo user={user} />}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              {organization && (
                <DropdownMenuItem onClick={() => router.push('/dashboard/billing')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => router.push('/dashboard/notifications')}>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
