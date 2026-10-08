'use client';

import React, { useState } from 'react';
import {
  IconWorld,
  IconChevronDown,
  IconCheck
} from '@tabler/icons-react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { useChannel, AdChannel, CHANNELS } from '@/context/channel-context';
import { cn } from '@/lib/utils';

export function ChannelSwitcher() {
  const { state } = useSidebar();
  const { channel, setChannel, channelInfo } = useChannel();
  const [isOpen, setIsOpen] = useState(false);

  const getChannelIcon = (id: AdChannel, className = 'size-3.5') => {
    switch (id) {
      case 'amazon':
        return <Icons.amazon className={className} />;
      case 'google':
        return <Icons.google className={className} />;
      case 'meta':
        return <Icons.meta className={className} />;
      case 'shopify':
        return <Icons.shopify className={className} />;
      default:
        return <IconWorld className={className} />;
    }
  };

  const channelList: { id: AdChannel; name: string; type: string; details: string; status: string }[] = [
    {
      id: 'all',
      name: 'All Channels (Blended)',
      type: 'Omnichannel D2C',
      details: 'Blended spend, unified attribution & portfolio ROAS',
      status: 'Live'
    },
    {
      id: 'amazon',
      name: 'Amazon Advertising',
      type: 'Marketplace',
      details: 'Sponsored Products & Buy Box defense',
      status: 'Live'
    },
    {
      id: 'google',
      name: 'Google Ads',
      type: 'P-Max & Search',
      details: 'Shopping feeds & high-intent search',
      status: 'Live'
    },
    {
      id: 'meta',
      name: 'Meta Ads',
      type: 'Advantage+',
      details: 'Instagram & Facebook Reels discovery',
      status: 'Live'
    },
    {
      id: 'shopify',
      name: 'Shopify Storefront',
      type: 'Direct D2C',
      details: 'Direct checkout, cart retention & catalog',
      status: 'Live'
    }
  ];

  // If sidebar is collapsed into icon rail, provide seamless icon popover
  if (state === 'collapsed') {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size='lg'
                  tooltip={`Channel: ${channelInfo.name}`}
                  className='h-10 rounded-xl border border-border/60 bg-background/70 hover:bg-muted/60 hover:border-border/80 text-foreground transition-all duration-150 active:scale-[0.96] shadow-2xs'
                />
              }
            >
              <div className='flex aspect-square size-7 items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-foreground'>
                {getChannelIcon(channel, 'size-3.5')}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-64 rounded-2xl bg-popover/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-border/70 shadow-2xl p-1.5 overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/35 dark:before:via-white/10 before:to-transparent'
              align='start'
              side='right'
              sideOffset={12}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className='text-muted-foreground text-[10px] font-mono uppercase tracking-wider px-2 py-1'>
                  Ad Channels
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              {channelList.map((ch) => {
                const isSelected = channel === ch.id;
                return (
                  <DropdownMenuItem
                    key={ch.id}
                    onClick={() => setChannel(ch.id)}
                    className={cn(
                      'cursor-pointer rounded-lg p-2 transition-colors flex items-center justify-between gap-2',
                      isSelected ? 'bg-accent font-semibold text-foreground' : 'hover:bg-muted/70 text-foreground/80'
                    )}
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      <div className='flex aspect-square size-6 items-center justify-center rounded-md border border-border/60 bg-muted/30 shrink-0'>
                        {getChannelIcon(ch.id, 'size-3')}
                      </div>
                      <div className='flex flex-col min-w-0'>
                        <span className='text-xs truncate'>{ch.name}</span>
                        <span className='text-[10px] text-muted-foreground truncate'>{ch.type}</span>
                      </div>
                    </div>
                    {isSelected && <IconCheck className='size-3.5 text-primary shrink-0' />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Expanded Sidebar: Aceternity UI Collapsible Accordion Navigation Item
  return (
    <div className='w-full min-w-0'>
      {/* Accordion Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='relative flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.97] text-muted-foreground hover:bg-muted/60 hover:text-foreground group border border-border/50 hover:border-border/80 shadow-2xs overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 dark:before:via-white/10 before:to-transparent'
      >
        <span className='relative z-10 flex min-w-0 flex-1 items-center gap-2'>
          <span className='flex size-6 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-foreground group-hover:border-primary/30 transition-colors'>
            {getChannelIcon(channel, 'size-3.5')}
          </span>
          <span className='truncate font-medium text-foreground text-xs'>
            {channelInfo.name}
          </span>
        </span>

        <div className='flex items-center gap-1.5 shrink-0 ml-2'>
          <span className='rounded-sm bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-primary leading-none'>
            {channelInfo.badge}
          </span>
          <IconChevronDown
            className={cn(
              'size-3 shrink-0 text-muted-foreground/70 transition-transform duration-200',
              isOpen && 'rotate-180 text-foreground'
            )}
          />
        </div>
      </button>

      {/* Accordion Collapsible Content with Aceternity Tree Connector */}
      {isOpen && (
        <div className='mt-1 ml-4.5 min-w-0 border-l border-border/60 py-1 pl-2.5 space-y-0.5 animate-in fade-in-50 duration-150'>
          {channelList.map((ch) => {
            const isSelected = channel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setChannel(ch.id)}
                className={cn(
                  'group/ch relative flex w-full min-w-0 items-center justify-between rounded-md px-2 py-1 text-xs transition-colors text-left',
                  isSelected
                    ? 'bg-accent/80 font-semibold text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <div className='flex items-center gap-2 min-w-0 flex-1'>
                  <span className='flex size-4.5 shrink-0 items-center justify-center text-muted-foreground group-hover/ch:text-foreground'>
                    {getChannelIcon(ch.id, 'size-3')}
                  </span>
                  <span className='truncate text-[11px]'>{ch.name}</span>
                </div>

                <div className='flex items-center gap-1 shrink-0 ml-1'>
                  <span className='text-[9px] font-mono text-muted-foreground/70 hidden sm:inline'>
                    {ch.type}
                  </span>
                  {isSelected && (
                    <span className='size-1.5 rounded-full bg-emerald-500 shrink-0 ml-1' />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
