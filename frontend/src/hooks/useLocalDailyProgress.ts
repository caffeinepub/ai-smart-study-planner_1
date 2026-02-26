/**
 * Custom hook that calculates and persists daily progress percentage in localStorage.
 * Accepts today's tasks and computes (completedToday / totalToday) * 100.
 */

import { useMemo, useEffect } from 'react';
import { DailyTask } from '../backend';

interface DailyProgressData {
  date: string; // ISO date YYYY-MM-DD
  percentage: number;
  completedCount: number;
  totalCount: number;
}

const STORAGE_KEY = 'dailyProgress';

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function loadProgressData(): DailyProgressData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DailyProgressData;
  } catch {
    // ignore
  }
  return null;
}

function saveProgressData(data: DailyProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function useLocalDailyProgress(tasks: DailyTask[]) {
  const today = getTodayISO();

  const { percentage, completedCount, totalCount } = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const pct = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));
    return { percentage: pct, completedCount: completed, totalCount: total };
  }, [tasks]);

  useEffect(() => {
    const stored = loadProgressData();
    // Reset if date changed
    if (!stored || stored.date !== today) {
      saveProgressData({ date: today, percentage, completedCount, totalCount });
    } else {
      saveProgressData({ date: today, percentage, completedCount, totalCount });
    }
  }, [today, percentage, completedCount, totalCount]);

  return { percentage, completedCount, totalCount };
}
