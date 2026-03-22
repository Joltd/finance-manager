'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { SeekDirection } from '@/store/common/seek'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/common/typography/typography'
import { Stack } from '@/components/common/layout/stack'

interface SeekProps {
  seek: (direction: SeekDirection) => Promise<void>
  loading: Record<SeekDirection, boolean>
  exhausted: Record<SeekDirection, boolean>
  children: React.ReactNode
  className?: string
}

export function Seek({ seek, loading, exhausted, children, className }: SeekProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const seekForward = useCallback(async () => {
    const container = containerRef.current
    const children = Array.from(container?.children ?? []) as HTMLDivElement[]
    const child = children.find((it) => it.dataset.id !== 'seek-sentinel')
    const childOffsetTop = child?.offsetTop ?? 0

    await seek(SeekDirection.FORWARD)

    if (child && container) {
      requestAnimationFrame(() => {
        container.scrollTop = child.offsetTop - childOffsetTop
      })
    }
  }, [seek])

  const seekBackward = useCallback(async () => {
    await seek(SeekDirection.BACKWARD)
  }, [seek])

  return (
    <Stack ref={containerRef} scrollable gap={0} className={className}>
      <SeekSentinelBlock
        id="forward"
        onIntersect={seekForward}
        loading={loading[SeekDirection.FORWARD]}
        exhausted={exhausted[SeekDirection.FORWARD]}
      />
      {children}
      <SeekSentinelBlock
        id="backward"
        onIntersect={seekBackward}
        loading={loading[SeekDirection.BACKWARD]}
        exhausted={exhausted[SeekDirection.BACKWARD]}
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
  }, [onIntersect, ref.current])

  return <div ref={ref} className="flex h-full w-full" />
}
