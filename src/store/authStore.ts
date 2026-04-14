import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AuthProvider = 'email' | 'google' | 'apple';

type AuthState = {
  isAuthenticated: boolean;
  /** Khách: chỉ dữ liệu local, không tài khoản OAuth */
  isGuest: boolean;
  authProvider: AuthProvider | null;
  displayName: string | null;
  email: string | null;
  username: string | null;
  login: (payload: {
    displayName: string | null;
    email: string | null;
    username?: string | null;
    isGuest?: boolean;
    authProvider?: AuthProvider | null;
  }) => void;
  loginAsGuest: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isGuest: false,
      authProvider: null,
      displayName: null,
      email: null,
      username: null,
      login: ({
        displayName,
        email,
        username,
        isGuest = false,
        authProvider = 'email',
      }) => {
        const em = email?.trim() ?? null;
        set({
          isAuthenticated: true,
          isGuest,
          authProvider: isGuest ? null : authProvider,
          displayName,
          email: em,
          username:
            username ??
            (em
              ? `@${em.split('@')[0]?.replace(/\s+/g, '').toLowerCase() ?? 'user'}`
              : '@user'),
        });
      },
      loginAsGuest: () =>
        set({
          isAuthenticated: true,
          isGuest: true,
          authProvider: null,
          displayName: null,
          email: null,
          username: null,
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          isGuest: false,
          authProvider: null,
          displayName: null,
          email: null,
          username: null,
        }),
    }),
    {
      name: 'pfm-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        isAuthenticated: s.isAuthenticated,
        isGuest: s.isGuest,
        authProvider: s.authProvider,
        displayName: s.displayName,
        email: s.email,
        username: s.username,
      }),
    },
  ),
);
