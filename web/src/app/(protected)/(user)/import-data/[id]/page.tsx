'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Layout } from '@/components/common/layout/layout'
import { useImportDataStore } from '@/store/import-data'
import { useOperationPresetStore } from '@/store/operation-preset'
import { ImportDataParsingStatus } from '@/types/import-data'
import { ImportDataEntries, ImportDataStatusPlaceholder } from './import-data-entries'
import { ImportDataHeader } from './import-data-header'

import { ImportDataFooter } from '@/app/(protected)/(user)/import-data/[id]/import-data-footer'

export default function ImportDataPage() {
  const { id } = useParams<{ id: string }>()
  const { data } = useImportDataStore()
  const presetStore = useOperationPresetStore()

  useEffect(() => {
    if (!data || data.id !== id) return
    presetStore.reset()
    presetStore.setAccount(data.account)
    presetStore.setCurrency(data.currency)
    // The preset actions are stable Zustand actions; only import identity should rehydrate them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, id])

  return (
    <Layout className="min-h-0 flex-1">
      <ImportDataHeader id={id} />
      {data?.id === id && data.parsingStatus === ImportDataParsingStatus.DONE ? (
        <>
          <ImportDataEntries id={id} />
          <ImportDataFooter id={id} totals={data.totals} />
        </>
      ) : data?.id === id ? (
        <ImportDataStatusPlaceholder status={data.parsingStatus} message={data.message} />
      ) : null}
    </Layout>
  )
}
