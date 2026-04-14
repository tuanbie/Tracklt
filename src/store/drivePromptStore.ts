import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type State = {
  dismissedDriveHintAfter5Tx: boolean;
  dismissDriveHint: () => void;
};

export const useDrivePromptStore = create<State>()(
  persist(
    (set) => ({
      dismissedDriveHintAfter5Tx: false,
      dismissDriveHint: () => set({ dismissedDriveHintAfter5Tx: true }),
    }),
    {
      name: 'pfm-drive-prompt',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
