'use client'
import { useImportDataEntryListStore, useImportDataStore } from '@/store/import-data'
import { useParams } from 'next/navigation'
import { importDataEvents } from '@/api/import-data'
import { ImportDataFilter } from '@/components/import-data/import-data-filter'
import { ImportDataTotals } from '@/components/import-data/import-data-totals'
import { AlertCircleIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { ImportDataEntryBrowser } from '@/components/import-data/import-data-entry-browser'
import { subscribeSse } from '@/lib/notification'
import { ImportDataActionBar } from '@/components/import-data/import-data-action-bar'
import { ImportDataOperationSheet } from '@/components/import-data/import-data-operation-sheet'
import { ValidityIcon } from '@/components/common/validity-icon'
import { TextLabel } from '@/components/common/text-label'

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
  const importDataEntryList = useImportDataEntryListStore(
    'queryParams',
    'updatePathParams',
    'fetch',
  )

  useEffect(() => {
    if (!id) {
      return
    }

    importData.updatePathParams({ id })
    importData.fetch()
    importDataEntryList.updatePathParams({ id })

    const clearImportDataSubscription = subscribeSse(
      importDataEvents.id,
      { id },
      importData.applyPatch,
    )
    const clearImportDataEntryListSubscription = subscribeSse<string[]>(
      importDataEvents.entry,
      { id },
      (dates) => {
        // check dates
        importDataEntryList.fetch()
      },
    )

    return () => {
      clearImportDataSubscription()
      clearImportDataEntryListSubscription()
    }
  }, [])

  const importValid =
    !!importData.data?.totals?.length &&
    importData.data.totals.filter(
      (it) => !!it.operation && !!it.parsed && it.operation.value === it.parsed.value,
    ).length === importData.data.totals.length

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
              <ImportDataTotals
                importDataId={importData.data.id}
                account={importData.data.account}
                totals={importData.data.totals}
              />
              <div className="flex-grow" />
              <TextLabel variant="title">
                {importData.data.account.name}
                {importData.data.progress ? (
                  <Spinner />
                ) : (
                  <ValidityIcon valid={importValid} collapseIfEmpty />
                )}
              </TextLabel>
            </div>
            <ImportDataFilter />
          </div>
          <ImportDataEntryBrowser />
          <ImportDataOperationSheet
            importDataId={importData.data.id}
            relatedAccount={importData.data.account}
          />
        </>
      ) : null}
    </>
  )
}
