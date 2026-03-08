import React, { useState } from 'react';
import { Crown, BarChart3, Brain, Zap, Palette, FileDown, Infinity, Target } from 'lucide-react';
import PaywallScreen from './PaywallScreen';

interface UpgradePromptProps {
  featureName?: string;
  compact?: boolean;
}

const HIGHLIGHTS = [
  { icon: Infinity, text: 'Unlimited study plans' },
  { icon: BarChart3, text: 'Advanced analytics' },
  { icon: Brain, text: 'Smart study insights' },
  { icon: Zap, text: 'Advanced focus modes' },
  { icon: Target, text: 'Detailed statistics' },
  { icon: Palette, text: 'Custom themes' },
  { icon: FileDown, text: 'Export reports' },
];

export default function UpgradePrompt({ featureName, compact = false }: UpgradePromptProps) {
  const [paywallOpen, setPaywallOpen] = useState(false);

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Crown className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {featureName || 'Premium Feature'}
            </p>
            <p className="text-xs text-muted-foreground">
              Available in Premium to enhance your study experience.
            </p>
          </div>
          <button
            onClick={() => setPaywallOpen(true)}
            className="shrink-0 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Upgrade
          </button>
        </div>
        <PaywallScreen isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-primary/8 via-accent/5 to-background border border-primary/15 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Premium</p>
            <h3 className="text-base font-bold text-foreground">
              {featureName
                ? `Unlock ${featureName}`
                : 'Upgrade to Studiora Premium'}
            </h3>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Available in Premium to enhance your study experience.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setPaywallOpen(true)}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Learn More & Upgrade
        </button>
      </div>

      <PaywallScreen isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}
