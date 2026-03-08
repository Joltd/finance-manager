'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import { createStore, useStore } from 'zustand'

import { accountUrls } from '@/api/account'
import { ReferenceInput, ReferenceInputProps } from '@/components/common/input/reference-input'
import { createFetchSlice, FetchSlice } from '@/store/common/fetch'
import { AccountReference, AccountType } from '@/types/account'

type AccountStore = FetchSlice<AccountReference[], unknown, { mask?: string; type?: AccountType }>

interface AccountInputProps
  extends Omit<ReferenceInputProps<AccountReference>, 'store' | 'getLabel' | 'getId'> {
  type?: AccountType
}

function AccountInput({ type, ...props }: AccountInputProps) {
  const storeRef = useRef<ReturnType<typeof createStore<AccountStore>> | null>(null)
  if (!storeRef.current) {
    storeRef.current = createStore<AccountStore>(createFetchSlice(accountUrls.reference))
  }
  const store = useStore(storeRef.current)

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

export { AccountInput }
export type { AccountInputProps }
