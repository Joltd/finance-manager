'use client'

import { OperationTypeInput } from '@/components/common/input/operation-type-input'
import { OperationType } from '@/types/operation'
import { FilterItem, useFilterContext } from './filter'

interface OperationTypeFilterProps {
  id: string
  label: string
}

export function OperationTypeFilter({ id, label }: OperationTypeFilterProps) {
  const { getValue, handleChange } = useFilterContext()

  return (
    <FilterItem id={id} label={label}>
      <OperationTypeInput
        value={getValue(id) as OperationType | undefined}
        onChange={(v) => handleChange(id, v)}
      />
    </FilterItem>
  )
}
