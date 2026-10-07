'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface CardSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  radius?: number;
  color?: string;
  className?: string;
}

/**
 * CardSpotlight: Dynamic cursor-following spotlight card
 * Inspired by Aceternity UI and VengenceUI Cursor Cards.
 * Features border and backdrop illumination that dynamically tracks cursor movement.
 */
export function CardSpotlight({
  children,
  radius = 350,
  color = 'rgba(255, 255, 255, 0.05)',
  className = '',
  ...props
}: CardSpotlightProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xs p-6 text-card-foreground transition-all duration-200 hover:border-foreground/50 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 dark:before:via-white/20 before:to-transparent before:pointer-events-none',
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Radial Layer: adaptive illumination */}
      <div
        className='pointer-events-none absolute -inset-px transition-opacity duration-200'
        style={{
          background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, var(--color-foreground, currentColor), transparent 80%)`,
          opacity: isHovered ? 0.06 : 0
        }}
      />
      
      {/* Content wrapper */}
      <div className='relative z-10'>{children}</div>
    </div>
  );
}
