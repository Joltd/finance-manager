'use client'

import {
  CheckCircle2Icon,
  CircleDashedIcon,
  Loader2Icon,
  WalletIcon,
  XCircleIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Typography } from '@/components/common/typography/typography'
import { Skeleton } from '@/components/ui/skeleton'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'
import { ImportData, ImportDataTotal } from '@/types/import-data'

interface ImportDataHeaderProps {
  data: ImportData | undefined
  loading: boolean
}

function TotalsRow({ total }: { total: ImportDataTotal }) {
  return (
    <div className="grid grid-cols-[5rem_1fr_1fr_1fr_1fr_1.5rem] items-center gap-2 py-1.5 border-b last:border-0">
      <Typography as="span" variant="small" className="font-mono font-semibold">
        {total.currency}
      </Typography>
      <AmountLabel amount={total.parsed} />
      <AmountLabel amount={total.suggested} />
      <AmountLabel amount={total.operation} />
      <AmountLabel amount={total.actual} />
      <div className="flex justify-end">
        {total.valid ? (
          <CheckCircle2Icon className="size-4 text-green-500" />
        ) : (
          <XCircleIcon className="size-4 text-destructive" />
        )}
      </div>
    </div>
  )
}

export function ImportDataHeader({ data, loading }: ImportDataHeaderProps) {
  return (
    <Stack className="shrink-0 px-4 md:px-6 py-4 border-b" gap={4}>
      {/* Title + status row */}
      <Stack orientation="horizontal" align="center" gap={3}>
        <div className="flex items-center justify-center size-9 rounded-lg bg-muted shrink-0">
          <WalletIcon className="size-4 text-muted-foreground" />
        </div>

        {loading || !data ? (
          <Stack gap={1}>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-20" />
          </Stack>
        ) : (
          <Flow align="center" gap={2}>
            <Typography variant="large">{data.account.name}</Typography>
            {data.account.group && (
              <Typography variant="muted" as="span">
                {data.account.group.name}
              </Typography>
            )}
          </Flow>
        )}

        <Flow align="center" gap={3} className="ml-auto">
          {loading || !data ? (
            <>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </>
          ) : (
            <>
              {data.progress ? (
                <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', 'text-amber-600 dark:text-amber-400')}>
                  <Loader2Icon className="size-3.5 animate-spin" />
                  In Progress
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CircleDashedIcon className="size-3.5" />
                  Complete
                </span>
              )}

              {data.valid ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                  <CheckCircle2Icon className="size-3.5" />
                  Valid
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
                  <XCircleIcon className="size-3.5" />
                  Invalid
                </span>
              )}
            </>
          )}
        </Flow>
      </Stack>

      {/* Totals */}
      {(loading || (data && data.totals.length > 0)) && (
        <div className="rounded-lg border bg-muted/20 px-3 py-1">
          <div className="grid grid-cols-[5rem_1fr_1fr_1fr_1fr_1.5rem] items-center gap-2 py-1.5 border-b">
            {(['Currency', 'Parsed', 'Suggested', 'Operations', 'Actual'] as const).map((label) => (
              <Typography key={label} variant="muted" as="span" className="text-xs">
                {label}
              </Typography>
            ))}
            <span />
          </div>

          {loading || !data ? (
            <Stack gap={1} className="py-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </Stack>
          ) : (
            data.totals.map((total) => <TotalsRow key={total.currency} total={total} />)
          )}
        </div>
      )}
    </Stack>
  )
}