import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../../../core/i18n';
import type { LanguagePreference } from '../../../core/i18n/resolveLanguage';
import { useResolvedColorScheme } from '../../../core/theme';
import {
  downloadAndApplyDriveBackup,
  uploadLocalDataToDrive,
} from '../../../services/sync/driveSyncOrchestrator';
import { findBackupFileId } from '../../../services/sync/googleDrive';
import {
  authorizeGoogleDriveAndGetToken,
  ensureGoogleAccessTokenForDrive,
  getGoogleSignInUserMessage,
  signOutGoogle,
} from '../../../services/sync/googleSignIn';
import { useAuthStore } from '../../../store/authStore';
import { useDriveSyncStore } from '../../../store/driveSyncStore';
import {
  useLocaleStore,
  type CurrencyPreference,
} from '../../../store/localeStore';
import { useThemeStore, type ThemePreference } from '../../../store/themeStore';

const MENU_KEYS = [
  'savedMessages',
  'recentCalls',
  'devices',
  'notifications',
  'appearance',
  'language',
  'currency',
  'privacy',
  'storage',
] as const;

type Props = {
  onLogout: () => void;
  onClose?: () => void;
};

function MenuRow({
  label,
  onPress,
  subtitle,
}: {
  label: string;
  onPress?: () => void;
  subtitle?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-border py-4 active:bg-muted/30"
    >
      <View className="flex-1 pr-2">
        <Text className="text-[17px] text-foreground">{label}</Text>
        {subtitle ? (
          <Text className="mt-0.5 text-sm text-muted-foreground">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Text className="text-lg text-muted-foreground">›</Text>
    </Pressable>
  );
}

function labelForTheme(p: ThemePreference, t: (key: string) => string): string {
  switch (p) {
    case 'system':
      return t('theme.system');
    case 'light':
      return t('theme.light');
    case 'dark':
      return t('theme.dark');
    default:
      return p;
  }
}

function labelForLanguagePref(
  pref: LanguagePreference,
  t: (key: string) => string,
): string {
  if (pref === 'system') {
    return t('language.system');
  }
  return t(`language.${pref}`);
}

function labelForCurrencyPref(
  pref: CurrencyPreference,
  t: (key: string) => string,
): string {
  switch (pref) {
    case 'EUR':
      return t('currency.eur');
    case 'USD':
      return t('currency.usd');
    case 'VND':
      return t('currency.vnd');
    default:
      return pref;
  }
}

export function SettingsScreen({ onLogout, onClose }: Props) {
  const { t, languagePreference, setLanguagePreference } = useI18n();
  const displayName = useAuthStore(s => s.displayName);
  const username = useAuthStore(s => s.username);
  const isGuest = useAuthStore(s => s.isGuest);
  const themePreference = useThemeStore(s => s.preference);
  const setThemePreference = useThemeStore(s => s.setPreference);
  const currencyPreference = useLocaleStore(s => s.currencyPreference);
  const setCurrencyPreference = useLocaleStore(s => s.setCurrencyPreference);
  const driveLinked = useDriveSyncStore(s => s.linked);
  const linkedEmail = useDriveSyncStore(s => s.linkedEmail);
  const unlinkDriveStore = useDriveSyncStore(s => s.unlink);
  const [showLogout, setShowLogout] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [driveBusy, setDriveBusy] = useState(false);
  const insets = useSafeAreaInsets();
  const resolved = useResolvedColorScheme();

  const confirmLogout = () => {
    setShowLogout(false);
    onLogout();
  };

  const linkDrive = async () => {
    setDriveBusy(true);
    try {
      const { accessToken, email } = await authorizeGoogleDriveAndGetToken();
      if (!email) {
        Alert.alert(t('drive.errorTitle'), t('drive.noEmail'));
        return;
      }
      const existingId = await findBackupFileId(accessToken);
      if (existingId) {
        setDriveBusy(false);
        Alert.alert(t('drive.restoreTitle'), t('drive.restoreBody'), [
          {
            text: t('drive.restoreFromCloud'),
            onPress: async () => {
              setDriveBusy(true);
              try {
                const r = await downloadAndApplyDriveBackup(
                  accessToken,
                  existingId,
                  email,
                );
                if (!r.ok) {
                  Alert.alert(t('drive.errorTitle'), t('drive.restoreFailed'));
                }
              } finally {
                setDriveBusy(false);
              }
            },
          },
          {
            text: t('drive.overwriteCloud'),
            onPress: async () => {
              setDriveBusy(true);
              try {
                await uploadLocalDataToDrive(accessToken, email);
                Alert.alert('', t('drive.syncDone'));
              } finally {
                setDriveBusy(false);
              }
            },
          },
          { text: t('settings.cancel'), style: 'cancel' },
        ]);
        return;
      }
      await uploadLocalDataToDrive(accessToken, email);
      Alert.alert('', t('drive.syncDone'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      Alert.alert(t('drive.errorTitle'), getGoogleSignInUserMessage(msg, t));
    } finally {
      setDriveBusy(false);
    }
  };

  const syncNow = async () => {
    setDriveBusy(true);
    try {
      const { accessToken, email } = await ensureGoogleAccessTokenForDrive();
      await uploadLocalDataToDrive(accessToken, email);
      Alert.alert('', t('drive.syncDone'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      Alert.alert(t('drive.errorTitle'), getGoogleSignInUserMessage(msg, t));
    } finally {
      setDriveBusy(false);
    }
  };

  const confirmUnlinkDrive = () => {
    Alert.alert(t('drive.unlinkTitle'), t('drive.unlinkBody'), [
      { text: t('settings.cancel'), style: 'cancel' },
      {
        text: t('drive.unlinkConfirm'),
        style: 'destructive',
        onPress: async () => {
          await signOutGoogle();
          unlinkDriveStore();
        },
      },
    ]);
  };

  const statusBarStyle = resolved === 'dark' ? 'light-content' : 'dark-content';

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle={statusBarStyle} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-row items-center justify-between px-4"
          style={{ paddingTop: Math.max(insets.top, 8) }}
        >
          {onClose ? <View className="w-14" /> : null}
          <Text className="flex-1 text-center text-[17px] font-semibold text-foreground">
            {t('settings.title')}
          </Text>
          {onClose ? (
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              className="w-14 items-end py-1 active:opacity-80"
            >
              <Text className="text-base font-semibold text-primary">
                {t('settings.done')}
              </Text>
            </Pressable>
          ) : (
            <View className="w-14" />
          )}
        </View>

        <View className="mt-6 items-center px-6">
          <View className="relative">
            <View className="h-28 w-28 items-center justify-center rounded-full bg-sky-200 dark:bg-sky-900/50">
              <Text className="text-[52px] leading-[60px] text-sky-600/80 dark:text-sky-300/90">
                👤
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Edit profile photo"
              className="absolute -bottom-0.5 -right-0.5 h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-green-600  active:opacity-90"
            >
              <Text className="text-sm text-primary-foreground">✎</Text>
            </Pressable>
          </View>
          <Text className="mt-5 text-[22px] font-bold text-foreground">
            {isGuest ? t('account.guest') : displayName ?? 'User'}
          </Text>
          <Text className="mt-1 text-base text-muted-foreground">
            {isGuest ? '—' : username ?? '@user'}
          </Text>
        </View>

        <View className="mt-8 px-4">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('drive.sectionTitle')}
          </Text>
          <View className="rounded-xl border border-border bg-card/30 px-1">
            <View className="border-b border-border px-4 py-4">
              <Text className="text-[17px] text-foreground">
                {driveLinked
                  ? t('drive.statusConnected')
                  : t('drive.statusNotConnected')}
              </Text>
              {driveLinked && linkedEmail ? (
                <Text className="mt-0.5 text-sm text-muted-foreground">
                  {t('drive.linkedAccount')}: {linkedEmail}
                </Text>
              ) : null}
            </View>
            {!driveLinked ? (
              <Pressable
                accessibilityRole="button"
                disabled={driveBusy}
                onPress={linkDrive}
                className="border-b border-border px-4 py-4 active:bg-muted/30"
              >
                <Text className="text-[17px] font-medium text-primary">
                  {t('drive.linkButton')}
                </Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  disabled={driveBusy}
                  onPress={syncNow}
                  className="border-b border-border px-4 py-4 active:bg-muted/30"
                >
                  <Text className="text-[17px] font-medium text-primary">
                    {t('drive.syncNow')}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={driveBusy}
                  onPress={confirmUnlinkDrive}
                  className="px-4 py-4 active:bg-muted/30"
                >
                  <Text className="text-[17px] font-medium text-destructive">
                    {t('drive.unlink')}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
          {driveBusy ? (
            <ActivityIndicator className="mt-3" color="#0d9488" />
          ) : null}
        </View>

        <View className="mt-8 px-4">
          {MENU_KEYS.map(key => {
            const label = t(`settings.menu.${key}`);
            if (key === 'appearance') {
              return (
                <MenuRow
                  key={key}
                  label={label}
                  subtitle={labelForTheme(themePreference, t)}
                  onPress={() => setAppearanceOpen(true)}
                />
              );
            }
            if (key === 'language') {
              return (
                <MenuRow
                  key={key}
                  label={label}
                  subtitle={labelForLanguagePref(languagePreference, t)}
                  onPress={() => setLanguageOpen(true)}
                />
              );
            }
            if (key === 'currency') {
              return (
                <MenuRow
                  key={key}
                  label={label}
                  subtitle={labelForCurrencyPref(currencyPreference, t)}
                  onPress={() => setCurrencyOpen(true)}
                />
              );
            }
            return <MenuRow key={key} label={label} />;
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          className="mx-6 mt-6 items-center rounded-xl py-3 active:opacity-80"
          onPress={() => setShowLogout(true)}
        >
          <Text className="text-base font-medium text-destructive">
            {t('settings.logOut')}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={appearanceOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAppearanceOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setAppearanceOpen(false)}
        >
          <Pressable
            className="rounded-t-3xl border-t border-border bg-card px-4 pt-2 pb-6"
            onPress={e => e.stopPropagation()}
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <Text className="mb-4 text-center text-lg font-semibold text-card-foreground">
              {t('settings.appearanceTitle')}
            </Text>
            {(['system', 'light', 'dark'] as const).map(p => (
              <Pressable
                key={p}
                accessibilityRole="button"
                onPress={() => {
                  setThemePreference(p);
                  setAppearanceOpen(false);
                }}
                className="flex-row items-center justify-between border-b border-border py-4 active:opacity-80"
              >
                <Text className="text-[17px] text-card-foreground">
                  {labelForTheme(p, t)}
                </Text>
                {themePreference === p ? (
                  <Text className="text-lg text-primary">✓</Text>
                ) : null}
              </Pressable>
            ))}
            <Pressable
              className="mt-3 items-center rounded-xl bg-muted py-3 active:opacity-90"
              onPress={() => setAppearanceOpen(false)}
            >
              <Text className="font-semibold text-foreground">
                {t('settings.close')}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={languageOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setLanguageOpen(false)}
        >
          <Pressable
            className="rounded-t-3xl border-t border-border bg-card px-4 pt-2 pb-6"
            onPress={e => e.stopPropagation()}
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <Text className="mb-4 text-center text-lg font-semibold text-card-foreground">
              {t('settings.languageTitle')}
            </Text>
            {(['system', 'en', 'vi', 'ja'] as const).map(p => (
              <Pressable
                key={p}
                accessibilityRole="button"
                onPress={() => {
                  setLanguagePreference(p);
                  setLanguageOpen(false);
                }}
                className="flex-row items-center justify-between border-b border-border py-4 active:opacity-80"
              >
                <Text className="text-[17px] text-card-foreground">
                  {labelForLanguagePref(p, t)}
                </Text>
                {languagePreference === p ? (
                  <Text className="text-lg text-primary">✓</Text>
                ) : null}
              </Pressable>
            ))}
            <Pressable
              className="mt-3 items-center rounded-xl bg-muted py-3 active:opacity-90"
              onPress={() => setLanguageOpen(false)}
            >
              <Text className="font-semibold text-foreground">
                {t('settings.close')}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={currencyOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCurrencyOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setCurrencyOpen(false)}
        >
          <Pressable
            className="rounded-t-3xl border-t border-border bg-card px-4 pt-2 pb-6"
            onPress={e => e.stopPropagation()}
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <Text className="mb-4 text-center text-lg font-semibold text-card-foreground">
              {t('settings.currencyTitle')}
            </Text>
            {(['EUR', 'USD', 'VND'] as const).map(p => (
              <Pressable
                key={p}
                accessibilityRole="button"
                onPress={() => {
                  setCurrencyPreference(p);
                  setCurrencyOpen(false);
                }}
                className="flex-row items-center justify-between border-b border-border py-4 active:opacity-80"
              >
                <Text className="text-[17px] text-card-foreground">
                  {labelForCurrencyPref(p, t)}
                </Text>
                {currencyPreference === p ? (
                  <Text className="text-lg text-primary">✓</Text>
                ) : null}
              </Pressable>
            ))}
            <Pressable
              className="mt-3 items-center rounded-xl bg-muted py-3 active:opacity-90"
              onPress={() => setCurrencyOpen(false)}
            >
              <Text className="font-semibold text-foreground">
                {t('settings.close')}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showLogout}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogout(false)}
      >
        <Pressable
          className="flex-1 justify-center bg-black/50 px-6"
          onPress={() => setShowLogout(false)}
        >
          <Pressable
            className="rounded-2xl bg-card p-6"
            onPress={e => e.stopPropagation()}
            style={{ marginBottom: insets.bottom }}
          >
            <Text className="text-center text-lg font-bold text-card-foreground">
              {t('settings.logOutConfirmTitle')}
            </Text>
            <Text className="mt-3 text-center text-base leading-6 text-muted-foreground">
              {t('settings.logOutConfirmBody')}
            </Text>
            <View className="mt-6 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                className="flex-1 items-center rounded-xl border-2 border-primary py-3 active:opacity-90"
                onPress={() => setShowLogout(false)}
              >
                <Text className="font-semibold text-primary">
                  {t('settings.cancel')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className="flex-1 items-center rounded-xl bg-green-600  py-3 active:opacity-90"
                onPress={confirmLogout}
              >
                <Text className="font-semibold text-primary-foreground">
                  {t('settings.logOut')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
