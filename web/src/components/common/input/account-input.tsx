'use client'

import * as React from 'react'

import {
  ReferenceInput,
  ReferenceInputMultiProps,
  ReferenceInputSingleProps,
} from '@/components/common/input/reference-input'
import { AccountReference, AccountType } from '@/types/account'
import { useRequest } from '@/hooks/use-request'
import { accountUrls } from '@/api/account'

type OmitFetched<T> = Omit<T, 'loading' | 'data' | 'onSearch' | 'getLabel' | 'getId'>

export type AccountInputProps =
  | (OmitFetched<ReferenceInputSingleProps<AccountReference>> & { type?: AccountType })
  | (OmitFetched<ReferenceInputMultiProps<AccountReference>> & { type?: AccountType })

export function AccountInput({ type, ...props }: AccountInputProps) {
  const listReq = useRequest<AccountReference[], unknown, { type?: AccountType; mask?: string }>(
    accountUrls.reference,
    { method: 'GET' },
  )

  const handleSearch = (val: string) => {
    void listReq.submit({ queryParams: { type, mask: val || undefined } })
  }

  const common = {
    loading: listReq.loading,
    data: listReq.data,
    onSearch: handleSearch,
    getLabel: (item: AccountReference) => item.name,
    getId: (item: AccountReference) => item.id,
  }

  return <ReferenceInput<AccountReference> {...common} {...props} />
}
