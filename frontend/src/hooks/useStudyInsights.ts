/**
 * Custom hook that analyzes localStorage data to generate personalized study insights.
 * Returns an array of insight objects with id, iconName, and text.
 */

import { useMemo } from 'react';

export interface StudyInsight {
  id: string;
  iconName: string;
  text: string;
}

function readNumber(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const n = parseInt(raw, 10);
      return isNaN(n) ? 0 : n;
    }
  } catch {
    // ignore
  }
  return 0;
}

function readStreak(): number {
  try {
    const raw = localStorage.getItem('studyStreak');
    if (raw) {
      const parsed = JSON.parse(raw);
      return typeof parsed?.count === 'number' ? parsed.count : 0;
    }
  } catch {
    // ignore
  }
  return 0;
}

function readDailyProgress(): { percentage: number; completedCount: number; totalCount: number } {
  try {
    const raw = localStorage.getItem('dailyProgress');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        percentage: parsed?.percentage ?? 0,
        completedCount: parsed?.completedCount ?? 0,
        totalCount: parsed?.totalCount ?? 0,
      };
    }
  } catch {
    // ignore
  }
  return { percentage: 0, completedCount: 0, totalCount: 0 };
}

function readWeeklyLog(): Record<string, number> {
  try {
    const raw = localStorage.getItem('weeklyFocusLog');
    if (raw) return JSON.parse(raw) as Record<string, number>;
  } catch {
    // ignore
  }
  return {};
}

export function useStudyInsights(): StudyInsight[] {
  return useMemo(() => {
    const streak = readStreak();
    const sessionCount = readNumber('focusSessionCount');
    const totalMinutes = readNumber('focusTotalMinutes');
    const { percentage, completedCount, totalCount } = readDailyProgress();
    const weeklyLog = readWeeklyLog();
    const weeklyMinutes = Object.values(weeklyLog).reduce((a, b) => a + b, 0);
    const activeDays = Object.values(weeklyLog).filter((v) => v > 0).length;

    const insights: StudyInsight[] = [];

    // Not enough data yet
    if (sessionCount === 0 && completedCount === 0 && streak === 0) {
      return [];
    }

    // Streak insight
    if (streak >= 7) {
      insights.push({
        id: 'streak-fire',
        iconName: 'Flame',
        text: `🔥 You're on a ${streak}-day streak! Incredible consistency — keep the momentum going!`,
      });
    } else if (streak >= 3) {
      insights.push({
        id: 'streak-good',
        iconName: 'Flame',
        text: `You've studied ${streak} days in a row. You're building a great habit!`,
      });
    } else if (streak === 1) {
      insights.push({
        id: 'streak-start',
        iconName: 'Zap',
        text: `Great start! You've begun your streak. Come back tomorrow to keep it going.`,
      });
    }

    // Focus time insight
    if (totalMinutes >= 120) {
      const hours = Math.floor(totalMinutes / 60);
      insights.push({
        id: 'focus-time',
        iconName: 'Clock',
        text: `You've accumulated ${hours}+ hours of focused study time. That's serious dedication!`,
      });
    } else if (totalMinutes >= 25) {
      insights.push({
        id: 'focus-start',
        iconName: 'Clock',
        text: `You've completed ${Math.floor(totalMinutes / 25)} Pomodoro session${sessionCount !== 1 ? 's' : ''}. Focus sessions are building your concentration.`,
      });
    }

    // Session count insight
    if (sessionCount >= 10) {
      insights.push({
        id: 'sessions-milestone',
        iconName: 'Trophy',
        text: `${sessionCount} focus sessions completed! You're a Pomodoro pro.`,
      });
    }

    // Daily progress insight
    if (percentage === 100 && totalCount > 0) {
      insights.push({
        id: 'daily-complete',
        iconName: 'CheckCircle2',
        text: `You completed all ${totalCount} tasks today! Perfect day — treat yourself to a break.`,
      });
    } else if (percentage >= 50 && totalCount > 0) {
      insights.push({
        id: 'daily-halfway',
        iconName: 'TrendingUp',
        text: `You're ${percentage}% through today's tasks (${completedCount}/${totalCount}). You're over halfway there!`,
      });
    } else if (completedCount > 0) {
      insights.push({
        id: 'daily-progress',
        iconName: 'BookOpen',
        text: `You've completed ${completedCount} task${completedCount !== 1 ? 's' : ''} today. Every step counts!`,
      });
    }

    // Weekly activity insight
    if (activeDays >= 5) {
      insights.push({
        id: 'weekly-active',
        iconName: 'Calendar',
        text: `You studied ${activeDays} out of 7 days this week. Excellent weekly consistency!`,
      });
    } else if (weeklyMinutes >= 60) {
      const hours = Math.floor(weeklyMinutes / 60);
      insights.push({
        id: 'weekly-time',
        iconName: 'BarChart2',
        text: `You've focused for ${hours}+ hours this week. Keep building that weekly habit!`,
      });
    }

    return insights.slice(0, 5);
  }, []);
}
