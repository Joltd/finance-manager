import { create } from 'zustand'
import { Amount } from '@/types/common/amount'

export type AskType = 'string' | 'number' | 'date' | 'amount'

type AskTypeMap = {
  string: string
  number: number
  date: Date
  amount: Amount
}

export interface AskParams<T extends AskType> {
  type: T
  label: string
  initialValue?: AskTypeMap[T]
}

interface AskDialogEntry<T extends AskType = AskType> {
  params: AskParams<T>
  value: AskTypeMap[T]
  resolve: (value: AskTypeMap[T]) => void
}

interface AskDialogState {
  entry: AskDialogEntry | null
}

interface AskDialogActions {
  ask: <T extends AskType>(params: AskParams<T>) => Promise<AskTypeMap[T]>
  setValue: (value: unknown) => void
  confirm: () => void
  dismiss: () => void
}

export type AskDialogStore = AskDialogState & AskDialogActions

export const useAskDialogStore = create<AskDialogStore>((set, get) => ({
  entry: null,

  ask: <T extends AskType>(params: AskParams<T>): Promise<AskTypeMap[T]> => {
    if (get().entry) {
      console.warn('ask() called while another ask dialog is already open')
    }
    return new Promise<AskTypeMap[T]>((resolve) => {
      set({
        entry: {
          params,
          value: (params.initialValue ?? (params.type === 'string' ? '' : undefined)) as AskTypeMap[T],
          resolve: resolve as (value: AskTypeMap[AskType]) => void,
        },
      })
    })
  },

  setValue: (value) =>
    set((state) => (state.entry ? { entry: { ...state.entry, value: value as never } } : {})),

  confirm: () => {
    const { entry } = get()
    if (entry) {
      entry.resolve(entry.value as never)
    }
    set({ entry: null })
  },

  dismiss: () => set({ entry: null }),
}))

export function ask<T extends AskType>(params: AskParams<T>): Promise<AskTypeMap[T]> {
  return useAskDialogStore.getState().ask(params)
}
