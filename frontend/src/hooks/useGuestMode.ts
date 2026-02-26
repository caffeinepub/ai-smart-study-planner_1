import { useState, useCallback } from 'react';

const GUEST_MODE_KEY = 'guestMode';
const GUEST_DEVICE_ID_KEY = 'guestDeviceId';

function generateDeviceId(): string {
  return 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function initGuestMode(): boolean {
  // If already explicitly set, respect that value
  const stored = localStorage.getItem(GUEST_MODE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }
  // Default: automatically activate guest mode and persist device ID
  if (!localStorage.getItem(GUEST_DEVICE_ID_KEY)) {
    localStorage.setItem(GUEST_DEVICE_ID_KEY, generateDeviceId());
  }
  localStorage.setItem(GUEST_MODE_KEY, 'true');
  return true;
}

export function useGuestMode() {
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => initGuestMode());

  const getDeviceId = useCallback((): string => {
    let deviceId = localStorage.getItem(GUEST_DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = generateDeviceId();
      localStorage.setItem(GUEST_DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }, []);

  const enterGuestMode = useCallback(() => {
    if (!localStorage.getItem(GUEST_DEVICE_ID_KEY)) {
      localStorage.setItem(GUEST_DEVICE_ID_KEY, generateDeviceId());
    }
    localStorage.setItem(GUEST_MODE_KEY, 'true');
    setIsGuestMode(true);
  }, []);

  const exitGuestMode = useCallback(() => {
    localStorage.removeItem(GUEST_MODE_KEY);
    setIsGuestMode(false);
  }, []);

  const deviceId = getDeviceId();

  return { isGuestMode, enterGuestMode, exitGuestMode, deviceId };
}
