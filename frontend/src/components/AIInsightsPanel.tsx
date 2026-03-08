import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Lightbulb, AlertTriangle, TrendingUp, MessageSquare } from 'lucide-react';
import PremiumGate from './PremiumGate';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';
import { useAIInsights } from '../hooks/useAIInsights';

type InsightType = 'suggestion' | 'encouragement' | 'warning' | 'feedback';

interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  message: string;
  priority: number;
}

const TYPE_CONFIG: Record<InsightType, { icon: React.ElementType; color: string; bg: string }> = {
  suggestion: { icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  encouragement: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  feedback: { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

function InsightCard({ insight }: { insight: AIInsight }) {
  const config = TYPE_CONFIG[insight.type];
  const Icon = config.icon;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${config.bg} border border-border/30`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{insight.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{insight.message}</p>
      </div>
    </div>
  );
}

function AIInsightsPanelContent() {
  const insights = useAIInsights() as AIInsight[];
  const [expanded, setExpanded] = useState(false);

  if (!insights || insights.length === 0) {
    return (
      <div className="glass-card p-6 rounded-xl text-center">
        <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium text-foreground">No insights yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Complete some study sessions to get personalized insights.
        </p>
      </div>
    );
  }

  const visibleInsights = expanded ? insights : insights.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Brain className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Smart Study Insights</p>
        <span className="ml-auto text-xs text-muted-foreground">{insights.length} insights</span>
      </div>

      {visibleInsights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}

      {insights.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-primary font-medium hover:opacity-80 transition-opacity"
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> Show {insights.length - 3} more</>
          )}
        </button>
      )}
    </div>
  );
}

export default function AIInsightsPanel() {
  const { isLoading } = useConsolidatedPremiumStatus();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-20 bg-muted/40 rounded-xl animate-pulse" />
        <div className="h-20 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <PremiumGate featureName="Smart Study Insights" showPreview>
      <AIInsightsPanelContent />
    </PremiumGate>
  );
}
