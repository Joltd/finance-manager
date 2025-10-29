'use client'
import React, { useEffect, useState } from 'react'
import { useTopFlowStore } from '@/store/report'
import { asDateRangeValue, currentAndPreviousMonths } from '@/lib/date'
import { AccountType } from '@/types/account'

export default function Page() {
  const store = useTopFlowStore(
    'loading',
    'dataFetched',
    'error',
    'data',
    'setQueryParams',
    'fetch',
  )
  const [value, setValue] = useState<Record<string, any>>({
    date: asDateRangeValue(currentAndPreviousMonths(1)),
    type: AccountType.EXPENSE,
  })

  useEffect(() => {
    store.setQueryParams(value)
    store.fetch()
  }, [value])

  return <></>
}
