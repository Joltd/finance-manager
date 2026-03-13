'use client'

import React from 'react'
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FilterItem, useFilterContext } from './filter'

interface SelectFilterProps {
  id: string
  label: string
  placeholder?: string
  children: React.ReactNode
}

export function SelectFilter({ id, label, placeholder, children }: SelectFilterProps) {
  const { getValue, handleChange } = useFilterContext()

  return (
    <FilterItem id={id} label={label}>
      <Select
        value={(getValue(id) as string | undefined) ?? ''}
        onValueChange={(v) => handleChange(id, v)}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper">{children}</SelectContent>
      </Select>
    </FilterItem>
  )
}
