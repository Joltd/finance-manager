import { createStore } from 'zustand/index'
import { useStoreSelect } from '@/hooks/use-store-select'
import { FetchStoreState } from '@/store/common/fetch'
import { SeekStoreState } from '@/store/common/seek'

export interface LifecycleStoreState {
  register: (store: FetchStoreState<any> | SeekStoreState<any, any>) => void
  cleanup: () => void
}

export const lifecycleStore = createStore<LifecycleStoreState>((set, get) => {

  const stores: (FetchStoreState<any> | SeekStoreState<any, any>)[] = []

  return {
    register: (store) => stores.push(store),
    cleanup: () => {
      for (const store of stores) {
        store.reset()
      }
    },
  }
})

export const useLifecycleStore = <K extends keyof LifecycleStoreState>(...fields: K[]) =>
  useStoreSelect<LifecycleStoreState, K>(lifecycleStore, ...fields)
