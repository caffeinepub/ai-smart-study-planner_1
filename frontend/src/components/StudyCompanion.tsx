import React from 'react';
import { useStudyCompanion } from '../hooks/useStudyCompanion';
import type { GrowthStage } from '../hooks/useStudyCompanion';

// ── SVG Plant Illustrations ──────────────────────────────────────────────────

function SeedSVG() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Soil */}
      <ellipse cx="60" cy="95" rx="32" ry="8" fill="#a16207" opacity="0.18" />
      <rect x="36" y="88" width="48" height="10" rx="5" fill="#92400e" opacity="0.22" />
      {/* Seed */}
      <ellipse cx="60" cy="82" rx="10" ry="7" fill="#78350f" opacity="0.85" />
      <ellipse cx="60" cy="80" rx="7" ry="5" fill="#a16207" opacity="0.6" />
      {/* Tiny crack hint */}
      <path d="M60 76 Q61 73 60 70" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function SproutSVG() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Soil */}
      <ellipse cx="60" cy="95" rx="32" ry="8" fill="#a16207" opacity="0.18" />
      <rect x="36" y="88" width="48" height="10" rx="5" fill="#92400e" opacity="0.22" />
      {/* Stem */}
      <path d="M60 88 Q60 72 60 60" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
      {/* Single leaf left */}
      <path d="M60 72 Q48 64 44 56 Q52 58 60 68" fill="#86efac" opacity="0.9" />
      {/* Single leaf right */}
      <path d="M60 68 Q72 60 76 52 Q68 56 60 66" fill="#4ade80" opacity="0.85" />
      {/* Tip */}
      <circle cx="60" cy="58" r="3" fill="#86efac" />
    </svg>
  );
}

function SeedlingSVG() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Soil */}
      <ellipse cx="60" cy="95" rx="32" ry="8" fill="#a16207" opacity="0.18" />
      <rect x="36" y="88" width="48" height="10" rx="5" fill="#92400e" opacity="0.22" />
      {/* Stem */}
      <path d="M60 88 Q59 70 60 50" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" />
      {/* Lower leaves */}
      <path d="M60 78 Q44 70 38 60 Q50 62 60 74" fill="#86efac" opacity="0.9" />
      <path d="M60 74 Q76 66 82 56 Q70 60 60 72" fill="#4ade80" opacity="0.85" />
      {/* Upper leaves */}
      <path d="M60 62 Q50 54 46 46 Q56 50 60 60" fill="#86efac" opacity="0.8" />
      <path d="M60 60 Q70 52 74 44 Q64 50 60 58" fill="#22c55e" opacity="0.8" />
      {/* Tip */}
      <circle cx="60" cy="48" r="3.5" fill="#86efac" />
    </svg>
  );
}

function YoungPlantSVG() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Soil */}
      <ellipse cx="60" cy="97" rx="34" ry="8" fill="#a16207" opacity="0.18" />
      <rect x="34" y="90" width="52" height="10" rx="5" fill="#92400e" opacity="0.22" />
      {/* Main stem */}
      <path d="M60 90 Q58 72 60 42" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" />
      {/* Branch left */}
      <path d="M60 70 Q50 62 42 58" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
      {/* Branch right */}
      <path d="M60 65 Q70 57 78 53" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
      {/* Leaves */}
      <ellipse cx="40" cy="56" rx="10" ry="6" fill="#86efac" transform="rotate(-20 40 56)" opacity="0.9" />
      <ellipse cx="80" cy="51" rx="10" ry="6" fill="#4ade80" transform="rotate(20 80 51)" opacity="0.85" />
      <path d="M60 78 Q44 70 38 62 Q52 64 60 76" fill="#86efac" opacity="0.8" />
      <path d="M60 74 Q76 66 82 58 Q68 62 60 72" fill="#22c55e" opacity="0.8" />
      {/* Top leaves */}
      <path d="M60 52 Q50 44 46 36 Q58 40 60 50" fill="#86efac" opacity="0.85" />
      <path d="M60 50 Q70 42 74 34 Q62 40 60 48" fill="#4ade80" opacity="0.85" />
      {/* Tip */}
      <circle cx="60" cy="40" r="4" fill="#86efac" />
    </svg>
  );
}

