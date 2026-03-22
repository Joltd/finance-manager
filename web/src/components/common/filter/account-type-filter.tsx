'use client'

import { AccountTypeInput } from '@/components/common/input/account-type-input'
import { AccountType } from '@/types/account'
import { FilterItem, useFilterContext } from './filter'

interface AccountTypeFilterProps {
  id: string
  label: string
}

export function AccountTypeFilter({ id, label }: AccountTypeFilterProps) {
  const { getValue, handleChange } = useFilterContext()

  return (
    <FilterItem id={id} label={label}>
      <AccountTypeInput
        value={getValue(id) as AccountType | undefined}
        onChange={(v) => handleChange(id, v)}
      />
    </FilterItem>
  )
}
