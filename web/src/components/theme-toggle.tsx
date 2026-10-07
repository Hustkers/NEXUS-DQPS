'use client';

import { useSyncExternalStore } from 'react';
import { MoonStar, SunDim } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { startThemeTransition } from '@/lib/theme-transition';

const emptySubscribe = () => () => {};

export const ThemeToggle = () => {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { theme, setTheme, systemTheme } = useTheme();

  const getTheme = () => {
    if (theme === 'system') {
      return systemTheme;
    }
    return theme;
  };

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const curTheme =
      getTheme() ||
      (typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light');
    const nextTheme = curTheme === 'dark' ? 'light' : 'dark';

    const rect = event.currentTarget.getBoundingClientRect();
    const clientX = event.clientX || rect.left + rect.width / 2;
    const clientY = event.clientY || rect.top + rect.height / 2;

    startThemeTransition(() => {
      // Synchronously apply class to documentElement so View Transition captures the new theme immediately
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      document.documentElement.setAttribute('data-theme', nextTheme);
      setTheme(nextTheme);
    }, { clientX, clientY });
  };

  if (!mounted) {
    return (
      <Button
        variant='ghost'
        aria-label='toggle theme'
        className='theme-btn group size-8 rounded-full border border-border/80 hover:bg-muted/80 p-0 inline-flex items-center justify-center transition-all'
      >
        <SunDim className='theme-toggle-icon size-4.5 text-foreground/80' />
      </Button>
    );
  }

  const isDark = getTheme() === 'dark';

  return (
    <Button
      onClick={handleToggle}
      variant='ghost'
      aria-label='toggle theme'
      title='Toggle theme'
      className='theme-btn group size-8 rounded-full border border-border/80 hover:bg-muted/80 p-0 inline-flex items-center justify-center transition-all active:scale-90 cursor-pointer'
    >
      {isDark ? (
        <SunDim className='theme-toggle-icon size-4.5 text-foreground/80 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-105' />
      ) : (
        <MoonStar className='theme-toggle-icon size-4.5 text-foreground/80 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-105' />
      )}
    </Button>
  );
};