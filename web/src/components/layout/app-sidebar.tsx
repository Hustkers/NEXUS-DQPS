'use client';

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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
import { ChannelSwitcher } from '../channel-switcher';
import { VengenceSidebar, VengenceDiagonalDivider } from '@/components/vengence/vengence-sidebar';

export default function AppSidebar() {
  const { state } = useSidebar();
  const user = {
    fullName: 'Nexus AI Director',
    emailAddresses: [{ emailAddress: 'director@nexus-engine.ai' }]
  };
  const organization = { name: 'Nike' };
  const router = useRouter();
  const signOut = (_opts?: unknown) => router.push('/auth/sign-in');

  return (
    <Sidebar collapsible='icon' className='border-r border-sidebar-border'>
      {/* Vengence UI Diagonal Striped Divider along the sidebar border */}
      <VengenceDiagonalDivider />

      {/* Top Brand & Ad Channels Header */}
      <SidebarHeader className='group-data-[collapsible=icon]:pt-2 flex flex-col gap-1.5 p-2'>
        {/* NEXUS Brand Home Link */}
        <div className='flex items-center justify-between px-1.5 py-1 group-data-[collapsible=icon]:justify-center'>
          <Link
            href='/'
            className='flex items-center gap-2 group text-foreground hover:opacity-90 transition-opacity rounded-md p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            title='NEXUS D2C — Return to Landing Page'
          >
            <div className='bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg px-2 py-0.5 font-black font-orbitron text-xs tracking-tight flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform'>
              NX
            </div>
            <div className='flex items-center gap-1.5 group-data-[collapsible=icon]:hidden'>
              <span className='font-bold text-sm tracking-tight text-foreground font-orbitron'>
                nexusdqps
              </span>
              <span className='text-[9px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground group-hover:text-foreground transition-colors'>
                ← Home
              </span>
            </div>
          </Link>
        </div>

        <OrgSwitcher />
        <ChannelSwitcher />
      </SidebarHeader>

      {/* Core Vengence UI Sliding Sidebar Navigation */}
      <SidebarContent className='no-scrollbar overflow-x-hidden px-2 pt-2'>
        <VengenceSidebar />
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter className='p-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size='lg'
                    tooltip={user.fullName}
                    className='data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground rounded-lg transition-colors'
                  />
                }
              >
                {user && (
                  <div className='flex items-center gap-2 w-full min-w-0'>
                    <UserAvatarProfile className='h-8 w-8 rounded-lg shrink-0' user={user} />
                    <div className='grid flex-1 text-left text-sm leading-tight min-w-0 group-data-[collapsible=icon]:hidden'>
                      <span className='truncate font-medium text-foreground'>{user.fullName}</span>
                      <span className='truncate text-xs text-muted-foreground font-mono'>
                        {user.emailAddresses[0].emailAddress}
                      </span>
                    </div>
                    <Icons.chevronsDown className='ml-auto size-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden' />
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-64 rounded-lg bg-popover border-border shadow-lg'
                side={state === 'collapsed' ? 'right' : 'top'}
                align='end'
                sideOffset={state === 'collapsed' ? 12 : 8}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className='p-0 font-normal'>
                    <div className='flex items-center gap-2 px-2 py-2 text-left text-sm'>
                      <UserAvatarProfile className='h-8 w-8 rounded-lg shrink-0' user={user} />
                      <div className='grid flex-1 text-left text-sm leading-tight min-w-0'>
                        <span className='truncate font-medium text-foreground'>{user.fullName}</span>
                        <span className='truncate text-xs text-muted-foreground font-mono'>
                          {user.emailAddresses[0].emailAddress}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className='bg-border' />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                    className='cursor-pointer text-foreground hover:bg-accent'
                  >
                    <Icons.account className='mr-2 h-4 w-4 text-muted-foreground' />
                    Profile
                  </DropdownMenuItem>
                  {organization && (
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard/billing')}
                      className='cursor-pointer text-foreground hover:bg-accent'
                    >
                      <Icons.creditCard className='mr-2 h-4 w-4 text-muted-foreground' />
                      Billing
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/notifications')}
                    className='cursor-pointer text-foreground hover:bg-accent'
                  >
                    <Icons.notification className='mr-2 h-4 w-4 text-muted-foreground' />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/')}
                    className='cursor-pointer text-foreground hover:bg-accent'
                  >
                    <Icons.externalLink className='mr-2 h-4 w-4 text-muted-foreground' />
                    Landing Page
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className='bg-border' />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className='cursor-pointer hover:bg-accent text-destructive focus:text-destructive'
                  >
                    <Icons.logout aria-hidden className='mr-2 h-4 w-4' />
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
