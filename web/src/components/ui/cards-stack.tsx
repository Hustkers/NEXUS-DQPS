'use client';

import * as React from 'react';
import { HTMLMotionProps, motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface CardStickyProps extends HTMLMotionProps<'div'> {
  index: number;
  incrementY?: number;
  incrementZ?: number;
  baseTop?: number;
}

const ContainerScroll = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(({ children, className, style, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('relative w-full', className)}
      style={{ perspective: '1000px', ...style }}
      {...props}
    >
      {children}
    </div>
  );
});
ContainerScroll.displayName = 'ContainerScroll';

const CardSticky = React.forwardRef<HTMLDivElement, CardStickyProps>(
  (
    {
      index,
      incrementY = 24,
      incrementZ = 10,
      baseTop = 88,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const y = baseTop + index * incrementY;
    const z = index * incrementZ;

    return (
      <motion.div
        ref={ref}
        layout='position'
        style={{
          top: `${y}px`,
          zIndex: 10 + index,
          transform: `translateZ(${z}px)`,
          backfaceVisibility: 'hidden',
          ...style
        }}
        className={cn('sticky', className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

CardSticky.displayName = 'CardSticky';

export { ContainerScroll, CardSticky };
