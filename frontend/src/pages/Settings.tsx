import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Moon,
  Sun,
  LogOut,
  Info,
  Sparkles,
  Cloud,
  CloudOff,
  RefreshCw,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { usePremiumTestingMode } from '../hooks/usePremiumTestingMode';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { useGuestMode } from '../hooks/useGuestMode';
import { useCloudSync } from '../hooks/useCloudSync';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../hooks/useTheme';
import CloudSyncPrompt from '../components/CloudSyncPrompt';
import PaywallScreen from '../components/PaywallScreen';
import ColorThemeSelector from '../components/ColorThemeSelector';

interface SettingsCardProps {
  children: React.ReactNode;
  className?: string;
}

function SettingsCard({ children, className = '' }: SettingsCardProps) {
  return (
    <div className={`bg-card border border-border rounded-2xl shadow-card overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

function SettingsRow({ icon, label, description, right, onClick, danger }: SettingsRowProps) {
  return (
    <div
      className={`flex items-center gap-3.5 px-4 py-3.5 ${onClick ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-destructive/10' : 'bg-primary/8'}`}>
        <span className={danger ? 'text-destructive' : 'text-primary'}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${danger ? 'text-destructive' : 'text-foreground'}`}>{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export default function Settings() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { isPremiumTestingEnabled, togglePremiumTesting } = usePremiumTestingMode();
  const { isPremium: isSubscriptionPremium, status: subscriptionStatus } = useSubscriptionContext();
  const { isGuestMode, exitGuestMode } = useGuestMode();
  const { triggerSync, isSyncing, lastSynced, showPrompt, dismissPrompt } = useCloudSync();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  const [showPaywall, setShowPaywall] = useState(false);

  const isAuthenticated = !!identity;
  const isBackendPremium = userProfile?.userTier === 'premium';
  const isPremium = isPremiumTestingEnabled || isBackendPremium || isSubscriptionPremium;

  const displayName = isGuestMode
    ? 'Guest User'
    : userProfile?.name ?? 'Loading...';

  const handleLogout = async () => {
    if (isGuestMode) {
      exitGuestMode();
      window.location.href = '/login';
    } else {
      await clear();
      queryClient.clear();
    }
  };

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences.</p>
      </div>

      {/* Profile Card */}
      <SettingsCard>
        <div className="p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-primary shrink-0">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-base truncate">{displayName}</p>
              {isGuestMode && (
                <Badge variant="outline" className="text-xs rounded-full">Guest</Badge>
              )}
              {isPremium && !isGuestMode && (
                <Badge className="text-xs gap-1 rounded-full bg-primary text-white border-0">
                  <Sparkles className="w-2.5 h-2.5" />
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isGuestMode
                ? 'Sign in to sync your data across devices'
                : isAuthenticated
                ? 'Internet Identity'
                : 'Not signed in'}
            </p>
          </div>
        </div>
        {isGuestMode && (
          <div className="px-4 pb-4">
            <button
              onClick={() => { exitGuestMode(); window.location.href = '/login'; }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-primary bg-primary/8 border border-primary/20 hover:bg-primary/15 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
            >
              Sign In for Full Access
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </SettingsCard>

      {/* Appearance */}
      <SettingsCard>
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Appearance</p>
        </div>
        <SettingsRow
          icon={theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          label="Dark Mode"
          description={theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
          right={
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-primary"
            />
          }
        />
        <div className="border-t border-border">
          <ColorThemeSelector />
        </div>
      </SettingsCard>

      {/* Cloud Sync */}
      <SettingsCard>
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cloud Backup & Sync</p>
        </div>
        <SettingsRow
          icon={isGuestMode ? <CloudOff className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
          label={isGuestMode ? 'Enable Cloud Sync' : 'Sync Now'}
          description={
            isGuestMode
              ? 'Sign in to enable automatic cloud backup'
              : lastSynced
              ? `Last synced: ${lastSynced.toLocaleString()}`
              : 'Keep your study plans safe across devices'
          }
          right={
            <button
              onClick={triggerSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/8 text-primary border border-primary/20 hover:bg-primary/15 active:scale-95 transition-all duration-150 disabled:opacity-50"
            >
              {isSyncing ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync'}
            </button>
          }
        />
      </SettingsCard>

      {/* Premium Upgrade */}
      {!isPremium && (
        <div
          className="rounded-2xl p-5 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-150"
          style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}
          onClick={() => setShowPaywall(true)}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/8" />
          <div className="absolute right-4 bottom-0 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-base">Upgrade to Premium</p>
              <p className="text-white/70 text-xs mt-0.5">
                Unlock AI scheduling, analytics & more
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70" />
          </div>
        </div>
      )}

      {/* Subscription Status */}
      {isPremium && subscriptionStatus.tier !== 'free' && (
        <SettingsCard>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subscription</p>
          </div>
          <SettingsRow
            icon={<Shield className="w-4 h-4" />}
            label={`${subscriptionStatus.tier.charAt(0).toUpperCase() + subscriptionStatus.tier.slice(1)} Plan`}
            description={
              subscriptionStatus.trialEndsAt
                ? `Trial ends ${subscriptionStatus.trialEndsAt.toLocaleDateString()}`
                : subscriptionStatus.renewsAt
                ? `Renews ${subscriptionStatus.renewsAt.toLocaleDateString()}`
                : 'Active subscription'
            }
            right={
              <Badge className="text-xs rounded-full bg-primary text-white border-0">Active</Badge>
            }
          />
        </SettingsCard>
      )}

      {/* Developer Options */}
      <SettingsCard>
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Developer Options</p>
        </div>
        <SettingsRow
          icon={<Shield className="w-4 h-4" />}
          label="Enable Premium (Testing)"
          description="Bypass premium checks for testing"
          right={
            <Switch
              checked={isPremiumTestingEnabled}
              onCheckedChange={togglePremiumTesting}
              className="data-[state=checked]:bg-primary"
            />
          }
        />
      </SettingsCard>

      {/* About */}
      <SettingsCard>
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">About</p>
        </div>
        <div className="px-4 py-3.5 space-y-1">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-semibold">StudyPlan v1.0.0</p>
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            Built with{' '}
            <span className="text-red-500">♥</span>{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>{' '}
            · © {new Date().getFullYear()}
          </p>
        </div>
      </SettingsCard>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm text-destructive bg-destructive/6 border border-destructive/20 hover:bg-destructive/10 active:scale-[0.98] transition-all duration-150"
      >
        <LogOut className="w-4 h-4" />
        {isGuestMode ? 'Exit Guest Mode' : 'Sign Out'}
      </button>

      <CloudSyncPrompt open={showPrompt} onClose={dismissPrompt} />
      <PaywallScreen open={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}
