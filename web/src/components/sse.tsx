import { useEffect } from 'react'
import { createStore } from 'zustand'
import { useStoreSelect } from '@/hooks/use-store-select'
import { fillPathParams } from '@/lib/utils'

interface SseStoreState {
  source?: EventSource
  listeners: Record<string, any>
  subscribe: (eventName: string, listener: (data: any) => void) => void
  unsubscribe: (eventName: string) => void
}

const sseStore = createStore<SseStoreState>((set, get) => {
  const subscribe = (eventName: string, listener: (data: any) => void) => {
    let source = get().source
    if (!source) {
      source = new EventSource('/api/v1/sse')
      set({ source })
    }

    const actualListener = (event: MessageEvent) =>
      listener(event.data ? JSON.parse(event.data) : undefined)
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
    listeners: {},
    subscribe,
    unsubscribe,
  }
})

const useSstStore = <K extends keyof SseStoreState>(...fields: K[]) =>
  useStoreSelect<SseStoreState, K>(sseStore, ...fields)

export interface SseProps<T> {
  eventName: string
  params?: Record<string, any>
  listener?: (data: T) => void
}

export function Sse<T>({ eventName, params, listener }: SseProps<T>) {
  const store = useSstStore()

  useEffect(() => {
    const actualEventName = fillPathParams(eventName, params)

    if (!listener) {
      return
    }

    store.subscribe(actualEventName, listener)

    return () => {
      store.unsubscribe(actualEventName)
    }
  }, [])

  return null
}
