'use client'

import * as React from 'react'

import {
  ReferenceInput,
  ReferenceInputMultiProps,
  ReferenceInputSingleProps,
} from '@/components/common/input/reference-input'
import { Tag } from '@/types/tag'
import { tagUrls } from '@/api/tag'
import { useRequest } from '@/hooks/use-request'

type OmitFetched<T> = Omit<
  T,
  'loading' | 'data' | 'onSearch' | 'getLabel' | 'getId' | 'onNew' | 'newLabel'
>

type TagInputOwnProps = { allowCreate?: boolean }

export type TagInputProps =
  | (OmitFetched<ReferenceInputSingleProps<Tag>> & TagInputOwnProps)
  | (OmitFetched<ReferenceInputMultiProps<Tag>> & TagInputOwnProps)

export function TagInput({ allowCreate, ...props }: TagInputProps) {
  const listReq = useRequest<Tag[], unknown, { mask?: string }>(tagUrls.root, { method: 'GET' })
  const createReq = useRequest<Tag, Tag>(tagUrls.root, { method: 'POST' })

  const handleSearch = (val: string) => {
    void listReq.submit({ queryParams: { mask: val || undefined } })
  }

  const handleNew = (name: string): Promise<Tag> => {
    return createReq.submit({ body: { name, deleted: false } })
  }

  return (
    <ReferenceInput<Tag>
      loading={listReq.loading}
      data={listReq.data}
      onSearch={handleSearch}
      getLabel={(item) => item.name}
      getId={(item) => item.id!}
      onNew={allowCreate ? handleNew : undefined}
      newLabel="New tag"
      {...props}
    />
  )
}
