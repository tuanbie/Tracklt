import { useMemo, useState } from 'react';
import {
  Alert,
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../../../core/i18n';
import { resolveAppLanguage } from '../../../core/i18n/resolveLanguage';
import { useResolvedColorScheme } from '../../../core/theme';
import { useLocaleStore } from '../../../store/localeStore';
import {
  customGroupStorageKey,
  useTransactionGroupStore,
} from '../../../store/transactionGroupStore';
import { useTransactionTypeStore } from '../../../store/transactionTypeStore';
import { useTransactionsStore } from '../../../store/transactionsStore';
import { BUILTIN_GROUP_KEYS, type BuiltinGroupKey } from '../builtinGroups';

type GroupSelection =
  | { kind: 'builtin'; key: BuiltinGroupKey }
  | { kind: 'custom'; id: string };

type Props = {
  visible: boolean;
  onClose: () => void;
};

function FieldLabel({
  children,
  required,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <Text className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
      {children}
      {required ? <Text className="text-red-500"> *</Text> : null}
    </Text>
  );
}

function inputClassName() {
  return 'rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 dark:border-white/20 dark:bg-[#121a2b] dark:text-white';
}

export function NewTransactionScreen({ visible, onClose }: Props) {
  const { t } = useI18n();
  const resolvedTheme = useResolvedColorScheme();
  const insets = useSafeAreaInsets();
  const languagePreference = useLocaleStore((s) => s.languagePreference);
  const appLang = useMemo(
    () => resolveAppLanguage(languagePreference),
    [languagePreference],
  );

  const localeTag = appLang === 'vi' ? 'vi-VN' : appLang === 'ja' ? 'ja-JP' : 'en-US';

  const types = useTransactionTypeStore((s) => s.types);
  const addType = useTransactionTypeStore((s) => s.addType);
  const removeType = useTransactionTypeStore((s) => s.removeType);
  const userGroups = useTransactionGroupStore((s) => s.groups);
  const addTransaction = useTransactionsStore((s) => s.add);

  const [groupSel, setGroupSel] = useState<GroupSelection | null>(null);
  const [title, setTitle] = useState('');
  const [amountText, setAmountText] = useState('');
  const [friend, setFriend] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date());
  const [note, setNote] = useState('');
  const [typeId, setTypeId] = useState<string | null>(null);

  const [groupOpen, setGroupOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [manageTypesOpen, setManageTypesOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [showAndroidDate, setShowAndroidDate] = useState(false);
  const [iosDateOpen, setIosDateOpen] = useState(false);

  const reset = () => {
    setGroupSel(null);
    setTitle('');
    setAmountText('');
    setFriend('');
    setDueDate(new Date());
    setNote('');
    setTypeId(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const parseAmount = (): number | null => {
    const n = parseFloat(amountText.replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const save = () => {
    if (!groupSel) {
      Alert.alert(t('newTransaction.title'), t('newTransaction.selectGroup'));
      return;
    }
    if (!title.trim()) {
      Alert.alert(t('newTransaction.title'), t('newTransaction.name'));
      return;
    }
    const amount = parseAmount();
    if (amount === null || amount === 0) {
      Alert.alert(t('newTransaction.title'), t('newTransaction.amount'));
      return;
    }

    const storedGroupKey =
      groupSel.kind === 'builtin'
        ? groupSel.key
        : customGroupStorageKey(groupSel.id);

    addTransaction({
      groupKey: storedGroupKey,
      title: title.trim(),
      amount,
      friend: friend.trim(),
      dueDateIso: dueDate.toISOString(),
      note: note.trim(),
      typeId,
    });

    reset();
    onClose();
  };

  const groupLabelBuiltin = (k: BuiltinGroupKey) =>
    t(`newTransaction.groups.${k}`);

  const selectedGroupText = (() => {
    if (!groupSel) {
      return null;
    }
    if (groupSel.kind === 'builtin') {
      return groupLabelBuiltin(groupSel.key);
    }
    return userGroups.find((g) => g.id === groupSel.id)?.name ?? '—';
  })();
  const selectedTypeName =
    typeId === null
      ? t('newTransaction.noneType')
      : types.find((x) => x.id === typeId)?.name ?? t('newTransaction.noneType');

  const dateStr = dueDate.toLocaleDateString(localeTag, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        className="flex-1 bg-slate-100 dark:bg-[#070b14]"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <StatusBar
          barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <View style={{ paddingTop: Math.max(insets.top, 12) }} className="px-5 pb-3">
          <Text className="text-center text-xl font-bold text-slate-900 dark:text-white">
            {t('newTransaction.title')}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}>
          <View className="mb-4">
            <FieldLabel required>{t('newTransaction.selectGroup')}</FieldLabel>
            <Pressable
              onPress={() => setGroupOpen(true)}
              className={`${inputClassName()} flex-row items-center justify-between`}>
              <Text
                className={
                  groupSel
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500'
                }>
                {selectedGroupText ?? t('newTransaction.select')}
              </Text>
              <Text className="text-slate-400">⌄</Text>
            </Pressable>
          </View>

          <View className="mb-4">
            <FieldLabel required>{t('newTransaction.name')}</FieldLabel>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t('newTransaction.name')}
              placeholderTextColor="#94a3b8"
              className={inputClassName()}
            />
          </View>

          <View className="mb-4">
            <FieldLabel required>{t('newTransaction.amount')}</FieldLabel>
            <TextInput
              value={amountText}
              onChangeText={setAmountText}
              placeholder="0"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              className={inputClassName()}
            />
          </View>

          <View className="mb-4">
            <FieldLabel>{t('newTransaction.transactionType')}</FieldLabel>
            <Text className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              {t('newTransaction.typeOptionalHint')}
            </Text>
            <Pressable
              onPress={() => setTypeOpen(true)}
              className={`${inputClassName()} flex-row items-center justify-between`}>
              <Text className="flex-1 text-slate-900 dark:text-white">
                {selectedTypeName}
              </Text>
              <Text className="text-slate-400">⌄</Text>
            </Pressable>
            <Pressable
              onPress={() => setManageTypesOpen(true)}
              className="mt-2 self-start active:opacity-80">
              <Text className="text-sm font-medium text-primary">
                {t('newTransaction.manageTypes')}
              </Text>
            </Pressable>
          </View>

          <View className="mb-4">
            <FieldLabel>{t('newTransaction.addFriend')}</FieldLabel>
            <TextInput
              value={friend}
              onChangeText={setFriend}
              placeholder={t('newTransaction.addFriend')}
              placeholderTextColor="#94a3b8"
              className={inputClassName()}
            />
          </View>

          <View className="mb-4">
            <FieldLabel>{t('newTransaction.dueDate')}</FieldLabel>
            <Pressable
              onPress={() =>
                Platform.OS === 'ios'
                  ? setIosDateOpen(true)
                  : setShowAndroidDate(true)
              }
              className={`${inputClassName()} flex-row items-center justify-between`}>
              <Text className="text-slate-900 dark:text-white">{dateStr}</Text>
              <Text className="text-lg">📅</Text>
            </Pressable>
            {showAndroidDate ? (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={(_, date) => {
                  setShowAndroidDate(false);
                  if (date) {
                    setDueDate(date);
                  }
                }}
              />
            ) : null}
          </View>

          <View className="mb-6">
            <FieldLabel>{t('newTransaction.note')}</FieldLabel>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={t('newTransaction.note')}
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className={`${inputClassName()} min-h-[120px]`}
            />
          </View>

          <View className="flex-row gap-3 pb-8">
            <Pressable
              onPress={handleClose}
              className="flex-1 items-center rounded-xl bg-red-500 py-4 active:opacity-90">
              <Text className="font-bold text-white">
                {t('newTransaction.cancel')}
              </Text>
            </Pressable>
            <Pressable
              onPress={save}
              className="flex-1 items-center rounded-xl bg-primary py-4 active:opacity-90">
              <Text className="font-bold text-primary-foreground">
                {t('newTransaction.save')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={groupOpen} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setGroupOpen(false)}>
          <Pressable
            className="rounded-t-3xl bg-card"
            onPress={(e) => e.stopPropagation()}
            style={{ paddingBottom: insets.bottom }}>
            <Text className="border-b border-border px-4 py-3 text-center text-lg font-semibold text-card-foreground">
              {t('newTransaction.selectGroup')}
            </Text>
            <FlatList
              data={[
                ...BUILTIN_GROUP_KEYS.map((key) => ({
                  kind: 'builtin' as const,
                  key,
                })),
                ...userGroups.map((g) => ({
                  kind: 'custom' as const,
                  id: g.id,
                  name: g.name,
                })),
              ]}
              keyExtractor={(item) =>
                item.kind === 'builtin' ? `b-${item.key}` : `c-${item.id}`
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    if (item.kind === 'builtin') {
                      setGroupSel({ kind: 'builtin', key: item.key });
                    } else {
                      setGroupSel({ kind: 'custom', id: item.id });
                    }
                    setGroupOpen(false);
                  }}
                  className="border-b border-border px-4 py-4 active:bg-muted/50">
                  <Text className="text-base text-card-foreground">
                    {item.kind === 'builtin'
                      ? groupLabelBuiltin(item.key)
                      : item.name}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={typeOpen} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setTypeOpen(false)}>
          <Pressable
            className="max-h-[70%] rounded-t-3xl bg-card"
            onPress={(e) => e.stopPropagation()}
            style={{ paddingBottom: insets.bottom }}>
            <Text className="border-b border-border px-4 py-3 text-center text-lg font-semibold text-card-foreground">
              {t('newTransaction.transactionType')}
            </Text>
            <Pressable
              onPress={() => {
                setTypeId(null);
                setTypeOpen(false);
              }}
              className="border-b border-border px-4 py-4 active:bg-muted/50">
              <Text className="text-base text-card-foreground">
                {t('newTransaction.noneType')}
              </Text>
            </Pressable>
            <FlatList
              data={types}
              keyExtractor={(x) => x.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setTypeId(item.id);
                    setTypeOpen(false);
                  }}
                  className="border-b border-border px-4 py-4 active:bg-muted/50">
                  <Text className="text-base text-card-foreground">{item.name}</Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text className="px-4 py-4 text-muted-foreground">
                  {t('newTransaction.noTypesYet')}
                </Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={iosDateOpen} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setIosDateOpen(false)}>
          <Pressable
            className="rounded-t-3xl bg-card px-4 pt-3"
            onPress={(e) => e.stopPropagation()}
            style={{ paddingBottom: insets.bottom }}>
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="spinner"
              themeVariant={resolvedTheme === 'dark' ? 'dark' : 'light'}
              onChange={(_, date) => {
                if (date) {
                  setDueDate(date);
                }
              }}
            />
            <Pressable
              className="mb-2 items-center rounded-xl bg-primary py-3 active:opacity-90"
              onPress={() => setIosDateOpen(false)}>
              <Text className="font-semibold text-primary-foreground">
                {t('settings.done')}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={manageTypesOpen} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-center bg-black/50 px-4"
          onPress={() => setManageTypesOpen(false)}>
          <Pressable
            className="rounded-2xl bg-card p-4"
            onPress={(e) => e.stopPropagation()}>
            <Text className="text-lg font-bold text-card-foreground">
              {t('newTransaction.manageTypes')}
            </Text>
            <View className="mt-4 flex-row gap-2">
              <TextInput
                value={newTypeName}
                onChangeText={setNewTypeName}
                placeholder={t('newTransaction.newTypeName')}
                placeholderTextColor="#94a3b8"
                className={`flex-1 ${inputClassName()}`}
              />
              <Pressable
                onPress={() => {
                  addType(newTypeName);
                  setNewTypeName('');
                }}
                className="justify-center rounded-xl bg-primary px-4 active:opacity-90">
                <Text className="font-semibold text-primary-foreground">
                  {t('newTransaction.addType')}
                </Text>
              </Pressable>
            </View>
            <FlatList
              className="mt-4 max-h-48"
              data={types}
              keyExtractor={(x) => x.id}
              renderItem={({ item }) => (
                <View className="flex-row items-center justify-between border-b border-border py-3">
                  <Text className="text-card-foreground">{item.name}</Text>
                  <Pressable onPress={() => removeType(item.id)}>
                    <Text className="text-destructive">✕</Text>
                  </Pressable>
                </View>
              )}
              ListEmptyComponent={
                <Text className="py-2 text-muted-foreground">
                  {t('newTransaction.noTypesYet')}
                </Text>
              }
            />
            <Pressable
              className="mt-4 items-center rounded-xl bg-muted py-3"
              onPress={() => setManageTypesOpen(false)}>
              <Text className="font-semibold text-foreground">
                {t('settings.close')}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
}
