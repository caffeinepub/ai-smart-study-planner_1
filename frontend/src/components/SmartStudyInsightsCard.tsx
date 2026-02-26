import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';
import PaywallScreen from './PaywallScreen';
import type { DailyTask } from '../backend';

interface SmartStudyInsightsCardProps {
  tasks: DailyTask[];
  allTasks?: DailyTask[];
}

interface Insight {
  icon: React.ReactNode;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'info';
}

function computeInsights(tasks: DailyTask[], allTasks: DailyTask[]): Insight[] {
  const insights: Insight[] = [];

  // Insight 1: Completion rate today
  const totalToday = tasks.length;
  const completedToday = tasks.filter((t) => t.isCompleted).length;
  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  if (totalToday > 0) {
    if (completionRate >= 80) {
      insights.push({
        icon: <TrendingUp className="w-4 h-4" />,
        title: 'Great momentum today!',
        description: `You've completed ${completionRate}% of today's tasks. Keep it up to maintain your streak.`,
        type: 'positive',
      });
    } else if (completionRate < 40 && totalToday > 2) {
      insights.push({
        icon: <Clock className="w-4 h-4" />,
        title: 'Focus time needed',
        description: `Only ${completionRate}% done today. Try a 25-minute focus session to catch up on pending tasks.`,
        type: 'warning',
      });
    }
  }

  // Insight 2: Subject weakness detection
  const subjectStats: Record<string, { total: number; completed: number }> = {};
  for (const task of allTasks) {
    if (!subjectStats[task.subjectName]) {
      subjectStats[task.subjectName] = { total: 0, completed: 0 };
    }
    subjectStats[task.subjectName].total++;
    if (task.isCompleted) subjectStats[task.subjectName].completed++;
  }

  const weakSubjects = Object.entries(subjectStats)
    .filter(([, s]) => s.total >= 2 && s.completed / s.total < 0.4)
    .map(([name]) => name);

  if (weakSubjects.length > 0) {
    insights.push({
      icon: <AlertTriangle className="w-4 h-4" />,
      title: `Needs attention: ${weakSubjects[0]}`,
      description: `Your completion rate for ${weakSubjects[0]} is below 40%. Consider dedicating extra time to this subject.`,
      type: 'warning',
    });
  }

  // Insight 3: Revision tasks
  const revisionTasks = tasks.filter((t) => t.isRevision && !t.isCompleted);
  if (revisionTasks.length > 0) {
    insights.push({
      icon: <Brain className="w-4 h-4" />,
      title: 'Revision day — reinforce your memory',
      description: `You have ${revisionTasks.length} revision task${revisionTasks.length > 1 ? 's' : ''} today. Spaced repetition boosts long-term retention by up to 80%.`,
      type: 'info',
    });
  }

  // Insight 4: Best study time suggestion
  if (insights.length < 2) {
    insights.push({
      icon: <Clock className="w-4 h-4" />,
      title: 'Optimal study window',
      description: 'Studies show morning sessions (8–11 AM) yield 20% better retention. Try scheduling your hardest topics then.',
      type: 'info',
    });
  }

  return insights.slice(0, 3);
}

export default function SmartStudyInsightsCard({ tasks, allTasks = [] }: SmartStudyInsightsCardProps) {
  const [showPaywall, setShowPaywall] = useState(false);

  const { isPremium, isLoading: premiumLoading } = useConsolidatedPremiumStatus();

  const insights = computeInsights(tasks, allTasks.length > 0 ? allTasks : tasks);

  const typeStyles = {
    positive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    info: 'bg-primary/8 text-primary border-primary/20',
  };

  if (premiumLoading) {
    return (
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b border-white/10 dark:border-white/6">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground">Smart Study Insights</h3>
            <p className="text-xs text-muted-foreground">Personalized recommendations</p>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground text-xs py-6">
          <span className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <>
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Teaser header */}
          <div className="p-4 flex items-center gap-3 border-b border-white/10 dark:border-white/6">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">Smart Study Insights</h3>
              <p className="text-xs text-muted-foreground">Personalized recommendations</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              Premium
            </div>
          </div>

          {/* Blurred teaser */}
          <div className="relative p-4 space-y-2.5">
            <div className="absolute inset-0 backdrop-blur-[2px] bg-background/40 z-10 flex flex-col items-center justify-center gap-3 rounded-b-2xl">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-bold text-foreground">Unlock Smart Insights</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Get AI-powered study recommendations based on your patterns
                </p>
              </div>
              <button
                onClick={() => setShowPaywall(true)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white active:scale-95 transition-all duration-150"
                style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}
              >
                Upgrade to Premium
              </button>
            </div>
            {/* Ghost items behind blur */}
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                <div className="w-7 h-7 rounded-lg bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2.5 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <PaywallScreen open={showPaywall} onClose={() => setShowPaywall(false)} />
      </>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 flex items-center gap-3 border-b border-white/10 dark:border-white/6">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">Smart Study Insights</h3>
          <p className="text-xs text-muted-foreground">Based on your study patterns</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-semibold">
          <Sparkles className="w-3 h-3" />
          Premium
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3">
            Complete some tasks to generate insights!
          </p>
        ) : (
          insights.map((insight, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-xl border ${typeStyles[insight.type]}`}
            >
              <div className="shrink-0 mt-0.5">{insight.icon}</div>
              <div>
                <p className="text-xs font-bold leading-tight">{insight.title}</p>
                <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
