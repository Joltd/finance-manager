import { createStore } from 'zustand/index'
import { fillPathParams, flatten } from '@/lib/utils'
import api from '@/lib/axios'
import { AxiosRequestConfig } from 'axios'
import { lifecycleStore } from '@/store/common/lifecycle'

export enum SeekDirection {
  BACKWARD = 'BACKWARD',
  FORWARD = 'FORWARD',
}

export interface SeekStoreState<P, D> {
  loading: boolean
  dataFetched: boolean
  error?: string
  forwardNoData: boolean
  backwardNoData: boolean
  data?: D[]
  pointer: P
  setPointer: (pointer: P) => void
  pathParams?: Record<string, any>
  setPathParams: (pathParams: Record<string, any>) => void
  updatePathParams: (pathParams: Record<string, any>) => void
  queryParams?: Record<string, any>
  setQueryParams: (queryParams: Record<string, any>) => void
  updateQueryParams: (queryParams: Record<string, any>) => void
  seekForward: () => Promise<void>
  seekBackward: () => Promise<void>
  reset: () => void
  resetData: () => void
}

const MAX_ITEMS = 20

export const createSeekStore = <P, D>(
  startPointer: P,
  getPointer: (data: D) => P,
  path: string,
  method: string = 'GET',
) =>
  createStore<SeekStoreState<P, D>>((set, get) => {
    const seekForward = async () => {
      if (get().forwardNoData) {
        return
      }

      const currentData = get().data ?? []
      const pointer = !!currentData.length ? getPointer(currentData[0]) : get().pointer

      const data = await seek(pointer, SeekDirection.FORWARD)

      const mergedData = [...data, ...currentData]
      const compactedData = mergedData.slice(0, MAX_ITEMS)
      set({ data: compactedData, forwardNoData: !data.length })
      if (get().backwardNoData && compactedData.length < mergedData.length) {
        set({ backwardNoData: false })
      }
    }

    const seekBackward = async () => {
      if (get().backwardNoData) {
        return
      }

      const currentData = get().data ?? []
      const pointer = !!currentData.length
        ? getPointer(currentData[currentData.length - 1])
        : get().pointer

      const data = await seek(pointer, SeekDirection.BACKWARD)

      const mergedData = [...currentData, ...data]
      const compactedData = mergedData.slice(-MAX_ITEMS)
      set({ data: compactedData, backwardNoData: !data.length })
      if (get().forwardNoData && compactedData.length < mergedData.length) {
        set({ forwardNoData: false })
      }
    }

    const seek = async (pointer: P, direction: SeekDirection) => {
      set({ error: undefined, loading: !get().dataFetched })
      try {
        const request: AxiosRequestConfig = {
          method,
          url: fillPathParams(path, get().pathParams),
          params: {
            pointer,
            direction,
            ...get().queryParams,
          },
        }

        const response = await api.request(request)

        if (response.status !== 200 || !response.data.success) {
          set({ error: response.data.error || 'Something wrong' })
        } else {
          set({ dataFetched: true })
          return response.data.body as D[]
        }
      } catch (error: any) {
        set({ error: error.response.data.error || 'Something wrong' })
      } finally {
        if (get().loading) {
          set({ loading: false })
        }
      }
      return []
    }

    const reset = () =>
      set({
        loading: false,
        dataFetched: false,
        error: undefined,
        forwardNoData: false,
        backwardNoData: false,
        data: undefined,
        pointer: startPointer,
        pathParams: {},
        queryParams: {},
      })

    const resetData = () => {
      set({
        dataFetched: false,
        forwardNoData: false,
        backwardNoData: false,
        data: undefined,
      })
    }

    lifecycleStore.getState().register(get())

    return {
      loading: false,
      dataFetched: false,
      error: undefined,
      forwardNoData: false,
      backwardNoData: false,
      data: undefined,
      pointer: startPointer,
      setPointer: (pointer: P) => set({ pointer }),
      pathParams: {},
      setPathParams: (pathParams: Record<string, any>) => set({ pathParams }),
      updatePathParams: (pathParams: Record<string, any>) =>
        set({ pathParams: { ...get().pathParams, ...pathParams } }),
      queryParams: {},
      setQueryParams: (queryParams: Record<string, any>) =>
        set({ queryParams: flatten(queryParams) }),
      updateQueryParams: (queryParams: Record<string, any>) =>
        set({ queryParams: { ...get().queryParams, ...flatten(queryParams) } }),
      seekForward,
      seekBackward,
      reset,
      resetData,
    }
  })
