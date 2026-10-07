'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LocomotiveHeroVideoProps {
  className?: string;
  videoSrc?: string;
  fallbackVideoSrc?: string;
  posterSrc?: string;
  onExploreClick?: () => void;
}

export function LocomotiveHeroVideo({
  className,
  videoSrc = '/videos/locomotive-reel.mp4',
  fallbackVideoSrc = 'https://cdn.sanity.io/files/8nn8fua5/production/4c749533161fc77c899a376ec6cd6da38973772f.mp4',
  posterSrc = '/videos/locomotive-reel-poster.jpg',
  onExploreClick,
}: LocomotiveHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

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
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('Hero video autoplay delayed:', err);
            setIsPlaying(false);
          });
      }
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted && videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleScrollDown = () => {
    if (onExploreClick) {
      onExploreClick();
      return;
    }
    const overviewEl = document.getElementById('overview');
    if (overviewEl) {
      overviewEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={containerRef}
      id="hero-video"
      className={cn(
        'relative w-full h-[100dvh] min-h-[640px] overflow-hidden flex flex-col justify-between select-none bg-black text-white',
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
          muted={isMuted}
          playsInline
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform scale-105"
          style={{
            transform: `scale(1.05) translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0)`,
          }}
        >
          <source src={videoSrc} type="video/mp4" />
          {fallbackVideoSrc && <source src={fallbackVideoSrc} type="video/mp4" />}
          <track kind="captions" srcLang="en" label="English" />
        </video>

        {/* BASIC/DEPT® SIGNATURE FILM GRAIN NOISE OVERLAY */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Cinematic Vignette Overlays matching BASIC/DEPT® & Locomotive */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/60 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.5)_65%,rgba(0,0,0,0.9)_100%)] pointer-events-none z-10" />
      </div>

      {/* 2. TOP METADATA HUD (Sits comfortably under fixed notch navbar) */}
      <div className="relative z-20 pt-20 sm:pt-24 px-5 sm:px-10 lg:px-14 flex items-center justify-between text-xs font-mono text-white/80 pointer-events-auto">
        {/* Left Telemetry Stamp */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="hidden sm:inline tracking-widest text-[11px] uppercase text-white/70">
            AUTONOMOUS AD AGENCY // 2026 REEL
          </span>
          <span className="sm:hidden tracking-wider text-[10px] uppercase text-white/70">
            NEXUS LIVE REEL
          </span>
        </div>

        {/* Right Media Control Pills */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Visualizer Pill */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-black/40 hover:bg-black/70 backdrop-blur-md transition-all text-[11px] font-mono tracking-wider text-white/90 hover:text-white cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="size-3.5 text-white/60 group-hover:text-white" />
            ) : (
              <Volume2 className="size-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            )}
            <span className="hidden sm:inline">{isMuted ? 'SOUND OFF' : 'SOUND ON'}</span>
            {!isMuted && (
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-emerald-400 animate-pulse" />
                <span className="w-0.5 h-3 bg-emerald-400 animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-emerald-400 animate-pulse delay-150" />
              </span>
            )}
          </button>

          {/* Play/Pause Pill */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause video reel' : 'Play video reel'}
            className="size-8 rounded-full border border-white/20 bg-black/40 hover:bg-black/70 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer text-white/80 hover:text-white"
          >
            {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* 3. BOTTOM STAGE (SIGNATURE AGENCY CORNER IDENTITY & SCROLL TRIGGER) */}
      <div className="relative z-20 pb-8 sm:pb-12 lg:pb-16 px-5 sm:px-10 lg:px-14 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pointer-events-auto">
        {/* BOTTOM LEFT: BRAND MARK WITH BOXED BADGE */}
        <div
          className="flex flex-col items-start transition-transform duration-500 will-change-transform"
          style={{
            transform: `translate3d(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px, 0)`,
          }}
        >
          {/* Main Title Row: Box Badge + NEXUS® */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5 flex-wrap">
            {/* Dual-Cell Box Badge: [ AUTO | DEC / OPT ] */}
            <div className="border border-white/60 bg-black/40 backdrop-blur-md flex text-[10px] sm:text-[11px] font-mono tracking-widest leading-none select-none shadow-lg">
              <div className="px-2 sm:px-2.5 py-1.5 flex items-center justify-center font-black border-r border-white/60 text-white">
                AUTO
              </div>
              <div className="flex flex-col text-[8px] sm:text-[9px] font-bold text-white/90">
                <span className="px-1.5 py-0.5 border-b border-white/60 flex items-center justify-center">
                  DEC
                </span>
                <span className="px-1.5 py-0.5 flex items-center justify-center text-white/70">
                  OPT
                </span>
              </div>
            </div>

            {/* Giant NEXUS® Title Written at Bottom Left */}
            <h1 className="font-orbitron font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white leading-none drop-shadow-2xl flex items-start">
              <span>NEXUS</span>
              <sup className="text-xl sm:text-2xl md:text-3xl ml-1 font-sans font-light text-white/80">
                ®
              </sup>
            </h1>
          </div>

          {/* Subtitle Row with Typographic Contrast: Digital-first Ad Decision Agency ✶ DQPS 3.0 */}
          <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-serif text-white/95 font-light tracking-wide leading-tight drop-shadow-md">
            <span className="italic">Digital-first</span>
            <span className="not-italic font-sans font-normal">Ad Decision Agency</span>
            <span className="text-amber-400 font-sans text-xl sm:text-2xl md:text-3xl">✶</span>
            <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-white/40 text-white/90 bg-black/30 backdrop-blur-xs">
              DQPS 3.0
            </span>
          </div>

          {/* Mission Micro-Lead */}
          <p className="mt-3 text-xs sm:text-sm font-mono text-white/70 max-w-xl leading-relaxed">
            Autonomous multi-channel ad capital allocation &amp; causal DAG anomaly diagnostics.
            Eliminating budget bleed across Meta, Google, TikTok, and Amazon in &lt;15 minutes.
          </p>
        </div>

        {/* BOTTOM RIGHT: SMOOTH SCROLL EXPLORER TRIGGER */}
        <div className="flex flex-col items-start md:items-end gap-3 self-stretch md:self-auto">
          {/* Interactive Floating Pill to smooth-scroll down */}
          <button
            type="button"
            onClick={handleScrollDown}
            className="group inline-flex items-center gap-3 px-5 py-3 rounded-full border border-white/30 bg-black/60 hover:bg-black/90 backdrop-blur-md text-white font-mono text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 hover:border-white/70 hover:scale-[1.03] active:scale-[0.98] shadow-2xl cursor-pointer"
          >
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">SCROLL TO EXPLORE</span>
            <ArrowDown className="size-4 text-emerald-400 group-hover:translate-y-1 transition-transform" />
          </button>

          {/* Micro Year / Agency Registry Stamp */}
          <div className="font-mono text-[10px] text-white/50 tracking-widest uppercase flex items-center gap-2">
            <span>©2024–2026 NEXUS</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">100% AUTONOMOUS</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export { LocomotiveHeroVideo as FullscreenVideoHero };
export default LocomotiveHeroVideo;
