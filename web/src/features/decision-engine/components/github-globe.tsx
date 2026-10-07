'use client';

import React, { useEffect, useRef, useState } from 'react';
import createGlobe, { type Marker, type Arc } from 'cobe';
import { cn } from '@/lib/utils';

export interface GithubGlobeProps {
  className?: string;
  activeSku?: string;
  activePlatform?: string;
  accentColor?: [number, number, number];
}

const DEFAULT_MARKERS: Marker[] = [
  { location: [37.7749, -122.4194], size: 0.09, color: [1.0, 1.0, 1.0] }, // SF (Meta HQ / US-West)
  { location: [40.7128, -74.006], size: 0.08, color: [1.0, 1.0, 1.0] }, // NY (Google Ads / US-East)
  { location: [51.5074, -0.1278], size: 0.07, color: [0.54, 0.54, 0.54] }, // London (EMEA Hub)
  { location: [35.6762, 139.6503], size: 0.08, color: [0.54, 0.54, 0.54] }, // Tokyo (APAC Hub)
  { location: [1.3521, 103.8198], size: 0.07, color: [0.54, 0.54, 0.54] }, // Singapore (TikTok SEA)
  { location: [19.076, 72.8777], size: 0.07, color: [0.54, 0.54, 0.54] }, // Mumbai (India Direct)
  { location: [50.1109, 8.6821], size: 0.06, color: [0.54, 0.54, 0.54] }, // Frankfurt (EU Central)
  { location: [-33.8688, 151.2093], size: 0.06, color: [0.54, 0.54, 0.54] } // Sydney (Oceania)
];

const DEFAULT_ARCS: Arc[] = [
  { from: [37.7749, -122.4194], to: [40.7128, -74.006] }, // SF -> NY
  { from: [40.7128, -74.006], to: [51.5074, -0.1278] }, // NY -> London
  { from: [51.5074, -0.1278], to: [50.1109, 8.6821] }, // London -> Frankfurt
  { from: [50.1109, 8.6821], to: [19.076, 72.8777] }, // Frankfurt -> Mumbai
  { from: [19.076, 72.8777], to: [1.3521, 103.8198] }, // Mumbai -> Singapore
  { from: [1.3521, 103.8198], to: [35.6762, 139.6503] }, // Singapore -> Tokyo
  { from: [35.6762, 139.6503], to: [37.7749, -122.4194] }, // Tokyo -> SF (Trans-Pacific)
  { from: [1.3521, 103.8198], to: [-33.8688, 151.2093] } // Singapore -> Sydney
];

export function GithubGlobe({
  className,
  activeSku,
  activePlatform,
  accentColor = [1.0, 1.0, 1.0]
}: GithubGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let phi = 0;
    let theta = 0.25;
    let width = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;

    width = canvas.offsetWidth;

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: (width || 600) * 2,
      height: (width || 600) * 2,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.1,
      mapSamples: 16000,
      mapBrightness: 4.0,
      baseColor: [0.1, 0.1, 0.1],
      markerColor: [1.0, 1.0, 1.0],
      glowColor: [0.1, 0.1, 0.1],
      markers: DEFAULT_MARKERS,
      arcs: DEFAULT_ARCS,
      arcColor: [1.0, 1.0, 1.0],
      arcWidth: 0.8,
      arcHeight: 0.35,
      scale: 1.05
    });

    let animationFrameId: number;

    const animate = () => {
      // Auto-rotation speed slows down slightly on hover
      const deltaSpeed = isHovered ? 0.0018 : 0.0035;
      phi += deltaSpeed + pointerInteractionMovement.current * 0.005;
      pointerInteractionMovement.current *= 0.92; // decay drag velocity

      globe.update({ phi, theta });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      const newWidth = canvasRef.current.offsetWidth;
      globe.update({
        width: newWidth * 2,
        height: newWidth * 2
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      globe.destroy();
    };
  }, [accentColor, isHovered]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerInteracting.current = e.clientX;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grabbing';
    }
  };

  const handlePointerUp = () => {
    pointerInteracting.current = null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grab';
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerInteracting.current !== null) {
      const delta = e.clientX - pointerInteracting.current;
      pointerInteracting.current = e.clientX;
      pointerInteractionMovement.current = delta;
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-[#000000]',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        className='size-full max-w-[620px] aspect-square cursor-grab touch-none opacity-95 transition-opacity duration-300'
      />

      {/* Atmospheric Ring Overlay (Monochrome) */}
      <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
        <div className='size-[82%] rounded-full ring-1 ring-[#8A8A8A]/30 ring-offset-2 ring-offset-transparent' />
      </div>

      {/* Interactive Telemetry HUD tags floating over Globe */}
      <div className='pointer-events-none absolute bottom-3 left-4 flex flex-col gap-1 text-[10px] font-mono'>
        <div className='flex items-center gap-1.5 text-[#FFFFFF] bg-[#000000] px-2.5 py-1 rounded border border-[#8A8A8A]'>
          <span className='size-1.5 rounded-full bg-[#FFFFFF]' />
          <span className='font-bold'>GLOBAL TELEMETRY STREAM</span>
        </div>
        <div className='text-[#8A8A8A] text-[9px] px-1'>
          Lat: 37.77° N • Lon: -122.42° W • 8 Edge Hubs Active
        </div>
      </div>

      <div className='pointer-events-none absolute top-3 right-4 flex items-center gap-2 text-[10px] font-mono text-[#FFFFFF] bg-[#000000] px-2.5 py-1 rounded border border-[#8A8A8A]'>
        <span className='size-1.5 rounded-full bg-[#FFFFFF]' />
        <span>github.com/globe WebGL</span>
      </div>
    </div>
  );
}
