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
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);
    let time = 0;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = (e.clientX - rect.left) * window.devicePixelRatio;
      targetMouseY = (e.clientY - rect.top) * window.devicePixelRatio;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      time += 0.008;
      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const rows = 18;
      const cols = 28;
      const spacingX = width / (cols - 1);
      const spacingY = height / (rows - 1);

      // Draw subtle mathematical response field lines
      ctx.lineWidth = 1;

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
        const isDarkTheme = document.documentElement.classList.contains('dark') || !document.documentElement.classList.contains('light');
        const strokeRgb = isDarkTheme ? '255, 255, 255' : '15, 23, 42';
        const lineAlpha = (0.03 + (r / rows) * 0.05) * (isDarkTheme ? 1.0 : 1.3);
        ctx.strokeStyle = `rgba(${strokeRgb}, ${lineAlpha})`;
        ctx.stroke();
      }

      // Draw floating nodes at vertex intersections near mouse
      const isDarkTheme = document.documentElement.classList.contains('dark') || !document.documentElement.classList.contains('light');
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
            const radius = (1.5 + mouseFactor * 2.5);
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${nodeRgb}, ${mouseFactor * (isDarkTheme ? 0.75 : 0.5)})`;
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
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <div className={`relative w-full h-full pointer-events-none overflow-hidden ${className}`}>
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
