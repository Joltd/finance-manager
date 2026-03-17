'use client'

import { useEffect } from 'react'
import { useImportDataEntrySeekStore, useImportDataStore } from '@/store/import-data'
import { Seek } from '@/components/common/layout/seek'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'
import { Group } from '@/components/common/layout/group'
import { Typography } from '@/components/common/typography/typography'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ImportDataEntry, ImportDataOperation } from '@/types/import-data'
import { Operation } from '@/types/operation'
import { abs, add, subtract } from '@/types/common/amount'
import { ValidIcon } from '@/components/common/icon/valid-icon'
import { formatDateCommon } from '@/lib/utils'
import { openImportDataEntrySheet } from './import-data-entry-sheet'
import { ImportEntryCard } from './import-entry-card'

interface ImportDataEntriesProps {
  id: string
}

export function ImportDataEntries({ id }: ImportDataEntriesProps) {
  const { data, loading, exhausted, setPointer, seek, setPathParams } =
    useImportDataEntrySeekStore()
  const { data: importData } = useImportDataStore()
  const mainAccountId = importData?.account.id

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
              <ImportEntryRow key={entry.id ?? i} entry={entry} mainAccountId={mainAccountId} />
            ))}
          </Stack>
        </Group>
      ))}
    </Seek>
  )
}

function ImportEntryRow({
  entry,
  mainAccountId,
}: {
  entry: ImportDataEntry
  mainAccountId?: string
}) {
  const selectedSuggestion = !entry.operation
    ? entry.suggestions.find((s) => s.selected)
    : undefined

  return (
    <div
      className="grid grid-cols-2 gap-2 cursor-pointer"
      onClick={() => openImportDataEntrySheet(entry)}
    >
      {entry.operation ? (
        <OperationEntryCard operation={entry.operation} mainAccountId={mainAccountId} />
      ) : selectedSuggestion ? (
        <SuggestionEntryCard suggestion={selectedSuggestion} mainAccountId={mainAccountId} />
      ) : (
        <EmptySlot />
      )}
      {entry.parsed ? (
        <ParsedEntryCard parsed={entry.parsed} mainAccountId={mainAccountId} />
      ) : (
        <EmptySlot />
      )}
    </div>
  )
}

function OperationEntryCard({
  operation,
  mainAccountId,
}: {
  operation: Operation
  mainAccountId?: string
}) {
  return (
    <ImportEntryCard
      type={operation.type}
      amountFrom={operation.amountFrom}
      amountTo={operation.amountTo}
      accountFrom={operation.accountFrom}
      accountTo={operation.accountTo}
      description={operation.description}
      mainAccountId={mainAccountId}
      variant="operation"
    />
  )
}

function SuggestionEntryCard({
  suggestion,
  mainAccountId,
}: {
  suggestion: ImportDataOperation
  mainAccountId?: string
}) {
  return (
    <ImportEntryCard
      type={suggestion.type}
      amountFrom={suggestion.amountFrom}
      amountTo={suggestion.amountTo}
      accountFrom={suggestion.accountFrom}
      accountTo={suggestion.accountTo}
      description={suggestion.description}
      mainAccountId={mainAccountId}
      variant="suggestion"
    />
  )
}

function ParsedEntryCard({
  parsed,
  mainAccountId,
}: {
  parsed: ImportDataOperation
  mainAccountId?: string
}) {
  return (
    <ImportEntryCard
      type={parsed.type}
      amountFrom={parsed.amountFrom}
      amountTo={parsed.amountTo}
      accountFrom={parsed.accountFrom}
      accountTo={parsed.accountTo}
      description={parsed.description}
      mainAccountId={mainAccountId}
      variant="parsed"
    />
  )
}

function EmptySlot() {
  return <div className="h-full min-h-10 rounded-md border border-dashed border-muted" />
}
