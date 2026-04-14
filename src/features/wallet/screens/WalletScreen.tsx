import { useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../../../core/i18n';
import { useResolvedColorScheme } from '../../../core/theme';
import { formatEur } from '../../finance/formatCurrency';
import { MOCK_WALLET_BALANCE } from '../../finance/mockData';

const W = Dimensions.get('window').width;

export function WalletScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const resolved = useResolvedColorScheme();

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setPage(Math.min(2, Math.max(0, Math.round(x / W))));
  };

  return (
    <View className="flex-1 bg-slate-100 dark:bg-[#070b14]">
      <StatusBar
        barStyle={resolved === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={{ paddingTop: Math.max(insets.top, 12) }} className="px-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg text-slate-400 dark:text-white/40">←</Text>
          <View className="items-center">
            <Text className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('wallet.title')}
            </Text>
            <Text className="text-xs text-slate-500">{t('wallet.subtitle')}</Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-white/5">
            <Text className="font-bold text-slate-800 dark:text-white">⋮</Text>
          </View>
        </View>
        <View className="mt-4 h-px bg-slate-200 dark:bg-white/10" />
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        onScrollEndDrag={onScroll}
        scrollEventThrottle={16}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{ width: W }}
            className="items-center px-6 pt-6">
            <View
              className="w-full overflow-hidden rounded-3xl bg-violet-600 p-5 shadow-lg"
              style={{ maxWidth: W - 48 }}>
              <View className="flex-row items-start justify-between">
                <View className="h-8 w-10 rounded bg-amber-100/90" />
                <Text className="text-lg text-white/80">〰</Text>
              </View>
              <Text className="mt-8 text-center text-lg tracking-[4px] text-white">
                0000 0000 0000 0000
              </Text>
              <Text className="mt-3 text-xs text-white/70">VALID THRU 00/00</Text>
              <View className="mt-6 flex-row items-end justify-between">
                <Text className="text-sm font-semibold tracking-wide text-white">
                  TACCHINO DAVIDE
                </Text>
                <View className="flex-row">
                  <View className="h-8 w-8 rounded-full bg-red-500/90" />
                  <View className="-ml-3 h-8 w-8 rounded-full bg-amber-400/90" />
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="flex-row justify-center gap-2 py-3">
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            className={`h-2 w-2 rounded-full ${
              i === page
                ? 'bg-teal-600 dark:bg-teal-400'
                : 'bg-slate-300 dark:bg-white/20'
            }`}
          />
        ))}
      </View>

      <View className="items-center px-5">
        <Text className="text-3xl font-bold text-slate-900 dark:text-white">
          {formatEur(MOCK_WALLET_BALANCE)}
        </Text>
        <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('wallet.availableBalance')}
        </Text>
      </View>

      <View className="mx-5 mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-transparent dark:bg-[#121a2b]">
        <Text className="text-base font-semibold text-slate-900 dark:text-white">
          {t('wallet.addCard')}
        </Text>
        <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('wallet.addCardHint')}
        </Text>
        <TextInput
          placeholder={t('wallet.cardNumberPlaceholder')}
          placeholderTextColor="#64748b"
          keyboardType="number-pad"
          className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-900 dark:border-white/10 dark:bg-[#070b14] dark:text-white"
        />
      </View>
    </View>
  );
}
