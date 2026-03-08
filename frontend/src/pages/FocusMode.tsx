import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Settings } from 'lucide-react';
import AdvancedFocusSettings, { type AmbientSound } from '../components/AdvancedFocusSettings';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';
import { useAmbientSound } from '../hooks/useAmbientSound';

type TimerMode = 'work' | 'break';

const DEFAULT_WORK = 25;
const DEFAULT_BREAK = 5;

export default function FocusMode() {
  const { isPremium } = useConsolidatedPremiumStatus();

  const [workDuration, setWorkDuration] = useState(DEFAULT_WORK);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK);
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORK * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeSound, setActiveSound] = useState<AmbientSound>('none');
  const [sessionHistory, setSessionHistory] = useState<{ duration: number; completedAt: string }[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Gate ambient sound to premium users only
  const gatedSound: AmbientSound = isPremium ? activeSound : 'none';
  useAmbientSound(gatedSound);

  const totalSeconds = mode === 'work' ? workDuration * 60 : breakDuration * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(mode === 'work' ? workDuration * 60 : breakDuration * 60);
  }, [mode, workDuration, breakDuration]);

  useEffect(() => {
    resetTimer();
  }, [workDuration, breakDuration, mode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            if (mode === 'work') {
              setSessionsCompleted((c) => c + 1);
              setSessionHistory((h) => [
                { duration: workDuration, completedAt: new Date().toLocaleTimeString() },
                ...h,
              ]);
              setMode('break');
            } else {
              setMode('work');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, workDuration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold text-foreground">Focus Mode</h1>
            <p className="text-xs text-muted-foreground">
              {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed today
            </p>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-2 rounded-xl transition-colors ${showAdvanced ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Mode toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          <button
            onClick={() => { setMode('work'); setIsRunning(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === 'work' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Focus
          </button>
          <button
            onClick={() => { setMode('break'); setIsRunning(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === 'break' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <Coffee className="w-4 h-4" /> Break
          </button>
        </div>

        {/* Timer circle */}
        <div className="flex flex-col items-center py-6">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/40"
              />
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={mode === 'work' ? 'text-primary' : 'text-green-500'}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground tabular-nums">{timeStr}</span>
              <span className="text-xs text-muted-foreground capitalize">{mode}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={resetTimer}
              className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
            >
              {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </button>
            <div className="w-12 h-12" />
          </div>
        </div>

        {/* Basic timer info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-3 rounded-xl text-center">
            <p className="text-lg font-bold text-foreground">{workDuration}</p>
            <p className="text-xs text-muted-foreground">Focus mins</p>
          </div>
          <div className="glass-card p-3 rounded-xl text-center">
            <p className="text-lg font-bold text-foreground">{breakDuration}</p>
            <p className="text-xs text-muted-foreground">Break mins</p>
          </div>
        </div>

        {/* Advanced settings — premium gated */}
        {showAdvanced && (
          <AdvancedFocusSettings
            workDuration={workDuration}
            breakDuration={breakDuration}
            onWorkDurationChange={setWorkDuration}
            onBreakDurationChange={setBreakDuration}
            activeSound={activeSound}
            onSoundChange={setActiveSound}
            sessionHistory={sessionHistory}
          />
        )}
      </div>
    </div>
  );
}
