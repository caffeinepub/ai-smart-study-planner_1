import React, { useState, useCallback } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';
import { useGuestMode } from '../hooks/useGuestMode';
import { useTheme } from '../hooks/useTheme';
import { useLocalProfile } from '../hooks/useLocalProfile';
import { useBackupRestore } from '../hooks/useBackupRestore';
import { useQueryClient } from '@tanstack/react-query';
import ThemeSelectorSection from '../components/ThemeSelectorSection';
import PaywallScreen from '../components/PaywallScreen';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  User,
  Moon,
  Sun,
  LogOut,
  LogIn,
  Crown,
  Star,
  Cloud,
  CloudDownload,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Settings() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  // Fixed: destructure only what exists in the new SubscriptionContext (no 'subscription' object)
  const { isPremium: ctxIsPremium, currentPlan, cancelSubscription } = useSubscriptionContext();
  const { isPremium } = useConsolidatedPremiumStatus();
  const { isGuestMode } = useGuestMode();
  const { theme, toggleTheme } = useTheme();
  const { displayName, setDisplayName } = useLocalProfile();
  const queryClient = useQueryClient();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName || '');
  const [showPaywall, setShowPaywall] = useState(false);

  // Restore confirmation dialog state
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreConfirmResolve, setRestoreConfirmResolve] = useState<((v: boolean) => void) | null>(null);

  const isAuthenticated = !!identity;
  const isDark = theme === 'dark';

  const {
    lastBackup,
    isBackingUp,
    isRestoring,
    successMessage,
    errorMessage,
    handleBackup,
    handleRestore,
  } = useBackupRestore();

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setDisplayName(nameInput.trim());
    }
    setEditingName(false);
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (e) {
      console.error(e);
    }
  };

  // Confirmation dialog promise-based handler
  const confirmRestore = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      setRestoreConfirmResolve(() => resolve);
      setShowRestoreConfirm(true);
    });
  }, []);

  const handleRestoreConfirm = () => {
    setShowRestoreConfirm(false);
    restoreConfirmResolve?.(true);
    setRestoreConfirmResolve(null);
  };

  const handleRestoreCancel = () => {
    setShowRestoreConfirm(false);
    restoreConfirmResolve?.(false);
    setRestoreConfirmResolve(null);
  };

  const onRestoreClick = () => {
    handleRestore(confirmRestore);
  };

  // Derive subscription label from currentPlan (replaces old subscription.tier)
  const getSubscriptionLabel = () => {
    if (currentPlan === 'monthly' && ctxIsPremium) return 'Monthly Premium';
    if (currentPlan === 'yearly' && ctxIsPremium) return 'Yearly Premium';
    return 'Free Plan';
  };

  const formatBackupDate = (date: Date) => {
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Profile</h2>
          </div>

          <div className="space-y-3">
            {editingName ? (
              <div className="flex gap-2">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your name"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveName}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingName(false)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{displayName || 'Set your name'}</p>
                  <p className="text-xs text-muted-foreground">Display name</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setNameInput(displayName || ''); setEditingName(true); }}>
                  Edit
                </Button>
              </div>
            )}

            <Separator />

            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Logged in</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {identity?.getPrincipal().toString().slice(0, 20)}...
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleLogout} className="gap-1.5">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isGuestMode ? 'Guest Mode' : 'Not logged in'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sync your progress across devices using Backup &amp; Restore.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleLogin}
                  disabled={loginStatus === 'logging-in'}
                  className="gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {loginStatus === 'logging-in' ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Appearance Section */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            </div>
            <h2 className="font-semibold text-foreground">Appearance</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-muted'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <Separator />

          <ThemeSelectorSection />
        </div>

        {/* Subscription Section */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Subscription</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{getSubscriptionLabel()}</p>
                {isPremium && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isPremium
                  ? 'You have access to all premium features'
                  : 'Upgrade to unlock all features'}
              </p>
            </div>
          </div>

          {!isPremium && (
            <Button
              onClick={() => setShowPaywall(true)}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl"
            >
              <Star className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          )}

          {isPremium && (currentPlan === 'monthly' || currentPlan === 'yearly') && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Manage your subscription via Google Play. Cancel anytime from the Play Store.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelSubscription}
                className="w-full text-muted-foreground"
              >
                Cancel Subscription Locally
              </Button>
            </div>
          )}
        </div>

        {/* Backup & Restore Section */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Cloud className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Backup &amp; Restore</h2>
                <p className="text-xs text-muted-foreground">Export your data to any cloud storage</p>
              </div>
            </div>
            {!isPremium && (
              <div className="p-1.5 rounded-lg bg-muted">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Free user — locked */}
          {!isPremium ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                <span>
                  Cloud Backup is a <strong className="text-primary">Premium</strong> feature.
                  Upgrade to back up your data.
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => setShowPaywall(true)}
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl"
              >
                <Star className="w-3.5 h-3.5 mr-1.5" />
                Unlock Cloud Backup
              </Button>
            </div>
          ) : (
            /* Premium user — full access */
            <div className="space-y-4">
              {/* Last backup timestamp */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground font-medium">Last Backup:</span>
                <span className={lastBackup ? 'text-foreground' : 'text-muted-foreground italic'}>
                  {lastBackup ? formatBackupDate(lastBackup) : 'Never'}
                </span>
              </div>

              {/* Success message */}
              {successMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-700 dark:text-green-400">
                  <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              )}

              {/* Error message */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleBackup}
                  disabled={isBackingUp || isRestoring}
                  className="rounded-xl gap-1.5 h-11"
                >
                  {isBackingUp ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Cloud className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {isBackingUp ? 'Saving…' : 'Backup'}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={onRestoreClick}
                  disabled={isBackingUp || isRestoring}
                  className="rounded-xl gap-1.5 h-11"
                >
                  {isRestoring ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CloudDownload className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {isRestoring ? 'Restoring…' : 'Restore'}
                  </span>
                </Button>
              </div>

              {/* Privacy notice */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
                <span>
                  Your backup file stays in your personal cloud storage. Studiora does not store your data on external servers.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold text-foreground">About</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>App</span>
              <span className="text-foreground font-medium">Studiora</span>
            </div>
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-foreground font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Platform</span>
              <span className="text-foreground font-medium">Internet Computer</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground py-2">
          <p>
            © {new Date().getFullYear()} Studiora. Built with{' '}
            <span className="text-red-500">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'studiora')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>

      {/* Restore confirmation dialog */}
      <AlertDialog open={showRestoreConfirm} onOpenChange={(open) => { if (!open) handleRestoreCancel(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore from Backup?</AlertDialogTitle>
            <AlertDialogDescription>
              Restoring will replace your current data with the data from the selected backup file. This action cannot be undone. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRestoreCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreConfirm}>
              Yes, Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fixed: PaywallScreen now requires isOpen prop */}
      <PaywallScreen isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}
