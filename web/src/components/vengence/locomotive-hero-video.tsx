'use client';

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface LocomotiveHeroVideoProps {
  className?: string;
  videoSrc?: string;
  fallbackVideoSrc?: string;
  posterSrc?: string;
}

export function LocomotiveHeroVideo({
  className,
  videoSrc = '/videos/locomotive-reel.mp4',
  fallbackVideoSrc = 'https://cdn.sanity.io/files/8nn8fua5/production/4c749533161fc77c899a376ec6cd6da38973772f.mp4',
  posterSrc = '/videos/locomotive-reel-poster.jpg',
}: LocomotiveHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Subtle mouse parallax coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 14;
      const y = (e.clientY / innerHeight - 0.5) * 14;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initial autoplay resilience
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Hero video autoplay delayed:', err);
        });
      }
    }
  }, []);

  return (
    <section
      ref={containerRef}
      id="hero-video"
      className={cn(
        'relative w-full h-[100dvh] min-h-[640px] overflow-hidden flex flex-col justify-end select-none bg-black text-white scroll-mt-0',
        className
      )}
    >
      {/* 1. CINEMATIC FULLSCREEN BACKGROUND VIDEO */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          poster={posterSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform scale-105"
          style={{
            transform: `scale(1.05) translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0)`,
          }}
        >
          <source src={videoSrc} type="video/mp4" />
          {fallbackVideoSrc && <source src={fallbackVideoSrc} type="video/mp4" />}
          <track kind="captions" srcLang="en" label="English" />
        </video>

        {/* BASIC/DEPT® & LOCOMOTIVE SIGNATURE FILM GRAIN NOISE OVERLAY */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/60 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.5)_65%,rgba(0,0,0,0.9)_100%)] pointer-events-none z-10" />
      </div>

      {/* 2. BOTTOM LEFT: LOCOMOTIVE-STYLE BRAND IDENTITY */}
      <div className="relative z-20 pb-10 sm:pb-14 lg:pb-18 px-6 sm:px-12 lg:px-16 pointer-events-auto">
        <div
          className="flex flex-col items-start transition-transform duration-500 will-change-transform max-w-4xl"
          style={{
            transform: `translate3d(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px, 0)`,
          }}
        >
          {/* Giant NEXUS® Title Written at Bottom Left */}
          <h1 className="font-orbitron font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white leading-none drop-shadow-2xl flex items-start">
            <span>NEXUS</span>
            <sup className="text-xl sm:text-2xl md:text-3xl ml-1 font-sans font-light text-white/80">
              ®
            </sup>
          </h1>

          {/* Subtitle: Digital-first Ad Decision Agency */}
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-serif text-white/95 font-light tracking-wide leading-tight drop-shadow-md">
            <span className="italic">Digital-first</span>
            <span className="not-italic font-sans font-normal">Ad Decision Agency</span>
          </div>

          {/* Mission Micro-Lead */}
          <p className="mt-3 text-xs sm:text-sm font-mono text-white/70 max-w-xl leading-relaxed">
            Autonomous multi-channel ad capital allocation &amp; causal DAG anomaly diagnostics.
            Eliminating budget bleed across Meta, Google, TikTok, and Amazon in &lt;15 minutes.
          </p>
        </div>
      </div>
    </section>
  );
}

export { LocomotiveHeroVideo as FullscreenVideoHero };
export default LocomotiveHeroVideo;
