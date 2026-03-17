'use client'

import { Layout } from '@/components/common/layout/layout'
import { ImportDataHeader } from './import-data-header'
import { ImportDataEntries } from './import-data-entries'
import { ImportDataEntrySheet } from './import-data-entry-sheet'
import { useParams } from 'next/navigation'

export default function ImportDataPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <Layout>
      <ImportDataEntrySheet />
      <ImportDataHeader id={id} />
      <ImportDataEntries id={id} />
    </Layout>
  )
}
