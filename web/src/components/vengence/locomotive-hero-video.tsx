'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LocomotiveHeroVideoProps {
  className?: string;
  videoSrc?: string;
  fallbackVideoSrc?: string;
  posterSrc?: string;
}

export function LocomotiveHeroVideo({
  className,
  videoSrc = '/videos/basicagency-reel.mp4',
  fallbackVideoSrc = 'https://cdn.sanity.io/files/8nn8fua5/production/4c749533161fc77c899a376ec6cd6da38973772f.mp4',
  posterSrc = '/videos/basicagency-reel-poster.jpg',
}: LocomotiveHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const seekerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Video playback & audio states
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(59.03);
  const [hasInteracted, setHasInteracted] = useState(false);

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

  // Initial autoplay handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Hero video autoplay delayed:', err);
          setIsPlaying(false);
        });
    }
  }, []);

  // Time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current && !isDraggingRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  // Toggle audio mute/unmute
  const toggleSound = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    if (!nextMuted) {
      video.volume = 1.0;
      if (video.paused) {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
    setIsMuted(nextMuted);
    setHasInteracted(true);
  }, [isMuted]);

  // Toggle play/pause
  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
    setHasInteracted(true);
  }, []);

  // Replay from beginning
  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
    video.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  // Toggle fullscreen
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Interactive timeline scrubbing & dragging
  const updateSeekFromEvent = useCallback((clientX: number) => {
    const video = videoRef.current;
    const seeker = seekerRef.current;
    if (!video || !seeker || !duration) return;
    const rect = seeker.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetTime = ratio * duration;
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
  }, [duration]);

  const handleSeekMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    updateSeekFromEvent(e.clientX);
  };

  const handleSeekTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    if (e.touches[0]) updateSeekFromEvent(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        updateSeekFromEvent(e.clientX);
      }
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches[0]) {
        updateSeekFromEvent(e.touches[0].clientX);
      }
    };
    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [updateSeekFromEvent]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section
      ref={containerRef}
      id="hero-video"
      onClick={() => {
        // First click anywhere on the video hero un-mutes audio if it's currently muted
        if (isMuted) {
          toggleSound();
        }
      }}
      className={cn(
        'relative w-full h-[100dvh] min-h-[680px] overflow-hidden flex flex-col justify-between select-none bg-black text-white scroll-mt-0 cursor-pointer group/hero',
        className
      )}
    >
      <style jsx global>{`
        @keyframes soundWaveAnim {
          0%, 100% { height: 25%; }
          50% { height: 100%; }
        }
      `}</style>

      {/* 1. CINEMATIC FULLSCREEN 1-MINUTE BACKGROUND VIDEO WITH AUDIO */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          poster={posterSrc}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
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

        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/60 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.45)_65%,rgba(0,0,0,0.9)_100%)] pointer-events-none z-10" />
      </div>

      {/* 2. TOP TECHNICAL SPEC HUD (BASIC/DEPT® AESTHETIC) */}
      <div className="relative z-20 pt-20 sm:pt-24 px-6 sm:px-12 lg:px-16 flex items-center justify-between text-white/60 font-mono text-[11px] sm:text-xs tracking-wider uppercase pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="inline-block size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white/80">REEL // 2026</span>
          <span className="hidden sm:inline text-white/40">·</span>
          <span className="hidden sm:inline text-white/50">NEXUS AUTONOMOUS INTELLIGENCE</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 text-white/50">
          <span>TRT: 59S</span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline">60 FPS</span>
          <span>·</span>
          <span className={cn(isMuted ? 'text-white/40' : 'text-emerald-400 font-semibold')}>
            {isMuted ? 'AUDIO: MUTED' : '48KHZ STEREO'}
          </span>
        </div>
      </div>

      {/* 3. CENTER / FLOATING PROMPT IF AUDIO IS MUTED */}
      {isMuted && !hasInteracted && (
        <div className="relative z-20 self-center pointer-events-auto transition-all animate-bounce">
          <button
            onClick={toggleSound}
            className="group inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/25 hover:border-white/50 text-white shadow-2xl transition-all active:scale-95 cursor-pointer"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <Volume2 className="size-4 text-emerald-400" />
            <span className="font-mono text-xs uppercase tracking-widest font-medium">
              Click Anywhere to Listen with Audio
            </span>
          </button>
        </div>
      )}

      {/* 4. BOTTOM BAR: BRAND IDENTITY (LEFT) & PLAYER CONTROLS (RIGHT) */}
      <div className="relative z-20 pb-16 sm:pb-20 lg:pb-22 px-6 sm:px-12 lg:px-16 flex flex-col md:flex-row md:items-end justify-between gap-6 pointer-events-auto">
        {/* Left: Giant NEXUS® Title & Digital-First Lead */}
        <div
          className="flex flex-col items-start transition-transform duration-500 will-change-transform max-w-3xl"
          style={{
            transform: `translate3d(${mousePos.x * -0.4}px, ${mousePos.y * -0.4}px, 0)`,
          }}
        >
          {/* Giant NEXUS® */}
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

          {/* Mission Description */}
          <p className="mt-3 text-xs sm:text-sm font-mono text-white/70 max-w-xl leading-relaxed">
            Autonomous multi-channel ad capital allocation &amp; causal DAG anomaly diagnostics.
            Eliminating budget bleed across Meta, Google, TikTok, and Amazon in &lt;15 minutes.
          </p>
        </div>

        {/* Right: Audio Visualizer & Video Actions Bar */}
        <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
          {/* Sound Mode Equalizer Button */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className={cn(
              'group inline-flex items-center gap-2.5 px-4 py-2 rounded-full backdrop-blur-md border transition-all shadow-xl active:scale-95 cursor-pointer',
              isMuted
                ? 'bg-black/60 hover:bg-black/80 border-white/20 hover:border-white/40 text-white/90'
                : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/50 hover:border-emerald-400 text-emerald-300'
            )}
          >
            {isMuted ? (
              <>
                <VolumeX className="size-4 text-white/70 group-hover:text-white" />
                <span className="font-mono text-xs tracking-wider uppercase">
                  Sound: Off <span className="text-white/40 font-light">(Click to Unmute)</span>
                </span>
              </>
            ) : (
              <>
                {/* 4 Animated Audio Equalizer Bars */}
                <div className="flex items-end gap-[2px] h-3.5 w-3.5">
                  <span
                    className="w-[2.5px] bg-emerald-400 rounded-full"
                    style={{ animation: 'soundWaveAnim 0.7s ease-in-out infinite' }}
                  />
                  <span
                    className="w-[2.5px] bg-emerald-400 rounded-full"
                    style={{ animation: 'soundWaveAnim 0.5s ease-in-out infinite 0.15s' }}
                  />
                  <span
                    className="w-[2.5px] bg-emerald-400 rounded-full"
                    style={{ animation: 'soundWaveAnim 0.9s ease-in-out infinite 0.3s' }}
                  />
                  <span
                    className="w-[2.5px] bg-emerald-400 rounded-full"
                    style={{ animation: 'soundWaveAnim 0.6s ease-in-out infinite 0.1s' }}
                  />
                </div>
                <Volume2 className="size-4 text-emerald-300" />
                <span className="font-mono text-xs tracking-wider uppercase font-semibold">
                  Sound: On <span className="text-emerald-400/70 font-normal">· Stereo</span>
                </span>
              </>
            )}
          </button>

          {/* Video Actions Bar: Play/Pause, Restart, Fullscreen */}
          <div className="flex items-center gap-3 bg-black/65 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-white font-mono text-xs shadow-lg">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="p-1 hover:text-emerald-400 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>

            <button
              onClick={handleRestart}
              aria-label="Restart Video"
              className="p-1 hover:text-emerald-400 transition-colors cursor-pointer"
              title="Restart"
            >
              <RotateCcw className="size-3.5" />
            </button>

            <button
              onClick={toggleFullscreen}
              aria-label="Toggle Fullscreen"
              className="p-1 hover:text-emerald-400 transition-colors cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. BASIC/DEPT® SIGNATURE TRAVELING TIME SLIDER */}
      <div
        ref={seekerRef}
        onMouseDown={handleSeekMouseDown}
        onTouchStart={handleSeekTouchStart}
        className="absolute bottom-0 left-0 right-0 h-12 sm:h-14 z-30 select-none cursor-grab active:cursor-grabbing pointer-events-auto flex flex-col justify-end group/seeker"
      >
        {/* Dynamic Traveling Time Indicator (matches 00:20/00:59 aesthetic) */}
        <div
          className="absolute bottom-3 sm:bottom-4 pointer-events-none transition-transform duration-75 will-change-transform mix-blend-difference"
          style={{
            left: `clamp(2.75rem, ${progressPercent}%, calc(100% - 2.75rem))`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center text-xs sm:text-[13px] font-mono tracking-tight select-none leading-none drop-shadow-md">
            <span className="font-semibold text-white">{formatTime(currentTime)}</span>
            <span className="text-white/60">/</span>
            <span className="text-white/60">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Subtle Hairline Progress Bar along the bottom */}
        <div className="relative w-full h-[2px] group-hover/seeker:h-[3px] bg-white/15 group-hover/seeker:bg-white/25 transition-all">
          <div
            className="h-full bg-white transition-[width] duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.7)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 6. SCROLL TO EXPLORE CUE */}
      <a
        href="#features"
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="hidden md:flex absolute bottom-12 left-1/2 -translate-x-1/2 z-20 items-center gap-2 text-white/40 hover:text-white transition-colors font-mono text-[11px] tracking-widest uppercase pointer-events-auto"
      >
        <span>Scroll to Explore</span>
        <span className="animate-bounce inline-block text-xs">↓</span>
      </a>
    </section>
  );
}

export { LocomotiveHeroVideo as FullscreenVideoHero };
export default LocomotiveHeroVideo;
