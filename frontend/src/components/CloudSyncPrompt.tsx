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
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface CloudSyncPromptProps {
  open: boolean;
  onClose: () => void;
}

export default function CloudSyncPrompt({ open, onClose }: CloudSyncPromptProps) {
  const { login, loginStatus } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
      onClose();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cloud Sync Requires Login</DialogTitle>
          <DialogDescription>
            To sync your study data to the cloud, you need to log in with Internet Identity.
            Your local progress will be preserved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Not Now
          </Button>
          <Button
            onClick={handleLogin}
            disabled={loginStatus === 'logging-in'}
          >
            {loginStatus === 'logging-in' ? 'Logging in...' : 'Login Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
