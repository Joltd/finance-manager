'use client'

import * as React from 'react'
import { useEffect } from 'react'
import { ReferenceInput, ReferenceInputProps } from '@/components/common/input/reference-input'
import { AccountReference, AccountType } from '@/types/account'
import { useAccountReferenceStore } from '@/store/account'

interface AccountInputProps extends Omit<ReferenceInputProps<AccountReference>, 'store' | 'getLabel' | 'getId'> {
  type?: AccountType
}

function AccountInput({ type, ...props }: AccountInputProps) {
  const store = useAccountReferenceStore()

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