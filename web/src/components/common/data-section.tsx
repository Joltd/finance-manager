import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { AlertCircleIcon } from 'lucide-react'
import { EmptyLabel } from '@/components/common/empty-label'
import React from 'react'
import { FetchStoreState } from '@/store/common/fetch'

export interface DataSection<T> {
  store: Pick<FetchStoreState<T>, 'loading' | 'dataFetched' | 'error' | 'data'>
  children: React.ReactNode
}

export function DataSection<T>({ store, children }: DataSection<T>) {
  return store.loading && !store.dataFetched ? (
    <Spinner className="m-6" />
  ) : store.error ? (
    <Alert variant="destructive" className="m-6">
      <AlertCircleIcon />
      <AlertTitle>{store.error}</AlertTitle>
    </Alert>
  ) : !store.data || (Array.isArray(store.data) && !store.data.length) ? (
    <EmptyLabel className="m-6" />
  ) : (
    children
  )
}
