'use client'

import * as React from 'react'

import { ReferenceInput, ReferenceInputProps } from '@/components/common/input/reference-input'
import { AccountReference, AccountType } from '@/types/account'
import { useRequest } from '@/hooks/use-request'
import { accountUrls } from '@/api/account'

export interface AccountInputProps extends Omit<
  ReferenceInputProps<AccountReference>,
  'loading' | 'data' | 'onSearch' | 'getLabel' | 'getId'
> {
  type?: AccountType
}

export function AccountInput({ type, ...props }: AccountInputProps) {
  const listReq = useRequest<AccountReference[], unknown, { type?: AccountType; mask?: string }>(
    accountUrls.reference,
    { method: 'GET' },
  )

  const handleSearch = (val: string) => {
    void listReq.submit({ queryParams: { type, mask: val || undefined } })
  }

  return (
    <ReferenceInput
      loading={listReq.loading}
      data={listReq.data}
      onSearch={handleSearch}
      getLabel={(item) => item.name}
      getId={(item) => item.id}
      {...props}
    />
  )
}
