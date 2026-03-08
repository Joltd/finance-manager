'use client'

import { DateInput } from '@/components/common/input/date-input'
import { FilterItem, useFilterContext } from './filter'

interface DateFilterProps {
  id: string
  label: string
  placeholder?: string
}

export function DateFilter({ id, label, placeholder }: DateFilterProps) {
  const { getValue, handleChange } = useFilterContext()

  return (
    <FilterItem id={id} label={label}>
      <DateInput
        value={getValue(id) as Date | undefined}
        onChange={(v) => handleChange(id, v)}
        placeholder={placeholder}
      />
    </FilterItem>
  )
}
