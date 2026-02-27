import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'premiumTestingMode';

function readFromStorage(): boolean {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    // Only return true for explicit 'true' string
    return value === 'true';
  } catch {
    return false;
  }
}

export function usePremiumTestingMode() {
  const [isPremiumTestingEnabled, setIsPremiumTestingEnabled] = useState<boolean>(() => readFromStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, isPremiumTestingEnabled ? 'true' : 'false');
    } catch {
      // ignore storage errors
    }
  }, [isPremiumTestingEnabled]);

  const togglePremiumTesting = useCallback((newValue?: boolean | unknown) => {
    if (typeof newValue === 'boolean') {
      setIsPremiumTestingEnabled(newValue);
    } else {
      setIsPremiumTestingEnabled(prev => !prev);
    }
  }, []);

  const setPremiumTesting = useCallback((value: boolean) => {
    setIsPremiumTestingEnabled(value);
  }, []);

  return {
    isPremiumTestingEnabled,
    togglePremiumTesting,
    setPremiumTesting,
  };
}
