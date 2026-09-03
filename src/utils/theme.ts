export type ThemeMode = 'dark' | 'light' | 'system';

export const THEME_STORAGE_KEY = 'c_app_theme_mode';

/**
 * Retrieve current user selected theme mode ('dark' | 'light' | 'system')
 */
export function getStoredThemeMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
  } catch {}
  return 'dark';
}

/**
 * Detect OS/browser color scheme preference
 */
export function getSystemResolvedTheme(): 'dark' | 'light' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

/**
 * Resolve effective theme ('dark' or 'light')
 */
export function resolveEffectiveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') {
    return getSystemResolvedTheme();
  }
  return mode;
}

/**
 * Apply theme to HTML and document elements
 */
export function applyTheme(mode: ThemeMode): 'dark' | 'light' {
  const resolved = resolveEffectiveTheme(mode);
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(resolved);
    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-theme-mode', mode);
    root.style.colorScheme = resolved;

    const body = document.body;
    if (body) {
      body.classList.remove('dark', 'light');
      body.classList.add(resolved);
    }
  }
  return resolved;
}

/**
 * Persist theme mode to localStorage
 */
export function saveThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {}
}
