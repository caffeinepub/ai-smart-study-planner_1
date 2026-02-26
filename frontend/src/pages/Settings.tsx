import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  User,
  Moon,
  Sun,
  Info,
  Sparkles,
  Shield,
  ChevronRight,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { usePremiumTestingMode } from '../hooks/usePremiumTestingMode';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { useTheme } from '../hooks/useTheme';
import { useLocalProfile } from '../hooks/useLocalProfile';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';
import ThemeSelectorSection from '../components/ThemeSelectorSection';
import PaywallScreen from '../components/PaywallScreen';

interface SettingsCardProps {
  children: React.ReactNode;
  className?: string;
}

function SettingsCard({ children, className = '' }: SettingsCardProps) {
  return (
    <div className={`glass-card rounded-2xl overflow-hidden ${className}`}>
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
      className={`flex items-center gap-3.5 px-4 py-3.5 ${onClick ? 'cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-destructive/10' : 'bg-primary/8 dark:bg-primary/15'}`}>
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
  const { isPremiumTestingEnabled, togglePremiumTesting } = usePremiumTestingMode();
  const { isPremium: isSubscriptionPremium, status: subscriptionStatus } = useSubscriptionContext();
  const { theme, toggleTheme } = useTheme();
  const { displayName, setDisplayName } = useLocalProfile();
  const { isPremium } = useConsolidatedPremiumStatus();
  const [showPaywall, setShowPaywall] = useState(false);

  // Profile editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);

  const handleEditName = () => {
    setNameInput(displayName);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setDisplayName(nameInput.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setNameInput(displayName);
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') handleCancelEdit();
  };

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your preferences.</p>
      </div>

      {/* Profile Section */}
      <SettingsCard>
        <div className="px-4 py-3 border-b border-white/10 dark:border-white/6">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Profile</p>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-primary shrink-0">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-base truncate">
                  {displayName || 'No name set'}
                </p>
                <Badge variant="outline" className="text-xs rounded-full">Local</Badge>
                {isPremium && (
                  <Badge className="text-xs gap-1 rounded-full bg-primary text-white border-0">
                    <Sparkles className="w-2.5 h-2.5" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Data stored locally on this device
              </p>
            </div>
          </div>

          {/* Name edit field */}
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={handleNameKeyDown}
                placeholder="Enter your display name"
                className="flex-1 h-9 text-sm rounded-xl"
                autoFocus
                maxLength={40}
              />
              <button
                onClick={handleSaveName}
                disabled={!nameInput.trim()}
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleEditName}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-primary bg-primary/8 border border-primary/15 hover:bg-primary/15 active:scale-[0.98] transition-all duration-150"
            >
              <Pencil className="w-3.5 h-3.5" />
              {displayName ? 'Edit Display Name' : 'Set Display Name'}
            </button>
          )}
        </div>
      </SettingsCard>

      {/* Appearance */}
      <SettingsCard>
        <div className="px-4 py-3 border-b border-white/10 dark:border-white/6">
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
      </SettingsCard>

      {/* Theme Customization */}
      <ThemeSelectorSection />

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
          <div className="px-4 py-3 border-b border-white/10 dark:border-white/6">
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
        <div className="px-4 py-3 border-b border-white/10 dark:border-white/6">
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
        <div className="px-4 py-3 border-b border-white/10 dark:border-white/6">
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
            </a>
            {' '}· © {new Date().getFullYear()}
          </p>
        </div>
      </SettingsCard>

      {/* Paywall */}
      {showPaywall && (
        <PaywallScreen
          open={showPaywall}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
}
