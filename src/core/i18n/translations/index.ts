import type { AppLanguage } from '../resolveLanguage';
import type { TranslationTree } from './en';
import { en } from './en';
import { ja } from './ja';
import { vi } from './vi';

export const translations: Record<AppLanguage, TranslationTree> = {
  en,
  vi,
  ja,
};

export type { TranslationTree } from './en';
