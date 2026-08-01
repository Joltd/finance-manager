'use client'

import { useEffect, useRef } from 'react'
import { subscribeSse } from '@/lib/sse-client'

export function useSse<T = unknown>(
  channel: string,
  onEvent: (payload: T, timestamp: string) => void,
): void {
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  })

  useEffect(() => {
    return subscribeSse<T>(channel, (payload, timestamp) => onEventRef.current(payload, timestamp))
  }, [channel])
}
