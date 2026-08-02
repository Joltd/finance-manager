'use client'

import * as React from 'react'

import { ReferenceInput, ReferenceInputSingleProps } from '@/components/common/input/reference-input'
import { PricingItemReference } from '@/types/pricing-item'
import { useRequest } from '@/hooks/use-request'
import { pricingItemUrls } from '@/api/pricing-item'

type OmitFetched<T> = Omit<T, 'loading' | 'data' | 'onSearch' | 'getLabel' | 'getId'>

export type PricingItemInputProps = OmitFetched<ReferenceInputSingleProps<PricingItemReference>>

export function PricingItemInput(props: PricingItemInputProps) {
  const listReq = useRequest<PricingItemReference[], unknown, { mask?: string }>(
    pricingItemUrls.reference,
    { method: 'GET' },
  )

  const handleSearch = (val: string) => {
    void listReq.submit({ queryParams: { mask: val || undefined } })
  }

  return (
    <ReferenceInput<PricingItemReference>
      loading={listReq.loading}
      data={listReq.data}
      onSearch={handleSearch}
      getLabel={(item) => item.name}
      getId={(item) => item.id}
      {...props}
    />
  )
}
