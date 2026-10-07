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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navGroups } from '@/config/nav-config';
import { useFilteredNavGroups } from '@/hooks/use-nav';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
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
  const { state } = useSidebar();
  const user = {
    fullName: 'Nexus AI Director',
    emailAddresses: [{ emailAddress: 'director@nexus-engine.ai' }]
  };
  const organization = { name: 'Nike Direct D2C' };
  const router = useRouter();
  const signOut = () => router.push('/auth/sign-in');
  const filteredGroups = useFilteredNavGroups(navGroups);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='group-data-[collapsible=icon]:pt-3 flex flex-col gap-2'>
        <OrgSwitcher />
        <ChannelSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className='py-1.5'>
            {group.label && (
              <SidebarGroupLabel className='font-mono text-[10px] uppercase tracking-wider text-[#8A8A8A] font-semibold px-2'>
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                const isItemActive =
                  pathname === item.url ||
                  (item.url !== '/dashboard/overview' && pathname.startsWith(item.url));

                return item?.items && item?.items?.length > 0 ? (
                  <Collapsible
                    key={item.title}
                    defaultOpen={item.isActive}
                    render={<SidebarMenuItem />}
                  >
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isItemActive}
                          className='group/collapsible'
                        />
                      }
                    >
                      {item.icon && <Icon />}
                      <span>{item.title}</span>
                      <Icons.chevronRight className='ml-auto transition-transform duration-200 group-data-panel-open/collapsible:rotate-90 group-data-[collapsible=icon]:hidden' />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              render={<Link href={subItem.url} aria-label={subItem.title} />}
                              isActive={pathname === subItem.url}
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} aria-label={item.title} />}
                      tooltip={item.title}
                      isActive={isItemActive}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size='lg'
                    tooltip={user.fullName}
                    className='data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground'
                  />
                }
              >
                {user && (
                  <div className='flex items-center gap-2 w-full min-w-0'>
                    <UserAvatarProfile className='h-8 w-8 rounded-lg shrink-0' user={user} />
                    <div className='grid flex-1 text-left text-sm leading-tight min-w-0 group-data-[collapsible=icon]:hidden'>
                      <span className='truncate font-medium text-white'>{user.fullName}</span>
                      <span className='truncate text-xs text-[#8A8A8A] font-mono'>
                        {user.emailAddresses[0].emailAddress}
                      </span>
                    </div>
                    <Icons.chevronsDown className='ml-auto size-4 text-[#8A8A8A] shrink-0 group-data-[collapsible=icon]:hidden' />
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-64 rounded-lg bg-[#1A1A1A] border-[#8A8A8A]'
                side={state === 'collapsed' ? 'right' : 'top'}
                align='end'
                sideOffset={state === 'collapsed' ? 12 : 8}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className='p-0 font-normal'>
                    <div className='flex items-center gap-2 px-2 py-2 text-left text-sm'>
                      <UserAvatarProfile className='h-8 w-8 rounded-lg shrink-0' user={user} />
                      <div className='grid flex-1 text-left text-sm leading-tight min-w-0'>
                        <span className='truncate font-medium text-white'>{user.fullName}</span>
                        <span className='truncate text-xs text-[#8A8A8A] font-mono'>
                          {user.emailAddresses[0].emailAddress}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className='bg-[#8A8A8A]' />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                    className='cursor-pointer text-white hover:bg-[#000000]'
                  >
                    <Icons.account className='mr-2 h-4 w-4 text-[#8A8A8A]' />
                    Profile
                  </DropdownMenuItem>
                  {organization && (
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard/billing')}
                      className='cursor-pointer text-white hover:bg-[#000000]'
                    >
                      <Icons.creditCard className='mr-2 h-4 w-4 text-[#8A8A8A]' />
                      Billing
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/notifications')}
                    className='cursor-pointer text-white hover:bg-[#000000]'
                  >
                    <Icons.notification className='mr-2 h-4 w-4 text-[#8A8A8A]' />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className='bg-[#8A8A8A]' />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className='cursor-pointer hover:bg-[#000000] text-white focus:text-white'
                  >
                    <Icons.logout aria-hidden className='mr-2 h-4 w-4 text-[#8A8A8A]' />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
