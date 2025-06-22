import { create } from "zustand";

interface NotificationStoreState {
  subscribe: <T>(eventName: string, listener: (data: T) => void) => void
  unsubscribe: (eventName: string) => void
}

export const useNotificationStore = create<NotificationStoreState>()((set, get) => {

  const source = typeof window !== 'undefined'
    ? new EventSource(process.env.NEXT_PUBLIC_BACKEND_HOST + '/sse')
    : undefined
  const listeners: Record<string, any> = {}

  const subscribe = <T>(eventName: string, listener: (data: T) => void) => {
    unsubscribe(eventName)
    const actualListener = (event: MessageEvent) => listener(JSON.parse(event.data))
    listeners[eventName] = actualListener
    source?.addEventListener(eventName, actualListener)
  }

  const unsubscribe = (eventName: string) => {
    const listener = listeners[eventName]
    source?.removeEventListener(eventName, listener)
    delete listeners[eventName]
  }

  return {
    subscribe,
    unsubscribe,
  }
})