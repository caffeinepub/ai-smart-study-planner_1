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

        {showPaywall && (
          <PaywallScreen onClose={() => setShowPaywall(false)} featureName="Advanced Focus Mode" />
        )}
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
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            History ({sessions.length})
          </button>
        </div>
      </div>

      {activeTab === 'settings' ? (
        <div className="p-4 space-y-4">
          {/* Work interval */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold">Focus Duration</span>
              </div>
              <span className="text-xs font-bold text-primary">{workMinutes} min</span>
            </div>
            <input
              type="range"
              min={5}
              max={90}
              step={5}
              value={workMinutes}
              onChange={(e) => onWorkMinutesChange(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>5 min</span>
              <span>90 min</span>
            </div>
          </div>

          {/* Break interval */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-semibold">Break Duration</span>
              </div>
              <span className="text-xs font-bold text-emerald-500">{breakMinutes} min</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={breakMinutes}
              onChange={(e) => onBreakMinutesChange(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1 min</span>
              <span>30 min</span>
            </div>
          </div>

          {/* Ambient sounds */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold">Ambient Sound</span>
              {selectedSound !== 'none' && (
                <span className="text-[10px] text-emerald-500 font-semibold ml-auto">playing</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {AMBIENT_SOUNDS.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => onSoundChange(sound.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all active:scale-95 ${
                    selectedSound === sound.id
                      ? 'bg-primary/15 border border-primary/30 text-primary'
                      : 'bg-muted/30 border border-border text-muted-foreground hover:border-primary/20'
                  }`}
                >
                  <span className="text-base">{sound.emoji}</span>
                  <span className="text-[9px] font-semibold">{sound.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
              <History className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">No sessions recorded yet.</p>
              <p className="text-[10px] text-muted-foreground/60">Complete a focus session to see it here.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sessions.slice().reverse().map((session, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      session.phase === 'work' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {session.phase === 'work' ? <Clock className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold capitalize">{session.phase} session</p>
                      <p className="text-[10px] text-muted-foreground">{formatSessionTime(session.timestamp)}</p>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground shrink-0">
                      {formatDuration(session.durationSeconds)}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={clearHistory}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-destructive bg-destructive/8 border border-destructive/20 hover:bg-destructive/15 active:scale-95 transition-all duration-150"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear History
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
