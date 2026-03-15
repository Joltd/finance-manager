'use client'

import { useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { useImportDataEntrySeekStore } from '@/store/import-data'
import { Seek } from '@/components/common/layout/seek'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'
import { Group } from '@/components/common/layout/group'
import { Typography } from '@/components/common/typography/typography'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { OperationIcon } from '@/components/common/icon/operation-icon'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ImportDataEntry, ImportDataOperation } from '@/types/import-data'
import { OperationRecord } from '@/types/operation'
import { abs, add, subtract } from '@/types/common/amount'
import { ValidIcon } from '@/components/common/icon/valid-icon'
import { formatDateCommon } from '@/lib/utils'

interface ImportDataEntriesProps {
  id: string
}

export function ImportDataEntries({ id }: ImportDataEntriesProps) {
  const { data, loading, exhausted, setPointer, seek, setPathParams } =
    useImportDataEntrySeekStore()

  useEffect(() => {
    setPointer(new Date().toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    setPathParams({ id })
  }, [id, setPathParams])

  return (
    <Seek seek={seek} loading={loading} exhausted={exhausted}>
      {data.map((day) => (
        <Group
          key={day.date}
          title={formatDateCommon(day.date)}
          icon={
            <Tooltip>
              <TooltipTrigger asChild>
                <ValidIcon valid={day.valid} />
              </TooltipTrigger>
              <TooltipContent>
                {day.valid
                  ? 'All totals for this day are valid'
                  : 'Some totals for this day are invalid'}
              </TooltipContent>
            </Tooltip>
          }
          className="mb-6"
        >
          {day.totals.map((total) => (
            <Flow key={total.currency} align="center">
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
            </Flow>
          ))}
          <Stack gap={2}>
            {day.entries.map((entry, i) => (
              <ImportEntryRow key={entry.id ?? i} entry={entry} />
            ))}
          </Stack>
        </Group>
      ))}
    </Seek>
  )
}

function ImportEntryRow({ entry }: { entry: ImportDataEntry }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {entry.operation ? <OperationCard operation={entry.operation} /> : <EmptySlot />}
      {entry.parsed ? <ParsedCard parsed={entry.parsed} /> : <EmptySlot />}
    </div>
  )
}

function OperationCard({ operation }: { operation: OperationRecord }) {
  const { type, amountFrom, accountFrom, amountTo, accountTo, description } = operation
  const showBothAmounts =
    amountFrom.value !== amountTo.value || amountFrom.currency !== amountTo.currency

  return (
    <Stack gap={1} className="h-full p-2.5 rounded-md border bg-background">
      <Stack orientation="horizontal" align="center" gap={2} className="min-w-0">
        <OperationIcon type={type} size={12} colored className="shrink-0" />
        <Stack orientation="horizontal" align="center" gap={1} className="min-w-0 flex-1">
          <Typography as="span" variant="small" className="truncate">
            {accountFrom.name}
          </Typography>
          <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
          <Typography as="span" variant="small" className="truncate text-muted-foreground">
            {accountTo.name}
          </Typography>
        </Stack>
      </Stack>

      <Flow align="center" gap={1}>
        <AmountLabel amount={amountFrom} />
        {showBothAmounts && <AmountLabel amount={amountTo} />}
      </Flow>

      {description && (
        <Typography variant="muted" className="truncate text-xs">
          {description}
        </Typography>
      )}
    </Stack>
  )
}

function ParsedCard({ parsed }: { parsed: ImportDataOperation }) {
  const { type, amountFrom, accountFrom, amountTo, accountTo, description } = parsed
  const showBothAmounts =
    amountFrom.value !== amountTo.value || amountFrom.currency !== amountTo.currency

  return (
    <Stack gap={1} className="h-full p-2.5 rounded-md border bg-muted/30">
      <Stack orientation="horizontal" align="center" gap={2} className="min-w-0">
        <OperationIcon type={type} size={12} colored className="shrink-0" />
        <Stack orientation="horizontal" align="center" gap={1} className="min-w-0 flex-1">
          {accountFrom ? (
            <Typography as="span" variant="small" className="truncate">
              {accountFrom.name}
            </Typography>
          ) : (
            <Typography as="span" variant="muted" className="truncate text-xs italic">
              unknown
            </Typography>
          )}
          <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
          {accountTo ? (
            <Typography as="span" variant="small" className="truncate text-muted-foreground">
              {accountTo.name}
            </Typography>
          ) : (
            <Typography as="span" variant="muted" className="truncate text-xs italic">
              unknown
            </Typography>
          )}
        </Stack>
      </Stack>

      <Flow align="center" gap={1}>
        <AmountLabel amount={amountFrom} />
        {showBothAmounts && <AmountLabel amount={amountTo} />}
      </Flow>

      {description && (
        <Typography variant="muted" className="truncate text-xs">
          {description}
        </Typography>
      )}
    </Stack>
  )
}

function EmptySlot() {
  return <div className="h-full min-h-10 rounded-md border border-dashed border-muted" />
}
