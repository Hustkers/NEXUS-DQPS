'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface CarouselImage {
  src: string;
  alt?: string;
  title?: string;
  brand?: string;
  channel?: string;
  roas?: string;
  metric?: string;
}

export interface CylinderCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  images: CarouselImage[];
  containerClassName?: string;
  cardClassName?: string;
  animationDuration?: number; // in seconds
  cardWidth?: number; // in pixels
  cardHeight?: number; // in pixels (optional)
  perspective?: string; // e.g. "35em" or "1000px"
  pauseOnHover?: boolean;
}

export const CylinderCarousel = React.forwardRef<HTMLDivElement, CylinderCarouselProps>(
  (
    {
      images,
      className,
      containerClassName,
      cardClassName,
      animationDuration = 36,
      cardWidth = 240,
      perspective = '36em',
      pauseOnHover = true,
      ...props
    },
    ref
  ) => {
    const N = images.length;

    // Pre-calculate radius using trigonometry to guarantee support across all browser engines
    const { customStyle, computedRadius } = useMemo(() => {
      // theta = 2 * PI / N
      // Negative translateZ pushes cards away from camera into the 3D cylinder
      const halfAngle = Math.PI / N;
      const radius = -1 * ((cardWidth * 0.5 + 8) / Math.tan(halfAngle));

      const style = {
        '--n': N,
        '--w': `${cardWidth}px`,
        '--ba': `calc(1turn / var(--n))`,
        '--anim-dur': `${animationDuration}s`,
        '--radius': `${radius}px`,
      } as React.CSSProperties;

      return { customStyle: style, computedRadius: radius };
    }, [N, cardWidth, animationDuration]);

    return (
      <div
        ref={ref}
        className={cn(
          'w-full h-full min-h-[460px] md:min-h-[520px] grid place-items-center overflow-hidden relative select-none',
          className
        )}
        style={{
          perspective: perspective || '60em',
          maskImage: 'linear-gradient(90deg, transparent 0%, #000 15%, #000 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 15%, #000 85%, transparent 100%)',
        }}
        {...props}
      >
        <div
          className={cn(
            'grid place-items-center [transform-style:preserve-3d] will-change-transform',
            pauseOnHover && 'hover:[animation-play-state:paused]',
            'motion-reduce:!animate-[ry_128s_linear_infinite]',
            containerClassName
          )}
          style={{
            ...customStyle,
            animation: 'ry var(--anim-dur) linear infinite',
          }}
        >
          {/* Inline keyframes for standalone portability without global config */}
          <style>
            {`
              @keyframes ry {
                from { transform: rotateY(0turn); }
                to { transform: rotateY(1turn); }
              }
            `}
          </style>

          {images.map((img, i) => {
            const hasMetadata = Boolean(img.brand || img.title || img.roas || img.channel);

            return (
              <div
                key={i}
                className={cn(
                  '[grid-area:1/1] rounded-2xl [backface-visibility:hidden] overflow-hidden group/card relative transition-all duration-300',
                  'border border-white/10 dark:border-white/10 bg-neutral-900 shadow-2xl shadow-black/40',
                  cardClassName
                )}
                style={
                  {
                    width: 'var(--w)',
                    aspectRatio: '7/10',
                    '--i': i,
                    transform:
                      'rotateY(calc(var(--i) * var(--ba))) translateZ(var(--radius))',
                  } as React.CSSProperties
                }
              >
                {/* Background Image */}
                <img
                  src={img.src}
                  alt={img.alt || img.title || `Campaign creative ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                />

                {/* Subtle vignette gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />

                {/* Top Badges (Channel / ROAS) */}
                <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 pointer-events-none z-10">
                  {img.channel ? (
                    <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 border border-white/15 tracking-tight uppercase">
                      {img.channel}
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white/80 border border-white/15">
                      AD #{i + 1}
                    </span>
                  )}

                  {img.roas && (
                    <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-400 border border-emerald-500/40 tracking-tight">
                      {img.roas}
                    </span>
                  )}
                </div>

                {/* Bottom Metadata (Brand & Metric) */}
                {hasMetadata && (
                  <div className="absolute bottom-2.5 inset-x-2.5 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex flex-col gap-0.5 pointer-events-none z-10">
                    {img.brand && (
                      <span className="font-mono text-[9px] font-semibold tracking-wider uppercase text-blue-400">
                        {img.brand}
                      </span>
                    )}
                    {img.title && (
                      <span className="font-sans text-xs font-bold text-white truncate leading-tight">
                        {img.title}
                      </span>
                    )}
                    {img.metric && (
                      <span className="font-mono text-[9px] text-white/70 truncate pt-0.5 border-t border-white/10 mt-0.5">
                        {img.metric}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CylinderCarousel.displayName = 'CylinderCarousel';
