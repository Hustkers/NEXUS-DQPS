'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CardSpotlight } from './card-spotlight';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function BentoGrid({
  className,
  children
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  tag,
  badge,
  href,
  actionText
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  tag?: string;
  badge?: React.ReactNode;
  href?: string;
  actionText?: string;
}) {
  return (
    <CardSpotlight
      className={cn(
        'row-span-1 rounded-2xl flex flex-col justify-between space-y-4 border border-border/80 bg-card/95 backdrop-blur-xs p-6 text-card-foreground hover:border-foreground/40 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] transition-all duration-200',
        className
      )}
    >
      {header && <div className='w-full overflow-hidden rounded-xl border border-border/60 bg-muted/20 backdrop-blur-xs'>{header}</div>}
      <div className='flex flex-col space-y-2.5 mt-auto'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            {icon && <span className='text-foreground shrink-0'>{icon}</span>}
            {tag && (
              <span className='font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold'>
                {tag}
              </span>
            )}
          </div>
          {badge}
        </div>
        <div className='font-sans font-bold text-foreground text-lg tracking-tight apple-title'>
          {title}
        </div>
        <div className='font-sans font-normal text-muted-foreground text-xs leading-relaxed'>
          {description}
        </div>
        {href && (
          <div className='pt-2 border-t border-border/50'>
            <Link
              href={href}
              className='inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:text-primary/80 transition-colors group/cta'
            >
              <span>{actionText || 'Explore in Cockpit →'}</span>
              <ArrowRight className='size-3 group-hover/cta:translate-x-0.5 transition-transform' />
            </Link>
          </div>
        )}
      </div>
    </CardSpotlight>
  );
}
