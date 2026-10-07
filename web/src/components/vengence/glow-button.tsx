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
      'bg-[#FFFFFF] text-[#000000] font-semibold hover:bg-[#8A8A8A] hover:text-[#000000] border-0 shadow-none',
    shimmer:
      'relative bg-[#1A1A1A] text-[#FFFFFF] font-medium overflow-hidden border border-[#8A8A8A] hover:border-[#FFFFFF] shadow-none group',
    glow:
      'bg-[#FFFFFF] text-[#000000] font-semibold hover:bg-[#8A8A8A] hover:text-[#000000] border-0 shadow-none',
    outline:
      'bg-[#1A1A1A] text-[#FFFFFF] border border-[#8A8A8A] hover:bg-[#000000] hover:border-[#FFFFFF] font-mono shadow-none',
    pill:
      'rounded-[6px] bg-[#1A1A1A] text-[#FFFFFF] border border-[#8A8A8A] hover:bg-[#000000] hover:border-[#FFFFFF] font-mono text-xs shadow-none'
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
    'relative inline-flex items-center justify-center cursor-pointer select-none rounded-[6px] transition-all duration-150 outline-none focus-visible:ring-1 focus-visible:ring-[#FFFFFF] disabled:pointer-events-none disabled:bg-[#1A1A1A] disabled:text-[#8A8A8A] disabled:border-[#1A1A1A] disabled:cursor-not-allowed',
    sizeClasses,
    variantClasses,
    className
  );

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        <motion.span
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className='flex items-center gap-2 size-full justify-center'
        >
          {content}
        </motion.span>
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      onClick={onClick}
      className={buttonClasses}
      {...(props as any)}
    >
      {content}
    </motion.button>
  );
}
