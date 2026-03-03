import { create, StateCreator } from 'zustand'
import { Method } from 'axios'
import api from '@/lib/axios'
import { buildPath } from '@/lib/api'

interface ApiResponse<TData> {
  body: TData
  success: boolean
  error: string
}

export interface FetchState<TData, TBody, TQuery, TPath> {
  data: TData | undefined
  loading: boolean
  error: string | null
  body: TBody | undefined
  queryParams: TQuery | undefined
  pathParams: TPath | undefined
}

export interface FetchActions<TData, TBody, TQuery, TPath> {
  fetch: () => Promise<TData>
  setBody: (body: TBody) => void
  setQueryParams: (params: TQuery) => void
  setPathParams: (params: TPath) => void
  reset: () => void
}

export type FetchSlice<
  TData,
  TBody = unknown,
  TQuery = unknown,
  TPath extends Record<string, string> = Record<string, string>,
> = FetchState<TData, TBody, TQuery, TPath> & FetchActions<TData, TBody, TQuery, TPath>

export function createFetchSlice<
  TData,
  TBody = unknown,
  TQuery = unknown,
  TPath extends Record<string, string> = Record<string, string>,
>(path: string, method: Method = 'GET'): StateCreator<FetchSlice<TData, TBody, TQuery, TPath>> {
  return (set, get) => ({
    data: undefined,
    loading: false,
    error: null,
    body: undefined,
    queryParams: undefined,
    pathParams: undefined,

    fetch: async (): Promise<TData> => {
      const { body, queryParams, pathParams } = get()
      const url = buildPath(path, pathParams as Record<string, string> | undefined)
      set({ loading: true, error: null })
      try {
        const response = await api.request<ApiResponse<TData>>({
          url,
          method,
          data: method !== 'GET' ? body : undefined,
          params: queryParams,
        })
        if (!response.data.success) {
          throw new Error(response.data.error)
        }
        const data = response.data.body
        set({ data, loading: false })
        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        set({ error: message, loading: false })
        throw err
      }
    },

    setBody: (body: TBody) => set({ body }),
    setQueryParams: (params: TQuery) => set({ queryParams: params }),
    setPathParams: (params: TPath) => set({ pathParams: params }),

    reset: () =>
      set({
        data: undefined,
        loading: false,
        error: null,
        body: undefined,
        queryParams: undefined,
        pathParams: undefined,
      }),
  })
}

export function createFetchStore<
  TData,
  TBody = unknown,
  TQuery = unknown,
  TPath extends Record<string, string> = Record<string, string>,
>(path: string, method: Method = 'GET') {
  return create<FetchSlice<TData, TBody, TQuery, TPath>>(createFetchSlice(path, method))
}