function BloomingPlantSVG() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Soil */}
      <ellipse cx="60" cy="98" rx="34" ry="7" fill="#a16207" opacity="0.18" />
      <rect x="34" y="92" width="52" height="9" rx="4.5" fill="#92400e" opacity="0.22" />
      {/* Main stem */}
      <path d="M60 92 Q57 74 60 38" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
      {/* Side branches */}
      <path d="M60 72 Q48 64 38 60" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 66 Q72 58 82 54" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 56 Q50 48 42 44" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 52 Q70 44 78 40" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
      {/* Leaves */}
      <ellipse cx="36" cy="58" rx="11" ry="6" fill="#86efac" transform="rotate(-25 36 58)" opacity="0.9" />
      <ellipse cx="84" cy="52" rx="11" ry="6" fill="#4ade80" transform="rotate(25 84 52)" opacity="0.85" />
      <ellipse cx="40" cy="42" rx="9" ry="5" fill="#86efac" transform="rotate(-30 40 42)" opacity="0.8" />
      <ellipse cx="80" cy="38" rx="9" ry="5" fill="#22c55e" transform="rotate(30 80 38)" opacity="0.8" />
      <path d="M60 80 Q44 72 38 64 Q52 66 60 78" fill="#86efac" opacity="0.75" />
      <path d="M60 76 Q76 68 82 60 Q68 64 60 74" fill="#22c55e" opacity="0.75" />
      {/* Flower bud */}
      <circle cx="60" cy="34" r="8" fill="#fde68a" opacity="0.9" />
      <circle cx="60" cy="34" r="5" fill="#fbbf24" opacity="0.95" />
      {/* Bud petals hint */}
      <path d="M60 26 Q63 30 60 34 Q57 30 60 26" fill="#fde68a" opacity="0.7" />
      <path d="M68 34 Q64 37 60 34 Q64 31 68 34" fill="#fde68a" opacity="0.7" />
      <path d="M60 42 Q57 38 60 34 Q63 38 60 42" fill="#fde68a" opacity="0.7" />
      <path d="M52 34 Q56 31 60 34 Q56 37 52 34" fill="#fde68a" opacity="0.7" />
    </svg>
  );
}

function FullyGrownSVG() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Soil */}
      <ellipse cx="60" cy="100" rx="36" ry="7" fill="#a16207" opacity="0.18" />
      <rect x="32" y="94" width="56" height="9" rx="4.5" fill="#92400e" opacity="0.22" />
      {/* Main stem */}
      <path d="M60 94 Q56 76 60 34" stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" />
      {/* Side branches */}
      <path d="M60 76 Q46 66 34 62" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 70 Q74 60 86 56" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 60 Q48 52 38 48" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 56 Q72 48 82 44" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 46 Q52 40 44 36" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 44 Q68 38 76 34" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
      {/* Leaves */}
      <ellipse cx="32" cy="60" rx="12" ry="7" fill="#86efac" transform="rotate(-25 32 60)" opacity="0.9" />
      <ellipse cx="88" cy="54" rx="12" ry="7" fill="#4ade80" transform="rotate(25 88 54)" opacity="0.85" />
      <ellipse cx="36" cy="46" rx="10" ry="6" fill="#86efac" transform="rotate(-30 36 46)" opacity="0.85" />
      <ellipse cx="84" cy="42" rx="10" ry="6" fill="#22c55e" transform="rotate(30 84 42)" opacity="0.85" />
      <ellipse cx="42" cy="34" rx="8" ry="5" fill="#86efac" transform="rotate(-35 42 34)" opacity="0.8" />
      <ellipse cx="78" cy="32" rx="8" ry="5" fill="#4ade80" transform="rotate(35 78 32)" opacity="0.8" />
      <path d="M60 84 Q42 74 36 66 Q52 68 60 82" fill="#86efac" opacity="0.7" />
      <path d="M60 80 Q78 70 84 62 Q68 66 60 78" fill="#22c55e" opacity="0.7" />
      {/* Open flower */}
      {/* Petals */}
      <ellipse cx="60" cy="24" rx="6" ry="10" fill="#fde68a" opacity="0.9" />
      <ellipse cx="60" cy="24" rx="10" ry="6" fill="#fde68a" opacity="0.9" />
      <ellipse cx="53" cy="20" rx="6" ry="9" fill="#fde68a" transform="rotate(-45 53 20)" opacity="0.85" />
      <ellipse cx="67" cy="20" rx="6" ry="9" fill="#fde68a" transform="rotate(45 67 20)" opacity="0.85" />
      <ellipse cx="53" cy="28" rx="6" ry="9" fill="#fde68a" transform="rotate(45 53 28)" opacity="0.85" />
      <ellipse cx="67" cy="28" rx="6" ry="9" fill="#fde68a" transform="rotate(-45 67 28)" opacity="0.85" />
      {/* Center */}
      <circle cx="60" cy="24" r="7" fill="#fbbf24" />
      <circle cx="60" cy="24" r="4" fill="#f59e0b" />
      {/* Pollen dots */}
      <circle cx="58" cy="22" r="1" fill="#fde68a" />
      <circle cx="62" cy="22" r="1" fill="#fde68a" />
      <circle cx="60" cy="26" r="1" fill="#fde68a" />
      {/* Sparkles */}
      <path d="M90 18 L91 14 L92 18 L96 19 L92 20 L91 24 L90 20 L86 19 Z" fill="#fbbf24" opacity="0.7" />
      <path d="M26 30 L27 27 L28 30 L31 31 L28 32 L27 35 L26 32 L23 31 Z" fill="#86efac" opacity="0.7" />
    </svg>
  );
}

