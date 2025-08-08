import { DateLabel } from '@/components/common/date-label'
import { AlertCircleIcon, CheckCheck, EyeIcon, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AmountLabel } from '@/components/common/amount-label'
import { useEffect, useRef, MouseEvent, useCallback } from 'react'
import { ImportDataEntryBrowserRow } from '@/components/import-data/import-data-entry-browser-row'
import {
  useImportDataEntryListStore,
  useImportDataOperationSelectionStore,
  useImportDataEntrySelectionStore,
  useImportDataStore,
} from '@/store/import-data'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { ImportDataActionBar } from '@/components/import-data/import-data-action-bar'
import { EmptyLabel } from '@/components/common/empty-label'
import { ValidityIcon } from '@/components/common/validity-icon'
import { TextLabel } from '@/components/common/text-label'

export interface ImportDataOperationBrowserProps {}

export function ImportDataEntryBrowser({}: ImportDataOperationBrowserProps) {
  const importData = useImportDataStore('data')
  const importDataEntryList = useImportDataEntryListStore(
    'loading',
    'dataFetched',
    'error',
    'data',
    'queryParams',
  )
  const ref = useRef<HTMLDivElement>(null)

  const operationSelection = useImportDataOperationSelectionStore(
    'selected',
    'has',
    'select',
    'clear',
  )
  const entrySelection = useImportDataEntrySelectionStore('selected', 'has', 'select', 'clear')

  useEffect(() => {
    if (ref.current && !!importDataEntryList.queryParams?.length) {
      ref.current.scrollTo({ behavior: 'smooth', top: 0 })
    }
  }, [importDataEntryList.queryParams])

  const handleClickOutside = (event: MouseEvent) => {
    if (event.ctrlKey) {
      return
    }
    operationSelection.clear()
    entrySelection.clear()
  }

  return importDataEntryList.loading && !importDataEntryList.dataFetched ? (
    <Spinner className="m-6" />
  ) : importDataEntryList.error ? (
    <Alert variant="destructive" className="m-6">
      <AlertCircleIcon />
      <AlertTitle>{importDataEntryList.error}</AlertTitle>
    </Alert>
  ) : !importData.data || !importDataEntryList.data?.length ? (
    <EmptyLabel className="m-6" />
  ) : (
    <div ref={ref} className="flex flex-col relative overflow-y-auto m-6 mb-12 gap-12">
      {importDataEntryList.data?.map((group) => (
        <div key={group.date} className="flex flex-col gap-6" onClick={handleClickOutside}>
          <TextLabel variant="title">
            <ValidityIcon valid={group.valid} />
            <DateLabel date={group.date} />
          </TextLabel>
          {!!group.totals?.length && (
            <div className="flex flex-col bg-accent rounded-sm p-2">
              {group.totals.map((it, index) => (
                <div
                  key={index}
                  className={cn('grid items-center grid-cols-[minmax(0,_1fr)_64px_minmax(0,_1fr)]')}
                >
                  {it.operation ? <AmountLabel amount={it.operation} className="ml-4" /> : <div />}
                  {it.operation?.value !== it.parsed?.value ? (
                    <TriangleAlert className="text-yellow-500 justify-self-center" />
                  ) : (
                    <div />
                  )}
                  {it.parsed ? <AmountLabel amount={it.parsed} className="ml-6" /> : <div />}
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col px-0.5">
            {group.entries.map((entry, index) => (
              <ImportDataEntryBrowserRow
                key={index}
                importDataId={importData.data!!.id}
                id={entry.id}
                entry={entry}
                linked={entry.linked}
                operation={entry.operation}
                operationVisible={entry.operationVisible}
                parsed={entry.parsed}
                parsedVisible={entry.parsedVisible}
                suggestions={entry.suggestions}
                relatedAccount={importData.data!!.account}
                operationSelected={operationSelection.has(entry.operation)}
                parsedSelected={entrySelection.has(entry)}
              />
            ))}
          </div>
        </div>
      ))}

      <ImportDataActionBar />
    </div>
  )
}
