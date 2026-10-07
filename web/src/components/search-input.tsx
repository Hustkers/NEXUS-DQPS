'use client';

import { useKBar } from 'kbar';
import { IconSearch } from '@tabler/icons-react';
import { Button } from './ui/button';

export default function SearchInput() {
  const { query } = useKBar();

  return (
    <div className='w-full'>
      <Button
        variant='outline'
        className='bg-background/80 text-muted-foreground hover:text-foreground hover:bg-muted/60 relative h-9 w-9 p-0 md:px-3 md:py-2 md:w-48 lg:w-64 justify-center md:justify-start rounded-[0.5rem] text-xs font-mono shadow-none border-border/80 transition-colors'
        onClick={() => query?.toggle()}
        title='Search (⌘K)'
      >
        <div className='flex items-center gap-1 md:mr-2'>
          <IconSearch className='h-3.5 w-3.5 text-muted-foreground' />
        </div>
        <span className='hidden md:inline truncate'>Search...</span>
        <kbd className='bg-muted pointer-events-none absolute top-[0.35rem] right-[0.35rem] hidden h-5 items-center gap-1 rounded border border-border/70 px-1.5 font-mono text-[10px] font-medium opacity-100 select-none lg:flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>
    </div>
  );
}
