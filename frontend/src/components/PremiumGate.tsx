import React from 'react';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';
import UpgradePrompt from './UpgradePrompt';
import { PremiumFeature } from '../types/features';

interface PremiumGateProps {
  children: React.ReactNode;
  featureName?: PremiumFeature;
}

export default function PremiumGate({ children, featureName }: PremiumGateProps) {
  const { isPremium, isLoading } = useConsolidatedPremiumStatus();

  // Don't gate while loading — avoid false paywall flash
  if (isLoading) {
    return <>{children}</>;
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return <UpgradePrompt featureName={featureName} highlightedFeature={featureName} />;
}
