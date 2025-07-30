'use client'
import { useImportDataEntryListStore, useImportDataStore } from '@/store/import-data'
import { useParams } from 'next/navigation'
import { importDataEvents } from '@/api/import-data'
import { ImportDataFilter } from '@/components/import-data/import-data-filter'
import { ImportDataTotals } from '@/components/import-data/import-data-totals'
import { AlertCircleIcon } from 'lucide-react'
import { ImportDataHeader } from '@/components/import-data/import-data-header'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { ImportDataEntryBrowser } from '@/components/import-data/import-data-entry-browser'
import { subscribeSse } from '@/lib/notification'

export default function Page() {
  const { id } = useParams()

  const importData = useImportDataStore(
    'loading',
    'dataFetched',
    'error',
    'data',
    'updatePathParams',
    'fetch',
    'applyPatch',
  )
  const importDataEntryList = useImportDataEntryListStore('updatePathParams')

  useEffect(() => {
    if (!id) {
      return
    }

    importData.updatePathParams({ id })
    importData.fetch()
    importDataEntryList.updatePathParams({ id })

    return subscribeSse(importDataEvents.id, { id }, importData.applyPatch)
  }, [])

  return (
    <>
      {importData.loading && !importData.dataFetched ? (
        <Spinner className="m-6" />
      ) : importData.error ? (
        <Alert variant="destructive" className="m-6">
          <AlertCircleIcon />
          <AlertTitle>{importData.error}</AlertTitle>
        </Alert>
      ) : importData.data ? (
        <>
          <div className="flex flex-col gap-4 px-6 mt-6">
            <div className="flex">
              <ImportDataTotals importDataId={importData.data.id} totals={importData.data.totals} />
              <div className="flex-grow" />
              <ImportDataHeader
                account={importData.data.account}
                progress={importData.data.progress}
              />
            </div>
            <ImportDataFilter />
          </div>
          <ImportDataEntryBrowser />
          {/*<ImportDataOperationSheet relatedAccount={cashAccount} />*/}
        </>
      ) : null}
    </>
  )
}
