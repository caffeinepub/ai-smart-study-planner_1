import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { PremiumFeature, FEATURE_CONFIG, ALL_PREMIUM_FEATURES } from '../types/features';
import PaywallScreen from './PaywallScreen';

interface UpgradePromptProps {
  featureName?: PremiumFeature;
}

export default function UpgradePrompt({ featureName }: UpgradePromptProps) {
  const [showPaywall, setShowPaywall] = useState(false);

  const featuredConfig = featureName ? FEATURE_CONFIG[featureName] : null;

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        {/* Icon */}
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30 scale-110"
            style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }} />
          <div
            className="relative w-20 h-20 rounded-3xl flex items-center justify-center shadow-primary"
            style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}
          >
            {featuredConfig ? (
              <span className="text-3xl">{featuredConfig.icon}</span>
            ) : (
              <Sparkles className="w-9 h-9 text-white" />
            )}
          </div>
        </div>

        {featuredConfig ? (
          <>
            <h2 className="text-xl font-bold mb-2">
              Unlock {featuredConfig.displayName}
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs leading-relaxed">
              {featuredConfig.description}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs leading-relaxed">
              Upgrade to Premium to unlock this feature and supercharge your study sessions.
            </p>
          </>
        )}

        {/* Feature list */}
        <div className="w-full max-w-xs space-y-2 mb-7 text-left">
          {ALL_PREMIUM_FEATURES.map((f) => {
            const config = FEATURE_CONFIG[f];
            const isHighlighted = f === featureName;
            return (
              <div
                key={f}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isHighlighted
                    ? 'bg-primary/8 border border-primary/20'
                    : 'bg-card border border-border'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isHighlighted ? 'bg-primary' : 'bg-primary/10'
                }`}>
                  <Check className={`w-3.5 h-3.5 ${isHighlighted ? 'text-white' : 'text-primary'}`} />
                </div>
                <span className={`text-sm font-medium ${
                  isHighlighted ? 'font-bold text-primary' : 'text-muted-foreground'
                }`}>
                  {config.displayName}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowPaywall(true)}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-base text-white active:scale-95 transition-all duration-150 shadow-primary"
          style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}
        >
          <Sparkles className="w-4 h-4" />
          Upgrade to Premium
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <PaywallScreen open={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
}
