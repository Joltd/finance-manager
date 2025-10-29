import { fillPathParams } from '@/lib/utils'

const source = typeof window !== 'undefined' ? new EventSource('/api/v1/sse') : undefined
const listeners: Record<string, any> = {}

export const subscribeSse = <T>(
  eventName: string,
  params: Record<string, any>,
  listener: (data: T) => void,
): (() => void) => {
  const actualEventName = fillPathParams(eventName, params)
  unsubscribeSse(actualEventName)
  const actualListener = (event: MessageEvent) =>
    listener(!!event.data ? JSON.parse(event.data) : undefined)
  listeners[actualEventName] = actualListener
  source?.addEventListener(actualEventName, actualListener)
  return () => unsubscribeSse(actualEventName)
}

export const unsubscribeSse = (eventName: string) => {
  const listener = listeners[eventName]
  source?.removeEventListener(eventName, listener)
  delete listeners[eventName]
}
