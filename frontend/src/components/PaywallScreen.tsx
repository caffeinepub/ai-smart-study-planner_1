import React, { useState } from 'react';
import { X, Check, Crown, Zap, BarChart3, Brain, Target, Palette, FileDown, Infinity } from 'lucide-react';
import { toast } from 'sonner';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '../hooks/useSubscription';
import type { ProductId } from '../utils/googlePlayBilling';

interface PaywallScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

const PREMIUM_FEATURES = [
  { icon: Infinity, label: 'Unlimited study plans', desc: 'Create as many plans as you need' },
  { icon: BarChart3, label: 'Advanced progress analytics', desc: 'Deep insights into your study patterns' },
  { icon: Brain, label: 'Smart study insights', desc: 'AI-powered personalized recommendations' },
  { icon: Zap, label: 'Advanced focus modes', desc: 'Custom intervals, ambient sounds & more' },
  { icon: Target, label: 'Detailed progress statistics', desc: 'Track every metric of your journey' },
  { icon: Palette, label: 'Custom themes & personalization', desc: 'Make Studiora truly yours' },
  { icon: FileDown, label: 'Export study reports', desc: 'Share your progress with teachers or parents' },
];

export default function PaywallScreen({ isOpen, onClose }: PaywallScreenProps) {
  const { subscribeToPlan, restorePurchases, isLoading } = useSubscriptionContext();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  if (!isOpen) return null;

  const handleContinue = async () => {
    setErrorMessage(null);
    const planInfo = SUBSCRIPTION_PLANS[selectedPlan];
    try {
      await subscribeToPlan(planInfo.id as ProductId);
      toast.success('Premium unlocked. Stay focused.', {
        duration: 4000,
        icon: '🎓',
      });
      onClose();
    } catch {
      setErrorMessage('Payment cancelled or failed.');
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    setErrorMessage(null);
    try {
      const restored = await restorePurchases();
      if (restored) {
        toast.success('Premium restored successfully!', { duration: 3000 });
        onClose();
      } else {
        setErrorMessage('No previous purchases found.');
      }
    } catch {
      setErrorMessage('Could not restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/20 via-accent/10 to-background px-6 pt-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/60 transition-colors text-muted-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">Studiora</p>
              <h2 className="text-xl font-bold text-foreground leading-tight">
                Upgrade to Premium
              </h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Unlock advanced tools to supercharge your study sessions.
          </p>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 pb-2">
          {/* Feature list */}
          <div className="space-y-3 py-4">
            {PREMIUM_FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Check className="w-4 h-4 text-green-500 shrink-0 mt-1 ml-auto" />
              </div>
            ))}
          </div>

          {/* Plan selection */}
          <div className="space-y-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Choose your plan
            </p>

            {/* Monthly plan */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/30 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Monthly</p>
                  <p className="text-xs text-muted-foreground">Billed monthly, cancel anytime</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">$3.99</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>
              {selectedPlan === 'monthly' && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                  <span className="text-xs text-primary font-medium">Selected</span>
                </div>
              )}
            </button>

            {/* Yearly plan */}
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all relative overflow-hidden ${
                selectedPlan === 'yearly'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/30 hover:border-primary/40'
              }`}
            >
              {/* Best Value badge */}
              <div className="absolute top-3 right-3">
                <span className="text-xs font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                  Best Value
                </span>
              </div>
              <div className="flex items-center justify-between pr-20">
                <div>
                  <p className="font-semibold text-foreground">Yearly</p>
                  <p className="text-xs text-muted-foreground">Save ~37% vs monthly</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">$29.99</p>
                  <p className="text-xs text-muted-foreground">per year</p>
                </div>
              </div>
              {selectedPlan === 'yearly' && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                  <span className="text-xs text-primary font-medium">Selected</span>
                </div>
              )}
            </button>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 space-y-3 border-t border-border/50 bg-background">
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4" />
                Continue with Google Play
              </>
            )}
          </button>

          <button
            onClick={handleRestore}
            disabled={isRestoring || isLoading}
            className="w-full py-2.5 rounded-xl text-muted-foreground text-sm font-medium hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-50"
          >
            {isRestoring ? 'Restoring...' : 'Restore Purchases'}
          </button>

          <p className="text-center text-xs text-muted-foreground pb-1">
            Subscriptions managed via Google Play. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
