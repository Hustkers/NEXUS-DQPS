'use client';

import React from 'react';
import {
  IconBrandAmazon,
  IconBrandGoogle,
  IconBrandMeta,
  IconShoppingBag,
  IconWorld
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

export function ChannelSwitcher() {
  const { state } = useSidebar();
  const { channel, setChannel, channelInfo } = useChannel();

  const getChannelIcon = (id: AdChannel, className = 'size-4') => {
    switch (id) {
      case 'amazon':
        return <IconBrandAmazon className={className} />;
      case 'google':
        return <IconBrandGoogle className={className} />;
      case 'meta':
        return <IconBrandMeta className={className} />;
      case 'shopify':
        return <IconShoppingBag className={className} />;
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
      type: 'Retail Media / Marketplace',
      details: 'Sponsored Products, Brands & Buy Box Defense',
      status: 'Live'
    },
    {
      id: 'google',
      name: 'Google Ads',
      type: 'Search & Shopping',
      details: 'Performance Max, Google Merchant Center Feed',
      status: 'Live'
    },
    {
      id: 'meta',
      name: 'Meta Ads',
      type: 'Social & Discovery',
      details: 'Advantage+ Shopping Campaigns (Instagram & Facebook)',
      status: 'Live'
    },
    {
      id: 'shopify',
      name: 'Shopify Storefront',
      type: 'Direct-to-Consumer',
      details: 'Direct checkout, headless store & product catalog',
      status: 'Live'
    }
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size='lg'
                tooltip={`Channel: ${channelInfo.name}`}
                className='border border-border bg-card hover:bg-accent/60 text-foreground transition-all shadow-2xs data-popup-open:bg-sidebar-accent'
              />
            }
          >
            {/* Left Icon */}
            <div className={`flex aspect-square size-8 items-center justify-center rounded-lg border shadow-xs shrink-0 ${channelInfo.accentColor}`}>
              {getChannelIcon(channel, 'size-4')}
            </div>

            {/* Label and Subtext in Expanded Mode */}
            <div className='grid flex-1 text-left text-xs leading-tight min-w-0 group-data-[collapsible=icon]:hidden'>
              <div className='flex items-center justify-between'>
                <span className='truncate font-semibold text-foreground'>{channelInfo.name}</span>
                <span className='text-[10px] font-mono text-muted-foreground uppercase'>{channelInfo.badge}</span>
              </div>
              <span className='truncate text-[10px] text-muted-foreground font-mono'>Ad Channel Filter</span>
            </div>

            <Icons.chevronsDown className='ml-auto size-3.5 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden' />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='w-(--anchor-width) min-w-64 rounded-xl bg-popover border-border shadow-lg'
            align='start'
            side='bottom'
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='text-muted-foreground text-[11px] font-mono uppercase tracking-wider px-2 py-1.5'>
                Ad Channels (Active Campaigns)
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            {channelList.map((ch) => {
              const isSelected = channel === ch.id;
              return (
                <DropdownMenuItem
                  key={ch.id}
                  onClick={() => setChannel(ch.id)}
                  className={`cursor-pointer flex items-start gap-2.5 p-2 rounded-lg hover:bg-accent focus:bg-accent ${
                    isSelected ? 'bg-accent/80 border-l-2 border-emerald-500' : ''
                  }`}
                >
                  <div className={`mt-0.5 flex aspect-square size-6 items-center justify-center rounded-md border ${CHANNELS[ch.id]?.accentColor || 'text-muted-foreground border-border'}`}>
                    {getChannelIcon(ch.id, 'size-3.5')}
                  </div>
                  <div className='flex flex-col flex-1 min-w-0'>
                    <div className='flex items-center justify-between'>
                      <span className={`text-xs font-semibold ${isSelected ? 'text-foreground font-bold' : 'text-foreground/90'}`}>
                        {ch.name}
                      </span>
                      {isSelected && (
                        <Badge variant='outline' className='text-[9px] py-0 px-1 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-mono'>
                          Selected
                        </Badge>
                      )}
                    </div>
                    <span className='text-[10px] text-muted-foreground truncate'>{ch.details}</span>
                  </div>
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator className='bg-border' />
            <div className='p-2 text-[10px] text-muted-foreground font-mono flex items-center justify-between'>
              <span>SYNC: REAL-TIME (POSTGRES)</span>
              <span className='text-emerald-600 dark:text-emerald-400 font-semibold'>ACTIVE</span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
