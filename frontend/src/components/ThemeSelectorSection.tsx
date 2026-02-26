import React from 'react';
import { Check, Lock } from 'lucide-react';
import { useCustomTheme, THEME_PRESETS } from '../hooks/useCustomTheme';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';

interface ThemeSelectorSectionProps {
  onPaywallTrigger?: () => void;
}

export default function ThemeSelectorSection({ onPaywallTrigger }: ThemeSelectorSectionProps) {
  const { activeThemeId, selectTheme } = useCustomTheme();
  const { isPremium } = useConsolidatedPremiumStatus();

  const handleThemeClick = (themeId: string, index: number) => {
    const isFree = index < 3;
    if (!isFree && !isPremium) {
      onPaywallTrigger?.();
      return;
    }
    selectTheme(themeId);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Choose a colour theme for the app. Premium unlocks all themes.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {THEME_PRESETS.map((preset, index) => {
          const isFree = index < 3;
          const isActive = activeThemeId === preset.id;
          const isLocked = !isFree && !isPremium;

          return (
            <button
              key={preset.id}
              onClick={() => handleThemeClick(preset.id, index)}
              className={`
                relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
                ${isActive
                  ? 'border-primary bg-primary/10 shadow-md scale-105'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                }
                ${isLocked ? 'opacity-60' : ''}
              `}
              aria-label={`Select ${preset.name} theme${isLocked ? ' (Premium)' : ''}`}
            >
              {/* Colour swatch */}
              <div className="flex gap-1.5">
                <div
                  className="w-6 h-6 rounded-full shadow-sm border border-white/20"
                  style={{ backgroundColor: preset.preview }}
                />
                <div
                  className="w-6 h-6 rounded-full shadow-sm border border-white/20"
                  style={{ backgroundColor: preset.accentPreview }}
                />
              </div>

              {/* Theme name */}
              <span className="text-xs font-medium text-foreground">{preset.name}</span>

              {/* Active checkmark */}
              {isActive && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}

              {/* Lock icon for premium themes */}
              {isLocked && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-muted-foreground/30 flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
              )}

              {/* Free badge */}
              {isFree && !isActive && (
                <span className="absolute bottom-1 right-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                  FREE
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
