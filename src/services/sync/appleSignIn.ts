import { Platform } from 'react-native';
import { appleAuth } from '@invertase/react-native-apple-authentication';

export async function signInWithAppleIdentity(): Promise<{
  email: string | null;
  displayName: string;
}> {
  if (Platform.OS !== 'ios') {
    throw new Error('apple_signin_ios_only');
  }

  if (!appleAuth.isSupported) {
    throw new Error('apple_signin_unsupported');
  }

  const response = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });

  const fn = response.fullName;
  const displayName = fn
    ? [fn.givenName, fn.familyName].filter(Boolean).join(' ') || 'Apple'
    : 'Apple';

  return {
    email: response.email,
    displayName: displayName.trim() || 'Apple',
  };
}
