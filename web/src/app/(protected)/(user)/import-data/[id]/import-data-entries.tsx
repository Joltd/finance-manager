'use client'

import { useEffect } from 'react'
import { format, isSameYear, isToday, isYesterday, parseISO } from 'date-fns'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  ImportDataDay,
  ImportDataEntry,
  ImportDataOperation,
  ImportDataTotal,
} from '@/types/import-data'
import { OperationRecord } from '@/types/operation'
import { add } from '@/types/common/amount'

// ─── Date formatting ─────────────────────────────────────────────────────────

function formatGroupDate(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  if (isSameYear(date, new Date())) return format(date, 'EEE, MMM d')
  return format(date, 'MMM d, yyyy')
}

// ─── Valid icons ──────────────────────────────────────────────────────────────

function ValidIcon({ valid, tooltip }: { valid: boolean; tooltip: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {valid ? (
            <CheckCircle2Icon className="size-3 text-green-500 shrink-0 cursor-default" />
          ) : (
            <XCircleIcon className="size-3 text-destructive shrink-0 cursor-default" />
          )}
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function DayValidIcon({ valid }: { valid: boolean }) {
  return (
    <ValidIcon
      valid={valid}
      tooltip={valid ? 'All totals for this day are valid' : 'Some totals for this day are invalid'}
    />
  )
}

function TotalValidIcon({ valid }: { valid: boolean }) {
  return (
    <ValidIcon
      valid={valid}
      tooltip={
        valid ? 'Operation + Suggested = Parsed' : 'Mismatch: operation + suggested ≠ parsed'
      }
    />
  )
}

// ─── Day totals row ───────────────────────────────────────────────────────────

function DayTotalsRow({ totals }: { totals: ImportDataTotal[] }) {
  if (!totals.length) return null
  return (
    <div className="grid grid-cols-2 gap-2 pb-1.5">
      <div className="space-y-0.5">
        {totals.map((t) => (
          <Flow key={t.currency} align="center" gap={1}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 cursor-default">
                    <Typography variant="muted" as="span" className="text-xs">
                      Operation
                    </Typography>
                    <AmountLabel amount={add(t.operation, t.suggested)} />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="inline-flex items-center gap-1">
                    <AmountLabel amount={t.operation} />
                    <Typography variant="muted" as="span" className="text-xs">
                      + Suggested
                    </Typography>
                    <AmountLabel amount={t.suggested} />
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TotalValidIcon valid={t.valid} />
          </Flow>
        ))}
      </div>
      <div className="space-y-0.5">
        {totals.map((t) => (
          <Flow key={t.currency} align="center" gap={1}>
            <Typography variant="muted" as="span" className="text-xs">
              Parsed
            </Typography>
            <AmountLabel amount={t.parsed} />
          </Flow>
        ))}
      </div>
    </div>
  )
}

// ─── Entry cards ──────────────────────────────────────────────────────────────

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

// ─── Day group ────────────────────────────────────────────────────────────────

function ImportDayGroup({ day }: { day: ImportDataDay }) {
  return (
    <Group
      title={
        <Flow align="center" gap={2}>
          <Typography as="span" variant="small">
            {formatGroupDate(day.date)}
          </Typography>
          <DayValidIcon valid={day.valid} />
        </Flow>
      }
    >
      <DayTotalsRow totals={day.totals} />
      <Stack gap={2} className="py-1">
        {day.entries.map((entry, i) => (
          <ImportEntryRow key={entry.id ?? i} entry={entry} />
        ))}
      </Stack>
    </Group>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

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
    <Seek seek={seek} loading={loading} exhausted={exhausted} className="flex-1 min-h-0 px-6">
      {data.map((day) => (
        <ImportDayGroup key={day.date} day={day} />
      ))}
    </Seek>
  )
}
