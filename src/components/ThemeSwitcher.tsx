import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { ThemeMode, getStoredThemeMode, saveThemeMode, applyTheme } from '../utils/theme';

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredThemeMode());

  // Listen to OS scheme changes if mode is 'system'
  useEffect(() => {
    applyTheme(mode);

    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (mode === 'system') {
        applyTheme('system');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Compatibility for older Safari / WebView
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [mode]);

  const handleSelectMode = (newMode: ThemeMode) => {
    setMode(newMode);
    saveThemeMode(newMode);
    applyTheme(newMode);
  };

  return (
    <div
      id="global-theme-switcher"
      className={`inline-flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm transition-colors ${className}`}
      role="group"
      aria-label="Theme mode switcher"
    >
      {/* Dark Option */}
      <button
        type="button"
        id="btn-theme-dark"
        onClick={() => handleSelectMode('dark')}
        title="Dark theme mode"
        aria-pressed={mode === 'dark'}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
          mode === 'dark'
            ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80 font-bold'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden md:inline text-[11px]">Dark</span>
      </button>

      {/* Light Option */}
      <button
        type="button"
        id="btn-theme-light"
        onClick={() => handleSelectMode('light')}
        title="Light theme mode"
        aria-pressed={mode === 'light'}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
          mode === 'light'
            ? 'bg-amber-400/20 text-amber-500 shadow-sm border border-amber-400/40 font-bold'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden md:inline text-[11px]">Light</span>
      </button>

      {/* System Option */}
      <button
        type="button"
        id="btn-theme-system"
        onClick={() => handleSelectMode('system')}
        title="Follow system / OS theme preference"
        aria-pressed={mode === 'system'}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
          mode === 'system'
            ? 'bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/30 font-bold'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
        }`}
      >
        <Monitor className="w-3.5 h-3.5" />
        <span className="hidden md:inline text-[11px]">System</span>
      </button>
    </div>
  );
};
