'use client'

import { useEffect } from 'react'
import { AlertCircleIcon } from 'lucide-react'
import { importDataChannels } from '@/api/import-data'
import { Stack } from '@/components/common/layout/stack'
import { ReviseBadge } from '@/components/common/typography/revise-badge'
import { Typography } from '@/components/common/typography/typography'
import { Skeleton } from '@/components/ui/skeleton'
import { useSse } from '@/hooks/use-sse'
import { formatDateCommon } from '@/lib/utils'
import { useImportDataStore } from '@/store/import-data'
import { DateRange } from '@/types/common/common'
import { ImportDataAmounts } from './import-data-amounts'

export function ImportDataHeader({ id }: { id: string }) {
  const { data, loading, error, fetch, setPathParams, reset } = useImportDataStore()

  useEffect(() => {
    reset()
    setPathParams({ id })
    void fetch()
  }, [id, fetch, reset, setPathParams])

  useSse(importDataChannels.data(id), () => void fetch(), {
    debounceMs: 400,
    merge: (_, next) => next,
  })

  if (loading && !data) {
    return (
      <Stack gap={3} className="shrink-0">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </Stack>
    )
  }

  if (error && !data) {
    return (
      <Stack gap={2} className="shrink-0">
        <Typography variant="h3">Import</Typography>
        <Typography variant="muted" className="inline-flex items-center gap-2 text-destructive">
          <AlertCircleIcon className="size-4" />
          {error}
        </Typography>
      </Stack>
    )
  }

  if (!data) return null

  return (
    <Stack gap={3} className="shrink-0">
      <Stack gap={1}>
        <Stack orientation="horizontal" align="center" gap={3}>
          <Typography variant="large">{data.account.name}</Typography>
          <ReviseBadge reviseDate={data.account.reviseDate} />
        </Stack>
        <Stack orientation="horizontal" align="center" gap={3}>
          {data.dateRange && (
            <Typography variant="muted">{formatPeriod(data.dateRange)}</Typography>
          )}
          <ImportDataAmounts
            label={
              <Typography as="span" variant="small">
                Balance
              </Typography>
            }
            amounts={data.totals.map((total) => total.balance)}
          />
        </Stack>
      </Stack>

      {data.message && (
        <Typography
          variant="muted"
          className="inline-flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive"
        >
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          {data.message}
        </Typography>
      )}
    </Stack>
  )
}

function formatPeriod({ from, to }: DateRange): string {
  if (from === to) return formatDateCommon(from)
  return `${formatDateCommon(from)} – ${formatDateCommon(to)}`
}
