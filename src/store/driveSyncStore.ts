import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type DriveSyncState = {
  linked: boolean;
  fileId: string | null;
  linkedEmail: string | null;
  lastSyncAt: string | null;
  lastSyncError: string | null;
  markLinked: (email: string, fileId: string | null) => void;
  setFileId: (fileId: string | null) => void;
  unlink: () => void;
  setLastSync: (at: string | null, err: string | null) => void;
};

export const useDriveSyncStore = create<DriveSyncState>()(
  persist(
    (set) => ({
      linked: false,
      fileId: null,
      linkedEmail: null,
      lastSyncAt: null,
      lastSyncError: null,
      markLinked: (email, fileId) =>
        set({
          linked: true,
          linkedEmail: email,
          fileId,
        }),
      setFileId: (fileId) => set({ fileId }),
      unlink: () =>
        set({
          linked: false,
          fileId: null,
          linkedEmail: null,
          lastSyncError: null,
        }),
      setLastSync: (at, err) =>
        set({
          lastSyncAt: at,
          lastSyncError: err,
        }),
    }),
    {
      name: 'pfm-drive-sync',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        linked: s.linked,
        fileId: s.fileId,
        linkedEmail: s.linkedEmail,
        lastSyncAt: s.lastSyncAt,
        lastSyncError: s.lastSyncError,
      }),
    },
  ),
);
