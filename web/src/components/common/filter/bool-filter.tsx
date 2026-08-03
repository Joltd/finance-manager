'use client'

import { useEffect } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { FilterItem, useFilterContext } from './filter'

interface BoolFilterProps {
  id: string
  label: string
  required?: boolean
}

export function BoolFilter({ id, label, required }: BoolFilterProps) {
  const { getValue, handleChange, isActive } = useFilterContext()
  const active = isActive(id)
  const value = Boolean(getValue(id))

  // Adding the filter (via the "+" menu) should immediately switch it on —
  // there is no meaningful "added but unchecked" state for a boolean filter.
  useEffect(() => {
    if (active && getValue(id) === undefined) handleChange(id, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return (
    <FilterItem id={id} label={label} required={required}>
      <div className="flex h-full items-center px-2.5">
        <Checkbox
          checked={value}
          onCheckedChange={(checked) => handleChange(id, checked === true)}
        />
      </div>
    </FilterItem>
  )
}
