import { NormalizationShowcase } from '@/features/normalization/components/normalization-showcase';

export const metadata = {
  title: 'Live Schema Normalizer | NEXUS-DQPS',
  description: 'Interactive demonstration of cross-channel Ad API payload normalization into canonical unified commerce records.'
};

export default function NormalizationPage() {
  return <NormalizationShowcase />;
}
