import { useState } from 'react';
import { useGuestMode } from './useGuestMode';

export function useCloudSync() {
  const { isGuestMode } = useGuestMode();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(() => {
    const raw = localStorage.getItem('lastSynced');
    return raw ? new Date(raw) : null;
  });

  const triggerSync = async () => {
    if (isGuestMode) {
      setShowPrompt(true);
      return;
    }
    setIsSyncing(true);
    try {
      // Future: call backend sync endpoint
      await new Promise((r) => setTimeout(r, 1000));
      const now = new Date();
      localStorage.setItem('lastSynced', now.toISOString());
      setLastSynced(now);
    } finally {
      setIsSyncing(false);
    }
  };

  const dismissPrompt = () => setShowPrompt(false);

  return { triggerSync, isSyncing, lastSynced, showPrompt, dismissPrompt };
}
