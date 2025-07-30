import { openStoreSlice, OpenStoreState } from '@/store/common/open'
import { createStore } from 'zustand/index'

export interface AskDialogStoreState<C, R> extends OpenStoreState {
  config?: C
  resolve: (result: R) => void
  ask: (resolve: (result: R) => void, config?: C) => void
}

export const createAskDialogStore = <C, R>() =>
  createStore<AskDialogStoreState<C, R>>((set, get, store) => ({
    ...openStoreSlice(set, get, store),
    resolve: () => {},
    ask: (resolve: (result: R) => void, config?: C) => {
      set({ opened: true, config: config, resolve })
    },
  }))
