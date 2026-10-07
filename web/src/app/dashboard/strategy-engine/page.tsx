import React from 'react';
import { StrategyEngineConsole } from '@/features/strategy-engine/components/strategy-engine-console';

export const metadata = {
  title: 'AI Ad Campaign Strategy Engine | NEXUS D2C',
  description: 'Generate, simulate, evaluate and rank 20-25 distinct advertising strategies with transparent predictive models.'
};

export default function StrategyEnginePage() {
  return <StrategyEngineConsole />;
}
