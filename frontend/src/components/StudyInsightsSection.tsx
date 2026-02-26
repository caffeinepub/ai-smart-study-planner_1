import React from 'react';
import {
  Flame,
  Clock,
  Trophy,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Calendar,
  BarChart2,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { useStudyInsights, StudyInsight } from '../hooks/useStudyInsights';

const ICON_MAP: Record<string, React.ReactNode> = {
  Flame: <Flame className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  BarChart2: <BarChart2 className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
};

const ICON_COLORS: Record<string, string> = {
  Flame: 'text-orange-500 bg-orange-500/10',
  Clock: 'text-primary bg-primary/10',
  Trophy: 'text-yellow-500 bg-yellow-500/10',
  CheckCircle2: 'text-green-500 bg-green-500/10',
  TrendingUp: 'text-primary bg-primary/10',
  BookOpen: 'text-accent bg-accent/10',
  Calendar: 'text-primary bg-primary/10',
  BarChart2: 'text-accent bg-accent/10',
  Zap: 'text-yellow-500 bg-yellow-500/10',
};

function InsightCard({ insight }: { insight: StudyInsight }) {
  const icon = ICON_MAP[insight.iconName] ?? <Lightbulb className="w-5 h-5" />;
  const colorClass = ICON_COLORS[insight.iconName] ?? 'text-primary bg-primary/10';

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border shadow-card">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        {icon}
      </div>
      <p className="text-sm text-foreground leading-relaxed pt-1.5">{insight.text}</p>
    </div>
  );
}

export default function StudyInsightsSection() {
  const insights = useStudyInsights();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-primary" />
        <h2 className="font-bold text-sm text-foreground">Study Insights</h2>
      </div>

      {insights.length === 0 ? (
        <div className="p-5 rounded-2xl bg-card border border-border shadow-card text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">No insights yet</p>
          <p className="text-xs text-muted-foreground">
            Complete a few study sessions to unlock your personalized insights.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}
