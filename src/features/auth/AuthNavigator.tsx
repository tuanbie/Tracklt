import { useState } from 'react';

import { useAuthStore } from '../../store/authStore';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { VerifyCodeScreen } from './screens/VerifyCodeScreen';

type AuthStep = 'login' | 'signup' | 'verify';

/**
 * Login → Sign up → Email verification (mock), then marks session active via `login()`.
 */
export function AuthNavigator() {
  const login = useAuthStore((s) => s.login);
  const [step, setStep] = useState<AuthStep>('login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingName, setPendingName] = useState('');

  if (step === 'login') {
    return (
      <LoginScreen onGoToSignUp={() => setStep('signup')} />
    );
  }

  if (step === 'signup') {
    return (
      <SignUpScreen
        onBackToLogin={() => setStep('login')}
        onSignedUp={({ displayName, email }) => {
          setPendingName(displayName);
          setPendingEmail(email);
          setStep('verify');
        }}
      />
    );
  }

  return (
    <VerifyCodeScreen
      email={pendingEmail}
      onContinue={() => {
        login({
          displayName: pendingName,
          email: pendingEmail,
          authProvider: 'email',
        });
      }}
    />
  );
}
