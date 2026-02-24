import { Stack, StackProps } from '@/components/common/layout/stack'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/common/typography/typography'
import { AlertCircleIcon } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { EmptyState } from '@/components/common/empty-state'

export interface SeekProps<D> extends StackProps {
  loading: boolean
  dataFetched: boolean
  error?: string
  forwardNoData: boolean
  backwardNoData: boolean
  data?: D[]
  seekForward: () => Promise<void>
  seekBackward: () => Promise<void>
}

export function Seek<D>({
  loading,
  dataFetched,
  error,
  forwardNoData,
  backwardNoData,
  data,
  seekForward,
  seekBackward,
  children,
  ...props
}: SeekProps<D>) {
  const ref = useRef<HTMLDivElement>(null)

  const handleSeekForward = useCallback(async () => {
    const contaner = ref.current
    const children = Array.from(contaner?.children ?? []) as HTMLDivElement[]
    const child = children.find((child) => child.dataset.id !== 'seek-handle')
    const childOffsetTop = child?.offsetTop ?? 0

    await seekForward()

    if (child && contaner) {
      requestAnimationFrame(() => {
        contaner.scrollTop = child.offsetTop - childOffsetTop
      })
    }
  }, [])

  const handleSeekBackward = useCallback(async () => {
    await seekBackward()
  }, [])

  return loading && !dataFetched ? (
    <Spinner />
  ) : error ? (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{error}</AlertTitle>
    </Alert>
  ) : !data || (Array.isArray(data) && !data.length) ? (
    <EmptyState className="grow" />
  ) : (
    <Stack ref={ref} {...props}>
      <SeekHandle noData={forwardNoData} onSeek={handleSeekForward} />
      {children}
      <SeekHandle noData={backwardNoData} onSeek={handleSeekBackward} />
    </Stack>
  )
}

export interface SeekHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  noData: boolean
  onSeek: () => Promise<void>
}

export function SeekHandle({ noData, onSeek, className, ...props }: SeekHandleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const intersectCallbackRef = useRef<(entries: IntersectionObserverEntry[]) => Promise<void>>(
    async () => {},
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    intersectCallbackRef.current = async (entries) => {
      if (noData || loading) {
        return
      }

      const [entry] = entries
      if (!entry.isIntersecting) return

      setLoading(true)
      try {
        await onSeek()
      } finally {
        setLoading(false)
      }
    }
  }, [loading, noData])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => intersectCallbackRef.current?.(entries),
      { threshold: 0.1 },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      data-id="seek-handle"
      ref={ref}
      {...props}
      className={cn('flex items-center justify-center min-h-5', className)}
    >
      {loading ? (
        <Spinner className="size-5" />
      ) : noData ? (
        <Typography variant="muted">End of data</Typography>
      ) : (
        <div>
          NoData - {noData ? 'true' : 'false'}, loading - {loading ? 'true' : 'false'}
        </div>
      )}
    </div>
  )
}
