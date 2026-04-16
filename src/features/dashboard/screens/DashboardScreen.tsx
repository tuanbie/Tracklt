import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../../../core/i18n';
import { resolveAppLanguage } from '../../../core/i18n/resolveLanguage';
import { useResolvedColorScheme } from '../../../core/theme';
import { useAuthStore } from '../../../store/authStore';
import { useLocaleStore } from '../../../store/localeStore';
import { useTransactionGroupStore } from '../../../store/transactionGroupStore';
import { useTransactionTypeStore } from '../../../store/transactionTypeStore';
import { useTransactionsStore } from '../../../store/transactionsStore';
import { formatCurrency } from '../../finance/formatCurrency';
import { NewTransactionScreen } from '../../transactions';
import { resolveTransactionGroupLabel } from '../../transactions/resolveGroupLabel';

const DATE_FILTERS = ['all', 'month', 'year'] as const;
const STATUS_FILTERS = ['all', 'income', 'expense', 'saving'] as const;

type DateFilterOption = (typeof DATE_FILTERS)[number];
type StatusFilterOption = (typeof STATUS_FILTERS)[number];

function inputClassName() {
  return 'rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 dark:border-white/20 dark:bg-[#121a2b] dark:text-white';
}

export function DashboardScreen() {
  const { t } = useI18n();
  const [newTxOpen, setNewTxOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [manageGroupsOpen, setManageGroupsOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const displayName = useAuthStore(s => s.displayName);
  const isGuest = useAuthStore(s => s.isGuest);
  const insets = useSafeAreaInsets();
  const resolved = useResolvedColorScheme();
  const languagePreference = useLocaleStore(s => s.languagePreference);
  const currencyPreference = useLocaleStore(s => s.currencyPreference);
  const transactionTypes = useTransactionTypeStore(s => s.types);
  const appLang = useMemo(
    () => resolveAppLanguage(languagePreference),
    [languagePreference],
  );
  const localeTag =
    appLang === 'vi' ? 'vi-VN' : appLang === 'ja' ? 'ja-JP' : 'en-US';

  const savedItems = useTransactionsStore(s => s.items);
  const userGroups = useTransactionGroupStore(s => s.groups);
  const addGroup = useTransactionGroupStore(s => s.addGroup);
  const removeGroup = useTransactionGroupStore(s => s.removeGroup);
  const [typeFilter, setTypeFilter] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const totalBalance = savedItems.reduce((sum, tx) => {
    if (tx.status === 'income') return sum + tx.amount;
    return sum - tx.amount;
  }, 0);
  const totalBalanceText = formatCurrency(
    totalBalance,
    currencyPreference,
    localeTag,
  );

  const formatSavedDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(localeTag, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const transactionDateMatches = (txIso: string, filter: DateFilterOption) => {
    const date = new Date(txIso);
    const now = new Date();
    if (filter === 'month') {
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }
    if (filter === 'year') {
      return date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredTransactions = savedItems.filter(tx => {
    const statusMatch =
      statusFilter === 'all' ? true : tx.status === statusFilter;
    const typeMatch = typeFilter === 'all' ? true : tx.typeId === typeFilter;
    const dateMatch = transactionDateMatches(tx.createdAt, dateFilter);
    return statusMatch && typeMatch && dateMatch;
  });

  const selectedTransaction =
    selectedTxId === null
      ? null
      : savedItems.find(tx => tx.id === selectedTxId) ?? null;

  const formatTransactionAmount = (tx: { amount: number; status?: string }) => {
    const amount = tx.status === 'income' ? tx.amount : tx.amount * -1;
    return formatCurrency(amount, currencyPreference, localeTag);
  };

  return (
    <View className="flex-1 bg-slate-100 dark:bg-[#070b14]">
      <StatusBar
        barStyle={resolved === 'dark' ? 'light-content' : 'dark-content'}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 28,
          paddingTop: Math.max(insets.top, 12),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between px-5">
          <View>
            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              {t('tabs.home')}
            </Text>
            <Text className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {isGuest ? t('account.guest') : displayName ?? '—'}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityLabel={t('dashboard.addTransaction')}
              onPress={() => setNewTxOpen(true)}
              className="h-10 w-10 items-center justify-center rounded-full bg-teal-500/20 active:opacity-80 dark:bg-teal-500/25"
            >
              <Text className="text-2xl font-light leading-8 text-teal-700 dark:text-teal-300">
                +
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel={t('dashboard.moreOptions')}
              onPress={() => setMenuOpen(true)}
              className="h-10 w-10 items-center justify-center rounded-full bg-slate-200/90 active:opacity-80 dark:bg-white/10"
            >
              <Text className="text-lg font-bold text-slate-800 dark:text-white">
                ⋮
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-4 px-5">
          <Pressable
            onPress={() => setNewTxOpen(true)}
            className="items-center rounded-2xl bg-teal-600 py-4 active:opacity-90 dark:bg-teal-500"
          >
            <Text className="text-base font-bold uppercase tracking-wide text-white">
              {t('dashboard.addTransaction')}
            </Text>
          </Pressable>
        </View>

        <View className="mt-6 px-5">
          <View className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#121a2b]">
            <View className="flex-row flex-wrap gap-2">
              <View className="rounded-2xl bg-slate-100 px-3 py-2 dark:bg-white/5">
                <Text className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {t('dashboard.currencyLabel')}
                </Text>
                <Text className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                  {currencyPreference}
                </Text>
              </View>
              <View className="rounded-2xl bg-slate-100 px-3 py-2 dark:bg-white/5">
                <Text className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {t('dashboard.filterByStatus')}
                </Text>
                <Text className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                  {statusFilter === 'all'
                    ? t('dashboard.filterDateAll')
                    : t(`transactionStatus.${statusFilter}`)}
                </Text>
              </View>
              <View className="rounded-2xl bg-slate-100 px-3 py-2 dark:bg-white/5">
                <Text className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {t('dashboard.filterByDate')}
                </Text>
                <Text className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                  {dateFilter === 'all'
                    ? t('dashboard.filterDateAll')
                    : dateFilter === 'month'
                    ? t('dashboard.filterDateMonth')
                    : t('dashboard.filterDateYear')}
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {totalBalanceText}
          </Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('dashboard.availableBalance')}
          </Text>
        </View>

        <View className="mt-4 px-5">
          <View className="flex-row flex-wrap items-center gap-2">
            {STATUS_FILTERS.map(option => (
              <Pressable
                key={option}
                onPress={() => setStatusFilter(option)}
                className={`rounded-full border px-3 py-2 ${
                  statusFilter === option
                    ? 'border-teal-600 bg-teal-600'
                    : 'border-slate-300 bg-white dark:border-white/20 dark:bg-[#121a2b]'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    statusFilter === option
                      ? 'text-white'
                      : 'text-slate-700 dark:text-white'
                  }`}
                >
                  {option === 'all'
                    ? t('dashboard.filterDateAll')
                    : t(`transactionStatus.${option}`)}
                </Text>
              </Pressable>
            ))}
          </View>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => setTypeFilter('all')}
              className={`rounded-full border px-3 py-2 ${
                typeFilter === 'all'
                  ? 'border-teal-600 bg-teal-600'
                  : 'border-slate-300 bg-white dark:border-white/20 dark:bg-[#121a2b]'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  typeFilter === 'all'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white'
                }`}
              >
                {t('dashboard.filterByType')}
              </Text>
            </Pressable>
            {transactionTypes.map(type => (
              <Pressable
                key={type.id}
                onPress={() => setTypeFilter(type.id)}
                className={`rounded-full border px-3 py-2 ${
                  typeFilter === type.id
                    ? 'border-teal-600 bg-teal-600'
                    : 'border-slate-300 bg-white dark:border-white/20 dark:bg-[#121a2b]'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    typeFilter === type.id
                      ? 'text-white'
                      : 'text-slate-700 dark:text-white'
                  }`}
                >
                  {type.name}
                </Text>
              </Pressable>
            ))}
          </View>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {DATE_FILTERS.map(option => (
              <Pressable
                key={option}
                onPress={() => setDateFilter(option)}
                className={`rounded-full border px-3 py-2 ${
                  dateFilter === option
                    ? 'border-teal-600 bg-teal-600'
                    : 'border-slate-300 bg-white dark:border-white/20 dark:bg-[#121a2b]'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    dateFilter === option
                      ? 'text-white'
                      : 'text-slate-700 dark:text-white'
                  }`}
                >
                  {option === 'all'
                    ? t('dashboard.filterDateAll')
                    : option === 'month'
                    ? t('dashboard.filterDateMonth')
                    : t('dashboard.filterDateYear')}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-8 px-5">
          <Text className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('dashboard.myTransactions')}
          </Text>
          <View className="mt-4 gap-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(tx => (
                <Pressable
                  key={tx.id}
                  onPress={() => {
                    setSelectedTxId(tx.id);
                    setDetailOpen(true);
                  }}
                  className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 dark:border-transparent dark:bg-[#121a2b] active:bg-slate-50 dark:active:bg-white/5"
                >
                  <View
                    className={`h-11 w-11 items-center justify-center rounded-full ${
                      tx.status === 'income'
                        ? 'bg-emerald-500/20 dark:bg-emerald-500/25'
                        : tx.status === 'saving'
                        ? 'bg-sky-500/20 dark:bg-sky-500/25'
                        : 'bg-rose-500/20 dark:bg-rose-500/25'
                    }`}
                  >
                    <Text className="text-lg">
                      {tx.status === 'income'
                        ? '💰'
                        : tx.status === 'saving'
                        ? '🏦'
                        : '➖'}
                    </Text>
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-semibold text-slate-900 dark:text-white">
                      {tx.title}
                    </Text>
                    <Text className="text-sm text-slate-500 dark:text-slate-500">
                      {resolveTransactionGroupLabel(
                        tx.groupKey,
                        t,
                        userGroups,
                        t('dashboard.deletedGroup'),
                      )}
                      {' · '}
                      {formatSavedDate(tx.createdAt)}
                    </Text>
                  </View>
                  <View className="rounded-full border border-slate-200 px-3 py-1.5 dark:border-white/10">
                    <Text
                      className={`text-sm font-medium ${
                        tx.status === 'income'
                          ? 'text-emerald-700 dark:text-emerald-200'
                          : tx.status === 'saving'
                          ? 'text-sky-700 dark:text-sky-200'
                          : 'text-rose-700 dark:text-rose-200'
                      }`}
                    >
                      {formatTransactionAmount(tx)}
                    </Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <View className="rounded-2xl border border-slate-200 bg-white px-4 py-6 dark:border-white/10 dark:bg-[#121a2b]">
                <Text className="text-sm text-slate-500 dark:text-slate-400">
                  {t('dashboard.noTransactionsYet')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <NewTransactionScreen
        visible={newTxOpen}
        onClose={() => setNewTxOpen(false)}
      />

      <Modal
        visible={detailOpen && selectedTransaction !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setDetailOpen(false)}
        >
          <Pressable
            className="rounded-t-3xl bg-card px-5 pt-4 pb-6"
            onPress={e => e.stopPropagation()}
          >
            <Text className="text-center text-lg font-semibold text-card-foreground">
              {selectedTransaction?.title}
            </Text>
            <Text className="mt-2 text-center text-sm text-muted-foreground">
              {selectedTransaction?.status === 'income'
                ? t('transactionStatus.income')
                : selectedTransaction?.status === 'saving'
                ? t('transactionStatus.saving')
                : t('transactionStatus.expense')}
            </Text>
            <View className="mt-4 space-y-3">
              <View className="rounded-2xl bg-slate-100 p-4 dark:bg-[#111827]">
                <Text className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {t('dashboard.availableBalance')}
                </Text>
                <Text className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  {selectedTransaction
                    ? formatTransactionAmount(selectedTransaction)
                    : ''}
                </Text>
              </View>
              <View className="rounded-2xl bg-slate-100 p-4 dark:bg-[#111827]">
                <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('newTransaction.status')}
                </Text>
                <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {selectedTransaction?.status
                    ? t(`transactionStatus.${selectedTransaction.status}`)
                    : t('transactionStatus.expense')}
                </Text>
              </View>
              <View className="rounded-2xl bg-slate-100 p-4 dark:bg-[#111827]">
                <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('newTransaction.selectGroup')}
                </Text>
                <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {selectedTransaction
                    ? resolveTransactionGroupLabel(
                        selectedTransaction.groupKey,
                        t,
                        userGroups,
                        t('dashboard.deletedGroup'),
                      )
                    : ''}
                </Text>
              </View>
              {selectedTransaction?.typeId ? (
                <View className="rounded-2xl bg-slate-100 p-4 dark:bg-[#111827]">
                  <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('newTransaction.transactionType')}
                  </Text>
                  <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {transactionTypes.find(
                      type => type.id === selectedTransaction.typeId,
                    )?.name ?? t('newTransaction.noneType')}
                  </Text>
                </View>
              ) : null}
              {selectedTransaction?.note ? (
                <View className="rounded-2xl bg-slate-100 p-4 dark:bg-[#111827]">
                  <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('newTransaction.note')}
                  </Text>
                  <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {selectedTransaction.note}
                  </Text>
                </View>
              ) : null}
            </View>
            <Pressable
              className="mt-5 items-center rounded-xl bg-teal-600 py-3 active:opacity-90"
              onPress={() => setDetailOpen(false)}
            >
              <Text className="font-semibold text-white">
                {t('settings.close')}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <View className="flex-1">
          <Pressable
            accessibilityRole="button"
            className="absolute inset-0 bg-black/40"
            onPress={() => setMenuOpen(false)}
          />
          <View
            pointerEvents="box-none"
            className="absolute right-5"
            style={{ top: Math.max(insets.top, 12) + 44 }}
          >
            <View className="min-w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#121a2b]">
              <Pressable
                onPress={() => {
                  setMenuOpen(false);
                  setManageGroupsOpen(true);
                }}
                className="border-b border-slate-100 px-4 py-3.5 active:bg-slate-100 dark:border-white/10 dark:active:bg-white/5"
              >
                <Text className="text-base text-slate-900 dark:text-white">
                  {t('dashboard.menuAddGroup')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMenuOpen(false)}
                className="px-4 py-3.5 active:bg-slate-100 dark:active:bg-white/5"
              >
                <Text className="text-base text-slate-500 dark:text-slate-400">
                  {t('settings.cancel')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={manageGroupsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setManageGroupsOpen(false)}
      >
        <KeyboardAvoidingView
          className="flex-1 justify-center bg-black/50 px-4"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            className="flex-1 justify-center"
            onPress={() => setManageGroupsOpen(false)}
          >
            <Pressable
              className="rounded-2xl bg-white p-4 dark:bg-[#121a2b]"
              onPress={e => e.stopPropagation()}
            >
              <Text className="text-lg font-bold text-slate-900 dark:text-white">
                {t('dashboard.manageGroupsTitle')}
              </Text>
              <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t('dashboard.manageGroupsHint')}
              </Text>
              <View className="mt-4 flex-row gap-2">
                <TextInput
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  placeholder={t('dashboard.newGroupPlaceholder')}
                  placeholderTextColor="#94a3b8"
                  className={`flex-1 ${inputClassName()}`}
                />
                <Pressable
                  onPress={() => {
                    addGroup(newGroupName);
                    setNewGroupName('');
                  }}
                  className="justify-center rounded-xl bg-teal-600 px-4 active:opacity-90 dark:bg-teal-500"
                >
                  <Text className="font-semibold text-white">
                    {t('dashboard.addGroupButton')}
                  </Text>
                </Pressable>
              </View>
              <FlatList
                className="mt-4 max-h-52"
                data={userGroups}
                keyExtractor={g => g.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <View className="flex-row items-center justify-between border-b border-slate-100 py-3 dark:border-white/10">
                    <Text className="text-slate-900 dark:text-white">
                      {item.name}
                    </Text>
                    <Pressable onPress={() => removeGroup(item.id)}>
                      <Text className="text-red-500">✕</Text>
                    </Pressable>
                  </View>
                )}
                ListEmptyComponent={
                  <Text className="py-2 text-slate-500 dark:text-slate-400">
                    {t('dashboard.noCustomGroupsYet')}
                  </Text>
                }
              />
              <Pressable
                className="mt-4 items-center rounded-xl bg-slate-100 py-3 dark:bg-white/10"
                onPress={() => setManageGroupsOpen(false)}
              >
                <Text className="font-semibold text-slate-900 dark:text-white">
                  {t('settings.close')}
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
