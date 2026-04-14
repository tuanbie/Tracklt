import { useColorScheme } from 'nativewind';
import { Pressable, StatusBar, Text, View } from 'react-native';

import {
  cycleThemePreference,
  useThemeStore,
  type ThemePreference,
} from '../../../store/themeStore';
import { Screen } from '../../../shared/components';

function labelForPreference(p: ThemePreference): string {
  switch (p) {
    case 'system':
      return 'System';
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
    default:
      return p;
  }
}

/**
 * Starter home screen — demonstrates semantic NativeWind classes and theme cycling.
 */
export function HomeScreen() {
  const preference = useThemeStore(s => s.preference);
  const setPreference = useThemeStore(s => s.setPreference);
  const { colorScheme } = useColorScheme();
  const resolved = colorScheme ?? 'light';

  return (
    <Screen>
      <StatusBar
        barStyle={resolved === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-semibold text-foreground">TrackIt</Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Offline-first foundation — theme preference is persisted locally.
        </Text>

        <View className="mt-8 rounded-xl border border-border bg-card p-4">
          <Text className="text-sm font-medium text-card-foreground">
            Appearance
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            Mode: {labelForPreference(preference)} · resolved {resolved}
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-4 items-center rounded-lg bg-primary py-3 active:opacity-90"
            onPress={() => setPreference(cycleThemePreference(preference))}
          >
            <Text className="font-medium text-primary-foreground">
              Cycle theme (system → light → dark)
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
