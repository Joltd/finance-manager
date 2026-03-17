import { create, StateCreator } from 'zustand'
import { Method } from 'axios'
import api from '@/lib/axios'
import { buildPath } from '@/lib/api'
import { BackendResponse } from '@/types/common/common'

const MAX_SIZE = 20

export enum SeekDirection {
  BACKWARD = 'BACKWARD',
  FORWARD = 'FORWARD',
}

export interface SeekState<TData, TBody, TQuery, TPath, TPointer> {
  data: TData[]
  loading: Record<SeekDirection, boolean>
  error: string | null
  pointer: TPointer | undefined
  body: TBody | undefined
  queryParams: TQuery | undefined
  pathParams: TPath | undefined
  exhausted: Record<SeekDirection, boolean>
}

export interface SeekActions<TData, TBody, TQuery, TPath, TPointer> {
  seek: (direction: SeekDirection) => Promise<void>
  setPointer: (pointer: TPointer) => void
  setBody: (body: TBody) => void
  setQueryParams: (params: TQuery) => void
  setPathParams: (params: TPath) => void
  patchData: (items: TData[]) => void
  resetData: () => void
  reset: () => void
}

export type SeekSlice<
  TData,
  TPointer = string,
  TBody = unknown,
  TQuery = unknown,
  TPath extends Record<string, string> = Record<string, string>,
> = SeekState<TData, TBody, TQuery, TPath, TPointer> & SeekActions<TData, TBody, TQuery, TPath, TPointer>

const initialLoading: Record<SeekDirection, boolean> = {
  [SeekDirection.FORWARD]: false,
  [SeekDirection.BACKWARD]: false,
}

const initialExhausted: Record<SeekDirection, boolean> = {
  [SeekDirection.FORWARD]: false,
  [SeekDirection.BACKWARD]: false,
}

export function createSeekSlice<
  TData,
  TPointer = string,
  TBody = unknown,
  TQuery = unknown,
  TPath extends Record<string, string> = Record<string, string>,
>(
  path: string,
  getPointer: (item: TData) => TPointer,
  method: Method = 'GET',
): StateCreator<SeekSlice<TData, TPointer, TBody, TQuery, TPath>> {
  return (set, get) => ({
    data: [],
    loading: { ...initialLoading },
    error: null,
    pointer: undefined,
    body: undefined,
    queryParams: undefined,
    pathParams: undefined,
    exhausted: { ...initialExhausted },

    seek: async (direction: SeekDirection): Promise<void> => {
      const {
        loading,
        data,
        exhausted,
        body,
        queryParams,
        pathParams,
        pointer: storedPointer,
      } = get()

      if (exhausted[direction] || loading[direction]) {
        return
      }

      const pointer =
        data.length > 0
          ? direction === SeekDirection.FORWARD
            ? getPointer(data[0])
            : getPointer(data[data.length - 1])
          : storedPointer

      const url = buildPath(path, pathParams as Record<string, string> | undefined)
      set((state) => ({ loading: { ...state.loading, [direction]: true }, error: null }))

      try {
        const response = await api.request<BackendResponse<TData[]>>({
          url,
          method,
          data: method !== 'GET' ? body : undefined,
          params: { ...queryParams, pointer, direction },
        })

        if (!response.data.success) {
          throw new Error(response.data.error)
        }

        const newItems = response.data.body

        if (newItems.length === 0) {
          set((state) => ({
            loading: { ...state.loading, [direction]: false },
            exhausted: { ...state.exhausted, [direction]: true },
          }))
          return
        }

        set((state) => {
          const merged =
            direction === SeekDirection.FORWARD
              ? [...newItems, ...state.data]
              : [...state.data, ...newItems]

          const newLoading = { ...state.loading, [direction]: false }

          if (merged.length <= MAX_SIZE) {
            return { data: merged, loading: newLoading }
          }

          const newExhausted = { ...state.exhausted }
          if (direction === SeekDirection.FORWARD) {
            newExhausted[SeekDirection.BACKWARD] = false
            return { data: merged.slice(0, MAX_SIZE), loading: newLoading, exhausted: newExhausted }
          } else {
            newExhausted[SeekDirection.FORWARD] = false
            return {
              data: merged.slice(merged.length - MAX_SIZE),
              loading: newLoading,
              exhausted: newExhausted,
            }
          }
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        set((state) => ({ error: message, loading: { ...state.loading, [direction]: false } }))
        throw err
      }
    },

    setPointer: (pointer: TPointer) => set({ pointer }),
    setBody: (body: TBody) => set({ body }),
    setQueryParams: (params: TQuery) => set({ queryParams: params }),
    setPathParams: (params: TPath) => set({ pathParams: params }),

    patchData: (items: TData[]) =>
      set((state) => ({
        data: state.data.map((existing) => {
          const updated = items.find((item) => getPointer(item) === getPointer(existing))
          return updated ?? existing
        }),
      })),

    resetData: () =>
      set({
        data: [],
        loading: { ...initialLoading },
        error: null,
        exhausted: { ...initialExhausted },
      }),

    reset: () =>
      set({
        data: [],
        loading: { ...initialLoading },
        error: null,
        pointer: undefined,
        body: undefined,
        queryParams: undefined,
        pathParams: undefined,
        exhausted: { ...initialExhausted },
      }),
  })
}

export function createSeekStore<
  TData,
  TPointer = string,
  TBody = unknown,
  TQuery = unknown,
  TPath extends Record<string, string> = Record<string, string>,
>(path: string, getPointer: (item: TData) => TPointer, method: Method = 'GET') {
  return create<SeekSlice<TData, TPointer, TBody, TQuery, TPath>>(
    createSeekSlice(path, getPointer, method),
  )
}
