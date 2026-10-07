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
    sm: 'h-9 px-3.5 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-13 px-7 text-base'
  }[size];

  const variantClasses = {
    default:
      'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm hover:shadow-md border border-zinc-900/10 dark:border-white/20',
    shimmer:
      'relative bg-zinc-900 text-white dark:bg-zinc-950 dark:text-white font-medium overflow-hidden border border-zinc-700/60 shadow-md group',
    glow:
      'bg-primary text-primary-foreground font-semibold hover:shadow-[0_0_24px_rgba(16,185,129,0.35)] dark:hover:shadow-[0_0_24px_rgba(56,189,248,0.35)] border border-primary/20',
    outline:
      'bg-background hover:bg-muted text-foreground border border-border/90 hover:border-foreground/30 font-mono shadow-2xs',
    pill:
      'rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/80 font-mono text-xs'
  }[variant];

  const content = (
    <>
      {/* Animated Shimmer Runner for variant="shimmer" */}
      {variant === 'shimmer' && (
        <span
          className='pointer-events-none absolute -inset-full w-[200%] h-[200%] animate-[spin_4s_linear_infinite] opacity-30 bg-[conic-gradient(from_0deg,transparent_0_340deg,#38bdf8_360deg)]'
          aria-hidden='true'
        />
      )}

      {/* Button Interior */}
      <span className='relative z-10 flex items-center justify-center gap-2 font-medium tracking-tight'>
        {icon && iconPosition === 'left' && <span className='shrink-0'>{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <span className='shrink-0 transition-transform duration-200 group-hover:translate-x-0.5'>
            {icon}
          </span>
        )}
      </span>
    </>
  );

  const buttonClasses = cn(
    'relative inline-flex items-center justify-center cursor-pointer select-none rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    sizeClasses,
    variantClasses,
    className
  );

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        <motion.span
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
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
      whileTap={{ scale: 0.985 }}
      disabled={disabled}
      onClick={onClick}
      className={buttonClasses}
      {...(props as any)}
    >
      {content}
    </motion.button>
  );
}
