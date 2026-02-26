import React from 'react';
import { Check, Palette } from 'lucide-react';
import { useColorTheme } from '../hooks/useColorTheme';

export default function ColorThemeSelector() {
  const { currentTheme, themes, setTheme } = useColorTheme();

  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/8">
        <Palette className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">Color Theme</p>
        <p className="text-xs text-muted-foreground mt-0.5">Choose your preferred accent color</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {themes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => setTheme(theme.name)}
            title={theme.label}
            className="relative w-8 h-8 rounded-full transition-all duration-150 active:scale-90 focus:outline-none"
            style={{ background: theme.swatch }}
            aria-label={`${theme.label} theme`}
            aria-pressed={currentTheme.name === theme.name}
          >
            {currentTheme.name === theme.name && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check className="w-4 h-4 text-white drop-shadow-sm" strokeWidth={3} />
              </span>
            )}
            {currentTheme.name === theme.name && (
              <span
                className="absolute -inset-1 rounded-full border-2 border-foreground/30 pointer-events-none"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
