import { useGuestMode } from './useGuestMode';

export interface CloudSyncResult {
  synced: boolean;
  showPrompt: boolean;
}

export function useCloudSync() {
  const { isGuestMode } = useGuestMode();

  const syncData = (): CloudSyncResult => {
    if (isGuestMode) {
      return { synced: false, showPrompt: true };
    }
    return { synced: true, showPrompt: false };
  };

  return { syncData, isGuestMode };
}
