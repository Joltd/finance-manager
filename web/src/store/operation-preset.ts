import { create } from 'zustand'

import type { AccountReference } from '@/types/account'
import type { OperationType } from '@/types/operation'

export interface AccountUsage {
  account: AccountReference
  count: number
}

interface OperationPresetState {
  date: string | undefined
  type: OperationType | undefined
  account: AccountReference | undefined
  category: AccountReference | undefined
  currency: string | undefined
  accountUsages: AccountUsage[]
}

interface OperationPresetActions {
  setDate: (date: string | undefined) => void
  setType: (type: OperationType | undefined) => void
  setAccount: (account: AccountReference | undefined) => void
  setCategory: (category: AccountReference | undefined) => void
  setCurrency: (currency: string | undefined) => void
  reset: () => void
  registerAccountUsage: (account: AccountReference) => void
}

export const useOperationPresetStore = create<OperationPresetState & OperationPresetActions>()(
  (set) => ({
    date: undefined,
    type: undefined,
    account: undefined,
    category: undefined,
    currency: undefined,
    accountUsages: [],

    setDate: (date) => set({ date }),
    setType: (type) => set({ type }),
    setAccount: (account) => set({ account }),
    setCategory: (category) => set({ category }),
    setCurrency: (currency) => set({ currency }),
    reset: () => set({ date: undefined, type: undefined, account: undefined, category: undefined, currency: undefined }),

    registerAccountUsage: (account) =>
      set((state) => {
        const existing = state.accountUsages.find((u) => u.account.id === account.id)
        if (existing) {
          return {
            accountUsages: state.accountUsages.map((u) =>
              u.account.id === account.id ? { ...u, count: u.count + 1 } : u,
            ),
          }
        }
        return {
          accountUsages: [...state.accountUsages, { account, count: 1 }],
        }
      }),
  }),
)
