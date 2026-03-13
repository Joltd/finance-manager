'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Layout } from '@/components/common/layout/layout'
import { useImportDataStore } from '@/store/import-data'
import { ImportDataHeader } from './import-data-header'
import { ImportDataEntries } from './import-data-entries'

export default function ImportDataPage() {
  const { id } = useParams<{ id: string }>()
  const { data, loading, fetch, setPathParams } = useImportDataStore()

  useEffect(() => {
    setPathParams({ id })
    void fetch()
  }, [id, setPathParams, fetch])

  return (
    <Layout>
      <ImportDataHeader data={data} loading={loading} />
      <ImportDataEntries id={id} />
    </Layout>
  )
}