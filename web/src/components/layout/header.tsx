import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import CtaGithub from './cta-github';
import { NotificationCenter } from '@/features/notifications/components/notification-center';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  return (
    <header className='bg-background/80 border-b border-border/70 sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 backdrop-blur-md md:h-14 w-full min-w-0 px-2.5 sm:px-4'>
      <div className='flex items-center gap-2 min-w-0 shrink overflow-hidden'>
        <SidebarTrigger className='-ml-1 shrink-0' />
        <Separator orientation='vertical' className='mr-2 h-4 data-vertical:self-center shrink-0' />
        <div className='min-w-0 truncate'>
          <Breadcrumbs />
        </div>
      </div>

      <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
        <CtaGithub />
        <SearchInput />
        <NotificationCenter />
        <ThemeToggle />
      </div>
    </header>
  );
}
