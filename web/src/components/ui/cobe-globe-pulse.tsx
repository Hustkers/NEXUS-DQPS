'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import createGlobe from 'cobe';
import { GLOBE_REGIONS, PulseMarker } from '@/data/globe-regions';
import { RegionDetailPanel } from '@/components/ui/region-detail-panel';
import { cn } from '@/lib/utils';

export type { PulseMarker } from '@/data/globe-regions';

export interface GlobePulseProps {
  markers?: PulseMarker[];
  className?: string;
  speed?: number;
  size?: number; // Fixed size in px (default 420px)
  baseColor?: [number, number, number];
  glowColor?: [number, number, number];
  onSelectMarker?: (marker: PulseMarker | null) => void;
  selectedMarkerId?: string | null;
}

export function GlobePulse({
  markers = GLOBE_REGIONS,
  className = '',
  speed = 0.0035,
  size = 420,
  baseColor = [0.18, 0.26, 0.44],
  glowColor = [0.12, 0.22, 0.48],
  onSelectMarker,
  selectedMarkerId,
}: GlobePulseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerButtonsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const [internalActiveMarker, setInternalActiveMarker] = useState<PulseMarker | null>(null);
  const [isPanelLoading, setIsPanelLoading] = useState(false);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);

  // Derive activeMarker from controlled selectedMarkerId or internal selection
  const activeMarker = selectedMarkerId !== undefined
    ? (markers.find((m) => m.id === selectedMarkerId) ?? null)
    : internalActiveMarker;

  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);

  // Pause rotation when a panel is open or marker is hovered
  const isPanelOpen = activeMarker !== null;
  const isInteracting = isPanelOpen || hoveredMarkerId !== null;

  useEffect(() => {
    isPausedRef.current = isInteracting;
  }, [isInteracting]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    isPausedRef.current = isInteracting;
  }, [isInteracting]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerUp]);

  // Marker click action
  const handleMarkerClick = useCallback(
    (m: PulseMarker) => {
      setIsPanelLoading(true);
      setInternalActiveMarker(m);
      if (onSelectMarker) onSelectMarker(m);

      // Brief simulated loading skeleton for smooth polish
      const timer = setTimeout(() => {
        setIsPanelLoading(false);
      }, 180);
      return () => clearTimeout(timer);
    },
    [onSelectMarker]
  );

  const handleClosePanel = useCallback(() => {
    setInternalActiveMarker(null);
    if (onSelectMarker) onSelectMarker(null);
  }, [onSelectMarker]);

  // Initialize and run Cobe globe with exact fixed dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId: number;
    let phi = 0;
    const thetaBase = 0.2;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Cobe setup with fixed dimensions
    globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi: 0,
      theta: thetaBase,
      dark: 1,
      diffuse: 1.5,
      mapSamples: 16000,
      mapBrightness: 8.5,
      baseColor,
      markerColor: [0.95, 0.25, 0.25],
      glowColor,
      markerElevation: 0,
      scale: 1,
      markers: markers.map((m) => {
        let colorVec: [number, number, number] = [0.95, 0.2, 0.2]; // Default red
        if (m.status === 'High sales') {
          colorVec = [0.95, 0.2, 0.2]; // Red
        } else if (m.status === 'Decreasing') {
          colorVec = [0.95, 0.65, 0.1]; // Yellow / Amber
        } else if (m.status === 'Suppressed') {
          colorVec = [0.5, 0.5, 0.55]; // Grey
        }

        return {
          location: m.location,
          size: m.status === 'High sales' ? 0.038 : m.status === 'Decreasing' ? 0.03 : 0.024,
          id: m.id,
          color: colorVec,
        };
      }),
      arcs: [],
      arcColor: [0.95, 0.35, 0.2],
      arcWidth: 0.5,
      arcHeight: 0.25,
      opacity: 0.88,
    });

    // Helper: Project 3D lat/lon to 2D screen coordinates
    const DEG_TO_RAD = Math.PI / 180;
    const projectMarker = (location: [number, number], currentPhi: number, currentTheta: number) => {
      const lat = location[0];
      const lon = location[1];

      const rLat = lat * DEG_TO_RAD;
      const rLon = lon * DEG_TO_RAD - Math.PI;
      const cosLat = Math.cos(rLat);
      const sinLat = Math.sin(rLat);
      const cosLon = Math.cos(rLon);
      const sinLon = Math.sin(rLon);

      // 3D coordinates on unit sphere
      const u0 = -cosLat * cosLon;
      const u1 = sinLat;
      const u2 = cosLat * sinLon;

      const radius = 0.8;
      const t0 = u0 * radius;
      const t1 = u1 * radius;
      const t2 = u2 * radius;

      const cosTheta = Math.cos(currentTheta);
      const sinTheta = Math.sin(currentTheta);
      const cosPhi = Math.cos(currentPhi);
      const sinPhi = Math.sin(currentPhi);

      // Camera space transform
      const c = cosPhi * t0 + sinPhi * t2;
      const s = sinPhi * sinTheta * t0 + cosTheta * t1 - cosPhi * sinTheta * t2;
      const zCam = -sinPhi * cosTheta * t0 + sinTheta * t1 + cosPhi * cosTheta * t2;

      // Screen space normalized (0 to 1)
      const x = (c + 1) / 2;
      const y = (-s + 1) / 2;

      // Marker is on visible front hemisphere when zCam > 0
      const isVisible = zCam > 0.05;

      return { x, y, isVisible };
    };

    function animate() {
      if (!isPausedRef.current) {
        phi += speed;
      }

      const currentPhi = phi + phiOffsetRef.current + dragOffset.current.phi;
      const currentTheta = thetaBase + thetaOffsetRef.current + dragOffset.current.theta;

      if (globe) {
        globe.update({
          phi: currentPhi,
          theta: currentTheta,
        });
      }

      // Update marker interactive overlay positions every frame directly on DOM elements
      markers.forEach((m) => {
        const btn = markerButtonsRef.current[m.id];
        if (btn) {
          const { x, y, isVisible } = projectMarker(m.location, currentPhi, currentTheta);
          if (isVisible) {
            btn.style.left = `${(x * 100).toFixed(3)}%`;
            btn.style.top = `${(y * 100).toFixed(3)}%`;
            btn.style.display = 'flex';
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
            btn.tabIndex = 0;
          } else {
            btn.style.display = 'none';
            btn.style.opacity = '0';
            btn.style.pointerEvents = 'none';
            btn.tabIndex = -1;
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();
    setTimeout(() => {
      if (canvas) canvas.style.opacity = '1';
    }, 50);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [markers, speed, size, baseColor, glowColor]);

  return (
    <div className='relative flex flex-col items-center justify-center select-none'>
      <style>{`
        @keyframes pulse-expand {
          0% { transform: scale(0.35); opacity: 0.9; }
          100% { transform: scale(1.65); opacity: 0; }
        }
      `}</style>

      {/* Fixed-Size Globe Container (Task 2: Fixed 420px, no percent-based stretching) */}
      <div
        ref={containerRef}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          aspectRatio: '1 / 1',
        }}
        className={cn('relative overflow-visible shrink-0', className)}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            cursor: 'grab',
            opacity: 0,
            transition: 'opacity 1s ease',
            borderRadius: '50%',
            touchAction: 'none',
          }}
        />

        {/* Interactive Projected Marker Overlays (Task 1: Focusable, accessible HTML buttons) */}
        {markers.map((m) => {
          const isSelected = activeMarker?.id === m.id;
          const isHovered = hoveredMarkerId === m.id;
          const markerColor = m.color || '#ef4444';

          return (
            <button
              key={m.id}
              ref={(el) => {
                markerButtonsRef.current[m.id] = el;
              }}
              type='button'
              onClick={() => handleMarkerClick(m)}
              onMouseEnter={() => setHoveredMarkerId(m.id)}
              onMouseLeave={() => setHoveredMarkerId(null)}
              onFocus={() => setHoveredMarkerId(m.id)}
              onBlur={() => setHoveredMarkerId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleMarkerClick(m);
                }
              }}
              aria-label={`${m.name}, ${m.status}, open details`}
              title={`${m.name} (${m.status}) — Click to view details`}
              style={{
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                width: 38,
                height: 38,
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                zIndex: isSelected ? 30 : 20,
              }}
              className='group transition-transform focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-full'
            >
              {/* Animated concentric pulsing waves */}
              <span
                style={{
                  position: 'absolute',
                  inset: 2,
                  border: `2px solid ${markerColor}`,
                  borderRadius: '50%',
                  opacity: 0,
                  animation: `pulse-expand 2.2s cubic-bezier(0.2, 0.8, 0.4, 1) infinite ${m.delay}s`,
                  boxShadow: `0 0 10px ${markerColor}66`,
                  pointerEvents: 'none',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  inset: 2,
                  border: `1.5px solid ${markerColor}`,
                  borderRadius: '50%',
                  opacity: 0,
                  animation: `pulse-expand 2.2s cubic-bezier(0.2, 0.8, 0.4, 1) infinite ${m.delay + 0.6}s`,
                  pointerEvents: 'none',
                }}
              />

              {/* Marker Core Dot with Subtle Hover / Selection Highlight */}
              <span
                style={{
                  width: isSelected ? 12 : isHovered ? 11 : 9,
                  height: isSelected ? 12 : isHovered ? 11 : 9,
                  background: markerColor,
                  borderRadius: '50%',
                  boxShadow: isSelected
                    ? `0 0 0 3px #07090e, 0 0 0 6px ${markerColor}, 0 0 16px ${markerColor}`
                    : isHovered
                    ? `0 0 0 2px #07090e, 0 0 0 4px ${markerColor}, 0 0 12px ${markerColor}`
                    : `0 0 0 2px #07090e, 0 0 0 3px ${markerColor}bb, 0 0 8px ${markerColor}88`,
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: 'none',
                }}
              />

              {/* Floating Region Tooltip Pill on Hover */}
              <span
                className={cn(
                  'absolute bottom-full mb-1 px-2 py-0.5 rounded bg-zinc-950/95 text-zinc-100 border border-zinc-800 text-[10px] font-mono whitespace-nowrap shadow-xl pointer-events-none transition-all duration-200 z-40',
                  isHovered || isSelected ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none'
                )}
              >
                <strong className='text-zinc-100'>{m.name}</strong> •{' '}
                <span
                  style={{
                    color:
                      m.status === 'High sales'
                        ? '#ef4444'
                        : m.status === 'Decreasing'
                        ? '#f59e0b'
                        : '#9ca3af',
                  }}
                >
                  {m.status}
                </span>
              </span>
            </button>
          );
        })}

        {/* Floating Detail Panel (Pop-over / side card in same dark theme) */}
        {isPanelOpen && (
          <div className='absolute top-0 right-0 z-50 translate-x-2 md:translate-x-4 max-w-[340px] sm:max-w-[380px] w-full'>
            <RegionDetailPanel
              marker={activeMarker}
              isOpen={isPanelOpen}
              onClose={handleClosePanel}
              isLoading={isPanelLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
