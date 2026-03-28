'use client'

import * as React from 'react'

import {
  ReferenceInput,
  ReferenceInputMultiProps,
  ReferenceInputSingleProps,
} from '@/components/common/input/reference-input'
import { Reference } from '@/types/common/reference'
import { useRequest } from '@/hooks/use-request'
import { groupUrls } from '@/api/account'

type OmitFetched<T> = Omit<T, 'loading' | 'data' | 'onSearch' | 'getLabel' | 'getId'>

export type AccountGroupInputProps =
  | OmitFetched<ReferenceInputSingleProps<Reference>>
  | OmitFetched<ReferenceInputMultiProps<Reference>>

export function AccountGroupInput(props: AccountGroupInputProps) {
  const listReq = useRequest<Reference[], unknown, { mask?: string }>(
    groupUrls.reference,
    { method: 'GET' },
  )

  const handleSearch = (val: string) => {
    void listReq.submit({ queryParams: { mask: val || undefined } })
  }

  const common = {
    loading: listReq.loading,
    data: listReq.data,
    onSearch: handleSearch,
    getLabel: (g: Reference) => g.name,
    getId: (g: Reference) => g.id,
  }

  if (props.mode === 'multi') {
    return <ReferenceInput<Reference> mode="multi" {...common} {...props} />
  }
  return <ReferenceInput<Reference> {...common} {...props} />
}
