import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from 'nativewind';

type Props = {
  email: string;
  onContinue: () => void;
};

export function VerifyCodeScreen({ email, onContinue }: Props) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const resolved = colorScheme ?? 'light';

  const code = digits.join('');
  const complete = code.length === 4;

  const setAt = (i: number, char: string) => {
    const c = char.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = c;
    setDigits(next);
    if (c && i < 3) {
      refs[i + 1].current?.focus();
    }
  };

  const onKeyPress = (i: number, key: string) => {
    if (key === 'Backspace' && !digits[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar
        barStyle={resolved === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View
        className="flex-1 px-6"
        style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom }}>
        <Text className="text-2xl font-bold text-foreground">
          Enter confirmation code
        </Text>
        <Text className="mt-3 text-base leading-6 text-muted-foreground">
          A 4-digit code was sent to{' '}
          <Text className="font-medium text-foreground">{email}</Text>
        </Text>

        <View className="mt-10 flex-row justify-center gap-3">
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={refs[i]}
              value={d}
              onChangeText={(t) => setAt(i, t)}
              onKeyPress={({ nativeEvent }) =>
                onKeyPress(i, nativeEvent.key)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              className="h-14 w-14 rounded-xl border-2 border-border bg-white text-center text-2xl font-semibold text-foreground dark:bg-card"
            />
          ))}
        </View>

        <Pressable className="mt-8 self-center" accessibilityRole="link">
          <Text className="text-base font-medium text-primary">Resend code</Text>
        </Pressable>

        <View className="flex-1" />

        <Pressable
          accessibilityRole="button"
          disabled={!complete}
          className={`mb-4 items-center rounded-xl py-4 ${
            complete ? 'bg-primary active:opacity-90' : 'bg-muted'
          }`}
          onPress={onContinue}>
          <Text
            className={`text-base font-semibold ${
              complete ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}>
            Continue
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
