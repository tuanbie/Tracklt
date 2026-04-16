import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../../core/i18n';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onOpenSettings: () => void;
};

export function DriveBackupPromptModal({
  visible,
  onDismiss,
  onOpenSettings,
}: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable
        className="flex-1 justify-center bg-black/50 px-6"
        onPress={onDismiss}
      >
        <Pressable
          className="rounded-2xl bg-card p-6"
          onPress={e => e.stopPropagation()}
          style={{ marginBottom: insets.bottom }}
        >
          <Text className="text-center text-lg font-bold text-card-foreground">
            {t('drive.prompt5Title')}
          </Text>
          <Text className="mt-3 text-center text-base leading-6 text-muted-foreground">
            {t('drive.prompt5Body')}
          </Text>
          <Pressable
            className="mt-6 items-center rounded-xl bg-green-600  py-3 active:opacity-90"
            onPress={() => {
              onDismiss();
              onOpenSettings();
            }}
          >
            <Text className="font-semibold text-primary-foreground">
              {t('drive.prompt5OpenSettings')}
            </Text>
          </Pressable>
          <Pressable
            className="mt-3 items-center py-2 active:opacity-80"
            onPress={onDismiss}
          >
            <Text className="text-base text-muted-foreground">
              {t('drive.prompt5Later')}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
