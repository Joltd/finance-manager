'use client'

import { useEffect, useState } from 'react'
import { Check, Link2, Link2Off, X } from 'lucide-react'
import { useImportDataEntrySeekStore, useImportDataStore } from '@/store/import-data'
import { Seek } from '@/components/common/layout/seek'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'
import { Group } from '@/components/common/layout/group'
import { Typography } from '@/components/common/typography/typography'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { ImportDataEntry, ImportDataOperation } from '@/types/import-data'
import { Operation } from '@/types/operation'
import { abs, add, subtract } from '@/types/common/amount'
import { ValidIcon } from '@/components/common/icon/valid-icon'
import { cn, formatDateCommon } from '@/lib/utils'
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

  const [linkingEntry, setLinkingEntry] = useState<ImportDataEntry | null>(null)

  useEffect(() => {
    setPointer(new Date().toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    setPathParams({ id })
  }, [id, setPathParams])

  useEffect(() => {
    if (!linkingEntry) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLinkingEntry(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [linkingEntry])

  const handleLinkTarget = (_targetEntry: ImportDataEntry) => {
    // TODO: link linkingEntry!.operation with targetEntry.parsed
    setLinkingEntry(null)
  }

  return (
    <div className="relative flex-1 min-h-0">
      <Seek seek={seek} loading={loading} exhausted={exhausted} className="h-full">
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
                  onStartLink={setLinkingEntry}
                  onLinkTarget={handleLinkTarget}
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
  onStartLink,
  onLinkTarget,
}: {
  entry: ImportDataEntry
  mainAccountId?: string
  linkingEntry: ImportDataEntry | null
  onStartLink: (entry: ImportDataEntry) => void
  onLinkTarget: (entry: ImportDataEntry) => void
}) {
  const selectedSuggestion = !entry.operation
    ? entry.suggestions.find((s) => s.selected)
    : undefined

  const showUnlink = !!entry.operation && !!entry.parsed
  const showApprove = !entry.operation && !!entry.parsed && !!selectedSuggestion
  const showLink = !!entry.operation && !entry.parsed
  const hasActions = showUnlink || showApprove || showLink

  const isLinkingMode = !!linkingEntry
  const isLinkSource = linkingEntry === entry
  const isLinkTarget = isLinkingMode && !!entry.parsed && !entry.operation
  const isIrrelevant = isLinkingMode && !isLinkSource && !isLinkTarget

  return (
    <div
      className={cn(
        'relative group grid grid-cols-2 gap-2 overflow-hidden transition-opacity',
        !isLinkingMode && 'cursor-pointer',
        isIrrelevant && 'opacity-35 pointer-events-none',
      )}
      onClick={!isLinkingMode ? () => openImportDataEntrySheet(entry) : undefined}
    >
      {entry.operation ? (
        <OperationEntryCard
          operation={entry.operation}
          mainAccountId={mainAccountId}
          className={isLinkSource ? 'border-2 border-primary' : undefined}
        />
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

      {/* Quick actions — left column right edge, shown on hover when not in linking mode */}
      {hasActions && !isLinkingMode && (
        <div className="absolute inset-y-0 left-0 w-[calc(50%-0.25rem)] hidden group-hover:flex items-center justify-end pr-1 pl-3 bg-linear-to-l from-background via-background/95 to-transparent">
          {showUnlink && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                  <Link2Off />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Unlink</TooltipContent>
            </Tooltip>
          )}
          {showApprove && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                  <Check />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Approve</TooltipContent>
            </Tooltip>
          )}
          {showLink && (
            <Tooltip>
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
          )}
        </div>
      )}

      {/* Link target button — right column left edge, always visible for eligible entries in linking mode */}
      {isLinkTarget && (
        <div className="absolute inset-y-0 left-[calc(50%+0.25rem)] right-0 flex items-center justify-end pr-1 pl-3 bg-linear-to-r from-transparent via-background/95 to-background">
          <Tooltip>
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
        </div>
      )}
    </div>
  )
}

function OperationEntryCard({
  operation,
  mainAccountId,
  className,
}: {
  operation: Operation
  mainAccountId?: string
  className?: string
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
      className={className}
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
