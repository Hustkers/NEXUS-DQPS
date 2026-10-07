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
        'group relative overflow-hidden rounded-[6px] border border-[#8A8A8A] bg-[#1A1A1A] p-6 text-[#FFFFFF] transition-colors duration-150 hover:border-[#FFFFFF] shadow-none',
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Radial Layer: pure white low-opacity illumination */}
      <div
        className='pointer-events-none absolute -inset-px transition-opacity duration-150'
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${color}, transparent 80%)`
        }}
      />
      
      {/* Content wrapper */}
      <div className='relative z-10'>{children}</div>
    </div>
  );
}
