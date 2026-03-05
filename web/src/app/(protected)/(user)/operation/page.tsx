'use client'
import { Stack } from '@/components/common/layout/stack'
import { Filter } from '@/components/common/filter/filter'
import { CurrencyFilter } from '@/components/common/filter/currency-filter'
import { useState } from 'react'

export default function OperationPage() {
  const [filter, setFilter] = useState<{}>()

  return (
    <Stack>
      <Filter value={filter} onChange={setFilter}>
        <CurrencyFilter id="currency" label="Currency" />
      </Filter>
    </Stack>
  )
}
