'use client'

import { PricingItemInput } from '@/components/common/input/pricing-item-input'
import { PricingItemReference } from '@/types/pricing-item'
import { pricingItemUrls } from '@/api/pricing-item'
import { useReferenceCache } from '@/hooks/use-reference-cache'
import { FilterItem, useFilterContext } from './filter'

interface PricingItemFilterProps {
  id: string
  label: string
  required?: boolean
}

export function PricingItemFilter({ id, label, required }: PricingItemFilterProps) {
  const { getValue, handleChange } = useFilterContext()
  const rawValue = getValue(id) as string | undefined
  const ids = rawValue ? [rawValue] : []

  const { resolved, cache } = useReferenceCache<PricingItemReference>(pricingItemUrls.reference, ids)
  const value = ids[0] ? resolved[ids[0]] : undefined

  return (
    <FilterItem id={id} label={label} required={required}>
      <PricingItemInput
        value={value}
        onChange={(item) => {
          cache(item)
          handleChange(id, item.id)
        }}
        className="min-w-48"
      />
    </FilterItem>
  )
}
