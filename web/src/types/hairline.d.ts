declare module '@lucasmarkes/hairline/react' {
  import React from 'react';

  export interface HairlineProps extends React.HTMLAttributes<HTMLDivElement> {
    intensity?: number;
    className?: string;
    label?: string;
    [key: string]: any;
  }

  export const Terrain: React.ComponentType<HairlineProps>;
  export const Plot: React.ComponentType<HairlineProps>;
  export const Branches: React.ComponentType<HairlineProps>;
  export const Phosphor: React.ComponentType<HairlineProps>;
  export const Vault: React.ComponentType<HairlineProps>;
  export const Riffle: React.ComponentType<HairlineProps>;
  export const Terminal: React.ComponentType<HairlineProps>;
}
