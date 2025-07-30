import { StoreApi } from 'zustand/index'
import { useStoreWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow'

export function useStoreSelect<T extends object, K extends keyof T>(
  store: StoreApi<T>,
  ...keys: K[]
): Pick<T, K> {
  return useStoreWithEqualityFn(
    store,
    (state) => {
      if (!keys.length) {
        return state
      }
      const result: Pick<T, K> = {} as Pick<T, K>
      for (const key of keys) {
        result[key] = state[key]
      }
      return result
    },
    shallow,
  )
}
