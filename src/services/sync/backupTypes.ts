import type { LanguagePreference } from '../../core/i18n/resolveLanguage';
import type { ThemePreference } from '../../store/themeStore';
import type { UserTransactionGroup } from '../../store/transactionGroupStore';
import type { UserTransactionType } from '../../store/transactionTypeStore';
import type { SavedTransaction } from '../../store/transactionsStore';

export const BACKUP_VERSION = 1 as const;

export type AppBackupV1 = {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  transactions: SavedTransaction[];
  types: UserTransactionType[];
  groups: UserTransactionGroup[];
  themePreference: ThemePreference;
  languagePreference: LanguagePreference;
};

export function isAppBackupV1(x: unknown): x is AppBackupV1 {
  if (!x || typeof x !== 'object') {
    return false;
  }
  const o = x as Record<string, unknown>;
  return (
    o.version === 1 &&
    typeof o.exportedAt === 'string' &&
    Array.isArray(o.transactions) &&
    Array.isArray(o.types) &&
    Array.isArray(o.groups)
  );
}
