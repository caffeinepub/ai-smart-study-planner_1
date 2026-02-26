import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Flame,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  useGetAllExams,
  useGetTodayTasks,
  useGetDayProgress,
  useMarkTaskComplete,
  useMarkTaskIncomplete,
  useGetCallerUserProfile,
} from '../hooks/useQueries';
import ReminderBanners from '../components/ReminderBanners';
import PaywallScreen from '../components/PaywallScreen';
import { usePaywallTrigger } from '../hooks/usePaywallTrigger';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { useGuestMode } from '../hooks/useGuestMode';
import { useLocalStreak } from '../hooks/useLocalStreak';
import { useLocalDailyProgress } from '../hooks/useLocalDailyProgress';
import { useExamCountdown } from '../hooks/useExamCountdown';
import { useCelebrationTrigger } from '../hooks/useCelebrationTrigger';
import CelebrationAnimation from '../components/CelebrationAnimation';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function AnimatedProgressBar({ percentage }: { percentage: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), 150);
    return () => clearTimeout(t);
  }, [percentage]);

  return (
    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${width}%`,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
        }}
      />
    </div>
  );
}

export default function Dashboard() {
  const { data: exams = [], isLoading: examsLoading } = useGetAllExams();
  const { data: userProfile } = useGetCallerUserProfile();
  const [selectedExamId, setSelectedExamId] = useState<bigint | null>(null);
  const { shouldShowPaywall, markTaskCompleted, dismissPaywall } = usePaywallTrigger();
  const { isPremium } = useSubscriptionContext();
  const { isGuestMode } = useGuestMode();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const activeExamId = selectedExamId ?? (exams.length > 0 ? exams[0].id : null);
  const activeExam = exams.find((e) => e.id === activeExamId) ?? null;

  const { data: tasks = [], isLoading: tasksLoading } = useGetTodayTasks(activeExamId);
  const { data: progress } = useGetDayProgress(activeExamId);
  const markComplete = useMarkTaskComplete();
  const markIncomplete = useMarkTaskIncomplete();

  // Engagement hooks
  const { streak, incrementStreak, checkAndResetStreak } = useLocalStreak();
  const { percentage: localPercentage, completedCount: localCompleted, totalCount: localTotal } = useLocalDailyProgress(tasks);
  const countdown = useExamCountdown(activeExam);
  const { showCelebration, dismissCelebration } = useCelebrationTrigger(localPercentage);

  // Check and reset streak on mount
  useEffect(() => {
    checkAndResetStreak();
    // Fade-in animation
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [checkAndResetStreak]);

  useEffect(() => {
    if (shouldShowPaywall && !isPremium) {
      setPaywallOpen(true);
    }
  }, [shouldShowPaywall, isPremium]);

  const handleTaskToggle = async (taskId: bigint, isCompleted: boolean) => {
    if (!activeExamId) return;
    if (isCompleted) {
      await markIncomplete.mutateAsync({ examId: activeExamId, taskId });
    } else {
      await markComplete.mutateAsync({ examId: activeExamId, taskId });
      markTaskCompleted();
      incrementStreak();
    }
  };

  const completedCount = Number(progress?.completedTasks ?? 0);
  const totalCount = Number(progress?.totalTasks ?? 0);
  const percentage = Number(progress?.percentage ?? 0);

  const greeting = getGreeting();
  const displayName = isGuestMode ? 'Guest' : (userProfile?.name ?? '');
  const greetingText = displayName ? `${greeting}, ${displayName}!` : `${greeting}!`;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const pageStyle: React.CSSProperties = {
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
    transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
  };

  if (isGuestMode && exams.length === 0 && !examsLoading) {
    return (
      <div
        className="min-h-screen dashboard-gradient tab-safe-bottom"
        style={pageStyle}
      >
        <div className="p-5 space-y-5">
          <ReminderBanners exams={exams} />

          {/* Greeting */}
          <div className="pt-2 space-y-1">
            <p className="text-sm text-white/70 font-medium">{today}</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">{greetingText}</h1>
          </div>

          {/* Streak Card */}
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 text-orange-300" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium">Study Streak</p>
              <p className="text-white text-xl font-bold">{streak} {streak === 1 ? 'day' : 'days'}</p>
            </div>
          </div>

          <div className="text-center py-10 space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Welcome to StudyPlan!</h2>
              <p className="text-white/70 text-sm mt-1.5 max-w-xs mx-auto">
                You're in guest mode. Create your first study plan to get started.
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-left space-y-2 max-w-xs mx-auto">
              <p className="text-sm font-semibold text-white">Guest Mode Features:</p>
              <ul className="text-xs text-white/70 space-y-1.5">
                {['Basic study planning', 'Daily dashboard', 'Study timer', 'Basic reminders'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                    {f}
                  </li>
                ))}
                <li className="flex items-center gap-2 opacity-50">
                  <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                  </span>
                  Cloud sync (requires login)
                </li>
              </ul>
            </div>
            <button
              onClick={() => { window.location.href = '/setup'; }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm bg-white text-indigo-700 shadow-lg active:scale-[0.97] transition-all duration-150 hover:bg-white/90"
            >
              <BookOpen className="w-4 h-4" />
              Create Study Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen dashboard-gradient tab-safe-bottom"
      style={pageStyle}
    >
      <div className="p-5 space-y-5">
        <ReminderBanners exams={exams} />

        {/* Greeting Header */}
        <div className="pt-2 space-y-1">
          <p className="text-sm text-white/70 font-medium">{today}</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">{greetingText}</h1>
          <p className="text-white/60 text-sm">Ready to crush your goals today?</p>
        </div>

        {/* Stats Row: Streak + Countdown */}
        <div className="grid grid-cols-2 gap-3">
          {/* Streak Card */}
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-orange-400/30 flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-300" />
              </div>
              <p className="text-white/70 text-xs font-medium">Streak</p>
            </div>
            <p className="text-white text-2xl font-bold leading-none">{streak}</p>
            <p className="text-white/60 text-xs mt-1">{streak === 1 ? 'day' : 'days'} in a row</p>
          </div>

          {/* Exam Countdown Card */}
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-yellow-400/30 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-yellow-300" />
              </div>
              <p className="text-white/70 text-xs font-medium">Exam</p>
            </div>
            {activeExam ? (
              countdown.isToday ? (
                <>
                  <p className="text-yellow-300 text-lg font-bold leading-none">Today!</p>
                  <p className="text-white/60 text-xs mt-1">Good luck! 🍀</p>
                </>
              ) : countdown.isPast ? (
                <>
                  <p className="text-white/60 text-lg font-bold leading-none">Done</p>
                  <p className="text-white/50 text-xs mt-1">Exam passed</p>
                </>
              ) : (
                <>
                  <p className="text-white text-2xl font-bold leading-none">{countdown.daysRemaining}</p>
                  <p className="text-white/60 text-xs mt-1">days left</p>
                </>
              )
            ) : (
              <>
                <p className="text-white/40 text-lg font-bold leading-none">—</p>
                <p className="text-white/40 text-xs mt-1">No exam set</p>
              </>
            )}
          </div>
        </div>

        {/* Exam Selector */}
        {exams.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {exams.map((exam) => (
              <button
                key={exam.id.toString()}
                onClick={() => setSelectedExamId(exam.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  exam.id === activeExamId
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'bg-white/15 border border-white/20 text-white/80 hover:bg-white/25'
                }`}
              >
                {exam.setup.examName}
              </button>
            ))}
          </div>
        )}

        {/* Progress Overview Card */}
        {activeExam && (
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Today's Progress</p>
                <p className="font-bold text-base text-white">{activeExam.setup.examName}</p>
                <p className="text-white/60 text-xs flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(Number(activeExam.setup.examDate) / 1_000_000).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white leading-none">{localPercentage}%</p>
                <p className="text-white/60 text-xs mt-1">
                  {localCompleted}/{localTotal} done
                </p>
              </div>
            </div>
            <AnimatedProgressBar percentage={localPercentage} />
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/80" />
                <span className="text-xs text-white/70">{localCompleted} completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/30" />
                <span className="text-xs text-white/70">{localTotal - localCompleted} remaining</span>
              </div>
            </div>
          </div>
        )}

        {/* Today's Study Tasks Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-indigo-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              Today's Tasks
            </h2>
            {tasks.length > 0 && (
              <span className="text-xs text-indigo-400 font-medium bg-indigo-50 px-2.5 py-1 rounded-full">
                {tasks.filter(t => t.isCompleted).length}/{tasks.length}
              </span>
            )}
          </div>

          <div className="px-5 pb-5">
            {examsLoading || tasksLoading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-indigo-900">
                    {exams.length === 0 ? 'No study plan yet' : 'All caught up!'}
                  </p>
                  <p className="text-indigo-400 text-xs mt-1">
                    {exams.length === 0
                      ? 'Head to Setup to create your first study plan.'
                      : 'No tasks scheduled for today. Great job staying ahead!'}
                  </p>
                </div>
                {exams.length === 0 && (
                  <button
                    onClick={() => { window.location.href = '/setup'; }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95 transition-all duration-150"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Create Study Plan
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task) => {
                  const isMutating =
                    (markComplete.isPending || markIncomplete.isPending) &&
                    (markComplete.variables?.taskId === task.id ||
                      markIncomplete.variables?.taskId === task.id);

                  return (
                    <div
                      key={task.id.toString()}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-200 ${
                        task.isCompleted
                          ? 'bg-indigo-50/60 border-indigo-100'
                          : 'bg-white border-indigo-100 hover:border-indigo-200 hover:shadow-sm'
                      }`}
                    >
                      <Checkbox
                        checked={task.isCompleted}
                        disabled={isMutating}
                        onCheckedChange={() => handleTaskToggle(task.id, task.isCompleted)}
                        className="mt-0.5 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold leading-tight transition-all duration-200 ${
                            task.isCompleted
                              ? 'line-through text-indigo-300'
                              : 'text-indigo-900'
                          }`}
                        >
                          {task.topicName}
                        </p>
                        <p className="text-xs text-indigo-400 mt-0.5 font-medium">{task.subjectName}</p>
                      </div>
                      {task.isRevision && (
                        <span className="text-[10px] shrink-0 rounded-full px-2 py-0.5 bg-violet-100 text-violet-600 font-semibold">
                          Revision
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Primary CTA — Start Focus Session */}
        {tasks.length > 0 && tasks.some(t => !t.isCompleted) && (
          <button
            onClick={() => { window.location.href = '/focus'; }}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-base text-white bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 active:scale-[0.97] transition-all duration-150 shadow-lg"
          >
            <Timer className="w-5 h-5" />
            Start Focus Session
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* All done CTA */}
        {tasks.length > 0 && tasks.every(t => t.isCompleted) && (
          <div className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-base text-white bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
            <span className="text-xl">🎉</span>
            All tasks complete!
          </div>
        )}

        {/* Upgrade nudge for free users */}
        {!isPremium && exams.length > 0 && (
          <button
            onClick={() => setPaywallOpen(true)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 active:scale-[0.98] transition-all duration-150"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-white">Upgrade to Premium</p>
              <p className="text-xs text-white/60">Unlock AI scheduling, analytics & more</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/60" />
          </button>
        )}

        {/* Bottom spacer */}
        <div className="h-2" />
      </div>

      {/* Celebration Animation */}
      <CelebrationAnimation show={showCelebration} onComplete={dismissCelebration} />

      <PaywallScreen
        open={paywallOpen}
        onClose={() => {
          setPaywallOpen(false);
          dismissPaywall();
        }}
      />
    </div>
  );
}
