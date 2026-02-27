import React, { useState } from 'react';
import {
  Lightbulb,
  Star,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAIInsights, type AIInsight, type InsightType } from '../hooks/useAIInsights';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';
import PaywallScreen from './PaywallScreen';

// ── Icon & style maps ─────────────────────────────────────────────────────────

const TYPE_ICON: Record<InsightType, React.ReactNode> = {
  suggestion: <Lightbulb className="w-4 h-4" />,
  encouragement: <Star className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  feedback: <CheckCircle2 className="w-4 h-4" />,
};

const TYPE_STYLES: Record<InsightType, string> = {
  suggestion: 'bg-primary/8 text-primary border-primary/20',
  encouragement: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  feedback: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
};

const TYPE_ICON_BG: Record<InsightType, string> = {
  suggestion: 'bg-primary/10 text-primary',
  encouragement: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  feedback: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

// ── Insight Card ──────────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: AIInsight }) {
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${TYPE_STYLES[insight.type]}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${TYPE_ICON_BG[insight.type]}`}>
        {TYPE_ICON[insight.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold leading-tight mb-1">{insight.title}</p>
        <p className="text-xs opacity-80 leading-relaxed">{insight.message}</p>
      </div>
    </div>
  );
}

// ── Ghost Card (for blur teaser) ──────────────────────────────────────────────

function GhostCard() {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-muted/20">
      <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-muted rounded w-3/4" />
        <div className="h-2.5 bg-muted rounded w-full" />
        <div className="h-2.5 bg-muted rounded w-2/3" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AIInsightsPanel() {
  const insights = useAIInsights();
  const { isPremium, isLoading: premiumLoading } = useConsolidatedPremiumStatus();
  const [showPaywall, setShowPaywall] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const PREVIEW_COUNT = 3;
  const visibleInsights = expanded ? insights : insights.slice(0, PREVIEW_COUNT);
  const hasMore = insights.length > PREVIEW_COUNT;

  // Loading state
  if (premiumLoading) {
    return (
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b border-white/10 dark:border-white/6">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground">AI Study Insights</h3>
            <p className="text-xs text-muted-foreground">Analyzing your study patterns…</p>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground text-xs py-6">
          <span className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  // Non-premium: show teaser with blur
  if (!isPremium) {
    return (
      <>
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 flex items-center gap-3 border-b border-white/10 dark:border-white/6">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">AI Study Insights</h3>
              <p className="text-xs text-muted-foreground">Personalized study analysis</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              Premium
            </div>
          </div>

          {/* Blurred teaser */}
          <div className="relative p-4 space-y-2.5">
            <div className="absolute inset-0 backdrop-blur-[3px] bg-background/50 z-10 flex flex-col items-center justify-center gap-3 rounded-b-2xl">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center px-6">
                <p className="text-sm font-bold text-foreground">Unlock AI Study Insights</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Get personalized feedback on your study patterns, weak spots, and consistency
                </p>
              </div>
              <button
                onClick={() => setShowPaywall(true)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-all duration-150 shadow-lg"
                style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}
              >
                Upgrade to Premium
              </button>
            </div>
            {/* Ghost items behind blur */}
            <GhostCard />
            <GhostCard />
            <GhostCard />
          </div>
        </div>

        <PaywallScreen open={showPaywall} onClose={() => setShowPaywall(false)} />
      </>
    );
  }

  // Premium: show all insights
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-white/10 dark:border-white/6">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">AI Study Insights</h3>
          <p className="text-xs text-muted-foreground">Based on your study patterns</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-semibold">
          <Sparkles className="w-3 h-3" />
          Premium
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        {insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">No Insights Yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start studying and completing tasks to generate personalized insights.
              </p>
            </div>
          </div>
        ) : (
          <>
            {visibleInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}

            {hasMore && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    Show {insights.length - PREVIEW_COUNT} More Insight{insights.length - PREVIEW_COUNT !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
