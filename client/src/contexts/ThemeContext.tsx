import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, isTheme } from '../types/settings';
import { ColorTheme, colorThemeCssVariables, getColorTheme } from '../themes/colorThemes';

interface ThemeContextType {
  theme: Theme;
  /** Whether the UI currently renders in light or dark mode. */
  effectiveTheme: 'light' | 'dark';
  /** The selected named color theme, or null for the default palette. */
  colorTheme: ColorTheme | null;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

const resolveEffectiveTheme = (theme: Theme): 'light' | 'dark' => {
  const colorTheme = getColorTheme(theme);
  if (colorTheme) return colorTheme.base;
  if (theme === 'system') return prefersDark() ? 'dark' : 'light';
  return theme === 'dark' ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return isTheme(savedTheme) ? savedTheme : 'system';
  });
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() =>
    resolveEffectiveTheme(theme)
  );
  const colorTheme = getColorTheme(theme);

  useEffect(() => {
    setEffectiveTheme(resolveEffectiveTheme(theme));
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', effectiveTheme === 'dark');
    root.style.colorScheme = effectiveTheme;
  }, [effectiveTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (!colorTheme) {
      delete root.dataset.colorTheme;
      return;
    }

    const variables = colorThemeCssVariables(colorTheme);
    for (const [name, value] of Object.entries(variables)) {
      root.style.setProperty(name, value);
    }
    root.dataset.colorTheme = colorTheme.id;

    return () => {
      for (const name of Object.keys(variables)) {
        root.style.removeProperty(name);
      }
    };
  }, [colorTheme]);

  const toggleTheme = () => {
    setThemeState(prev => resolveEffectiveTheme(prev) === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, colorTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
