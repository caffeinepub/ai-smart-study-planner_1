import { useCallback } from 'react';
import { useGuestMode } from './useGuestMode';

export function useGuestToAuthMigration() {
  const { isGuestMode, exitGuestMode, deviceId } = useGuestMode();

  const migrateGuestToAuth = useCallback(async () => {
    if (!isGuestMode) return;
    // Clear guest mode flag - the authenticated user's data takes precedence
    exitGuestMode();
    // Future: could merge local guest data to authenticated backend profile
  }, [isGuestMode, exitGuestMode]);

  return { migrateGuestToAuth, deviceId };
}
