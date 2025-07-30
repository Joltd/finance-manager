import { DateLabel } from '@/components/common/date-label'
import { AlertCircleIcon, CheckCheck, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AmountLabel } from '@/components/common/amount-label'
import { useEffect, useRef } from 'react'
import { ImportDataEntryBrowserRow } from '@/components/import-data/import-data-entry-browser-row'
import {
  useImportDataEntryListStore,
  useImportDataOperationSelectionStore,
  useImportDataParsedSelectionStore,
  useImportDataStore,
} from '@/store/import-data'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertTitle } from '@/components/ui/alert'

export interface ImportDataOperationBrowserProps {}

export function ImportDataEntryBrowser({}: ImportDataOperationBrowserProps) {
  const importData = useImportDataStore('data')
  const importDataEntryList = useImportDataEntryListStore('loading', 'dataFetched', 'error', 'data')
  const ref = useRef<HTMLDivElement>(null)

  const operationSelection = useImportDataOperationSelectionStore('selected', 'has', 'clear')
  const parsedSelection = useImportDataParsedSelectionStore('selected', 'has', 'clear')

  useEffect(() => {
    if (ref.current && !!importDataEntryList.data?.length) {
      ref.current.scrollTo({ behavior: 'smooth', top: 0 })
    }
  }, [importDataEntryList.data])

  const handleClickOutside = () => {
    operationSelection.clear()
    parsedSelection.clear()
  }

  return importDataEntryList.loading && !importDataEntryList.dataFetched ? (
    <Spinner className="m-6" />
  ) : importDataEntryList.error ? (
    <Alert variant="destructive" className="m-6">
      <AlertCircleIcon />
      <AlertTitle>{importDataEntryList.error}</AlertTitle>
    </Alert>
  ) : !importData.data || !importDataEntryList.data?.length ? (
    <div className="text-muted m-6">No data</div>
  ) : (
    <div ref={ref} className="flex flex-col overflow-y-auto m-6 gap-6" onClick={handleClickOutside}>
      {importDataEntryList.data?.map((group) => (
        <div key={group.date} className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-3xl">
            <CheckCheck className="shrink-0 text-green-500" />
            <DateLabel date={group.date} />
          </div>
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
                linked={entry.linked}
                operation={entry.operation}
                operationVisible={entry.operationVisible}
                parsed={entry.parsed}
                parsedVisible={entry.parsedVisible}
                suggestions={entry.suggestions}
                relatedAccount={importData.data!!.account}
                operationSelected={operationSelection.has(entry.operation)}
                parsedSelected={parsedSelection.has(entry.parsed)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
