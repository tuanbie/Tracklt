import { useThemeStore, type ThemePreference } from '../store/themeStore';

/**
 * Persisted theme mode: system default, or forced light/dark.
 */
export function useThemePreference(): ThemePreference {
  return useThemeStore((s) => s.preference);
}
