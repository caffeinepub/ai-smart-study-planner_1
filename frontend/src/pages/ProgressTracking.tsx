import React from 'react';
import { TrendingUp, Flame, CheckCircle2, Clock } from 'lucide-react';
import { useGetAllExams, useGetWeeklyProgress } from '../hooks/useQueries';
import { useLocalStreak } from '../hooks/useLocalStreak';
import { useLocalDailyProgress } from '../hooks/useLocalDailyProgress';
import AdvancedStatisticsSection from '../components/AdvancedStatisticsSection';
import AIInsightsPanel from '../components/AIInsightsPanel';

export default function ProgressTracking() {
  const { data: exams = [] } = useGetAllExams();
  const activeExam = exams[0];
  const { data: progressData } = useGetWeeklyProgress(activeExam?.id);

  // Fixed: useLocalStreak returns an object — extract currentStreak
  const { currentStreak } = useLocalStreak();
  // Fixed: useLocalDailyProgress returns an object — extract percentage
  const { percentage: dailyProgress } = useLocalDailyProgress();

  const weeklyEntries = (progressData?.weeklyEntries ?? []).map((e) => ({
    dayLabel: e.dayLabel,
    completedTasks: Number(e.completedTasks),
    totalTasks: Number(e.totalTasks),
  }));

  const totalCompleted = Number(progressData?.totalCompleted ?? 0);
  const totalPending = Number(progressData?.totalPending ?? 0);
  const totalTasks = totalCompleted + totalPending;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  // Use backend streak if available, otherwise fall back to local
  const displayStreak = progressData
    ? Number(progressData.studyStreak)
    : currentStreak;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Progress</h1>
            <p className="text-xs text-muted-foreground">
              {activeExam ? activeExam.setup.examName : 'No active plan'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* Basic progress summary — always visible to free users */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{displayStreak}</p>
            <p className="text-xs text-muted-foreground">days</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalCompleted}</p>
            <p className="text-xs text-muted-foreground">tasks</p>
          </div>
        </div>

        {/* Daily progress */}
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Today's Progress</p>
            </div>
            <span className="text-sm font-bold text-primary">{dailyProgress}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${dailyProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {completionRate}% overall completion rate
          </p>
        </div>

        {/* Advanced statistics — premium gated */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Advanced Analytics
          </p>
          <AdvancedStatisticsSection
            weeklyEntries={weeklyEntries}
            totalCompleted={totalCompleted}
            totalPending={totalPending}
          />
        </div>

        {/* AI Insights — premium gated */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Smart Insights
          </p>
          <AIInsightsPanel />
        </div>
      </div>
    </div>
  );
}
