'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

import { ReferenceInput, ReferenceInputProps } from '@/components/common/input/reference-input'
import { accountUrls } from '@/api/account'
import { createFetchStoreInstance } from '@/store/common/fetch'
import { AccountReference, AccountType } from '@/types/account'
import { useStore } from 'zustand'

export interface AccountInputProps extends Omit<
  ReferenceInputProps<AccountReference>,
  'store' | 'getLabel' | 'getId'
> {
  type?: AccountType
}

export function AccountInput({ type, ...props }: AccountInputProps) {
  const [storeApi] = useState(() =>
    createFetchStoreInstance<AccountReference[], unknown, { mask?: string; type?: AccountType }>(
      accountUrls.reference,
    ),
  )
  const store = useStore(storeApi)

  useEffect(() => {
    store.setQueryParams({ type })
  }, [type]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ReferenceInput
      store={store}
      getLabel={(item) => item.name}
      getId={(item) => item.id}
      {...props}
    />
  )
}
