import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { usePremiumTestingMode } from '../hooks/usePremiumTestingMode';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import PaywallScreen from './PaywallScreen';

export default function AdBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const { isPremium: isSubscriptionPremium } = useSubscriptionContext();
  const { isPremiumTestingEnabled } = usePremiumTestingMode();
  const { data: userProfile } = useGetCallerUserProfile();
  const isBackendPremium = userProfile?.userTier === 'premium';
  const isPremium = isPremiumTestingEnabled || isBackendPremium || isSubscriptionPremium;

  if (isPremium || dismissed) return null;

  return (
    <>
      <div className="glass-card rounded-2xl p-3 flex items-center gap-3 border border-primary/15 relative overflow-hidden">
        {/* Subtle gradient accent */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }} />

        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground leading-tight">
            Upgrade for an ad-free experience
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Support StudyPlan & unlock all premium features
          </p>
        </div>

        <button
          onClick={() => setShowPaywall(true)}
          className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-all duration-150"
          style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}
        >
          Go Premium
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center hover:bg-muted/60 active:scale-90 transition-all duration-150"
          aria-label="Dismiss"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      <PaywallScreen open={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
}
