import React from 'react';
import { Timer } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { Exam, DailyTask } from '../backend';

interface NextFocusSessionCardProps {
  activeExam: Exam | null;
  tasks: DailyTask[];
}

export default function NextFocusSessionCard({ activeExam, tasks }: NextFocusSessionCardProps) {
  const navigate = useNavigate();

  // Derive a contextual suggestion
  const nextIncompleteTask = tasks.find((t) => !t.isCompleted);

  let sessionTitle: string;
  let sessionSubtitle: string;

  if (nextIncompleteTask) {
    sessionTitle = `Review ${nextIncompleteTask.subjectName}`;
    sessionSubtitle = `${nextIncompleteTask.topicName} · 25 min Pomodoro`;
  } else if (activeExam) {
    sessionTitle = `Study ${activeExam.setup.examName}`;
    sessionSubtitle = 'General review · 25 min Pomodoro';
  } else {
    sessionTitle = 'Start a Focus Session';
    sessionSubtitle = '25 min Pomodoro · Stay sharp';
  }

  return (
    <div className="glass-card rounded-2xl p-4 overflow-hidden relative">
      {/* Subtle tinted overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264 / 0.10) 0%, oklch(0.55 0.22 290 / 0.10) 100%)' }}
      />
      {/* Decorative glow */}
      <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-primary/5 pointer-events-none" />

      <div className="relative flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/15 dark:bg-primary/20 flex items-center justify-center shrink-0">
          <Timer className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest mb-0.5">
            Next Focus Session
          </p>
          <p className="text-foreground text-sm font-bold leading-tight truncate">{sessionTitle}</p>
          <p className="text-muted-foreground text-xs mt-0.5 truncate">{sessionSubtitle}</p>
        </div>

        <button
          onClick={() => navigate({ to: '/focus' })}
          className="shrink-0 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm active:scale-95 transition-all duration-150 hover:opacity-90"
        >
          Start Now
        </button>
      </div>
    </div>
  );
}
