'use client';

import React from 'react';
import {
  ConstellationField as BaseConstellationField,
  InterfaceLines,
  ParticleDrift,
  ParticleNetwork,
  GatewayFlow,
  ConnectivityGraph,
  DefenseLines,
  TopoField,
  type NeuformBatchEffectProps,
} from './neuform-isolated/NeuformBatchEffects';

const VARIANT_MAP: Record<string, React.ComponentType<NeuformBatchEffectProps>> = {
  'constellation-field': BaseConstellationField,
  'particle-drift': ParticleDrift,
  'particle-network': ParticleNetwork,
  'gateway-flow': GatewayFlow,
  'connectivity-graph': ConnectivityGraph,
  'interface-lines': InterfaceLines,
  'defense-lines': DefenseLines,
  'topo-field': TopoField,
};

export function ConstellationField({
  variant = 'constellation-field',
  ...props
}: NeuformBatchEffectProps) {
  const Component = VARIANT_MAP[variant] || InterfaceLines;
  return <Component {...props} variant={variant} />;
}

export * from './neuform-isolated/NeuformBatchEffects';
