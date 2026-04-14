import { NativeModules, Platform } from 'react-native';

/**
 * Best-effort device UI language (BCP 47). Prefer Intl; fall back to RN native hints.
 */
export function getSystemLocaleTag(): string {
  try {
    const fromIntl = Intl.DateTimeFormat().resolvedOptions().locale;
    if (fromIntl && fromIntl.length > 1) {
      return fromIntl;
    }
  } catch {
    /* ignore */
  }

  if (Platform.OS === 'ios') {
    const settings = NativeModules.SettingsManager?.settings as
      | { AppleLocale?: string; AppleLanguages?: string[] }
      | undefined;
    return (
      settings?.AppleLocale ||
      settings?.AppleLanguages?.[0] ||
      'en-US'
    );
  }

  const id = NativeModules.I18nManager?.localeIdentifier as string | undefined;

  if (typeof id === 'string' && id.length > 0) {
    return id.replace('_', '-');
  }

  return 'en-US';
}
