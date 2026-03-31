'use client'

import { MonthInput, MonthRange } from '@/components/common/input/month-input'
import { FilterItem, useFilterContext } from './filter'

interface MonthFilterProps {
  id: string
  label: string
  mode?: 'single' | 'range'
  placeholder?: string
  required?: boolean
}

export function MonthFilter({ id, label, mode = 'single', placeholder, required }: MonthFilterProps) {
  const { getValue, handleChange } = useFilterContext()

  if (mode === 'range') {
    return (
      <FilterItem id={id} label={label} required={required}>
        <MonthInput
          mode="range"
          value={getValue(id) as MonthRange | undefined}
          onChange={(v) => handleChange(id, v)}
          placeholder={placeholder}
        />
      </FilterItem>
    )
  }

  return (
    <FilterItem id={id} label={label} required={required}>
      <MonthInput
        value={getValue(id) as Date | undefined}
        onChange={(v) => handleChange(id, v)}
        placeholder={placeholder}
      />
    </FilterItem>
  )
}
