'use client';

import React, { useEffect, useRef } from 'react';

interface VGPUCanvasProps {
  className?: string;
  intensity?: number;
}

/**
 * VGPUCanvas: High-Performance Hardware-Accelerated Simulation Canvas
 * Inspired by vercel-labs/vgpu and WebGPU vector mesh shaders.
 * Renders an interactive mathematical vector field representing multi-channel
 * marginal ROAS response curves and convex optimization gradient descents.
 */
export function VGPUCanvas({ className = '', intensity = 1.0 }: VGPUCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let hasMouseInteracted = false;

    const updateSize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const parent = canvas.parentElement;
      const parentRect = parent?.getBoundingClientRect();

      const measuredWidth =
        rect.width || parentRect?.width || canvas.offsetWidth || window.innerWidth || 1200;
      const measuredHeight =
        rect.height || parentRect?.height || canvas.offsetHeight || 700;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = Math.max(100, Math.floor(measuredWidth * dpr));
      height = canvas.height = Math.max(100, Math.floor(measuredHeight * dpr));

      if (!hasMouseInteracted) {
        mouseX = targetMouseX = width / 2;
        mouseY = targetMouseY = height / 2;
      }
    };

    updateSize();

    const handleResize = () => {
      updateSize();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      hasMouseInteracted = true;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      targetMouseX = (e.clientX - rect.left) * dpr;
      targetMouseY = (e.clientY - rect.top) * dpr;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(canvas.parentElement);
    }

    const render = () => {
      if (width <= 0 || height <= 0) {
        updateSize();
      }

      time += 0.008;

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const rows = 18;
      const cols = 28;
      const spacingX = width / Math.max(cols - 1, 1);
      const spacingY = height / Math.max(rows - 1, 1);

      ctx.lineWidth = 1;

      // Draw subtle mathematical response field lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        let started = false;

        for (let c = 0; c < cols; c++) {
          const x = c * spacingX;
          const baseY = r * spacingY;

          // Wave function modulated by distance to cursor (response curve gradient)
          const distToMouse = Math.hypot(x - mouseX, baseY - mouseY);
          const mouseFactor = Math.max(0, 1 - distToMouse / (width * 0.45));

          const elevation =
            Math.sin(c * 0.28 + time * 1.5) * 14 * intensity +
            Math.cos(r * 0.35 + time * 1.1) * 10 * intensity +
            Math.sin(distToMouse * 0.015 - time * 2) * (26 * mouseFactor);

          const y = baseY + elevation;

          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Adaptive monochrome response field lines
        const isDarkTheme =
          document.documentElement.classList.contains('dark') ||
          !document.documentElement.classList.contains('light');
        const strokeRgb = isDarkTheme ? '255, 255, 255' : '15, 23, 42';
        const lineAlpha = (0.035 + (r / rows) * 0.055) * (isDarkTheme ? 1.0 : 1.3);
        ctx.strokeStyle = `rgba(${strokeRgb}, ${lineAlpha})`;
        ctx.stroke();
      }

      // Draw floating nodes at vertex intersections near mouse
      const isDarkTheme =
        document.documentElement.classList.contains('dark') ||
        !document.documentElement.classList.contains('light');
      const nodeRgb = isDarkTheme ? '255, 255, 255' : '15, 23, 42';
      const nodeStep = 2;

      for (let r = 0; r < rows; r += nodeStep) {
        for (let c = 0; c < cols; c += nodeStep) {
          const x = c * spacingX;
          const baseY = r * spacingY;
          const distToMouse = Math.hypot(x - mouseX, baseY - mouseY);

          if (distToMouse < width * 0.28) {
            const mouseFactor = 1 - distToMouse / (width * 0.28);
            const elevation =
              Math.sin(c * 0.28 + time * 1.5) * 14 * intensity +
              Math.cos(r * 0.35 + time * 1.1) * 10 * intensity +
              Math.sin(distToMouse * 0.015 - time * 2) * (26 * mouseFactor);
            const y = baseY + elevation;

            ctx.beginPath();
            const radius = 1.5 + mouseFactor * 2.5;
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${nodeRgb}, ${
              mouseFactor * (isDarkTheme ? 0.75 : 0.5)
            })`;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <div
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        className='absolute inset-0 w-full h-full block'
        style={{ width: '100%', height: '100%' }}
      />
      {/* Monochrome radial vignette to Canvas Black (#000000) */}
      <div className='absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_20%,#000000_85%)] pointer-events-none' />
    </div>
  );
}

export default VGPUCanvas;
