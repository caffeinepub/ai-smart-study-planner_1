import { useState, useEffect, useCallback } from 'react';

export type SubscriptionTier = 'free' | 'trial' | 'monthly' | 'yearly';

export interface SubscriptionState {
  tier: SubscriptionTier;
  isActive: boolean;
  trialActive: boolean;
  trialUsed: boolean;
  trialExpiresAt: Date | null;
  trialDaysRemaining: number;
}

export interface SubscriptionProvider {
  subscription: SubscriptionState;
  subscribe: (plan: 'monthly' | 'yearly') => Promise<void>;
  startTrial: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  isPremium: boolean;
}

const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

const STORAGE_KEYS = {
  TIER: 'subscription_tier',
  IS_ACTIVE: 'subscription_is_active',
  TRIAL_START: 'trial_start_timestamp',
  TRIAL_USED: 'trial_used',
};

function computeTrialStatus(): { trialActive: boolean; trialUsed: boolean; trialExpiresAt: Date | null; trialDaysRemaining: number } {
  const trialUsed = localStorage.getItem(STORAGE_KEYS.TRIAL_USED) === 'true';
  const trialStartStr = localStorage.getItem(STORAGE_KEYS.TRIAL_START);

  if (!trialStartStr) {
    return { trialActive: false, trialUsed, trialExpiresAt: null, trialDaysRemaining: 0 };
  }

  const trialStart = parseInt(trialStartStr, 10);
  const trialEnd = trialStart + TRIAL_DURATION_MS;
  const now = Date.now();
  const trialExpiresAt = new Date(trialEnd);

  if (now < trialEnd) {
    const msRemaining = trialEnd - now;
    const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
    return { trialActive: true, trialUsed: true, trialExpiresAt, trialDaysRemaining: daysRemaining };
  } else {
    return { trialActive: false, trialUsed: true, trialExpiresAt, trialDaysRemaining: 0 };
  }
}

export function useSubscription(): SubscriptionProvider {
  const [tier, setTier] = useState<SubscriptionTier>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.TIER) as SubscriptionTier | null;
    return stored || 'free';
  });

  const [isActive, setIsActive] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.IS_ACTIVE) === 'true';
  });

  const [trialStatus, setTrialStatus] = useState(() => computeTrialStatus());

  // On mount and periodically, check if trial has expired
  useEffect(() => {
    const checkExpiry = () => {
      const status = computeTrialStatus();
      setTrialStatus(status);

      // If trial was active but now expired, revert to free
      const currentTier = localStorage.getItem(STORAGE_KEYS.TIER) as SubscriptionTier | null;
      if (currentTier === 'trial' && !status.trialActive) {
        localStorage.setItem(STORAGE_KEYS.TIER, 'free');
        localStorage.removeItem(STORAGE_KEYS.IS_ACTIVE);
        setTier('free');
        setIsActive(false);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, []);

  const subscribe = useCallback(async (plan: 'monthly' | 'yearly') => {
    // Simulated subscription — in production this would go through payment
    localStorage.setItem(STORAGE_KEYS.TIER, plan);
    localStorage.setItem(STORAGE_KEYS.IS_ACTIVE, 'true');
    setTier(plan);
    setIsActive(true);
  }, []);

  const startTrial = useCallback(async () => {
    const status = computeTrialStatus();
    if (status.trialUsed) {
      throw new Error('Trial has already been used.');
    }

    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.TRIAL_START, now.toString());
    localStorage.setItem(STORAGE_KEYS.TRIAL_USED, 'true');
    localStorage.setItem(STORAGE_KEYS.TIER, 'trial');
    localStorage.setItem(STORAGE_KEYS.IS_ACTIVE, 'true');

    setTier('trial');
    setIsActive(true);
    setTrialStatus(computeTrialStatus());
  }, []);

  const cancelSubscription = useCallback(async () => {
    localStorage.setItem(STORAGE_KEYS.TIER, 'free');
    localStorage.removeItem(STORAGE_KEYS.IS_ACTIVE);
    setTier('free');
    setIsActive(false);
  }, []);

  const isPremium = (tier === 'monthly' || tier === 'yearly' || tier === 'trial') && isActive && (tier !== 'trial' || trialStatus.trialActive);

  const subscription: SubscriptionState = {
    tier,
    isActive,
    trialActive: trialStatus.trialActive,
    trialUsed: trialStatus.trialUsed,
    trialExpiresAt: trialStatus.trialExpiresAt,
    trialDaysRemaining: trialStatus.trialDaysRemaining,
  };

  return {
    subscription,
    subscribe,
    startTrial,
    cancelSubscription,
    isPremium,
  };
}
