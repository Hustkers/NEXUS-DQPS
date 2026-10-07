'use client';

import { Icons } from '@/components/icons';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import React from 'react';

export function OrgSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          tooltip='NEXUS D2C Decision Engine'
          className='border border-emerald-500/20 bg-emerald-950/20 hover:bg-emerald-900/30 transition-all cursor-default'
        >
          <div className='bg-emerald-500/10 border-emerald-500/30 text-emerald-400 flex aspect-square size-8 items-center justify-center rounded-lg border shadow-xs shrink-0'>
            <Icons.dashboard className='size-4 animate-pulse text-emerald-400' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight min-w-0 group-data-[collapsible=icon]:hidden'>
            <div className='flex items-center gap-1.5'>
              <span className='truncate font-bold tracking-tight text-emerald-400'>NEXUS D2C</span>
              <span className='size-1.5 rounded-full bg-emerald-400 animate-ping' />
            </div>
            <span className='truncate text-[11px] text-muted-foreground'>Amazon • Google • Meta • Shopify</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
