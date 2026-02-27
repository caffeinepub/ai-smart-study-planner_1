import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Flame,
  Target,
  Trophy,
  RefreshCw,
  BookMarked,
  Plus,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  useGetAllExams,
  useMarkTaskComplete,
  useMarkTaskIncomplete,
} from '../hooks/useQueries';
import { useLocalProfile } from '../hooks/useLocalProfile';
import { useLocalStreak } from '../hooks/useLocalStreak';
import { useLocalDailyProgress } from '../hooks/useLocalDailyProgress';
import { useExamCountdown } from '../hooks/useExamCountdown';
import { useCelebrationTrigger } from '../hooks/useCelebrationTrigger';
import CelebrationAnimation from '../components/CelebrationAnimation';
import DailyMotivationCard from '../components/DailyMotivationCard';
import StudyTipCard from '../components/StudyTipCard';
import NextFocusSessionCard from '../components/NextFocusSessionCard';
import ReminderBanners from '../components/ReminderBanners';
import StudyCompanion from '../components/StudyCompanion';
import ShareButton from '../components/ShareButton';
import AIInsightsSummaryCard from '../components/AIInsightsSummaryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { DailyTask } from '../backend';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { displayName } = useLocalProfile();
  const { currentStreak: streak } = useLocalStreak();
  const { updateProgress } = useLocalDailyProgress();

  const { data: exams, isLoading: examsLoading } = useGetAllExams();
  const markComplete = useMarkTaskComplete();
  const markIncomplete = useMarkTaskIncomplete();

  const activeExam = exams && exams.length > 0 ? exams[0] : null;

  // Derive today's tasks from the active exam
  const [todayTasks, setTodayTasks] = useState<DailyTask[]>([]);

  useEffect(() => {
    if (!activeExam) {
      setTodayTasks([]);
      return;
    }
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();
    const nsPerMs = BigInt(1_000_000);
    const filtered = activeExam.tasks.filter((t) => {
      const taskDayMs = Number(t.scheduledDate / nsPerMs);
      const taskDay = new Date(taskDayMs);
      taskDay.setHours(0, 0, 0, 0);
      return taskDay.getTime() === todayMs;
    });
    setTodayTasks(filtered);
  }, [activeExam]);

  const completedToday = todayTasks.filter((t) => t.isCompleted).length;
  const totalToday = todayTasks.length;
  const progressPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // Sync local daily progress store
  useEffect(() => {
    updateProgress(completedToday, totalToday);
  }, [completedToday, totalToday, updateProgress]);

  // Exam countdown
  const { daysRemaining, isToday: examIsToday, isPast } = useExamCountdown(activeExam);

  // Celebration
  const { showCelebration, dismissCelebration } = useCelebrationTrigger(progressPct);

  // Determine if today is a revision day (all tasks are revision tasks)
  const isRevisionDay = totalToday > 0 && todayTasks.every((t) => t.isRevision);

  const handleToggleTask = async (taskId: bigint, examId: bigint, isCompleted: boolean) => {
    if (isCompleted) {
      await markIncomplete.mutateAsync({ examId, taskId });
    } else {
      await markComplete.mutateAsync({ examId, taskId });
    }
  };

  const userName = displayName || 'Studier';
  const greeting = getGreeting();
  const dateStr = formatDate();

  return (
    <div className="min-h-screen bg-background">
      {/* Celebration overlay */}
      <CelebrationAnimation show={showCelebration} onComplete={dismissCelebration} />

      {/* ── Hero Header ── */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 pt-6 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-xl pointer-events-none" />

        <div className="relative max-w-lg mx-auto">
          <p className="text-indigo-200 text-sm font-medium mb-1">{dateStr}</p>
          <h1 className="text-white text-2xl font-bold leading-tight">
            {greeting}, {userName}! 👋
          </h1>
          <p className="text-indigo-100 text-sm mt-1 opacity-90">
            {activeExam
              ? `Studying for ${activeExam.setup.examName}`
              : 'Ready to start your study journey?'}
          </p>

          {/* Quick stat pills */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-300" />
              <span className="text-white text-xs font-semibold">{streak} day streak</span>
            </div>
            {activeExam && (
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-200" />
                <span className="text-white text-xs font-semibold">
                  {isPast ? 'Exam passed' : examIsToday ? 'Exam today!' : `${daysRemaining}d left`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="max-w-lg mx-auto px-4 pb-28">

        {/* ── Floating section (overlaps hero header) ── */}
        <div className="-mt-12 relative z-10 space-y-4">

          {/* ── 1. Stats Row: Streak + Today's Progress ── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Streak Card */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-orange-400/10 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Streak</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{streak}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {streak === 1 ? 'day' : 'days'} in a row
              </p>
            </div>

            {/* Today's Progress Card */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Today</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{progressPct}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalToday > 0 ? `${completedToday}/${totalToday} tasks` : 'No tasks'}
              </p>
            </div>
          </div>

          {/* ── 2. Quick Actions ── */}
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => navigate({ to: '/setup' })}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-primary/8 dark:bg-primary/15 hover:bg-primary/12 dark:hover:bg-primary/20 transition-colors active:scale-95"
              >
                <Plus className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium text-primary">Add Plan</span>
              </button>
              <button
                onClick={() => navigate({ to: '/focus' })}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-accent/8 dark:bg-accent/15 hover:bg-accent/12 dark:hover:bg-accent/20 transition-colors active:scale-95"
              >
                <Zap className="w-5 h-5 text-accent" />
                <span className="text-xs font-medium text-accent">Focus</span>
              </button>
              <button
                onClick={() => navigate({ to: '/progress' })}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-emerald-500/8 dark:bg-emerald-400/10 hover:bg-emerald-500/12 dark:hover:bg-emerald-400/15 transition-colors active:scale-95"
              >
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Progress</span>
              </button>
            </div>
          </div>

          {/* ── 3. Today's Tasks Card ── */}
          <div className="glass-card rounded-3xl p-5">
            {/* Card header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    {isRevisionDay ? '📖 Revision Day' : "Today's Tasks"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {totalToday > 0
                      ? `${completedToday} of ${totalToday} complete`
                      : 'No tasks scheduled'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShareButton />
                {totalToday > 0 && (
                  <Badge
                    variant={progressPct === 100 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {progressPct}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {totalToday > 0 && (
              <div className="mb-4">
                <Progress value={progressPct} className="h-1.5" />
              </div>
            )}

            {/* Loading state */}
            {examsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
              </div>
            ) : todayTasks.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                {activeExam ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">All caught up!</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        No tasks scheduled for today. Check back tomorrow.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <BookMarked className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">No study plan yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Set up your exam to get personalized daily tasks.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate({ to: '/setup' })}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white active:scale-95 transition-all duration-150"
                      style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}
                    >
                      Create Study Plan
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Task list */
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <button
                    key={task.id.toString()}
                    onClick={() => handleToggleTask(task.id, task.examId, task.isCompleted)}
                    disabled={markComplete.isPending || markIncomplete.isPending}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 active:scale-[0.98] text-left ${
                      task.isCompleted
                        ? 'bg-emerald-500/8 border-emerald-500/20 dark:bg-emerald-400/8 dark:border-emerald-400/20'
                        : 'bg-card border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      task.isCompleted
                        ? 'text-emerald-500 dark:text-emerald-400'
                        : 'text-muted-foreground/40'
                    }`}>
                      {task.isCompleted
                        ? <CheckCircle2 className="w-5 h-5" />
                        : <Circle className="w-5 h-5" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${
                        task.isCompleted
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}>
                        {task.topicName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {task.subjectName}
                        {task.isRevision && (
                          <span className="ml-1.5 text-primary font-medium">· Revision</span>
                        )}
                      </p>
                    </div>
                    {(markComplete.isPending || markIncomplete.isPending) && (
                      <RefreshCw className="w-3.5 h-3.5 text-muted-foreground animate-spin shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── 4. Reminder Banners ── */}
          <ReminderBanners exams={exams ?? []} />

          {/* ── 5. AI Insights Summary Card ── */}
          <AIInsightsSummaryCard />

          {/* ── 6. Study Companion ── */}
          <StudyCompanion />

          {/* ── 7. Daily Motivation ── */}
          <DailyMotivationCard />

          {/* ── 8. Study Tip ── */}
          <StudyTipCard />

          {/* ── 9. Next Focus Session ── */}
          <NextFocusSessionCard activeExam={activeExam} tasks={todayTasks} />
        </div>
      </div>
    </div>
  );
}
