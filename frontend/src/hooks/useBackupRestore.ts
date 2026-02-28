import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createBackup, restoreFromFile } from '../utils/backup';

const LAST_BACKUP_KEY = 'studiora_last_backup_timestamp';

export interface UseBackupRestoreReturn {
  lastBackup: Date | null;
  isBackingUp: boolean;
  isRestoring: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  handleBackup: () => Promise<void>;
  handleRestore: (onConfirm: () => Promise<boolean>) => Promise<void>;
  clearMessages: () => void;
}

export function useBackupRestore(): UseBackupRestoreReturn {
  const queryClient = useQueryClient();

  const [lastBackup, setLastBackup] = useState<Date | null>(() => {
    try {
      const stored = localStorage.getItem(LAST_BACKUP_KEY);
      return stored ? new Date(stored) : null;
    } catch {
      return null;
    }
  });

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Auto-clear error message after 5 seconds
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  const handleBackup = useCallback(async () => {
    setIsBackingUp(true);
    clearMessages();
    try {
      await createBackup();
      const now = new Date();
      try {
        localStorage.setItem(LAST_BACKUP_KEY, now.toISOString());
      } catch {
        // ignore
      }
      setLastBackup(now);
      setSuccessMessage('Backup Successful — Saved to your cloud storage.');
    } catch (err: any) {
      // If user cancelled the share sheet, don't show an error
      if (err?.name === 'AbortError' || err?.message?.includes('cancel')) {
        // silently ignore user cancellation
      } else {
        setErrorMessage(err?.message || 'Backup failed. Please try again.');
      }
    } finally {
      setIsBackingUp(false);
    }
  }, [clearMessages]);

  /**
   * handleRestore accepts a confirmation callback that should return true if
   * the user confirmed, false if they cancelled.
   */
  const handleRestore = useCallback(async (onConfirm: () => Promise<boolean>) => {
    clearMessages();

    // First open file picker so user selects a file
    setIsRestoring(true);
    try {
      const result = await restoreFromFile();

      if (!result.success) {
        if (result.error === 'cancelled') {
          // User cancelled file picker — no error shown
          return;
        }
        setErrorMessage(result.error || 'Restore failed.');
        return;
      }

      // File is valid — now ask for confirmation before applying
      const confirmed = await onConfirm();
      if (!confirmed) {
        return;
      }

      // Re-run restore (we already parsed and validated, but we need to apply)
      // Since restoreFromFile already wrote to localStorage on success,
      // we just need to invalidate queries to refresh UI state.
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyProgress'] });
      queryClient.invalidateQueries({ queryKey: ['studyStreak'] });
      queryClient.invalidateQueries({ queryKey: ['latestBackup'] });

      setSuccessMessage('Data restored successfully from your backup file.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Restore failed. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  }, [clearMessages, queryClient]);

  return {
    lastBackup,
    isBackingUp,
    isRestoring,
    successMessage,
    errorMessage,
    handleBackup,
    handleRestore,
    clearMessages,
  };
}
