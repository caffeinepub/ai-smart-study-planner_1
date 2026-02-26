import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Cloud, LogIn } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGuestMode } from '../hooks/useGuestMode';
import { useGuestToAuthMigration } from '../hooks/useGuestToAuthMigration';

interface CloudSyncPromptProps {
  open: boolean;
  onClose: () => void;
}

export default function CloudSyncPrompt({ open, onClose }: CloudSyncPromptProps) {
  const { login, loginStatus } = useInternetIdentity();
  const { exitGuestMode } = useGuestMode();
  const { migrateGuestToAuth } = useGuestToAuthMigration();
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
      await migrateGuestToAuth();
      exitGuestMode();
      onClose();
    } catch (err) {
      // ignore
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle>Login Required for Cloud Sync</DialogTitle>
          </div>
          <DialogDescription>
            Cloud backup and sync keeps your study plans safe and accessible across all your devices.
            You need to sign in with Internet Identity to enable this feature.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-2 text-sm text-muted-foreground">
          <p>✓ Automatic cloud backup</p>
          <p>✓ Sync across all devices</p>
          <p>✓ Never lose your study progress</p>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleLogin} disabled={isLoggingIn} className="w-full gap-2">
            <LogIn className="w-4 h-4" />
            {isLoggingIn ? 'Signing in...' : 'Login Now'}
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Not Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
