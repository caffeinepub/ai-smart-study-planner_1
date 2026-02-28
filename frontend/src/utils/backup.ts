/**
 * Local file-based backup and restore utilities for Studiora.
 * All data stays on the user's device / their chosen cloud storage.
 * No data is sent to any server.
 */

export interface StudiorBackupPayload {
  version: number;
  createdAt: string; // ISO string
  // Study plans (guest exams stored per deviceId)
  guestExams?: Record<string, any[]>;
  // Streak
  localStudyStreak?: any;
  // Daily progress
  localDailyProgress?: any;
  // Companion state
  studyCompanion?: any;
  // Theme
  theme?: string;
  themePreset?: string;
  // Subscription (local state only — not payment info)
  subscriptionTier?: string;
  subscriptionIsActive?: string;
  trialStartTimestamp?: string;
  trialUsed?: string;
  // Focus session history
  focusSessionHistory?: any;
  // Display name
  userDisplayName?: string;
  // Paywall dismissal
  paywallDismissed?: string;
}

const BACKUP_VERSION = 1;

// All localStorage keys we back up
const BACKUP_KEYS: Array<{ key: string; field: keyof StudiorBackupPayload }> = [
  { key: 'local_study_streak', field: 'localStudyStreak' },
  { key: 'local_daily_progress', field: 'localDailyProgress' },
  { key: 'study_companion', field: 'studyCompanion' },
  { key: 'study-planner-theme', field: 'theme' },
  { key: 'app_theme_preset', field: 'themePreset' },
  { key: 'subscription_tier', field: 'subscriptionTier' },
  { key: 'subscription_is_active', field: 'subscriptionIsActive' },
  { key: 'trial_start_timestamp', field: 'trialStartTimestamp' },
  { key: 'trial_used', field: 'trialUsed' },
  { key: 'focus_session_history', field: 'focusSessionHistory' },
  { key: 'user_display_name', field: 'userDisplayName' },
  { key: 'paywall_dismissed', field: 'paywallDismissed' },
];

function collectGuestExams(): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('guest_exams_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            result[key] = JSON.parse(raw);
          } catch {
            // skip corrupted entry
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return result;
}

function readLocalStorageValue(key: string): any {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return raw; // return as plain string if not JSON
    }
  } catch {
    return undefined;
  }
}

/**
 * Creates a backup JSON file and triggers the Web Share API (if supported)
 * or falls back to a direct file download.
 */
export async function createBackup(): Promise<void> {
  const payload: StudiorBackupPayload = {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    guestExams: collectGuestExams(),
  };

  for (const { key, field } of BACKUP_KEYS) {
    const value = readLocalStorageValue(key);
    if (value !== undefined) {
      (payload as any)[field] = value;
    }
  }

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const filename = 'studiora_backup.json';

  // Try Web Share API first (mobile / modern browsers)
  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [new File([blob], filename, { type: 'application/json' })] })
  ) {
    const file = new File([blob], filename, { type: 'application/json' });
    await navigator.share({
      title: 'Studiora Backup',
      text: 'My Studiora study data backup',
      files: [file],
    });
    return;
  }

  // Fallback: programmatic download
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export interface RestoreResult {
  success: boolean;
  error?: string;
}

/**
 * Opens a file picker, validates the selected backup file, and restores
 * all app state from it. Returns a promise that resolves with the result.
 * The caller is responsible for showing a confirmation dialog before calling this.
 */
export function restoreFromFile(): Promise<RestoreResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = async () => {
      const file = input.files?.[0];
      document.body.removeChild(input);

      if (!file) {
        resolve({ success: false, error: 'No file selected.' });
        return;
      }

      try {
        const text = await file.text();
        let payload: StudiorBackupPayload;

        try {
          payload = JSON.parse(text);
        } catch {
          resolve({ success: false, error: 'Invalid backup file — could not parse JSON.' });
          return;
        }

        // Basic validation
        if (!payload || typeof payload !== 'object' || !payload.version || !payload.createdAt) {
          resolve({ success: false, error: 'Invalid backup file — missing required fields.' });
          return;
        }

        // Restore guest exams
        if (payload.guestExams && typeof payload.guestExams === 'object') {
          for (const [key, value] of Object.entries(payload.guestExams)) {
            if (key.startsWith('guest_exams_')) {
              try {
                localStorage.setItem(key, JSON.stringify(value));
              } catch {
                // ignore storage errors
              }
            }
          }
        }

        // Restore all other keys
        for (const { key, field } of BACKUP_KEYS) {
          const value = (payload as any)[field];
          if (value !== undefined) {
            try {
              const toStore = typeof value === 'string' ? value : JSON.stringify(value);
              localStorage.setItem(key, toStore);
            } catch {
              // ignore storage errors
            }
          }
        }

        resolve({ success: true });
      } catch (err: any) {
        resolve({ success: false, error: err?.message || 'Failed to restore backup.' });
      }
    };

    input.oncancel = () => {
      document.body.removeChild(input);
      resolve({ success: false, error: 'cancelled' });
    };

    // Trigger the file picker
    document.body.appendChild(input);
    input.click();
  });
}
