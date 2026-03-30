import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: EffectiveTheme;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  disableTransitionOnChange?: boolean;
}

const THEME_QUERY = '(prefers-color-scheme: dark)';
const DEFAULT_THEME: Theme = 'system';
const DEFAULT_STORAGE_KEY = 'theme';
const VALID_THEMES: readonly Theme[] = ['light', 'dark', 'system'];

const hasDOM =
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  typeof document.documentElement !== 'undefined';

const useIsomorphicLayoutEffect = hasDOM ? useLayoutEffect : useEffect;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && VALID_THEMES.includes(value as Theme);
}

function getSystemTheme(): EffectiveTheme {
  if (!hasDOM || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia(THEME_QUERY).matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): EffectiveTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

function readStoredTheme(storageKey: string): Theme | null {
  if (!hasDOM) {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(storageKey: string, theme: Theme): void {
  if (!hasDOM) {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // Ignore storage failures in private mode or restricted environments.
  }
}

function disableTransitionsTemporarily(): () => void {
  if (!hasDOM) {
    return () => {};
  }

  const style = document.createElement('style');
  style.textContent = '*{-webkit-transition:none!important;transition:none!important}';
  document.head.appendChild(style);

  // Force style recalculation so transition suppression is applied instantly.
  void window.getComputedStyle(document.body);

  return () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => style.remove());
    });
  };
}

function applyTheme(theme: EffectiveTheme, disableTransitionOnChange: boolean): void {
  if (!hasDOM) {
    return;
  }

  const restoreTransitions = disableTransitionOnChange ? disableTransitionsTemporarily() : () => {};
  const root = document.documentElement;

  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;

  restoreTransitions();
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = DEFAULT_STORAGE_KEY,
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme(storageKey) ?? defaultTheme);
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(() =>
    resolveTheme(readStoredTheme(storageKey) ?? defaultTheme),
  );

  const themeRef = useRef(theme);
  themeRef.current = theme;

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      if (!isTheme(nextTheme)) {
        return;
      }

      setThemeState(nextTheme);
      writeStoredTheme(storageKey, nextTheme);
    },
    [storageKey],
  );

  useIsomorphicLayoutEffect(() => {
    const nextEffectiveTheme = resolveTheme(theme);
    applyTheme(nextEffectiveTheme, disableTransitionOnChange);
    setEffectiveTheme(prev => (prev === nextEffectiveTheme ? prev : nextEffectiveTheme));
  }, [theme, disableTransitionOnChange]);

  useEffect(() => {
    if (!hasDOM || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(THEME_QUERY);

    const handleSystemThemeChange = () => {
      if (themeRef.current !== 'system') {
        return;
      }

      const nextEffectiveTheme: EffectiveTheme = mediaQuery.matches ? 'dark' : 'light';
      applyTheme(nextEffectiveTheme, disableTransitionOnChange);
      setEffectiveTheme(prev => (prev === nextEffectiveTheme ? prev : nextEffectiveTheme));
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }

    mediaQuery.addListener(handleSystemThemeChange);
    return () => mediaQuery.removeListener(handleSystemThemeChange);
  }, [disableTransitionOnChange]);

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      effectiveTheme,
    }),
    [theme, setTheme, effectiveTheme],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
} {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function getThemeInitScript(
  defaultTheme: Theme = DEFAULT_THEME,
  storageKey: string = DEFAULT_STORAGE_KEY,
): string {
  return `
(function () {
  var valid = { light: true, dark: true, system: true };
  var theme = '${defaultTheme}';
  try {
    var stored = localStorage.getItem('${storageKey}');
    if (stored && valid[stored]) theme = stored;
  } catch (e) {}

  var prefersDark =
    typeof window.matchMedia === 'function' && window.matchMedia('${THEME_QUERY}').matches;
  var effective = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;

  var root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(effective);
  root.style.colorScheme = effective;
})();
`.trim();
}
