import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LanguagePreference } from '../core/i18n/resolveLanguage';

export type CurrencyPreference = 'EUR' | 'USD' | 'VND';

type LocaleState = {
  /** Default: follow OS — resolve to en/vi/ja via `resolveAppLanguage`. */
  languagePreference: LanguagePreference;
  currencyPreference: CurrencyPreference;
  setLanguagePreference: (preference: LanguagePreference) => void;
  setCurrencyPreference: (currencyPreference: CurrencyPreference) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    set => ({
      languagePreference: 'system',
      currencyPreference: 'EUR',
      setLanguagePreference: languagePreference => set({ languagePreference }),
      setCurrencyPreference: currencyPreference => set({ currencyPreference }),
    }),
    {
      name: 'pfm-locale',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
