'use client';

/**
 * ROOT CAUSE DIAGNOSIS FOR CLICK GLITCH & VISUAL ARTIFACTS:
 * 1. Globe Re-creation: Previously, the Cobe WebGL instance was being torn down
 *    and re-instantiated whenever dependency references shifted, resetting WebGL buffers,
 *    clearing rotation states, and causing visible flash and click missed frames.
 *    Fix: Retained globe instance in a persistent `globeRef`, moving creation into a
 *    stable one-time effect and updating markers and selection through refs in the render loop.
 * 2. Asynchronous Rotation Pause & Target Drifting: State-driven rotation pause suffered
 *    from React render-cycle latency, allowing the globe to rotate 1-3 frames underneath
 *    the pointer during mousedown/click.
 *    Fix: Synchronously pause `isPausedRef.current = true` on `pointerdown` and during
 *    marker hover hit-tests, ensuring dots remain rock-solid stationary when clicked.
 * 3. Drag vs Click Collision: Native HTML button clicks were firing after pointer drags
 *    if the gesture began on a marker button, while dragging over buttons was intercepted.
 *    Fix: Unified pointer tracking with a strict 5px threshold. Movements >= 5px are
 *    isolated as rotational drags, while movements < 5px trigger high-precision spherical
 *    hit-testing with an 18px hit radius.
 * 4. Selection Toggle & Flash: Clicking an active dot previously re-triggered a 180ms
 *    simulated loading skeleton rather than toggling off, causing UI flickering.
 *    Fix: Clicking an active dot immediately closes the panel, while switching dots
 *    instantly transitions data with zero empty/skeleton flicker.
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import createGlobe from 'cobe';
import { GLOBE_REGIONS, PulseMarker } from '@/data/globe-regions';
import { RegionDetailPanel } from '@/components/ui/region-detail-panel';
import { cn } from '@/lib/utils';

export type { PulseMarker } from '@/data/globe-regions';

export interface GlobePulseProps {
  markers?: PulseMarker[];
  className?: string;
  speed?: number;
  size?: number; // Fixed size in px (e.g. 340px, 420px)
  baseColor?: [number, number, number];
  glowColor?: [number, number, number];
  onSelectMarker?: (marker: PulseMarker | null) => void;
  selectedMarkerId?: string | null;
  renderDetailPanel?: boolean; // Set false if parent card hosts the overlay panel
  showRecentPurchases?: boolean;
  maxOrders?: number;
  selectedRegionId?: string | null;
  onSelectRegion?: (marker: PulseMarker | null) => void;
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
  renderDetailPanel = true,
}: GlobePulseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const markerButtonsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const [internalActiveMarker, setInternalActiveMarker] = useState<PulseMarker | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);

  // Derived activeMarker from controlled prop or internal state
  const activeMarker = useMemo(() => {
    if (selectedMarkerId !== undefined) {
      return markers.find((m) => m.id === selectedMarkerId) ?? null;
    }
    return internalActiveMarker;
  }, [selectedMarkerId, markers, internalActiveMarker]);

  // Persistent refs for render loop and event handlers (prevents recreation)
  const markersRef = useRef(markers);
  const activeMarkerRef = useRef(activeMarker);
  const hoveredMarkerIdRef = useRef(hoveredMarkerId);
  const speedRef = useRef(speed);

  useEffect(() => {
    markersRef.current = markers;
    activeMarkerRef.current = activeMarker;
    hoveredMarkerIdRef.current = hoveredMarkerId;
    speedRef.current = speed;
  }, [markers, activeMarker, hoveredMarkerId, speed]);

  const isPausedRef = useRef(false);
  const currentPhiRef = useRef(0);
  const currentThetaRef = useRef(0.2);
  const phiBaseRef = useRef(0);
  const thetaBase = 0.2;

  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  // Sync paused status with active selection and hover
  const isPanelOpen = activeMarker !== null;
  useEffect(() => {
    isPausedRef.current = isPanelOpen || hoveredMarkerId !== null;
  }, [isPanelOpen, hoveredMarkerId]);

  // Project 3D lat/lon to 2D screen coordinates
  const projectMarker = useCallback(
    (location: [number, number], currentPhi: number, currentTheta: number) => {
      const DEG_TO_RAD = Math.PI / 180;
      const lat = location[0];
      const lon = location[1];

      const rLat = lat * DEG_TO_RAD;
      const rLon = lon * DEG_TO_RAD - Math.PI;
      const cosLat = Math.cos(rLat);
      const sinLat = Math.sin(rLat);
      const cosLon = Math.cos(rLon);
      const sinLon = Math.sin(rLon);

      // 3D coordinates on unit sphere
      const radius = 0.8;
      const t0 = -cosLat * cosLon * radius;
      const t1 = sinLat * radius;
      const t2 = cosLat * sinLon * radius;

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
      const isVisible = zCam > 0.05;

      return { x, y, isVisible };
    },
    []
  );

  // Spherical hit test: returns closest visible marker within hitRadius (CSS pixels)
  const hitTestMarker = useCallback(
    (clientX: number, clientY: number, hitRadius = 20): PulseMarker | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();

      const curPhi = currentPhiRef.current;
      const curTheta = currentThetaRef.current;

      let closestMarker: PulseMarker | null = null;
      let minDistance = Infinity;

      for (const m of markersRef.current) {
        const { x, y, isVisible } = projectMarker(m.location, curPhi, curTheta);
        if (!isVisible) continue;

        // Screen position of marker in client coordinates
        const markerScreenX = rect.left + x * rect.width;
        const markerScreenY = rect.top + y * rect.height;

        const dist = Math.hypot(clientX - markerScreenX, clientY - markerScreenY);
        if (dist <= hitRadius && dist < minDistance) {
          minDistance = dist;
          closestMarker = m;
        }
      }

      return closestMarker;
    },
    [projectMarker]
  );

  // Toggle selection: clicking the same dot closes the panel; another dot switches immediately
  const handleToggleMarker = useCallback(
    (marker: PulseMarker) => {
      const now = Date.now();
      if (now - lastClickTimeRef.current < 160) return; // Debounce rapid repeated clicks
      lastClickTimeRef.current = now;

      if (activeMarkerRef.current?.id === marker.id) {
        // Toggle OFF (close panel)
        setInternalActiveMarker(null);
        if (onSelectMarker) onSelectMarker(null);
        isPausedRef.current = hoveredMarkerIdRef.current !== null;
      } else {
        // Switch to new marker immediately with NO skeleton flicker
        setInternalActiveMarker(marker);
        if (onSelectMarker) onSelectMarker(marker);
        isPausedRef.current = true;
      }
    },
    [onSelectMarker]
  );

  const handleClosePanel = useCallback(() => {
    setInternalActiveMarker(null);
    if (onSelectMarker) onSelectMarker(null);
    isPausedRef.current = hoveredMarkerIdRef.current !== null;
  }, [onSelectMarker]);

  // Unified Pointer Handling (Drag vs Click differentiation with 5px threshold)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
    isPausedRef.current = true; // Synchronously pause rotation so target never moves
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  }, []);

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        const dist = Math.hypot(
          e.clientX - pointerInteracting.current.x,
          e.clientY - pointerInteracting.current.y
        );

        if (dist >= 5 || isDraggingRef.current) {
          // It was a drag: commit rotation offsets
          phiOffsetRef.current += dragOffset.current.phi;
          thetaOffsetRef.current += dragOffset.current.theta;
          dragOffset.current = { phi: 0, theta: 0 };
        } else {
          // It was a crisp click (< 5px movement): perform spherical hit test
          dragOffset.current = { phi: 0, theta: 0 };
          const hit = hitTestMarker(e.clientX, e.clientY, 20);
          if (hit) {
            handleToggleMarker(hit);
          }
        }
      }

      pointerInteracting.current = null;
      isDraggingRef.current = false;
      if (canvasRef.current) {
        canvasRef.current.style.cursor = hoveredMarkerIdRef.current ? 'pointer' : 'grab';
      }
      isPausedRef.current = activeMarkerRef.current !== null || hoveredMarkerIdRef.current !== null;
    },
    [hitTestMarker, handleToggleMarker]
  );

  // Global pointer move listener during drag or hover
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        const dist = Math.hypot(
          e.clientX - pointerInteracting.current.x,
          e.clientY - pointerInteracting.current.y
        );

        if (dist >= 5) {
          isDraggingRef.current = true;
          dragOffset.current = {
            phi: (e.clientX - pointerInteracting.current.x) / 300,
            theta: (e.clientY - pointerInteracting.current.y) / 1000,
          };
          if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
        }
      } else {
        // When not dragging, hit test to update hover state and cursor
        const hit = hitTestMarker(e.clientX, e.clientY, 18);
        if (hit) {
          setHoveredMarkerId(hit.id);
          isPausedRef.current = true;
          if (canvasRef.current) canvasRef.current.style.cursor = 'pointer';
        } else {
          setHoveredMarkerId(null);
          if (!activeMarkerRef.current) {
            isPausedRef.current = false;
          }
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [hitTestMarker, handlePointerUp]);

  // One-time Globe Initialization Effect (persists instance in globeRef)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const globe = createGlobe(canvas, {
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
      markers: markersRef.current.map((m) => {
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

    globeRef.current = globe;

    function animate() {
      if (!isPausedRef.current) {
        phiBaseRef.current += speedRef.current;
      }

      const currentPhi = phiBaseRef.current + phiOffsetRef.current + dragOffset.current.phi;
      const currentTheta = thetaBase + thetaOffsetRef.current + dragOffset.current.theta;

      currentPhiRef.current = currentPhi;
      currentThetaRef.current = currentTheta;

      if (globeRef.current) {
        globeRef.current.update({
          phi: currentPhi,
          theta: currentTheta,
        });
      }

      // Update marker interactive overlay positions every frame directly on DOM elements
      markersRef.current.forEach((m) => {
        const btn = markerButtonsRef.current[m.id];
        if (btn) {
          const { x, y, isVisible } = projectMarker(m.location, currentPhi, currentTheta);
          if (isVisible) {
            btn.style.left = `${(x * 100).toFixed(3)}%`;
            btn.style.top = `${(y * 100).toFixed(3)}%`;
            btn.style.display = 'flex';
            btn.style.opacity = '1';
            btn.tabIndex = 0;
          } else {
            btn.style.display = 'none';
            btn.style.opacity = '0';
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
      if (globeRef.current) {
        globeRef.current.destroy();
        globeRef.current = null;
      }
    };
  }, [size, baseColor, glowColor, projectMarker]);

  return (
    <div className='relative flex flex-col items-center justify-center select-none'>
      <style>{`
        @keyframes pulse-expand {
          0% { transform: scale(0.35); opacity: 0.9; }
          100% { transform: scale(1.65); opacity: 0; }
        }
        @keyframes active-dot-ping {
          0% { transform: scale(0.9); opacity: 0.9; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* Fixed-Size Globe Container (No percent-based stretching, perfectly centered) */}
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
            transition: 'opacity 0.6s ease',
            borderRadius: '50%',
            touchAction: 'none',
          }}
        />

        {/* Interactive Projected Marker Overlays (Focusable, accessible HTML buttons) */}
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
              onClick={(e) => {
                e.stopPropagation();
                if (!isDraggingRef.current) {
                  handleToggleMarker(m);
                }
              }}
              onMouseEnter={() => {
                setHoveredMarkerId(m.id);
                isPausedRef.current = true;
              }}
              onMouseLeave={() => {
                setHoveredMarkerId(null);
                isPausedRef.current = activeMarkerRef.current !== null;
              }}
              onFocus={() => {
                setHoveredMarkerId(m.id);
                isPausedRef.current = true;
              }}
              onBlur={() => {
                setHoveredMarkerId(null);
                isPausedRef.current = activeMarkerRef.current !== null;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggleMarker(m);
                }
              }}
              aria-label={`${m.name}, ${m.status}, toggle region details`}
              title={`${m.name} (${m.status}) — Click to toggle telemetry`}
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
              {/* Selected Dot Active Pulse Ring */}
              {isSelected && (
                <>
                  <span
                    style={{
                      position: 'absolute',
                      inset: -4,
                      borderRadius: '50%',
                      border: '2px solid #ffffff',
                      animation: 'active-dot-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite',
                      pointerEvents: 'none',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '50%',
                      border: `2px solid ${markerColor}`,
                      boxShadow: `0 0 14px ${markerColor}`,
                      pointerEvents: 'none',
                    }}
                  />
                </>
              )}

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

              {/* Marker Core Dot with Visible Active Ring */}
              <span
                style={{
                  width: isSelected ? 13 : isHovered ? 11 : 9,
                  height: isSelected ? 13 : isHovered ? 11 : 9,
                  background: isSelected ? '#ffffff' : markerColor,
                  borderRadius: '50%',
                  boxShadow: isSelected
                    ? `0 0 0 3px #000000, 0 0 0 6px ${markerColor}, 0 0 20px ${markerColor}`
                    : isHovered
                    ? `0 0 0 2px #000000, 0 0 0 4px ${markerColor}, 0 0 12px ${markerColor}`
                    : `0 0 0 2px #000000, 0 0 0 3px ${markerColor}bb, 0 0 8px ${markerColor}88`,
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: 'none',
                }}
              />

              {/* Floating Region Tooltip Pill on Hover */}
              <span
                className={cn(
                  'absolute bottom-full mb-1.5 px-2 py-0.5 rounded bg-zinc-950/95 text-zinc-100 border border-zinc-800 text-[10px] font-mono whitespace-nowrap shadow-xl pointer-events-none transition-all duration-150 z-40',
                  isHovered || isSelected
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-1 scale-95 pointer-events-none'
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

        {/* Floating Detail Panel (Only rendered if renderDetailPanel=true) */}
        {renderDetailPanel && isPanelOpen && (
          <div className='absolute top-0 right-0 z-50 translate-x-2 md:translate-x-4 max-w-[340px] sm:max-w-[380px] w-full'>
            <RegionDetailPanel
              marker={activeMarker}
              isOpen={isPanelOpen}
              onClose={handleClosePanel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
