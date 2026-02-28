import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, Award, Target, Sparkles } from 'lucide-react';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';
import PaywallScreen from './PaywallScreen';
import type { ProgressData } from '../backend';

interface AdvancedStatisticsSectionProps {
  progressData: ProgressData | undefined;
}

export default function AdvancedStatisticsSection({ progressData }: AdvancedStatisticsSectionProps) {
  const { isPremium, isLoading: premiumLoading } = useConsolidatedPremiumStatus();
  const [showPaywall, setShowPaywall] = useState(false);

  if (premiumLoading) {
    return (
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b border-white/10 dark:border-white/6">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground">Advanced Statistics</h3>
            <p className="text-xs text-muted-foreground">Detailed performance analytics</p>
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
          <div className="p-4 flex items-center gap-3 border-b border-white/10 dark:border-white/6">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">Advanced Statistics</h3>
              <p className="text-xs text-muted-foreground">Detailed performance analytics</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              Premium
            </div>
          </div>
          <div className="p-4 space-y-3">
            {/* Blurred preview */}
            <div className="relative h-32 rounded-xl bg-muted/30 overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-[2px] bg-background/40 z-10 flex flex-col items-center justify-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                <p className="text-xs font-semibold text-foreground">Detailed Charts & Analytics</p>
              </div>
              <div className="p-3 opacity-30">
                <div className="flex items-end gap-1 h-20">
                  {[40, 65, 30, 80, 55, 70, 90].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPaywall(true)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-all duration-150"
              style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}
            >
              Unlock Advanced Statistics
            </button>
          </div>
        </div>

        {showPaywall && (
          <PaywallScreen onClose={() => setShowPaywall(false)} featureName="Advanced Statistics" />
        )}
      </>
    );
  }

  if (!progressData) {
    return (
      <div className="glass-card rounded-2xl p-4 text-center text-sm text-muted-foreground">
        No progress data available yet. Start completing tasks to see your statistics.
      </div>
    );
  }

  const chartData = progressData.weeklyEntries.map((entry) => ({
    day: entry.dayLabel,
    completed: Number(entry.completedTasks),
    total: Number(entry.totalTasks),
    rate: Number(entry.totalTasks) > 0
      ? Math.round((Number(entry.completedTasks) / Number(entry.totalTasks)) * 100)
      : 0,
  }));

  const totalCompleted = Number(progressData.totalCompleted);
  const totalPending = Number(progressData.totalPending);
  const totalTasks = totalCompleted + totalPending;
  const overallRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const streak = Number(progressData.studyStreak);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 flex items-center gap-3 border-b border-white/10 dark:border-white/6">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">Advanced Statistics</h3>
          <p className="text-xs text-muted-foreground">Your performance breakdown</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-semibold">
          <Sparkles className="w-3 h-3" />
          Premium
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Target className="w-3.5 h-3.5" />, label: 'Completion', value: `${overallRate}%`, color: 'text-primary' },
            { icon: <Award className="w-3.5 h-3.5" />, label: 'Streak', value: `${streak}d`, color: 'text-amber-500' },
            { icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'Done', value: totalCompleted.toString(), color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border text-center">
              <div className={`flex justify-center mb-1 ${stat.color}`}>{stat.icon}</div>
              <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Weekly completion rate chart */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Weekly Completion Rate</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="day" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Completion']}
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.rate >= 80 ? '#10b981' : entry.rate >= 50 ? '#6366f1' : '#f59e0b'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
