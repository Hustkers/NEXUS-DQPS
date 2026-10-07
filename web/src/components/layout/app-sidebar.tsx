'use client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
              <SidebarGroupLabel className='font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-semibold px-2'>
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
                      <span className='truncate font-medium text-zinc-200'>{user.fullName}</span>
                      <span className='truncate text-xs text-zinc-500 font-mono'>
                        {user.emailAddresses[0].emailAddress}
                      </span>
                    </div>
                    <Icons.chevronsDown className='ml-auto size-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden' />
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-64 rounded-lg bg-zinc-950 border-zinc-800'
                side={state === 'collapsed' ? 'right' : 'top'}
                align='end'
                sideOffset={state === 'collapsed' ? 12 : 8}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className='p-0 font-normal'>
                    <div className='flex items-center gap-2 px-2 py-2 text-left text-sm'>
                      <UserAvatarProfile className='h-8 w-8 rounded-lg shrink-0' user={user} />
                      <div className='grid flex-1 text-left text-sm leading-tight min-w-0'>
                        <span className='truncate font-medium text-zinc-100'>{user.fullName}</span>
                        <span className='truncate text-xs text-zinc-400 font-mono'>
                          {user.emailAddresses[0].emailAddress}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className='bg-zinc-800' />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                    className='cursor-pointer hover:bg-zinc-900'
                  >
                    <Icons.account className='mr-2 h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                  {organization && (
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard/billing')}
                      className='cursor-pointer hover:bg-zinc-900'
                    >
                      <Icons.creditCard className='mr-2 h-4 w-4' />
                      Billing
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/notifications')}
                    className='cursor-pointer hover:bg-zinc-900'
                  >
                    <Icons.notification className='mr-2 h-4 w-4' />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className='bg-zinc-800' />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className='cursor-pointer hover:bg-zinc-900 text-rose-400 focus:text-rose-400'
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
