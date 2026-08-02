'use client'

import { TextSuggestInput } from '@/components/common/input/text-suggest-input'
import { FilterItem, useFilterContext } from './filter'

interface TextSuggestFilterProps {
  id: string
  label: string
  url: string
  required?: boolean
}

export function TextSuggestFilter({ id, label, url, required }: TextSuggestFilterProps) {
  const { getValue, handleChange } = useFilterContext()

  return (
    <FilterItem id={id} label={label} required={required}>
      <TextSuggestInput
        url={url}
        value={getValue(id) as string | undefined}
        onChange={(v) => handleChange(id, v)}
        className="min-w-48"
      />
    </FilterItem>
  )
}
