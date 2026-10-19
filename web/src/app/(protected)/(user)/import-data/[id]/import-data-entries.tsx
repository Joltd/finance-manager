'use client'

import { useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { AlertCircleIcon, ArrowRightIcon, Clock3Icon } from 'lucide-react'
import { importDataChannels } from '@/api/import-data'
import { OperationIcon } from '@/components/common/icon/operation-icon'
import { Group } from '@/components/common/layout/group'
import { Seek } from '@/components/common/layout/seek'
import { Stack } from '@/components/common/layout/stack'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Typography } from '@/components/common/typography/typography'
import { useSse } from '@/hooks/use-sse'
import { cn, formatDateCommon } from '@/lib/utils'
import { useImportDataEntrySeekStore, useImportDataStore } from '@/store/import-data'
import { AccountReference } from '@/types/account'
import { ImportDataEntry, ImportDataParsingStatus } from '@/types/import-data'
import { ImportDataAmounts } from './import-data-amounts'

export function ImportDataEntries({ id }: { id: string }) {
  const {
    data,
    error,
    loadingForward,
    loadingBackward,
    loadingLoad,
    exhaustedForward,
    exhaustedBackward,
    initialized,
    seekForward,
    seekBackward,
    resetData,
    setPathParams,
    setPointer,
    load,
  } = useImportDataEntrySeekStore()
  const { data: importData } = useImportDataStore()

  useEffect(() => {
    resetData()
    setPathParams({ id })
  }, [id, resetData, setPathParams])

  useEffect(() => {
    if (importData?.id !== id) return
    setPointer(format(subDays(importData.dateRange?.from ?? new Date(), 1), 'yyyy-MM-dd'))
  }, [id, importData?.id, importData?.dateRange?.from, setPointer])

  useSse<string[]>(importDataChannels.entry(id), (dates) => void load(dates), {
    debounceMs: 400,
    merge: (current, next) => current.concat(next),
  })

  return (
    <Seek
      seekForward={seekForward}
      seekBackward={seekBackward}
      error={error}
      loadingForward={loadingForward}
      loadingBackward={loadingBackward}
      exhaustedForward={exhaustedForward}
      exhaustedBackward={exhaustedBackward}
      initialized={initialized}
      loadingLoad={loadingLoad}
      reverse
    >
      {[...data].reverse().map((day) => (
        <Group key={day.date} title={formatDateCommon(day.date)}>
          {day.entries.map((item, index) => (
            <ImportDataRow
              key={item.entry?.id ?? item.operation?.id ?? index}
              item={item}
              mainAccountId={importData?.account.id}
            />
          ))}
          <ImportDataAmounts
            label={
              <Typography as="span" variant="small">
                Day total
              </Typography>
            }
            amounts={day.totals.map((total) => total.parsed)}
            className="pt-1 pb-3 pr-1"
          />
        </Group>
      ))}
    </Seek>
  )
}

export function ImportDataRow({
  item,
  mainAccountId,
}: {
  item: ImportDataEntry
  mainAccountId?: string
}) {
  const source = item.operation ?? item.entry
  if (!source) return null

  const counterpart = resolveCounterpart(mainAccountId, source.accountFrom, source.accountTo)
  const showBothAmounts =
    source.amountFrom &&
    source.amountTo &&
    (source.amountFrom.value !== source.amountTo.value ||
      source.amountFrom.currency !== source.amountTo.currency)
  return (
    <Stack
      orientation="horizontal"
      align="center"
      gap={3}
      className={cn(
        'min-w-0 border-l-[3px] py-2.5 pr-1 pl-2',
        rowStateClass[resolveRowState(item)],
      )}
    >
      {source.type ? (
        <OperationIcon type={source.type} size={16} colored className="shrink-0" />
      ) : (
        <AlertCircleIcon className="size-4 shrink-0 text-muted-foreground" />
      )}

      <Stack orientation="horizontal" align="center" gap={2} className="min-w-0 flex-1">
        <Typography as="span" variant="muted" className="truncate text-xs">
          {counterpart}
        </Typography>
      </Stack>

      <Stack orientation="horizontal" align="center" justify="end" gap={1} className="shrink-0">
        <AmountLabel amount={source.amountFrom} />
        {showBothAmounts && (
          <>
            <ArrowRightIcon className="size-3 text-muted-foreground" />
            <AmountLabel amount={source.amountTo} />
          </>
        )}
      </Stack>
    </Stack>
  )
}

type ImportDataRowState = 'operation' | 'imported' | 'linked'

function resolveRowState(item: ImportDataEntry): ImportDataRowState {
  if (item.operation && item.entry) return 'linked'
  if (item.operation) return 'operation'
  return 'imported'
}

const rowStateClass: Record<ImportDataRowState, string> = {
  operation: 'border-l-transparent',
  imported:
    'border-dashed border-l-emerald-500 bg-emerald-50 dark:border-l-emerald-400 dark:bg-emerald-950/40',
  linked: 'border-l-blue-500 dark:border-l-blue-400',
}

export function resolveCounterpart(
  mainAccountId: string | undefined,
  accountFrom: AccountReference | undefined,
  accountTo: AccountReference | undefined,
): string {
  if (accountFrom?.id === mainAccountId) return accountTo?.name ?? 'Unknown account'
  if (accountTo?.id === mainAccountId) return accountFrom?.name ?? 'Unknown account'
  if (accountFrom && accountTo) return `${accountFrom.name} → ${accountTo.name}`
  return accountFrom?.name ?? accountTo?.name ?? 'Unknown account'
}

export function ImportDataStatusPlaceholder({
  status,
  message,
}: {
  status: ImportDataParsingStatus
  message?: string
}) {
  const failed = status === ImportDataParsingStatus.FAILED
  return (
    <Stack align="center" justify="center" gap={3} className="flex-1 p-8 text-center">
      {failed ? (
        <AlertCircleIcon className="size-10 text-destructive" />
      ) : (
        <Clock3Icon className="size-10 text-amber-500" />
      )}
      <Typography variant="large">{failed ? 'Import failed' : 'Import in progress'}</Typography>
      <Typography variant="muted" className="max-w-md">
        {message ?? (failed ? 'The import could not be processed.' : `Current stage: ${status.toLowerCase()}`)}
      </Typography>
    </Stack>
  )
}
