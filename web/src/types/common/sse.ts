export interface SseEnvelope<T> {
  payload: T
  timestamp: string
}
