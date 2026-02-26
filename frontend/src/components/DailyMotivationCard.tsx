import React from 'react';
import { Sparkles } from 'lucide-react';

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it's done.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Believe you can and you're halfway there.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream big. Start small. Act now.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard is not impossible.",
  "Don't wait for opportunity. Create it.",
  "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
  "The key to success is to focus on goals, not obstacles.",
  "Dream it. Wish it. Do it.",
  "Stay focused and never give up.",
  "Work hard in silence, let your success be your noise.",
  "You don't have to be great to start, but you have to start to be great.",
  "The expert in anything was once a beginner.",
  "Strive for progress, not perfection.",
  "You are capable of more than you know.",
  "Every day is a new beginning. Take a deep breath and start again.",
  "Success doesn't come from what you do occasionally, it comes from what you do consistently.",
  "Discipline is the bridge between goals and accomplishment.",
  "Your only limit is your mind.",
  "Small steps every day lead to big results.",
  "Invest in your mind — it pays the best interest.",
];

function getDailyIndex(arrayLength: number): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear % arrayLength;
}

export default function DailyMotivationCard() {
  const quote = QUOTES[getDailyIndex(QUOTES.length)];

  return (
    <div className="glass-card rounded-2xl p-4 overflow-hidden relative">
      {/* Subtle tinted overlay for warmth */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264 / 0.08) 0%, oklch(0.62 0.22 290 / 0.08) 100%)' }}
      />
      {/* Decorative circles */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-primary/5 pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-accent/5 pointer-events-none" />

      <div className="relative flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-yellow-400/20 dark:bg-yellow-400/15 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest mb-1.5">
            Daily Motivation
          </p>
          <p className="text-foreground text-sm font-medium leading-relaxed">
            "{quote}"
          </p>
        </div>
      </div>
    </div>
  );
}
