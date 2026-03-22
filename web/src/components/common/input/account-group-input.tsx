'use client'

import * as React from 'react'

import { ReferenceInput, ReferenceInputProps } from '@/components/common/input/reference-input'
import { Reference } from '@/types/common/reference'
import { useAccountGroupReferenceStore } from '@/store/account'

export interface AccountGroupInputProps extends Omit<
  ReferenceInputProps<Reference>,
  'loading' | 'data' | 'onSearch' | 'getLabel' | 'getId'
> {}

export function AccountGroupInput(props: AccountGroupInputProps) {
  const store = useAccountGroupReferenceStore()

  const handleSearch = (val: string) => {
    store.setQueryParams({ mask: val || undefined })
    void store.fetch()
  }

  return (
    <ReferenceInput
      loading={store.loading}
      data={store.data}
      onSearch={handleSearch}
      getLabel={(g) => g.name}
      getId={(g) => g.id}
      {...props}
    />
  )
}
