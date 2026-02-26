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

        {/* ── Floating Main Card (overlaps hero header) ── */}
        <div className="-mt-12 relative z-10">
          <div className="glass-card rounded-3xl p-5">
            {/* Card header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  {isRevisionDay ? (
                    <RefreshCw className="w-4 h-4 text-primary" />
                  ) : (
                    <Target className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    {isRevisionDay ? 'Revision Tasks' : "Today's Tasks"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {totalToday > 0
                      ? `${completedToday} of ${totalToday} completed`
                      : 'No tasks scheduled'}
                  </p>
                </div>
              </div>
              {totalToday > 0 && (
                <Badge
                  variant={completedToday === totalToday ? 'default' : 'secondary'}
                  className={
                    completedToday === totalToday
                      ? 'bg-emerald-500 text-white text-xs'
                      : 'text-xs'
                  }
                >
                  {completedToday === totalToday
                    ? '🎉 Done!'
                    : `${Math.round((completedToday / totalToday) * 100)}%`}
                </Badge>
              )}
            </div>

            {/* Progress bar */}
            {totalToday > 0 && (
              <div className="mb-4">
                <Progress
                  value={(completedToday / totalToday) * 100}
                  className="h-2 bg-primary/10 dark:bg-primary/20"
                />
              </div>
            )}

            {/* Revision day banner */}
            {isRevisionDay && (
              <div className="mb-4 flex items-start gap-3 p-3 rounded-xl bg-primary/8 dark:bg-primary/15 border border-primary/20">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <BookMarked className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Revision Day 📚</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Review and consolidate your knowledge. Go through your notes and test yourself on each subject.
                  </p>
                </div>
              </div>
            )}

            {/* Task list */}
            {examsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-4 flex-1 rounded" />
                  </div>
                ))}
              </div>
            ) : !activeExam ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/8 dark:bg-primary/15 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No study plan yet</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Create a study plan to see your daily tasks here.
                </p>
                <button
                  onClick={() => navigate({ to: '/setup' })}
                  className="inline-flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Create Study Plan
                </button>
              </div>
            ) : todayTasks.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No tasks today</p>
                <p className="text-xs text-muted-foreground">
                  Enjoy your rest day or review past topics!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => {
                  const isPending =
                    (markComplete.isPending || markIncomplete.isPending) &&
                    (markComplete.variables?.taskId === task.id ||
                      markIncomplete.variables?.taskId === task.id);

                  return (
                    <button
                      key={String(task.id)}
                      onClick={() =>
                        handleToggleTask(task.id, task.examId, task.isCompleted)
                      }
                      disabled={isPending}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-[0.98] ${
                        task.isCompleted
                          ? 'bg-emerald-500/8 dark:bg-emerald-400/10'
                          : 'bg-muted/40 hover:bg-muted/60'
                      } ${isPending ? 'opacity-60' : ''}`}
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            task.isCompleted
                              ? 'line-through text-muted-foreground'
                              : 'text-foreground'
                          }`}
                        >
                          {task.topicName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {task.subjectName}
                          {task.isRevision && (
                            <span className="ml-1 text-primary font-medium">· Revision</span>
                          )}
                        </p>
                      </div>
                      {isPending && (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Secondary Cards ── */}
        <div className="mt-4 space-y-4">

          {/* Reminder Banners */}
          {exams && exams.length > 0 && (
            <ReminderBanners exams={exams} />
          )}

          {/* Quick Actions */}
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

          {/* Stats Row */}
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

            {/* Exam Countdown Card */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Exam</span>
              </div>
              {activeExam ? (
                <>
                  <p className="text-2xl font-bold text-foreground">
                    {isPast ? '—' : examIsToday ? '0' : daysRemaining}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {isPast ? 'Completed' : examIsToday ? 'Today! 🍀' : 'days left'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-muted-foreground">—</p>
                  <p className="text-xs text-muted-foreground mt-0.5">No exam set</p>
                </>
              )}
            </div>
          </div>

          {/* Daily Progress Card */}
          {activeExam && (
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Daily Progress</span>
                </div>
                <span className="text-sm font-bold text-accent">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2.5 bg-accent/10 dark:bg-accent/20" />
              <p className="text-xs text-muted-foreground mt-2">
                {completedToday} of {totalToday} tasks completed today
              </p>
            </div>
          )}

          {/* Next Focus Session */}
          <NextFocusSessionCard activeExam={activeExam} tasks={todayTasks} />

          {/* Motivational cards — only show on non-revision days */}
          {!isRevisionDay && (
            <>
              <DailyMotivationCard />
              <StudyTipCard />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
