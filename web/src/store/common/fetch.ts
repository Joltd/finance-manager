import { createStore } from 'zustand/index'
import { fillPathParams, flatten } from '@/lib/utils'
import api from '@/lib/axios'
import { patch, Patch } from '@/lib/patch'
import { produce } from 'immer'

export interface FetchStoreState<T> {
  loading: boolean
  dataFetched: boolean
  error: string | null
  data: T | null
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
      set({ error: null, loading: !get().dataFetched })
      try {
        const preparedPath = fillPathParams(path, get().pathParams)

        const response = await api.get(preparedPath, {
          params: get().queryParams,
        })

        if (response.status !== 200) {
          set({ error: 'Something wrong' })
        } else if (!response.data.success) {
          set({ error: response.data.error })
        } else {
          set({ dataFetched: true, data: response.data.body })
        }
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

    return {
      loading: false,
      dataFetched: false,
      error: null,
      data: null,
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
      reset: () =>
        set({
          loading: false,
          dataFetched: false,
          error: null,
          data: null,
          pathParams: {},
          queryParams: {},
        }),
      applyPatch,
    }
  })
