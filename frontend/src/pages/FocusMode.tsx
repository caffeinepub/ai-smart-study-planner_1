import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import AdvancedFocusSettings, { AmbientSound } from '../components/AdvancedFocusSettings';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { usePremiumTestingMode } from '../hooks/usePremiumTestingMode';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useFocusSessionHistory } from '../hooks/useFocusSessionHistory';

type Phase = 'work' | 'break';

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

export default function FocusMode() {
  const { isPremium: isSubscriptionPremium } = useSubscriptionContext();
  const { isPremiumTestingEnabled } = usePremiumTestingMode();
  const { data: userProfile } = useGetCallerUserProfile();
  const isBackendPremium = userProfile?.userTier === 'premium';
  const isPremium = isPremiumTestingEnabled || isBackendPremium || isSubscriptionPremium;

  const { addSession } = useFocusSessionHistory();

  // Custom intervals (premium)
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [selectedSound, setSelectedSound] = useState<AmbientSound>('none');

  const [phase, setPhase] = useState<Phase>('work');
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track session start time for history
  const sessionStartRef = useRef<number | null>(null);
  const sessionPhaseRef = useRef<Phase>('work');

  // Sync timeLeft when intervals change (only when not running)
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(phase === 'work' ? workMinutes * 60 : breakMinutes * 60);
    }
  }, [workMinutes, breakMinutes, phase, isRunning]);

  const totalTime = phase === 'work' ? workMinutes * 60 : breakMinutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const size = 240;
  const radius = 100;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handlePhaseComplete = useCallback((completedPhase: Phase) => {
    // Log session to history
    if (sessionStartRef.current !== null) {
      const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
      addSession({
        timestamp: sessionStartRef.current,
        durationSeconds: duration,
        phase: completedPhase,
      });
      sessionStartRef.current = null;
    }

    if (completedPhase === 'work') {
      setSessions((s) => s + 1);
      setPhase('break');
      setTimeLeft(breakMinutes * 60);
      sessionPhaseRef.current = 'break';
    } else {
      setPhase('work');
      setTimeLeft(workMinutes * 60);
      sessionPhaseRef.current = 'work';
    }
  }, [addSession, workMinutes, breakMinutes]);

  useEffect(() => {
    if (isRunning) {
      if (sessionStartRef.current === null) {
        sessionStartRef.current = Date.now();
        sessionPhaseRef.current = phase;
      }
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            handlePhaseComplete(sessionPhaseRef.current);
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
  }, [isRunning, handlePhaseComplete]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    sessionStartRef.current = null;
    setPhase('work');
    setTimeLeft(workMinutes * 60);
  };

  const handlePlayPause = () => {
    if (!isRunning && sessionStartRef.current === null) {
      sessionStartRef.current = Date.now();
      sessionPhaseRef.current = phase;
    }
    setIsRunning(!isRunning);
  };

  const phaseColor = phase === 'work' ? '#6366f1' : '#8b5cf6';
  const phaseColorLight = phase === 'work' ? '#e0e7ff' : '#ede9fe';

  return (
    <div className="p-5 space-y-6 pb-28">
      {/* Header */}
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight">Focus Mode</h1>
        <p className="text-muted-foreground text-sm">
          Stay focused with the Pomodoro technique.
        </p>
      </div>

      {/* Phase Toggle */}
      <div className="flex gap-2 p-1.5 glass-card rounded-2xl">
        {(['work', 'break'] as Phase[]).map((p) => (
          <button
            key={p}
            onClick={() => {
              if (!isRunning) {
                setPhase(p);
                setTimeLeft(p === 'work' ? workMinutes * 60 : breakMinutes * 60);
                sessionStartRef.current = null;
              }
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
              phase === p
                ? 'bg-primary/15 dark:bg-primary/25 text-primary shadow-sm'
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
            className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center hover:brightness-[1.03] active:scale-90 transition-all duration-150"
          >
            <RotateCcw className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
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
          <div className="w-12 h-12 rounded-2xl glass-card flex flex-col items-center justify-center">
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

      {/* Advanced Focus Settings — Premium gated */}
      <AdvancedFocusSettings
        workMinutes={workMinutes}
        breakMinutes={breakMinutes}
        onWorkMinutesChange={(v) => {
          setWorkMinutes(v);
          if (!isRunning && phase === 'work') setTimeLeft(v * 60);
        }}
        onBreakMinutesChange={(v) => {
          setBreakMinutes(v);
          if (!isRunning && phase === 'break') setTimeLeft(v * 60);
        }}
        selectedSound={selectedSound}
        onSoundChange={setSelectedSound}
      />
    </div>
  );
}
