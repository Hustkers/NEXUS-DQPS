import { Metadata } from 'next';
import { LandingPageView } from '@/components/vengence/landing-page-view';

export const metadata: Metadata = {
  title: 'NEXUS-DQPS | Autonomous D2C Ad Intelligence & Decision Engine',
  description:
    'Decoupled KKT convex budget optimizer and causal diagnostic engine for multi-channel Direct-to-Consumer brands. Built for DataQuest 3.0.'
};

export default function Page() {
  return <LandingPageView />;
}
