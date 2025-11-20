import {
  FilterButton,
  FilterButtonProps,
  useFilterContext,
} from '@/components/common/filter/filter'
import {
  SelectInput,
  SelectInputOption,
  SelectInputOptionProps,
} from '@/components/common/input/select-input'
import React from 'react'

export interface SelectFilterProps extends FilterButtonProps {
  children: React.ReactNode
}

export function SelectFilter({ children, id, ...props }: SelectFilterProps) {
  const { value, updateValue } = useFilterContext()
  return (
    <FilterButton id={id} {...props}>
      <SelectInput value={value?.[id]} onChange={(value) => updateValue(id, value)}>
        {children}
      </SelectInput>
    </FilterButton>
  )
}

export const SelectFilterOption = SelectInputOption
