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
import { useTransactionsStore } from '../../../store/transactionsStore';
import { formatEur } from '../../finance/formatCurrency';
import { MOCK_AVAILABLE_BALANCE, MOCK_TRANSACTIONS } from '../../finance/mockData';
import { NewTransactionScreen } from '../../transactions';
import { resolveTransactionGroupLabel } from '../../transactions/resolveGroupLabel';

function inputClassName() {
  return 'rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 dark:border-white/20 dark:bg-[#121a2b] dark:text-white';
}

export function DashboardScreen() {
  const { t } = useI18n();
  const [newTxOpen, setNewTxOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [manageGroupsOpen, setManageGroupsOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const displayName = useAuthStore((s) => s.displayName);
  const isGuest = useAuthStore((s) => s.isGuest);
  const insets = useSafeAreaInsets();
  const resolved = useResolvedColorScheme();
  const languagePreference = useLocaleStore((s) => s.languagePreference);
  const appLang = useMemo(
    () => resolveAppLanguage(languagePreference),
    [languagePreference],
  );
  const localeTag =
    appLang === 'vi' ? 'vi-VN' : appLang === 'ja' ? 'ja-JP' : 'en-US';

  const savedItems = useTransactionsStore((s) => s.items);
  const userGroups = useTransactionGroupStore((s) => s.groups);
  const addGroup = useTransactionGroupStore((s) => s.addGroup);
  const removeGroup = useTransactionGroupStore((s) => s.removeGroup);

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
        showsVerticalScrollIndicator={false}>
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
              className="h-10 w-10 items-center justify-center rounded-full bg-teal-500/20 active:opacity-80 dark:bg-teal-500/25">
              <Text className="text-2xl font-light leading-8 text-teal-700 dark:text-teal-300">
                +
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel={t('dashboard.moreOptions')}
              onPress={() => setMenuOpen(true)}
              className="h-10 w-10 items-center justify-center rounded-full bg-slate-200/90 active:opacity-80 dark:bg-white/10">
              <Text className="text-lg font-bold text-slate-800 dark:text-white">
                ⋮
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-4 px-5">
          <Pressable
            onPress={() => setNewTxOpen(true)}
            className="items-center rounded-2xl bg-teal-600 py-4 active:opacity-90 dark:bg-teal-500">
            <Text className="text-base font-bold uppercase tracking-wide text-white">
              {t('dashboard.addTransaction')}
            </Text>
          </Pressable>
        </View>

        <View className="mt-6 items-center px-5">
          <Text className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {formatEur(MOCK_AVAILABLE_BALANCE)}
          </Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('dashboard.availableBalance')}
          </Text>
        </View>

        <View className="mt-8 px-5">
          <Text className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('dashboard.myTransactions')}
          </Text>
          <View className="mt-4 gap-3">
            {savedItems.map((tx) => (
              <View
                key={tx.id}
                className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 dark:border-transparent dark:bg-[#121a2b]">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-teal-500/20 dark:bg-teal-500/25">
                  <Text className="text-lg">✓</Text>
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
                  <Text className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatEur(tx.amount)}
                  </Text>
                </View>
              </View>
            ))}
            {MOCK_TRANSACTIONS.map((tx) => (
              <View
                key={tx.id}
                className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 opacity-90 dark:border-transparent dark:bg-[#121a2b]">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-slate-200 dark:bg-white/10">
                  <Text className="text-lg">{tx.icon || '◆'}</Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-slate-900 dark:text-white">
                    {tx.merchant}
                  </Text>
                  <Text className="text-sm text-slate-500 dark:text-slate-500">
                    {tx.date}
                  </Text>
                </View>
                <View className="rounded-full border border-slate-200 px-3 py-1.5 dark:border-white/10">
                  <Text className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatEur(tx.amount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <NewTransactionScreen
        visible={newTxOpen}
        onClose={() => setNewTxOpen(false)}
      />

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}>
        <View className="flex-1">
          <Pressable
            accessibilityRole="button"
            className="absolute inset-0 bg-black/40"
            onPress={() => setMenuOpen(false)}
          />
          <View
            pointerEvents="box-none"
            className="absolute right-5"
            style={{ top: Math.max(insets.top, 12) + 44 }}>
            <View className="min-w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#121a2b]">
              <Pressable
                onPress={() => {
                  setMenuOpen(false);
                  setManageGroupsOpen(true);
                }}
                className="border-b border-slate-100 px-4 py-3.5 active:bg-slate-100 dark:border-white/10 dark:active:bg-white/5">
                <Text className="text-base text-slate-900 dark:text-white">
                  {t('dashboard.menuAddGroup')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMenuOpen(false)}
                className="px-4 py-3.5 active:bg-slate-100 dark:active:bg-white/5">
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
        onRequestClose={() => setManageGroupsOpen(false)}>
        <KeyboardAvoidingView
          className="flex-1 justify-center bg-black/50 px-4"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            className="flex-1 justify-center"
            onPress={() => setManageGroupsOpen(false)}>
            <Pressable
              className="rounded-2xl bg-white p-4 dark:bg-[#121a2b]"
              onPress={(e) => e.stopPropagation()}>
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
                  className="justify-center rounded-xl bg-teal-600 px-4 active:opacity-90 dark:bg-teal-500">
                  <Text className="font-semibold text-white">
                    {t('dashboard.addGroupButton')}
                  </Text>
                </Pressable>
              </View>
              <FlatList
                className="mt-4 max-h-52"
                data={userGroups}
                keyExtractor={(g) => g.id}
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
                onPress={() => setManageGroupsOpen(false)}>
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
