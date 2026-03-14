'use client'

import { Layout } from '@/components/common/layout/layout'
import { ImportDataHeader } from './import-data-header'
import { ImportDataEntries } from './import-data-entries'
import { useParams } from 'next/navigation'

export default function ImportDataPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <Layout>
      <ImportDataHeader id={id} />
      <ImportDataEntries id={id} />
    </Layout>
  )
}
