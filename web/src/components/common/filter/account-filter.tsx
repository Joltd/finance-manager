'use client'

import { AccountInput } from '@/components/common/input/account-input'
import { AccountReference, AccountType } from '@/types/account'
import { FilterItem, useFilterContext } from './filter'

interface AccountFilterProps {
  id: string
  label: string
  type?: AccountType
}

export function AccountFilter({ id, label, type }: AccountFilterProps) {
  const { getValue, handleChange } = useFilterContext()

  return (
    <FilterItem id={id} label={label}>
      <AccountInput
        value={getValue(id) as AccountReference | undefined}
        onChange={(v) => handleChange(id, v)}
        type={type}
      />
    </FilterItem>
  )
}