import { useMemo } from 'react';

import { useLocaleStore } from '../../store/localeStore';
import { resolveAppLanguage } from './resolveLanguage';
import { translations } from './translations';
import { translate } from './t';

export function useI18n() {
  const languagePreference = useLocaleStore((s) => s.languagePreference);
  const setLanguagePreference = useLocaleStore((s) => s.setLanguagePreference);

  const resolved = useMemo(
    () => resolveAppLanguage(languagePreference),
    [languagePreference],
  );

  const dict = translations[resolved];

  const t = useMemo(
    () => (path: string) => translate(dict, path),
    [dict],
  );

  return {
    t,
    resolved,
    languagePreference,
    setLanguagePreference,
  };
}
