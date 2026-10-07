'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const FigureSkeleton = () => (
  <div className='w-full h-full min-h-[160px] flex items-center justify-center bg-muted/10 rounded-xl'>
    <div className='size-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin' />
  </div>
);

export const TerrainFigure = dynamic(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Terrain),
  { ssr: false, loading: FigureSkeleton }
);

export const PlotFigure = dynamic(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Plot),
  { ssr: false, loading: FigureSkeleton }
);

export const BranchesFigure = dynamic(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Branches),
  { ssr: false, loading: FigureSkeleton }
);

export const PhosphorFigure = dynamic(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Phosphor),
  { ssr: false, loading: FigureSkeleton }
);

export const VaultFigure = dynamic(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Vault),
  { ssr: false, loading: FigureSkeleton }
);

export const RiffleFigure = dynamic(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Riffle),
  { ssr: false, loading: FigureSkeleton }
);

export const TerminalFigure = dynamic(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Terminal),
  { ssr: false, loading: FigureSkeleton }
);
