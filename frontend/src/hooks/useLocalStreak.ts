import { useState, useEffect, useCallback } from 'react';

interface StreakData {
  currentStreak: number;
  lastActiveDate: string | null;
  longestStreak: number;
}

const STORAGE_KEY = 'local_study_streak';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function loadStreakData(): StreakData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { currentStreak: 0, lastActiveDate: null, longestStreak: 0 };
    const parsed = JSON.parse(stored);
    return {
      currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0,
      lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : null,
      longestStreak: typeof parsed.longestStreak === 'number' ? parsed.longestStreak : 0,
    };
  } catch {
    return { currentStreak: 0, lastActiveDate: null, longestStreak: 0 };
  }
}

function saveStreakData(data: StreakData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export function useLocalStreak() {
  const [streakData, setStreakData] = useState<StreakData>(() => loadStreakData());

  // Check and reset streak if a day was missed
  const checkAndResetStreak = useCallback(() => {
    try {
      const data = loadStreakData();
      const today = getToday();
      const yesterday = getYesterday();

      if (
        data.lastActiveDate !== null &&
        data.lastActiveDate !== today &&
        data.lastActiveDate !== yesterday
      ) {
        // Streak broken — more than one day gap
        const reset: StreakData = { ...data, currentStreak: 0 };
        saveStreakData(reset);
        setStreakData(reset);
      } else {
        setStreakData(data);
      }
    } catch {
      setStreakData({ currentStreak: 0, lastActiveDate: null, longestStreak: 0 });
    }
  }, []);

  useEffect(() => {
    checkAndResetStreak();
  }, [checkAndResetStreak]);

  const incrementStreak = useCallback(() => {
    try {
      const data = loadStreakData();
      const today = getToday();

      if (data.lastActiveDate === today) return; // Already counted today

      const newStreak = data.currentStreak + 1;
      const updated: StreakData = {
        currentStreak: newStreak,
        lastActiveDate: today,
        longestStreak: Math.max(newStreak, data.longestStreak),
      };
      saveStreakData(updated);
      setStreakData(updated);
    } catch {
      // Ignore errors
    }
  }, []);

  return {
    ...streakData,
    incrementStreak,
    checkAndResetStreak,
  };
}
