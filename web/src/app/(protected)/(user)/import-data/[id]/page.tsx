'use client'
import {
  useImportDataEntryListStore,
  useImportDataListStore,
  useImportDataStore,
} from '@/store/import-data'
import { useParams, useRouter } from 'next/navigation'
import { importDataEvents } from '@/api/import-data'
import { useEffect } from 'react'
import { ImportDataEntryBrowser } from '@/components/import-data/import-data-entry-browser'
import { subscribeSse } from '@/lib/notification'
import { ImportDataOperationSheet } from '@/components/import-data/import-data-operation-sheet'
import { DataPlaceholder } from '@/components/common/data-placeholder'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { ImportDataHeader } from '@/components/import-data/import-data-header'
import { ImportDataFilter } from '@/components/import-data/import-data-filter'

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
    <Layout>
      <DataPlaceholder {...importData}>
        {importData.data && (
          <Stack gap={6}>
            <ImportDataHeader />
            <ImportDataFilter />
            <ImportDataEntryBrowser />
            <ImportDataOperationSheet />
          </Stack>
        )}
      </DataPlaceholder>
    </Layout>
  )
}
