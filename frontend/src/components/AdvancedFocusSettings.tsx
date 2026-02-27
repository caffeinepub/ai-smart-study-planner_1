import React, { useState } from 'react';
import { Settings2, Music, History, Sparkles, Volume2, Clock, Trash2 } from 'lucide-react';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';
import { useFocusSessionHistory } from '../hooks/useFocusSessionHistory';
import PaywallScreen from './PaywallScreen';

export type AmbientSound = 'none' | 'rain' | 'white_noise' | 'cafe';

interface AdvancedFocusSettingsProps {
  workMinutes: number;
  breakMinutes: number;
  onWorkMinutesChange: (v: number) => void;
  onBreakMinutesChange: (v: number) => void;
  selectedSound: AmbientSound;
  onSoundChange: (s: AmbientSound) => void;
}

const AMBIENT_SOUNDS: { id: AmbientSound; label: string; emoji: string }[] = [
  { id: 'none', label: 'None', emoji: '🔇' },
  { id: 'rain', label: 'Rain', emoji: '🌧️' },
  { id: 'white_noise', label: 'White Noise', emoji: '〰️' },
  { id: 'cafe', label: 'Café', emoji: '☕' },
];

function formatSessionTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s > 0 ? `${s}s` : ''}`.trim();
}

export default function AdvancedFocusSettings({
  workMinutes,
  breakMinutes,
  onWorkMinutesChange,
  onBreakMinutesChange,
  selectedSound,
  onSoundChange,
}: AdvancedFocusSettingsProps) {
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');

  const { isPremium, isLoading: premiumLoading } = useConsolidatedPremiumStatus();
  const { sessions, clearHistory } = useFocusSessionHistory();

  // Don't show paywall while loading premium status
  if (premiumLoading) {
    return (
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b border-white/10 dark:border-white/6">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold">Advanced Focus Settings</h3>
            <p className="text-xs text-muted-foreground">Custom intervals, sounds & history</p>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground text-xs py-6">
          <span className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center gap-3 border-b border-white/10 dark:border-white/6">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold">Advanced Focus Settings</h3>
              <p className="text-xs text-muted-foreground">Custom intervals, sounds & history</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              Premium
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2 opacity-50 pointer-events-none">
              {[
                { icon: <Clock className="w-4 h-4" />, label: 'Custom Intervals' },
                { icon: <Music className="w-4 h-4" />, label: 'Ambient Sounds' },
                { icon: <History className="w-4 h-4" />, label: 'Session History' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/30 border border-border">
                  <div className="text-muted-foreground">{item.icon}</div>
                  <span className="text-[10px] text-muted-foreground font-medium text-center">{item.label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPaywall(true)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-all duration-150"
              style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}
            >
              Unlock Advanced Focus Mode
            </button>
          </div>
        </div>

        <PaywallScreen open={showPaywall} onClose={() => setShowPaywall(false)} />
      </>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header with tabs */}
      <div className="p-4 border-b border-white/10 dark:border-white/6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold">Advanced Focus Settings</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-semibold">
            <Sparkles className="w-3 h-3" />
            Premium
          </div>
        </div>
        <div className="flex gap-1 p-1 bg-muted/40 rounded-xl">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'settings' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'history' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            History {sessions.length > 0 && `(${sessions.length})`}
          </button>
        </div>
      </div>

      {activeTab === 'settings' ? (
        <div className="p-4 space-y-4">
          {/* Custom Intervals */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Custom Intervals</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Focus (min)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onWorkMinutesChange(Math.max(5, workMinutes - 5))}
                    className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-sm font-bold hover:bg-muted active:scale-90 transition-all"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-sm font-bold text-primary">{workMinutes}</span>
                  <button
                    onClick={() => onWorkMinutesChange(Math.min(90, workMinutes + 5))}
                    className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-sm font-bold hover:bg-muted active:scale-90 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Break (min)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onBreakMinutesChange(Math.max(1, breakMinutes - 1))}
                    className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-sm font-bold hover:bg-muted active:scale-90 transition-all"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-sm font-bold text-accent">{breakMinutes}</span>
                  <button
                    onClick={() => onBreakMinutesChange(Math.min(30, breakMinutes + 1))}
                    className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-sm font-bold hover:bg-muted active:scale-90 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Ambient Sounds */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ambient Sound</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {AMBIENT_SOUNDS.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => onSoundChange(sound.id)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all duration-200 active:scale-95 ${
                    selectedSound === sound.id
                      ? 'border-primary bg-primary/8'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span className="text-lg">{sound.emoji}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground">{sound.label}</span>
                </button>
              ))}
            </div>
            {selectedSound !== 'none' && (
              <p className="text-[10px] text-muted-foreground text-center">
                🎵 {AMBIENT_SOUNDS.find((s) => s.id === selectedSound)?.label} ambience playing
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent Sessions</p>
            </div>
            {sessions.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-6">
              <History className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-xs text-muted-foreground">No sessions recorded yet</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Complete a focus session to see it here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    session.phase === 'work'
                      ? 'bg-primary/6 border-primary/15'
                      : 'bg-accent/6 border-accent/15'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    session.phase === 'work' ? 'bg-primary/15' : 'bg-accent/15'
                  }`}>
                    <span className="text-sm">{session.phase === 'work' ? '🎯' : '☕'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground capitalize">
                      {session.phase === 'work' ? 'Focus Session' : 'Break'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDuration(session.durationSeconds)} · {formatSessionTime(session.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
