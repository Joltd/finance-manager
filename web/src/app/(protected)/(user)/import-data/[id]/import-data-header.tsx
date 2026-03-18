'use client'

import { useEffect } from 'react'
import { CheckCircle2Icon, Loader2Icon, PencilIcon, RefreshCwIcon, XCircleIcon } from 'lucide-react'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Typography } from '@/components/common/typography/typography'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'
import { useImportDataStore } from '@/store/import-data'
import { ImportData, ImportDataTotal } from '@/types/import-data'
import { abs, add, isZero, subtract } from '@/types/common/amount'
import { ask } from '@/store/common/ask-dialog'
import { Filler } from '@/components/common/layout/filler'
import { ValidIcon } from '@/components/common/icon/valid-icon'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { useImportDataActions } from '@/app/(protected)/(user)/import-data/[id]/import-data-actions'

export interface ImportDataHeaderProps {
  id: string
}

export function ImportDataHeader({ id }: ImportDataHeaderProps) {
  const { data, fetch, setPathParams } = useImportDataStore()
  const { loading, actualBalance, calculateTotal } = useImportDataActions()

  useEffect(() => {
    setPathParams({ id })
    void fetch()
  }, [id, setPathParams, fetch])

  const handleEditActual = async (total: ImportDataTotal) => {
    const balance = await ask<'amount'>({
      type: 'amount',
      label: `Actual balance (${total.currency})`,
      initialValue: total.actual,
    })
    await actualBalance(id, balance)
    void fetch()
  }

  const handleRecalculate = async () => {
    await calculateTotal(id)
    void fetch()
  }

  return (
    <Stack gap={4}>
      <TitleSection data={data} loading={loading} onRecalculate={handleRecalculate} />

      {data && data.totals.length > 0 && (
        <Stack gap={1}>
          {data.totals.map((t) => (
            <TotalRow
              key={t.currency}
              total={t}
              loading={loading}
              onEditActual={() => handleEditActual(t)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  )
}

function ImportDataStatus({ data }: { data: ImportData }) {
  if (data.progress) {
    return (
      <Typography
        variant="muted"
        as="span"
        className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400"
      >
        <Loader2Icon className="size-3.5 animate-spin" />
        In Progress
      </Typography>
    )
  }

  if (data.valid) {
    return (
      <Typography
        variant="muted"
        as="span"
        className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400"
      >
        <CheckCircle2Icon className="size-3.5" />
        All good
      </Typography>
    )
  }

  const hasTotalsMismatch = data.totals.some(
    (t) => !isZero(subtract(add(t.operation, t.suggested), t.parsed)),
  )
  const hasBalanceMismatch = data.totals.some(
    (t) => !isZero(subtract(add(t.balance, t.suggested), t.actual)),
  )

  return (
    <Typography
      variant="muted"
      as="span"
      className="inline-flex items-center gap-1.5 text-destructive"
    >
      <XCircleIcon className="size-3.5" />
      {[hasTotalsMismatch && 'Totals mismatch', hasBalanceMismatch && 'Balance mismatch']
        .filter(Boolean)
        .join(', ')}
    </Typography>
  )
}

function TitleSection({
  data,
  loading,
  onRecalculate,
}: {
  data: ImportData | undefined
  loading: boolean
  onRecalculate: () => void
}) {
  return (
    <Stack orientation="horizontal" align="center" gap={3}>
      {data && (
        <Flow align="center" gap={2}>
          <Typography variant="large">{data.account.name}</Typography>
          {data.account.group && (
            <Typography variant="muted" as="span">
              {data.account.group.name}
            </Typography>
          )}
        </Flow>
      )}

      {data && (
        <Flow align="center" gap={2} className="ml-auto">
          <ImportDataStatus data={data} />
          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onRecalculate}
                disabled={loading || data.progress}
              >
                <RefreshCwIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Recalculate totals</TooltipContent>
          </Tooltip>
        </Flow>
      )}
    </Stack>
  )
}

function TotalRow({
  total,
  loading,
  onEditActual,
}: {
  total: ImportDataTotal
  loading: boolean
  onEditActual: () => void
}) {
  return (
    <Flow align="center" gap={2}>
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1.5 cursor-default">
            <Typography variant="muted" as="span" className="text-xs shrink-0">
              Operation
            </Typography>
            <AmountLabel amount={add(total.operation, total.suggested)} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <Flow align="center" gap={1}>
            <Typography variant="muted" as="span" className="text-xs shrink-0">
              Operation
            </Typography>
            <AmountLabel amount={total.operation} />
            <Typography variant="muted" as="span" className="text-xs shrink-0">
              + Suggested
            </Typography>
            <AmountLabel amount={total.suggested} />
          </Flow>
        </TooltipContent>
      </Tooltip>
      <Typography variant="muted" as="span" className="text-xs shrink-0">
        Parsed
      </Typography>
      <AmountLabel amount={total.parsed} />
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <ValidIcon valid={total.valid} />
        </TooltipTrigger>
        <TooltipContent>
          {total.valid ? (
            <Typography variant="muted">Operation + Suggested = Parsed</Typography>
          ) : (
            <Flow align="center" gap={1}>
              <Typography variant="muted" as="span">
                Operation + Suggested ≠ Parsed, diff
              </Typography>
              <AmountLabel
                amount={abs(subtract(add(total.operation, total.suggested), total.parsed))}
              />
            </Flow>
          )}
        </TooltipContent>
      </Tooltip>

      <Filler />

      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1.5 cursor-default">
            <Typography variant="muted" as="span" className="text-xs shrink-0">
              Balance expected
            </Typography>
            <AmountLabel amount={add(total.balance, total.suggested)} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <Flow align="center" gap={1}>
            <Typography variant="muted" as="span" className="text-xs shrink-0">
              Balance
            </Typography>
            <AmountLabel amount={total.balance} />
            <Typography variant="muted" as="span" className="text-xs shrink-0">
              + Suggested
            </Typography>
            <AmountLabel amount={total.suggested} />
          </Flow>
        </TooltipContent>
      </Tooltip>
      <Typography variant="muted" as="span" className="text-xs shrink-0">
        actual
      </Typography>
      <AmountLabel amount={total.actual} />
      <Button variant="ghost" size="icon-xs" onClick={onEditActual} disabled={loading}>
        <PencilIcon />
      </Button>
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <ValidIcon valid={total.valid} />
        </TooltipTrigger>
        <TooltipContent>
          {total.valid ? (
            <Typography variant="muted">Expected balance = Actual</Typography>
          ) : (
            <Flow align="center" gap={1}>
              <Typography variant="muted" as="span">
                Expected balance ≠ Actual, diff
              </Typography>
              <AmountLabel
                amount={abs(subtract(add(total.balance, total.suggested), total.actual))}
              />
            </Flow>
          )}
        </TooltipContent>
      </Tooltip>
    </Flow>
  )
}
