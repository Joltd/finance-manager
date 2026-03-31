'use client'

import { CurrencyInput } from '@/components/common/input/currency-input'
import { FilterItem, useFilterContext } from './filter'

interface CurrencyFilterProps {
  id: string
  label: string
  required?: boolean
}

export function CurrencyFilter({ id, label, required }: CurrencyFilterProps) {
  const { getValue, handleChange } = useFilterContext()

  return (
    <FilterItem id={id} label={label} required={required}>
      <CurrencyInput
        value={getValue(id) as string | undefined}
        onChange={(v) => handleChange(id, v)}
      />
    </FilterItem>
  )
}