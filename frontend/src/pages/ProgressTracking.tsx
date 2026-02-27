import React, { useMemo } from 'react';
import { TrendingUp, Flame, CheckCircle2, Clock, BookOpen, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetAllExams, useGetWeeklyProgress } from '../hooks/useQueries';
import { useLocalStreak } from '../hooks/useLocalStreak';
import { useLocalDailyProgress } from '../hooks/useLocalDailyProgress';
import { useGuestMode } from '../hooks/useGuestMode';
import { Skeleton } from '@/components/ui/skeleton';
import AIInsightsPanel from '../components/AIInsightsPanel';

// ── Custom Tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs rounded-lg shadow-lg">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-primary">Completed: {payload[0]?.value ?? 0}</p>
        {payload[1] && <p className="text-muted-foreground">Total: {payload[1]?.value ?? 0}</p>}
      </div>
    );
  }
  return null;
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, sub, accent }) => (
  <div className="glass-card rounded-2xl p-4 flex flex-col gap-2">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ?? 'bg-primary/10'}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────

const EmptyProgressState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
      <BarChart2 className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-lg font-bold text-foreground mb-2">No Study Plan Yet</h3>
    <p className="text-sm text-muted-foreground max-w-xs">
      Create your first exam study plan to start tracking your progress here.
    </p>
  </div>
);

// ── Loading Skeleton ──────────────────────────────────────────────────────────

const ProgressSkeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-6 w-40 rounded-lg" />
    <div className="grid grid-cols-2 gap-3">
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-28 rounded-2xl" />
    </div>
    <Skeleton className="h-48 rounded-2xl" />
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const ProgressTracking: React.FC = () => {
  const { isGuestMode } = useGuestMode();
  const { data: exams, isLoading: examsLoading } = useGetAllExams();
  const localStreak = useLocalStreak();
  const localProgress = useLocalDailyProgress();

  // Use the first exam for progress tracking
  const activeExam = exams && exams.length > 0 ? exams[0] : null;
  const examId = activeExam ? activeExam.id : null;

  const {
    data: progressData,
    isLoading: progressLoading,
  } = useGetWeeklyProgress(examId);

  const isLoading = examsLoading || (examId !== null && progressLoading);

  // Build chart data from weekly entries
  const chartData = useMemo(() => {
    if (!progressData || !progressData.weeklyEntries || progressData.weeklyEntries.length === 0) {
      return [];
    }
    return progressData.weeklyEntries.map(entry => ({
      day: entry.dayLabel,
      completed: Number(entry.completedTasks),
      total: Number(entry.totalTasks),
    }));
  }, [progressData]);

  // Determine streak: prefer backend data, fall back to local
  const streak = progressData
    ? Number(progressData.studyStreak)
    : (localStreak?.currentStreak ?? 0);

  const totalCompleted = progressData ? Number(progressData.totalCompleted) : localProgress.completedCount;
  const totalPending = progressData ? Number(progressData.totalPending) : 0;

  // Today's progress from local hook (always available)
  const todayPercentage = localProgress.percentage;
  const todayCompleted = localProgress.completedCount;
  const todayTotal = localProgress.totalCount;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ProgressSkeleton />
      </div>
    );
  }

  // No exams yet — show empty state + AI insights panel (for no-exam insight)
  if (!activeExam) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-xl font-bold text-foreground">Progress</h1>
          <p className="text-sm text-muted-foreground">Track your study journey</p>
        </div>
        <EmptyProgressState />
        <div className="px-4 pb-8">
          <AIInsightsPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-foreground">Progress</h1>
        <p className="text-sm text-muted-foreground">
          {activeExam.setup.examName}
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            label="Day Streak"
            value={streak}
            sub="consecutive days"
            accent="bg-orange-500/10"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            label="Completed"
            value={totalCompleted}
            sub="total tasks done"
            accent="bg-emerald-500/10"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-primary" />}
            label="Pending"
            value={totalPending}
            sub="tasks remaining"
            accent="bg-primary/10"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-violet-500" />}
            label="Today"
            value={`${todayPercentage}%`}
            sub={`${todayCompleted}/${todayTotal} tasks`}
            accent="bg-violet-500/10"
          />
        </div>

        {/* Weekly Chart */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Weekly Activity</h2>
          </div>

          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Complete tasks to see your weekly activity chart.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="currentColor" fillOpacity={0.12} radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="oklch(0.55 0.22 264)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* AI Insights Panel */}
        <AIInsightsPanel />

        {/* Guest mode notice */}
        {isGuestMode && (
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs text-muted-foreground text-center">
              📊 Progress is saved locally. Log in to sync across devices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracking;
