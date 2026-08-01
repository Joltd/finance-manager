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
  loadingLoad: boolean
  version: number
}

export interface SeekActions<TBody, TQuery, TPath, TPointer> {
  seekForward: () => Promise<void>
  seekBackward: () => Promise<void>
  setPointer: (pointer: TPointer) => void
  setBody: (body: TBody) => void
  setQueryParams: (params: TQuery) => void
  setPathParams: (params: TPath) => void
  refresh: () => Promise<void>
  load: (pointers: TPointer[]) => Promise<void>
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
  SeekActions<TBody, TQuery, TPath, TPointer>

export function createSeekSlice<
  TData,
  TPointer = string,
  TBody = unknown,
  TQuery = unknown,
  TPath extends Record<string, string> = Record<string, string>,
>(
  path: string,
  getPointer: (item: TData) => TPointer,
  comparePointer: (a: TPointer, b: TPointer) => number,
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
    loadingLoad: false,
    version: 0,

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

    load: async (pointers: TPointer[]): Promise<void> => {
      const { data, exhaustedForward, exhaustedBackward, body, queryParams, pathParams, version } =
        get()

      const oldest = data.length > 0 ? getPointer(data[data.length - 1]) : undefined
      const newest = data.length > 0 ? getPointer(data[0]) : undefined

      const accepted = new Set<TPointer>()
      for (const p of pointers) {
        const accept =
          data.length === 0
            ? exhaustedForward || exhaustedBackward
            : (comparePointer(p, oldest as TPointer) >= 0 && comparePointer(p, newest as TPointer) <= 0) ||
              (comparePointer(p, newest as TPointer) > 0 && exhaustedForward) ||
              (comparePointer(p, oldest as TPointer) < 0 && exhaustedBackward)
        if (accept) accepted.add(p)
      }
      const acceptedPointers = Array.from(accepted)
      if (acceptedPointers.length === 0) return

      set({ loadingLoad: true, error: undefined })

      try {
        const items = await executeRequest(
          path,
          method,
          pathParams as Record<string, string> | undefined,
          { ...queryParams, pointers: acceptedPointers },
          method !== 'GET' ? body : undefined,
        )

        set((state) => {
          if (state.version !== version) return { loadingLoad: false }

          const preOldest =
            state.data.length > 0 ? getPointer(state.data[state.data.length - 1]) : undefined
          const preNewest = state.data.length > 0 ? getPointer(state.data[0]) : undefined
          const wasEmpty = state.data.length === 0

          const acceptedSet = new Set(acceptedPointers)
          const kept = state.data.filter((existing) => !acceptedSet.has(getPointer(existing)))
          const upserts = acceptedPointers
            .map((p) => items.find((item) => getPointer(item) === p))
            .filter((item): item is TData => item !== undefined)

          const next = [...kept, ...upserts].sort((a, b) =>
            comparePointer(getPointer(b), getPointer(a)),
          )

          const postOldest = next.length > 0 ? getPointer(next[next.length - 1]) : undefined
          const postNewest = next.length > 0 ? getPointer(next[0]) : undefined
          const becameNonEmpty = wasEmpty && next.length > 0

          return {
            loadingLoad: false,
            data: next,
            exhaustedForward:
              becameNonEmpty ||
              (preNewest !== undefined &&
                postNewest !== undefined &&
                comparePointer(postNewest, preNewest) > 0)
                ? false
                : state.exhaustedForward,
            exhaustedBackward:
              becameNonEmpty ||
              (preOldest !== undefined &&
                postOldest !== undefined &&
                comparePointer(postOldest, preOldest) < 0)
                ? false
                : state.exhaustedBackward,
          }
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        set({ error: message, loadingLoad: false })
        throw err
      }
    },

    resetData: () =>
      set((state) => ({
        data: [],
        loadingForward: false,
        loadingBackward: false,
        error: undefined,
        exhaustedForward: false,
        exhaustedBackward: false,
        loadingLoad: false,
        version: state.version + 1,
      })),

    reset: () =>
      set((state) => ({
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
        loadingLoad: false,
        version: state.version + 1,
      })),
  })
}

export function createSeekStore<
  TData,
  TPointer = string,
  TBody = unknown,
  TQuery = unknown,
  TPath extends Record<string, string> = Record<string, string>,
>(
  path: string,
  getPointer: (item: TData) => TPointer,
  comparePointer: (a: TPointer, b: TPointer) => number,
  method: Method = 'GET',
) {
  return create<SeekSlice<TData, TPointer, TBody, TQuery, TPath>>(
    createSeekSlice(path, getPointer, comparePointer, method),
  )
}
