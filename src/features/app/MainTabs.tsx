import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../../core/i18n';
import { useAuthStore } from '../../store/authStore';
import { useDrivePromptStore } from '../../store/drivePromptStore';
import { useDriveSyncStore } from '../../store/driveSyncStore';
import { useTransactionsStore } from '../../store/transactionsStore';
import { AccountScreen } from '../account/screens/AccountScreen';
import { DashboardScreen } from '../dashboard/screens/DashboardScreen';
import { DriveBackupPromptModal } from '../drive/DriveBackupPromptModal';
import { InsightScreen } from '../insight/screens/InsightScreen';
import { SettingsScreen } from '../settings/screens/SettingsScreen';
import { WalletScreen } from '../wallet/screens/WalletScreen';

type Tab = 'home' | 'wallet' | 'stats' | 'profile';

function TabIcon({ name, selected }: { name: Tab; selected: boolean }) {
  const emoji =
    name === 'home'
      ? '📋'
      : name === 'wallet'
        ? '💳'
        : name === 'stats'
          ? '📊'
          : '👤';
  return (
    <Text
      className="text-[22px] leading-6"
      style={{ opacity: selected ? 1 : 0.45 }}>
      {emoji}
    </Text>
  );
}

const TAB_KEYS: Tab[] = ['home', 'wallet', 'stats', 'profile'];

/**
 * Main finance shell: Home · Wallet · Statistics (Insight) · Profile (Account).
 */
export function MainTabs() {
  const { t } = useI18n();
  const logout = useAuthStore((s) => s.logout);
  const [tab, setTab] = useState<Tab>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [drivePromptOpen, setDrivePromptOpen] = useState(false);
  const txCount = useTransactionsStore((s) => s.items.length);
  const driveLinked = useDriveSyncStore((s) => s.linked);
  const dismissed5 = useDrivePromptStore((s) => s.dismissedDriveHintAfter5Tx);
  const dismissDriveHint = useDrivePromptStore((s) => s.dismissDriveHint);
  const insets = useSafeAreaInsets();
  const barPad = Math.max(insets.bottom, 8);

  useEffect(() => {
    if (txCount >= 5 && !driveLinked && !dismissed5) {
      setDrivePromptOpen(true);
    }
  }, [txCount, driveLinked, dismissed5]);

  useEffect(() => {
    if (driveLinked || dismissed5) {
      setDrivePromptOpen(false);
    }
  }, [driveLinked, dismissed5]);

  const openSettingsForDrive = () => {
    dismissDriveHint();
    setDrivePromptOpen(false);
    setTab('profile');
    setSettingsOpen(true);
  };

  return (
    <View className="flex-1 bg-slate-100 dark:bg-[#070b14]">
      <View className="flex-1">
        {tab === 'home' ? <DashboardScreen /> : null}
        {tab === 'wallet' ? <WalletScreen /> : null}
        {tab === 'stats' ? <InsightScreen /> : null}
        {tab === 'profile' ? (
          <AccountScreen onOpenSettings={() => setSettingsOpen(true)} />
        ) : null}
      </View>

      <View
        className="flex-row border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#0a1020]"
        style={{ paddingBottom: barPad, paddingTop: 10 }}>
        {TAB_KEYS.map((tabKey) => (
          <Pressable
            key={tabKey}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === tabKey }}
            onPress={() => setTab(tabKey)}
            className="flex-1 items-center py-2 active:opacity-90">
            <TabIcon name={tabKey} selected={tab === tabKey} />
            <Text
              className={`mt-1 text-[11px] font-medium ${
                tab === tabKey
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-slate-500 dark:text-slate-500'
              }`}>
              {t(`tabs.${tabKey}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Modal
        visible={settingsOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettingsOpen(false)}>
        <SettingsScreen
          onLogout={() => {
            logout();
            setSettingsOpen(false);
          }}
          onClose={() => setSettingsOpen(false)}
        />
      </Modal>

      <DriveBackupPromptModal
        visible={drivePromptOpen}
        onDismiss={() => {
          dismissDriveHint();
          setDrivePromptOpen(false);
        }}
        onOpenSettings={openSettingsForDrive}
      />
    </View>
  );
}
