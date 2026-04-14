import { useColorScheme } from 'nativewind';
import { useEffect, type PropsWithChildren } from 'react';
import { Appearance } from 'react-native';

import { useThemeStore } from '../../store/themeStore';

/**
 * Keeps NativeWind / Tailwind `dark` class in sync with the persisted preference
 * (`light` | `dark` | `system`). Requires `darkMode: 'class'` in tailwind.config.js.
 * When preference is `system`, OS appearance changes re-apply `system` so UI updates.
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const preference = useThemeStore((s) => s.preference);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(preference);
  }, [preference, setColorScheme]);

  useEffect(() => {
    const sub = Appearance.addChangeListener(() => {
      if (useThemeStore.getState().preference === 'system') {
        setColorScheme('system');
      }
    });
    return () => sub.remove();
  }, [setColorScheme]);

  return <>{children}</>;
}
