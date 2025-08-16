import { ImportDataEntry, ImportDataOperation } from '@/types/import-data'
import { Account } from '@/types/account'
import { cn } from '@/lib/utils'
import { ImportDataOperationLabel } from '@/components/import-data/import-data-operation-label'
import { Link2Icon } from 'lucide-react'
import { Pointable } from '@/components/common/pointable'
import { memo, MouseEvent } from 'react'
import {
  useImportDataOperationSelectionStore,
  useImportDataEntrySelectionStore,
} from '@/store/import-data'
import { Operation } from '@/types/operation'
import { useImportDataOperationSheetStore } from '@/components/import-data/import-data-operation-sheet'
import { RatingIcon } from '@/components/common/rating-icon'

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

function _ImportDataEntryBrowserRow({
  entry,
  linked,
  operation,
  parsed,
  suggestions,
  relatedAccount,
  visible,
  selected,
  disabled,
}: ImportDataEntryBrowserRowProps) {
  const { openWith } = useImportDataOperationSheetStore('openWith')
  const { select, clear } = useImportDataEntrySelectionStore('select', 'clear')

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

  return (
    <Pointable className={rowStyle} selected={selected} disabled={disabled} onClick={handleClick}>
      <div
        className={cn(
          'flex gap-2 col-start-1 truncate py-1',
          !!suggestions.length && !operation && 'text-info',
        )}
      >
        {actualOperation ? (
          <ImportDataOperationLabel
            {...actualOperation}
            relatedAccount={relatedAccount}
            className="min-w-0 shrink overflow-hidden"
          />
        ) : (
          <div className="text-muted">New...</div>
        )}
        {!!suggestions.length && !operation && (
          <>
            <div className="grow" />
          </>
        )}
      </div>
      <div className="col-start-2 justify-self-center">
        {linked ? (
          <Link2Icon className="text-green-500" />
        ) : suggested ? (
          <RatingIcon score={suggested.distance} rating={suggested.rating} />
        ) : null}
      </div>
      {parsed && (
        <div className="col-start-3 truncate py-1">
          <ImportDataOperationLabel
            {...parsed}
            relatedAccount={relatedAccount}
            className={cn('min-w-0 shrink overflow-hidden', !visible && 'line-through')}
          />
        </div>
      )}
    </Pointable>
  )
}

export const ImportDataEntryBrowserRow = memo(_ImportDataEntryBrowserRow)

export interface ImportDataEntryBrowserOperationRowProps {
  operation: Operation
  visible?: boolean
  relatedAccount: Account
  selected: boolean
  disabled?: boolean
}

function _ImportDataEntryBrowserOperationRow({
  operation,
  visible,
  relatedAccount,
  selected,
  disabled,
}: ImportDataEntryBrowserOperationRowProps) {
  const { select, clear } = useImportDataOperationSelectionStore('select', 'clear')

  const handleClick = (event: MouseEvent) => {
    if (!event.ctrlKey) {
      // openWith()
      clear()
    } else {
      select(operation)
    }
  }

  return (
    <div className={rowStyle}>
      <Pointable
        className="flex gap-2 col-start-1 truncate py-1"
        selected={selected}
        disabled={disabled}
        onClick={handleClick}
      >
        <ImportDataOperationLabel
          {...operation}
          relatedAccount={relatedAccount}
          className={cn('min-w-0 shrink overflow-hidden', !visible && 'line-through')}
        />
      </Pointable>
    </div>
  )
}

export const ImportDataEntryBrowserOperationRow = memo(_ImportDataEntryBrowserOperationRow)
