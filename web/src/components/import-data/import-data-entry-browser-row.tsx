import { ImportDataOperation } from '@/types/import-data'
import { Account } from '@/types/account'
import { cn } from '@/lib/utils'
import { ImportDataOperationLabel } from '@/components/import-data/import-data-operation-label'
import { Link2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Pointable } from '@/components/common/pointable'
import { FC, memo, MouseEvent } from 'react'
import {
  useImportDataOperationSelectionStore,
  useImportDataParsedSelectionStore,
} from '@/store/import-data'
import { Operation } from '@/types/operation'

export interface ImportDataEntryBrowserRowProps {
  importDataId: string
  id?: string
  linked?: boolean
  operation?: Operation
  operationVisible?: boolean
  parsed?: ImportDataOperation
  parsedVisible?: boolean
  suggestions: ImportDataOperation[]
  relatedAccount: Account
  operationSelected: boolean
  parsedSelected: boolean
}

export const ImportDataEntryBrowserRow: FC<ImportDataEntryBrowserRowProps> = memo(
  ({
    importDataId,
    id,
    linked,
    operation,
    operationVisible,
    parsed,
    parsedVisible,
    suggestions,
    relatedAccount,
    operationSelected,
    parsedSelected,
  }) => {
    // const { open } = useImportDataOperationSheetStore()
    const operationSelection = useImportDataOperationSelectionStore('select', 'clear')
    const parsedSelection = useImportDataParsedSelectionStore('select', 'clear')

    const selectedSuggestion = suggestions?.find((it) => it.selected)
    const actualOperation = operation || selectedSuggestion

    const handleOperationClick = (event: MouseEvent) => {
      // open(entry.operation, entry.suggestions)
      if (!event.ctrlKey) {
        operationSelection.clear()
        parsedSelection.clear()
      } else if (operation) {
        event.stopPropagation()
        operationSelection.select(operation)
      }
    }

    const handleParsedClick = (event: MouseEvent) => {
      if (!event.ctrlKey) {
        operationSelection.clear()
        parsedSelection.clear()
      } else if (parsed) {
        event.stopPropagation()
        parsedSelection.select(parsed)
      }
    }

    return (
      <div className="grid items-center grid-cols-[minmax(0,_1fr)_64px_minmax(0,_1fr)] h-10">
        <Pointable
          className="flex gap-2 col-start-1 truncate py-1"
          selected={operationSelected}
          onClick={handleOperationClick}
        >
          {actualOperation ? (
            <ImportDataOperationLabel
              {...actualOperation}
              relatedAccount={relatedAccount}
              className={cn('min-w-0 shrink overflow-hidden', !operationVisible && 'line-through')}
            />
          ) : (
            <div className="text-muted">New...</div>
          )}
          <div className="flex items-center justify-end grow">
            {!!suggestions.length && (
              <Badge variant="outline" className=" min-h-0">
                {suggestions.length} suggested
              </Badge>
            )}
          </div>
        </Pointable>
        {linked ? (
          <Link2Icon className="col-start-2 justify-self-center text-green-500" />
        ) : (
          <div />
        )}
        {parsed && (
          <Pointable
            className="col-start-3 truncate py-1"
            selected={parsedSelected}
            onClick={handleParsedClick}
          >
            <ImportDataOperationLabel
              {...parsed}
              relatedAccount={relatedAccount}
              className={cn('min-w-0 shrink overflow-hidden', !parsedVisible && 'line-through')}
            />
          </Pointable>
        )}
      </div>
    )
  },
)
