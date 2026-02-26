/**
 * Custom hook for managing focus session statistics in localStorage.
 * Tracks total focus minutes and session count, persisted across reloads.
 */

import { useState, useCallback } from 'react';

const TOTAL_MINUTES_KEY = 'focusTotalMinutes';
const SESSION_COUNT_KEY = 'focusSessionCount';

function readNumber(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const n = parseInt(raw, 10);
      return isNaN(n) ? 0 : n;
    }
  } catch {
    // ignore
  }
  return 0;
}

function writeNumber(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
}

function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

export function useFocusStats() {
  const [focusTotalMinutes, setFocusTotalMinutes] = useState<number>(() =>
    readNumber(TOTAL_MINUTES_KEY)
  );
  const [focusSessionCount, setFocusSessionCount] = useState<number>(() =>
    readNumber(SESSION_COUNT_KEY)
  );

  const addFocusMinutes = useCallback((minutes: number) => {
    setFocusTotalMinutes((prev) => {
      const next = prev + minutes;
      writeNumber(TOTAL_MINUTES_KEY, next);
      return next;
    });
  }, []);

  const incrementSessionCount = useCallback(() => {
    setFocusSessionCount((prev) => {
      const next = prev + 1;
      writeNumber(SESSION_COUNT_KEY, next);
      return next;
    });
  }, []);

  return {
    focusTotalMinutes,
    focusSessionCount,
    formattedTime: formatMinutes(focusTotalMinutes),
    addFocusMinutes,
    incrementSessionCount,
  };
}
