'use client'

import React from 'react'
import { SelectInput } from '@/components/common/input/select-input'
import { FilterItem, useFilterContext } from './filter'

interface SelectFilterProps<T> {
  id: string
  label: string
  placeholder?: string
  children: React.ReactNode
}

export function SelectFilter<T>({ id, label, placeholder, children }: SelectFilterProps<T>) {
  const { getValue, handleChange } = useFilterContext()

  return (
    <FilterItem id={id} label={label}>
      <SelectInput<T>
        value={getValue(id) as T | undefined}
        onChange={(v) => handleChange(id, v)}
        placeholder={placeholder}
      >
        {children}
      </SelectInput>
    </FilterItem>
  )
}