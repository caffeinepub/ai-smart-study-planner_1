import React from 'react';
import { Lightbulb } from 'lucide-react';

const STUDY_TIPS = [
  "Use the Pomodoro Technique: 25 minutes of focused study, then a 5-minute break.",
  "Review your notes within 24 hours of a lecture to boost retention by up to 60%.",
  "Teach what you've learned to someone else — it's the fastest way to find gaps.",
  "Spaced repetition beats cramming. Revisit material at increasing intervals.",
  "Eliminate distractions: put your phone in another room while studying.",
  "Start with the hardest topic when your energy is highest.",
  "Use active recall: close your notes and try to write down everything you remember.",
  "Take a 10-minute walk before a study session to boost focus and creativity.",
  "Break large topics into smaller chunks and tackle one at a time.",
  "Get 7–9 hours of sleep — memory consolidation happens while you sleep.",
  "Use mind maps to connect concepts and see the big picture.",
  "Study in the same place each day to build a focus habit.",
  "Drink water regularly — even mild dehydration reduces cognitive performance.",
  "Set a specific goal for each study session, not just 'study more'.",
  "Use past exam papers to practice under real conditions.",
];

function getDailyIndex(arrayLength: number): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  // Offset by 7 so tip and quote don't use the same index pattern
  return (dayOfYear + 7) % arrayLength;
}

export default function StudyTipCard() {
  const tip = STUDY_TIPS[getDailyIndex(STUDY_TIPS.length)];

  return (
    <div className="glass-card rounded-2xl p-4 overflow-hidden relative">
      {/* Subtle tinted overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: 'linear-gradient(135deg, oklch(0.55 0.18 160 / 0.07) 0%, oklch(0.60 0.16 200 / 0.07) 100%)' }}
      />
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-emerald-500/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 dark:bg-emerald-400/10 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest mb-1.5">
            Study Tip of the Day
          </p>
          <p className="text-foreground text-sm font-medium leading-relaxed">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
}
