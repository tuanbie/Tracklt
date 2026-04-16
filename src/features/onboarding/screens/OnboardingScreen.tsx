import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useColorScheme } from 'nativewind';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

import { useOnboardingStore } from '../../../store/onboardingStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const INTRO_SLIDES = [
  {
    title: 'Manage your money in minutes',
    subtitle:
      'Track income, expenses, and goals in one calm place — built to work offline.',
    image: require('../../../assets/image/slider/slider_1.png'),
  },
  {
    title: 'See where your money goes',
    subtitle:
      'Simple categories and summaries so you always know what changed.',
    image: require('../../../assets/image/slider/slider_2.png'),
  },
  {
    title: 'Stay on track',
    subtitle: 'Set budgets and check progress without spreadsheet headaches.',
    image: require('../../../assets/image/slider/slider_3.png'),
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

function IntroPhase({ onContinue }: { onContinue: () => void }) {
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const insets = useSafeAreaInsets();
  const footerBlock = 72 + Math.max(insets.bottom, 20);
  const slideHeight = SCREEN_HEIGHT - footerBlock;

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / SCREEN_WIDTH);
    setPage(Math.min(Math.max(next, 0), INTRO_SLIDES.length - 1));
  }, []);

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
        style={{ height: slideHeight }}
      >
        {INTRO_SLIDES.map((slide, i) => (
          <View
            key={i}
            style={{
              width: SCREEN_WIDTH,
              height: slideHeight,
              paddingTop: insets.top,
            }}
            className="bg-white dark:bg-background"
          >
            <View className="h-[42%] items-center justify-center bg-sky-100 dark:bg-sky-950/40">
              <Image
                source={slide.image}
                style={{
                  width: '100%',
                  height: 200,
                }}
                resizeMode="contain"
              />
            </View>
            <View className="flex-1 justify-start px-6 pt-8">
              <View className="mb-6 flex-row justify-center gap-2">
                {INTRO_SLIDES.map((_, dot) => (
                  <View
                    key={dot}
                    className={`h-2 w-2 rounded-full ${
                      dot === page ? 'bg-green-600 ' : 'bg-border dark:bg-muted'
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
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <Pressable
          accessibilityRole="button"
          className="items-center rounded-2xl bg-green-600 py-4 active:opacity-90"
          onPress={goNext}
        >
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
    INTEREST_OPTIONS.slice(0, 0).forEach(o => initial.add(o));
    return initial;
  });
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const resolved = colorScheme ?? 'light';

  const toggle = (label: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const InterestItem = ({ label }: { label: string }) => {
    const isOn = selected.has(label);
    const animatedValue = useSharedValue(isOn ? 1 : 0);

    useEffect(() => {
      animatedValue.value = withTiming(isOn ? 1 : 0, { duration: 300 });
    }, [isOn, animatedValue]);

    const animatedStyle = useAnimatedStyle(() => {
      const isDark = resolved === 'dark';
      const selectedBg = isDark
        ? 'rgba(12, 74, 110, 0.5)'
        : 'rgba(186, 230, 253, 0.5)'; // sky-950/50 or sky-50
      const unselectedBg = isDark
        ? 'rgba(0, 0, 0, 0)'
        : 'rgba(255, 255, 255, 1)'; // background or white
      const selectedBorder = isDark ? 'rgb(12, 74, 110)' : 'rgb(186, 230, 253)'; // sky-800 or sky-200
      const unselectedBorder = 'rgb(203, 213, 225)'; // border

      return {
        backgroundColor: animatedValue.value > 0.5 ? selectedBg : unselectedBg,
        borderColor:
          animatedValue.value > 0.5 ? selectedBorder : unselectedBorder,
      };
    });

    return (
      <AnimatedPressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isOn }}
        onPress={() => toggle(label)}
        className="flex-row items-center justify-between rounded-2xl border px-4 py-4 active:opacity-90"
        style={[{ height: 60 }, animatedStyle]} // Fixed height to prevent size change
      >
        <Text className="text-base font-medium text-foreground">{label}</Text>
        {isOn ? (
          <Text className="text-lg font-bold text-green-700 dark:text-sky-200">
            ✓
          </Text>
        ) : (
          <View className="h-5 w-5 rounded border border-border" />
        )}
      </AnimatedPressable>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-background">
      <View className="px-6 pt-2">
        <View className="h-1.5 overflow-hidden rounded-full bg-muted">
          <View className="h-full w-[40%] rounded-full bg-green-600 " />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-8"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-foreground">
          Personalise your experience
        </Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Choose your interests.
        </Text>

        <View className="mt-8 gap-3">
          {INTEREST_OPTIONS.map(label => (
            <InterestItem key={label} label={label} />
          ))}
        </View>
      </ScrollView>

      <View
        className="border-t border-border bg-white px-6 pt-4 dark:bg-background"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <Pressable
          accessibilityRole="button"
          className="items-center rounded-2xl bg-green-600  py-4 active:opacity-90"
          onPress={onDone}
        >
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
  const completeOnboarding = useOnboardingStore(s => s.completeOnboarding);
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
