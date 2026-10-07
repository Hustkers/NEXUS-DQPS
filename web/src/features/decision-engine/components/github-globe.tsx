'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import createGlobe, { type Marker, type Arc } from 'cobe';
import {
  EDGE_HUBS,
  HUB_ARCS,
  EdgeDeliveryHub,
  HubPlatform,
  getArcsForPlatform
} from '@/data/ad-delivery-hubs';
import { EdgeHubInspector } from './edge-hub-inspector';
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconBolt,
  IconRefresh,
  IconCheck,
  IconActivity
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface GithubGlobeProps {
  className?: string;
  activeSku?: string;
  activePlatform?: string;
  accentColor?: [number, number, number];
  size?: number; // Fixed size in px (default 420px)
  interactive?: boolean;
  showControls?: boolean;
  selectedHubId?: string | null;
  onSelectHub?: (hub: EdgeDeliveryHub | null) => void;
}

export function GithubGlobe({
  className,
  activeSku: _activeSku,
  activePlatform: _activePlatform,
  accentColor = [0.2, 0.85, 0.95],
  size = 420,
  interactive = true,
  showControls = true,
  selectedHubId: controlledSelectedHubId,
  onSelectHub
}: GithubGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const markerButtonsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Hub selection state
  const [internalSelectedHubId, setInternalSelectedHubId] = useState<string | null>(null);
  const [hoveredHubId, setHoveredHubId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<HubPlatform>('all');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [rotationSpeedMultiplier, setRotationSpeedMultiplier] = useState<number>(1);
  const [isPingBursting, setIsPingBursting] = useState<boolean>(false);
  const [pingBurstBanner, setPingBurstBanner] = useState<string | null>(null);

  const activeHubId = controlledSelectedHubId !== undefined ? controlledSelectedHubId : internalSelectedHubId;
  const activeHub = useMemo(
    () => EDGE_HUBS.find((h) => h.id === activeHubId) ?? null,
    [activeHubId]
  );

  // Rotation angles & animation refs
  const isPausedRef = useRef(false);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.2);
  const targetPhiRef = useRef<number | null>(null);
  const targetThetaRef = useRef<number | null>(null);
  const speedRef = useRef(0.0035);

  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const pointerMovement = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastClickTimeRef = useRef(0);

  // Filtered arcs based on selected platform
  const activeArcs = useMemo(() => {
    return getArcsForPlatform(selectedPlatform);
  }, [selectedPlatform]);

  // Keep refs up-to-date
  const isRotatingRef = useRef(isRotating);
  const speedMultRef = useRef(rotationSpeedMultiplier);
  useEffect(() => {
    isRotatingRef.current = isRotating;
    speedMultRef.current = rotationSpeedMultiplier;
  }, [isRotating, rotationSpeedMultiplier]);

  useEffect(() => {
    // Pause rotation if inspector is open or mouse is hovering a node
    isPausedRef.current = !isRotating || activeHub !== null || hoveredHubId !== null;
  }, [isRotating, activeHub, hoveredHubId]);

  // Project 3D coordinates to 2D screen positions
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

      const radius = 0.8;
      const t0 = -cosLat * cosLon * radius;
      const t1 = sinLat * radius;
      const t2 = cosLat * sinLon * radius;

      const cosTheta = Math.cos(currentTheta);
      const sinTheta = Math.sin(currentTheta);
      const cosPhi = Math.cos(currentPhi);
      const sinPhi = Math.sin(currentPhi);

      const c = cosPhi * t0 + sinPhi * t2;
      const s = sinPhi * sinTheta * t0 + cosTheta * t1 - cosPhi * sinTheta * t2;
      const zCam = -sinPhi * cosTheta * t0 + sinTheta * t1 + cosPhi * cosTheta * t2;

      const x = (c + 1) / 2;
      const y = (-s + 1) / 2;
      const isVisible = zCam > 0.05;

      return { x, y, isVisible };
    },
    []
  );

  // Smoothly orient globe towards a selected hub
  const orientToHub = useCallback((hub: EdgeDeliveryHub) => {
    const lon = hub.location[1];
    const lat = hub.location[0];
    // Formula to center [lat, lon] in front of camera
    const desiredPhi = -lon * (Math.PI / 180) - Math.PI / 2;
    // Map current phi to closest equivalent angle (mod 2*PI)
    const twoPi = Math.PI * 2;
    const currentPhiNorm = ((phiRef.current % twoPi) + twoPi) % twoPi;
    const desiredPhiNorm = ((desiredPhi % twoPi) + twoPi) % twoPi;
    let delta = desiredPhiNorm - currentPhiNorm;
    if (delta > Math.PI) delta -= twoPi;
    if (delta < -Math.PI) delta += twoPi;

    targetPhiRef.current = phiRef.current + delta;
    targetThetaRef.current = Math.max(-0.4, Math.min(0.5, lat * (Math.PI / 180) * 0.7));
  }, []);

  const handleSelectHub = useCallback(
    (hub: EdgeDeliveryHub | null) => {
      if (hub && hub.id === activeHub?.id) {
        // Toggle OFF if clicking same hub
        setInternalSelectedHubId(null);
        onSelectHub?.(null);
      } else {
        setInternalSelectedHubId(hub ? hub.id : null);
        onSelectHub?.(hub);
        if (hub) {
          orientToHub(hub);
        }
      }
    },
    [activeHub, onSelectHub, orientToHub]
  );

  // Trigger simulated ping wave across all delivery vectors
  const handleTriggerPingBurst = useCallback(() => {
    setIsPingBursting(true);
    setPingBurstBanner('⚡ Pinging 8 edge nodes across Meta, Google & TikTok...');
    setTimeout(() => {
      setPingBurstBanner('✓ 8/8 Edge Hubs Verified • Nominal Latency 38.4ms (0% loss)');
      setTimeout(() => {
        setIsPingBursting(false);
        setTimeout(() => setPingBurstBanner(null), 3000);
      }, 1500);
    }, 900);
  }, []);

  // Sync orientation when controlledSelectedHubId changes externally
  useEffect(() => {
    if (controlledSelectedHubId) {
      const hub = EDGE_HUBS.find((h) => h.id === controlledSelectedHubId);
      if (hub) orientToHub(hub);
    }
  }, [controlledSelectedHubId, orientToHub]);

  // Pointer interactions (drag vs click distinction)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    pointerMovement.current = { x: 0, y: 0 };
    isDraggingRef.current = false;
    isPausedRef.current = true;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerInteracting.current !== null) {
      const dx = e.clientX - pointerInteracting.current.x;
      const dy = e.clientY - pointerInteracting.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist >= 5) {
        isDraggingRef.current = true;
        pointerMovement.current = { x: dx, y: dy };
        phiRef.current += dx * 0.005;
        thetaRef.current = Math.max(-0.6, Math.min(0.6, thetaRef.current - dy * 0.003));
        pointerInteracting.current = { x: e.clientX, y: e.clientY };
        targetPhiRef.current = null;
        targetThetaRef.current = null;
      }
    }
  };

  const handlePointerUp = () => {
    pointerInteracting.current = null;
    isDraggingRef.current = false;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    isPausedRef.current = !isRotating || activeHub !== null || hoveredHubId !== null;
  };

  // One-time Globe Initialization & Continuous Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Convert EDGE_HUBS to COBE Marker format
    const cobeMarkers: Marker[] = EDGE_HUBS.map((hub) => ({
      location: hub.location,
      size: 0.075,
      color: hub.color,
      id: hub.id
    }));

    // Convert activeArcs to COBE Arc format
    const cobeArcs: Arc[] = activeArcs.map((arc) => ({
      from: arc.from,
      to: arc.to,
      id: arc.id
    }));

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi: 0,
      theta: 0.2,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 4.2,
      baseColor: [0.12, 0.14, 0.18],
      markerColor: accentColor,
      glowColor: [0.1, 0.18, 0.25],
      markers: cobeMarkers,
      arcs: cobeArcs,
      arcColor: isPingBursting ? [0.4, 0.95, 1.0] : accentColor,
      arcWidth: isPingBursting ? 1.4 : 0.85,
      arcHeight: 0.35,
      scale: 1.05
    });

    globeRef.current = globe;
    let animationFrameId: number;

    const animate = () => {
      // Handle camera interpolation towards target hub if active
      if (targetPhiRef.current !== null && targetThetaRef.current !== null) {
        const phiDiff = targetPhiRef.current - phiRef.current;
        const thetaDiff = targetThetaRef.current - thetaRef.current;

        if (Math.abs(phiDiff) > 0.002 || Math.abs(thetaDiff) > 0.002) {
          phiRef.current += phiDiff * 0.08;
          thetaRef.current += thetaDiff * 0.08;
        } else {
          phiRef.current = targetPhiRef.current;
          thetaRef.current = targetThetaRef.current;
          targetPhiRef.current = null;
          targetThetaRef.current = null;
        }
      } else if (!isPausedRef.current && isRotatingRef.current) {
        // Auto-rotation with speed multiplier
        phiRef.current += speedRef.current * speedMultRef.current;
      }

      const currentPhi = phiRef.current;
      const currentTheta = thetaRef.current;

      globe.update({
        phi: currentPhi,
        theta: currentTheta,
        arcs: cobeArcs,
        arcWidth: isPingBursting ? 1.4 : 0.85,
        arcColor: isPingBursting ? [0.4, 0.95, 1.0] : accentColor
      });

      // Update projected 2D HTML marker button positions
      if (interactive) {
        EDGE_HUBS.forEach((hub) => {
          const btn = markerButtonsRef.current[hub.id];
          if (btn) {
            const { x, y, isVisible } = projectMarker(hub.location, currentPhi, currentTheta);
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
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      globe.destroy();
      globeRef.current = null;
    };
  }, [size, accentColor, activeArcs, isPingBursting, interactive, projectMarker]);

  return (
    <div className='relative flex flex-col items-center justify-center select-none w-full'>
      <style>{`
        @keyframes cobe-arc-ping {
          0% { transform: scale(0.4); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* Optional Interactive Controls Toolbar on Top */}
      {showControls && (
        <div className='w-full max-w-[500px] flex flex-wrap items-center justify-between gap-2 mb-2 px-1 text-xs font-mono z-20'>
          {/* Play/Pause & Speed Controls */}
          <div className='flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-lg p-0.5 shadow-sm'>
            <button
              type='button'
              onClick={() => setIsRotating(!isRotating)}
              className={cn(
                'p-1.5 rounded transition-colors flex items-center justify-center',
                isRotating ? 'text-cyan-400 hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-200'
              )}
              title={isRotating ? 'Pause rotation' : 'Resume rotation'}
              aria-label={isRotating ? 'Pause rotation' : 'Resume rotation'}
            >
              {isRotating ? <IconPlayerPause className='size-3.5' /> : <IconPlayerPlay className='size-3.5' />}
            </button>

            <button
              type='button'
              onClick={() => setRotationSpeedMultiplier(rotationSpeedMultiplier === 1 ? 2 : 1)}
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors',
                rotationSpeedMultiplier === 2
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
              title='Toggle rotation speed'
            >
              {rotationSpeedMultiplier}x
            </button>
          </div>

          {/* Platform Vector Filter Tabs */}
          <div className='flex items-center gap-0.5 bg-zinc-900/90 border border-zinc-800 rounded-lg p-0.5 text-[10px] shadow-sm'>
            {(['all', 'meta', 'google', 'tiktok'] as HubPlatform[]).map((plt) => (
              <button
                key={plt}
                type='button'
                onClick={() => setSelectedPlatform(plt)}
                className={cn(
                  'px-2 py-0.5 rounded uppercase font-semibold transition-all',
                  selectedPlatform === plt
                    ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                {plt}
              </button>
            ))}
          </div>

          {/* Diagnostic Ping Trigger */}
          <button
            type='button'
            onClick={handleTriggerPingBurst}
            disabled={isPingBursting}
            className={cn(
              'px-2 py-1 rounded-lg border text-[10px] flex items-center gap-1 font-mono transition-all',
              isPingBursting
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 animate-pulse'
                : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:border-cyan-500/40'
            )}
            title='Simulate telemetry ping across all edge nodes'
          >
            <IconBolt className='size-3 text-cyan-400' />
            <span>⚡ Ping Vectors</span>
          </button>
        </div>
      )}

      {/* Ping Status HUD Banner */}
      {pingBurstBanner && (
        <div className='animate-in fade-in slide-in-from-top-1 duration-150 mb-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono flex items-center gap-1.5 shadow-lg z-20'>
          <IconActivity className='size-3 animate-spin text-cyan-400' />
          <span>{pingBurstBanner}</span>
        </div>
      )}

      {/* Main 3D Globe Viewport */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          aspectRatio: '1 / 1'
        }}
        className={cn(
          'relative flex items-center justify-center overflow-visible bg-[#000000] shrink-0 rounded-2xl select-none',
          className
        )}
      >
        {/* WebGL Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            cursor: 'grab',
            touchAction: 'none'
          }}
          className='opacity-95 transition-opacity duration-300'
        />

        {/* Atmospheric Ring Overlay */}
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <div className='size-[82%] rounded-full ring-1 ring-cyan-500/20 ring-offset-2 ring-offset-transparent' />
        </div>

        {/* Interactive Projected Node Markers */}
        {interactive &&
          EDGE_HUBS.map((hub) => {
            const isSelected = activeHub?.id === hub.id;
            const isHovered = hoveredHubId === hub.id;
            const hex = hub.hexColor;

            return (
              <button
                key={hub.id}
                ref={(el) => {
                  markerButtonsRef.current[hub.id] = el;
                }}
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDraggingRef.current) {
                    const now = Date.now();
                    if (now - lastClickTimeRef.current > 150) {
                      lastClickTimeRef.current = now;
                      handleSelectHub(hub);
                    }
                  }
                }}
                onMouseEnter={() => {
                  setHoveredHubId(hub.id);
                  isPausedRef.current = true;
                }}
                onMouseLeave={() => {
                  setHoveredHubId(null);
                  isPausedRef.current = !isRotating || activeHub !== null;
                }}
                onFocus={() => {
                  setHoveredHubId(hub.id);
                  isPausedRef.current = true;
                }}
                onBlur={() => {
                  setHoveredHubId(null);
                  isPausedRef.current = !isRotating || activeHub !== null;
                }}
                aria-label={`Edge Hub ${hub.name}, Latency ${hub.latencyMs}ms, click to inspect`}
                title={`${hub.name} (${hub.latencyMs}ms) — Click to inspect`}
                style={{
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  width: 36,
                  height: 36,
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  zIndex: isSelected ? 40 : 25
                }}
                className='group focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full'
              >
                {/* Selected active pulse wave */}
                {isSelected && (
                  <>
                    <span
                      style={{
                        position: 'absolute',
                        inset: -4,
                        borderRadius: '50%',
                        border: '2px solid #38bdf8',
                        animation: 'cobe-arc-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite',
                        pointerEvents: 'none'
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '50%',
                        border: `2px solid ${hex}`,
                        boxShadow: `0 0 16px ${hex}`,
                        pointerEvents: 'none'
                      }}
                    />
                  </>
                )}

                {/* Concentric pulsing beacon */}
                <span
                  style={{
                    position: 'absolute',
                    inset: 3,
                    border: `1.5px solid ${hex}`,
                    borderRadius: '50%',
                    opacity: 0,
                    animation: 'cobe-arc-ping 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) infinite',
                    boxShadow: `0 0 10px ${hex}88`,
                    pointerEvents: 'none'
                  }}
                />

                {/* Core Node Marker Dot */}
                <span
                  style={{
                    width: isSelected ? 12 : isHovered ? 10 : 8,
                    height: isSelected ? 12 : isHovered ? 10 : 8,
                    background: isSelected ? '#ffffff' : hex,
                    borderRadius: '50%',
                    boxShadow: isSelected
                      ? `0 0 0 2px #000000, 0 0 0 4px ${hex}, 0 0 16px ${hex}`
                      : isHovered
                      ? `0 0 0 2px #000000, 0 0 0 3px ${hex}, 0 0 10px ${hex}`
                      : `0 0 0 1.5px #000000, 0 0 0 2.5px ${hex}cc, 0 0 6px ${hex}88`,
                    transition: 'all 0.15s ease',
                    pointerEvents: 'none'
                  }}
                />

                {/* Hover Tooltip Pill */}
                <span
                  className={cn(
                    'absolute bottom-full mb-1.5 px-2 py-0.5 rounded bg-zinc-950/95 text-zinc-100 border border-zinc-800 text-[9.5px] font-mono whitespace-nowrap shadow-xl pointer-events-none transition-all duration-150 z-50',
                    isHovered || isSelected
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-1 scale-95 pointer-events-none'
                  )}
                >
                  <strong className='text-cyan-300'>{hub.code}</strong> •{' '}
                  <span className='text-zinc-300'>{hub.latencyMs}ms</span>
                </span>
              </button>
            );
          })}

        {/* Telemetry Stream Overlay Tags */}
        <div className='pointer-events-none absolute bottom-3 left-4 flex flex-col gap-1 text-[10px] font-mono z-10'>
          <div className='flex items-center gap-1.5 text-zinc-100 bg-zinc-950/90 px-2.5 py-1 rounded border border-zinc-800'>
            <span className='size-1.5 rounded-full bg-cyan-400 animate-ping' />
            <span className='font-bold'>GLOBAL TELEMETRY STREAM</span>
          </div>
          <div className='text-zinc-500 text-[9px] px-1'>
            {activeHub ? (
              <span className='text-cyan-300'>
                Focused: {activeHub.code} ({activeHub.latencyMs}ms • {activeHub.city})
              </span>
            ) : (
              <span>Lat: 37.77° N • Lon: -122.42° W • 8 Edge Hubs Active</span>
            )}
          </div>
        </div>

        {/* Floating Edge Hub Inspector Flyout */}
        {activeHub && (
          <div className='absolute top-2 right-2 sm:right-3 z-50 max-w-[340px] sm:max-w-[360px] w-full'>
            <EdgeHubInspector
              hub={activeHub}
              onClose={() => handleSelectHub(null)}
              onSelectPeer={(peerId) => {
                const peer = EDGE_HUBS.find((h) => h.id === peerId);
                if (peer) handleSelectHub(peer);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
