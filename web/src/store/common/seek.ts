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
  loadingForward: boolean
  loadingBackward: boolean
  error?: string
  pointer?: TPointer
  body?: TBody
  queryParams?: TQuery
  pathParams?: TPath
  exhaustedForward: boolean
  exhaustedBackward: boolean
  loadingRefresh: boolean
}

export interface SeekActions<TData, TBody, TQuery, TPath, TPointer> {
  seekForward: () => Promise<void>
  seekBackward: () => Promise<void>
  setPointer: (pointer: TPointer) => void
  setBody: (body: TBody) => void
  setQueryParams: (params: TQuery) => void
  setPathParams: (params: TPath) => void
  refresh: () => Promise<void>
  resetData: () => void
  reset: () => void
}

export type SeekSlice<
  TData,
  TPointer = string,
  TBody = unknown,
  TQuery = unknown,
  TPath extends Record<string, string> = Record<string, string>,
> = SeekState<TData, TBody, TQuery, TPath, TPointer> &
  SeekActions<TData, TBody, TQuery, TPath, TPointer>

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
  const executeRequest = async (
    path: string,
    method: Method,
    pathParams?: Record<string, string>,
    queryParams?: unknown,
    data?: unknown,
  ): Promise<TData[]> => {
    const url = buildPath(path, pathParams)
    const response = await api.request<BackendResponse<TData[]>>({
      url,
      method,
      data,
      params: queryParams,
    })
    if (!response.data.success) {
      throw new Error(response.data.error)
    }
    return response.data.body
  }

  return (set, get) => ({
    data: [],
    loadingForward: false,
    loadingBackward: false,
    error: undefined,
    pointer: undefined,
    body: undefined,
    queryParams: undefined,
    pathParams: undefined,
    exhaustedForward: false,
    exhaustedBackward: false,
    loadingRefresh: false,

    seekForward: async (): Promise<void> => {
      const {
        loadingForward,
        exhaustedForward,
        data,
        body,
        queryParams,
        pathParams,
        pointer: storedPointer,
      } = get()

      if (exhaustedForward || loadingForward) return

      const pointer = data.length > 0 ? getPointer(data[0]) : storedPointer

      set({ loadingForward: true, error: undefined })

      try {
        const newItems = await executeRequest(
          path,
          method,
          pathParams as Record<string, string> | undefined,
          { ...queryParams, pointer, direction: SeekDirection.FORWARD },
          method !== 'GET' ? body : undefined,
        )

        if (newItems.length === 0) {
          set({ loadingForward: false, exhaustedForward: true })
          return
        }

        set((state) => {
          const merged = [...newItems, ...state.data]
          if (merged.length <= MAX_SIZE) return { data: merged, loadingForward: false }
          return {
            data: merged.slice(0, MAX_SIZE),
            loadingForward: false,
            exhaustedBackward: false,
          }
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        set({ error: message, loadingForward: false })
        throw err
      }
    },

    seekBackward: async (): Promise<void> => {
      const {
        loadingBackward,
        exhaustedBackward,
        data,
        body,
        queryParams,
        pathParams,
        pointer: storedPointer,
      } = get()

      if (exhaustedBackward || loadingBackward) return

      const pointer = data.length > 0 ? getPointer(data[data.length - 1]) : storedPointer

      set({ loadingBackward: true, error: undefined })

      try {
        const newItems = await executeRequest(
          path,
          method,
          pathParams as Record<string, string> | undefined,
          { ...queryParams, pointer, direction: SeekDirection.BACKWARD },
          method !== 'GET' ? body : undefined,
        )

        if (newItems.length === 0) {
          set({ loadingBackward: false, exhaustedBackward: true })
          return
        }

        set((state) => {
          const merged = [...state.data, ...newItems]
          if (merged.length <= MAX_SIZE) return { data: merged, loadingBackward: false }
          return {
            data: merged.slice(merged.length - MAX_SIZE),
            loadingBackward: false,
            exhaustedForward: false,
          }
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        set({ error: message, loadingBackward: false })
        throw err
      }
    },

    setPointer: (pointer: TPointer) => set({ pointer }),
    setBody: (body: TBody) => set({ body }),
    setQueryParams: (params: TQuery) => set({ queryParams: params }),
    setPathParams: (params: TPath) => set({ pathParams: params }),

    refresh: async (): Promise<void> => {
      const { data, body, queryParams, pathParams } = get()
      const pointers = data.map(getPointer)

      set({ loadingRefresh: true })

      try {
        const updatedItems = await executeRequest(
          path,
          method,
          pathParams as Record<string, string> | undefined,
          { ...queryParams, pointers },
          method !== 'GET' ? body : undefined,
        )

        set((state) => ({
          loadingRefresh: false,
          data: state.data.map((existing) => {
            const updated = updatedItems.find((item) => getPointer(item) === getPointer(existing))
            return updated ?? existing
          }),
        }))
      } catch (err) {
        set({ loadingRefresh: false })
        throw err
      }
    },

    resetData: () =>
      set({
        data: [],
        loadingForward: false,
        loadingBackward: false,
        error: undefined,
        exhaustedForward: false,
        exhaustedBackward: false,
      }),

    reset: () =>
      set({
        data: [],
        loadingForward: false,
        loadingBackward: false,
        error: undefined,
        pointer: undefined,
        body: undefined,
        queryParams: undefined,
        pathParams: undefined,
        exhaustedForward: false,
        exhaustedBackward: false,
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
