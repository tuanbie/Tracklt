import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from 'nativewind';

import { useI18n } from '../../../core/i18n';
import { signInWithAppleIdentity } from '../../../services/sync/appleSignIn';
import {
  getGoogleSignInUserMessage,
  isGoogleSignInAvailable,
  signInWithGoogleForLogin,
} from '../../../services/sync/googleSignIn';
import { useAuthStore } from '../../../store/authStore';

type Props = {
  onGoToSignUp: () => void;
};

export function LoginScreen({ onGoToSignUp }: Props) {
  const { t } = useI18n();
  const login = useAuthStore(s => s.login);
  const loginAsGuest = useAuthStore(s => s.loginAsGuest);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const resolved = colorScheme ?? 'light';

  const handleLogin = () => {
    const trimmed = email.trim();
    if (!trimmed || !password) {
      return;
    }
    const handle = trimmed.split('@')[0] ?? 'user';
    login({
      displayName: handle
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()),
      email: trimmed,
      authProvider: 'email',
    });
  };

  const onGoogle = async () => {
    if (!isGoogleSignInAvailable()) {
      Alert.alert(t('drive.errorTitle'), t('drive.errorGeneric'));
      return;
    }
    setBusy(true);
    try {
      const { email: em, displayName } = await signInWithGoogleForLogin();
      login({
        displayName,
        email: em || null,
        authProvider: 'google',
        username: em ? `@${em.split('@')[0]}` : '@google',
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown';
      Alert.alert(t('drive.errorTitle'), getGoogleSignInUserMessage(msg, t));
    } finally {
      setBusy(false);
    }
  };

  const onApple = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert(t('drive.errorTitle'), t('drive.errorIosOnly'));
      return;
    }
    setBusy(true);
    try {
      const { email: em, displayName } = await signInWithAppleIdentity();
      login({
        displayName,
        email: em,
        authProvider: 'apple',
        username: em ? `@${em.split('@')[0]}` : '@apple',
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown';
      if (
        msg === 'apple_signin_ios_only' ||
        msg === 'apple_signin_unsupported'
      ) {
        Alert.alert(t('drive.errorTitle'), t('drive.errorIosOnly'));
      } else {
        Alert.alert(t('drive.errorTitle'), t('drive.errorGeneric'));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={resolved === 'dark' ? 'light-content' : 'dark-content'}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Math.max(insets.bottom, 20),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="min-h-[25%] items-center justify-center bg-sky-100 dark:bg-sky-950/40">
          <View className=" items-center justify-center  bg-slate-200/90 dark:bg-slate-700">
            <Image
              source={require('../../../assets/image/logo/welcome.png')}
              style={{
                width: '100%',
                height: undefined,
                aspectRatio: 16 / 9,
              }}
              resizeMode="contain"
            />
          </View>
        </View>

        <View className="px-6 pt-8">
          <Text className="text-3xl font-bold text-foreground">
            {t('auth.welcome')}
          </Text>

          <Text className="mt-6 text-sm font-medium text-foreground">
            {t('auth.emailLabel')}
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="name@email.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="mt-2 rounded-xl border border-border bg-white px-4 py-3.5 text-base text-foreground dark:bg-card"
          />

          <Text className="mt-5 text-sm font-medium text-foreground">
            {t('auth.passwordLabel')}
          </Text>
          <View className="mt-2 flex-row items-center rounded-xl border border-border bg-white dark:bg-card">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              className="flex-1 px-4 py-3.5 text-base text-foreground"
            />
            <Pressable
              accessibilityLabel={
                showPassword ? 'Hide password' : 'Show password'
              }
              onPress={() => setShowPassword(s => !s)}
              className="px-4 py-3"
            >
              <Text className="text-lg text-muted-foreground">
                {showPassword ? '🙈' : '👁'}
              </Text>
            </Pressable>
          </View>

          <Pressable className="mt-4 self-start" accessibilityRole="link">
            <Text className="text-base font-medium text-primary">
              {t('auth.forgotPassword')}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            className="mt-8 items-center rounded-xl bg-green-600  py-4 active:opacity-90"
            onPress={handleLogin}
          >
            <Text className="text-base font-semibold text-primary-foreground">
              {t('auth.login')}
            </Text>
          </Pressable>

          <View className="mt-8 flex-row flex-wrap justify-center">
            <Text className="text-base text-muted-foreground">
              {t('auth.notMember')}{' '}
            </Text>
            <Pressable onPress={onGoToSignUp} accessibilityRole="link">
              <Text className="text-base font-semibold text-primary">
                {t('auth.register')}
              </Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            className="mt-6 items-center rounded-xl border-2 border-border py-3.5 active:opacity-90"
            onPress={() => loginAsGuest()}
          >
            <Text className="text-base font-semibold text-foreground">
              {t('auth.guestContinue')}
            </Text>
          </Pressable>

          <Text className="mt-10 text-center text-sm text-muted-foreground">
            {t('auth.orContinueWith')}
          </Text>
          <View className="mt-4 flex-row justify-center gap-4">
            <Pressable
              accessibilityLabel="Google"
              disabled={busy}
              onPress={onGoogle}
              className="h-12 w-12 items-center justify-center rounded-full bg-[#EA4335] active:opacity-90"
            >
              <Text className="text-lg font-bold text-white">G</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Apple"
              disabled={busy}
              onPress={onApple}
              className="h-12 w-12 items-center justify-center rounded-full bg-black active:opacity-90"
            >
              <Text className="text-lg font-semibold text-white">A</Text>
            </Pressable>
          </View>
          <Text className="mt-6 px-2 text-center text-xs leading-5 text-muted-foreground">
            {t('drive.appleProfileNote')}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
