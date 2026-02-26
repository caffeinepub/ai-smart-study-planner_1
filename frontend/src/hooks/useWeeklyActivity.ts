/**
 * Custom hook that derives weekly study activity data (Mon–Sun of the current week)
 * from localStorage focus session logs and daily progress data.
 */

import { useMemo } from 'react';

interface DayActivity {
  day: string;
  value: number;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // shift to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function readWeeklyLog(): Record<string, number> {
  try {
    const raw = localStorage.getItem('weeklyFocusLog');
    if (raw) return JSON.parse(raw) as Record<string, number>;
  } catch {
    // ignore
  }
  return {};
}

export function logFocusMinutesForDay(minutes: number): void {
  try {
    const today = new Date().toISOString().split('T')[0];
    const log = readWeeklyLog();
    log[today] = (log[today] ?? 0) + minutes;
    localStorage.setItem('weeklyFocusLog', JSON.stringify(log));
  } catch {
    // ignore
  }
}

export function useWeeklyActivity(): DayActivity[] {
  return useMemo(() => {
    const log = readWeeklyLog();
    const weekStart = getWeekStart();

    return DAY_LABELS.map((label, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const key = getISODate(date);
      return { day: label, value: log[key] ?? 0 };
    });
  }, []);
}
