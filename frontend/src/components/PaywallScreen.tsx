import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, Check, Sparkles, Zap, Star } from 'lucide-react';
import { PREMIUM_FEATURES, ALL_PREMIUM_FEATURES } from '../types/features';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';

interface PaywallScreenProps {
  open: boolean;
  onClose: () => void;
}

type PlanType = 'monthly' | 'yearly';

export default function PaywallScreen({ open, onClose }: PaywallScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const { provider } = useSubscriptionContext();

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      await provider.startFreeTrial();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      if (selectedPlan === 'monthly') {
        await provider.subscribeMonthly();
      } else {
        await provider.subscribeYearly();
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto p-0 rounded-3xl border-0 shadow-2xl">
        {/* Gradient Header */}
        <div
          className="relative p-6 rounded-t-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}
        >
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/8" />
          <div className="absolute right-8 bottom-0 w-24 h-24 rounded-full bg-white/5" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 active:scale-90 transition-all duration-150"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/80 text-xs font-bold uppercase tracking-widest">StudyPlan Premium</span>
            </div>
            <DialogTitle className="text-2xl font-bold text-white mb-1.5">
              Unlock Your Full Potential
            </DialogTitle>
            <p className="text-white/70 text-sm">
              Join thousands of students achieving better results.
            </p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Free tier limitations */}
          <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Free Plan Includes</p>
            <ul className="space-y-1">
              {[
                'Create one study plan',
                'Daily task management',
                'Basic Pomodoro timer',
                'Light & dark theme toggle',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Features List */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Everything in Premium
            </p>
            {ALL_PREMIUM_FEATURES.map((feature) => {
              const config = PREMIUM_FEATURES[feature];
              return (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{config.icon}</span>
                      <p className="font-semibold text-sm">{config.displayName}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plan Selector */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Choose Your Plan
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Monthly */}
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-95 ${
                  selectedPlan === 'monthly'
                    ? 'border-primary bg-primary/6 shadow-card'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <p className="font-bold text-sm">Monthly</p>
                <p className="text-2xl font-bold mt-1 text-foreground">$9.99</p>
                <p className="text-xs text-muted-foreground">per month</p>
                {selectedPlan === 'monthly' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>

              {/* Yearly — Best Value */}
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-95 ${
                  selectedPlan === 'yearly'
                    ? 'border-primary bg-primary/6 shadow-card'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap"
                  style={{ background: 'linear-gradient(90deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}>
                  <Star className="w-2.5 h-2.5" />
                  Best Value
                </div>
                <p className="font-bold text-sm">Yearly</p>
                <p className="text-2xl font-bold mt-1 text-foreground">$5.99</p>
                <p className="text-xs text-muted-foreground">per month</p>
                <p className="text-xs text-primary font-semibold">Save 40%</p>
                {selectedPlan === 'yearly' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              onClick={handleStartTrial}
              disabled={isLoading}
              className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 shadow-primary"
              style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}
            >
              <Zap className="w-5 h-5" />
              {isLoading ? 'Starting...' : 'Start 7-Day Free Trial'}
            </button>
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full py-3 rounded-2xl font-semibold text-sm text-primary bg-primary/8 border border-primary/20 hover:bg-primary/15 active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
            >
              {isLoading ? 'Processing...' : `Subscribe ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'}`}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              No credit card required for trial. Cancel anytime.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Continue with Free Plan
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
