import React, { useState } from 'react';
import { Lock, Star, ArrowRight, Zap, BarChart2, BookOpen, Cloud, Palette } from 'lucide-react';
import PaywallScreen from './PaywallScreen';

interface UpgradePromptProps {
  featureName?: string;
  description?: string;
  className?: string;
}

const PREMIUM_HIGHLIGHTS = [
  { icon: <Zap className="w-3.5 h-3.5" />, label: 'Smart Study Insights' },
  { icon: <BarChart2 className="w-3.5 h-3.5" />, label: 'Advanced Statistics' },
  { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Unlimited Study Plans' },
  { icon: <Cloud className="w-3.5 h-3.5" />, label: 'Cloud Backup & Restore' },
  { icon: <Palette className="w-3.5 h-3.5" />, label: 'Customizable Themes' },
];

export default function UpgradePrompt({ featureName, description, className = '' }: UpgradePromptProps) {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <div className={`rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-5 ${className}`}>
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Premium Feature</span>
            </div>
            <h3 className="font-semibold text-foreground text-sm">
              {featureName ? `Unlock ${featureName}` : 'Upgrade to Premium'}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          {PREMIUM_HIGHLIGHTS.map((f) => (
            <div key={f.label} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-primary">{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowPaywall(true)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold py-2.5 px-4 rounded-xl hover:opacity-90 transition-opacity"
        >
          Upgrade to Premium
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {showPaywall && (
        <PaywallScreen
          onClose={() => setShowPaywall(false)}
          featureName={featureName}
        />
      )}
    </>
  );
}
