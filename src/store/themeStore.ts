import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';

export function cycleThemePreference(current: ThemePreference): ThemePreference {
  const order: ThemePreference[] = ['system', 'light', 'dark'];
  const index = order.indexOf(current);
  return order[(index + 1) % order.length];
}

type ThemeState = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'pfm-theme-preference',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
