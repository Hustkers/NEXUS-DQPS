"use client"

import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

export interface PulseMarker {
  id: string
  location: [number, number]
  delay: number
  color?: string
  salesLevel?: "high" | "medium" | "low"
  label?: string
  volume?: string
}

export interface GlobePulseProps {
  markers?: PulseMarker[]
  className?: string
  speed?: number
  baseColor?: [number, number, number]
  glowColor?: [number, number, number]
}

// Regions with high sales and interaction:
// Red for highest sales (US East / West), decreasing to orange and yellow (London, Tokyo, Mumbai, Singapore)
// No grey!
const defaultMarkers: PulseMarker[] = [
  { id: "pulse-1", location: [40.71, -74.01], delay: 0, color: "#ef4444", salesLevel: "high", label: "US East (New York)", volume: "$42.5k / 4.2x ROAS" }, // High Sales - Red
  { id: "pulse-2", location: [37.77, -122.42], delay: 0.3, color: "#f43f5e", salesLevel: "high", label: "US West (San Francisco)", volume: "$38.2k / 3.9x ROAS" }, // High Sales - Red
  { id: "pulse-3", location: [51.51, -0.13], delay: 0.6, color: "#f97316", salesLevel: "medium", label: "EMEA (London)", volume: "$28.1k / 3.4x ROAS" }, // High-Medium - Orange-Red
  { id: "pulse-4", location: [35.68, 139.65], delay: 0.9, color: "#f59e0b", salesLevel: "medium", label: "APAC (Tokyo)", volume: "$21.4k / 3.1x ROAS" }, // Medium - Amber
  { id: "pulse-5", location: [19.07, 72.88], delay: 1.2, color: "#eab308", salesLevel: "low", label: "India Direct (Mumbai)", volume: "$18.6k / 2.9x ROAS" }, // Decreasing - Yellow
  { id: "pulse-6", location: [1.35, 103.82], delay: 1.5, color: "#facc15", salesLevel: "low", label: "SEA Hub (Singapore)", volume: "$14.2k / 2.7x ROAS" }, // Decreasing - Yellow
  { id: "pulse-7", location: [-33.87, 151.21], delay: 1.8, color: "#fde047", salesLevel: "low", label: "Oceania (Sydney)", volume: "$11.0k / 2.5x ROAS" }, // Decreasing - Light Yellow
]

export function GlobePulse({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
  // No grey! Rich deep navy-azure base color with vibrant atmospheric glow
  baseColor = [0.18, 0.26, 0.44],
  glowColor = [0.12, 0.22, 0.48],
}: GlobePulseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.2,
        dark: 1,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 8.5,
        // No grey!
        baseColor,
        markerColor: [0.95, 0.25, 0.25],
        glowColor,
        markerElevation: 0,
        markers: markers.map((m) => ({
          location: m.location,
          size: 0.03,
          id: m.id,
          color: m.color?.startsWith("#ef") || m.color?.startsWith("#f4")
            ? [0.95, 0.2, 0.2]
            : m.color?.startsWith("#f9")
            ? [0.95, 0.45, 0.1]
            : [0.95, 0.8, 0.1]
        })),
        arcs: [],
        arcColor: [0.95, 0.35, 0.2],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.85,
      })

      function animate() {
        if (!isPausedRef.current) phi += speed
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }

      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed, baseColor, glowColor])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <style>{`
        @keyframes pulse-expand {
          0% { transform: scaleX(0.3) scaleY(0.3); opacity: 0.85; }
          100% { transform: scaleX(1.6) scaleY(1.6); opacity: 0; }
        }
      `}</style>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {markers.map((m) => {
        const markerColor = m.color || "#ef4444"
        return (
          <div
            key={m.id}
            style={{
              position: "absolute",
              positionAnchor: (`--cobe-${m.id}` as any),
              bottom: "anchor(center)",
              left: "anchor(center)",
              translate: "-50% 50%",
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none" as const,
              opacity: `var(--cobe-visible-${m.id}, 0)`,
              filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
              transition: "opacity 0.4s, filter 0.4s",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                border: `2px solid ${markerColor}`,
                borderRadius: "50%",
                opacity: 0,
                animation: `pulse-expand 2s ease-out infinite ${m.delay}s`,
                boxShadow: `0 0 12px ${markerColor}66`,
              }}
            />
            <span
              style={{
                position: "absolute",
                inset: 0,
                border: `2px solid ${markerColor}`,
                borderRadius: "50%",
                opacity: 0,
                animation: `pulse-expand 2s ease-out infinite ${m.delay + 0.5}s`,
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                background: markerColor,
                borderRadius: "50%",
                boxShadow: `0 0 0 3px #07090e, 0 0 0 5px ${markerColor}, 0 0 10px ${markerColor}`,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
