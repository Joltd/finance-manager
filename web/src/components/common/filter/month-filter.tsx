'use client'

import { MonthInput } from '@/components/common/input/month-input'
import { FilterItem, useFilterContext } from './filter'

interface MonthFilterProps {
  id: string
  label: string
  placeholder?: string
}

export function MonthFilter({ id, label, placeholder }: MonthFilterProps) {
  const { getValue, handleChange } = useFilterContext()

  return (
    <FilterItem id={id} label={label}>
      <MonthInput
        value={getValue(id) as Date | undefined}
        onChange={(v) => handleChange(id, v)}
        placeholder={placeholder}
      />
    </FilterItem>
  )
}
