'use client'

import * as React from 'react'

import { ReferenceInput, ReferenceInputProps } from '@/components/common/input/reference-input'
import { Reference } from '@/types/common/reference'
import { useRequest } from '@/hooks/use-request'
import { groupUrls } from '@/api/account'

export interface AccountGroupInputProps extends Omit<
  ReferenceInputProps<Reference>,
  'loading' | 'data' | 'onSearch' | 'getLabel' | 'getId'
> {}

export function AccountGroupInput(props: AccountGroupInputProps) {
  const listReq = useRequest<Reference[], unknown, { mask?: string }>(
    groupUrls.reference,
    { method: 'GET' },
  )

  const handleSearch = (val: string) => {
    void listReq.submit({ queryParams: { mask: val || undefined } })
  }

  return (
    <ReferenceInput
      loading={listReq.loading}
      data={listReq.data}
      onSearch={handleSearch}
      getLabel={(g) => g.name}
      getId={(g) => g.id}
      {...props}
    />
  )
}
