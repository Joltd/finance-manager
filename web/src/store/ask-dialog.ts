import { create } from 'zustand'

export type AskType = 'string' | 'number' | 'date'

type AskTypeMap = {
  string: string
  number: number
  date: Date
}

export interface AskParams<T extends AskType> {
  type: T
  label: string
  initialValue?: AskTypeMap[T]
}

interface AskDialogEntry<T extends AskType = AskType> {
  params: AskParams<T>
  resolve: (value: AskTypeMap[T]) => void
}

interface AskDialogState {
  entry: AskDialogEntry | null
  open: boolean
}

interface AskDialogActions {
  ask: <T extends AskType>(params: AskParams<T>) => Promise<AskTypeMap[T]>
  confirm: (value: AskTypeMap[AskType]) => void
  dismiss: () => void
}

export type AskDialogStore = AskDialogState & AskDialogActions

export const useAskDialogStore = create<AskDialogStore>((set, get) => ({
  entry: null,
  open: false,

  ask: <T extends AskType>(params: AskParams<T>): Promise<AskTypeMap[T]> => {
    return new Promise<AskTypeMap[T]>((resolve) => {
      set({
        entry: { params, resolve: resolve as (value: AskTypeMap[AskType]) => void },
        open: true,
      })
    })
  },

  confirm: (value: AskTypeMap[AskType]) => {
    const { entry } = get()
    if (entry) {
      entry.resolve(value)
    }
    set({ entry: null, open: false })
  },

  dismiss: () => {
    set({ entry: null, open: false })
  },
}))

export function ask<T extends AskType>(params: AskParams<T>): Promise<AskTypeMap[T]> {
  return useAskDialogStore.getState().ask(params)
}
