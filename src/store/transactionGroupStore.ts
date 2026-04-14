import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserTransactionGroup = {
  id: string;
  name: string;
};

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Stored on each transaction when user picks a custom group */
export const CUSTOM_GROUP_PREFIX = 'custom:';

export function customGroupStorageKey(id: string): string {
  return `${CUSTOM_GROUP_PREFIX}${id}`;
}

type State = {
  groups: UserTransactionGroup[];
  addGroup: (name: string) => void;
  removeGroup: (id: string) => void;
};

export const useTransactionGroupStore = create<State>()(
  persist(
    (set, get) => ({
      groups: [],
      addGroup: (name) => {
        const trimmed = name.trim();
        if (!trimmed) {
          return;
        }
        if (
          get().groups.some((g) => g.name.toLowerCase() === trimmed.toLowerCase())
        ) {
          return;
        }
        set((s) => ({
          groups: [...s.groups, { id: newId(), name: trimmed }],
        }));
      },
      removeGroup: (id) =>
        set((s) => ({ groups: s.groups.filter((g) => g.id !== id) })),
    }),
    {
      name: 'pfm-transaction-groups',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
