/**
 * Custom hook for managing daily study streak in localStorage.
 * Tracks consecutive days where at least one task was completed.
 */

import { useState, useCallback } from 'react';

interface StreakData {
  count: number;
  lastCompletionDate: string | null; // ISO date string YYYY-MM-DD
}

const STORAGE_KEY = 'studyStreak';

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function loadStreakData(): StreakData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StreakData;
      return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return { count: 0, lastCompletionDate: null };
}

function saveStreakData(data: StreakData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function useLocalStreak() {
  const [streakData, setStreakData] = useState<StreakData>(() => loadStreakData());

  /**
   * Call on mount to reset streak if a day was missed.
   */
  const checkAndResetStreak = useCallback(() => {
    const data = loadStreakData();
    const today = getTodayISO();
    const yesterday = getYesterdayISO();

    // If last completion was neither today nor yesterday, reset streak
    if (
      data.lastCompletionDate !== null &&
      data.lastCompletionDate !== today &&
      data.lastCompletionDate !== yesterday
    ) {
      const reset: StreakData = { count: 0, lastCompletionDate: data.lastCompletionDate };
      saveStreakData(reset);
      setStreakData(reset);
    } else {
      setStreakData(data);
    }
  }, []);

  /**
   * Call when a task is completed. Increments streak if this is the first
   * completion on a new calendar day.
   */
  const incrementStreak = useCallback(() => {
    const today = getTodayISO();
    const data = loadStreakData();

    // Already incremented today — no-op
    if (data.lastCompletionDate === today) return;

    const yesterday = getYesterdayISO();
    const newCount =
      data.lastCompletionDate === yesterday ? data.count + 1 : 1;

    const updated: StreakData = { count: newCount, lastCompletionDate: today };
    saveStreakData(updated);
    setStreakData(updated);
  }, []);

  return {
    streak: streakData.count,
    incrementStreak,
    checkAndResetStreak,
  };
}
