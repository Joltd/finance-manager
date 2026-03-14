'use client'

import { useEffect } from 'react'
import {
  CheckCircle2Icon,
  CircleDashedIcon,
  Loader2Icon,
  PencilIcon,
  WalletIcon,
  XCircleIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Typography } from '@/components/common/typography/typography'
import { Skeleton } from '@/components/ui/skeleton'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useImportDataStore } from '@/store/import-data'
import { ImportDataTotal } from '@/types/import-data'
import { add, Amount } from '@/types/common/amount'
import { ask } from '@/store/common/ask-dialog'
import { useRequest } from '@/hooks/use-request'
import { importDataUrls } from '@/api/import-data'

function ValidIcon({ valid, tooltip }: { valid: boolean; tooltip: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {valid ? (
            <CheckCircle2Icon className="size-3.5 text-green-500 cursor-default" />
          ) : (
            <XCircleIcon className="size-3.5 text-destructive cursor-default" />
          )}
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface TotalsListProps {
  totals: ImportDataTotal[]
  onEditActual: (total: ImportDataTotal) => void
}

function TotalsList({ totals, onEditActual }: TotalsListProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-1">
        {totals.map((t) => (
          <Flow key={t.currency} align="center" gap={1}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 cursor-default">
                    <Typography variant="muted" as="span" className="text-xs">
                      Balance
                    </Typography>
                    <AmountLabel amount={add(t.operation, t.suggested)} />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="inline-flex items-center gap-1">
                    <Typography variant="muted" as="span" className="text-xs">
                      Current balance
                    </Typography>
                    <AmountLabel amount={t.operation} />
                    <Typography variant="muted" as="span" className="text-xs">
                      + Suggested
                    </Typography>
                    <AmountLabel amount={t.suggested} />
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ValidIcon
              valid={t.valid}
              tooltip={
                t.valid
                  ? 'Operation + Suggested = Parsed'
                  : 'Mismatch: operation + suggested ≠ parsed'
              }
            />
            <Typography variant="muted" as="span" className="text-xs">
              --
            </Typography>
            <Typography variant="muted" as="span" className="text-xs shrink-0">
              Actual
            </Typography>
            <AmountLabel amount={t.actual} />
            <button
              onClick={() => onEditActual(t)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <PencilIcon className="size-3" />
            </button>
          </Flow>
        ))}
      </div>
      <div className="space-y-1">
        {totals.map((t) => (
          <Flow key={t.currency} align="center" gap={1}>
            <AmountLabel amount={t.parsed} />
          </Flow>
        ))}
      </div>
    </div>
  )
}

export interface ImportDataHeaderProps {
  id: string
}

export function ImportDataHeader({ id }: ImportDataHeaderProps) {
  const { data, loading, fetch, setPathParams } = useImportDataStore()
  const { submit: saveActualBalance } = useRequest<void, Amount, never, { id: string }>(
    importDataUrls.actualBalance,
  )

  useEffect(() => {
    setPathParams({ id })
    void fetch()
  }, [id, setPathParams, fetch])

  const handleEditActual = async (total: ImportDataTotal) => {
    const newAmount = await ask<'amount'>({
      type: 'amount',
      label: `Actual balance (${total.currency})`,
      initialValue: total.actual,
    })
    await saveActualBalance({ body: newAmount, pathParams: { id } })
    void fetch()
  }

  return (
    <Stack className="shrink-0 px-6 py-4 border-b" gap={4}>
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
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-medium',
                    'text-amber-600 dark:text-amber-400',
                  )}
                >
                  <Loader2Icon className="size-3.5 animate-spin" />
                  In Progress
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CircleDashedIcon className="size-3.5" />
                  Complete
                </span>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {data.valid ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 cursor-default">
                        <CheckCircle2Icon className="size-3.5" />
                        Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive cursor-default">
                        <XCircleIcon className="size-3.5" />
                        Invalid
                      </span>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {data.valid
                      ? 'All totals are valid and operation + suggested = actual'
                      : 'Some totals are invalid or operation + suggested ≠ actual'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </Flow>
      </Stack>

      {/* Totals */}
      {loading ? (
        <div className="space-y-1">
          <Skeleton className="h-4 w-72" />
        </div>
      ) : data && data.totals.length > 0 ? (
        <TotalsList totals={data.totals} onEditActual={handleEditActual} />
      ) : null}
    </Stack>
  )
}
