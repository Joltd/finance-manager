import { create, createStore, StateCreator, StoreApi } from "zustand";
import api from "@/lib/axios";
import { useMemo } from "react";
import { patch, Path } from "@/lib/patch";
import { produce } from "immer";

export const observable = <T, R>(
  store: StoreApi<T>,
  set: (state: any) => void,
  field: keyof R
): T => {
  store.subscribe((state: T) => {
    set({ [field]: state })
  })
  return store.getState()
}

export interface FetchStoreState<T> {
  loading: boolean
  dataFetched: boolean
  error: string | null
  data: T | null
  pathParams?: Record<string, any>
  updatePathParams: (pathParams: Record<string, any>) => void
  queryParams?: Record<string, any>
  updateQueryParams: (queryParams: Record<string, any>) => void
  fetch: () => void
  reset: () => void
  applyPatch: (path: Path, value?: any) => void
}

// in component as self standing store
export const useFetchStore = <T>(path: string): FetchStoreState<T> => {
  const useStore = useMemo(() => create<FetchStoreState<T>>(prepareFetchStoreCreator(path)), [])
  return useStore()
}

// inside other stores
export const createFetchStore = <T>(path: string) => {
  return createStore<FetchStoreState<T>>(prepareFetchStoreCreator(path))
}

const prepareFetchStoreCreator = <T>(path: string): StateCreator<FetchStoreState<T>> => {
  return (set, get) => {

    const fetch = async () => {
      set({ error: null })
      set({ loading: !get().dataFetched })
      try {
        const preparedPath = fillPathParams(path, get().pathParams)

        const response = await api.get(preparedPath, {
          params: get().queryParams
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

    const applyPatch = (path: Path, value?: any) => {
      produce(get().data, (draft) => patch(draft, path, value))
    }

    return {
      loading: false,
      dataFetched: false,
      error: null,
      data: null,
      pathParams: {},
      updatePathParams: (pathParams: Record<string, any>) => set({ pathParams: { ...get().pathParams, ...pathParams } }),
      queryParams: {},
      updateQueryParams: (queryParams: Record<string, any>) => set({ queryParams: { ...get().queryParams, ...queryParams } }),
      fetch,
      reset: () => set({ loading: false, dataFetched: false, error: null, data: null, pathParams: {}, queryParams: {} }),
      applyPatch,
    }
  };
}

const fillPathParams = (path: string, pathParams?: Record<string, any>): string => {
  if (!pathParams) {
    return path
  }

  Object.keys(pathParams)
    .forEach((key) => {
      const value = pathParams?.[key]
      if (value) {
        path = path.replaceAll(`:${key}`, value)
      }
    })

  return path
}