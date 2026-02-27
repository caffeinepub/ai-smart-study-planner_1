import React from 'react';
import { Brain, Lightbulb, Star, AlertTriangle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useAIInsights, type InsightType } from '../hooks/useAIInsights';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';

const TYPE_ICON: Record<InsightType, React.ReactNode> = {
  suggestion: <Lightbulb className="w-3.5 h-3.5" />,
  encouragement: <Star className="w-3.5 h-3.5" />,
  warning: <AlertTriangle className="w-3.5 h-3.5" />,
  feedback: <CheckCircle2 className="w-3.5 h-3.5" />,
};

const TYPE_ICON_BG: Record<InsightType, string> = {
  suggestion: 'bg-primary/10 text-primary',
  encouragement: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  feedback: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

const TYPE_DOT: Record<InsightType, string> = {
  suggestion: 'bg-primary',
  encouragement: 'bg-emerald-500',
  warning: 'bg-amber-500',
  feedback: 'bg-violet-500',
};

export default function AIInsightsSummaryCard() {
  const insights = useAIInsights();
  const { isPremium, isLoading: premiumLoading } = useConsolidatedPremiumStatus();

  const topInsights = insights.slice(0, 2);

  if (premiumLoading) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-xs font-bold text-foreground">AI Insights Preview</h3>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs py-2">
          <span className="w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          Loading insights…
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="text-xs font-bold text-foreground">AI Insights Preview</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
            <Sparkles className="w-2.5 h-2.5" />
            Premium
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Unlock personalized AI-powered insights based on your study patterns and consistency.
        </p>
        <Link
          to="/progress"
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold text-primary bg-primary/8 hover:bg-primary/12 transition-colors"
        >
          View Progress
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  if (topInsights.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-xs font-bold text-foreground">AI Insights Preview</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Start studying to generate personalized insights.
        </p>
        <Link
          to="/progress"
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold text-primary bg-primary/8 hover:bg-primary/12 transition-colors"
        >
          View All Insights
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-xs font-bold text-foreground">AI Insights Preview</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
          <Sparkles className="w-2.5 h-2.5" />
          {insights.length}
        </div>
      </div>

      {/* Top insights (title only) */}
      <div className="space-y-2 mb-3">
        {topInsights.map((insight) => (
          <div key={insight.id} className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${TYPE_ICON_BG[insight.type]}`}>
              {TYPE_ICON[insight.type]}
            </div>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TYPE_DOT[insight.type]}`} />
              <p className="text-xs font-semibold text-foreground truncate">{insight.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        to="/progress"
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold text-primary bg-primary/8 hover:bg-primary/12 transition-colors"
      >
        View All Insights
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
