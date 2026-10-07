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
import { useRouter } from 'next/navigation';

export function OrgSwitcher() {
  const router = useRouter();
  const [activeBrand, setActiveBrand] = useState('Nike Direct');
  const brands = [
    { name: 'Nike Direct', category: 'Footwear & Performance', channels: 'Meta • Google • Amazon • Shopify', status: 'Live' },
    { name: 'Nike Sportswear', category: 'Apparel & Lifestyle', channels: 'Meta • Google • Shopify', status: 'Synced' },
    { name: 'Jordan Brand D2C', category: 'Basketball & Streetwear', channels: 'Meta • Google • SNKRS', status: 'Synced' }
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size='lg'
                tooltip='NEXUS D2C • Nike Catalog'
                className='h-12 rounded-xl border border-border/50 bg-background/60 hover:bg-muted/50 hover:border-border/80 text-foreground transition-all duration-200 shadow-2xs group data-popup-open:bg-muted/60 data-popup-open:border-border'
              />
            }
          >
            {/* Sleek Aceternity-style Logo Icon */}
            <div className='relative flex aspect-square size-8.5 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-neutral-900 dark:bg-neutral-950 text-white shadow-xs group-hover:border-primary/40 transition-colors'>
              <Icons.dashboard className='size-4 text-emerald-400 dark:text-emerald-400 group-hover:scale-105 transition-transform' />
              <span className='absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse' />
            </div>

            {/* Typography & Brand Info */}
            <div className='grid flex-1 text-left leading-tight min-w-0 group-data-[collapsible=icon]:hidden'>
              <div className='flex items-center gap-1.5'>
                <span className='truncate text-xs font-bold tracking-tight text-foreground font-mono'>
                  NEXUS D2C
                </span>
                <span className='rounded-sm bg-emerald-500/10 dark:bg-emerald-500/20 px-1 py-0.2 text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 leading-none'>
                  ONLINE
                </span>
              </div>
              <div className='flex items-center gap-1 mt-0.5'>
                <span className='truncate text-[11px] text-muted-foreground font-medium'>
                  {activeBrand}
                </span>
                <span className='text-[10px] text-muted-foreground/60 font-mono'>• Postgres 16</span>
              </div>
            </div>

            <Icons.chevronsDown className='ml-auto size-3.5 text-muted-foreground/70 shrink-0 group-hover:text-foreground transition-colors group-data-[collapsible=icon]:hidden' />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='w-(--anchor-width) min-w-60 rounded-xl bg-popover/95 backdrop-blur-md border-border/80 shadow-xl p-1.5'
            align='start'
            side='bottom'
            sideOffset={6}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='text-muted-foreground text-[10px] font-mono uppercase tracking-wider px-2 py-1'>
                Connected Brand Catalogs
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            {brands.map((b) => (
              <DropdownMenuItem
                key={b.name}
                onClick={() => setActiveBrand(b.name)}
                className='cursor-pointer rounded-lg p-2 hover:bg-muted/80 focus:bg-muted/80 transition-colors flex items-center justify-between gap-2'
              >
                <div className='flex flex-col gap-0.5 min-w-0'>
                  <div className='flex items-center gap-1.5'>
                    <span className='font-semibold text-xs text-foreground'>{b.name}</span>
                    <span className='text-[10px] text-muted-foreground font-mono font-normal'>({b.category})</span>
                  </div>
                  <span className='text-[10px] text-muted-foreground truncate'>{b.channels}</span>
                </div>
                {b.name === activeBrand ? (
                  <Badge variant='outline' className='text-[9px] py-0 px-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-mono shrink-0'>
                    Active
                  </Badge>
                ) : (
                  <span className='text-[10px] font-mono text-muted-foreground/70 shrink-0'>{b.status}</span>
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className='bg-border/60 my-1' />
            <DropdownMenuItem
              onClick={() => router.push('/')}
              className='cursor-pointer rounded-lg p-2 hover:bg-muted/80 text-xs font-mono text-muted-foreground hover:text-foreground flex items-center justify-between'
            >
              <div className='flex items-center gap-2'>
                <Icons.externalLink className='size-3.5 text-muted-foreground' />
                <span>Return to Landing Page</span>
              </div>
              <span className='text-[10px] text-muted-foreground/60 font-mono'>/</span>
            </DropdownMenuItem>
            <div className='px-2 py-1 text-[10px] text-muted-foreground font-mono flex items-center justify-between border-t border-border/40 pt-1.5 mt-0.5'>
              <span>ENGINE: SCIPY CONVEX</span>
              <span className='text-emerald-600 dark:text-emerald-400 font-semibold'>ACTIVE (CYC-9482)</span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
