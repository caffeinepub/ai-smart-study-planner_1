import { useMemo } from 'react';
import { useLocalStreak } from './useLocalStreak';
import { useLocalDailyProgress } from './useLocalDailyProgress';
import { useFocusSessionHistory } from './useFocusSessionHistory';
import { useGetAllExams } from './useQueries';

export type InsightType = 'suggestion' | 'feedback' | 'warning' | 'encouragement';

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  message: string;
  priority: number; // 0–100, higher = more important
}

export function useAIInsights(): AIInsight[] {
  const { currentStreak, longestStreak, lastActiveDate } = useLocalStreak();
  const { percentage: todayPercentage, completedCount, totalCount } = useLocalDailyProgress();
  const { sessions } = useFocusSessionHistory();
  const { data: exams } = useGetAllExams();

  return useMemo(() => {
    const insights: AIInsight[] = [];

    const allTasks = exams?.flatMap((e) => e.tasks) ?? [];
    const activeExam = exams && exams.length > 0 ? exams[0] : null;

    // ── Rule 1: Streak Consistency Feedback ──────────────────────────────────
    if (currentStreak >= 7) {
      insights.push({
        id: 'streak-excellent',
        type: 'encouragement',
        title: `🔥 ${currentStreak}-Day Streak — Incredible!`,
        message: `You've studied ${currentStreak} days in a row. Research shows that consistent daily practice leads to 40% better long-term retention. You're building a powerful habit!`,
        priority: 90,
      });
    } else if (currentStreak >= 3) {
      insights.push({
        id: 'streak-good',
        type: 'encouragement',
        title: `Great Consistency — ${currentStreak} Days Strong`,
        message: `You're on a ${currentStreak}-day streak! Keep going — reaching 7 days will significantly boost your memory consolidation through spaced repetition.`,
        priority: 75,
      });
    } else if (currentStreak === 1) {
      insights.push({
        id: 'streak-start',
        type: 'suggestion',
        title: 'Day 1 — The Journey Begins',
        message: `You've started your streak today! The hardest part is showing up. Study again tomorrow to build momentum — even 15 minutes counts.`,
        priority: 60,
      });
    } else if (longestStreak > 0 && currentStreak === 0) {
      // Streak was broken
      const today = new Date().toISOString().split('T')[0];
      const isToday = lastActiveDate === today;
      if (!isToday) {
        insights.push({
          id: 'streak-broken',
          type: 'warning',
          title: 'Streak Interrupted — Restart Today',
          message: `Your previous best was ${longestStreak} days. Missing a day happens — what matters is getting back on track. Start fresh today and rebuild your momentum!`,
          priority: 85,
        });
      }
    }

    // ── Rule 2: Completion Rate Trends ───────────────────────────────────────
    if (totalCount > 0) {
      if (todayPercentage >= 100) {
        insights.push({
          id: 'completion-perfect',
          type: 'encouragement',
          title: '✅ All Tasks Done Today!',
          message: `Outstanding! You've completed all ${totalCount} tasks for today. Your consistency is building the foundation for exam success. Take a well-deserved break!`,
          priority: 95,
        });
      } else if (todayPercentage >= 70) {
        insights.push({
          id: 'completion-high',
          type: 'feedback',
          title: `Strong Progress — ${todayPercentage}% Complete`,
          message: `You've finished ${completedCount} of ${totalCount} tasks today. You're in the home stretch — completing the remaining ${totalCount - completedCount} task${totalCount - completedCount !== 1 ? 's' : ''} will keep your plan on track.`,
          priority: 70,
        });
      } else if (todayPercentage < 40 && totalCount >= 2) {
        insights.push({
          id: 'completion-low',
          type: 'warning',
          title: 'Catch-Up Needed Today',
          message: `Only ${todayPercentage}% of today's tasks are done. Try a focused 25-minute Pomodoro session to tackle the remaining ${totalCount - completedCount} task${totalCount - completedCount !== 1 ? 's' : ''} before the day ends.`,
          priority: 88,
        });
      }
    } else if (activeExam) {
      insights.push({
        id: 'no-tasks-today',
        type: 'suggestion',
        title: 'No Tasks Scheduled Today',
        message: `You have no tasks scheduled for today. Consider reviewing previous topics or getting ahead on upcoming material to stay sharp.`,
        priority: 40,
      });
    }

    // ── Rule 3: Subject Weak Spots ───────────────────────────────────────────
    if (allTasks.length > 0) {
      const subjectStats: Record<string, { total: number; completed: number }> = {};
      for (const task of allTasks) {
        if (!subjectStats[task.subjectName]) {
          subjectStats[task.subjectName] = { total: 0, completed: 0 };
        }
        subjectStats[task.subjectName].total++;
        if (task.isCompleted) subjectStats[task.subjectName].completed++;
      }

      const weakSubjects = Object.entries(subjectStats)
        .filter(([, s]) => s.total >= 3 && s.completed / s.total < 0.35)
        .sort(([, a], [, b]) => a.completed / a.total - b.completed / b.total);

      if (weakSubjects.length > 0) {
        const [weakName, weakStats] = weakSubjects[0];
        const weakPct = Math.round((weakStats.completed / weakStats.total) * 100);
        insights.push({
          id: 'weak-subject',
          type: 'warning',
          title: `⚠️ Weak Spot: ${weakName}`,
          message: `Your completion rate for ${weakName} is only ${weakPct}%. Dedicate an extra 20–30 minutes to this subject — targeted practice on weak areas can improve exam scores by up to 25%.`,
          priority: 82,
        });
      }

      // Strong subject encouragement
      const strongSubjects = Object.entries(subjectStats)
        .filter(([, s]) => s.total >= 3 && s.completed / s.total >= 0.85);

      if (strongSubjects.length > 0) {
        const [strongName] = strongSubjects[0];
        insights.push({
          id: 'strong-subject',
          type: 'encouragement',
          title: `💪 Excelling at ${strongName}`,
          message: `You're crushing it in ${strongName}! Your high completion rate shows real mastery. Use this confidence to tackle your more challenging subjects.`,
          priority: 55,
        });
      }
    }

    // ── Rule 4: Revision Timing Reminders ────────────────────────────────────
    if (allTasks.length > 0) {
      const now = BigInt(Date.now()) * 1_000_000n;
      const NANOSECONDS_PER_DAY = 86_400_000_000_000n;
      const todayStart = now - (now % NANOSECONDS_PER_DAY);

      const upcomingRevisions = allTasks.filter((t) => {
        const taskDay = t.scheduledDate - (t.scheduledDate % NANOSECONDS_PER_DAY);
        const daysAhead = Number((taskDay - todayStart) / NANOSECONDS_PER_DAY);
        return t.isRevision && !t.isCompleted && daysAhead >= 0 && daysAhead <= 2;
      });

      if (upcomingRevisions.length > 0) {
        const isToday = upcomingRevisions.some((t) => {
          const taskDay = t.scheduledDate - (t.scheduledDate % NANOSECONDS_PER_DAY);
          return taskDay === todayStart;
        });

        insights.push({
          id: 'revision-upcoming',
          type: 'suggestion',
          title: isToday ? '📖 Revision Day — Reinforce Your Memory' : '📅 Revision Coming Up Soon',
          message: isToday
            ? `You have ${upcomingRevisions.length} revision task${upcomingRevisions.length !== 1 ? 's' : ''} today. Spaced repetition boosts long-term retention by up to 80% — don't skip these!`
            : `Revision sessions are scheduled in the next 2 days. Prepare by briefly reviewing your notes now to prime your memory for deeper recall.`,
          priority: isToday ? 78 : 50,
        });
      }
    }

    // ── Rule 5: Session Frequency Assessment ─────────────────────────────────
    const workSessions = sessions.filter((s) => s.phase === 'work');
    const recentSessions = workSessions.filter(
      (s) => Date.now() - s.timestamp < 7 * 24 * 60 * 60 * 1000
    );

    if (recentSessions.length === 0 && activeExam) {
      insights.push({
        id: 'no-focus-sessions',
        type: 'suggestion',
        title: 'Try a Focus Session Today',
        message: `You haven't used Focus Mode this week. Structured Pomodoro sessions (25 min work + 5 min break) can increase your productivity by up to 30%. Give it a try!`,
        priority: 65,
      });
    } else if (recentSessions.length >= 5) {
      const totalMinutes = Math.round(
        recentSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60
      );
      insights.push({
        id: 'focus-sessions-great',
        type: 'feedback',
        title: `🎯 ${recentSessions.length} Focus Sessions This Week`,
        message: `You've logged ${totalMinutes} minutes of focused study this week. Deep work sessions like these are proven to accelerate learning and improve exam performance.`,
        priority: 68,
      });
    } else if (recentSessions.length >= 2) {
      insights.push({
        id: 'focus-sessions-moderate',
        type: 'suggestion',
        title: 'Build Your Focus Habit',
        message: `You've done ${recentSessions.length} focus sessions this week. Aim for at least 5 sessions per week to build a sustainable deep-work habit that compounds over time.`,
        priority: 52,
      });
    }

    // ── Rule 6: Overall Motivational Feedback ────────────────────────────────
    if (activeExam) {
      const totalTasks = allTasks.length;
      const completedAll = allTasks.filter((t) => t.isCompleted).length;
      const overallPct = totalTasks > 0 ? Math.round((completedAll / totalTasks) * 100) : 0;

      const examDateNs = activeExam.setup.examDate;
      const nowNs = BigInt(Date.now()) * 1_000_000n;
      const NANOSECONDS_PER_DAY = 86_400_000_000_000n;
      const daysLeft = Number((examDateNs - nowNs) / NANOSECONDS_PER_DAY);

      if (daysLeft > 0 && daysLeft <= 3) {
        insights.push({
          id: 'exam-imminent',
          type: 'warning',
          title: `⏰ Exam in ${daysLeft} Day${daysLeft !== 1 ? 's' : ''}!`,
          message: `Your exam is almost here! Focus on revision and practice rather than new material. Get good sleep tonight — it consolidates memory better than last-minute cramming.`,
          priority: 98,
        });
      } else if (daysLeft > 3 && daysLeft <= 7) {
        insights.push({
          id: 'exam-soon',
          type: 'feedback',
          title: `📅 Exam in ${daysLeft} Days — Final Push`,
          message: `You're in the final week before your exam. Prioritize completing pending tasks and start light revision of completed topics to reinforce your knowledge.`,
          priority: 80,
        });
      } else if (overallPct >= 50 && daysLeft > 7) {
        insights.push({
          id: 'overall-halfway',
          type: 'encouragement',
          title: `🌟 Halfway There — ${overallPct}% Complete`,
          message: `You've completed ${overallPct}% of your entire study plan. You're making excellent progress! Maintain this pace and you'll be well-prepared for exam day.`,
          priority: 62,
        });
      } else if (overallPct < 20 && totalTasks > 5) {
        insights.push({
          id: 'overall-low',
          type: 'suggestion',
          title: 'Build Your Study Momentum',
          message: `You're at ${overallPct}% of your study plan. Starting is the hardest part — try completing just 2 tasks today to build momentum. Small wins compound into big results!`,
          priority: 72,
        });
      }
    } else {
      // No exam set up yet
      insights.push({
        id: 'no-exam',
        type: 'suggestion',
        title: 'Set Up Your Study Plan',
        message: `Create your first exam study plan to unlock personalized insights. A structured plan can improve your exam performance by up to 35% compared to unguided studying.`,
        priority: 70,
      });
    }

    // Sort by priority descending, deduplicate by id
    const seen = new Set<string>();
    return insights
      .filter((ins) => {
        if (seen.has(ins.id)) return false;
        seen.add(ins.id);
        return true;
      })
      .sort((a, b) => b.priority - a.priority);
  }, [
    currentStreak,
    longestStreak,
    lastActiveDate,
    todayPercentage,
    completedCount,
    totalCount,
    sessions,
    exams,
  ]);
}
