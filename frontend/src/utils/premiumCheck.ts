import { useGetCallerUserProfile } from '../hooks/useQueries';
import { usePremiumTestingMode } from '../hooks/usePremiumTestingMode';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';

/**
 * Consolidated premium status hook.
 * Checks all three sources: backend profile UserTier, SubscriptionContext isPremium,
 * and usePremiumTestingMode. Returns isPremium=true if ANY source confirms premium.
 * Also returns isLoading so callers can defer gating until the status is known.
 */
export function useConsolidatedPremiumStatus() {
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { isPremiumTestingEnabled } = usePremiumTestingMode();
  const { isPremium: isSubscriptionPremium } = useSubscriptionContext();

  const isBackendPremium = userProfile?.userTier === 'premium';
  const isPremium = isPremiumTestingEnabled || isBackendPremium || isSubscriptionPremium;

  // Consider loading if the profile hasn't been fetched yet and we're not using
  // a local override (testing mode or subscription context already confirmed premium)
  const isLoading = profileLoading && !isPremiumTestingEnabled && !isSubscriptionPremium;

  return {
    isPremium,
    isLoading,
    isFetched,
    isBackendPremium,
    isSubscriptionPremium,
    isPremiumTestingEnabled,
  };
}
