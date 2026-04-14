import { TurboModuleRegistry } from 'react-native';

import { GOOGLE_WEB_CLIENT_ID } from '../../config/google';

let configured = false;

export const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

type SignInResult =
  | { type: 'success'; data: { user: { email: string; name: string | null; givenName: string | null } } }
  | { type: string; data: unknown };

type SilentResult =
  | { type: 'success'; data: { user: { email: string } } }
  | { type: string; data: unknown };

function hasErrorCode(
  e: unknown,
): e is { code?: string | number; message?: string } {
  return typeof e === 'object' && e != null && 'code' in e;
}

/**
 * Chuẩn hoá lỗi từ native (thường có `code`, không phải lúc nào cũng là Error.message).
 */
export function normalizeGoogleSignInFailure(e: unknown): string {
  if (hasErrorCode(e)) {
    const codeRaw = e.code;
    const code = codeRaw != null ? String(codeRaw) : '';
    const msg = (e.message ?? '').toString();

    if (
      code === 'SIGN_IN_CANCELLED' ||
      msg.includes('SIGN_IN_CANCELLED') ||
      msg.toLowerCase().includes('cancel')
    ) {
      return 'google_signin_cancelled';
    }
    if (
      code === '10' ||
      code === 'DEVELOPER_ERROR' ||
      msg.includes('DEVELOPER_ERROR')
    ) {
      return 'google_signin_developer';
    }
    if (
      msg.includes('Network') ||
      msg.includes('network') ||
      code === 'NETWORK_ERROR'
    ) {
      return 'google_signin_network';
    }
    if (
      msg.includes('scope') ||
      msg.includes('Scope') ||
      msg.includes('invalid_scope')
    ) {
      return 'google_signin_scopes';
    }
    if (__DEV__ && (code || msg)) {
      return `google_signin_detail:${code}|${msg.slice(0, 220)}`;
    }
  }
  if (e instanceof Error && e.message) {
    if (__DEV__) {
      return `google_signin_detail:|${e.message.slice(0, 220)}`;
    }
  }
  return 'google_signin_unknown';
}

/** Dịch mã lỗi nội bộ sang chuỗi hiển thị (i18n). */
export function getGoogleSignInUserMessage(
  message: string,
  t: (key: string) => string,
): string {
  if (message.startsWith('google_signin_detail:')) {
    const rest = message.slice('google_signin_detail:'.length).trim();
    return `${t('drive.errorSignInUnknown')}${rest ? `\n(${rest})` : ''}`;
  }
  const map: Record<string, string> = {
    google_web_client_id_missing: 'drive.errorMissingConfig',
    google_signin_cancelled: 'drive.errorCancelled',
    google_signin_native_unavailable: 'drive.errorNativeUnavailable',
    google_signin_developer: 'drive.errorSignInDeveloper',
    google_signin_network: 'drive.errorSignInNetwork',
    google_signin_scopes: 'drive.errorSignInScopes',
    google_signin_unknown: 'drive.errorSignInUnknown',
  };
  const path = map[message];
  return path ? t(path) : t('drive.errorGeneric');
}

function rethrowIfOurs(e: unknown): void {
  if (e instanceof Error && e.message.startsWith('google_signin_')) {
    throw e;
  }
}

/** Không dùng getEnforcing — tránh crash khi native chưa build / chưa pod. */
function hasGoogleSignInNative(): boolean {
  try {
    return TurboModuleRegistry.get('RNGoogleSignin') != null;
  } catch {
    return false;
  }
}

type GoogleSigninApi = {
  configure: (opts: {
    webClientId?: string;
    offlineAccess?: boolean;
    scopes?: string[];
  }) => void;
  hasPlayServices: (opts: { showPlayServicesUpdateDialog: boolean }) => Promise<boolean>;
  signIn: () => Promise<SignInResult>;
  signOut: () => Promise<void>;
  signInSilently: () => Promise<SilentResult>;
  getTokens: () => Promise<{ accessToken: string; idToken: string }>;
  getCurrentUser: () => {
    user: { email: string; name: string | null; givenName: string | null };
  } | null;
  addScopes: (opts: { scopes: string[] }) => Promise<SignInResult | null>;
};

function loadGoogleSigninModule(): GoogleSigninApi | null {
  if (!hasGoogleSignInNative()) {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-google-signin/google-signin/lib/module/signIn/GoogleSignin.js') as {
      GoogleSignin: GoogleSigninApi;
    };
    return mod.GoogleSignin;
  } catch {
    return null;
  }
}

