import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { useActor } from '../hooks/useActor';

export function useConsolidatedPremiumStatus() {
  const { isPremium, subscription } = useSubscriptionContext();
  const { isFetching: actorFetching } = useActor();

  const isLoading = actorFetching;

  return {
    isPremium,
    isLoading,
    tier: subscription.tier,
    trialActive: subscription.trialActive,
    trialUsed: subscription.trialUsed,
    trialExpiresAt: subscription.trialExpiresAt,
    trialDaysRemaining: subscription.trialDaysRemaining,
  };
}
