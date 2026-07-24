'use client'

import { TagInput } from '@/components/common/input/tag-input'
import { Tag } from '@/types/tag'
import { tagUrls } from '@/api/tag'
import { useReferenceCache } from '@/hooks/use-reference-cache'
import { FilterItem, useFilterContext } from './filter'

interface TagFilterProps {
  id: string
  label: string
  mode?: 'single' | 'multi'
  required?: boolean
}

export function TagFilter({ id, label, mode = 'single', required }: TagFilterProps) {
  const { getValue, handleChange } = useFilterContext()
  const rawValue = getValue(id)
  const ids =
    mode === 'multi'
      ? ((rawValue as string[] | undefined) ?? [])
      : rawValue
        ? [rawValue as string]
        : []

  const { resolved, cache } = useReferenceCache<Tag>(tagUrls.root, ids)

  if (mode === 'multi') {
    const value = ids.map((tagId) => resolved[tagId]).filter((v): v is Tag => !!v)
    return (
      <FilterItem id={id} label={label} required={required}>
        <TagInput
          mode="multi"
          value={value}
          onChange={(items) => {
            items.forEach(cache)
            handleChange(
              id,
              items.map((item) => item.id),
            )
          }}
          className="min-w-48"
        />
      </FilterItem>
    )
  }

  const value = ids[0] ? resolved[ids[0]] : undefined

  return (
    <FilterItem id={id} label={label} required={required}>
      <TagInput
        value={value}
        onChange={(item) => {
          cache(item)
          handleChange(id, item.id)
        }}
        className="min-w-48"
      />
    </FilterItem>
  )
}
