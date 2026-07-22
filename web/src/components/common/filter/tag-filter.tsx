'use client'

import { TagInput } from '@/components/common/input/tag-input'
import { Tag } from '@/types/tag'
import { FilterItem, useFilterContext } from './filter'

interface TagFilterProps {
  id: string
  label: string
  mode?: 'single' | 'multi'
  required?: boolean
}

export function TagFilter({ id, label, mode = 'single', required }: TagFilterProps) {
  const { getValue, handleChange } = useFilterContext()

  if (mode === 'multi') {
    return (
      <FilterItem id={id} label={label} required={required}>
        <TagInput
          mode="multi"
          value={getValue(id) as Tag[] | undefined}
          onChange={(v) => handleChange(id, v)}
          className="min-w-48"
        />
      </FilterItem>
    )
  }

  return (
    <FilterItem id={id} label={label} required={required}>
      <TagInput
        value={getValue(id) as Tag | undefined}
        onChange={(v) => handleChange(id, v)}
        className="min-w-48"
      />
    </FilterItem>
  )
}
