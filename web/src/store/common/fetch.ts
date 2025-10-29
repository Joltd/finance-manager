import { createStore } from 'zustand/index'
import { fillPathParams, flatten } from '@/lib/utils'
import api from '@/lib/axios'
import { patch, Patch } from '@/lib/patch'
import { produce } from 'immer'

export interface FetchStoreState<T> {
  loading: boolean
  dataFetched: boolean
  error?: string
  data?: T
  pathParams?: Record<string, any>
  setPathParams: (pathParams: Record<string, any>) => void
  updatePathParams: (pathParams: Record<string, any>) => void
  queryParams?: Record<string, any>
  setQueryParams: (queryParams: Record<string, any>) => void
  updateQueryParams: (queryParams: Record<string, any>) => void
  fetch: () => Promise<void>
  reset: () => void
  applyPatch: (patches: Patch[]) => void
}

export const createFetchStore = <T>(path: string) =>
  createStore<FetchStoreState<T>>((set, get) => {
    const fetch = async () => {
      set({ error: undefined, loading: !get().dataFetched })
      try {
        const preparedPath = fillPathParams(path, get().pathParams)

        const response = await api.get(preparedPath, {
          params: get().queryParams,
        })

        if (response.status !== 200 || !response.data.success) {
          set({ error: response.data.error || 'Something wrong' })
        } else {
          set({ dataFetched: true, data: response.data.body })
        }
      } catch (error: any) {
        set({ error: error.response.data.error || 'Something wrong' })
      } finally {
        if (get().loading) {
          set({ loading: false })
        }
      }
    }

    const applyPatch = (patches: Patch[]) => {
      for (const it of patches) {
        if (!it.path.pointers.length) {
          set({ data: it.value })
        } else {
          const result = produce(get().data, (draft) => patch(draft, it.path, it.value))
          set({ data: result })
        }
      }
    }

    const reset = () =>
      set({
        loading: false,
        dataFetched: false,
        error: undefined,
        data: undefined,
        pathParams: {},
        queryParams: {},
      })

    fetchStoreResetCallbacks.push(reset)

    return {
      loading: false,
      dataFetched: false,
      error: undefined,
      data: undefined,
      pathParams: {},
      setPathParams: (pathParams: Record<string, any>) => set({ pathParams }),
      updatePathParams: (pathParams: Record<string, any>) =>
        set({ pathParams: { ...get().pathParams, ...pathParams } }),
      queryParams: {},
      setQueryParams: (queryParams: Record<string, any>) =>
        set({ queryParams: flatten(queryParams) }),
      updateQueryParams: (queryParams: Record<string, any>) =>
        set({ queryParams: { ...get().queryParams, ...flatten(queryParams) } }),
      fetch,
      reset,
      applyPatch,
    }
  })

const fetchStoreResetCallbacks: (() => void)[] = []

export const resetFetchStores = () => {
  for (const reset of fetchStoreResetCallbacks) {
    reset()
  }
}
