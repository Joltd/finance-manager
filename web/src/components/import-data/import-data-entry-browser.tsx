import { DateLabel } from '@/components/common/date-label'
import { useEffect, useRef, MouseEvent } from 'react'
import {
  ImportDataEntryBrowserOperationRow,
  ImportDataEntryBrowserRow,
} from '@/components/import-data/import-data-entry-browser-row'
import {
  useImportDataEntryListStore,
  useImportDataOperationSelectionStore,
  useImportDataEntrySelectionStore,
  useImportDataStore,
} from '@/store/import-data'
import { ImportDataActionBar } from '@/components/import-data/import-data-action-bar'
import { ValidityIcon } from '@/components/common/validity-icon'
import { TextLabel } from '@/components/common/text-label'
import { DataSection } from '@/components/common/data-section'
import { ImportDataGroupHeader } from '@/components/import-data/import-data-group'
import { subscribeGlobal } from '@/lib/global-event'

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
    return subscribeGlobal('click', (event: MouseEvent) => {
      if (!event.ctrlKey) {
        operationSelection.clear()
        entrySelection.clear()
      }
    })
  }, [])

  useEffect(() => {
    if (ref.current && !!importDataEntryList.queryParams?.length) {
      ref.current.scrollTo({ behavior: 'smooth', top: 0 })
    }
  }, [importDataEntryList.queryParams])

  return (
    <DataSection store={importDataEntryList}>
      <div ref={ref} className="flex flex-col relative overflow-y-auto m-6 mb-12 gap-12">
        {importDataEntryList.data?.map((group) => (
          <div key={group.date} className="flex flex-col gap-6">
            <TextLabel variant="title">
              <ValidityIcon valid={group.valid} message="Some totals doesn't matched" />
              <DateLabel date={group.date} />
            </TextLabel>
            <ImportDataGroupHeader group={group} />
            <div className="flex flex-col px-0.5">
              {group.entries.map((entry) =>
                entry.id ? (
                  <ImportDataEntryBrowserRow
                    key={entry.id}
                    entry={entry}
                    linked={entry.linked}
                    operation={entry.operation}
                    parsed={entry.parsed}
                    suggestions={entry.suggestions}
                    relatedAccount={importData.data!!.account}
                    visible={entry.parsedVisible}
                    selected={entrySelection.has(entry)}
                    disabled={importData.data?.progress}
                  />
                ) : entry.operation ? (
                  <ImportDataEntryBrowserOperationRow
                    key={entry.operation.id}
                    operation={entry.operation}
                    relatedAccount={importData.data!!.account}
                    visible={entry.operationVisible}
                    selected={operationSelection.has(entry.operation)}
                    disabled={importData.data?.progress}
                  />
                ) : null,
              )}
            </div>
          </div>
        ))}

        <ImportDataActionBar />
      </div>
    </DataSection>
  )
}
