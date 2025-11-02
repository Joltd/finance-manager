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
import { ImportDataOperationSheet } from '@/components/import-data/import-data-operation-sheet'
import { DataPlaceholder } from '@/components/common/data-placeholder'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { ImportDataHeader } from '@/components/import-data/import-data-header'
import { ImportDataFilter } from '@/components/import-data/import-data-filter'
import { Sse } from '@/components/sse'
import { useIsMobile } from '@/hooks/use-mobile'
import { useHome } from '@/hooks/use-home'

export default function Page() {
  const { id } = useParams()
  const isMobile = useIsMobile()
  const { redirect } = useHome()

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
    if (isMobile) {
      redirect()
      return
    }

    if (!id) {
      return
    }

    importData.updatePathParams({ id })
    importData.fetch()
    importDataEntryList.updatePathParams({ id })
  }, [])

  useEffect(() => {
    if (!importDataList.data) {
      return
    }

    const importDataExists = importDataList.data?.find((it) => it.id === id)
    if (!importDataExists) {
      redirect()
    }
  }, [importDataList.data])

  return (
    <Layout>
      {id && (
        <Sse eventName={importDataEvents.id} params={{ id }} listener={importData.applyPatch} />
      )}
      {/*todo check dates*/}
      {id && (
        <Sse
          eventName={importDataEvents.entry}
          params={{ id }}
          listener={importDataEntryList.fetch}
        />
      )}
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
