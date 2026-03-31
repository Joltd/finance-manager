'use client'

import React, { useEffect, useState } from 'react'
import { addDays, format } from 'date-fns'
import { Check, Link2, Link2Off, Loader2Icon, X, XCircleIcon } from 'lucide-react'
import { useImportDataEntrySeekStore, useImportDataStore } from '@/store/import-data'
import { Seek } from '@/components/common/layout/seek'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'
import { Group } from '@/components/common/layout/group'
import { Typography } from '@/components/common/typography/typography'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { ImportDataEntry, ImportDataOperation, ImportDataParsingStatus } from '@/types/import-data'
import { Operation } from '@/types/operation'
import { abs, add, subtract } from '@/types/common/amount'
import { ValidIcon } from '@/components/common/icon/valid-icon'
import { cn, formatDateCommon } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { ImportDataEntrySheet, openImportDataEntrySheet } from './import-data-entry-sheet'
import { ImportDataEntryCard } from './import-data-entry-card'
import { useImportDataActions } from './import-data-actions'

interface ImportDataEntriesProps {
  id: string
}

export function ImportDataEntries({ id }: ImportDataEntriesProps) {
  const {
    data,
    loadingForward,
    loadingBackward,
    loadingRefresh,
    exhaustedForward,
    exhaustedBackward,
    setPointer,
    seekForward,
    seekBackward,
    setPathParams,
    error,
  } = useImportDataEntrySeekStore()
  const { data: importData } = useImportDataStore()
  const mainAccountId = importData?.account.id
  const actions = useImportDataActions()

  const [linkingEntry, setLinkingEntry] = useState<ImportDataEntry | null>(null)

  useEffect(() => {
    setPointer(format(addDays(importData?.dateRange?.from ?? new Date(), 1), 'yyyy-MM-dd'))
  }, [])

  useEffect(() => {
    setPathParams({ id })
  }, [id, setPathParams])

  const handleLinkTarget = (targetEntry: ImportDataEntry) => {
    if (!linkingEntry?.operation?.id || !targetEntry.id) return
    actions
      .linkById(id, targetEntry.id, linkingEntry.operation.id)
      .then(() => setLinkingEntry(null))
  }

  const handleUnlink = (entryId: string) => actions.unlink(id, [entryId])

  const handleApprove = (entryId: string) => actions.approve(id, [entryId])

  return (
    <div className="relative flex-1 min-h-0">
      <ImportDataEntrySheet />
      {loadingRefresh && (
        <Progress className="absolute top-0 inset-x-0 z-20 rounded-none bg-transparent h-0.5" />
      )}
      <Seek
        seekForward={seekForward}
        seekBackward={seekBackward}
        error={error}
        loadingForward={loadingForward}
        loadingBackward={loadingBackward}
        exhaustedForward={exhaustedForward}
        exhaustedBackward={exhaustedBackward}
        className="h-full"
      >
        {data.map((day) => (
          <Group
            key={day.date}
            title={formatDateCommon(day.date)}
            actions={(() => {
              const hasUnprocessed = day.entries.some((e) => !e.operation)
              const validState = hasUnprocessed ? null : day.valid

              const approvableIds = day.entries
                .filter((e) => !e.operation && e.suggestions.some((s) => s.selected))
                .map((e) => e.id)
                .filter((eid): eid is string => !!eid)

              return (
                <>
                  <Tooltip disableHoverableContent>
                    <TooltipTrigger asChild>
                      <ValidIcon valid={validState} />
                    </TooltipTrigger>
                    <TooltipContent>
                      {validState === null
                        ? 'Some entries have no linked operation yet'
                        : validState
                          ? 'All totals for this day are valid'
                          : 'Some totals for this day are invalid'}
                    </TooltipContent>
                  </Tooltip>
                  {approvableIds.length > 0 && (
                    <Tooltip disableHoverableContent>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="opacity-0 w-5 h-5 group-hover/group:opacity-100 transition-opacity shrink-0"
                          disabled={actions.loading}
                          onClick={(e) => {
                            e.stopPropagation()
                            void actions.approve(id, approvableIds)
                          }}
                        >
                          <Check className="w-3! h-3!" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Approve all ({approvableIds.length})</TooltipContent>
                    </Tooltip>
                  )}
                </>
              )
            })()}
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
                          amount={abs(
                            subtract(add(total.operation, total.suggested), total.parsed),
                          )}
                        />
                      </Flow>
                    )}
                  </TooltipContent>
                </Tooltip>
              </Flow>
            ))}
            <Stack gap={2}>
              {day.entries.map((entry, i) => (
                <ImportEntryRow
                  key={entry.id ?? i}
                  entry={entry}
                  mainAccountId={mainAccountId}
                  linkingEntry={linkingEntry}
                  loading={actions.loading}
                  onStartLink={setLinkingEntry}
                  onLinkTarget={handleLinkTarget}
                  onUnlink={handleUnlink}
                  onApprove={handleApprove}
                />
              ))}
            </Stack>
          </Group>
        ))}
      </Seek>

      {linkingEntry && (
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center items-start pt-4 pb-20 bg-linear-to-b from-black/50 to-transparent pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <Typography variant="small" className="text-white">
              Select a parsed entry to link to
            </Typography>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:text-white/80 hover:bg-white/10"
              onClick={() => setLinkingEntry(null)}
            >
              <X />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ImportEntryRow({
  entry,
  mainAccountId,
  linkingEntry,
  loading,
  onStartLink,
  onLinkTarget,
  onUnlink,
  onApprove,
}: {
  entry: ImportDataEntry
  mainAccountId?: string
  linkingEntry: ImportDataEntry | null
  loading: boolean
  onStartLink: (entry: ImportDataEntry) => void
  onLinkTarget: (entry: ImportDataEntry) => void
  onUnlink: (entryId: string) => void
  onApprove: (entryId: string) => void
}) {
  const selectedSuggestion = !entry.operation
    ? entry.suggestions.find((s) => s.selected)
    : undefined

  const showUnlink = !!entry.operation && !!entry.parsed
  const showApprove = !entry.operation && !!entry.parsed && !!selectedSuggestion
  const showLink = !!entry.operation && !entry.parsed
  const hasActions = showUnlink || showApprove || showLink

  const isLinkingMode = !!linkingEntry
  const isLinkSource = isLinkingMode && linkingEntry?.operation?.id === entry.operation?.id
  const isLinkTarget = isLinkingMode && !!entry.parsed && !entry.operation
  const isIrrelevant = isLinkingMode && !isLinkSource && !isLinkTarget

  const leftAction =
    hasActions && !isLinkingMode && !loading ? (
      showUnlink ? (
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                if (entry.id) onUnlink(entry.id)
              }}
            >
              <Link2Off />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Unlink</TooltipContent>
        </Tooltip>
      ) : showApprove ? (
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                if (entry.id) onApprove(entry.id)
              }}
            >
              <Check />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Approve</TooltipContent>
        </Tooltip>
      ) : showLink ? (
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onStartLink(entry)
              }}
            >
              <Link2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Link</TooltipContent>
        </Tooltip>
      ) : undefined
    ) : undefined

  const rightAction = isLinkTarget ? (
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onLinkTarget(entry)
          }}
        >
          <Link2 />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Link here</TooltipContent>
    </Tooltip>
  ) : undefined

  return (
    <div
      className={cn(
        'relative grid grid-cols-2 gap-2 transition-opacity',
        !isLinkingMode && !loading && 'cursor-pointer',
        (isIrrelevant || loading) && 'opacity-35 pointer-events-none',
      )}
      onClick={!isLinkingMode && !loading ? () => openImportDataEntrySheet(entry) : undefined}
    >
      {entry.operation ? (
        <OperationEntryCard
          operation={entry.operation}
          mainAccountId={mainAccountId}
          className={isLinkSource ? 'border-2 border-primary' : undefined}
          action={leftAction}
        />
      ) : selectedSuggestion ? (
        <SuggestionEntryCard
          suggestion={selectedSuggestion}
          mainAccountId={mainAccountId}
          action={leftAction}
        />
      ) : (
        <EmptySlot />
      )}
      {entry.parsed ? (
        <ParsedEntryCard
          parsed={entry.parsed}
          mainAccountId={mainAccountId}
          action={rightAction}
          showAction={isLinkTarget}
        />
      ) : (
        <EmptySlot />
      )}
    </div>
  )
}

