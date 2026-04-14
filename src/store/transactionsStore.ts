import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SavedTransaction = {
  id: string;
  groupKey: string;
  title: string;
  amount: number;
  friend: string;
  dueDateIso: string;
  note: string;
  typeId: string | null;
  createdAt: string;
};

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

type State = {
  items: SavedTransaction[];
  add: (payload: Omit<SavedTransaction, 'id' | 'createdAt'>) => void;
};

export const useTransactionsStore = create<State>()(
  persist(
    (set) => ({
      items: [],
      add: (payload) =>
        set((s) => ({
          items: [
            {
              ...payload,
              id: newId(),
              createdAt: new Date().toISOString(),
            },
            ...s.items,
          ],
        })),
    }),
    {
      name: 'pfm-transactions',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
