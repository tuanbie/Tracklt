import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LanguagePreference } from '../core/i18n/resolveLanguage';

type LocaleState = {
  /** Default: follow OS — resolve to en/vi/ja via `resolveAppLanguage`. */
  languagePreference: LanguagePreference;
  setLanguagePreference: (preference: LanguagePreference) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      languagePreference: 'system',
      setLanguagePreference: (languagePreference) => set({ languagePreference }),
    }),
    {
      name: 'pfm-locale',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
