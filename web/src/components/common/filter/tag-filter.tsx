'use client'

import { TagInput } from '@/components/common/input/tag-input'
import { Tag } from '@/types/tag'
import { FilterItem, useFilterContext } from './filter'

interface TagFilterProps {
  id: string
  label: string
}

export function TagFilter({ id, label }: TagFilterProps) {
  const { getValue, handleChange } = useFilterContext()

  return (
    <FilterItem id={id} label={label}>
      <TagInput
        value={getValue(id) as Tag | undefined}
        onChange={(v) => handleChange(id, v)}
        className="min-w-48"
      />
    </FilterItem>
  )
}
