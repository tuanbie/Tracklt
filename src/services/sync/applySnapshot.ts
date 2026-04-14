import { useLocaleStore } from '../../store/localeStore';
import { useThemeStore } from '../../store/themeStore';
import { useTransactionGroupStore } from '../../store/transactionGroupStore';
import { useTransactionTypeStore } from '../../store/transactionTypeStore';
import { useTransactionsStore } from '../../store/transactionsStore';
import { isAppBackupV1, type AppBackupV1 } from './backupTypes';

export function applyAppBackup(data: AppBackupV1): void {
  useTransactionsStore.setState({ items: data.transactions });
  useTransactionTypeStore.setState({ types: data.types });
  useTransactionGroupStore.setState({ groups: data.groups });
  useThemeStore.setState({ preference: data.themePreference });
  useLocaleStore.setState({ languagePreference: data.languagePreference });
}

export function tryParseAndApplyBackup(json: string): { ok: true } | { ok: false; reason: string } {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!isAppBackupV1(parsed)) {
      return { ok: false, reason: 'invalid_schema' };
    }
    applyAppBackup(parsed);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'parse_error' };
  }
}
