'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/common/typography/typography'
import { Stack } from '@/components/common/layout/stack'

interface SeekProps {
  seekForward: () => Promise<void>
  seekBackward: () => Promise<void>
  error?: string
  loadingForward: boolean
  loadingBackward: boolean
  exhaustedForward: boolean
  exhaustedBackward: boolean
  children: React.ReactNode
  className?: string
  reverse?: boolean
}

export function Seek({
  seekForward,
  seekBackward,
  loadingForward,
  loadingBackward,
  exhaustedForward,
  exhaustedBackward,
  children,
  className,
  error,
  reverse = false,
}: SeekProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleAnchoredSeek = useCallback(async (seek: () => Promise<void>) => {
    const container = containerRef.current
    const items = Array.from(container?.children ?? []) as HTMLDivElement[]
    const child = items.find((it) => it.dataset.id !== 'seek-sentinel')
    const childOffsetTop = child?.offsetTop ?? 0

    await seek()

    if (child && container) {
      requestAnimationFrame(() => {
        container.scrollTop = child.offsetTop - childOffsetTop
      })
    }
  }, [])

  // The top sentinel always inserts content above the current viewport, so it
  // always gets the anchor treatment; the bottom one never needs it.
  const handleTop = useCallback(
    () => handleAnchoredSeek(reverse ? seekBackward : seekForward),
    [handleAnchoredSeek, reverse, seekBackward, seekForward],
  )

  const handleBottom = useCallback(async () => {
    await (reverse ? seekForward() : seekBackward())
  }, [reverse, seekForward, seekBackward])

  const topSentinel = reverse
    ? { id: 'backward', loading: loadingBackward, exhausted: exhaustedBackward }
    : { id: 'forward', loading: loadingForward, exhausted: exhaustedForward }

  const bottomSentinel = reverse
    ? { id: 'forward', loading: loadingForward, exhausted: exhaustedForward }
    : { id: 'backward', loading: loadingBackward, exhausted: exhaustedBackward }

  if (error) {
    return (
      <Stack ref={containerRef} scrollable gap={0} className={className}>
        <Stack align="center" justify="center" className="flex-1">
          <Typography variant="muted">{error}</Typography>
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack ref={containerRef} scrollable gap={0} className={className}>
      <SeekSentinelBlock
        id={topSentinel.id}
        onIntersect={handleTop}
        loading={topSentinel.loading}
        exhausted={topSentinel.exhausted}
      />
      {children}
      <SeekSentinelBlock
        id={bottomSentinel.id}
        onIntersect={handleBottom}
        loading={bottomSentinel.loading}
        exhausted={bottomSentinel.exhausted}
      />
    </Stack>
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
