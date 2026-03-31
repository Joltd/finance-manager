'use client'

import { AccountInput } from '@/components/common/input/account-input'
import { AccountReference, AccountType } from '@/types/account'
import { FilterItem, useFilterContext } from './filter'

interface AccountFilterProps {
  id: string
  label: string
  type?: AccountType
  mode?: 'single' | 'multi'
  required?: boolean
}

export function AccountFilter({ id, label, type, mode = 'single', required }: AccountFilterProps) {
  const { getValue, handleChange } = useFilterContext()

  if (mode === 'multi') {
    return (
      <FilterItem id={id} label={label} required={required}>
        <AccountInput
          mode="multi"
          value={getValue(id) as AccountReference[] | undefined}
          onChange={(v) => handleChange(id, v)}
          type={type}
          className="min-w-48"
        />
      </FilterItem>
    )
  }

  return (
    <FilterItem id={id} label={label} required={required}>
      <AccountInput
        value={getValue(id) as AccountReference | undefined}
        onChange={(v) => handleChange(id, v)}
        type={type}
        className="min-w-48"
      />
    </FilterItem>
  )
}
