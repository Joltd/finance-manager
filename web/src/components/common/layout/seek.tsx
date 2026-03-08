'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { SeekDirection } from '@/store/common/seek'
import { Spinner } from '@/components/ui/spinner'

interface SeekSentinelProps {
  onIntersect: () => void
  loading: boolean
  exhausted: boolean
}

function SeekSentinel({ onIntersect, loading, exhausted }: SeekSentinelProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (exhausted) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onIntersect()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [onIntersect, exhausted])

  return (
    <div ref={ref} data-id="seek-sentinel" className="flex min-h-10 items-center justify-center">
      {exhausted ? (
        <div className="h-px w-16 rounded-full bg-border" />
      ) : loading ? (
        <Spinner className="text-muted-foreground" />
      ) : null}
    </div>
  )
}

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
    <div ref={containerRef} className={cn('flex flex-col overflow-y-auto', className)}>
      <SeekSentinel
        onIntersect={seekForward}
        loading={loading[SeekDirection.FORWARD]}
        exhausted={exhausted[SeekDirection.FORWARD]}
      />
      {children}
      <SeekSentinel
        onIntersect={seekBackward}
        loading={loading[SeekDirection.BACKWARD]}
        exhausted={exhausted[SeekDirection.BACKWARD]}
      />
    </div>
  )
}
