import { useState, useEffect, useCallback } from 'react';
import {
  initBillingClient,
  launchBillingFlow,
  acknowledgePurchase,
  queryPurchases,
  type ProductId,
} from '../utils/googlePlayBilling';

export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';

export interface SubscriptionPlan_Info {
  id: ProductId;
  label: string;
  price: string;
  period: string;
  savingsLabel?: string;
}

export const SUBSCRIPTION_PLANS: Record<'monthly' | 'yearly', SubscriptionPlan_Info> = {
  monthly: {
    id: 'studiora_monthly',
    label: 'Monthly',
    price: '$3.99',
    period: 'per month',
  },
  yearly: {
    id: 'studiora_yearly',
    label: 'Yearly',
    price: '$29.99',
    period: 'per year',
    savingsLabel: 'Best Value',
  },
};

const PLAN_KEY = 'studiora_subscription_plan';
const PREMIUM_KEY = 'studiora_premium_status';

function readStoredPlan(): SubscriptionPlan {
  try {
    const val = localStorage.getItem(PLAN_KEY);
    if (val === 'monthly' || val === 'yearly') return val;
  } catch {
    // ignore
  }
  return 'free';
}

function readStoredPremium(): boolean {
  try {
    return localStorage.getItem(PREMIUM_KEY) === 'true';
  } catch {
    return false;
  }
}

function writePremiumState(plan: SubscriptionPlan, isPremium: boolean): void {
  try {
    localStorage.setItem(PLAN_KEY, plan);
    localStorage.setItem(PREMIUM_KEY, isPremium ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function useSubscription() {
  const [isPremium, setIsPremium] = useState<boolean>(readStoredPremium);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(readStoredPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [billingReady, setBillingReady] = useState(false);

  // Initialize billing client on mount
  useEffect(() => {
    initBillingClient()
      .then(() => setBillingReady(true))
      .catch(() => setBillingReady(false));
  }, []);

  /**
   * Restores purchases from localStorage (simulates Google Play restore flow).
   * Called automatically on mount and can be triggered manually.
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const purchases = await queryPurchases();
      if (purchases.length > 0) {
        // Find the most recent active purchase
        const sorted = [...purchases].sort((a, b) => b.purchaseTime - a.purchaseTime);
        const latest = sorted[0];
        const plan: SubscriptionPlan =
          latest.productId === 'studiora_yearly' ? 'yearly' : 'monthly';
        setIsPremium(true);
        setCurrentPlan(plan);
        writePremiumState(plan, true);
        return true;
      } else {
        // No purchases found — keep current state but don't downgrade if already premium
        return false;
      }
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-restore on mount
  useEffect(() => {
    restorePurchases();
  }, [restorePurchases]);

  /**
   * Subscribes to a plan using the Google Play Billing flow.
   * Resolves on success, throws on failure/cancellation.
   */
  const subscribeToPlan = useCallback(async (productId: ProductId): Promise<void> => {
    setIsLoading(true);
    try {
      const { purchaseToken } = await launchBillingFlow(productId);
      await acknowledgePurchase(purchaseToken);

      const plan: SubscriptionPlan =
        productId === 'studiora_yearly' ? 'yearly' : 'monthly';

      setIsPremium(true);
      setCurrentPlan(plan);
      writePremiumState(plan, true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cancels the subscription locally (does not cancel on Google Play —
   * users must manage subscriptions via the Play Store).
   */
  const cancelSubscription = useCallback((): void => {
    setIsPremium(false);
    setCurrentPlan('free');
    writePremiumState('free', false);
  }, []);

  return {
    isPremium,
    currentPlan,
    isLoading,
    billingReady,
    subscribeToPlan,
    restorePurchases,
    cancelSubscription,
  };
}
