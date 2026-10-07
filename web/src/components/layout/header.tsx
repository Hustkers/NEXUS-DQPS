import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import CtaGithub from './cta-github';
import { NotificationCenter } from '@/features/notifications/components/notification-center';

export default function Header() {
  return (
    <header className='bg-background/80 border-b border-border/70 sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 backdrop-blur-md md:h-14'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4 data-vertical:self-center' />
        <Breadcrumbs />
      </div>

      <div className='flex items-center gap-2 px-4'>
        <a
          href='/'
          className='hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/70 transition-colors'
          title='View Landing Page & Pitch Story'
        >
          <span>← Pitch & Overview</span>
        </a>
        <CtaGithub />
        <div className='hidden md:flex'>
          <SearchInput />
        </div>
        <NotificationCenter />
      </div>
    </header>
  );
}
