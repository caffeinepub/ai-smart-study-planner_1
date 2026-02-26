import { useState, useCallback } from 'react';

const PAYWALL_DISMISSED_KEY = 'paywallDismissed';
const TASK_COMPLETED_KEY = 'hasCompletedTask';

export function usePaywallTrigger() {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem(PAYWALL_DISMISSED_KEY) === 'true';
  });

  const [hasCompletedTask, setHasCompletedTask] = useState<boolean>(() => {
    return localStorage.getItem(TASK_COMPLETED_KEY) === 'true';
  });

  const markTaskCompleted = useCallback(() => {
    if (!hasCompletedTask) {
      localStorage.setItem(TASK_COMPLETED_KEY, 'true');
      setHasCompletedTask(true);
    }
  }, [hasCompletedTask]);

  const dismissPaywall = useCallback(() => {
    localStorage.setItem(PAYWALL_DISMISSED_KEY, 'true');
    setDismissed(true);
  }, []);

  const resetPaywallDismissal = useCallback(() => {
    localStorage.removeItem(PAYWALL_DISMISSED_KEY);
    setDismissed(false);
  }, []);

  // Show paywall only after a task has been completed and it hasn't been dismissed
  const shouldShowPaywall = hasCompletedTask && !dismissed;

  return { shouldShowPaywall, markTaskCompleted, dismissPaywall, resetPaywallDismissal, hasCompletedTask };
}
