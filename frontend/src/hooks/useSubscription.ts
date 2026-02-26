import { useState, useCallback } from 'react';

export type SubscriptionTier = 'free' | 'trial' | 'monthly' | 'yearly';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;
  trialEndsAt?: Date;
  renewsAt?: Date;
}

export interface SubscriptionProvider {
  startFreeTrial(): Promise<void>;
  subscribeMonthly(): Promise<void>;
  subscribeYearly(): Promise<void>;
  cancelSubscription(): Promise<void>;
  getSubscriptionStatus(): Promise<SubscriptionStatus>;
}

const SUBSCRIPTION_KEY = 'subscriptionStatus';

function loadStatus(): SubscriptionStatus {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        trialEndsAt: parsed.trialEndsAt ? new Date(parsed.trialEndsAt) : undefined,
        renewsAt: parsed.renewsAt ? new Date(parsed.renewsAt) : undefined,
      };
    }
  } catch {
    // ignore
  }
  return { tier: 'free', isActive: false };
}

function saveStatus(status: SubscriptionStatus) {
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(status));
}

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>(loadStatus);

  const updateStatus = useCallback((newStatus: SubscriptionStatus) => {
    saveStatus(newStatus);
    setStatus(newStatus);
  }, []);

  const provider: SubscriptionProvider = {
    async startFreeTrial() {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      updateStatus({ tier: 'trial', isActive: true, trialEndsAt });
    },
    async subscribeMonthly() {
      const renewsAt = new Date();
      renewsAt.setMonth(renewsAt.getMonth() + 1);
      updateStatus({ tier: 'monthly', isActive: true, renewsAt });
    },
    async subscribeYearly() {
      const renewsAt = new Date();
      renewsAt.setFullYear(renewsAt.getFullYear() + 1);
      updateStatus({ tier: 'yearly', isActive: true, renewsAt });
    },
    async cancelSubscription() {
      updateStatus({ tier: 'free', isActive: false });
    },
    async getSubscriptionStatus() {
      return status;
    },
  };

  const isPremium = status.tier !== 'free' && status.isActive;

  return { provider, status, isPremium };
}
