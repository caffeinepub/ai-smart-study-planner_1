/**
 * Custom hook that assembles shareable study plan content and provides
 * a share function using the Web Share API with clipboard fallback.
 */

import { useMemo } from 'react';
import { useGetAllExams } from './useQueries';
import { useExamCountdown } from './useExamCountdown';

interface ShareStudyPlanResult {
  formattedText: string | null;
  isAvailable: boolean;
  shareStudyPlan: () => Promise<{ success: boolean; method: 'share' | 'clipboard' | 'error' }>;
}

function buildFormattedText(
  examName: string,
  examDateLabel: string,
  daysRemaining: number,
  isToday: boolean,
  isPast: boolean,
  dailyHours: number,
  subjects: Array<{ name: string; topics: string[] }>
): string {
  const countdownLine = isPast
    ? 'Exam has passed'
    : isToday
    ? 'Exam is TODAY! 🎯'
    : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining ⏳`;

  const subjectLines = subjects
    .map((s) => {
      if (s.topics.length === 0) return `  • ${s.name}`;
      const topicList = s.topics.map((t) => `    - ${t}`).join('\n');
      return `  • ${s.name}:\n${topicList}`;
    })
    .join('\n');

  return [
    '📚 My Study Plan',
    '─────────────────',
    `📝 Exam: ${examName}`,
    `📅 Date: ${examDateLabel}`,
    `⏰ ${countdownLine}`,
    `🕐 Daily study: ${dailyHours} hour${dailyHours !== 1 ? 's' : ''}`,
    '',
    '📖 Subjects & Topics:',
    subjectLines,
    '',
    '─────────────────',
    'Shared via StudyPlan App 🎓',
  ].join('\n');
}

export function useShareStudyPlan(): ShareStudyPlanResult {
  const { data: exams } = useGetAllExams();
  const activeExam = exams && exams.length > 0 ? exams[0] : null;
  const { daysRemaining, isToday, isPast } = useExamCountdown(activeExam);

  const formattedText = useMemo(() => {
    if (!activeExam) return null;

    const { examName, examDate, dailyHours, subjects } = activeExam.setup;

    // Format exam date
    const examDateMs = Number(examDate) / 1_000_000;
    const examDateLabel = new Date(examDateMs).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return buildFormattedText(
      examName,
      examDateLabel,
      daysRemaining,
      isToday,
      isPast,
      Number(dailyHours),
      subjects.map((s) => ({ name: s.name, topics: [...s.topics] }))
    );
  }, [activeExam, daysRemaining, isToday, isPast]);

  const isAvailable = formattedText !== null;

  const shareStudyPlan = async (): Promise<{
    success: boolean;
    method: 'share' | 'clipboard' | 'error';
  }> => {
    if (!formattedText) {
      return { success: false, method: 'error' };
    }

    // Try Web Share API first (mobile/modern browsers)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'My Study Plan',
          text: formattedText,
        });
        return { success: true, method: 'share' };
      } catch (err: any) {
        // User cancelled the share sheet — not an error
        if (err?.name === 'AbortError') {
          return { success: false, method: 'share' };
        }
        // Fall through to clipboard fallback
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(formattedText);
      return { success: true, method: 'clipboard' };
    } catch {
      return { success: false, method: 'error' };
    }
  };

  return { formattedText, isAvailable, shareStudyPlan };
}
