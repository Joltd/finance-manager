const source =
  typeof window !== 'undefined'
    ? new EventSource(process.env.NEXT_PUBLIC_BACKEND_HOST + '/sse')
    : undefined
const listeners: Record<string, any> = {}

export const subscribeSse = <T>(
  eventName: string,
  params: Record<string, any>,
  listener: (data: T) => void,
): (() => void) => {
  unsubscribeSse(eventName)
  const actualListener = (event: MessageEvent) => listener(JSON.parse(event.data))
  listeners[eventName] = actualListener
  source?.addEventListener(eventName, actualListener)
  return () => unsubscribeSse(eventName)
}

export const unsubscribeSse = (eventName: string) => {
  const listener = listeners[eventName]
  source?.removeEventListener(eventName, listener)
  delete listeners[eventName]
}
