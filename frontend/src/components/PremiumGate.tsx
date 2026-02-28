import React from 'react';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';
import UpgradePrompt from './UpgradePrompt';
import type { PremiumFeature } from '../types/features';
import { FEATURE_CONFIG } from '../types/features';

interface PremiumGateProps {
  children: React.ReactNode;
  featureName?: PremiumFeature;
}

export default function PremiumGate({ children, featureName }: PremiumGateProps) {
  const { isPremium, isLoading } = useConsolidatedPremiumStatus();

  // While loading, render children to avoid false paywall flash for premium users
  if (isLoading) return <>{children}</>;

  if (!isPremium) {
    const config = featureName ? FEATURE_CONFIG[featureName] : null;
    return (
      <UpgradePrompt
        featureName={config?.name}
        description={config?.description}
      />
    );
  }

  return <>{children}</>;
}
