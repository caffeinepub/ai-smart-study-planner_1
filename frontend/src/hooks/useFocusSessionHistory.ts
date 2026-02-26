import { useState, useCallback } from 'react';

export interface FocusSession {
  id: string;
  timestamp: number;
  durationSeconds: number;
  phase: 'work' | 'break';
}

const HISTORY_KEY = 'focusSessionHistory';
const MAX_SESSIONS = 10;

function loadSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FocusSession[];
  } catch {
    return [];
  }
}

function saveSessions(sessions: FocusSession[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
}

export function useFocusSessionHistory() {
  const [sessions, setSessions] = useState<FocusSession[]>(loadSessions);

  const addSession = useCallback((session: Omit<FocusSession, 'id'>) => {
    const newSession: FocusSession = {
      ...session,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };
    setSessions((prev) => {
      const updated = [newSession, ...prev].slice(0, MAX_SESSIONS);
      saveSessions(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setSessions([]);
  }, []);

  return { sessions, addSession, clearHistory };
}
