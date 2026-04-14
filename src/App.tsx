/**
 * Application root — providers and navigation entry.
 *
 * @format
 */

import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from './core/theme';
import { MainTabs } from './features/app';
import { AuthNavigator } from './features/auth';
import { OnboardingScreen } from './features/onboarding';
import { useAuthStore } from './store/authStore';
import { useLocaleStore } from './store/localeStore';
import { useOnboardingStore } from './store/onboardingStore';

/**
 * Flow: onboarding (first launch) → auth (login / sign up / verify) → main tabs.
 * Persisted session skips auth until logout.
 */
function Root() {
  const [onboardingReady, setOnboardingReady] = useState(
    () => useOnboardingStore.persist.hasHydrated(),
  );
  const [authReady, setAuthReady] = useState(
    () => useAuthStore.persist.hasHydrated(),
  );
  const [localeReady, setLocaleReady] = useState(
    () => useLocaleStore.persist.hasHydrated(),
  );
  const hasCompletedOnboarding = useOnboardingStore(
    (s) => s.hasCompletedOnboarding,
  );
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const u1 = useOnboardingStore.persist.onFinishHydration(() => {
      setOnboardingReady(true);
    });
    const u2 = useAuthStore.persist.onFinishHydration(() => {
      setAuthReady(true);
    });
    const u3 = useLocaleStore.persist.onFinishHydration(() => {
      setLocaleReady(true);
    });
    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  if (!onboardingReady || !authReady || !localeReady) {
    return <View className="flex-1 bg-background" />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return <MainTabs />;
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
