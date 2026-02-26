import React, { createContext, useContext, ReactNode } from 'react';
import type { SubscriptionProvider, SubscriptionStatus } from '../hooks/useSubscription';
import { useSubscription } from '../hooks/useSubscription';

interface SubscriptionContextValue {
  provider: SubscriptionProvider;
  status: SubscriptionStatus;
  isPremium: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const subscription = useSubscription();
  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscriptionContext must be used within SubscriptionProvider');
  return ctx;
}
