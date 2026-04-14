import { useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../../../core/i18n';
import { useResolvedColorScheme } from '../../../core/theme';
import { formatEur } from '../../finance/formatCurrency';
import {
  MOCK_TOTAL_SPENDING,
  MOCK_WEEK_SPEND_SERIES,
  WEEK_DAYS,
} from '../../finance/mockData';

type Period = 'Week' | 'Month' | 'Year';
type InsightTab = 'Statistics' | 'Savings plan';
type FlowTab = 'Income' | 'Outcome';

export function InsightScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const resolved = useResolvedColorScheme();
  const [topTab, setTopTab] = useState<InsightTab>('Statistics');
  const [period, setPeriod] = useState<Period>('Week');
  const [flow, setFlow] = useState<FlowTab>('Outcome');
  const [selectedDay, setSelectedDay] = useState(5);

  const maxH = 120;
  const series = MOCK_WEEK_SPEND_SERIES;

  return (
    <View className="flex-1 bg-slate-100 dark:bg-[#070b14]">
      <StatusBar
        barStyle={resolved === 'dark' ? 'light-content' : 'dark-content'}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}>
        <View
          className="flex-row items-center justify-between px-5"
          style={{ paddingTop: Math.max(insets.top, 12) }}>
          <Text className="text-lg text-teal-600 dark:text-teal-400">←</Text>
          <Text className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('insight.title')}
          </Text>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-white/5">
            <Text className="font-bold text-slate-800 dark:text-white">⋮</Text>
          </View>
        </View>

        <View className="mt-4 flex-row justify-center gap-10 border-b border-slate-200 px-5 pb-0 dark:border-white/10">
          {(['Statistics', 'Savings plan'] as const).map((tabId) => (
            <Pressable
              key={tabId}
              onPress={() => setTopTab(tabId)}
              className="pb-3">
              <Text
                className={`text-base font-medium ${
                  topTab === tabId
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500'
                }`}>
                {tabId === 'Statistics'
                  ? t('insight.statistics')
                  : t('insight.savingsPlan')}
              </Text>
              {topTab === tabId ? (
                <View className="mt-2 h-1 rounded-full bg-teal-500 dark:bg-teal-400" />
              ) : (
                <View className="mt-2 h-1" />
              )}
            </Pressable>
          ))}
        </View>

        {topTab === 'Savings plan' ? (
          <View className="mx-5 mt-10 items-center rounded-2xl border border-slate-200 bg-white px-6 py-12 dark:border-transparent dark:bg-white/5">
            <Text className="text-center text-base text-slate-500 dark:text-slate-400">
              {t('insight.savingsPlaceholder')}
            </Text>
          </View>
        ) : null}

        {topTab === 'Statistics' ? (
          <>
            <View className="mx-5 mt-6 flex-row rounded-full bg-slate-200/90 p-1 dark:bg-white/5">
              {(['Week', 'Month', 'Year'] as const).map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setPeriod(p)}
                  className={`flex-1 items-center rounded-full py-2.5 ${
                    period === p ? 'bg-teal-500 dark:bg-teal-500' : ''
                  }`}>
                  <Text
                    className={`text-sm font-semibold ${
                      period === p
                        ? 'text-white dark:text-[#070b14]'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                    {p === 'Week'
                      ? t('insight.week')
                      : p === 'Month'
                        ? t('insight.month')
                        : t('insight.year')}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="mt-10 items-center px-5">
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                {t('insight.totalSpendings')}
              </Text>
              <Text className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
                {formatEur(MOCK_TOTAL_SPENDING)}
              </Text>
            </View>

            <View className="mx-5 mt-8 flex-row justify-center gap-12 border-b border-slate-200 pb-2 dark:border-white/10">
              {(['Income', 'Outcome'] as const).map((f) => (
                <Pressable key={f} onPress={() => setFlow(f)}>
                  <Text
                    className={`text-base font-medium ${
                      flow === f
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500'
                    }`}>
                    {f === 'Income' ? t('insight.income') : t('insight.outcome')}
                  </Text>
                  {flow === f ? (
                    <View className="mt-2 h-0.5 rounded-full bg-teal-500 dark:bg-teal-400" />
                  ) : (
                    <View className="mt-2 h-0.5" />
                  )}
                </Pressable>
              ))}
            </View>

            <View className="mx-5 mt-8 h-40 flex-row items-end justify-between gap-1 px-1">
              {series.map((h, i) => {
                const barH = Math.max(8, h * maxH);
                const isSel = i === selectedDay;
                return (
                  <Pressable
                    key={WEEK_DAYS[i]}
                    onPress={() => setSelectedDay(i)}
                    className="flex-1 items-center">
                    <View
                      className="w-full rounded-t-lg bg-teal-500/40 dark:bg-teal-500/30"
                      style={{
                        height: barH,
                        backgroundColor: isSel
                          ? resolved === 'dark'
                            ? '#2dd4bf88'
                            : '#0d948888'
                          : resolved === 'dark'
                            ? '#2dd4bf33'
                            : '#5eead466',
                      }}
                    />
                    <Text
                      className={`mt-2 text-xs ${
                        isSel
                          ? 'font-semibold text-teal-600 dark:text-teal-400'
                          : 'text-slate-500'
                      }`}>
                      {WEEK_DAYS[i]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedDay === 5 ? (
              <View className="mx-5 mt-4 self-center rounded-xl border border-slate-200 bg-slate-200 px-4 py-2 dark:border-transparent dark:bg-[#1e293b]">
                <Text className="text-center text-sm font-medium text-slate-900 dark:text-white">
                  {formatEur(-328.0)}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
