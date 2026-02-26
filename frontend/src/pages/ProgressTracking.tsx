import React from 'react';
import { useGetAllExams, useGetWeeklyProgress } from '../hooks/useQueries';
import PremiumGate from '../components/PremiumGate';
import StatisticsSection from '../components/StatisticsSection';
import StudyInsightsSection from '../components/StudyInsightsSection';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Flame, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

function ProgressContent() {
  const { data: exams = [] } = useGetAllExams();
  const activeExamId = exams.length > 0 ? exams[0].id : null;
  const { data: progressData, isLoading, error } = useGetWeeklyProgress(activeExamId);

  if (isLoading) {
    return (
      <div className="p-5 space-y-5">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <div className="p-5 text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="font-semibold text-sm">
          {exams.length === 0 ? 'No study plan yet' : 'Unable to load progress'}
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          {exams.length === 0
            ? 'Create a study plan first to track your progress.'
            : 'Please try again later.'}
        </p>
      </div>
    );
  }

  const chartData = progressData.weeklyEntries.map((entry) => ({
    day: entry.dayLabel,
    completed: Number(entry.completedTasks),
    total: Number(entry.totalTasks),
  }));

  const streak = Number(progressData.studyStreak);
  const totalCompleted = Number(progressData.totalCompleted);
  const totalPending = Number(progressData.totalPending);

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight">Progress Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Track your study performance over time.
        </p>
      </div>

      {/* Statistics Section — always visible */}
      <StatisticsSection />

      {/* Streak Card — Prominent */}
      <div className="rounded-2xl p-5 shadow-primary relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}>
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -right-2 bottom-0 w-20 h-20 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Study Streak</p>
            <p className="text-4xl font-bold text-white leading-none mt-0.5">{streak}</p>
            <p className="text-white/70 text-xs mt-0.5">
              {streak === 1 ? 'day' : 'days'} in a row 🔥
            </p>
          </div>
        </div>
      </div>

      {/* Study Insights — Premium gated */}
      <PremiumGate featureName="advanced-progress-analytics">
        <StudyInsightsSection />
      </PremiumGate>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-card space-y-2">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalCompleted}</p>
            <p className="text-xs text-muted-foreground font-medium">Tasks Completed</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-card space-y-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalPending}</p>
            <p className="text-xs text-muted-foreground font-medium">Tasks Pending</p>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-card">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm">Weekly Overview</h2>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 264)" opacity={0.5} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: 'oklch(0.52 0.04 264)', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'oklch(0.52 0.04 264)', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(1 0 0)',
                  border: '1px solid oklch(0.90 0.02 264)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  boxShadow: '0 4px 16px rgba(99,102,241,0.12)',
                }}
                cursor={{ fill: 'oklch(0.51 0.22 264 / 0.06)' }}
              />
              <Bar
                dataKey="completed"
                fill="oklch(0.51 0.22 264)"
                radius={[6, 6, 0, 0]}
                name="Completed"
                maxBarSize={32}
              />
              <Bar
                dataKey="total"
                fill="oklch(0.90 0.02 264)"
                radius={[6, 6, 0, 0]}
                name="Total"
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'oklch(0.51 0.22 264)' }} />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProgressTracking() {
  return (
    <PremiumGate featureName="advanced-analytics">
      <ProgressContent />
    </PremiumGate>
  );
}
