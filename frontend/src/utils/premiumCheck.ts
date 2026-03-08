import { useSubscriptionContext } from '../contexts/SubscriptionContext';

/**
 * Consolidated hook for checking premium status across the app.
 * Derives isPremium from the SubscriptionContext (Google Play Billing state).
 */
export function useConsolidatedPremiumStatus() {
  const { isPremium, currentPlan, isLoading } = useSubscriptionContext();

  return {
    isPremium,
    currentPlan,
    isLoading,
    // Legacy compatibility fields
    trialActive: false,
    trialUsed: false,
    trialExpiresAt: null as Date | null,
    trialDaysRemaining: 0,
  };
}
