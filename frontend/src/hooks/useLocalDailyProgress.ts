import { useState, useEffect, useCallback } from 'react';

interface DailyProgressData {
  date: string;
  completedCount: number;
  totalCount: number;
}

const STORAGE_KEY = 'local_daily_progress';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function loadProgressData(): DailyProgressData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { date: getToday(), completedCount: 0, totalCount: 0 };
    const parsed = JSON.parse(stored);
    const today = getToday();
    // Reset if it's a new day
    if (parsed.date !== today) {
      return { date: today, completedCount: 0, totalCount: 0 };
    }
    return {
      date: typeof parsed.date === 'string' ? parsed.date : today,
      completedCount: typeof parsed.completedCount === 'number' ? parsed.completedCount : 0,
      totalCount: typeof parsed.totalCount === 'number' ? parsed.totalCount : 0,
    };
  } catch {
    return { date: getToday(), completedCount: 0, totalCount: 0 };
  }
}

function saveProgressData(data: DailyProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export function useLocalDailyProgress() {
  const [progressData, setProgressData] = useState<DailyProgressData>(() => loadProgressData());

  // Re-check on mount in case the day changed
  useEffect(() => {
    try {
      const data = loadProgressData();
      setProgressData(data);
    } catch {
      setProgressData({ date: getToday(), completedCount: 0, totalCount: 0 });
    }
  }, []);

  const updateProgress = useCallback((completedCount: number, totalCount: number) => {
    try {
      const updated: DailyProgressData = {
        date: getToday(),
        completedCount: Math.max(0, completedCount),
        totalCount: Math.max(0, totalCount),
      };
      saveProgressData(updated);
      setProgressData(updated);
    } catch {
      // Ignore errors
    }
  }, []);

  const percentage =
    progressData.totalCount > 0
      ? Math.round((progressData.completedCount / progressData.totalCount) * 100)
      : 0;

  return {
    percentage,
    completedCount: progressData.completedCount,
    totalCount: progressData.totalCount,
    updateProgress,
  };
}
