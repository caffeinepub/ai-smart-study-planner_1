import React from 'react';
import { Volume2, Clock, History } from 'lucide-react';
import PremiumGate from './PremiumGate';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';

export type AmbientSound = 'none' | 'rain' | 'whitenoise' | 'cafe';

interface AdvancedFocusSettingsProps {
  workDuration: number;
  breakDuration: number;
  onWorkDurationChange: (val: number) => void;
  onBreakDurationChange: (val: number) => void;
  activeSound: AmbientSound;
  onSoundChange: (sound: AmbientSound) => void;
  sessionHistory?: { duration: number; completedAt: string }[];
}

const AMBIENT_SOUNDS: { id: AmbientSound; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'rain', label: '🌧 Rain' },
  { id: 'whitenoise', label: '🌊 White Noise' },
  { id: 'cafe', label: '☕ Café' },
];

function AdvancedFocusSettingsContent({
  workDuration,
  breakDuration,
  onWorkDurationChange,
  onBreakDurationChange,
  activeSound,
  onSoundChange,
  sessionHistory = [],
}: AdvancedFocusSettingsProps) {
  return (
    <div className="space-y-4">
      {/* Custom intervals */}
      <div className="glass-card p-4 rounded-xl space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Custom Intervals</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Work duration</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onWorkDurationChange(Math.max(5, workDuration - 5))}
              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-bold hover:bg-muted/80"
            >−</button>
            <span className="text-sm font-semibold w-12 text-center">{workDuration} min</span>
            <button
              onClick={() => onWorkDurationChange(Math.min(90, workDuration + 5))}
              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-bold hover:bg-muted/80"
            >+</button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Break duration</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBreakDurationChange(Math.max(1, breakDuration - 1))}
              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-bold hover:bg-muted/80"
            >−</button>
            <span className="text-sm font-semibold w-12 text-center">{breakDuration} min</span>
            <button
              onClick={() => onBreakDurationChange(Math.min(30, breakDuration + 1))}
              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-bold hover:bg-muted/80"
            >+</button>
          </div>
        </div>
      </div>

      {/* Ambient sounds */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Ambient Sounds</p>
          {activeSound !== 'none' && (
            <span className="ml-auto text-xs text-green-500 font-medium">playing</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {AMBIENT_SOUNDS.map((sound) => (
            <button
              key={sound.id}
              onClick={() => onSoundChange(sound.id)}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                activeSound === sound.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {sound.label}
            </button>
          ))}
        </div>
      </div>

      {/* Session history */}
      {sessionHistory.length > 0 && (
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Recent Sessions</p>
          </div>
          <div className="space-y-2">
            {sessionHistory.slice(0, 5).map((session, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{session.completedAt}</span>
                <span className="font-medium text-foreground">{session.duration} min</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdvancedFocusSettings(props: AdvancedFocusSettingsProps) {
  const { isLoading } = useConsolidatedPremiumStatus();

  if (isLoading) {
    return <div className="h-32 bg-muted/40 rounded-xl animate-pulse" />;
  }

  return (
    <PremiumGate featureName="Advanced Focus Mode" showPreview>
      <AdvancedFocusSettingsContent {...props} />
    </PremiumGate>
  );
}
