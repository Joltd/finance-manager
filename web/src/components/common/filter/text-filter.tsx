'use client'

import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { FilterItem, useFilterContext } from './filter'

interface TextFilterProps {
  id: string
  label: string
  placeholder?: string
  required?: boolean
}

export function TextFilter({ id, label, placeholder, required }: TextFilterProps) {
  const { getValue, handleChange } = useFilterContext()
  const [display, setDisplay] = useState((getValue(id) as string | undefined) ?? '')
  const debouncedChange = useDebounce((val: string) => handleChange(id, val || undefined), 300)

  return (
    <FilterItem id={id} label={label} required={required}>
      <Input
        value={display}
        onChange={(e) => {
          setDisplay(e.target.value)
          debouncedChange(e.target.value)
        }}
        placeholder={placeholder}
        className="min-w-48"
      />
    </FilterItem>
  )
}
