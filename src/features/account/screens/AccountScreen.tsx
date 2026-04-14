import { Pressable, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../../../core/i18n';
import { useResolvedColorScheme } from '../../../core/theme';
import { useAuthStore } from '../../../store/authStore';
import { formatEur } from '../../finance/formatCurrency';
import { MOCK_TOTAL_SAVINGS } from '../../finance/mockData';

type Props = {
  onOpenSettings: () => void;
};

export function AccountScreen({ onOpenSettings }: Props) {
  const { t } = useI18n();
  const displayName = useAuthStore((s) => s.displayName);
  const isGuest = useAuthStore((s) => s.isGuest);
  const insets = useSafeAreaInsets();
  const name = isGuest ? t('account.guest') : displayName ?? 'Davide Tacchino';
  const resolved = useResolvedColorScheme();

  return (
    <View className="flex-1 bg-slate-100 dark:bg-[#070b14]">
      <StatusBar
        barStyle={resolved === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View
        className="flex-row items-center justify-between px-5"
        style={{ paddingTop: Math.max(insets.top, 12) }}>
        <Text className="w-10" />
        <Text className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('account.title')}
        </Text>
        <View className="flex-row gap-2">
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-white/5 active:opacity-80">
            <Text className="text-sm text-slate-800 dark:text-white">✎</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="More"
            onPress={onOpenSettings}
            className="h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-white/5 active:opacity-80">
            <Text className="text-lg font-bold text-slate-800 dark:text-white">⋮</Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-2 h-px bg-slate-200 dark:bg-white/10" />

      <View className="mt-8 items-center px-5">
        <View
          className="h-28 w-28 items-center justify-center rounded-full border-2 border-violet-400/50 bg-slate-200 dark:border-violet-500/60 dark:bg-slate-800">
          <Text className="text-5xl">👤</Text>
        </View>
        <Text className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
          {t('account.hi')}, {name}
        </Text>
      </View>

      <View className="mx-5 mt-10 rounded-3xl border border-slate-200 bg-white p-6 dark:border-transparent dark:bg-[#121a2b]">
        <Text className="text-lg font-bold text-slate-900 dark:text-white">
          {t('account.totalSavings')}
        </Text>
        <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t('account.signedUp')}
        </Text>
        <Text className="mt-6 text-4xl font-bold text-slate-900 dark:text-white">
          {formatEur(MOCK_TOTAL_SAVINGS)}
        </Text>
        <Text className="mt-4 text-sm leading-5 text-slate-500 dark:text-slate-400">
          {t('account.savingsFootnote')}
        </Text>
      </View>

      <View className="flex-1" />
    </View>
  );
}
