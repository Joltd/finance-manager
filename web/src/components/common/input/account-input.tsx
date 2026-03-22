'use client'

import * as React from 'react'
import { useEffect } from 'react'

import { ReferenceInput, ReferenceInputProps } from '@/components/common/input/reference-input'
import { AccountReference, AccountType } from '@/types/account'
import { useAccountReferenceStore } from '@/store/account'

export interface AccountInputProps extends Omit<
  ReferenceInputProps<AccountReference>,
  'loading' | 'data' | 'onSearch' | 'getLabel' | 'getId'
> {
  type?: AccountType
}

export function AccountInput({ type, ...props }: AccountInputProps) {
  const store = useAccountReferenceStore()

  useEffect(() => {
    store.setQueryParams({ type })
  }, [type]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (val: string) => {
    store.setQueryParams({ type, mask: val || undefined })
    void store.fetch()
  }

  return (
    <ReferenceInput
      loading={store.loading}
      data={store.data}
      onSearch={handleSearch}
      getLabel={(item) => item.name}
      getId={(item) => item.id}
      {...props}
    />
  )
}
