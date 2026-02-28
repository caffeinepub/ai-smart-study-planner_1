import React, { createContext, useContext } from 'react';
import { useSubscription, SubscriptionProvider } from '../hooks/useSubscription';

const SubscriptionContext = createContext<SubscriptionProvider | null>(null);

export function SubscriptionProviderComponent({ children }: { children: React.ReactNode }) {
  const subscription = useSubscription();
  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext(): SubscriptionProvider {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProviderComponent');
  }
  return context;
}
