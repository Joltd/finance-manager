'use client'

import { Layout } from '@/components/common/layout/layout'
import { ImportDataHeader } from './import-data-header'
import { ImportDataEntries } from './import-data-entries'
import { useParams } from 'next/navigation'
import { useImportDataStore } from '@/store/import-data'
import { ImportDataParsingStatus } from '@/types/import-data'

export default function ImportDataPage() {
  const { id } = useParams<{ id: string }>()
  const { data } = useImportDataStore()

  return (
    <Layout>
      <ImportDataHeader id={id} />
      {data?.parsingStatus === ImportDataParsingStatus.DONE && <ImportDataEntries id={id} />}
    </Layout>
  )
}
