/**
 * Custom hook for managing color theme selection and persistence.
 * Applies CSS custom property overrides to :root for instant theme switching.
 */

import { useState, useCallback, useEffect } from 'react';

export interface ColorTheme {
  name: string;
  label: string;
  swatch: string;
  // Light mode CSS variable values (OKLCH L C H)
  light: {
    primary: string;
    primaryForeground: string;
    accent: string;
    ring: string;
  };
  // Dark mode CSS variable values (OKLCH L C H)
  dark: {
    primary: string;
    primaryForeground: string;
    accent: string;
    ring: string;
  };
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    name: 'indigo',
    label: 'Indigo',
    swatch: 'oklch(0.51 0.22 264)',
    light: {
      primary: '0.51 0.22 264',
      primaryForeground: '1 0 0',
      accent: '0.62 0.22 290',
      ring: '0.51 0.22 264',
    },
    dark: {
      primary: '0.65 0.22 264',
      primaryForeground: '0.10 0.02 264',
      accent: '0.65 0.22 290',
      ring: '0.65 0.22 264',
    },
  },
  {
    name: 'emerald',
    label: 'Emerald',
    swatch: 'oklch(0.53 0.18 160)',
    light: {
      primary: '0.53 0.18 160',
      primaryForeground: '1 0 0',
      accent: '0.60 0.16 180',
      ring: '0.53 0.18 160',
    },
    dark: {
      primary: '0.65 0.18 160',
      primaryForeground: '0.10 0.04 160',
      accent: '0.65 0.16 180',
      ring: '0.65 0.18 160',
    },
  },
  {
    name: 'rose',
    label: 'Rose',
    swatch: 'oklch(0.55 0.22 10)',
    light: {
      primary: '0.55 0.22 10',
      primaryForeground: '1 0 0',
      accent: '0.60 0.20 340',
      ring: '0.55 0.22 10',
    },
    dark: {
      primary: '0.68 0.22 10',
      primaryForeground: '0.10 0.02 10',
      accent: '0.65 0.20 340',
      ring: '0.68 0.22 10',
    },
  },
  {
    name: 'amber',
    label: 'Amber',
    swatch: 'oklch(0.65 0.18 60)',
    light: {
      primary: '0.60 0.18 60',
      primaryForeground: '0.10 0.04 60',
      accent: '0.65 0.16 45',
      ring: '0.60 0.18 60',
    },
    dark: {
      primary: '0.72 0.18 60',
      primaryForeground: '0.10 0.04 60',
      accent: '0.70 0.16 45',
      ring: '0.72 0.18 60',
    },
  },
];

const STORAGE_KEY = 'colorTheme';

function applyTheme(theme: ColorTheme): void {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  const vars = isDark ? theme.dark : theme.light;

  root.style.setProperty('--primary', vars.primary);
  root.style.setProperty('--primary-foreground', vars.primaryForeground);
  root.style.setProperty('--accent', vars.accent);
  root.style.setProperty('--ring', vars.ring);
  // Also update chart-1 to match primary
  root.style.setProperty('--chart-1', vars.primary);
}

export function useColorTheme() {
  const [currentThemeName, setCurrentThemeName] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? 'indigo';
    } catch {
      return 'indigo';
    }
  });

  const currentTheme =
    COLOR_THEMES.find((t) => t.name === currentThemeName) ?? COLOR_THEMES[0];

  // Apply theme on mount and whenever theme name changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Re-apply when dark mode class changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      applyTheme(currentTheme);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [currentTheme]);

  const setTheme = useCallback((themeName: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, themeName);
    } catch {
      // ignore
    }
    setCurrentThemeName(themeName);
  }, []);

  return {
    currentTheme,
    themes: COLOR_THEMES,
    setTheme,
  };
}
