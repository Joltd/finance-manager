import { useEffect } from 'react'
import { createStore } from 'zustand'
import { useStoreSelect } from '@/hooks/use-store-select'
import { fillPathParams } from '@/lib/utils'
import { useRequest } from '@/hooks/use-request'
import api from '@/lib/axios'

interface SseStoreState {
  source?: EventSource
  initSource: (path: string) => void
  listeners: Record<string, any>
  subscribe: (eventName: string, listener: (data: any) => void) => void
  unsubscribe: (eventName: string) => void
}

const sseStore = createStore<SseStoreState>((set, get) => {
  const initSource = (path: string) => {
    const source = new EventSource(path)
    set({ source })
  }

  const subscribe = (eventName: string, listener: (data: any) => void) => {
    let source = get().source
    if (!source) {
      throw new Error('EventSource is not initialized')
    }

    const actualListener = (event: MessageEvent) => {
      listener(event.data ? JSON.parse(event.data) : undefined)
    }
    const listeners = get().listeners
    listeners[eventName] = actualListener
    set({ listeners })

    source.addEventListener(eventName, actualListener)
  }

  const unsubscribe = (eventName: string) => {
    const listeners = get().listeners
    const listener = listeners[eventName]
    get().source?.removeEventListener(eventName, listener)
    delete listeners[eventName]
    set({ listeners })
  }

  return {
    initSource,
    listeners: {},
    subscribe,
    unsubscribe,
  }
})

const useSseStore = <K extends keyof SseStoreState>(...fields: K[]) =>
  useStoreSelect<SseStoreState, K>(sseStore, ...fields)

export interface SseProps<T> {
  eventName: string
  params?: Record<string, any>
  listener?: (data: T) => void
}

export function Sse<T>({ eventName, params, listener }: SseProps<T>) {
  const store = useSseStore()

  useEffect(() => {
    if (!listener) {
      return
    }

    const actualEventName = fillPathParams(eventName, params)

    if (!store.source) {
      api.get('/api/sse-endpoint').then((response) => {
        store.initSource(response.data)
        store.subscribe(actualEventName, listener)
      })
    } else {
      store.subscribe(actualEventName, listener)
    }

    return () => {
      store.unsubscribe(actualEventName)
    }
  }, [])

  return null
}
