import React, { useState } from 'react';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';
import PaywallScreen from './PaywallScreen';

interface PremiumGateProps {
  children: React.ReactNode;
  featureName?: string;
  /** If true, renders a blurred preview of children behind the prompt */
  showPreview?: boolean;
}

export default function PremiumGate({ children, featureName, showPreview = false }: PremiumGateProps) {
  const { isPremium, isLoading } = useConsolidatedPremiumStatus();
  const [paywallOpen, setPaywallOpen] = useState(false);

  // While loading, render children to avoid false paywall flash for premium users
  if (isLoading) {
    return <>{children}</>;
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative rounded-xl overflow-hidden">
        {/* Blurred preview of content */}
        {showPreview && (
          <div className="pointer-events-none select-none" aria-hidden="true">
            <div className="blur-sm opacity-40 saturate-50">
              {children}
            </div>
          </div>
        )}

        {/* Soft upgrade prompt overlay */}
        <div
          className={`${showPreview ? 'absolute inset-0' : ''} flex flex-col items-center justify-center p-6 bg-muted/60 backdrop-blur-sm rounded-xl border border-border/50`}
        >
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground text-center mb-1">
            {featureName ? `${featureName}` : 'Premium Feature'}
          </p>
          <p className="text-xs text-muted-foreground text-center mb-4 max-w-xs">
            Available in Premium to enhance your study experience.
          </p>
          <button
            onClick={() => setPaywallOpen(true)}
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>

      <PaywallScreen isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}
