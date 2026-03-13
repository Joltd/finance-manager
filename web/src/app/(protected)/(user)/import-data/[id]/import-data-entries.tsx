'use client'

import { useEffect } from 'react'
import { ArrowRight, CheckCircle2Icon, XCircleIcon } from 'lucide-react'
import { SeekDirection } from '@/store/common/seek'
import { useImportDataEntrySeekStore } from '@/store/import-data'
import { Seek } from '@/components/common/layout/seek'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'
import { Group } from '@/components/common/layout/group'
import { Typography } from '@/components/common/typography/typography'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { OperationIcon } from '@/components/common/icon/operation-icon'
import {
  ImportDataDay,
  ImportDataEntry,
  ImportDataOperation,
  ImportDataTotal,
} from '@/types/import-data'
import { OperationRecord } from '@/types/operation'

function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = today.getTime() - date.getTime()
  const day = 86_400_000
  if (diff === 0) return 'Today'
  if (diff === day) return 'Yesterday'
  const opts: Intl.DateTimeFormatOptions =
    date.getFullYear() === today.getFullYear()
      ? { weekday: 'short', month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' }
  return date.toLocaleDateString('en', opts)
}

function DayTotals({ totals }: { totals: ImportDataTotal[] }) {
  if (!totals.length) return null
  return (
    <Flow align="center" gap={2}>
      {totals.map((t) => (
        <Stack key={t.currency} orientation="horizontal" align="center" gap={1}>
          <AmountLabel amount={t.actual} />
          {t.valid ? (
            <CheckCircle2Icon className="size-3 text-green-500" />
          ) : (
            <XCircleIcon className="size-3 text-destructive" />
          )}
        </Stack>
      ))}
    </Flow>
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

function ImportEntryRow({ entry }: { entry: ImportDataEntry }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        {entry.operationVisible && entry.operation ? (
          <OperationCard operation={entry.operation} />
        ) : (
          <EmptySlot />
        )}
      </div>
      <div>
        {entry.parsedVisible && entry.parsed ? <ParsedCard parsed={entry.parsed} /> : <EmptySlot />}
      </div>
    </div>
  )
}

function ImportDayGroup({ day }: { day: ImportDataDay }) {
  return (
    <Group
      title={
        <Stack orientation="horizontal" align="center" gap={3}>
          <span>{formatGroupDate(day.date)}</span>
          <DayTotals totals={day.totals} />
          {day.valid ? (
            <CheckCircle2Icon className="size-3.5 text-green-500 shrink-0" />
          ) : (
            <XCircleIcon className="size-3.5 text-destructive shrink-0" />
          )}
        </Stack>
      }
    >
      <Stack gap={2} className="py-1">
        {day.entries.map((entry, i) => (
          <ImportEntryRow key={entry.id ?? i} entry={entry} />
        ))}
      </Stack>
    </Group>
  )
}

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
    void seek(SeekDirection.BACKWARD)
  }, [id, setPathParams, seek])

  return (
    <Seek
      seek={seek}
      loading={loading}
      exhausted={exhausted}
      className="flex-1 min-h-0 px-4 md:px-6 py-2"
    >
      {data.map((day) => (
        <ImportDayGroup key={day.date} day={day} />
      ))}
    </Seek>
  )
}