const PLANT_SVGS: Record<GrowthStage, React.FC> = {
  0: SeedSVG,
  1: SproutSVG,
  2: SeedlingSVG,
  3: YoungPlantSVG,
  4: BloomingPlantSVG,
  5: FullyGrownSVG,
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function StudyCompanion() {
  const { currentStage, stageProgress, stageName, encouragingMessage } = useStudyCompanion();

  const PlantSVG = PLANT_SVGS[currentStage];

  const stageColors: Record<GrowthStage, string> = {
    0: 'from-amber-50/60 to-stone-50/60 dark:from-stone-900/40 dark:to-amber-950/30',
    1: 'from-green-50/60 to-emerald-50/60 dark:from-green-950/40 dark:to-emerald-950/30',
    2: 'from-green-50/60 to-teal-50/60 dark:from-green-950/40 dark:to-teal-950/30',
    3: 'from-emerald-50/60 to-green-50/60 dark:from-emerald-950/40 dark:to-green-950/30',
    4: 'from-yellow-50/60 to-green-50/60 dark:from-yellow-950/30 dark:to-green-950/40',
    5: 'from-yellow-50/60 to-emerald-50/60 dark:from-yellow-950/30 dark:to-emerald-950/40',
  };

  const progressBarColors: Record<GrowthStage, string> = {
    0: 'bg-amber-400',
    1: 'bg-green-400',
    2: 'bg-emerald-400',
    3: 'bg-green-500',
    4: 'bg-yellow-400',
    5: 'bg-emerald-500',
  };

  return (
    <div className={`glass-card rounded-3xl p-5 bg-gradient-to-br ${stageColors[currentStage]}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Your Study Plant</h3>
          <p className="text-xs text-muted-foreground">Stage {currentStage + 1} of 6</p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
          {stageName}
        </span>
      </div>

      {/* Plant illustration */}
      <div className="flex justify-center my-2">
        <div
          className="w-28 h-28 animate-sway"
          style={{ transformOrigin: 'center bottom' }}
        >
          <PlantSVG />
        </div>
      </div>

      {/* Progress toward next stage */}
      {currentStage < 5 && (
        <div className="mt-3 mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground font-light">Growth progress</span>
            <span className="text-xs font-medium text-foreground">{stageProgress}%</span>
          </div>
          <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${progressBarColors[currentStage]}`}
              style={{ width: `${stageProgress}%` }}
            />
          </div>
        </div>
      )}

      {currentStage >= 5 && (
        <div className="mt-3 mb-2 flex items-center justify-center gap-1.5">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">✨ Fully grown!</span>
        </div>
      )}

      {/* Encouraging message */}
      <p className="text-xs text-muted-foreground font-light leading-relaxed text-center mt-2 italic">
        "{encouragingMessage}"
      </p>
    </div>
  );
}
