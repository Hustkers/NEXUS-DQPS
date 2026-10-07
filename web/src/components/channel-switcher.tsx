'use client';

import React from 'react';
import {
  IconBrandAmazon,
  IconBrandGoogle,
  IconBrandMeta,
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
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { useChannel, AdChannel, CHANNELS } from '@/context/channel-context';

export function ChannelSwitcher() {
  const { channel, setChannel, channelInfo } = useChannel();

  const getChannelIcon = (id: AdChannel, className = 'size-4') => {
    switch (id) {
      case 'amazon':
        return <IconBrandAmazon className={className} />;
      case 'google':
        return <IconBrandGoogle className={className} />;
      case 'meta':
        return <IconBrandMeta className={className} />;
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
    }
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size='default'
                tooltip={`Channel: ${channelInfo.name}`}
                className='border border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-900/80 text-zinc-200 transition-all data-popup-open:bg-sidebar-accent'
              />
            }
          >
            {/* Left Icon */}
            <div className={`flex aspect-square size-6 items-center justify-center rounded-md border ${channelInfo.accentColor}`}>
              {getChannelIcon(channel, 'size-3.5')}
            </div>

            {/* Label and Subtext in Expanded Mode */}
            <div className='grid flex-1 text-left text-xs leading-tight'>
              <div className='flex items-center justify-between'>
                <span className='truncate font-medium text-zinc-100'>{channelInfo.name}</span>
                <span className='text-[10px] font-mono text-zinc-500 uppercase'>{channelInfo.badge}</span>
              </div>
              <span className='truncate text-[10px] text-zinc-400 font-mono'>Ad Channel Filter</span>
            </div>

            <Icons.chevronsDown className='ml-auto size-3.5 text-muted-foreground' />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='w-(--anchor-width) min-w-64 rounded-lg bg-zinc-950 border-zinc-800'
            align='start'
            side='bottom'
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='text-zinc-400 text-[11px] font-mono uppercase tracking-wider px-2 py-1.5'>
                Ad Channels (Active Campaigns)
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            {channelList.map((ch) => {
              const isSelected = channel === ch.id;
              return (
                <DropdownMenuItem
                  key={ch.id}
                  onClick={() => setChannel(ch.id)}
                  className={`cursor-pointer flex items-start gap-2.5 p-2 rounded-md hover:bg-zinc-900 focus:bg-zinc-900 ${
                    isSelected ? 'bg-zinc-900/70 border-l-2 border-emerald-400' : ''
                  }`}
                >
                  <div className={`mt-0.5 flex aspect-square size-6 items-center justify-center rounded-md border ${CHANNELS[ch.id]?.accentColor || 'text-zinc-400 border-zinc-800'}`}>
                    {getChannelIcon(ch.id, 'size-3.5')}
                  </div>
                  <div className='flex flex-col flex-1 min-w-0'>
                    <div className='flex items-center justify-between'>
                      <span className={`text-xs font-semibold ${isSelected ? 'text-zinc-100 font-bold' : 'text-zinc-300'}`}>
                        {ch.name}
                      </span>
                      {isSelected && (
                        <Badge variant='outline' className='text-[9px] py-0 px-1 border-emerald-500/40 text-emerald-400 bg-emerald-950/40 font-mono'>
                          Selected
                        </Badge>
                      )}
                    </div>
                    <span className='text-[10px] text-zinc-500 truncate'>{ch.details}</span>
                  </div>
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator className='bg-zinc-800' />
            <div className='p-2 text-[10px] text-zinc-400 font-mono flex items-center justify-between'>
              <span>SYNC: REAL-TIME (POSTGRES)</span>
              <span className='text-emerald-400 font-semibold'>ACTIVE</span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
