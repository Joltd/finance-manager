import { ImportDataEntry, ImportDataOperation } from '@/types/import-data'
import { Account } from '@/types/account'
import { cn } from '@/lib/utils'
import { ImportDataOperationLabel } from '@/components/import-data/import-data-operation-label'
import { CheckIcon, GripVerticalIcon, LinkIcon, UnlinkIcon } from 'lucide-react'
import { Pointable } from '@/components/common/pointable'
import { FC, memo, MouseEvent } from 'react'
import {
  useImportDataOperationSelectionStore,
  useImportDataEntrySelectionStore,
} from '@/store/import-data'
import { Operation } from '@/types/operation'
import { useImportDataOperationSheetStore } from '@/components/import-data/import-data-operation-sheet'
import { RatingIcon } from '@/components/common/rating-icon'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useApproveAction, useUnlinkAction } from '@/components/import-data/actions'
import { EmbeddingLabel } from '@/components/common/embedding-label'
import { Button } from '@/components/ui/button'
import { hoveredIconClass, hoverGroup, mainIconClass } from '@/components/common/hoverable-icon'

const rowStyle = 'grid items-center grid-cols-[minmax(0,_1fr)_64px_minmax(0,_1fr)] my-1'

export interface ImportDataEntryBrowserRowProps {
  entry: ImportDataEntry
  linked: boolean
  operation?: Operation
  parsed?: ImportDataOperation
  suggestions: ImportDataOperation[]
  relatedAccount: Account
  visible?: boolean
  selected: boolean
  disabled?: boolean
}

export const ImportDataEntryBrowserRow = memo(
  ({
    entry,
    linked,
    operation,
    parsed,
    suggestions,
    relatedAccount,
    visible,
    selected,
    disabled,
  }: ImportDataEntryBrowserRowProps) => {
    const { openWith } = useImportDataOperationSheetStore('openWith')
    const { select, clear } = useImportDataEntrySelectionStore('select', 'clear')
    const { setNodeRef, isOver } = useDroppable({
      id: entry.id!!,
      disabled,
    })
    const unlink = useUnlinkAction()
    const approve = useApproveAction()

    const suggested = suggestions?.find((it) => it.selected)
    const actualOperation = operation || suggested

    const handleClick = (event: MouseEvent) => {
      if (!event.ctrlKey) {
        clear()
        openWith(entry)
      } else {
        select(entry)
      }
    }

    const handleUnlink = () => {
      unlink.perform(entry.id)
    }

    const handleApprove = () => {
      approve.perform(entry.id)
    }

    return (
      <div className={rowStyle}>
        <Pointable
          ref={!actualOperation ? setNodeRef : undefined}
          disabled={disabled}
          onClick={handleClick}
          className={cn(
            'flex gap-2 col-start-1 truncate py-1 h-8',
            !!suggestions.length && !operation && 'text-info',
            isOver && 'outline-2 outline-dotted outline-accent-foreground rounded-sm',
          )}
        >
          {actualOperation ? (
            <ImportDataOperationLabel
              {...actualOperation}
              relatedAccount={relatedAccount}
              className={cn('min-w-0 shrink overflow-hidden', !visible && 'line-through')}
            />
          ) : (
            <div className="text-muted">New...</div>
          )}
        </Pointable>
        <div className="col-start-2 justify-self-center">
          {linked ? (
            <Button variant="ghost" size="sm" onClick={handleUnlink} className={hoverGroup}>
              <LinkIcon className={cn('text-green-500', mainIconClass)} />
              <UnlinkIcon className={cn('text-green-500', hoveredIconClass)} />
            </Button>
          ) : suggested ? (
            <Button variant="ghost" size="sm" onClick={handleApprove} className={hoverGroup}>
              <RatingIcon
                score={suggested.distance}
                rating={suggested.rating}
                className={mainIconClass}
              />
              <CheckIcon className={cn('text-green-500', hoveredIconClass)} />
            </Button>
          ) : null}
        </div>
        {parsed && (
          <Pointable
            selected={selected}
            disabled={disabled}
            onClick={handleClick}
            className="col-start-3 truncate py-1"
          >
            <EmbeddingLabel embedding={parsed.hint} hideCopy />
            {/*<ImportDataOperationLabel*/}
            {/*  {...parsed}*/}
            {/*  relatedAccount={relatedAccount}*/}
            {/*  className={cn('min-w-0 shrink overflow-hidden', !visible && 'line-through')}*/}
            {/*/>*/}
          </Pointable>
        )}
      </div>
    )
  },
)

export interface ImportDataEntryBrowserOperationRowProps {
  operation: Operation
  visible?: boolean
  relatedAccount: Account
  selected: boolean
  disabled?: boolean
}

export const ImportDataEntryBrowserOperationRow: FC<ImportDataEntryBrowserOperationRowProps> = memo(
  ({
    operation,
    visible,
    relatedAccount,
    selected,
    disabled,
  }: ImportDataEntryBrowserOperationRowProps) => {
    const { openWith } = useImportDataOperationSheetStore('openWith')
    const { select, clear } = useImportDataOperationSelectionStore('select', 'clear')
    const { setNodeRef, setActivatorNodeRef, listeners, attributes, isDragging, transform } =
      useDraggable({
        id: operation.id!!,
        disabled,
      })

    const handleClick = (event: MouseEvent) => {
      if (!event.ctrlKey) {
        openWith({ operation, linked: false, suggestions: [] })
        clear()
      } else {
        select(operation)
      }
    }

    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : undefined

    return (
      <div className={rowStyle}>
        <Pointable
          ref={setNodeRef}
          style={style}
          onClick={handleClick}
          className={cn('flex gap-2 col-start-1 truncate py-1', isDragging && 'opacity-50')}
          selected={selected}
          disabled={disabled}
        >
          <ImportDataOperationLabel
            {...operation}
            relatedAccount={relatedAccount}
            className={cn('min-w-0 shrink grow overflow-hidden', !visible && 'line-through')}
          />
        </Pointable>
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          className="col-start-2 justify-self-center"
        >
          <GripVerticalIcon />
        </div>
      </div>
    )
  },
)