export function isGoogleSignInAvailable(): boolean {
  return loadGoogleSigninModule() !== null;
}

/**
 * Chỉ email + profile — dùng cho màn đăng nhập (tránh xin scope Drive ngay gây lỗi nếu chưa bật API / consent).
 */
export function configureGoogleSignIn(): void {
  if (configured) {
    return;
  }
  const G = loadGoogleSigninModule();
  if (!G) {
    return;
  }
  G.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    offlineAccess: true,
    scopes: ['email', 'profile'],
  });
  configured = true;
}

/** Đăng nhập Google (không gắn scope Drive). */
export async function signInWithGoogleForLogin(): Promise<{
  accessToken: string;
  email: string;
  displayName: string;
}> {
  const G = loadGoogleSigninModule();
  if (!G) {
    throw new Error('google_signin_native_unavailable');
  }
  configureGoogleSignIn();
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('google_web_client_id_missing');
  }
  try {
    await G.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const res = await G.signIn();
    if (res.type !== 'success') {
      throw new Error('google_signin_cancelled');
    }
    const data = res.data as {
      user: { email: string; name: string | null; givenName: string | null };
    };
    const u = data.user;
    const email = u.email ?? '';
    const displayName =
      u.name ?? u.givenName ?? email.split('@')[0] ?? 'Google';
    let tokens: { accessToken: string };
    try {
      tokens = await G.getTokens();
    } catch (te) {
      throw new Error(normalizeGoogleSignInFailure(te));
    }
    return {
      accessToken: tokens.accessToken,
      email,
      displayName,
    };
  } catch (e) {
    rethrowIfOurs(e);
    throw new Error(normalizeGoogleSignInFailure(e));
  }
}

async function grantDriveAppDataScope(G: GoogleSigninApi): Promise<void> {
  const res = await G.addScopes({ scopes: [DRIVE_APPDATA_SCOPE] });
  if (res == null) {
    throw new Error('google_signin_scopes');
  }
  if (res.type === 'cancelled') {
    throw new Error('google_signin_cancelled');
  }
}

/**
 * Đăng nhập (nếu cần) + xin scope Drive app folder + token — dùng trong Cài đặt (Liên kết Drive / Đồng bộ).
 */
export async function authorizeGoogleDriveAndGetToken(): Promise<{
  accessToken: string;
  email: string;
}> {
  const G = loadGoogleSigninModule();
  if (!G) {
    throw new Error('google_signin_native_unavailable');
  }
  configureGoogleSignIn();
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('google_web_client_id_missing');
  }
  try {
    await G.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const silent = await G.signInSilently();
    if (silent.type !== 'success') {
      const interactive = await G.signIn();
      if (interactive.type !== 'success') {
        throw new Error('google_signin_cancelled');
      }
    }
    await grantDriveAppDataScope(G);
    const tokens = await G.getTokens();
    const cu = G.getCurrentUser();
    const email = cu?.user.email ?? '';
    return { accessToken: tokens.accessToken, email };
  } catch (e) {
    rethrowIfOurs(e);
    throw new Error(normalizeGoogleSignInFailure(e));
  }
}

export async function signOutGoogle(): Promise<void> {
  const G = loadGoogleSigninModule();
  if (!G) {
    return;
  }
  try {
    await G.signOut();
  } catch {
    /* ignore */
  }
}

/** Phiên đã đăng nhập + scope Drive + token (cho nút Đồng bộ). */
export async function ensureGoogleAccessTokenForDrive(): Promise<{
  accessToken: string;
  email: string;
}> {
  const G = loadGoogleSigninModule();
  if (!G) {
    throw new Error('google_signin_native_unavailable');
  }
  configureGoogleSignIn();
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('google_web_client_id_missing');
  }
  try {
    await G.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const silent = await G.signInSilently();
    if (silent.type !== 'success') {
      const interactive = await G.signIn();
      if (interactive.type !== 'success') {
        throw new Error('google_signin_cancelled');
      }
    }
    await grantDriveAppDataScope(G);
    const tokens = await G.getTokens();
    const cu = G.getCurrentUser();
    const email = cu?.user.email ?? '';
    return { accessToken: tokens.accessToken, email };
  } catch (e) {
    rethrowIfOurs(e);
    throw new Error(normalizeGoogleSignInFailure(e));
  }
}