function OperationEntryCard({
  operation,
  mainAccountId,
  className,
  action,
}: {
  operation: Operation
  mainAccountId?: string
  className?: string
  action?: React.ReactNode
}) {
  return (
    <ImportDataEntryCard
      type={operation.type}
      amountFrom={operation.amountFrom}
      amountTo={operation.amountTo}
      accountFrom={operation.accountFrom}
      accountTo={operation.accountTo}
      description={operation.description}
      mainAccountId={mainAccountId}
      variant="operation"
      action={action}
      className={className}
    />
  )
}

function SuggestionEntryCard({
  suggestion,
  mainAccountId,
  action,
}: {
  suggestion: ImportDataOperation
  mainAccountId?: string
  action?: React.ReactNode
}) {
  return (
    <ImportDataEntryCard
      type={suggestion.type}
      amountFrom={suggestion.amountFrom}
      amountTo={suggestion.amountTo}
      accountFrom={suggestion.accountFrom}
      accountTo={suggestion.accountTo}
      description={suggestion.description}
      mainAccountId={mainAccountId}
      variant="suggestion"
      action={action}
    />
  )
}

function ParsedEntryCard({
  parsed,
  mainAccountId,
  action,
  showAction,
}: {
  parsed: ImportDataOperation
  mainAccountId?: string
  action?: React.ReactNode
  showAction?: boolean
}) {
  return (
    <ImportDataEntryCard
      type={parsed.type}
      amountFrom={parsed.amountFrom}
      amountTo={parsed.amountTo}
      accountFrom={parsed.accountFrom}
      accountTo={parsed.accountTo}
      description={parsed.description}
      raw={parsed.raw}
      mainAccountId={mainAccountId}
      variant="parsed"
      action={action}
      showAction={showAction}
    />
  )
}

function EmptySlot() {
  return <div className="h-full min-h-10 rounded-md border border-dashed border-muted" />
}

export interface ImportDataInProgressPlaceholderProps {
  status: ImportDataParsingStatus
}

export function ImportDataInProgressPlaceholder({ status }: ImportDataInProgressPlaceholderProps) {
  return (
    <Stack align="center" justify="center" gap={3} className="flex-1 p-8 text-center">
      <Loader2Icon className="size-12 text-amber-500 animate-spin opacity-80" />
      <Typography variant="large">{status}</Typography>
      <Typography variant="muted" className="max-w-md">
        Parsing is in progress, data will be ready soon
      </Typography>
    </Stack>
  )
}

export interface ImportDataFailedPlaceholderProps {
  message?: string
}

export function ImportDataFailedPlaceholder({ message }: ImportDataFailedPlaceholderProps) {
  return (
    <Stack align="center" justify="center" gap={3} className="flex-1 p-8 text-center">
      <XCircleIcon className="size-12 text-destructive opacity-80" />
      <Typography variant="large" className="text-destructive">
        Parsing failed
      </Typography>
      {message && (
        <Typography variant="muted" className="max-w-md">
          {message}
        </Typography>
      )}
    </Stack>
  )
}
