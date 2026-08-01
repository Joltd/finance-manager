'use client'

import { useEffect, useRef } from 'react'
import { subscribeSse } from '@/lib/sse-client'

interface SseDebounce<T> {
  debounceMs: number
  merge: (acc: T, next: T) => T
}

export function useSse<T = unknown>(
  channel: string,
  onEvent: (payload: T, timestamp: string) => void,
  debounce?: SseDebounce<T>,
): void {
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  })

  const debounceRef = useRef(debounce)

  useEffect(() => {
    debounceRef.current = debounce
  })

  useEffect(() => {
    if (!debounce) {
      return subscribeSse<T>(channel, (payload, timestamp) => onEventRef.current(payload, timestamp))
    }

    let buffered: T | undefined
    let timer: ReturnType<typeof setTimeout> | null = null

    const unsubscribe = subscribeSse<T>(channel, (payload, timestamp) => {
      buffered = buffered === undefined ? payload : debounceRef.current!.merge(buffered, payload)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        const toEmit = buffered as T
        buffered = undefined
        onEventRef.current(toEmit, timestamp)
      }, debounceRef.current!.debounceMs)
    })

    return () => {
      if (timer) clearTimeout(timer)
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, debounce?.debounceMs])
}
