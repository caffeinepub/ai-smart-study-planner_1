import React, { useState } from 'react';
import { X, Star, Zap, BarChart2, BookOpen, Cloud, Palette, Lock } from 'lucide-react';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PaywallScreenProps {
  onClose: () => void;
  featureName?: string;
}

const PREMIUM_FEATURES = [
  { icon: <Zap className="w-4 h-4" />, label: 'Smart Study Insights', desc: 'AI-powered personalized recommendations' },
  { icon: <BarChart2 className="w-4 h-4" />, label: 'Advanced Statistics', desc: 'Detailed analytics and progress charts' },
  { icon: <BookOpen className="w-4 h-4" />, label: 'Unlimited Study Plans', desc: 'Manage multiple exams simultaneously' },
  { icon: <Cloud className="w-4 h-4" />, label: 'Cloud Backup & Restore', desc: 'Securely sync your data across devices' },
  { icon: <Palette className="w-4 h-4" />, label: 'Customizable Themes', desc: 'Personalize your study environment' },
  { icon: <Lock className="w-4 h-4" />, label: 'Advanced Focus Mode', desc: 'Ambient sounds and distraction-free sessions' },
];

export default function PaywallScreen({ onClose, featureName }: PaywallScreenProps) {
  const { subscribe, startTrial, subscription } = useSubscriptionContext();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  const { trialUsed } = subscription;

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await subscribe(selectedPlan);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      await startTrial();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 fill-current" />
            <span className="text-sm font-semibold uppercase tracking-wider">Studiora Premium</span>
          </div>
          <h2 className="text-2xl font-bold">Unlock Your Full Potential</h2>
          {featureName && (
            <p className="text-sm mt-1 opacity-90">
              <span className="font-medium">{featureName}</span> is a Premium feature
            </p>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Features List */}
          <div className="space-y-3">
            {PREMIUM_FEATURES.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Plans */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Choose your plan</p>

            {/* Yearly Plan */}
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all relative ${
                selectedPlan === 'yearly'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Yearly Plan</span>
                    <Badge className="bg-accent text-accent-foreground text-xs px-2 py-0.5">Best Value</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Save over 37% vs monthly</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">$29.99</p>
                  <p className="text-xs text-muted-foreground">per year</p>
                </div>
              </div>
              {selectedPlan === 'yearly' && (
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                </div>
              )}
            </button>

            {/* Monthly Plan */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all relative ${
                selectedPlan === 'monthly'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground">Monthly Plan</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Flexible, cancel anytime</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">$3.99</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>
              {selectedPlan === 'monthly' && (
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                </div>
              )}
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 rounded-xl"
            >
              {isLoading ? 'Processing...' : `Subscribe ${selectedPlan === 'yearly' ? 'Yearly — $29.99' : 'Monthly — $3.99/mo'}`}
            </Button>

            {!trialUsed && (
              <Button
                variant="outline"
                onClick={handleStartTrial}
                disabled={isLoading}
                className="w-full rounded-xl"
              >
                Start Free Trial (3 Days)
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </div>
    </div>
  );
}
