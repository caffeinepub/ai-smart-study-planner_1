import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Bell, AlertTriangle } from 'lucide-react';
import { Exam } from '../backend';

interface ReminderBannersProps {
  exams: Exam[];
}

export default function ReminderBanners({ exams }: ReminderBannersProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const now = Date.now();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  const upcomingExams = exams.filter((exam) => {
    const examDateMs = Number(exam.setup.examDate) / 1_000_000;
    const daysUntil = examDateMs - now;
    return daysUntil > 0 && daysUntil <= threeDaysMs;
  });

  const pendingTasks = exams.flatMap((exam) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime() * 1_000_000;
    const todayEndMs = todayStartMs + 86_400_000_000_000;
    return exam.tasks.filter(
      (t) =>
        !t.isCompleted &&
        Number(t.scheduledDate) >= todayStartMs &&
        Number(t.scheduledDate) < todayEndMs
    );
  });

  const banners: Array<{ id: string; type: 'warning' | 'info'; message: string }> = [];

  upcomingExams.forEach((exam) => {
    const examDateMs = Number(exam.setup.examDate) / 1_000_000;
    const daysUntil = Math.ceil((examDateMs - now) / (24 * 60 * 60 * 1000));
    banners.push({
      id: `exam-${exam.id}`,
      type: 'warning',
      message: `${exam.setup.examName} is in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}!`,
    });
  });

  if (pendingTasks.length > 0) {
    banners.push({
      id: 'pending-tasks',
      type: 'info',
      message: `You have ${pendingTasks.length} pending task${pendingTasks.length !== 1 ? 's' : ''} for today.`,
    });
  }

  const visibleBanners = banners.filter((b) => !dismissed.has(b.id));

  if (visibleBanners.length === 0) return null;

  return (
    <div className="space-y-2">
      {visibleBanners.map((banner) => (
        <Alert
          key={banner.id}
          variant={banner.type === 'warning' ? 'destructive' : 'default'}
          className="flex items-center justify-between py-2 pr-2"
        >
          <div className="flex items-center gap-2">
            {banner.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <Bell className="w-4 h-4 shrink-0" />
            )}
            <AlertDescription className="text-sm">{banner.message}</AlertDescription>
          </div>
          <button
            onClick={() => setDismissed((prev) => new Set([...prev, banner.id]))}
            className="ml-2 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </Alert>
      ))}
    </div>
  );
}
