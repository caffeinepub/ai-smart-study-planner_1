import { useState, useEffect, useCallback } from 'react';

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;   // raw OKLCH values e.g. "0.51 0.22 264"
  accent: string;    // raw OKLCH values
  preview: string;   // hex/oklch for swatch display
  accentPreview: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'indigo',
    name: 'Indigo',
    primary: '0.51 0.22 264',
    accent: '0.62 0.22 290',
    preview: '#6366f1',
    accentPreview: '#a78bfa',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    primary: '0.53 0.18 162',
    accent: '0.62 0.16 180',
    preview: '#10b981',
    accentPreview: '#34d399',
  },
  {
    id: 'rose',
    name: 'Rose',
    primary: '0.55 0.22 10',
    accent: '0.65 0.20 30',
    preview: '#f43f5e',
    accentPreview: '#fb7185',
  },
  {
    id: 'amber',
    name: 'Amber',
    primary: '0.65 0.18 60',
    accent: '0.72 0.16 80',
    preview: '#f59e0b',
    accentPreview: '#fbbf24',
  },
  {
    id: 'sky',
    name: 'Sky',
    primary: '0.55 0.18 220',
    accent: '0.65 0.16 200',
    preview: '#0ea5e9',
    accentPreview: '#38bdf8',
  },
  {
    id: 'violet',
    name: 'Violet',
    primary: '0.50 0.25 300',
    accent: '0.60 0.22 320',
    preview: '#8b5cf6',
    accentPreview: '#a78bfa',
  },
];

const STORAGE_KEY = 'app_theme_preset';

function applyThemeToDOM(preset: ThemePreset) {
  const root = document.documentElement;
  // The CSS variables are used as oklch(var(--primary)) in Tailwind config,
  // so we set just the raw OKLCH values (no oklch() wrapper).
  root.style.setProperty('--primary', preset.primary);
  root.style.setProperty('--accent', preset.accent);
  // Also set ring to match primary
  root.style.setProperty('--ring', preset.primary);
}

export function useCustomTheme() {
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'indigo';
    } catch {
      return 'indigo';
    }
  });

  // Apply theme on mount and whenever activeThemeId changes
  useEffect(() => {
    const preset = THEME_PRESETS.find(p => p.id === activeThemeId) || THEME_PRESETS[0];
    applyThemeToDOM(preset);
  }, [activeThemeId]);

  const selectTheme = useCallback((themeId: string) => {
    const preset = THEME_PRESETS.find(p => p.id === themeId);
    if (!preset) return;
    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch {
      // ignore storage errors
    }
    setActiveThemeId(themeId);
    applyThemeToDOM(preset);
  }, []);

  const activePreset = THEME_PRESETS.find(p => p.id === activeThemeId) || THEME_PRESETS[0];

  return { activeThemeId, activePreset, selectTheme, presets: THEME_PRESETS };
}
