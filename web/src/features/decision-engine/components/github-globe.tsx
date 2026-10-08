'use client';

import React, { useEffect, useRef, useState } from 'react';
import createGlobe, { type Marker, type Arc } from 'cobe';
import { cn } from '@/lib/utils';

export interface GithubGlobeProps {
  className?: string;
  activeSku?: string;
  activePlatform?: string;
  accentColor?: [number, number, number];
  size?: number; // Fixed size in px (default 420px)
}

// Grounded in DATASET.MD §5.1 Regional Warehouse Distribution Matrix
const DEFAULT_MARKERS: Marker[] = [
  { location: [40.6023, -75.4714], size: 0.045, color: [1.0, 1.0, 1.0] }, // FC-EAST-ALLENTOWN (Allentown, PA)
  { location: [34.0633, -117.6509], size: 0.045, color: [1.0, 1.0, 1.0] }, // FC-WEST-ONTARIO (Ontario, CA)
  { location: [51.0833, 5.0167], size: 0.038, color: [0.85, 0.85, 0.85] }, // FC-EU-LAAKDAL (Laakdal, BE)
  { location: [52.2575, -1.1628], size: 0.038, color: [0.85, 0.85, 0.85] }, // FC-EU-DAVENTRY (Daventry, UK)
  { location: [35.772, 140.3929], size: 0.038, color: [0.85, 0.85, 0.85] }, // FC-APAC-NARITA (Chiba, JP)
  { location: [1.3644, 103.9915], size: 0.035, color: [0.75, 0.75, 0.75] }, // FC-SEA-CHANGI (Singapore)
  { location: [-23.5505, -46.6333], size: 0.035, color: [0.75, 0.75, 0.75] }, // FC-LATAM-SAOPAULO (São Paulo, BR)
  { location: [39.0438, -77.4874], size: 0.032, color: [0.65, 0.65, 0.65] }, // Ad Exchange Edge (Ashburn PoP)
];

// Delivery routes from Ad Exchange PoPs to Regional Catchments & Cross-Country Zone 8 Routes
const DEFAULT_ARCS: Arc[] = [
  { from: [39.0438, -77.4874], to: [40.6023, -75.4714] }, // Ashburn -> FC-EAST-ALLENTOWN
  { from: [39.0438, -77.4874], to: [34.0633, -117.6509] }, // Ashburn -> FC-WEST-ONTARIO
  { from: [34.0633, -117.6509], to: [40.6023, -75.4714] }, // Zone 8 Cross-Country Route (Freight Penalty -$13.70)
  { from: [40.6023, -75.4714], to: [52.2575, -1.1628] }, // Transatlantic -> FC-EU-DAVENTRY
  { from: [52.2575, -1.1628], to: [51.0833, 5.0167] }, // UK -> FC-EU-LAAKDAL
  { from: [34.0633, -117.6509], to: [35.772, 140.3929] }, // Transpacific -> FC-APAC-NARITA
  { from: [35.772, 140.3929], to: [1.3644, 103.9915] }, // Japan -> FC-SEA-CHANGI
  { from: [40.6023, -75.4714], to: [-23.5505, -46.6333] }, // Pan-American -> FC-LATAM-SAOPAULO
];

export function GithubGlobe({
  className,
  activeSku: _activeSku,
  activePlatform: _activePlatform,
  accentColor = [1.0, 1.0, 1.0],
  size = 420,
}: GithubGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let phi = 0;
    const theta = 0.25;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
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
      arcColor: accentColor,
      arcWidth: 0.45,
      arcHeight: 0.35,
      scale: 1.02,
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

    return () => {
      cancelAnimationFrame(animationFrameId);
      globe.destroy();
    };
  }, [accentColor, isHovered, size]);

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
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        aspectRatio: '1 / 1',
      }}
      className={cn(
        'relative flex items-center justify-center select-none bg-transparent shrink-0',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Canvas with fixed CSS dimensions */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          cursor: 'grab',
          touchAction: 'none',
        }}
        className='opacity-95 transition-opacity duration-300'
      />

      {/* Atmospheric Ring Overlay (Monochrome) */}
      <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
        <div className='size-[82%] rounded-full ring-1 ring-zinc-500/20 ring-offset-2 ring-offset-transparent' />
      </div>

      {/* Interactive Telemetry HUD tags floating over Globe */}
      <div className='pointer-events-none absolute bottom-3 left-4 flex flex-col gap-1 text-[10px] font-mono'>
        <div className='flex items-center gap-1.5 text-zinc-100 bg-zinc-950/80 backdrop-blur-sm px-2.5 py-1 rounded border border-zinc-800 shadow-sm'>
          <span className='size-1.5 rounded-full bg-zinc-100' />
          <span className='font-bold'>GLOBAL TELEMETRY STREAM</span>
        </div>
        <div className='text-zinc-500 text-[9px] px-1'>
          Lat: 37.77° N • Lon: -122.42° W • 8 Edge Hubs Active
        </div>
      </div>

      <div className='pointer-events-none absolute top-3 right-4 flex items-center gap-2 text-[10px] font-mono text-zinc-300 bg-zinc-950/80 backdrop-blur-sm px-2.5 py-1 rounded border border-zinc-800 shadow-sm'>
        <span className='size-1.5 rounded-full bg-zinc-300' />
        <span>NEXUS 3D WebGL</span>
      </div>
    </div>
  );
}
