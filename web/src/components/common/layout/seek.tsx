'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/common/typography/typography'
import { Stack } from '@/components/common/layout/stack'
import { cn } from '@/lib/utils'

interface SeekProps {
  seekForward: () => Promise<void>
  seekBackward: () => Promise<void>
  error?: string
  loadingForward: boolean
  loadingBackward: boolean
  exhaustedForward: boolean
  exhaustedBackward: boolean
  initialized: boolean
  loadingLoad?: boolean
  children: React.ReactNode
  className?: string
  reverse?: boolean
}

interface ScrollAnchor {
  element: Element
  top: number
}

export function Seek({
  seekForward,
  seekBackward,
  loadingForward,
  loadingBackward,
  exhaustedForward,
  exhaustedBackward,
  initialized,
  loadingLoad = false,
  children,
  className,
  error,
  reverse = false,
}: SeekProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<ScrollAnchor | null>(null)

  const captureAnchor = useCallback(() => {
    const container = containerRef.current
    if (!container) {
      anchorRef.current = null
      return
    }
    const containerTop = container.getBoundingClientRect().top
    const element = Array.from(container.children).find(
      (it) =>
        (it as HTMLElement).dataset.id !== 'seek-sentinel' &&
        it.getBoundingClientRect().bottom > containerTop,
    )
    anchorRef.current = element ? { element, top: element.getBoundingClientRect().top } : null
  }, [])

  useLayoutEffect(() => {
    const container = containerRef.current
    const anchor = anchorRef.current
    if (container && anchor?.element.isConnected) {
      const delta = anchor.element.getBoundingClientRect().top - anchor.top
      if (delta !== 0) container.scrollTop += delta
    }
    captureAnchor()
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('scroll', captureAnchor, { passive: true })
    return () => container.removeEventListener('scroll', captureAnchor)
  }, [captureAnchor, error])

  const topSentinel = reverse
    ? { id: 'backward', seek: seekBackward, loading: loadingBackward, exhausted: exhaustedBackward }
    : { id: 'forward', seek: seekForward, loading: loadingForward, exhausted: exhaustedForward }

  const bottomSentinel = reverse
    ? { id: 'forward', seek: seekForward, loading: loadingForward, exhausted: exhaustedForward }
    : { id: 'backward', seek: seekBackward, loading: loadingBackward, exhausted: exhaustedBackward }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {loadingLoad && (
        <Progress className="absolute top-0 inset-x-0 z-20 rounded-none bg-transparent h-0.5" />
      )}
      {error ? (
        <Stack ref={containerRef} scrollable gap={0} className={cn('flex-1', className)}>
          <Stack align="center" justify="center" className="flex-1">
            <Typography variant="muted">{error}</Typography>
          </Stack>
        </Stack>
      ) : (
        <Stack
          ref={containerRef}
          scrollable
          gap={0}
          className={cn('flex-1 [overflow-anchor:none]', className)}
        >
          {initialized && (
            <SeekSentinelBlock
              id={topSentinel.id}
              onIntersect={topSentinel.seek}
              loading={topSentinel.loading}
              exhausted={topSentinel.exhausted}
            />
          )}
          {children}
          <SeekSentinelBlock
            id={bottomSentinel.id}
            onIntersect={bottomSentinel.seek}
            loading={bottomSentinel.loading}
            exhausted={bottomSentinel.exhausted}
          />
        </Stack>
      )}
    </div>
  )
}

interface SeekSentinelBlockProps {
  id: string
  onIntersect: () => void
  loading: boolean
  exhausted: boolean
}

function SeekSentinelBlock({ id, onIntersect, loading, exhausted }: SeekSentinelBlockProps) {
  return (
    <div data-id="seek-sentinel" className="flex min-h-10 items-center justify-center">
      {exhausted ? (
        <Typography variant="muted">End of data</Typography>
      ) : loading ? (
        <Spinner className="text-muted-foreground" />
      ) : (
        <SeekSentinel id={id} onIntersect={onIntersect} />
      )}
    </div>
  )
}

interface SeekSentinelProps {
  id: string
  onIntersect: () => void
}

function SeekSentinel({ id, onIntersect }: SeekSentinelProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            onIntersect()
          }
        }
      },
      { threshold: 0 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [onIntersect])

  return <div ref={ref} className="flex h-full w-full" />
}
