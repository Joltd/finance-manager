import { createStore } from "zustand"

export interface OpenStoreState {
  opened: boolean
  setOpened: (opened: boolean) => void
  entryId: string | undefined
  setEntryId: (entryId?: string) => void
}

export const createOpenStore = () => {
  return createStore<OpenStoreState>((set, get) => {
    return {
      opened: false,
      setOpened: (opened: boolean) => set({ opened }),
      entryId: undefined,
      setEntryId: (entryId?: string) => set({ entryId })
    }
  })
}