'use client'
import {
  useImportDataEntryListStore,
  useImportDataListStore,
  useImportDataStore,
} from '@/store/import-data'
import { useParams, useRouter } from 'next/navigation'
import { importDataEvents } from '@/api/import-data'
import { ImportDataFilter } from '@/components/import-data/import-data-filter'
import { ImportDataTotals } from '@/components/import-data/import-data-totals'
import { useEffect } from 'react'
import { ImportDataEntryBrowser } from '@/components/import-data/import-data-entry-browser'
import { subscribeSse } from '@/lib/notification'
import { ImportDataOperationSheet } from '@/components/import-data/import-data-operation-sheet'
import { DataSection } from '@/components/common/data-section'
import { ImportDataInfo } from '@/components/import-data/import-data-info'

export default function Page() {
  const { id } = useParams()
  const router = useRouter()

  const importDataList = useImportDataListStore('data')
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
        // todo check dates
        importDataEntryList.fetch()
      },
    )

    return () => {
      clearImportDataSubscription()
      clearImportDataEntryListSubscription()
    }
  }, [])

  useEffect(() => {
    if (!importDataList.data) {
      return
    }

    const importDataExists = importDataList.data?.find((it) => it.id === id)
    if (!importDataExists) {
      router.push('/')
    }
  }, [importDataList.data])

  return (
    <DataSection store={importData}>
      {importData.data && (
        <>
          <div className="flex flex-col gap-4 px-6 mt-6">
            <div className="flex">
              <ImportDataTotals
                importDataId={importData.data.id}
                account={importData.data.account}
                totals={importData.data.totals}
              />
              <div className="flex-grow" />
              <ImportDataInfo />
            </div>
            <ImportDataFilter />
          </div>
          <ImportDataEntryBrowser />
          <ImportDataOperationSheet
            importDataId={importData.data.id}
            relatedAccount={importData.data.account}
            disabled={importData.data.progress}
          />
        </>
      )}
    </DataSection>
  )
}
