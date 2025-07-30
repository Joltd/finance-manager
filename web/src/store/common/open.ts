import { createStore, StateCreator } from 'zustand'

export interface OpenStoreState {
  opened: boolean
  setOpened: (opened: boolean) => void
  open: () => void
  close: () => void
}

export const openStoreSlice: StateCreator<OpenStoreState> = (set, get) => ({
  opened: false,
  setOpened: (opened: boolean) => set({ opened }),
  open: () => set({ opened: true }),
  close: () => set({ opened: false }),
})

export const createOpenStore = () => createStore<OpenStoreState>(openStoreSlice)
