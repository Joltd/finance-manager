'use client'

import { CurrencyInput } from '@/components/common/input/currency-input'
import { FilterItem, useFilterContext } from './filter'

interface CurrencyFilterProps {
  id: string
  label: string
}

export function CurrencyFilter({ id, label }: CurrencyFilterProps) {
  const { getValue, handleChange } = useFilterContext()

  return (
    <FilterItem id={id} label={label}>
      <CurrencyInput
        value={getValue(id) as string | undefined}
        onChange={(v) => handleChange(id, v)}
      />
    </FilterItem>
  )
}