import { useState, useEffect } from 'react';

const STORAGE_KEY = 'premiumTestingMode';

export function usePremiumTestingMode() {
  const [isPremiumTestingEnabled, setIsPremiumTestingEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isPremiumTestingEnabled));
    } catch {
      // ignore
    }
  }, [isPremiumTestingEnabled]);

  const togglePremiumTesting = () => {
    setIsPremiumTestingEnabled(prev => !prev);
  };

  return { isPremiumTestingEnabled, togglePremiumTesting };
}
