'use client';

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
import React, { useState } from 'react';

export function OrgSwitcher() {
  const [activeBrand, setActiveBrand] = useState('Nike Direct (Footwear & Apparel)');
  const brands = [
    { name: 'Nike Direct (Footwear & Apparel)', channels: 'Meta • Google • Amazon • TikTok (Postgres 16)', active: true },
    { name: 'Jordan Brand D2C', channels: 'Meta Advantage+ • TikTok Shop', active: false },
    { name: 'Nike Training & Running Club', channels: 'Google Shopping • Amazon Ads', active: false }
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size='lg'
                tooltip='Nike Direct D2C Catalogs'
                className='data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground border border-emerald-500/20 bg-emerald-950/20 hover:bg-emerald-900/30 transition-all'
              />
            }
          >
            <div className='bg-emerald-500/10 border-emerald-500/30 text-emerald-400 flex aspect-square size-8 items-center justify-center rounded-lg border shadow-xs'>
              <Icons.dashboard className='size-4 animate-pulse text-emerald-400' />
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <div className='flex items-center gap-1.5'>
                <span className='truncate font-bold tracking-tight text-emerald-400'>NEXUS D2C</span>
                <span className='size-1.5 rounded-full bg-emerald-400 animate-ping' />
              </div>
              <span className='truncate text-[11px] text-muted-foreground'>{activeBrand}</span>
            </div>
            <Icons.chevronsDown className='ml-auto size-4 text-muted-foreground' />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--anchor-width) min-w-56 rounded-lg bg-zinc-950 border-zinc-800'
            align='start'
            side='bottom'
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='text-muted-foreground text-xs font-mono uppercase tracking-wider'>
                Connected D2C Catalogs (PostgreSQL)
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {brands.map((b) => (
              <DropdownMenuItem
                key={b.name}
                onClick={() => setActiveBrand(b.name)}
                className='cursor-pointer flex flex-col items-start gap-0.5 hover:bg-zinc-900 focus:bg-zinc-900'
              >
                <div className='flex w-full items-center justify-between'>
                  <span className='font-medium text-xs text-zinc-200'>{b.name}</span>
                  {b.name === activeBrand && (
                    <Badge variant='outline' className='text-[10px] py-0 px-1 border-emerald-500/40 text-emerald-400 bg-emerald-950/40'>
                      Active
                    </Badge>
                  )}
                </div>
                <span className='text-[10px] text-zinc-500'>{b.channels}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className='bg-zinc-800' />
            <div className='p-2 text-[10px] text-zinc-400 font-mono flex items-center justify-between'>
              <span>DB: POSTGRES (DOCKER)</span>
              <span className='text-emerald-400 font-semibold'>ONLINE</span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
