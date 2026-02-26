import { useState, useCallback } from 'react';

const DISPLAY_NAME_KEY = 'user_display_name';

export function useLocalProfile() {
  const [displayName, setDisplayNameState] = useState<string>(() => {
    return localStorage.getItem(DISPLAY_NAME_KEY) ?? '';
  });

  const setDisplayName = useCallback((name: string) => {
    const trimmed = name.trim();
    localStorage.setItem(DISPLAY_NAME_KEY, trimmed);
    setDisplayNameState(trimmed);
  }, []);

  return { displayName, setDisplayName };
}
