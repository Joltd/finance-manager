'use client'

import * as React from 'react'

import { ReferenceInput, ReferenceInputSingleProps } from '@/components/common/input/reference-input'
import { useRequest } from '@/hooks/use-request'

type OmitFetched<T> = Omit<T, 'loading' | 'data' | 'onSearch' | 'getLabel' | 'getId' | 'onNew' | 'newLabel'>

export type TextSuggestInputProps = OmitFetched<ReferenceInputSingleProps<string>> & {
  url: string
}

export function TextSuggestInput({ url, ...props }: TextSuggestInputProps) {
  const listReq = useRequest<string[], unknown, { mask?: string }>(url, { method: 'GET' })

  const handleSearch = (val: string) => {
    void listReq.submit({ queryParams: { mask: val || undefined } })
  }

  return (
    <ReferenceInput<string>
      loading={listReq.loading}
      data={listReq.data}
      onSearch={handleSearch}
      getLabel={(s) => s}
      getId={(s) => s}
      onNew={async (name) => name}
      newLabel="Use custom value"
      {...props}
    />
  )
}
