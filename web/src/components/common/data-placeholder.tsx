import React from 'react'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircleIcon } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { EmptyState } from '@/components/common/empty-state'

export interface DataPlaceholderProps<T> {
  loading?: boolean
  dataFetched?: boolean
  error?: string
  data?: T
  children: React.ReactNode
}

export function DataPlaceholder<T>({
  loading = false,
  dataFetched = false,
  error,
  data,
  children,
}: DataPlaceholderProps<T>) {
  return loading && !dataFetched ? (
    <Spinner />
  ) : error ? (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{error}</AlertTitle>
    </Alert>
  ) : !data || (Array.isArray(data) && !data.length) ? (
    <EmptyState className="grow" />
  ) : (
    children
  )
}
