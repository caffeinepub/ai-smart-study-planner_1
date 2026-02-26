import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings2, Lock } from 'lucide-react';
import PremiumGate from '../components/PremiumGate';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { usePremiumTestingMode } from '../hooks/usePremiumTestingMode';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useFocusStats } from '../hooks/useFocusStats';
import { logFocusMinutesForDay } from '../hooks/useWeeklyActivity';

type Phase = 'work' | 'break';

const DEFAULT_WORK = 25 * 60;
const DEFAULT_BREAK = 5 * 60;
const WORK_MINUTES = 25;

export default function FocusMode() {
  const [phase, setPhase] = useState<Phase>('work');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORK);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { isPremium: isSubscriptionPremium } = useSubscriptionContext();
  const { isPremiumTestingEnabled } = usePremiumTestingMode();
  const { data: userProfile } = useGetCallerUserProfile();
  const isBackendPremium = userProfile?.userTier === 'premium';
  const isPremium = isPremiumTestingEnabled || isBackendPremium || isSubscriptionPremium;

  const { addFocusMinutes, incrementSessionCount } = useFocusStats();

  const totalTime = phase === 'work' ? DEFAULT_WORK : DEFAULT_BREAK;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const size = 240;
  const radius = 100;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            if (phase === 'work') {
              // Record completed work session
              setSessions((s) => s + 1);
              addFocusMinutes(WORK_MINUTES);
              incrementSessionCount();
              logFocusMinutesForDay(WORK_MINUTES);
              setPhase('break');
              setTimeLeft(DEFAULT_BREAK);
            } else {
              setPhase('work');
              setTimeLeft(DEFAULT_WORK);
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
  }, [isRunning, phase, addFocusMinutes, incrementSessionCount]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(DEFAULT_WORK);
  };

  const phaseColor = phase === 'work' ? '#6366f1' : '#8b5cf6';
  const phaseColorLight = phase === 'work' ? '#e0e7ff' : '#ede9fe';

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight">Focus Mode</h1>
        <p className="text-muted-foreground text-sm">
          Stay focused with the Pomodoro technique.
        </p>
      </div>

      {/* Phase Toggle */}
      <div className="flex gap-2 p-1.5 bg-muted rounded-2xl">
        {(['work', 'break'] as Phase[]).map((p) => (
          <button
            key={p}
            onClick={() => {
              if (!isRunning) {
                setPhase(p);
                setTimeLeft(p === 'work' ? DEFAULT_WORK : DEFAULT_BREAK);
              }
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
              phase === p
                ? 'bg-card shadow-xs text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {p === 'work' ? '🎯 Focus' : '☕ Break'}
          </button>
        ))}
      </div>

      {/* Timer Ring */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-20 scale-75"
            style={{ background: phaseColor }}
          />
          <svg
            width={size}
            height={size}
            className="-rotate-90 relative"
            style={{ filter: 'drop-shadow(0 4px 16px rgba(99,102,241,0.15))' }}
          >
            {/* Background track */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={phaseColorLight}
              strokeWidth="10"
              className="dark:opacity-20"
            />
            {/* Progress arc */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={phaseColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums tracking-tight text-foreground">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm font-semibold text-muted-foreground mt-1.5 capitalize">
              {phase === 'work' ? 'Focus Time' : 'Break Time'}
            </span>
            {sessions > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: Math.min(sessions, 4) }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                ))}
                {sessions > 4 && <span className="text-xs text-muted-foreground">+{sessions - 4}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5">
          {/* Reset */}
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-muted active:scale-90 transition-all duration-150 shadow-xs"
          >
            <RotateCcw className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-18 h-18 rounded-2xl flex items-center justify-center active:scale-90 transition-all duration-150 shadow-primary"
            style={{
              width: '72px',
              height: '72px',
              background: `linear-gradient(135deg, ${phaseColor}, ${phase === 'work' ? '#8b5cf6' : '#a78bfa'})`,
            }}
          >
            {isRunning
              ? <Pause className="w-7 h-7 text-white" />
              : <Play className="w-7 h-7 text-white ml-0.5" />
            }
          </button>

          {/* Session count */}
          <div className="w-12 h-12 rounded-2xl bg-card border border-border flex flex-col items-center justify-center shadow-xs">
            <span className="text-base font-bold text-foreground leading-none">{sessions}</span>
            <span className="text-[9px] text-muted-foreground font-medium mt-0.5">done</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-medium">
          {sessions === 0
            ? 'Press play to start your focus session'
            : `${sessions} session${sessions !== 1 ? 's' : ''} completed today 🎉`}
        </p>
      </div>

      {/* Advanced Focus Mode — Premium */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm">Advanced Focus Settings</h2>
          {!isPremium && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              <Lock className="w-3 h-3" />
              Premium
            </div>
          )}
        </div>

        {isPremium ? (
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-card">
            <p className="text-sm text-muted-foreground">
              Advanced focus settings are available. Custom session lengths and smart break reminders coming soon.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-primary/6 border border-primary/15 text-center">
                <p className="font-bold text-primary">25 min</p>
                <p className="text-xs text-muted-foreground">Focus</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/6 border border-accent/15 text-center">
                <p className="font-bold text-accent">5 min</p>
                <p className="text-xs text-muted-foreground">Break</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="w-full p-4 rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/40 active:scale-[0.98] transition-all duration-150 text-left"
            onClick={() => setShowAdvanced(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Custom Session Lengths</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set your own focus and break durations
                </p>
              </div>
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
        )}
      </div>

      {showAdvanced && !isPremium && (
        <PremiumGate featureName="advanced-focus-mode">
          <div />
        </PremiumGate>
      )}
    </div>
  );
}
