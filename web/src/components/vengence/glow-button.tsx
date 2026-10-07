'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'shimmer' | 'glow' | 'outline' | 'default' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

/**
 * GlowButton: Inspired by VengenceUI Button Forge & Aceternity Moving Border
 * Provides high-tactile haptic button animations with shimmer borders and light-theme clarity.
 */
export function GlowButton({
  children,
  variant = 'default',
  size = 'md',
  href,
  icon,
  iconPosition = 'right',
  className = '',
  disabled,
  onClick,
  ...props
}: GlowButtonProps) {
  const sizeClasses = {
    sm: 'h-9 px-4 text-xs rounded-lg',
    md: 'h-11 px-5 text-sm rounded-xl',
    lg: 'h-13 px-7 text-base rounded-2xl'
  }[size];

  const variantClasses = {
    default:
      'bg-primary text-primary-foreground font-semibold shadow-[0_2px_12px_rgba(0,0,0,0.1)] hover:brightness-105 active:brightness-95 border border-primary/20',
    shimmer:
      'relative bg-secondary/80 backdrop-blur-xs text-secondary-foreground font-medium overflow-hidden border border-border/80 hover:border-foreground/60 shadow-xs group',
    glow:
      'bg-primary text-primary-foreground font-semibold hover:brightness-105 active:brightness-95 border border-primary/20 shadow-[0_4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_24px_rgba(255,255,255,0.12)]',
    outline:
      'bg-background/80 backdrop-blur-xs text-foreground border border-border/80 hover:bg-muted/60 hover:border-foreground/40 font-mono shadow-xs',
    pill:
      'rounded-full bg-background/80 backdrop-blur-xs text-foreground border border-border/80 hover:bg-muted/60 hover:border-foreground/40 font-mono text-xs shadow-xs'
  }[variant];

  const content = (
    <>
      {/* Monochromatic Shimmer Runner for variant="shimmer" */}
      {variant === 'shimmer' && (
        <span
          className='pointer-events-none absolute -inset-full w-[200%] h-[200%] animate-[spin_4s_linear_infinite] opacity-15 bg-[conic-gradient(from_0deg,transparent_0_340deg,#FFFFFF_360deg)]'
          aria-hidden='true'
        />
      )}

      {/* Button Interior */}
      <span className='relative z-10 flex items-center justify-center gap-2 font-medium tracking-tight'>
        {icon && iconPosition === 'left' && <span className='shrink-0'>{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <span className='shrink-0 transition-transform duration-150 group-hover:translate-x-0.5'>
            {icon}
          </span>
        )}
      </span>
    </>
  );

  const buttonClasses = cn(
    'relative inline-flex items-center justify-center cursor-pointer select-none transition-all duration-150 outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:border-border disabled:cursor-not-allowed',
    sizeClasses,
    variantClasses,
    className
  );

  const springTransition = {
    type: 'spring' as const,
    damping: 26,
    stiffness: 380,
    mass: 0.8
  };

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        <motion.span
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.96 }}
          transition={springTransition}
          className='flex items-center gap-2 size-full justify-center'
        >
          {content}
        </motion.span>
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.96 }}
      transition={springTransition}
      disabled={disabled}
      onClick={onClick}
      className={buttonClasses}
      {...(props as any)}
    >
      {content}
    </motion.button>
  );
}
