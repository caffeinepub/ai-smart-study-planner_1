/**
 * Custom hook that tracks whether the celebration animation should be shown.
 * Triggers once per day when progress reaches 100%.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'celebrationShownDate';

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function useCelebrationTrigger(percentage: number) {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (percentage < 100) return;

    const today = getTodayISO();
    const shownDate = localStorage.getItem(STORAGE_KEY);

    if (shownDate !== today) {
      setShowCelebration(true);
    }
  }, [percentage]);

  const dismissCelebration = useCallback(() => {
    const today = getTodayISO();
    try {
      localStorage.setItem(STORAGE_KEY, today);
    } catch {
      // ignore
    }
    setShowCelebration(false);
  }, []);

  return { showCelebration, dismissCelebration };
}
