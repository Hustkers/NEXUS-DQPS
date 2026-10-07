'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const FigureSkeleton = () => (
  <div className='w-full h-full min-h-[160px] flex items-center justify-center bg-muted/10 rounded-xl'>
    <div className='size-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin' />
  </div>
);

export interface HairlineFigureProps {
  intensity?: number;
  className?: string;
  label?: string;
  [key: string]: any;
}

export const TerrainFigure = dynamic<HairlineFigureProps>(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Terrain as any),
  { ssr: false, loading: FigureSkeleton }
);

export const PlotFigure = dynamic<HairlineFigureProps>(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Plot as any),
  { ssr: false, loading: FigureSkeleton }
);

export const BranchesFigure = dynamic<HairlineFigureProps>(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Branches as any),
  { ssr: false, loading: FigureSkeleton }
);

export const PhosphorFigure = dynamic<HairlineFigureProps>(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Phosphor as any),
  { ssr: false, loading: FigureSkeleton }
);

export const VaultFigure = dynamic<HairlineFigureProps>(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Vault as any),
  { ssr: false, loading: FigureSkeleton }
);

export const RiffleFigure = dynamic<HairlineFigureProps>(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Riffle as any),
  { ssr: false, loading: FigureSkeleton }
);

export const TerminalFigure = dynamic<HairlineFigureProps>(
  () => import('@lucasmarkes/hairline/react').then((m) => m.Terminal as any),
  { ssr: false, loading: FigureSkeleton }
);
