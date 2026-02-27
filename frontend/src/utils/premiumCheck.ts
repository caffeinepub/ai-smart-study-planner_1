import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { usePremiumTestingMode } from '../hooks/usePremiumTestingMode';
import { UserTier } from '../backend';

export function useConsolidatedPremiumStatus() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { isPremium: isSubscriptionPremium } = useSubscriptionContext();
  const { isPremiumTestingEnabled } = usePremiumTestingMode();

  // Check backend premium status from user profile
  const isBackendPremium =
    userProfile != null &&
    'userTier' in userProfile &&
    userProfile.userTier === UserTier.premium;

  // Premium testing mode ONLY contributes when explicitly enabled (true)
  // It must be the boolean true, not a truthy string
  const testingModeActive = isPremiumTestingEnabled === true;

  // Real premium: backend tier OR subscription context (not testing mode)
  const isRealPremium = isBackendPremium || isSubscriptionPremium;

  // Final premium status: real premium OR testing mode explicitly enabled
  const isPremium = isRealPremium || testingModeActive;

  // Only show loading state when we're waiting for real premium data
  // and testing mode is NOT active (testing mode resolves instantly from localStorage)
  const isLoading = !testingModeActive && profileLoading && !isSubscriptionPremium;

  return {
    isPremium,
    isLoading,
    isBackendPremium,
    isSubscriptionPremium,
    isPremiumTestingEnabled: testingModeActive,
    isRealPremium,
  };
}
