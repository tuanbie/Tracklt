import { getSystemLocaleTag } from './getSystemLocale';

export type AppLanguage = 'en' | 'vi' | 'ja';
export type LanguagePreference = 'system' | AppLanguage;

export function resolveAppLanguage(preference: LanguagePreference): AppLanguage {
  if (preference !== 'system') {
    return preference;
  }

  const tag = getSystemLocaleTag().toLowerCase();

  if (tag.startsWith('vi')) {
    return 'vi';
  }
  if (tag.startsWith('ja')) {
    return 'ja';
  }

  return 'en';
}
