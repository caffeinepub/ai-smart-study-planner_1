import React, { createContext, useContext, useEffect } from 'react';
import { useSubscription, type SubscriptionPlan } from '../hooks/useSubscription';
import { queryPurchases } from '../utils/googlePlayBilling';
import type { ProductId } from '../utils/googlePlayBilling';

interface SubscriptionContextValue {
  isPremium: boolean;
  currentPlan: SubscriptionPlan;
  isLoading: boolean;
  billingReady: boolean;
  subscribeToPlan: (productId: ProductId) => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  cancelSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProviderComponent({ children }: { children: React.ReactNode }) {
  const subscription = useSubscription();

  // On provider mount, query Google Play purchases and restore premium state
  useEffect(() => {
    queryPurchases().then((purchases) => {
      if (purchases.length > 0) {
        subscription.restorePurchases();
      }
    }).catch(() => {
      // Silently ignore billing errors on init
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscriptionContext must be used within SubscriptionProviderComponent');
  }
  return ctx;
}

export default SubscriptionContext;
