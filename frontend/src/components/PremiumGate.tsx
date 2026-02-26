import React from 'react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { usePremiumTestingMode } from '../hooks/usePremiumTestingMode';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import UpgradePrompt from './UpgradePrompt';
import { PremiumFeature } from '../types/features';

interface PremiumGateProps {
  children: React.ReactNode;
  featureName?: PremiumFeature;
}

export default function PremiumGate({ children, featureName }: PremiumGateProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { isPremiumTestingEnabled } = usePremiumTestingMode();
  const { isPremium: isSubscriptionPremium } = useSubscriptionContext();

  const isBackendPremium = userProfile?.userTier === 'premium';
  const isPremium = isPremiumTestingEnabled || isBackendPremium || isSubscriptionPremium;

  if (isPremium) {
    return <>{children}</>;
  }

  return <UpgradePrompt featureName={featureName} />;
}
