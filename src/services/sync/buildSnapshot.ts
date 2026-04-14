import { useLocaleStore } from '../../store/localeStore';
import { useThemeStore } from '../../store/themeStore';
import { useTransactionGroupStore } from '../../store/transactionGroupStore';
import { useTransactionTypeStore } from '../../store/transactionTypeStore';
import { useTransactionsStore } from '../../store/transactionsStore';
import { BACKUP_VERSION, type AppBackupV1 } from './backupTypes';

export function buildAppBackup(): AppBackupV1 {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    transactions: useTransactionsStore.getState().items,
    types: useTransactionTypeStore.getState().types,
    groups: useTransactionGroupStore.getState().groups,
    themePreference: useThemeStore.getState().preference,
    languagePreference: useLocaleStore.getState().languagePreference,
  };
}
