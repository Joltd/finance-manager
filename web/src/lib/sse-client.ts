import { SseEnvelope } from '@/types/common/sse'

const SSE_URL = '/api/sse'
const CLOSE_GRACE_MS = 2000

type SseListener<T = unknown> = (payload: T, timestamp: string) => void

let eventSource: EventSource | null = null
let refCount = 0
let closeTimer: ReturnType<typeof setTimeout> | null = null
const listenersByChannel = new Map<string, Set<SseListener>>()
const nativeListenerByChannel = new Map<string, (evt: MessageEvent) => void>()

function ensureConnection(): void {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  if (eventSource) return

  eventSource = new EventSource(SSE_URL)
  for (const [channel, nativeListener] of nativeListenerByChannel) {
    eventSource.addEventListener(channel, nativeListener)
  }
}

function scheduleClose(): void {
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    closeTimer = null
    if (refCount <= 0 && eventSource) {
      eventSource.close()
      eventSource = null
    }
  }, CLOSE_GRACE_MS)
}

export function subscribeSse<T = unknown>(
  channel: string,
  listener: SseListener<T>,
): () => void {
  refCount += 1
  ensureConnection()

  let channelListeners = listenersByChannel.get(channel)
  if (!channelListeners) {
    channelListeners = new Set()
    listenersByChannel.set(channel, channelListeners)

    const nativeListener = (evt: MessageEvent) => {
      const envelope = JSON.parse(evt.data) as SseEnvelope<unknown>
      channelListeners!.forEach((l) => l(envelope.payload, envelope.timestamp))
    }
    nativeListenerByChannel.set(channel, nativeListener)
    eventSource?.addEventListener(channel, nativeListener)
  }
  channelListeners.add(listener as SseListener)

  return () => {
    channelListeners!.delete(listener as SseListener)
    if (channelListeners!.size === 0) {
      const nativeListener = nativeListenerByChannel.get(channel)
      if (nativeListener) eventSource?.removeEventListener(channel, nativeListener)
      listenersByChannel.delete(channel)
      nativeListenerByChannel.delete(channel)
    }

    refCount -= 1
    if (refCount <= 0) scheduleClose()
  }
}
