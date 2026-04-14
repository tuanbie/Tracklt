import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from 'nativewind';

import { useOnboardingStore } from '../../../store/onboardingStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const INTRO_SLIDES = [
  {
    title: 'Manage your money in minutes',
    subtitle:
      'Track income, expenses, and goals in one calm place — built to work offline.',
  },
  {
    title: 'See where your money goes',
    subtitle:
      'Simple categories and summaries so you always know what changed.',
  },
  {
    title: 'Stay on track',
    subtitle:
      'Set budgets and check progress without spreadsheet headaches.',
  },
] as const;

const INTEREST_OPTIONS = [
  'Budgeting',
  'Saving goals',
  'Investing',
  'Reports & insights',
  'Expense tracking',
  'Bills & subscriptions',
  'Debt payoff',
  'Family finance',
] as const;

function IntroPhase({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const insets = useSafeAreaInsets();
  const footerBlock = 72 + Math.max(insets.bottom, 20);
  const slideHeight = SCREEN_HEIGHT - footerBlock;

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const next = Math.round(x / SCREEN_WIDTH);
      setPage(Math.min(Math.max(next, 0), INTRO_SLIDES.length - 1));
    },
    [],
  );

  const goNext = () => {
    if (page < INTRO_SLIDES.length - 1) {
      const next = page + 1;
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      setPage(next);
    } else {
      onContinue();
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-background">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        onScrollEndDrag={onScroll}
        scrollEventThrottle={16}
        style={{ height: slideHeight }}>
        {INTRO_SLIDES.map((slide, i) => (
          <View
            key={i}
            style={{
              width: SCREEN_WIDTH,
              height: slideHeight,
              paddingTop: insets.top,
            }}
            className="bg-white dark:bg-background">
            <View className="h-[42%] items-center justify-center bg-sky-100 dark:bg-sky-950/40">
              <View className="h-36 w-44 items-center justify-center rounded-2xl bg-slate-200/90 dark:bg-slate-700">
                <Text className="text-4xl opacity-40" accessibilityLabel="">
                  🖼️
                </Text>
              </View>
            </View>
            <View className="flex-1 justify-start px-6 pt-8">
              <View className="mb-6 flex-row justify-center gap-2">
                {INTRO_SLIDES.map((_, dot) => (
                  <View
                    key={dot}
                    className={`h-2 w-2 rounded-full ${
                      dot === page ? 'bg-primary' : 'bg-border dark:bg-muted'
                    }`}
                  />
                ))}
              </View>
              <Text className="text-center text-2xl font-bold text-foreground">
                {slide.title}
              </Text>
              <Text className="mt-3 text-center text-base leading-6 text-muted-foreground">
                {slide.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View
        className="border-t border-border bg-white px-6 pt-4 dark:bg-background"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        <Pressable
          accessibilityRole="button"
          className="items-center rounded-2xl bg-primary py-4 active:opacity-90"
          onPress={goNext}>
          <Text className="text-base font-semibold text-primary-foreground">
            Next
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function InterestsPhase({ onDone }: { onDone: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    INTEREST_OPTIONS.slice(0, 4).forEach((o) => initial.add(o));
    return initial;
  });
  const insets = useSafeAreaInsets();

  const toggle = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <View className="flex-1 bg-white dark:bg-background">
      <View className="px-6 pt-2">
        <View className="h-1.5 overflow-hidden rounded-full bg-muted">
          <View className="h-full w-[40%] rounded-full bg-primary" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-8"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-foreground">
          Personalise your experience
        </Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Choose your interests.
        </Text>

        <View className="mt-8 gap-3">
          {INTEREST_OPTIONS.map((label) => {
            const isOn = selected.has(label);
            return (
              <Pressable
                key={label}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isOn }}
                onPress={() => toggle(label)}
                className={`flex-row items-center justify-between rounded-2xl border px-4 py-4 active:opacity-90 ${
                  isOn
                    ? 'border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/50'
                    : 'border-border bg-white dark:bg-background'
                }`}>
                <Text className="text-base font-medium text-foreground">
                  {label}
                </Text>
                {isOn ? (
                  <Text className="text-lg font-bold text-primary">✓</Text>
                ) : (
                  <View className="h-5 w-5 rounded border border-border" />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View
        className="border-t border-border bg-white px-6 pt-4 dark:bg-background"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        <Pressable
          accessibilityRole="button"
          className="items-center rounded-2xl bg-primary py-4 active:opacity-90"
          onPress={onDone}>
          <Text className="text-base font-semibold text-primary-foreground">
            Next
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * First-launch onboarding: intro carousel + interest selection, matching the provided design.
 */
export function OnboardingScreen() {
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const [phase, setPhase] = useState<'intro' | 'interests'>('intro');
  const { colorScheme } = useColorScheme();
  const resolved = colorScheme ?? 'light';

  return (
    <View className="flex-1 bg-white dark:bg-background">
      <StatusBar
        barStyle={resolved === 'dark' ? 'light-content' : 'dark-content'}
      />
      {phase === 'intro' ? (
        <IntroPhase onContinue={() => setPhase('interests')} />
      ) : (
        <InterestsPhase onDone={completeOnboarding} />
      )}
    </View>
  );
}
