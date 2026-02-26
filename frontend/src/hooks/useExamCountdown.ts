/**
 * Custom hook that calculates the number of days remaining until the exam date.
 * Works offline using the exam object passed in.
 */

import { useMemo } from 'react';
import { Exam } from '../backend';

interface ExamCountdownResult {
  daysRemaining: number;
  isToday: boolean;
  isPast: boolean;
}

function startOfDayMs(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function useExamCountdown(exam: Exam | null): ExamCountdownResult {
  return useMemo(() => {
    if (!exam) {
      return { daysRemaining: 0, isToday: false, isPast: false };
    }

    // examDate is in nanoseconds (bigint)
    const examDateMs = Number(exam.setup.examDate) / 1_000_000;
    const examDayStart = startOfDayMs(new Date(examDateMs));
    const todayStart = startOfDayMs(new Date());

    const diffMs = examDayStart - todayStart;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { daysRemaining: 0, isToday: true, isPast: false };
    } else if (diffDays < 0) {
      return { daysRemaining: Math.abs(diffDays), isToday: false, isPast: true };
    } else {
      return { daysRemaining: diffDays, isToday: false, isPast: false };
    }
  }, [exam]);
}
