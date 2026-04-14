import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserTransactionType = {
  id: string;
  name: string;
};

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

type State = {
  types: UserTransactionType[];
  addType: (name: string) => void;
  removeType: (id: string) => void;
};

export const useTransactionTypeStore = create<State>()(
  persist(
    (set, get) => ({
      types: [],
      addType: (name) => {
        const trimmed = name.trim();
        if (!trimmed) {
          return;
        }
        if (get().types.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
          return;
        }
        set((s) => ({
          types: [...s.types, { id: newId(), name: trimmed }],
        }));
      },
      removeType: (id) =>
        set((s) => ({ types: s.types.filter((t) => t.id !== id) })),
    }),
    {
      name: 'pfm-transaction-types',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
