'use client'

import { AccountInput } from '@/components/common/input/account-input'
import { AccountReference, AccountType } from '@/types/account'
import { accountUrls } from '@/api/account'
import { useReferenceCache } from '@/hooks/use-reference-cache'
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
  const rawValue = getValue(id)
  const ids =
    mode === 'multi'
      ? ((rawValue as string[] | undefined) ?? [])
      : rawValue
        ? [rawValue as string]
        : []

  const { resolved, cache } = useReferenceCache<AccountReference>(accountUrls.reference, ids)

  if (mode === 'multi') {
    const value = ids.map((accountId) => resolved[accountId]).filter((v): v is AccountReference => !!v)
    return (
      <FilterItem id={id} label={label} required={required}>
        <AccountInput
          mode="multi"
          value={value}
          onChange={(items) => {
            items.forEach(cache)
            handleChange(
              id,
              items.map((item) => item.id),
            )
          }}
          type={type}
          className="min-w-48"
        />
      </FilterItem>
    )
  }

  const value = ids[0] ? resolved[ids[0]] : undefined

  return (
    <FilterItem id={id} label={label} required={required}>
      <AccountInput
        value={value}
        onChange={(item) => {
          cache(item)
          handleChange(id, item.id)
        }}
        type={type}
        className="min-w-48"
      />
    </FilterItem>
  )
}
