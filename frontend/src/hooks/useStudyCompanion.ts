import { useState, useEffect, useMemo } from 'react';
import { useLocalStreak } from './useLocalStreak';
import { useFocusSessionHistory } from './useFocusSessionHistory';

export type GrowthStage = 0 | 1 | 2 | 3 | 4 | 5;

export interface CompanionState {
  currentStage: GrowthStage;
  stageProgress: number; // 0–100, progress toward next stage
  stageName: string;
  encouragingMessage: string;
}

// Thresholds: [minStreakDays, minWorkSessions] to reach each stage
const STAGE_THRESHOLDS: [number, number][] = [
  [0, 0],   // stage 0: seed (starting point)
  [1, 2],   // stage 1: sprout
  [3, 6],   // stage 2: seedling
  [7, 15],  // stage 3: young plant
  [14, 30], // stage 4: blooming
  [21, 50], // stage 5: fully grown
];

const STAGE_NAMES: string[] = [
  'Seed',
  'Sprout',
  'Seedling',
  'Young Plant',
  'Blooming',
  'Fully Grown',
];

const STAGE_MESSAGES: string[] = [
  'Plant your seed of knowledge. Every journey begins with a single step 🌱',
  'You\'re sprouting! Keep showing up and watch yourself grow 🌿',
  'Your dedication is taking root. Consistency is your superpower 🌱✨',
  'Look how far you\'ve come! Your study habit is blossoming 🌳',
  'You\'re in full bloom! Your hard work is truly paying off 🌸',
  'Magnificent! You\'ve grown into a true scholar. Keep thriving 🌺',
];

const STORAGE_KEY = 'study_companion';

function computeStage(streakDays: number, workSessions: number): GrowthStage {
  let stage: GrowthStage = 0;
  for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    const [minStreak, minSessions] = STAGE_THRESHOLDS[i];
    if (streakDays >= minStreak && workSessions >= minSessions) {
      stage = i as GrowthStage;
      break;
    }
  }
  return stage;
}

function computeProgress(stage: GrowthStage, streakDays: number, workSessions: number): number {
  if (stage >= 5) return 100;

  const [curStreak, curSessions] = STAGE_THRESHOLDS[stage];
  const [nextStreak, nextSessions] = STAGE_THRESHOLDS[stage + 1];

  const streakRange = nextStreak - curStreak;
  const sessionsRange = nextSessions - curSessions;

  const streakProgress = streakRange > 0
    ? Math.min((streakDays - curStreak) / streakRange, 1)
    : 1;
  const sessionsProgress = sessionsRange > 0
    ? Math.min((workSessions - curSessions) / sessionsRange, 1)
    : 1;

  return Math.round(((streakProgress + sessionsProgress) / 2) * 100);
}

export function useStudyCompanion(): CompanionState {
  const { currentStreak } = useLocalStreak();
  const { sessions } = useFocusSessionHistory();

  const workSessions = useMemo(
    () => sessions.filter((s) => s.phase === 'work').length,
    [sessions]
  );

  const [companionState, setCompanionState] = useState<CompanionState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed as CompanionState;
      }
    } catch {
      // ignore
    }
    return {
      currentStage: 0,
      stageProgress: 0,
      stageName: STAGE_NAMES[0],
      encouragingMessage: STAGE_MESSAGES[0],
    };
  });

  useEffect(() => {
    const stage = computeStage(currentStreak, workSessions);
    const progress = computeProgress(stage, currentStreak, workSessions);

    const newState: CompanionState = {
      currentStage: stage,
      stageProgress: progress,
      stageName: STAGE_NAMES[stage],
      encouragingMessage: STAGE_MESSAGES[stage],
    };

    setCompanionState(newState);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // ignore
    }
  }, [currentStreak, workSessions]);

  return companionState;
}
