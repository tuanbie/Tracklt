import { useState } from 'react';
import {
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

type Props = {
  onBackToLogin: () => void;
  onSignedUp: (payload: { displayName: string; email: string }) => void;
};

export function SignUpScreen({ onBackToLogin, onSignedUp }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const resolved = colorScheme ?? 'light';

  const canSubmit =
    name.trim().length > 0 &&
    email.includes('@') &&
    password.length >= 6 &&
    password === confirm &&
    agreed;

  const submit = () => {
    if (!canSubmit) {
      return;
    }
    onSignedUp({ displayName: name.trim(), email: email.trim() });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar
        barStyle={resolved === 'dark' ? 'light-content' : 'dark-content'}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: Math.max(insets.bottom, 24),
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}>
        <Pressable onPress={onBackToLogin} className="mb-4 self-start py-2">
          <Text className="text-base text-primary">← Back</Text>
        </Pressable>

        <Text className="text-3xl font-bold text-foreground">Sign up</Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Create an account to get started
        </Text>

        <Text className="mt-8 text-sm font-medium text-foreground">Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#94a3b8"
          className="mt-2 rounded-xl border-2 border-primary bg-white px-4 py-3.5 text-base text-foreground dark:bg-card"
        />

        <Text className="mt-5 text-sm font-medium text-foreground">
          Email Address
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
          Create a password
        </Text>
        <View className="mt-2 flex-row items-center rounded-xl border border-border bg-white dark:bg-card">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!showPw}
            className="flex-1 px-4 py-3.5 text-base text-foreground"
          />
          <Pressable
            onPress={() => setShowPw((s) => !s)}
            className="px-4 py-3">
            <Text className="text-lg text-muted-foreground">
              {showPw ? '🙈' : '👁'}
            </Text>
          </Pressable>
        </View>

        <Text className="mt-5 text-sm font-medium text-foreground">
          Confirm password
        </Text>
        <View className="mt-2 flex-row items-center rounded-xl border border-border bg-white dark:bg-card">
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!showCf}
            className="flex-1 px-4 py-3.5 text-base text-foreground"
          />
          <Pressable
            onPress={() => setShowCf((s) => !s)}
            className="px-4 py-3">
            <Text className="text-lg text-muted-foreground">
              {showCf ? '🙈' : '👁'}
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          onPress={() => setAgreed((a) => !a)}
          className="mt-8 flex-row items-start gap-3">
          <View
            className={`mt-0.5 h-5 w-5 items-center justify-center rounded border-2 ${
              agreed ? 'border-primary bg-primary' : 'border-border'
            }`}>
            {agreed ? (
              <Text className="text-xs font-bold text-primary-foreground">✓</Text>
            ) : null}
          </View>
          <Text className="flex-1 text-sm leading-5 text-muted-foreground">
            I&apos;ve read and agree with the{' '}
            <Text className="font-medium text-primary">Terms and Conditions</Text>
            {' '}and the{' '}
            <Text className="font-medium text-primary">Privacy Policy</Text>
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={!canSubmit}
          className={`mt-8 items-center rounded-xl py-4 ${
            canSubmit ? 'bg-primary active:opacity-90' : 'bg-muted'
          }`}
          onPress={submit}>
          <Text
            className={`text-base font-semibold ${
              canSubmit ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}>
            Create account
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
