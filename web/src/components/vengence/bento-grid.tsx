'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CardSpotlight } from './card-spotlight';

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
  badge
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  tag?: string;
  badge?: React.ReactNode;
}) {
  return (
    <CardSpotlight
      className={cn(
        'row-span-1 rounded-[6px] flex flex-col justify-between space-y-4 border border-[#8A8A8A] bg-[#1A1A1A] p-6 hover:border-[#FFFFFF] shadow-none transition-colors duration-150',
        className
      )}
    >
      {header && <div className='w-full overflow-hidden rounded-[4px] border border-[#8A8A8A]/50 bg-[#000000]'>{header}</div>}
      <div className='flex flex-col space-y-2 mt-auto'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            {icon && <span className='text-[#FFFFFF] shrink-0'>{icon}</span>}
            {tag && (
              <span className='font-mono text-[10px] uppercase tracking-wider text-[#8A8A8A] font-semibold'>
                {tag}
              </span>
            )}
          </div>
          {badge}
        </div>
        <div className='font-sans font-bold text-[#FFFFFF] text-lg tracking-tight'>
          {title}
        </div>
        <div className='font-sans font-normal text-[#8A8A8A] text-xs leading-relaxed'>
          {description}
        </div>
      </div>
    </CardSpotlight>
  );
}
