import { useSyncExternalStore, useCallback } from 'react';

type Theme = 'dark' | 'light';

const listeners = new Set<() => void>();

function getSnapshot(): Theme {
  return (document.documentElement.getAttribute('data-theme') as Theme) || 'dark';
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  listeners.forEach((cb) => cb());
}

/** Shared theme hook — single source of truth for all consumers. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot);

  const setTheme = useCallback((next: Theme) => applyTheme(next), []);

  const toggleTheme = useCallback(() => {
    applyTheme(getSnapshot() === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, setTheme, toggleTheme } as const;
}
